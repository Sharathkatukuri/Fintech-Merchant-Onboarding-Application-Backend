const express = require("express");

const {
  registerMerchant,
  loginMerchant,
  loginAdmin,
} = require("../controllers/authController");
const asyncHandler = require("../middleware/asyncHandler");

const router = express.Router();

router.post("/merchant/register", asyncHandler(registerMerchant));
router.post("/merchant/login", asyncHandler(loginMerchant));
router.post("/admin/login", asyncHandler(loginAdmin));

module.exports = router;
