const prisma = require('../../config/db');

const getStudentProfile = async (studentId) => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      user: true,
      subscriptions: {
        include: {
          mealPlan: true,
          semester: true,
        }
      },
      mealClaims: true,
      qrToken: true
    }
  });

  if (!student) {
    throw new Error('Student not found');
  }

  // Get the most recent subscription
  const activeSubscription = student.subscriptions[student.subscriptions.length - 1];
  let credits = 0;
  let mealPlan = null;
  let semesterEndDate = null;

  if (activeSubscription) {
    const claimsCount = student.mealClaims.length;
    credits = activeSubscription.credits - claimsCount;
    mealPlan = activeSubscription.mealPlan;
    semesterEndDate = activeSubscription.semester.endDate;
  }

  return {
    id: student.id,
    firstName: student.user.firstName,
    lastName: student.user.lastName,
    matricule: student.matricule,
    credits,
    mealPlan,
    semesterEndDate,
    hasQRCode: !!student.qrToken
  };
};

module.exports = { getStudentProfile };