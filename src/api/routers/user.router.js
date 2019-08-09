const express = require('express');
const controller = require('../controllers/user.controller');
const router = express.Router();

router.post('/login', controller.logIn);
router.post('/signup', controller.signUp);
router.post('/confirmation', controller.confirmationPost);
router.post('/resend', controller.resendTokenPost);

module.exports = router;
