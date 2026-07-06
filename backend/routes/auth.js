const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Import MongoDB Mongoose Models
const User = require('../models/User');
const Shop = require('../models/Shop');

const JWT_SECRET = process.env.JWT_SECRET || 'omweso_uganda_super_secret_key';

// 1. REGISTER AS BUYER (GENERAL USER)
router.post('/register/user', async (req, res) => {
  const { name, email, password, phone_number } = req.body;

  if (!name || !email || !password || !phone_number) {
    return res.status(400).json({ error: "Missing required registration parameters (name, email, password, phone_number)." });
  }

  const cleanEmail = email.toLowerCase().trim();

  try {
    // A: MongoDB Route
    if (db.isMongo) {
      const existingUser = await User.findOne({ email: cleanEmail });
      const existingShop = await Shop.findOne({ email: cleanEmail });
      
      if (existingUser || existingShop) {
        return res.status(400).json({ error: "An account with this email address already exists." });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const newUser = await User.create({
        name,
        email: cleanEmail,
        passwordHash,
        phoneNumber: phone_number
      });

      const userResponse = {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone_number: newUser.phoneNumber
      };

      const token = jwt.sign({ userId: newUser._id, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });
      return res.status(201).json({ token, user: userResponse, role: 'user' });
    }

    // B: SQL Mock Fallback
    const checkExists = await db.query('SELECT id FROM users WHERE email = $1', [cleanEmail]);
    if (checkExists.rows.length > 0) {
      return res.status(400).json({ error: "An account with this email address already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await db.query(
      `INSERT INTO users (name, email, password_hash, phone_number) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, name, email, phone_number`,
      [name, cleanEmail, passwordHash, phone_number]
    );

    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user, role: 'user' });

  } catch (err) {
    console.error('Error during buyer registration:', err);
    res.status(500).json({ error: "Database error during registration." });
  }
});

// 2. REGISTER AS SELLER (SHOP OWNER)
router.post('/register/seller', async (req, res) => {
  const { 
    name, 
    handle, 
    email, 
    password, 
    whatsapp_number, 
    bio, 
    location, 
    business_reg_no 
  } = req.body;

  if (!name || !handle || !email || !password || !whatsapp_number || !location) {
    return res.status(400).json({ 
      error: "Missing required shop parameters (shop name, handle, email, password, whatsapp, address)." 
    });
  }

  const cleanHandle = handle.toLowerCase().trim();
  const cleanEmail = email.toLowerCase().trim();

  try {
    // A: MongoDB Route
    if (db.isMongo) {
      const existingShop = await Shop.findOne({ $or: [{ handle: cleanHandle }, { email: cleanEmail }] });
      const existingUser = await User.findOne({ email: cleanEmail });

      if (existingShop || existingUser) {
        return res.status(400).json({ error: "Shop Handle or email address is already taken." });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const newShop = await Shop.create({
        name,
        handle: cleanHandle,
        email: cleanEmail,
        passwordHash,
        whatsappNumber: whatsapp_number,
        bio: bio || '',
        location,
        businessRegNo: business_reg_no || '',
        status: 'pending' // defaults to review list
      });

      const shopResponse = {
        id: newShop._id,
        name: newShop.name,
        handle: newShop.handle,
        email: newShop.email,
        avatar_url: newShop.avatarUrl,
        whatsapp_number: newShop.whatsappNumber,
        location: newShop.location,
        business_reg_no: newShop.businessRegNo,
        status: newShop.status,
        is_verified: newShop.isVerified
      };

      const token = jwt.sign({ shopId: newShop._id, role: 'seller' }, JWT_SECRET, { expiresIn: '7d' });
      return res.status(201).json({ token, shop: shopResponse, role: 'seller' });
    }

    // B: SQL Mock Fallback
    const checkExists = await db.query(
      'SELECT id FROM shops WHERE handle = $1 OR email = $2',
      [cleanHandle, cleanEmail]
    );

    if (checkExists.rows.length > 0) {
      return res.status(400).json({ error: "Shop Handle or email address is already taken." });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await db.query(
      `INSERT INTO shops (name, handle, email, password_hash, whatsapp_number, bio, location, business_reg_no, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING id, name, handle, email, avatar_url, whatsapp_number, location, business_reg_no, status, is_verified`,
      [name, cleanHandle, cleanEmail, passwordHash, whatsapp_number, bio || '', location, business_reg_no || '', 'pending']
    );

    const shop = result.rows[0];
    const token = jwt.sign({ shopId: shop.id, role: 'seller' }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, shop, role: 'seller' });

  } catch (err) {
    console.error('Error during shop registration:', err);
    res.status(500).json({ error: "Database error during shop creation." });
  }
});

// 3. UNIFIED LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Please enter your email and password." });
  }

  const cleanEmail = email.toLowerCase().trim();

  try {
    // A: MongoDB Route
    if (db.isMongo) {
      // Find in buyers list
      const user = await User.findOne({ email: cleanEmail });
      if (user) {
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
          return res.status(400).json({ error: "Incorrect password." });
        }

        const userResponse = {
          id: user._id,
          name: user.name,
          email: user.email,
          phone_number: user.phoneNumber
        };

        const token = jwt.sign({ userId: user._id, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });
        return res.json({ token, user: userResponse, role: 'user' });
      }

      // Find in vendors list
      const shop = await Shop.findOne({ email: cleanEmail });
      if (shop) {
        const isMatch = await bcrypt.compare(password, shop.passwordHash);
        if (!isMatch) {
          return res.status(400).json({ error: "Incorrect password." });
        }

        const shopResponse = {
          id: shop._id,
          name: shop.name,
          handle: shop.handle,
          email: shop.email,
          avatar_url: shop.avatarUrl,
          whatsapp_number: shop.whatsappNumber,
          location: shop.location,
          business_reg_no: shop.businessRegNo,
          status: shop.status,
          is_verified: shop.isVerified
        };

        const token = jwt.sign({ shopId: shop._id, role: 'seller' }, JWT_SECRET, { expiresIn: '7d' });
        return res.json({ token, shop: shopResponse, role: 'seller' });
      }

      return res.status(400).json({ error: "Invalid credentials. Account not found." });
    }

    // B: SQL Mock Fallback
    const userResult = await db.query('SELECT * FROM users WHERE email = $1', [cleanEmail]);
    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(400).json({ error: "Incorrect password." });
      }

      delete user.password_hash;
      const token = jwt.sign({ userId: user.id, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ token, user, role: 'user' });
    }

    const shopResult = await db.query('SELECT * FROM shops WHERE email = $1', [cleanEmail]);
    if (shopResult.rows.length > 0) {
      const shop = shopResult.rows[0];
      const isMatch = await bcrypt.compare(password, shop.password_hash);
      if (!isMatch) {
        return res.status(400).json({ error: "Incorrect password." });
      }

      delete shop.password_hash;
      const token = jwt.sign({ shopId: shop.id, role: 'seller' }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ token, shop, role: 'seller' });
    }

    return res.status(400).json({ error: "Invalid credentials. Account not found." });

  } catch (err) {
    console.error('Error during login process:', err);
    res.status(500).json({ error: "Internal server login failure." });
  }
});

module.exports = router;
