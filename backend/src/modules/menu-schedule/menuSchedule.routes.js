const router = require('express').Router();
const { getMenu, createMenu, updateMenu, deleteMenu } = require('./menuSchedule.controller');
const { protect, requireRole } = require('../../middleware/auth.middleware');

// GET /api/menu-schedule — weekly menu for students and admins (protected)
router.get('/', protect, getMenu);

// Admin-only management operations (create / update / delete)
router.post('/', protect, requireRole('ADMIN'), createMenu);
router.put('/:id', protect, requireRole('ADMIN'), updateMenu);
router.delete('/:id', protect, requireRole('ADMIN'), deleteMenu);

module.exports = router;