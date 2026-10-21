const router = require('express').Router();
const { getPublished, getAll, create, update, publish } = require('./announcements.controller');
const { protect, requireRole } = require('../../middleware/auth.middleware');

// Student route — published only
router.get('/', protect, requireRole('STUDENT'), getPublished);

// Admin routes
router.get('/admin', protect, requireRole('ADMIN'), getAll);
router.post('/', protect, requireRole('ADMIN'), create);
router.put('/:id', protect, requireRole('ADMIN'), update);
router.put('/:id/publish', protect, requireRole('ADMIN'), publish);

module.exports = router;