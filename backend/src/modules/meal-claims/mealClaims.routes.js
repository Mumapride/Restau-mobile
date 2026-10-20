const express = require("express");

const {
  getMealClaims,
  getTodaysMealClaims,
  getMealClaimsByStudent,
  scanQR,
  getMyClaims,
} = require("./mealClaims.controller");

const {
  protect,
  requireRole,
} = require("../../middleware/auth.middleware");


const router = express.Router();

router.post('/scan', protect, requireRole('SCANNER'), scanQR);
router.get('/my-claims', protect, requireRole('STUDENT'), getMyClaims);

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