const jwt = require("jsonwebtoken");

const User = require("../models/User");
const AdminUser = require("../models/AdminUser");

const protect = async (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    const error = new Error("Not authorized. Token is missing.");
    error.statusCode = 401;
    return next(error);
  }

  const token = authorization.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role === "admin") {
      const admin = await AdminUser.findById(decoded.id).select("-password");

      if (!admin) {
        const error = new Error("Admin account not found.");
        error.statusCode = 401;
        return next(error);
      }

      req.user = admin;
      req.auth = { role: "admin" };
      return next();
    }

    const merchant = await User.findById(decoded.id).select("-password");

    if (!merchant) {
      const error = new Error("Merchant account not found.");
      error.statusCode = 401;
      return next(error);
    }

    req.user = merchant;
    req.auth = { role: "merchant" };
    return next();
  } catch (jwtError) {
    const error = new Error("Not authorized. Token is invalid or expired.");
    error.statusCode = 401;
    return next(error);
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!req.auth || !roles.includes(req.auth.role)) {
    const error = new Error("You do not have permission to access this resource.");
    error.statusCode = 403;
    return next(error);
  }

  return next();
};

module.exports = {
  protect,
  authorize,
};
