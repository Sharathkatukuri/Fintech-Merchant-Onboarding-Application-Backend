const Document = require("../models/Document");
const MerchantApplication = require("../models/MerchantApplication");
const logActivity = require("../utils/activityLogger");

const allowedDocumentTypes = [
  "PAN",
  "GST Certificate",
  "Bank Statement",
  "Registration Certificate",
];

const documentTypeMap = {
  pan: "PAN",
  gstCertificate: "GST Certificate",
  bankStatement: "Bank Statement",
  registrationCertificate: "Registration Certificate",
};

const normalizeDocumentType = (documentTypeParam) =>
  documentTypeMap[documentTypeParam];

const buildDocumentResponse = (document) => ({
  id: document._id,
  merchant: document.merchant,
  application: document.application,
  documentType: document.documentType,
  fileName: document.fileName,
  originalName: document.originalName,
  mimeType: document.mimeType,
  fileSize: document.fileSize,
  fileUrl: document.fileUrl,
  status: document.status,
  createdAt: document.createdAt,
  updatedAt: document.updatedAt,
});

const uploadDocument = async (req, res) => {
  const { applicationId, documentType } = req.params;

  const normalizedDocumentType = normalizeDocumentType(documentType);

  if (!normalizedDocumentType || !allowedDocumentTypes.includes(normalizedDocumentType)) {
    const error = new Error(
      "Invalid document type. Allowed values are PAN, GST Certificate, Bank Statement, Registration Certificate."
    );
    error.statusCode = 400;
    throw error;
  }

  if (!req.file) {
    const error = new Error("Document file is required.");
    error.statusCode = 400;
    throw error;
  }

  const application = await MerchantApplication.findById(applicationId);

  if (!application) {
    const error = new Error("Merchant application not found.");
    error.statusCode = 404;
    throw error;
  }

  if (application.merchant.toString() !== req.user._id.toString()) {
    const error = new Error(
      "You are not authorized to upload documents for this application."
    );
    error.statusCode = 403;
    throw error;
  }

  const existingDocument = await Document.findOne({
    application: applicationId,
    merchant: req.user._id,
    documentType: normalizedDocumentType,
  });

  if (existingDocument) {
    const error = new Error(
      `${normalizedDocumentType} has already been uploaded for this application.`
    );
    error.statusCode = 409;
    throw error;
  }

  const document = await Document.create({
    merchant: req.user._id,
    application: applicationId,
    documentType: normalizedDocumentType,
    fileName: req.file.filename,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    fileSize: req.file.size,
    fileUrl: `/uploads/${req.file.filename}`,
  });

  application.documents.push(document._id);
  await application.save();

  console.log("[UPLOAD] Document stored", {
    documentId: document._id.toString(),
    applicationId,
    merchantId: req.user._id.toString(),
    documentType: normalizedDocumentType,
    savedFileName: document.fileName,
    originalFileName: document.originalName,
    mimeType: document.mimeType,
    fileSize: document.fileSize,
    fileUrl: document.fileUrl,
  });

  await logActivity({
    actorType: "merchant",
    actorId: req.user._id,
    actorModel: "User",
    action: "DOCUMENT_UPLOADED",
    targetApplication: application._id,
    message: `${normalizedDocumentType} uploaded for application ${application._id}.`,
    metadata: {
      documentType: normalizedDocumentType,
      documentId: document._id,
    },
  });

  res.status(201).json({
    success: true,
    message: `${normalizedDocumentType} uploaded successfully.`,
    data: {
      document: buildDocumentResponse(document),
    },
  });
};

module.exports = {
  uploadDocument,
};
