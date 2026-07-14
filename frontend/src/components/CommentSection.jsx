import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CommentSection = ({ postId, postAuthorId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`/api/comments/${postId}`);
        if (response.ok) {
          const data = await response.json();
          setComments(data);
        }
      } catch (err) {
        console.error('Error fetching comments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    setSubmitError('');

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/comments/${postId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit comment');
      }

      // Add new comment to top of list
      setComments((prev) => [data, ...prev]);
      setContent('');
    } catch (err) {
      console.error(err);
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Filter out the deleted comment
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete comment');
      }
    } catch (err) {
      console.error('Delete comment error:', err);
      alert('Network error deleting comment.');
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <section className="comments-section-container">
      <h3 className="comments-heading">
        Discussion ({comments.length})
      </h3>

      {/* Add comment Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="comment-form">
          {submitError && (
            <div className="alert-banner alert-error">{submitError}</div>
          )}
          <div className="form-group">
            <textarea
              className="form-input form-textarea comment-input-box"
              placeholder="Join the discussion... Share your thoughts."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows="3"
              disabled={submitting}
              maxLength="500"
            ></textarea>
            <div className="comment-form-actions">
              <span className="char-count">{content.length}/500</span>
              <button
                type="submit"
                className="btn-primary btn-sm"
                disabled={submitting || !content.trim()}
              >
                {submitting ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="glass-card login-prompt-card">
          <p>Want to join the conversation?</p>
          <Link to={`/auth?mode=login&redirect=/posts/${postId}`} className="btn-secondary">
            Sign In to Comment
          </Link>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="comments-loading">Loading discussion...</div>
      ) : comments.length === 0 ? (
        <div className="no-comments-prompt">
          No comments yet. Be the first to share your thoughts!
        </div>
      ) : (
        <div className="comments-list">
          {comments.map((comment) => {
            const isCommentAuthor = user && comment.author_id === user.id;
            const isPostAuthor = user && postAuthorId === user.id;
            const canDelete = isCommentAuthor || isPostAuthor;

            return (
              <div key={comment.id} className="comment-item glass-card fade-in">
                <div className="comment-header">
                  <div className="comment-user-info">
                    <span className="comment-user-badge">
                      {comment.author_name.slice(0, 2).toUpperCase()}
                    </span>
                    <div>
                      <span className="comment-author-name">{comment.author_name}</span>
                      {comment.author_id === postAuthorId && (
                        <span className="author-tag">Author</span>
                      )}
                      <time className="comment-time">{formatDate(comment.created_at)}</time>
                    </div>
                  </div>

                  {canDelete && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="comment-delete-btn"
                      title="Delete Comment"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                  )}
                </div>
                <div className="comment-body-content">
                  <p>{comment.content}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .comments-section-container {
          margin-top: 40px;
          border-top: 1px solid var(--border-glass);
          padding-top: 30px;
        }

        .comments-heading {
          font-size: 1.4rem;
          margin-bottom: 24px;
        }

        .comment-form {
          margin-bottom: 30px;
        }

        .comment-input-box {
          min-height: 80px;
          resize: none;
        }

        .comment-form-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 10px;
        }

        .char-count {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .btn-sm {
          padding: 8px 16px;
          font-size: 0.9rem;
        }

        .login-prompt-card {
          padding: 24px;
          text-align: center;
          margin-bottom: 30px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .login-prompt-card p {
          color: var(--text-secondary);
          font-weight: 500;
        }

        .comments-loading, .no-comments-prompt {
          text-align: center;
          padding: 40px 0;
          color: var(--text-secondary);
          font-style: italic;
        }

        .comments-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .comment-item {
          padding: 20px;
          border-radius: var(--border-radius-md);
        }

        .comment-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .comment-user-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .comment-user-badge {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05);
          color: var(--accent-secondary);
          border: 1px solid var(--border-glass-hover);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: 700;
        }

        [data-theme='light'] .comment-user-badge {
          background: rgba(0, 0, 0, 0.03);
        }

        .comment-author-name {
          font-weight: 600;
          font-size: 0.95rem;
          margin-right: 6px;
        }

        .author-tag {
          background: rgba(20, 184, 166, 0.1);
          color: var(--accent-secondary);
          font-size: 0.7rem;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
          margin-right: 8px;
          border: 1px solid rgba(20, 184, 166, 0.2);
        }

        .comment-time {
          font-size: 0.75rem;
          color: var(--text-muted);
          display: block;
        }

        .comment-delete-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 6px;
          border-radius: var(--border-radius-sm);
          transition: var(--transition-smooth);
        }

        .comment-delete-btn:hover {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
        }

        .comment-body-content {
          font-size: 0.95rem;
          color: var(--text-secondary);
          line-height: 1.5;
          word-break: break-word;
          white-space: pre-wrap;
        }
      `}</style>
    </section>
  );
};

export default CommentSection;
