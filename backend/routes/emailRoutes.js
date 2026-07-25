const express = require('express');
const router = express.Router();
const { sendApprovalEmail, verifyEmailResponse } = require('../controllers/emailController');

// Send approval email
router.post('/send-approval', sendApprovalEmail);

// Verify email response
router.get('/verify-email', verifyEmailResponse);

module.exports = router;