
const prisma = require('../../config/db');

const getStudentProfile = async (studentId) => {
  const student = await prisma.student.findUnique({
    where: { id: Number(studentId) },
    include: {
      user: true,

      subscriptions: {
        include: {
          mealPlan: true,
          semester: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      },

      mealClaims: true,
      qrToken: true,
    },
  });

  if (!student) {
    throw new Error('Student not found');
  }

  // Calculate total credits from ALL subscriptions
  const totalPurchasedCredits = student.subscriptions.reduce(
    (total, subscription) => {
      return total + Number(subscription.credits || 0);
    },
    0
  );

  // Count all meals already claimed by the student
  const claimsCount = student.mealClaims.length;

  // Available credits = all purchased credits - meals already claimed
  const credits = Math.max(
    0,
    totalPurchasedCredits - claimsCount
  );

  // Get the most recent subscription for displaying
  // the student's current meal plan information.
  const activeSubscription =
    student.subscriptions.length > 0
      ? student.subscriptions[student.subscriptions.length - 1]
      : null;

  let mealPlan = null;
  let semesterEndDate = null;

  if (activeSubscription) {
    mealPlan = activeSubscription.mealPlan;
    semesterEndDate = activeSubscription.semester?.endDate || null;
  }

  return {
    id: student.id,
    firstName: student.user.firstName,
    lastName: student.user.lastName,
    matricule: student.matricule,

    // This now contains the accumulated balance
    credits,

    mealPlan,
    semesterEndDate,
    hasQRCode: !!student.qrToken,
  };
};

module.exports = {
  getStudentProfile,
};
