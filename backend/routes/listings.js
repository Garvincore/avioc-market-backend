const express = require('express');
const router = express.Router();
const db = require('../config/db');
const jwt = require('jsonwebtoken');
const axios = require('axios');

// Import MongoDB Mongoose Models
const Listing = require('../models/Listing');
const Video = require('../models/Video');
const Shop = require('../models/Shop');

const JWT_SECRET = process.env.JWT_SECRET || 'omweso_uganda_super_secret_key';
const BUNNY_LIBRARY_ID = process.env.BUNNY_STREAM_LIBRARY_ID || process.env.BUNNY_LIBRARY_ID;
const BUNNY_API_KEY = process.env.BUNNY_STREAM_API_KEY || process.env.BUNNY_API_KEY;

// Middleware to protect routes & extract shop ID from JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: "Access denied. Token missing." });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid authorization token." });
    req.shopId = user.shopId;
    next();
  });
}

// 1. GET ALL LISTINGS & VIDEOS (TikTok Discover Feed payload)
router.get('/', async (req, res) => {
  try {
    // A: MongoDB Route
    if (db.isMongo) {
      const videos = await Video.find()
        .populate('shopId')
        .populate('listingId')
        .sort({ createdAt: -1 });

      const formattedData = videos
        .filter(v => v.shopId && v.shopId.status === 'approved')
        .map(v => {
          const shop = v.shopId;
          const listing = v.listingId;
          return {
            video: {
              id: v._id,
              shopId: shop._id,
              productId: listing ? listing._id : null,
              videoSrc: `https://iframe.mediadelivery.net/play/${BUNNY_LIBRARY_ID}/${v.bunnyVideoId}`,
              imageFallback: listing ? listing.imageUrl : '',
              caption: v.caption,
              likes: v.likesCount,
              comments: v.commentsCount,
              shares: v.sharesCount,
              tags: v.tags || []
            },
            shop: {
              id: shop._id,
              name: shop.name,
              handle: shop.handle,
              avatar: shop.avatarUrl,
              bio: shop.bio,
              followers: shop.followersCount,
              likes: shop.likesCount,
              rating: parseFloat(shop.rating),
              verified: shop.isVerified,
              whatsapp: shop.whatsappNumber,
              location: shop.location
            },
            product: listing ? {
              id: listing._id,
              shopId: shop._id,
              title: listing.title,
              price: parseFloat(listing.price),
              type: listing.type,
              image: listing.imageUrl,
              description: listing.description,
              category: listing.category,
              rating: parseFloat(listing.rating)
            } : null
          };
        });

      return res.json(formattedData);
    }

    // B: SQL Mock Fallback
    const result = await db.query(`
      SELECT 
        v.id AS video_id, v.caption, v.tags, v.likes_count AS video_likes, v.comments_count AS video_comments, v.shares_count AS video_shares, v.bunny_video_id,
        l.id AS product_id, l.title AS product_title, l.price AS product_price, l.description AS product_desc, l.category AS product_category, l.type AS product_type, l.image_url AS product_image, l.rating AS product_rating,
        s.id AS shop_id, s.name AS shop_name, s.handle AS shop_handle, s.avatar_url AS shop_avatar, s.bio AS shop_bio, s.location AS shop_location, s.whatsapp_number AS shop_whatsapp, s.is_verified AS shop_verified, s.followers_count AS shop_followers, s.likes_count AS shop_likes, s.rating AS shop_rating
      FROM videos v
      LEFT JOIN listings l ON v.listing_id = l.id
      JOIN shops s ON v.shop_id = s.id
      ORDER BY v.created_at DESC
    `);

    const formattedData = result.rows.map(row => ({
      video: {
        id: row.video_id,
        shopId: row.shop_id,
        productId: row.product_id,
        videoSrc: `https://iframe.mediadelivery.net/play/${BUNNY_LIBRARY_ID}/${row.bunny_video_id}`,
        imageFallback: row.product_image,
        caption: row.caption,
        likes: row.video_likes,
        comments: row.video_comments,
        shares: row.video_shares,
        tags: row.tags || []
      },
      shop: {
        id: row.shop_id,
        name: row.shop_name,
        handle: row.shop_handle,
        avatar: row.shop_avatar,
        bio: row.shop_bio,
        followers: row.shop_followers,
        likes: row.shop_likes,
        rating: parseFloat(row.shop_rating),
        verified: row.shop_verified,
        whatsapp: row.shop_whatsapp,
        location: row.shop_location
      },
      product: row.product_id ? {
        id: row.product_id,
        shopId: row.shop_id,
        title: row.product_title,
        price: parseFloat(row.product_price),
        type: row.product_type,
        image: row.product_image,
        description: row.product_desc,
        category: row.product_category,
        rating: parseFloat(row.product_rating)
      } : null
    }));

    res.json(formattedData);
  } catch (err) {
    console.error('Error fetching feeds:', err);
    res.status(500).json({ error: "Failed to load listings data." });
  }
});

// 2. INITIALIZE A VIDEO RECORD ON BUNNY STREAM & RETRIEVE UPLOAD TOKEN
router.get('/bunny/prepare-upload', authenticateToken, async (req, res) => {
  const { title } = req.query;
  const libraryId = BUNNY_LIBRARY_ID;
  const apiKey = BUNNY_API_KEY;

  if (!libraryId || !apiKey) {
    return res.status(500).json({ error: "Server Bunny.net credentials are not configured." });
  }

  try {
    const response = await axios.post(
      `https://video.bunnycdn.com/library/${libraryId}/videos`,
      { title: title || `Listing Upload ${Date.now()}` },
      { headers: { AccessKey: apiKey, 'Content-Type': 'application/json' } }
    );

    res.json({
      bunnyVideoId: response.data.guid,
      libraryId: libraryId,
      uploadSignature: apiKey
    });
  } catch (err) {
    console.error('Error preparing Bunny Stream placeholder:', err?.response?.data || err.message);
    res.status(500).json({ error: "Failed to connect to Bunny.net API." });
  }
});

// 3. CREATE NEW LISTING AND SAVE VIDEO DATA
router.post('/', authenticateToken, async (req, res) => {
  const { 
    title, 
    description, 
    price, 
    category, 
    type, 
    bunnyVideoId, 
    caption, 
    tags,
    imageUrl
  } = req.body;

  if (!title || !price || !bunnyVideoId || !caption) {
    return res.status(400).json({ error: "Missing required listing payload fields." });
  }

  try {
    // A: MongoDB Route
    if (db.isMongo) {
      const shop = await Shop.findById(req.shopId);
      if (!shop || shop.status !== 'approved') {
        return res.status(403).json({ 
          error: "Your shop is currently pending confirmation. You cannot publish videos or sell products yet!" 
        });
      }

      const newListing = await Listing.create({
        shopId: req.shopId,
        title,
        description: description || '',
        price: parseFloat(price),
        category,
        type,
        imageUrl: imageUrl || `https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&auto=format&fit=crop&q=80`
      });

      const newVideo = await Video.create({
        shopId: req.shopId,
        listingId: newListing._id,
        bunnyVideoId,
        caption,
        tags: Array.isArray(tags) ? tags : [type]
      });

      return res.status(201).json({
        message: "Listing published successfully!",
        listing: newListing,
        video: newVideo
      });
    }

    // B: SQL Mock Fallback
    const shopResult = await db.query('SELECT status FROM shops WHERE id = $1', [req.shopId]);
    const shop = shopResult.rows[0];

    if (!shop || shop.status !== 'approved') {
      return res.status(403).json({ 
        error: "Your shop is currently pending confirmation. You cannot publish videos or sell products yet!" 
      });
    }

    const listingResult = await db.query(
      `INSERT INTO listings (shop_id, title, description, price, category, type, image_url) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [req.shopId, title, description, price, category, type, imageUrl || `https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&auto=format&fit=crop&q=80`]
    );

    const newListing = listingResult.rows[0];
    const tagsArray = Array.isArray(tags) ? tags : [type];

    const videoResult = await db.query(
      `INSERT INTO videos (shop_id, listing_id, bunny_video_id, caption, tags) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [req.shopId, newListing.id, bunnyVideoId, caption, tagsArray]
    );

    const newVideo = videoResult.rows[0];
    res.status(201).json({
      message: "Listing published successfully!",
      listing: newListing,
      video: newVideo
    });
  } catch (err) {
    console.error('Error saving listing details:', err);
    res.status(500).json({ error: "Database save failure." });
  }
});

// 4. DELETE LISTING & CORRESPONDING FEED VIDEO
router.delete('/:id', authenticateToken, async (req, res) => {
  const listingId = req.params.id;

  try {
    // A: MongoDB Route
    if (db.isMongo) {
      const listing = await Listing.findById(listingId);
      if (!listing) {
        return res.status(404).json({ error: "Listing not found." });
      }

      if (listing.shopId.toString() !== req.shopId) {
        return res.status(403).json({ error: "Unauthorized access: You can only delete your own listings." });
      }

      await Listing.findByIdAndDelete(listingId);
      await Video.deleteMany({ listingId: listingId });

      return res.json({ message: "Listing deleted successfully!", listing });
    }

    // B: SQL Mock Fallback
    const checkResult = await db.query('SELECT shop_id FROM listings WHERE id = $1', [listingId]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: "Listing not found." });
    }

    if (checkResult.rows[0].shop_id !== req.shopId) {
      return res.status(403).json({ error: "Unauthorized access: You can only delete your own listings." });
    }

    const deleteResult = await db.query('DELETE FROM listings WHERE id = $1 RETURNING *', [listingId]);
    res.json({ message: "Listing deleted successfully!", listing: deleteResult.rows[0] });

  } catch (err) {
    console.error('Error deleting listing:', err);
    res.status(500).json({ error: "Failed to delete listing." });
  }
});

module.exports = router;
