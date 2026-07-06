const express = require('express');
const router = express.Router();
const axios = require('axios');
const db = require('../config/db');
const jwt = require('jsonwebtoken');

// Import MongoDB Mongoose Models
const Order = require('../models/Order');
const Listing = require('../models/Listing');

const FLUTTERWAVE_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY;
const JWT_SECRET = process.env.JWT_SECRET || 'omweso_uganda_super_secret_key';

// Middleware to authenticate JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: "Access denied. Token missing." });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token." });
    req.shopId = user.shopId;
    next();
  });
}

// 1. POST /api/payments/momo
// Debit request (MTN MoMo / Airtel Money)
router.post('/momo', async (req, res) => {
  const { amount, phone, name, email, network } = req.body;

  if (!amount || !phone || !name || !network) {
    return res.status(400).json({ error: "Missing required checkout fields." });
  }

  if (!FLUTTERWAVE_SECRET_KEY) {
    console.warn("WARNING: FLUTTERWAVE_SECRET_KEY is not set. Simulating sandbox transaction.");
    return res.json({
      status: "success",
      message: "Charge initiated (SANDBOX SIMULATION)",
      data: {
        tx_ref: `avioc-sim-${Date.now()}`,
        status: "pending",
        amount: amount,
        currency: "UGX"
      }
    });
  }

  const formattedNetwork = network.toUpperCase();
  const txRef = `avioc-tx-${Date.now()}`;

  try {
    const response = await axios.post(
      'https://api.flutterwave.com/v3/charges?type=mobile_money_uganda',
      {
        amount: amount,
        currency: 'UGX',
        phone_number: `256${phone.replace(/^0/, '')}`, 
        network: formattedNetwork,
        email: email || 'buyer@avioc.com',
        tx_ref: txRef,
        fullname: name,
        redirect_url: 'https://webhook.site/avioc-payments'
      },
      {
        headers: {
          Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error('Flutterwave payments API error:', err?.response?.data || err.message);
    res.status(500).json({ 
      error: "Failed to connect to mobile money network.",
      details: err?.response?.data || err.message 
    });
  }
});

// 2. GET /api/payments/orders
// Retrieves incoming orders for a shop owner dashboard
router.get('/orders', authenticateToken, async (req, res) => {
  try {
    // A: MongoDB Route
    if (db.isMongo) {
      const orders = await Order.find({ shopId: req.shopId })
        .populate('listingId')
        .sort({ createdAt: -1 });

      const formatted = orders.map(o => ({
        id: o._id,
        shop_id: o.shopId,
        listing_id: o.listingId ? o.listingId._id : null,
        buyer_name: o.buyerName,
        buyer_phone: o.buyerPhone,
        quantity: o.quantity,
        total_amount: o.totalAmount,
        status: o.status,
        created_at: o.createdAt,
        product_title: o.listingId ? o.listingId.title : 'Deleted Item'
      }));

      return res.json(formatted);
    }

    // B: SQL Mock Fallback
    const result = await db.query(
      `SELECT o.*, l.title AS product_title FROM orders o 
       LEFT JOIN listings l ON o.listing_id = l.id 
       WHERE o.shop_id = $1 
       ORDER BY o.created_at DESC`,
      [req.shopId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching shop orders:', err);
    res.status(500).json({ error: "Failed to retrieve orders." });
  }
});

// 3. POST /api/payments/orders
// Create order logs on database
router.post('/orders', async (req, res) => {
  const { shopId, listingId, buyerName, buyerPhone, quantity, totalAmount } = req.body;

  if (!shopId || !listingId || !buyerName || !buyerPhone || !quantity || !totalAmount) {
    return res.status(400).json({ error: "Missing required order creation fields." });
  }

  try {
    // A: MongoDB Route
    if (db.isMongo) {
      const newOrder = await Order.create({
        shopId,
        listingId,
        buyerName,
        buyerPhone,
        quantity: parseInt(quantity),
        totalAmount: parseFloat(totalAmount),
        status: 'pending'
      });
      return res.status(201).json(newOrder);
    }

    // B: SQL Mock Fallback
    const result = await db.query(
      `INSERT INTO orders (shop_id, listing_id, buyer_name, buyer_phone, quantity, total_amount, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [shopId, listingId, buyerName, buyerPhone, quantity, totalAmount, 'pending']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating database order log:', err);
    res.status(500).json({ error: "Database failure logging order." });
  }
});

// 4. PUT /api/payments/orders/:id
// Toggles delivery status
router.put('/orders/:id', authenticateToken, async (req, res) => {
  const { status } = req.body;
  const orderId = req.params.id;

  if (!status) return res.status(400).json({ error: "Missing status parameter." });

  try {
    // A: MongoDB Route
    if (db.isMongo) {
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        { status },
        { new: true }
      );

      if (!updatedOrder) {
        return res.status(404).json({ error: "Order not found." });
      }

      return res.json(updatedOrder);
    }

    // B: SQL Mock Fallback
    const result = await db.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, orderId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Order not found." });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating order delivery status:', err);
    res.status(500).json({ error: "Failed to update order status." });
  }
});

module.exports = router;
