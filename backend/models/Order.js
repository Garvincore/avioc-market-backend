const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', default: null },
  buyerName: { type: String, required: true },
  buyerPhone: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'delivered'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);
