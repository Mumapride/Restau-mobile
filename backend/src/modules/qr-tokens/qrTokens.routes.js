const router = require('express').Router();
const { getMyQR } = require('./qrTokens.controller');
const { protect, requireRole } = require('../../middleware/auth.middleware');

router.get('/my-qr', protect, requireRole('STUDENT'), getMyQR);

module.exports = router;