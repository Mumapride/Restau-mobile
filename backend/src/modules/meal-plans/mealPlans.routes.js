const express = require("express");

const {
  getMealPlans,
  createMealPlan,
  updateMealPlan,
  deactivateMealPlan,
} = require("./mealPlans.controller");

const router = express.Router();

router.get("/", getMealPlans);

router.post("/", createMealPlan);

router.put("/:id", updateMealPlan);

router.delete("/:id", deactivateMealPlan);

module.exports = router;