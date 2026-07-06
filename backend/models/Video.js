const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  userRole: { type: String, default: 'user' },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const VideoSchema = new mongoose.Schema({
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', default: null },
  bunnyVideoId: { type: String, required: true },
  caption: { type: String, required: true },
  tags: { type: [String], default: [] },
  likesCount: { type: Number, default: 0 },
  commentsCount: { type: Number, default: 0 },
  sharesCount: { type: Number, default: 0 },
  comments: { type: [CommentSchema], default: [] },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Video', VideoSchema);
