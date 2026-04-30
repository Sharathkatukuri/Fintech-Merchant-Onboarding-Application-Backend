const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const AdminUser = require("./models/AdminUser");

dotenv.config();

const DEFAULT_ADMIN = {
  fullName: process.env.ADMIN_FULL_NAME,
  email: process.env.ADMIN_EMAIL,
  password: process.env.ADMIN_PASSWORD,
  role: process.env.ADMIN_ROLE || "Super Admin",
};

const connectToDatabase = async () => {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error(
      "MONGO_URI is not defined in the environment variables."
    );
  }

  await mongoose.connect(mongoUri);
  console.log("MongoDB connected for admin seeding.");
};

const validateAdminConfig = () => {
  if (
    !DEFAULT_ADMIN.fullName ||
    !DEFAULT_ADMIN.email ||
    !DEFAULT_ADMIN.password ||
    !DEFAULT_ADMIN.role
  ) {
    throw new Error(
      "ADMIN_FULL_NAME, ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_ROLE must be defined in the environment variables."
    );
  }
};

const seedAdmin = async () => {
  try {
    validateAdminConfig();
    await connectToDatabase();

    const existingAdmin = await AdminUser.findOne({
      email: DEFAULT_ADMIN.email.toLowerCase(),
    });

    if (existingAdmin) {
      console.log("Admin already exists. No changes made.");
      return;
    }

    const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN.password, 10);

    await AdminUser.create({
      fullName: DEFAULT_ADMIN.fullName,
      email: DEFAULT_ADMIN.email,
      password: hashedPassword,
      role: DEFAULT_ADMIN.role,
    });

    console.log("Default admin created successfully.");
  } catch (error) {
    console.error("Failed to seed admin:", error.message);
    process.exitCode = 1;
  } finally {
    try {
      await mongoose.connection.close();
      console.log("MongoDB connection closed.");
    } catch (closeError) {
      console.error("Failed to close MongoDB connection:", closeError.message);
      process.exitCode = 1;
    }
  }
};

seedAdmin();
