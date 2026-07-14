const express = require('express');
const router = express.Router();
const { query } = require('../database');
const authMiddleware = require('../middleware/auth');

// GET all comments for a specific post
router.get('/:postId', async (req, res) => {
  const { postId } = req.params;

  try {
    const comments = await query.all(`
      SELECT c.id, c.content, c.post_id, c.author_id, c.created_at,
             u.username AS author_name
      FROM comments c
      JOIN users u ON c.author_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.created_at DESC
    `, [postId]);

    res.status(200).json(comments);
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ error: 'Internal server error fetching comments.' });
  }
});

// CREATE a comment for a post (Protected)
router.post('/:postId', authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;
  const authorId = req.user.id;

  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Comment content cannot be empty.' });
  }

  try {
    // Check if the post exists
    const post = await query.get('SELECT id FROM posts WHERE id = ?', [postId]);
    if (!post) {
      return res.status(404).json({ error: 'Post not found. Cannot comment.' });
    }

    // Insert comment
    const result = await query.run(
      'INSERT INTO comments (content, post_id, author_id) VALUES (?, ?, ?)',
      [content.trim(), postId, authorId]
    );

    // Retrieve full comment details with author username
    const newComment = await query.get(`
      SELECT c.*, u.username AS author_name
      FROM comments c
      JOIN users u ON c.author_id = u.id
      WHERE c.id = ?
    `, [result.id]);

    res.status(201).json(newComment);
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(500).json({ error: 'Internal server error adding comment.' });
  }
});

// DELETE a comment (Protected, Author only)
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    // Check if comment exists
    const comment = await query.get('SELECT * FROM comments WHERE id = ?', [id]);

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found.' });
    }

    // Allow deletion if the requester is either the comment author OR the post author
    const post = await query.get('SELECT author_id FROM posts WHERE id = ?', [comment.post_id]);
    
    const isCommentAuthor = comment.author_id === userId;
    const isPostAuthor = post && post.author_id === userId;

    if (!isCommentAuthor && !isPostAuthor) {
      return res.status(403).json({ error: 'Forbidden: You can only delete comments you wrote or comments on your own post.' });
    }

    await query.run('DELETE FROM comments WHERE id = ?', [id]);

    res.status(200).json({ message: 'Comment deleted successfully.' });
  } catch (err) {
    console.error('Error deleting comment:', err);
    res.status(500).json({ error: 'Internal server error deleting comment.' });
  }
});

module.exports = router;
