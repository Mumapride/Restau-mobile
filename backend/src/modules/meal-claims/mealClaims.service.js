const prisma = require('../../config/db');

/**
 * Returns the logged-in student's meal claim history, newest first.
 * Each entry includes how many credits were left immediately after that meal.
 */
const getStudentMealHistory = async (studentId) => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      subscriptions: {
        orderBy: { createdAt: 'asc' },
      },
      mealClaims: {
        orderBy: { claimDate: 'asc' },
      },
    },
  });

  if (!student) {
    throw new Error('Student not found');
  }

  // Use the most recent subscription to know the starting credit total.
  const activeSubscription = student.subscriptions[student.subscriptions.length - 1];
  const totalCredits = activeSubscription ? activeSubscription.credits : 0;

  const history = student.mealClaims.map((claim, index) => ({
    id: claim.id,
    date: claim.claimDate,
    menuItem: claim.menuItem,
    creditsRemainingAfter: Math.max(totalCredits - (index + 1), 0),
  }));

  // Newest claims first for display.
  return history.reverse();
};

module.exports = { getStudentMealHistory };