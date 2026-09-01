const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Restau API is running" });
});

// Developer A routes
app.use("/api/auth", require("./modules/auth/auth.routes"));
app.use("/api/users", require("./modules/users/users.routes"));
app.use("/api/qr-tokens", require("./modules/qr-tokens/qrTokens.routes"));

// Developer B routes
app.use(
  "/api/semester",
  require("./modules/semester/semester.routes")
);

app.use(
  "/api/meal-plans",
  require("./modules/meal-plans/mealPlans.routes")
);

app.use(
  "/api/subscriptions",
  require("./modules/subscription/subscription.routes")
);

app.use(
  "/api/meal-claims",
  require("./modules/meal-claims/mealClaims.routes")
);

module.exports = app;