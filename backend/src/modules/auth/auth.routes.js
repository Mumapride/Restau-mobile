const router = require('express').Router();
const { studentRegister, studentLogin, adminLogin } = require('./auth.controller');

router.post('/student/register', studentRegister);
router.post('/student/login', studentLogin);
router.post('/admin/login', adminLogin);

module.exports = router;