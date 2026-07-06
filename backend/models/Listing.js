const mongoose = require('mongoose');

const ListingSchema = new mongoose.Schema({
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  type: { type: String, enum: ['product', 'service'], default: 'product' },
  imageUrl: { type: String, default: '' },
  rating: { type: Number, default: 5.0 },
  reviewsCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Listing', ListingSchema);
