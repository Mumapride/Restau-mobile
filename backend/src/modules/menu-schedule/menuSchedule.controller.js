const {
  getWeeklyMenu,
  createMenuSchedule,
  updateMenuSchedule,
  deleteMenuSchedule,
} = require('./menuSchedule.service');

const getMenu = async (req, res) => {
  try {
    const menu = await getWeeklyMenu();
    res.status(200).json(menu);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const createMenu = async (req, res) => {
  try {
    const menu = await createMenuSchedule(req.body);
    res.status(201).json({ message: 'Meal added successfully', menuSchedule: menu });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateMenu = async (req, res) => {
  try {
    const menu = await updateMenuSchedule(req.params.id, req.body);
    res.status(200).json({ message: 'Meal updated successfully', menuSchedule: menu });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteMenu = async (req, res) => {
  try {
    await deleteMenuSchedule(req.params.id);
    res.status(200).json({ message: 'Meal deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getMenu, createMenu, updateMenu, deleteMenu };