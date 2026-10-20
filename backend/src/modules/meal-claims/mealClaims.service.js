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
const processScan = async (token) => {
  const qrToken = await prisma.qRToken.findUnique({
    where: { token },
    include: {
      student: {
        include: {
          user: true,
          subscriptions: {
            include: {
              mealPlan: true,
              semester: true
            }
          }
        }
      }
    }
  });

  if (!qrToken) {
    return { approved: false, reason: 'Invalid QR code' };
  }

  const student = qrToken.student;

  const activeSemester = await prisma.semester.findFirst({
    where: { isActive: true }
  });

  if (!activeSemester) {
    return { approved: false, reason: 'No active semester' };
  }

  const activeSubscription = student.subscriptions.find(
    s => s.semesterId === activeSemester.id
  );

  if (!activeSubscription) {
    return {
      approved: false,
      reason: 'No active meal plan',
      studentName: `${student.user.firstName} ${student.user.lastName}`,
      matricule: student.matricule
    };
  }

  const claimsCount = await prisma.mealClaim.count({
    where: {
      studentId: student.id,
      semesterId: activeSemester.id
    }
  });

  const creditsRemaining = activeSubscription.credits - claimsCount;

  if (creditsRemaining <= 0) {
    return {
      approved: false,
      reason: 'No credits remaining',
      studentName: `${student.user.firstName} ${student.user.lastName}`,
      matricule: student.matricule
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const alreadyAteToday = await prisma.mealClaim.findFirst({
    where: {
      studentId: student.id,
      claimDate: { gte: today, lt: tomorrow }
    }
  });

  if (alreadyAteToday) {
    return {
      approved: false,
      reason: 'Meal already collected today',
      studentName: `${student.user.firstName} ${student.user.lastName}`,
      matricule: student.matricule
    };
  }

  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const todayDay = days[new Date().getDay()];
  const menuToday = await prisma.menuSchedule.findFirst({
    where: {
      semesterId: activeSemester.id,
      dayOfWeek: todayDay,
      isActive: true
    }
  });

  await prisma.mealClaim.create({
    data: {
      studentId: student.id,
      qrTokenId: qrToken.id,
      semesterId: activeSemester.id,
      menuItem: menuToday ? menuToday.mealName : 'Daily Meal'
    }
  });

  return {
    approved: true,
    studentName: `${student.user.firstName} ${student.user.lastName}`,
    matricule: student.matricule,
    creditsRemaining: creditsRemaining - 1,
    menuItem: menuToday ? menuToday.mealName : 'Daily Meal'
  };
};

const getStudentClaims = async (studentId) => {
  return await prisma.mealClaim.findMany({
    where: { studentId },
    include: { semester: true },
    orderBy: { claimDate: 'desc' }
  });
};

module.exports = {
  getMealClaims,
  getTodaysMealClaims,
  getMealClaimsByStudent,
  processScan,
  getStudentClaims,
};
