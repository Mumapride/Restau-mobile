
const express = require("express");

const {
  getReportsSummary,
  getDailyReport,
} = require("./reports.controller");

const {
  protect,
  requireRole,
} = require("../../middleware/auth.middleware");

const router = express.Router();

// ADMIN: Get reports summary
router.get(
  "/summary",
  protect,
  requireRole("ADMIN"),
  getReportsSummary
);

// ADMIN: Get today's detailed report
router.get(
  "/daily",
  protect,
  requireRole("ADMIN"),
  getDailyReport
);

module.exports = router;