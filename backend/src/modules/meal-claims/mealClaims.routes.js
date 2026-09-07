const express = require("express");

const {
  getMealClaims,
  getTodaysMealClaims,
  getMealClaimsByStudent,
} = require("./mealClaims.controller");

const {
  protect,
  requireRole,
} = require("../../middleware/auth.middleware");

const router = express.Router();

router.get(
  "/",
  protect,
  requireRole("ADMIN"),
  getMealClaims
);

router.get(
  "/today",
  protect,
  requireRole("ADMIN"),
  getTodaysMealClaims
);

router.get(
  "/student/:id",
  protect,
  requireRole("ADMIN"),
  getMealClaimsByStudent
);

module.exports = router;