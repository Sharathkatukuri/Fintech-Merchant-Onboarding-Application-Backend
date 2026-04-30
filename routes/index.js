const express = require("express");

const { getApiStatus } = require("../controllers/baseController");
const authRoutes = require("./authRoutes");
const applicationRoutes = require("./applicationRoutes");
const uploadRoutes = require("./uploadRoutes");

const router = express.Router();

router.get("/", getApiStatus);
router.use("/auth", authRoutes);
router.use("/", applicationRoutes);
router.use("/", uploadRoutes);

module.exports = router;
