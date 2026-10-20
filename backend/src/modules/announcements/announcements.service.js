const prisma = require("../../config/db");

// Creator details are attached for admin views only — student responses
// never include admin identity fields.
const includeCreator = {
  admin: { select: { id: true, email: true } },
};

const MAX_TITLE_LENGTH = 191; // matches VARCHAR(191) column size
const MAX_BODY_LENGTH = 10000; // fits comfortably inside TEXT column
const MAX_LIMIT = 100;

// Parse and validate the announcement id from the route params
const parseAnnouncementId = (id) => {
  const announcementId = Number(id);
  if (!Number.isInteger(announcementId) || announcementId <= 0) {
    throw new Error("Invalid announcement id");
  }
  return announcementId;
};

// Trim and validate text content; returns only the fields that are present
const buildContentUpdate = (input) => {
  const { title, body } = input || {};
  const data = {};

  if (title !== undefined) {
    const cleanTitle = typeof title === "string" ? title.trim() : "";
    if (!cleanTitle) {
      throw new Error("Title cannot be empty");
    }
    if (cleanTitle.length > MAX_TITLE_LENGTH) {
      throw new Error(`Title must be ${MAX_TITLE_LENGTH} characters or fewer`);
    }
    data.title = cleanTitle;
  }

  if (body !== undefined) {
    const cleanBody = typeof body === "string" ? body.trim() : "";
    if (!cleanBody) {
      throw new Error("Body cannot be empty");
    }
    if (cleanBody.length > MAX_BODY_LENGTH) {
      throw new Error(`Body must be ${MAX_BODY_LENGTH} characters or fewer`);
    }
    data.body = cleanBody;
  }

  return data;
};

// ADMIN: list every announcement, including unpublished ones
const getAllAnnouncements = () =>
  prisma.announcement.findMany({
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    include: includeCreator,
  });

// STUDENT: list only published announcements, newest first.
// `limit` is the raw query value (string or undefined); no limit returns
// the full list for the dedicated announcements screen.
const getPublishedAnnouncements = (limit) => {
  const query = {
    where: { isPublished: true },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  };

  if (limit !== undefined) {
    const parsedLimit = Number(limit);
    if (
      !Number.isInteger(parsedLimit) ||
      parsedLimit <= 0 ||
      parsedLimit > MAX_LIMIT
    ) {
      throw new Error(
        `limit must be a whole number between 1 and ${MAX_LIMIT}`
      );
    }
    query.take = parsedLimit;
  }

  return prisma.announcement.findMany(query);
};

// ADMIN: create an announcement as a draft (or published when explicitly asked).
// `adminId` always comes from the verified JWT — never from the request body.
const createAnnouncement = async (input, adminId) => {
  const { title, body, isPublished } = input || {};

  if (!adminId) {
    throw new Error("Authenticated admin identity not found");
  }

  const data = buildContentUpdate({ title, body });
  if (data.title === undefined || data.body === undefined) {
    throw new Error("Title and body are required");
  }
  if (isPublished !== undefined && typeof isPublished !== "boolean") {
    throw new Error("isPublished must be true or false");
  }

  return prisma.announcement.create({
    data: {
      ...data,
      isPublished: isPublished === true,
      adminId,
    },
    include: includeCreator,
  });
};

// ADMIN: update the content of an existing announcement
const updateAnnouncement = async (id, body) => {
  const announcementId = parseAnnouncementId(id);

  const data = buildContentUpdate(body);
  if (Object.keys(data).length === 0) {
    throw new Error("Provide a title or body to update");
  }

  const existing = await prisma.announcement.findUnique({
    where: { id: announcementId },
  });
  if (!existing) {
    throw new Error("Announcement not found");
  }

  return prisma.announcement.update({
    where: { id: announcementId },
    data,
    include: includeCreator,
  });
};

// ADMIN: publish or unpublish an announcement
const setAnnouncementPublishStatus = async (id, isPublished) => {
  const announcementId = parseAnnouncementId(id);

  if (typeof isPublished !== "boolean") {
    throw new Error("isPublished must be true or false");
  }

  const existing = await prisma.announcement.findUnique({
    where: { id: announcementId },
  });
  if (!existing) {
    throw new Error("Announcement not found");
  }

  return prisma.announcement.update({
    where: { id: announcementId },
    data: { isPublished },
    include: includeCreator,
  });
};

module.exports = {
  getAllAnnouncements,
  getPublishedAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  setAnnouncementPublishStatus,
};
