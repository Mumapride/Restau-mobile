const { getStudentMealHistory } = require('./mealClaims.service');

const getMyMealHistory = async (req, res) => {
  try {
    const history = await getStudentMealHistory(req.user.studentId);
    res.status(200).json(history);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getMyMealHistory };