const mealPlansService = require("./mealPlans.service");

// Get all active meal plans
const getMealPlans = async (req, res) => {
  try {
    const mealPlans = await mealPlansService.getMealPlans();

    res.json(mealPlans);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Create meal plan
const createMealPlan = async (req, res) => {
  try {
    const mealPlan = await mealPlansService.createMealPlan(req.body);

    res.status(201).json({
      message: "Meal plan created successfully",
      mealPlan,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

// Update meal plan
const updateMealPlan = async (req, res) => {
  try {
    const mealPlan = await mealPlansService.updateMealPlan(
      req.params.id,
      req.body
    );

    res.json({
      message: "Meal plan updated successfully",
      mealPlan,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

// Deactivate meal plan
const deactivateMealPlan = async (req, res) => {
  try {
    const mealPlan = await mealPlansService.deactivateMealPlan(
      req.params.id
    );

    res.json({
      message: "Meal plan deactivated successfully",
      mealPlan,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

module.exports = {
  getMealPlans,
  createMealPlan,
  updateMealPlan,
  deactivateMealPlan,
};