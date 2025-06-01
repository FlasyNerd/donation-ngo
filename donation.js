const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const pool = require('./db'); // assuming db.js is in the same directory
const dotenv = require('dotenv'); // Import dotenv to ensure .env is loaded if not already

dotenv.config(); // Load environment variables

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create order
router.post('/create-order', async (req, res) => {
  const { amount, donorName, donorEmail, donorPhone } = req.body;

  // Log the incoming request for debugging
  console.log('Received /create-order request:', { amount, donorName, donorEmail, donorPhone });

  if (amount < 100) {
    console.error('Validation Error: Minimum donation amount is ₹100');
    return res.status(400).json({ error: 'Minimum donation amount is ₹100' });
  }

  const options = {
    amount: amount * 100, // amount in paise
    currency: 'INR',
    receipt: `receipt_${Date.now()}`,
  };

  try {
    const order = await razorpay.orders.create(options);
    console.log('Razorpay Order Created:', order.id);
    res.json({ orderId: order.id });
  } catch (error) {
    console.error('Error creating order with Razorpay:', error);
    res.status(500).json({ error: 'Error creating order' });
  }
});

// Verify payment
router.post('/verify-payment', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, donorName, donorEmail, donorPhone, amount } = req.body;

  // --- START: Added Logging for Debugging Signature Mismatch ---
  console.log('--- Payment Verification Request Received ---');
  console.log('Received Payload from Frontend:', {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    donorName,
    donorEmail,
    donorPhone,
    amount
  });

  // Construct the body string exactly as Razorpay expects it
  const body = razorpay_order_id + '|' + razorpay_payment_id;

  // Generate the expected signature using your Razorpay Key Secret
  const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');

  console.log('String used for Hashing (body):', body);
  console.log('RAZORPAY_KEY_SECRET used:', process.env.RAZORPAY_KEY_SECRET ? '*****' + process.env.RAZORPAY_KEY_SECRET.slice(-4) : 'NOT SET'); // Mask part of the key for security in logs
  console.log('Generated Signature (Backend):', expectedSignature);
  console.log('Received Signature (from Razorpay handler):', razorpay_signature);
  // --- END: Added Logging ---

  if (expectedSignature === razorpay_signature) {
    console.log('Signature Matched! Payment is authentic.');
    // Payment verified, record donation
    try {
      // USING THE CORRECT COLUMN NAMES FROM YOUR DATABASE
      await pool.execute(
        'INSERT INTO donations (donor_name, donor_email, donor_phone, donation_amount, payment_id, order_id, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?)',
       [donorName, donorEmail, donorPhone, amount, razorpay_payment_id, razorpay_order_id, 'completed'] // Assuming 'success' for payment_status after verification
      );
      console.log('Donation successfully recorded in database.');
      res.json({ success: true, message: 'Payment verified and donation recorded' });
    } catch (error) {
      console.error('Error inserting donation into database:', error);
      res.status(500).json({ success: false, message: 'Error recording donation' });
    }
  } else {
    console.error('Signature Mismatch! Payment verification failed.');
    res.status(400).json({ success: false, message: 'Invalid signature' });
  }
});

module.exports = router;