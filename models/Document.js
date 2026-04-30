const mongoose = require("mongoose");

const { Schema } = mongoose;

const documentStatusEnum = [
  "Pending",
  "Under Review",
  "Approved",
  "Rejected",
];

const documentSchema = new Schema(
  {
    merchant: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Merchant reference is required."],
      index: true,
    },
    application: {
      type: Schema.Types.ObjectId,
      ref: "MerchantApplication",
      required: [true, "Merchant application reference is required."],
      index: true,
    },
    documentType: {
      type: String,
      required: [true, "Document type is required."],
      trim: true,
      maxlength: [80, "Document type cannot exceed 80 characters."],
    },
    fileName: {
      type: String,
      required: [true, "File name is required."],
      trim: true,
      maxlength: [255, "File name cannot exceed 255 characters."],
    },
    originalName: {
      type: String,
      required: [true, "Original file name is required."],
      trim: true,
      maxlength: [255, "Original file name cannot exceed 255 characters."],
    },
    mimeType: {
      type: String,
      required: [true, "MIME type is required."],
      trim: true,
      maxlength: [100, "MIME type cannot exceed 100 characters."],
    },
    fileSize: {
      type: Number,
      required: [true, "File size is required."],
      min: [1, "File size must be greater than 0 bytes."],
    },
    fileUrl: {
      type: String,
      required: [true, "File URL is required."],
      trim: true,
      maxlength: [500, "File URL cannot exceed 500 characters."],
    },
    status: {
      type: String,
      enum: documentStatusEnum,
      default: "Pending",
      index: true,
    },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: [500, "Rejection reason cannot exceed 500 characters."],
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: "AdminUser",
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Document", documentSchema);
