const { getStudentProfile } = require('./users.service');

const getMyProfile = async (req, res) => {
  try {
    const result = await getStudentProfile(req.user.studentId);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getMyProfile };