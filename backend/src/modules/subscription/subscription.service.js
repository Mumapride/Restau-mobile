const prisma = require("../../config/db");

// Create subscription
const createSubscription = async ({
  studentId,
  mealPlanId,
  semesterId,
}) => {
  // Check student
  const student = await prisma.student.findUnique({
    where: {
      id: Number(studentId),
    },
  });

  if (!student) {
    throw new Error("Student not found");
  }

  // Check meal plan
  const mealPlan = await prisma.mealPlan.findUnique({
    where: {
      id: Number(mealPlanId),
    },
  });

  if (!mealPlan) {
    throw new Error("Meal plan not found");
  }

  if (!mealPlan.isActive) {
    throw new Error("Meal plan is inactive");
  }

  // Check semester
  const semester = await prisma.semester.findUnique({
    where: {
      id: Number(semesterId),
    },
  });

  if (!semester) {
    throw new Error("Semester not found");
  }

  if (!semester.isActive) {
    throw new Error("Semester is inactive");
  }

  // Create subscription using credits from meal plan
  const subscription = await prisma.subscription.create({
    data: {
      studentId: Number(studentId),
      mealPlanId: Number(mealPlanId),
      semesterId: Number(semesterId),
      credits: mealPlan.credits,
    },
    include: {
      student: true,
      mealPlan: true,
      semester: true,
    },
  });

  return subscription;
};

// Get subscriptions
const getSubscriptions = async () => {
  return await prisma.subscription.findMany({
    include: {
      student: true,
      mealPlan: true,
      semester: true,
      payments: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

// Get subscription by ID
const getSubscriptionById = async (id) => {
  const subscription = await prisma.subscription.findUnique({
    where: {
      id: Number(id),
    },
    include: {
      student: true,
      mealPlan: true,
      semester: true,
      payments: true,
    },
  });

  if (!subscription) {
    throw new Error("Subscription not found");
  }

  return subscription;
};

module.exports = {
  createSubscription,
  getSubscriptions,
  getSubscriptionById,
};