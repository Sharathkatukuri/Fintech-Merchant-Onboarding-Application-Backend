const MerchantApplication = require("../models/MerchantApplication");
const User = require("../models/User");
const ActivityLog = require("../models/ActivityLog");
const Document = require("../models/Document");
const logActivity = require("../utils/activityLogger");
const { sendApplicationStatusEmail } = require("../utils/emailService");
const { buildApplicationsCsv } = require("../utils/csvExporter");

const allowedStatuses = [
  "Pending",
  "Under Review",
  "Approved",
  "Rejected",
];

const applyApplicationFilters = async ({ status, email, businessName }) => {
  const query = {};

  if (status) {
    if (!allowedStatuses.includes(status)) {
      const error = new Error(
        "Invalid status filter. Allowed values are Pending, Under Review, Approved, Rejected."
      );
      error.statusCode = 400;
      throw error;
    }

    query.status = status;
  }

  if (businessName) {
    query.businessName = {
      $regex: businessName.trim(),
      $options: "i",
    };
  }

  if (email) {
    const merchantEmailRegex = new RegExp(email.trim(), "i");
    const matchingMerchants = await User.find(
      {
        email: { $regex: merchantEmailRegex },
      },
      "_id"
    );

    query.merchant = {
      $in: matchingMerchants.map((merchant) => merchant._id),
    };
  }

  return query;
};

const buildApplicationResponse = (application) => ({
  id: application._id,
  merchant: application.merchant,
  businessName: application.businessName,
  registrationNumber: application.registrationNumber,
  taxId: application.taxId,
  category: application.category,
  website: application.website,
  status: application.status,
  reviewNotes: application.reviewNotes,
  documents: application.documents,
  submittedAt: application.submittedAt,
  reviewedBy: application.reviewedBy,
  reviewedAt: application.reviewedAt,
  createdAt: application.createdAt,
  updatedAt: application.updatedAt,
});

const submitApplication = async (req, res) => {
  const { businessName, registrationNumber, taxId, category, website } =
    req.body;

  if (!businessName || !registrationNumber || !category) {
    const error = new Error(
      "Business name, registration number, and category are required."
    );
    error.statusCode = 400;
    throw error;
  }

  const merchantId = req.user._id;

  const existingApplication = await MerchantApplication.findOne({
    merchant: merchantId,
  });

  if (existingApplication) {
    const error = new Error("Merchant application has already been submitted.");
    error.statusCode = 409;
    throw error;
  }

  const application = await MerchantApplication.create({
    merchant: merchantId,
    businessName,
    registrationNumber,
    taxId,
    category,
    website,
  });

  await User.findByIdAndUpdate(merchantId, {
    merchantApplication: application._id,
    applicationStatus: application.status,
    businessName,
  });

  const populatedApplication = await MerchantApplication.findById(
    application._id
  )
    .populate("merchant", "businessName ownerName email phone")
    .populate("reviewedBy", "fullName email role");

  await logActivity({
    actorType: "merchant",
    actorId: req.user._id,
    actorModel: "User",
    action: "APPLICATION_SUBMITTED",
    targetApplication: application._id,
    message: `${businessName} application submitted by merchant.`,
    metadata: {
      status: application.status,
      registrationNumber,
    },
  });

  res.status(201).json({
    success: true,
    message: "Merchant application submitted successfully.",
    data: {
      application: buildApplicationResponse(populatedApplication),
    },
  });
};

const getApplicationStatus = async (req, res) => {
  const application = await MerchantApplication.findOne({
    merchant: req.user._id,
  })
    .populate("merchant", "businessName ownerName email phone applicationStatus")
    .populate("reviewedBy", "fullName email role");

  if (!application) {
    const error = new Error("Merchant application not found.");
    error.statusCode = 404;
    throw error;
  }

  res.status(200).json({
    success: true,
    data: {
      application: buildApplicationResponse(application),
    },
  });
};

const getAllApplications = async (req, res) => {
  const { status, email, businessName } = req.query;
  const query = await applyApplicationFilters({ status, email, businessName });

  const applications = await MerchantApplication.find(query)
    .populate("merchant", "businessName ownerName email phone applicationStatus")
    .populate("reviewedBy", "fullName email role")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: applications.length,
    data: {
      applications: applications.map(buildApplicationResponse),
    },
  });
};

const getSingleApplication = async (req, res) => {
  const application = await MerchantApplication.findById(req.params.id)
    .populate("merchant", "businessName ownerName email phone applicationStatus")
    .populate("reviewedBy", "fullName email role")
    .populate("documents");

  if (!application) {
    const error = new Error("Merchant application not found.");
    error.statusCode = 404;
    throw error;
  }

  res.status(200).json({
    success: true,
    data: {
      application: buildApplicationResponse(application),
    },
  });
};

const updateApplicationStatus = async (req, res) => {
  const { status } = req.body;

  if (!status) {
    const error = new Error("Application status is required.");
    error.statusCode = 400;
    throw error;
  }

  if (!allowedStatuses.includes(status)) {
    const error = new Error(
      "Invalid status. Allowed values are Pending, Under Review, Approved, Rejected."
    );
    error.statusCode = 400;
    throw error;
  }

  const application = await MerchantApplication.findById(req.params.id).populate(
    "merchant",
    "businessName ownerName email phone applicationStatus"
  );

  if (!application) {
    const error = new Error("Merchant application not found.");
    error.statusCode = 404;
    throw error;
  }

  application.status = status;
  application.reviewedBy = req.user._id;
  application.reviewedAt = new Date();

  await application.save();

  await User.findByIdAndUpdate(application.merchant, {
    applicationStatus: status,
    merchantApplication: application._id,
  });

  const populatedApplication = await MerchantApplication.findById(application._id)
    .populate("merchant", "businessName ownerName email phone applicationStatus")
    .populate("reviewedBy", "fullName email role");

  await logActivity({
    actorType: "admin",
    actorId: req.user._id,
    actorModel: "AdminUser",
    action: "APPLICATION_STATUS_UPDATED",
    targetApplication: application._id,
    message: `Application ${application._id} marked as ${status}.`,
    metadata: {
      status,
    },
  });

  if (status === "Approved" || status === "Rejected") {
    try {
      await sendApplicationStatusEmail({
        to: application.merchant.email,
        ownerName: application.merchant.ownerName,
        businessName: application.businessName,
        status,
        reviewNotes: application.reviewNotes,
      });
    } catch (emailError) {
      console.error(
        "Failed to send application status email:",
        emailError.message
      );
    }
  }

  res.status(200).json({
    success: true,
    message: "Application status updated successfully.",
    data: {
      application: buildApplicationResponse(populatedApplication),
    },
  });
};

const addApplicationRemarks = async (req, res) => {
  const { reviewNotes } = req.body;

  if (!reviewNotes || !reviewNotes.trim()) {
    const error = new Error("Review notes are required.");
    error.statusCode = 400;
    throw error;
  }

  const application = await MerchantApplication.findById(req.params.id);

  if (!application) {
    const error = new Error("Merchant application not found.");
    error.statusCode = 404;
    throw error;
  }

  application.reviewNotes = reviewNotes.trim();
  application.reviewedBy = req.user._id;
  application.reviewedAt = new Date();

  await application.save();

  const populatedApplication = await MerchantApplication.findById(application._id)
    .populate("merchant", "businessName ownerName email phone applicationStatus")
    .populate("reviewedBy", "fullName email role");

  await logActivity({
    actorType: "admin",
    actorId: req.user._id,
    actorModel: "AdminUser",
    action: "APPLICATION_REMARKS_ADDED",
    targetApplication: application._id,
    message: `Remarks added to application ${application._id}.`,
    metadata: {
      reviewNotes: application.reviewNotes,
    },
  });

  res.status(200).json({
    success: true,
    message: "Application remarks added successfully.",
    data: {
      application: buildApplicationResponse(populatedApplication),
    },
  });
};

const getAdminDashboardStats = async (req, res) => {
  const [
    totalApplications,
    totalMerchants,
    totalDocuments,
    pendingCount,
    underReviewCount,
    approvedCount,
    rejectedCount,
  ] =
    await Promise.all([
      MerchantApplication.countDocuments(),
      User.countDocuments(),
      Document.countDocuments(),
      MerchantApplication.countDocuments({ status: "Pending" }),
      MerchantApplication.countDocuments({ status: "Under Review" }),
      MerchantApplication.countDocuments({ status: "Approved" }),
      MerchantApplication.countDocuments({ status: "Rejected" }),
    ]);

  res.status(200).json({
    success: true,
    data: {
      stats: {
        totalApplications,
        totalMerchants,
        totalDocuments,
        pendingCount,
        underReviewCount,
        approvedCount,
        rejectedCount,
      },
    },
  });
};

const exportApplicationsCsv = async (req, res) => {
  const { status, email, businessName } = req.query;
  const query = await applyApplicationFilters({ status, email, businessName });

  const applications = await MerchantApplication.find(query)
    .populate("merchant", "ownerName email phone")
    .sort({ createdAt: -1 });

  const csv = buildApplicationsCsv(applications);

  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="applications-${Date.now()}.csv"`
  );

  return res.status(200).send(csv);
};

const getActivityLogs = async (req, res) => {
  const logs = await ActivityLog.find()
    .populate("actor", "fullName ownerName email")
    .populate("targetApplication", "businessName status")
    .sort({ createdAt: -1 })
    .limit(100);

  res.status(200).json({
    success: true,
    count: logs.length,
    data: {
      logs,
    },
  });
};

module.exports = {
  submitApplication,
  getApplicationStatus,
  getAllApplications,
  getSingleApplication,
  updateApplicationStatus,
  addApplicationRemarks,
  getAdminDashboardStats,
  exportApplicationsCsv,
  getActivityLogs,
};
