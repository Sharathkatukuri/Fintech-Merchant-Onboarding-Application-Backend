const jwt = require("jsonwebtoken");

const generateToken = (payload) => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined in the environment variables.");
  }

  const token = jwt.sign(payload, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

  console.log("[JWT] Token generated", {
    id: payload.id,
    role: payload.role,
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    token,
  });

  return token;
};

module.exports = generateToken;
