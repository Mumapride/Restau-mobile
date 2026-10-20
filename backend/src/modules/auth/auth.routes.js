const router = require('express').Router();
const { studentRegister, studentLogin, adminLogin, scannerLogin } = require('./auth.controller');

router.post('/student/register', studentRegister);
router.post('/student/login', studentLogin);
router.post('/admin/login', adminLogin);
router.post('/scanner/login', scannerLogin);

module.exports = router;