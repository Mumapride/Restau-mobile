const { getWeeklyMenu } = require('./menuSchedule.service');

const getMenu = async (req, res) => {
  try {
    const menu = await getWeeklyMenu();
    res.status(200).json(menu);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getMenu };