const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Post = require('../models/Post');

// Get all posts for current user
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.user.id }).sort({ createdAt: -1 });
    // Transform _id to id for frontend compatibility
    const formattedPosts = posts.map(post => ({
      ...post.toObject(),
      id: post._id,
      _id: undefined
    }));
    res.json(formattedPosts);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Create a post
router.post('/', auth, async (req, res) => {
  try {
    const newPost = new Post({
      ...req.body,
      userId: req.user.id,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    const post = await newPost.save();
    res.json({ ...post.toObject(), id: post._id, _id: undefined });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Update a post
router.put('/:id', auth, async (req, res) => {
  try {
    let post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const updates = {
      ...req.body,
      updatedAt: Date.now()
    };

    post = await Post.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true });
    res.json({ ...post.toObject(), id: post._id, _id: undefined });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Delete a post
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post removed' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Add a comment to a post
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: 'Post not found' });

    const newComment = {
      userId: req.user.id,
      username: req.user.username,
      content: req.body.content,
      createdAt: Date.now()
    };

    post.comments.push(newComment);
    await post.save();

    const savedComment = post.comments[post.comments.length - 1];
    res.json({ ...savedComment.toObject(), id: savedComment._id, _id: undefined });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Delete a comment
router.delete('/:id/comments/:commentId', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (comment.userId.toString() !== req.user.id && post.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    comment.deleteOne();
    await post.save();

    res.json({ message: 'Comment removed' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;