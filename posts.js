const express = require('express');
const router = express.Router();
const { query } = require('../database');
const authMiddleware = require('../middleware/auth');

// GET all posts with author username and comment count
router.get('/', async (req, res) => {
  try {
    const posts = await query.all(`
      SELECT p.id, p.title, p.content, p.author_id, p.created_at, p.updated_at,
             u.username AS author_name,
             COUNT(c.id) AS comment_count
      FROM posts p
      JOIN users u ON p.author_id = u.id
      LEFT JOIN comments c ON p.id = c.post_id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `);
    res.status(200).json(posts);
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).json({ error: 'Internal server error fetching posts.' });
  }
});

// GET single post with author name
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const post = await query.get(`
      SELECT p.*, u.username AS author_name
      FROM posts p
      JOIN users u ON p.author_id = u.id
      WHERE p.id = ?
    `, [id]);

    if (!post) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    res.status(200).json(post);
  } catch (err) {
    console.error('Error fetching single post:', err);
    res.status(500).json({ error: 'Internal server error fetching post.' });
  }
});

// CREATE a new post (Protected)
router.post('/', authMiddleware, async (req, res) => {
  const { title, content } = req.body;
  const authorId = req.user.id;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required.' });
  }

  try {
    const result = await query.run(
      'INSERT INTO posts (title, content, author_id) VALUES (?, ?, ?)',
      [title, content, authorId]
    );

    const newPost = await query.get(`
      SELECT p.*, u.username AS author_name
      FROM posts p
      JOIN users u ON p.author_id = u.id
      WHERE p.id = ?
    `, [result.id]);

    res.status(201).json(newPost);
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ error: 'Internal server error creating post.' });
  }
});

// UPDATE an existing post (Protected, Author only)
router.put('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  const userId = req.user.id;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required.' });
  }

  try {
    // Check if post exists and belongs to current user
    const post = await query.get('SELECT * FROM posts WHERE id = ?', [id]);

    if (!post) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    if (post.author_id !== userId) {
      return res.status(403).json({ error: 'Forbidden: You can only edit your own posts.' });
    }

    // Update post and refresh timestamp
    await query.run(
      'UPDATE posts SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [title, content, id]
    );

    const updatedPost = await query.get(`
      SELECT p.*, u.username AS author_name
      FROM posts p
      JOIN users u ON p.author_id = u.id
      WHERE p.id = ?
    `, [id]);

    res.status(200).json(updatedPost);
  } catch (err) {
    console.error('Error updating post:', err);
    res.status(500).json({ error: 'Internal server error updating post.' });
  }
});

// DELETE a post (Protected, Author only)
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    // Check if post exists
    const post = await query.get('SELECT * FROM posts WHERE id = ?', [id]);

    if (!post) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    if (post.author_id !== userId) {
      return res.status(403).json({ error: 'Forbidden: You can only delete your own posts.' });
    }

    await query.run('DELETE FROM posts WHERE id = ?', [id]);

    res.status(200).json({ message: 'Post deleted successfully.' });
  } catch (err) {
    console.error('Error deleting post:', err);
    res.status(500).json({ error: 'Internal server error deleting post.' });
  }
});

module.exports = router;
