const prisma = require("../../config/db");

// Get all meal claims
const getMealClaims = async () => {
  const mealClaims = await prisma.mealClaim.findMany({
    orderBy: {
      claimDate: "desc",
    },
    include: {
      student: {
        include: {
          user: true,
        },
      },
      semester: true,
      qrToken: true,
    },
  });

  return mealClaims;
};

// Get today's meal claims
const getTodaysMealClaims = async () => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const mealClaims = await prisma.mealClaim.findMany({
    where: {
      claimDate: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    orderBy: {
      claimDate: "desc",
    },
    include: {
      student: {
        include: {
          user: true,
        },
      },
      semester: true,
      qrToken: true,
    },
  });

  return mealClaims;
};

// Get meal claims for a specific student
const getMealClaimsByStudent = async (studentId) => {
  const student = await prisma.student.findUnique({
    where: {
      id: Number(studentId),
    },
  });

  if (!student) {
    throw new Error("Student not found");
  }

  const mealClaims = await prisma.mealClaim.findMany({
    where: {
      studentId: Number(studentId),
    },
    orderBy: {
      claimDate: "desc",
    },
    include: {
      semester: true,
      qrToken: true,
    },
  });

  return mealClaims;
};

module.exports = {
  getMealClaims,
  getTodaysMealClaims,
  getMealClaimsByStudent,
};