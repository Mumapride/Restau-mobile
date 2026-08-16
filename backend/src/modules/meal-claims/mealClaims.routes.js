const router = require('express').Router();
const { getMyMealHistory } = require('./mealClaims.controller');
const { protect, requireRole } = require('../../middleware/auth.middleware');

// GET /api/meal-claims/student/me
router.get('/student/me', protect, requireRole('STUDENT'), getMyMealHistory);

module.exports = router;