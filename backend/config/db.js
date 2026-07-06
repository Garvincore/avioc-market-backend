const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
let isMongo = false;

// 1. Dynamic switch: If MONGODB_URI is provided, initialize Mongoose
if (MONGODB_URI) {
  console.log('[Database] MONGODB_URI is set. Connecting to MongoDB Atlas...');
  mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('[Database] Successfully connected to MongoDB via Mongoose! 🍃'))
  .catch(err => console.error('[Database] MongoDB connection error:', err));
  
  isMongo = true;
} else {
  console.log('[Database] MONGODB_URI is NOT set. FALLING BACK TO LOCAL STATIC JSON DB.');
}

const dbPath = path.join(__dirname, '../db.json');

// Read DB from file helper (for local fallback)
function readData() {
  try {
    const raw = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading JSON DB file, initializing defaults...', err);
    return { users: [], shops: [], listings: [], videos: [], orders: [] };
  }
}

// Write DB to file helper (for local fallback)
function writeData(data) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing to JSON DB file:', err);
  }
}

// Mock Postgres-like query result wrapper (for local fallback)
function createResult(rows) {
  return {
    rows: rows,
    rowCount: rows.length
  };
}

// Helper to generate simple mock UUIDs
function generateUUID() {
  return 'u_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

module.exports = {
  isMongo,
  
  // SQL Interceptor Query Fallback (Only active when MONGODB_URI is missing)
  query: async (text, params = []) => {
    const data = readData();
    const sql = text.trim().replace(/\s+/g, ' ');

    console.log(`[Local JSON DB] Intercepting Query: "${sql.slice(0, 80)}..."`);

    if (!data.orders) data.orders = [];

    // 1. Check if email or handle exists in shops or users
    if (sql.includes('SELECT id FROM shops WHERE handle = $1 OR email = $2')) {
      const handle = (params[0] || '').toLowerCase().trim();
      const email = (params[1] || '').toLowerCase().trim();
      const found = data.shops.filter(s => 
        (s.handle && s.handle.toLowerCase() === handle) || 
        (s.email && s.email.toLowerCase() === email)
      );
      return createResult(found.map(s => ({ id: s.id })));
    }

    if (sql.includes('SELECT id FROM users WHERE email = $1')) {
      const email = (params[0] || '').toLowerCase().trim();
      const found = data.users.filter(u => u.email && u.email.toLowerCase() === email);
      return createResult(found.map(u => ({ id: u.id })));
    }

    // 2. Register / Insert new USER (Buyer)
    if (sql.includes('INSERT INTO users') && sql.includes('RETURNING')) {
      const newUser = {
        id: generateUUID(),
        name: params[0],
        email: params[1].toLowerCase().trim(),
        password_hash: params[2],
        phone_number: params[3],
        created_at: new Date().toISOString()
      };
      data.users.push(newUser);
      writeData(data);
      return createResult([{
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone_number: newUser.phone_number
      }]);
    }

    // 3. Register / Insert new SHOP (Seller)
    if (sql.includes('INSERT INTO shops') && sql.includes('RETURNING')) {
      const newShop = {
        id: generateUUID(),
        name: params[0],
        handle: params[1].toLowerCase().trim(),
        email: params[2].toLowerCase().trim(),
        password_hash: params[3],
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
        bio: params[5] || '',
        location: params[6], 
        whatsapp_number: params[4],
        business_reg_no: params[7] || '',
        status: params[8] || 'pending', 
        followers_count: 0,
        likes_count: 0,
        rating: 5.0,
        is_verified: false,
        created_at: new Date().toISOString()
      };
      data.shops.push(newShop);
      writeData(data);
      return createResult([{
        id: newShop.id,
        name: newShop.name,
        handle: newShop.handle,
        email: newShop.email,
        avatar_url: newShop.avatar_url,
        whatsapp_number: newShop.whatsapp_number,
        location: newShop.location,
        business_reg_no: newShop.business_reg_no,
        status: newShop.status,
        is_verified: newShop.is_verified
      }]);
    }

    // 4. Login: Find User (Buyer) by email
    if (sql.includes('SELECT * FROM users WHERE email = $1')) {
      const email = (params[0] || '').toLowerCase().trim();
      const found = data.users.filter(u => u.email && u.email.toLowerCase() === email);
      return createResult(found);
    }

    // 5. Login: Find Shop (Seller) by email
    if (sql.includes('SELECT * FROM shops WHERE email = $1')) {
      const email = (params[0] || '').toLowerCase().trim();
      const found = data.shops.filter(s => s.email && s.email.toLowerCase() === email);
      return createResult(found);
    }

    // 6. Fetch Discover Feed (Join listings & shops, ONLY APPROVED SHOPS)
    if (sql.includes('SELECT v.id AS video_id') && sql.includes('LEFT JOIN listings')) {
      const rows = [];
      data.videos.forEach(video => {
        const shop = data.shops.find(s => s.id === video.shop_id) || {};
        if (shop.status !== 'approved') return;
        const listing = data.listings.find(l => l.id === video.listing_id) || null;

        rows.push({
          video_id: video.id,
          caption: video.caption,
          tags: video.tags,
          video_likes: video.likes_count,
          video_comments: video.comments_count,
          video_shares: video.shares_count,
          bunny_video_id: video.bunny_video_id,
          
          product_id: listing ? listing.id : null,
          product_title: listing ? listing.title : null,
          product_price: listing ? listing.price : null,
          product_desc: listing ? listing.description : null,
          product_category: listing ? listing.category : null,
          product_type: listing ? listing.type : null,
          product_image: listing ? listing.image_url : null,
          product_rating: listing ? listing.rating : null,
          
          shop_id: shop.id || video.shop_id,
          shop_name: shop.name || 'Unknown Shop',
          shop_handle: shop.handle || 'unknown',
          shop_avatar: shop.avatar_url || '',
          shop_bio: shop.bio || '',
          shop_location: shop.location || 'Kampala',
          shop_whatsapp: shop.whatsapp_number || '256700000000',
          shop_verified: shop.is_verified || false,
          shop_followers: shop.followers_count || 0,
          shop_likes: shop.likes_count || 0,
          shop_rating: shop.rating || 5.0
        });
      });
      rows.reverse();
      return createResult(rows);
    }

    // 7. Insert listing
    if (sql.includes('INSERT INTO listings') && sql.includes('RETURNING *')) {
      const newListing = {
        id: generateUUID(),
        shop_id: params[0],
        title: params[1],
        description: params[2],
        price: params[3],
        category: params[4],
        type: params[5],
        image_url: params[6],
        rating: 5.0,
        reviews_count: 0,
        created_at: new Date().toISOString()
      };
      data.listings.push(newListing);
      writeData(data);
      return createResult([newListing]);
    }

    // 8. Delete listing
    if (sql.includes('DELETE FROM listings WHERE id = $1')) {
      const listingId = params[0];
      const listingIndex = data.listings.findIndex(l => l.id === listingId);
      let deletedListing = null;
      if (listingIndex !== -1) {
        deletedListing = data.listings.splice(listingIndex, 1)[0];
        data.videos = data.videos.filter(v => v.listing_id !== listingId);
        writeData(data);
      }
      return createResult(deletedListing ? [deletedListing] : []);
    }

    // 9. Insert video
    if (sql.includes('INSERT INTO videos') && sql.includes('RETURNING *')) {
      const newVideo = {
        id: generateUUID(),
        shop_id: params[0],
        listing_id: params[1],
        bunny_video_id: params[2],
        caption: params[3],
        tags: params[4] || [],
        likes_count: 0,
        comments_count: 0,
        shares_count: 0,
        created_at: new Date().toISOString()
      };
      data.videos.push(newVideo);
      writeData(data);
      return createResult([newVideo]);
    }

    // 10. Fetch incoming orders for shop dashboard
    if (sql.includes('SELECT o.*, l.title AS product_title FROM orders o')) {
      const shopId = params[0];
      const foundOrders = data.orders.filter(o => o.shop_id === shopId).map(order => {
        const listing = data.listings.find(l => l.id === order.listing_id) || {};
        return {
          ...order,
          product_title: listing.title || 'Deleted Item'
        };
      });
      foundOrders.reverse();
      return createResult(foundOrders);
    }

    // 11. Insert new order
    if (sql.includes('INSERT INTO orders') && sql.includes('RETURNING *')) {
      const newOrder = {
        id: generateUUID(),
        shop_id: params[0],
        listing_id: params[1],
        buyer_name: params[2],
        buyer_phone: params[3],
        quantity: params[4],
        total_amount: params[5],
        status: params[6] || 'pending',
        created_at: new Date().toISOString()
      };
      data.orders.push(newOrder);
      writeData(data);
      return createResult([newOrder]);
    }

    // 12. Update order status
    if (sql.includes('UPDATE orders SET status = $1 WHERE id = $2')) {
      const status = params[0];
      const orderId = params[1];
      const orderIndex = data.orders.findIndex(o => o.id === orderId);
      let updatedOrder = null;
      if (orderIndex !== -1) {
        data.orders[orderIndex].status = status;
        updatedOrder = data.orders[orderIndex];
        writeData(data);
      }
      return createResult(updatedOrder ? [updatedOrder] : []);
    }

    console.warn(`[Local JSON DB] UNHANDLED SQL QUERY FALLBACK: "${sql.slice(0, 50)}"`);
    return createResult([]);
  }
};
