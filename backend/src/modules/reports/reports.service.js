
const prisma = require("../../config/db");

// Get reports summary
const getReportsSummary = async () => {
  const totalStudents = await prisma.student.count();
  const totalSubscriptions = await prisma.subscription.count();
  const totalMealsClaimed = await prisma.mealClaim.count();

  const subscriptions = await prisma.subscription.findMany({
    select: { credits: true },
  });

  const totalCreditsPurchased = subscriptions.reduce(
    (total, subscription) => {
      return total + Number(subscription.credits || 0);
    },
    0
  );

  const verifiedPayments = await prisma.payment.findMany({
    where: { status: "VERIFIED" },
    select: { amount: true },
  });

  const totalRevenue = verifiedPayments.reduce(
    (total, payment) => {
      return total + Number(payment.amount || 0);
    },
    0
  );

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const todaysMealClaims = await prisma.mealClaim.findMany({
    where: {
      claimDate: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    select: { studentId: true },
  });

  const todaysStudents = new Set(
    todaysMealClaims.map((claim) => claim.studentId)
  );

  return {
    totalStudents,
    totalSubscriptions,
    totalMealsClaimed,
    totalCreditsPurchased,
    totalRevenue,
    today: {
      mealsClaimed: todaysMealClaims.length,
      studentsServed: todaysStudents.size,
    },
  };
};

// Get today's detailed meal report
const getDailyReport = async () => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const claims = await prisma.mealClaim.findMany({
    where: {
      claimDate: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    include: {
      student: {
        include: {
          user: true,
        },
      },
      semester: true,
    },
    orderBy: {
      claimDate: "desc",
    },
  });

  const uniqueStudents = new Set(
    claims.map((claim) => claim.studentId)
  );

  const mealsByMenuItem = {};

  claims.forEach((claim) => {
    const menuItem = claim.menuItem || "Unknown";

    if (!mealsByMenuItem[menuItem]) {
      mealsByMenuItem[menuItem] = 0;
    }

    mealsByMenuItem[menuItem]++;
  });

  return {
    date: startOfDay,
    totalMealsClaimed: claims.length,
    studentsServed: uniqueStudents.size,
    mealsByMenuItem,
    claims,
  };
};

module.exports = {
  getReportsSummary,
  getDailyReport,
};
