const prisma = require("../../config/db");

// Create semester
const createSemester = async ({ name, startDate, endDate }) => {
  if (!name || !startDate || !endDate) {
    throw new Error("Name, start date and end date are required");
  }

  const semester = await prisma.semester.create({
    data: {
      name,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isActive: true,
    },
  });

  return semester;
};

// Get the currently active semester
const getActiveSemester = async () => {
  const semester = await prisma.semester.findFirst({
    where: {
      isActive: true,
    },
  });

  return semester;
};

// Update a semester
const updateSemester = async (id, { name, startDate, endDate }) => {
  const existingSemester = await prisma.semester.findUnique({
    where: {
      id: Number(id),
    },
  });

  if (!existingSemester) {
    throw new Error("Semester not found");
  }

  const updatedSemester = await prisma.semester.update({
    where: {
      id: Number(id),
    },
    data: {
      name,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    },
  });

  return updatedSemester;
};
// Close a semester
const closeSemester = async (id) => {
  const semester = await prisma.semester.findUnique({
    where: {
      id: Number(id),
    },
  });

  if (!semester) {
    throw new Error("Semester not found");
  }

  const closedSemester = await prisma.semester.update({
    where: {
      id: Number(id),
    },
    data: {
      isActive: false,
    },
  });

  return closedSemester;
};

module.exports = {
  createSemester,
  getActiveSemester,
  updateSemester,
  closeSemester,
};