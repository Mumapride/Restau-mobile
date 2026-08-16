const prisma = require('../../config/db');

const DAY_ORDER = ['TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

/**
 * Returns this week's menu (Tuesday - Friday) for the currently active semester.
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
      day: s.dayOfWeek,
      mealName: s.mealName,
      description: s.description,
    }));
};

module.exports = { getWeeklyMenu };