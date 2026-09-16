const { getMyQRToken } = require('./qrTokens.service');

const getMyQR = async (req, res) => {
  try {
    const result = await getMyQRToken(req.user.studentId);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getMyQR };