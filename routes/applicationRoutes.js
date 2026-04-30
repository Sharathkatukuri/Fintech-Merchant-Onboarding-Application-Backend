const express = require("express");

const {
  submitApplication,
  getApplicationStatus,
  getAllApplications,
  getSingleApplication,
  updateApplicationStatus,
  addApplicationRemarks,
  getAdminDashboardStats,
  exportApplicationsCsv,
  getActivityLogs,
} = require("../controllers/applicationController");
const asyncHandler = require("../middleware/asyncHandler");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/merchant/application",
  protect,
  authorize("merchant"),
  asyncHandler(submitApplication)
);

router.get(
  "/merchant/application/status",
  protect,
  authorize("merchant"),
  asyncHandler(getApplicationStatus)
);

router.get(
  "/admin/dashboard/stats",
  protect,
  authorize("admin"),
  asyncHandler(getAdminDashboardStats)
);

router.get(
  "/admin/applications",
  protect,
  authorize("admin"),
  asyncHandler(getAllApplications)
);

router.get(
  "/admin/applications/export/csv",
  protect,
  authorize("admin"),
  asyncHandler(exportApplicationsCsv)
);

router.get(
  "/admin/applications/:id",
  protect,
  authorize("admin"),
  asyncHandler(getSingleApplication)
);

router.patch(
  "/admin/applications/:id/status",
  protect,
  authorize("admin"),
  asyncHandler(updateApplicationStatus)
);

router.patch(
  "/admin/applications/:id/remarks",
  protect,
  authorize("admin"),
  asyncHandler(addApplicationRemarks)
);

router.get(
  "/admin/activity-logs",
  protect,
  authorize("admin"),
  asyncHandler(getActivityLogs)
);

module.exports = router;
