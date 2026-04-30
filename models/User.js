const mongoose = require("mongoose");

const { Schema } = mongoose;

const merchantStatusEnum = [
  "Pending",
  "Under Review",
  "Approved",
  "Rejected",
];

const userSchema = new Schema(
  {
    businessName: {
      type: String,
      required: [true, "Business name is required."],
      trim: true,
      minlength: [2, "Business name must be at least 2 characters long."],
      maxlength: [120, "Business name cannot exceed 120 characters."],
    },
    ownerName: {
      type: String,
      required: [true, "Owner name is required."],
      trim: true,
      minlength: [2, "Owner name must be at least 2 characters long."],
      maxlength: [80, "Owner name cannot exceed 80 characters."],
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address."],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required."],
      trim: true,
      match: [/^[0-9]{10,15}$/, "Phone number must contain 10 to 15 digits."],
    },
    password: {
      type: String,
      required: [true, "Password is required."],
      minlength: [8, "Password must be at least 8 characters long."],
      select: false,
    },
    businessType: {
      type: String,
      required: [true, "Business type is required."],
      trim: true,
      maxlength: [60, "Business type cannot exceed 60 characters."],
    },
    addressLine1: {
      type: String,
      required: [true, "Address line 1 is required."],
      trim: true,
      maxlength: [150, "Address line 1 cannot exceed 150 characters."],
    },
    addressLine2: {
      type: String,
      trim: true,
      maxlength: [150, "Address line 2 cannot exceed 150 characters."],
    },
    city: {
      type: String,
      required: [true, "City is required."],
      trim: true,
      maxlength: [60, "City cannot exceed 60 characters."],
    },
    state: {
      type: String,
      required: [true, "State is required."],
      trim: true,
      maxlength: [60, "State cannot exceed 60 characters."],
    },
    postalCode: {
      type: String,
      required: [true, "Postal code is required."],
      trim: true,
      match: [/^[A-Za-z0-9 -]{4,12}$/, "Please provide a valid postal code."],
    },
    country: {
      type: String,
      required: [true, "Country is required."],
      trim: true,
      maxlength: [60, "Country cannot exceed 60 characters."],
    },
    applicationStatus: {
      type: String,
      enum: merchantStatusEnum,
      default: "Pending",
    },
    merchantApplication: {
      type: Schema.Types.ObjectId,
      ref: "MerchantApplication",
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
