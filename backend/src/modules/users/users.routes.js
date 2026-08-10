const router = require('express').Router();
const { getMyProfile } = require('./users.controller');
const { protect, requireRole } = require('../../middleware/auth.middleware');

router.get('/students/me', protect, requireRole('STUDENT'), getMyProfile);

module.exports = router;