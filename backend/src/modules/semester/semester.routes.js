const express = require("express");

const {
  createSemester,
  getActiveSemester,
  updateSemester,
  closeSemester,
} = require("./semester.controller");

const router = express.Router();

// Create semester
router.post("/", createSemester);

// Get active semester
router.get("/active", getActiveSemester);

// Update semester
router.put("/:id", updateSemester);

// Close semester
router.put("/:id/close", closeSemester);

module.exports = router;