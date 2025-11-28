const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: Number,
    default: Date.now
  }
});

const PostSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  mood: String,
  tags: [String],
  category: String,
  images: [String], // Storing Base64 strings for simplicity in this demo
  aiSummary: String,
  colorTheme: {
    type: String,
    enum: ['red', 'blue', 'green', 'yellow', 'purple'],
    default: 'yellow'
  },
  comments: [CommentSchema],
  createdAt: {
    type: Number, // Using timestamp to match frontend type
    default: Date.now
  },
  updatedAt: {
    type: Number,
    default: Date.now
  }
});

module.exports = mongoose.model('Post', PostSchema);