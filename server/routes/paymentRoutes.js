const express = require('express');
const router = express.Router();
const { simulatePayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/simulate-payment', protect, simulatePayment);

module.exports = router;
