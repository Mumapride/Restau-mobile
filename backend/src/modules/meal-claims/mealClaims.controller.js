const mealClaimsService = require("./mealClaims.service");
const { processScan, getStudentClaims } = require("./mealClaims.service");
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
const scanQR = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }
    const result = await processScan(token);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getMyClaims = async (req, res) => {
  try {
    const result = await getStudentClaims(req.user.studentId);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getMealClaims,
  getTodaysMealClaims,
  getMealClaimsByStudent,
  scanQR,
  getMyClaims,
};
