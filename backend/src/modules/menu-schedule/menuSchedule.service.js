const prisma = require('../../config/db');

const DAY_ORDER = ['TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
const DAY_INDEX_OF = { 2: 'TUESDAY', 3: 'WEDNESDAY', 4: 'THURSDAY', 5: 'FRIDAY' };

/**
 * Returns this week's menu (Tuesday - Friday) for the currently active semester.
 * Each item now includes the database `id` so the admin Weekly Menu page can
 * edit/delete records. Extra fields are additive and ignored by the existing
 * student clients.
 */
const getWeeklyMenu = async () => {
  const activeSemester = await prisma.semester.findFirst({
    where: { isActive: true },
  });

  if (!activeSemester) {
    return [];
  }

  const schedules = await prisma.menuSchedule.findMany({
    where: { semesterId: activeSemester.id, isActive: true },
  });

  return DAY_ORDER
    .map((day) => schedules.find((s) => s.dayOfWeek === day))
    .filter(Boolean)
    .map((s) => ({
      id: s.id,
      day: s.dayOfWeek,
      mealName: s.mealName,
      description: s.description,
    }));
};

const isServiceDay = (dayOfWeek) => DAY_ORDER.includes(dayOfWeek);

const getActiveSemesterOrThrow = async () => {
  const semester = await prisma.semester.findFirst({ where: { isActive: true } });
  if (!semester) {
    throw new Error('No active semester. Please create and activate a semester before scheduling meals.');
  }
  return semester;
};

const createMenuSchedule = async ({ dayOfWeek, mealName, description }) => {
  if (!dayOfWeek || !mealName) {
    throw new Error('Day of week and meal name are required.');
  }
  if (!isServiceDay(dayOfWeek)) {
    throw new Error('Meals can only be scheduled Tuesday through Friday.');
  }
  const semester = await getActiveSemesterOrThrow();

  const existing = await prisma.menuSchedule.findFirst({
    where: { semesterId: semester.id, dayOfWeek },
  });
  if (existing) {
    throw new Error(`A meal is already scheduled for ${dayOfWeek}. Use Edit to change it.`);
  }

  return prisma.menuSchedule.create({
    data: {
      semesterId: semester.id,
      dayOfWeek,
      mealName: String(mealName).trim(),
      description: description ? String(description).trim() || null : null,
    },
  });
};

const updateMenuSchedule = async (id, { dayOfWeek, mealName, description }) => {
  const menuItemId = Number(id);
  const existing = await prisma.menuSchedule.findUnique({ where: { id: menuItemId } });
  if (!existing) {
    throw new Error('Menu item not found.');
  }
  if (!dayOfWeek || !mealName) {
    throw new Error('Day of week and meal name are required.');
  }
  if (!isServiceDay(dayOfWeek)) {
    throw new Error('Meals can only be scheduled Tuesday through Friday.');
  }
  const semester = await getActiveSemesterOrThrow();

  const conflict = await prisma.menuSchedule.findFirst({
    where: { semesterId: semester.id, dayOfWeek, NOT: { id: menuItemId } },
  });
  if (conflict) {
    throw new Error(`A meal is already scheduled for ${dayOfWeek}.`);
  }

  return prisma.menuSchedule.update({
    where: { id: menuItemId },
    data: {
      dayOfWeek,
      mealName: String(mealName).trim(),
      description: description ? String(description).trim() || null : null,
    },
  });
};

const deleteMenuSchedule = async (id) => {
  const menuItemId = Number(id);
  const existing = await prisma.menuSchedule.findUnique({ where: { id: menuItemId } });
  if (!existing) {
    throw new Error('Menu item not found.');
  }
  return prisma.menuSchedule.delete({ where: { id: menuItemId } });
};

module.exports = { getWeeklyMenu, createMenuSchedule, updateMenuSchedule, deleteMenuSchedule };