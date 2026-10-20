const express = require("express");

const {
  getAdminAnnouncements,
  getStudentAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  setPublishStatus,
} = require("./announcements.controller");

const {
  protect,
  requireRole,
} = require("../../middleware/auth.middleware");

const router = express.Router();

// STUDENT: published announcements, newest first (?limit= for dashboard previews)
router.get("/", protect, requireRole("STUDENT"), getStudentAnnouncements);

// ADMIN: all announcements, including unpublished
router.get("/admin", protect, requireRole("ADMIN"), getAdminAnnouncements);

// ADMIN: create an announcement
router.post("/", protect, requireRole("ADMIN"), createAnnouncement);

// ADMIN: update an announcement's content
router.put("/:id", protect, requireRole("ADMIN"), updateAnnouncement);

// ADMIN: publish or unpublish an announcement
router.put("/:id/publish", protect, requireRole("ADMIN"), setPublishStatus);

module.exports = router;
