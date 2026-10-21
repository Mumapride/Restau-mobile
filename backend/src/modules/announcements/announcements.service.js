const prisma = require('../../config/db');

// Students see only published announcements
const getPublishedAnnouncements = async (limit = 10) => {
  return await prisma.announcement.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
};

// Admin sees all announcements including drafts
const getAllAnnouncements = async () => {
  return await prisma.announcement.findMany({
    orderBy: { createdAt: 'desc' },
  });
};

const createAnnouncement = async ({ title, body, isPublished = false }) => {
  return await prisma.announcement.create({
    data: { title, body, isPublished },
  });
};

const updateAnnouncement = async (id, { title, body }) => {
  return await prisma.announcement.update({
    where: { id: Number(id) },
    data: { title, body },
  });
};

const setPublishStatus = async (id, isPublished) => {
  return await prisma.announcement.update({
    where: { id: Number(id) },
    data: { isPublished },
  });
};

module.exports = {
  getPublishedAnnouncements,
  getAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  setPublishStatus,
};