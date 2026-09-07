const semesterService = require("./semester.service");

// Create semester
const createSemester = async (req, res) => {
  try {
    const semester = await semesterService.createSemester(req.body);

    res.status(201).json({
      message: "Semester created successfully",
      semester,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

// Get active semester
const getActiveSemester = async (req, res) => {
  try {
    const semester = await semesterService.getActiveSemester();

    if (!semester) {
      return res.status(404).json({
        message: "No active semester found",
      });
    }

    res.json(semester);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Update semester
const updateSemester = async (req, res) => {
  try {
    const semester = await semesterService.updateSemester(
      req.params.id,
      req.body
    );

    res.json({
      message: "Semester updated successfully",
      semester,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

// Close semester
const closeSemester = async (req, res) => {
  try {
    const semester = await semesterService.closeSemester(
      req.params.id
    );

    res.json({
      message: "Semester closed successfully",
      semester,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

module.exports = {
  createSemester,
  getActiveSemester,
  updateSemester,
  closeSemester,
};