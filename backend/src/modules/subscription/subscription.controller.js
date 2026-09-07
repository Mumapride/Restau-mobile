const subscriptionService = require("./subscription.service");

// Create subscription
const createSubscription = async (req, res) => {
  try {
    const subscription = await subscriptionService.createSubscription(
      req.body
    );

    res.status(201).json({
      message: "Subscription created successfully",
      subscription,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

// Get all subscriptions
const getSubscriptions = async (req, res) => {
  try {
    const subscriptions = await subscriptionService.getSubscriptions();

    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get subscription by ID
const getSubscriptionById = async (req, res) => {
  try {
    const subscription = await subscriptionService.getSubscriptionById(
      req.params.id
    );

    res.json(subscription);
  } catch (error) {
    res.status(404).json({
      message: error.message,
    });
  }
};

module.exports = {
  createSubscription,
  getSubscriptions,
  getSubscriptionById,
};