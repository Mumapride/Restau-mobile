const prisma = require("../../config/db");

// Get all active meal plans
const getMealPlans = async () => {
  const mealPlans = await prisma.mealPlan.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return mealPlans;
};

// Create a meal plan
const createMealPlan = async ({
  name,
  description,
  credits,
  pricePerCredit,
}) => {
  if (!name || credits === undefined || pricePerCredit === undefined) {
    throw new Error("Name, credits and price per credit are required");
  }

  if (credits <= 0) {
    throw new Error("Credits must be greater than 0");
  }

  if (pricePerCredit < 0) {
    throw new Error("Price per credit cannot be negative");
  }

  const mealPlan = await prisma.mealPlan.create({
    data: {
      name,
      description,
      credits: Number(credits),
      pricePerCredit: Number(pricePerCredit),
      isActive: true,
    },
  });

  return mealPlan;
};

// Update a meal plan
const updateMealPlan = async (
  id,
  { name, description, credits, pricePerCredit }
) => {
  const existingMealPlan = await prisma.mealPlan.findUnique({
    where: {
      id: Number(id),
    },
  });

  if (!existingMealPlan) {
    throw new Error("Meal plan not found");
  }

  const updatedMealPlan = await prisma.mealPlan.update({
    where: {
      id: Number(id),
    },
    data: {
      name,
      description,
      credits:
        credits !== undefined ? Number(credits) : existingMealPlan.credits,
      pricePerCredit:
        pricePerCredit !== undefined
          ? Number(pricePerCredit)
          : existingMealPlan.pricePerCredit,
    },
  });

  return updatedMealPlan;
};

// Deactivate a meal plan
const deactivateMealPlan = async (id) => {
  const existingMealPlan = await prisma.mealPlan.findUnique({
    where: {
      id: Number(id),
    },
  });

  if (!existingMealPlan) {
    throw new Error("Meal plan not found");
  }

  const mealPlan = await prisma.mealPlan.update({
    where: {
      id: Number(id),
    },
    data: {
      isActive: false,
    },
  });

  return mealPlan;
};

module.exports = {
  getMealPlans,
  createMealPlan,
  updateMealPlan,
  deactivateMealPlan,
};