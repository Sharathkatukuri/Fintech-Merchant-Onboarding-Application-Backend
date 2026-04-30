const express = require("express");

const { uploadDocument } = require("../controllers/uploadController");
const upload = require("../config/multer");
const asyncHandler = require("../middleware/asyncHandler");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/merchant/applications/:applicationId/documents/:documentType",
  protect,
  authorize("merchant"),
  upload.single("file"),
  asyncHandler(uploadDocument)
);

module.exports = router;
