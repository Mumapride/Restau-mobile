const mealClaimsService = require("./mealClaims.service");

// Get all meal claims
const getMealClaims = async (req, res) => {
  try {
    const mealClaims = await mealClaimsService.getMealClaims();

    res.json(mealClaims);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get today's meal claims
const getTodaysMealClaims = async (req, res) => {
  try {
    const mealClaims = await mealClaimsService.getTodaysMealClaims();

    res.json(mealClaims);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get meal claims by student
const getMealClaimsByStudent = async (req, res) => {
  try {
    const mealClaims =
      await mealClaimsService.getMealClaimsByStudent(
        req.params.id
      );

    res.json(mealClaims);
  } catch (error) {
    res.status(404).json({
      message: error.message,
    });
  }
};

module.exports = {
  getMealClaims,
  getTodaysMealClaims,
  getMealClaimsByStudent,
};