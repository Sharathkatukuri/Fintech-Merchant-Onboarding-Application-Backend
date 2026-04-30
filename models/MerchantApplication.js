const mongoose = require("mongoose");

const { Schema } = mongoose;

const applicationStatusEnum = [
  "Pending",
  "Under Review",
  "Approved",
  "Rejected",
];

const merchantApplicationSchema = new Schema(
  {
    merchant: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Merchant reference is required."],
      index: true,
    },
    businessName: {
      type: String,
      required: [true, "Business name is required."],
      trim: true,
      minlength: [2, "Business name must be at least 2 characters long."],
      maxlength: [120, "Business name cannot exceed 120 characters."],
    },
    registrationNumber: {
      type: String,
      required: [true, "Registration number is required."],
      trim: true,
      uppercase: true,
      maxlength: [50, "Registration number cannot exceed 50 characters."],
    },
    taxId: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: [50, "Tax ID cannot exceed 50 characters."],
    },
    category: {
      type: String,
      required: [true, "Business category is required."],
      trim: true,
      maxlength: [80, "Business category cannot exceed 80 characters."],
    },
    website: {
      type: String,
      trim: true,
      match: [/^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/.*)?$/, "Please provide a valid website URL."],
    },
    status: {
      type: String,
      enum: applicationStatusEnum,
      default: "Pending",
      index: true,
    },
    reviewNotes: {
      type: String,
      trim: true,
      maxlength: [1000, "Review notes cannot exceed 1000 characters."],
    },
    documents: [
      {
        type: Schema.Types.ObjectId,
        ref: "Document",
      },
    ],
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "AdminUser",
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

merchantApplicationSchema.index(
  { merchant: 1, registrationNumber: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "MerchantApplication",
  merchantApplicationSchema
);
