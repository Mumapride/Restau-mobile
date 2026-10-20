const announcementsService = require("./announcements.service");

// ADMIN: list all announcements, including unpublished ones
const getAdminAnnouncements = async (req, res) => {
  try {
    const announcements = await announcementsService.getAllAnnouncements();

    res.json(announcements);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// STUDENT: published announcements only, newest first (optional ?limit=)
const getStudentAnnouncements = async (req, res) => {
  try {
    const announcements = await announcementsService.getPublishedAnnouncements(
      req.query.limit
    );

    res.json(announcements);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

// ADMIN: create an announcement (creator comes from the verified JWT)
const createAnnouncement = async (req, res) => {
  if (!req.user.adminId) {
    return res.status(403).json({
      message: "Admin identity not found in token",
    });
  }

  try {
    const announcement = await announcementsService.createAnnouncement(
      req.body,
      req.user.adminId
    );

    res.status(201).json({
      message: "Announcement created successfully",
      announcement,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

// ADMIN: update an announcement's title and/or body
const updateAnnouncement = async (req, res) => {
  try {
    const announcement = await announcementsService.updateAnnouncement(
      req.params.id,
      req.body
    );

    res.json({
      message: "Announcement updated successfully",
      announcement,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

// ADMIN: publish or unpublish an announcement
const setPublishStatus = async (req, res) => {
  try {
    const announcement = await announcementsService.setAnnouncementPublishStatus(
      req.params.id,
      (req.body || {}).isPublished
    );

    res.json({
      message: announcement.isPublished
        ? "Announcement published successfully"
        : "Announcement unpublished successfully",
      announcement,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

module.exports = {
  getAdminAnnouncements,
  getStudentAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  setPublishStatus,
};
