const bcrypt = require("bcryptjs");

const User = require("../models/User");
const AdminUser = require("../models/AdminUser");
const generateToken = require("../utils/generateToken");

const registerMerchant = async (req, res) => {
  const {
    businessName,
    ownerName,
    email,
    phone,
    password,
    businessType,
    addressLine1,
    addressLine2,
    city,
    state,
    postalCode,
    country,
  } = req.body;

  if (
    !businessName ||
    !ownerName ||
    !email ||
    !phone ||
    !password ||
    !businessType ||
    !addressLine1 ||
    !city ||
    !state ||
    !postalCode ||
    !country
  ) {
    const error = new Error("Please provide all required merchant details.");
    error.statusCode = 400;
    throw error;
  }

  const existingMerchant = await User.findOne({ email: email.toLowerCase() });

  if (existingMerchant) {
    const error = new Error("A merchant with this email already exists.");
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const merchant = await User.create({
    businessName,
    ownerName,
    email,
    phone,
    password: hashedPassword,
    businessType,
    addressLine1,
    addressLine2,
    city,
    state,
    postalCode,
    country,
  });

  const token = generateToken({
    id: merchant._id,
    role: "merchant",
  });

  console.log("[AUTH] Merchant registered", {
    id: merchant._id.toString(),
    email: merchant.email,
    businessName: merchant.businessName,
  });

  res.status(201).json({
    success: true,
    message: "Merchant registered successfully.",
    token,
    data: {
      user: {
        id: merchant._id,
        businessName: merchant.businessName,
        ownerName: merchant.ownerName,
        email: merchant.email,
        phone: merchant.phone,
        applicationStatus: merchant.applicationStatus,
        role: "merchant",
      },
    },
  });
};

const loginMerchant = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    const error = new Error("Email and password are required.");
    error.statusCode = 400;
    throw error;
  }

  const merchant = await User.findOne({ email: email.toLowerCase() }).select(
    "+password"
  );

  if (!merchant) {
    const error = new Error("Invalid merchant credentials.");
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, merchant.password);

  if (!isPasswordValid) {
    const error = new Error("Invalid merchant credentials.");
    error.statusCode = 401;
    throw error;
  }

  merchant.lastLoginAt = new Date();
  await merchant.save();

  const token = generateToken({
    id: merchant._id,
    role: "merchant",
  });

  console.log("[AUTH] Merchant logged in", {
    id: merchant._id.toString(),
    email: merchant.email,
    businessName: merchant.businessName,
  });

  res.status(200).json({
    success: true,
    message: "Merchant login successful.",
    token,
    data: {
      user: {
        id: merchant._id,
        businessName: merchant.businessName,
        ownerName: merchant.ownerName,
        email: merchant.email,
        phone: merchant.phone,
        applicationStatus: merchant.applicationStatus,
        role: "merchant",
      },
    },
  });
};

const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    const error = new Error("Email and password are required.");
    error.statusCode = 400;
    throw error;
  }

  const admin = await AdminUser.findOne({ email: email.toLowerCase() }).select(
    "+password"
  );

  if (!admin) {
    const error = new Error("Invalid admin credentials.");
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, admin.password);

  if (!isPasswordValid) {
    const error = new Error("Invalid admin credentials.");
    error.statusCode = 401;
    throw error;
  }

  admin.lastLoginAt = new Date();
  await admin.save();

  const token = generateToken({
    id: admin._id,
    role: "admin",
  });

  console.log("[AUTH] Admin logged in", {
    id: admin._id.toString(),
    email: admin.email,
    role: admin.role,
  });

  res.status(200).json({
    success: true,
    message: "Admin login successful.",
    token,
    data: {
      user: {
        id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role,
        accountType: "admin",
      },
    },
  });
};

module.exports = {
  registerMerchant,
  loginMerchant,
  loginAdmin,
};
