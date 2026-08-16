const router = require('express').Router();
const { getMenu } = require('./menuSchedule.controller');
const { protect } = require('../../middleware/auth.middleware');

// GET /api/menu-schedule
router.get('/', protect, getMenu);

module.exports = router;