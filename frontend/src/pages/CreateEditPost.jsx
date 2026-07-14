import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { API_URL } from '../config';

const CreateEditPost = () => {
  const { id } = useParams(); // Exists if we are in EDIT mode
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { addToast } = useToast();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Active tab state: 'write' or 'preview'
  const [activeTab, setActiveTab] = useState('write');

  // Protect route
  useEffect(() => {
    if (!authLoading && !user) {
      addToast('Please login to access the article editor', 'warning');
      navigate(`/auth?mode=login&redirect=${isEditMode ? `/posts/${id}/edit` : '/create-post'}`);
    }
  }, [user, authLoading, navigate, isEditMode, id, addToast]);

  // Load existing post in Edit Mode
  useEffect(() => {
    if (!isEditMode) return;

    const fetchPost = async () => {
      try {
        const response = await fetch(`${API_URL}/posts/${id}`);
        if (!response.ok) {
          throw new Error('Failed to retrieve post details.');
        }
        const data = await response.json();

        // Security check: Only author can edit
        if (user && data.author_id !== user.id) {
          setError('Forbidden: You do not own this post.');
          addToast('Access denied: You can only edit your own posts.', 'error');
          return;
        }

        setTitle(data.title);
        setContent(data.content);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Error loading post.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchPost();
    }
  }, [id, isEditMode, user, addToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      addToast('Please fill in both the title and body content.', 'warning');
      return;
    }

    setSubmitting(true);
    setError('');

    const token = localStorage.getItem('token');
    const url = isEditMode ? `${API_URL}/posts/${id}` : `${API_URL}/posts`;
    const method = isEditMode ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, content })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit post.');
      }

      addToast(
        isEditMode ? 'Article updated successfully!' : 'Article published successfully!',
        'success'
      );
      // Success: redirect to post view
      navigate(`/posts/${data.id}`);
    } catch (err) {
      console.error('Submit post error:', err);
      setError(err.message);
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Basic layout parser for the live preview page
  const parsePreviewContent = (text) => {
    if (!text) return <p className="preview-empty-text">Draft is empty. Type in the Edit tab to see formatting.</p>;
    
    const paragraphs = text.split('\n\n');

    return paragraphs.map((block, index) => {
      const trimmedBlock = block.trim();

      if (trimmedBlock.startsWith('>')) {
        return (
          <blockquote key={index} className="parsed-blockquote">
            {trimmedBlock.replace(/^>\s*/, '')}
          </blockquote>
        );
      }

      if (trimmedBlock.startsWith('###')) {
        return (
          <h4 key={index} className="parsed-h4">
            {trimmedBlock.replace(/^###+\s*/, '')}
          </h4>
        );
      }

      if (trimmedBlock.startsWith('-') || trimmedBlock.startsWith('*')) {
        return (
          <ul key={index} className="parsed-list">
            {trimmedBlock.split('\n').map((item, itemIdx) => (
              <li key={itemIdx} className="parsed-list-item">
                {item.replace(/^[-*]\s*/, '')}
              </li>
            ))}
          </ul>
        );
      }

      return (
        <p key={index} className="article-paragraph">
          {block.split('\n').map((line, lineIndex) => (
            <React.Fragment key={lineIndex}>
              {line}
              {lineIndex < block.split('\n').length - 1 && <br />}
            </React.Fragment>
          ))}
        </p>
      );
    });
  };

  const calculateReadingTime = (text) => {
    if (!text) return 0;
    const words = text.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  };

  if (authLoading || loading) {
    return (
      <div className="form-loading-container fade-in">
        <div className="spinner"></div>
        <p>Loading editor environment...</p>
      </div>
    );
  }

  if (error && isEditMode && !title) {
    return (
      <div className="glass-card error-form-card fade-in">
        <h3>Access Denied</h3>
        <p>{error}</p>
        <Link to="/" className="btn-primary mt-4">
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="create-edit-page fade-in">
      <Link to={isEditMode ? `/posts/${id}` : '/'} className="back-link">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        Cancel and Go Back
      </Link>

      <div className="glass-card form-wrapper-card">
        <h2 className="form-title">
          {isEditMode ? 'Edit Article' : 'Draft New Article'}
        </h2>
        <p className="form-subtitle">
          {isEditMode 
            ? 'Refine your words, fix typos, or append new updates.' 
            : 'Share your knowledge, findings, or stories with the world.'}
        </p>

        {/* Tab Selection */}
        <div className="editor-tabs-container">
          <button
            type="button"
            className={`editor-tab-btn ${activeTab === 'write' ? 'active-tab' : ''}`}
            onClick={() => setActiveTab('write')}
          >
            ✏️ Edit Draft
          </button>
          <button
            type="button"
            className={`editor-tab-btn ${activeTab === 'preview' ? 'active-tab' : ''}`}
            onClick={() => setActiveTab('preview')}
          >
            👁️ Live Preview
          </button>
        </div>

        {error && <div className="alert-banner alert-error">{error}</div>}

        {activeTab === 'write' ? (
          <form onSubmit={handleSubmit} className="editor-form">
            <div className="form-group">
              <label className="form-label" htmlFor="post-title">Article Title</label>
              <input
                type="text"
                id="post-title"
                className="form-input"
                placeholder="e.g. Mastering Modern Vanilla CSS Styling"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={submitting}
                maxLength="100"
                required
              />
              <span className="input-helper-text">{title.length}/100 characters</span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="post-content">Body Content</label>
              <textarea
                id="post-content"
                className="form-input form-textarea main-editor-textarea"
                placeholder="Write your article body here... Supports headers (###), lists (- item), blockquotes (> quote). Separate paragraphs with double-newlines."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={submitting}
                required
              ></textarea>
              <div className="input-helper-row">
                <span className="formatting-tips">
                  💡 Tip: Start lines with <code>&gt;</code> for blockquotes or <code>###</code> for subheaders.
                </span>
                <span className="input-helper-text">
                  {content.split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
            </div>

            <div className="editor-form-actions">
              <button
                type="submit"
                className="btn-primary btn-submit"
                disabled={submitting}
              >
                {submitting 
                  ? 'Saving changes...' 
                  : isEditMode ? 'Update Article' : 'Publish Article'}
              </button>
              <Link to={isEditMode ? `/posts/${id}` : '/'} className="btn-secondary">
                Cancel
              </Link>
            </div>
          </form>
        ) : (
          <div className="live-preview-container">
            <div className="preview-header">
              <div className="preview-meta">
                <span className="author-badge">
                  {user ? user.username.slice(0, 1).toUpperCase() : 'U'}
                </span>
                <span className="author-name">By {user?.username || 'You'}</span>
                <span className="meta-separator">•</span>
                <time className="published-date">Today (Draft)</time>
                <span className="meta-separator">•</span>
                <span className="read-time">⏱️ {calculateReadingTime(content)} min read</span>
              </div>
              <h1 className="preview-title">{title || 'Untitled Draft'}</h1>
            </div>

            <div className="preview-body article-body">
              {parsePreviewContent(content)}
            </div>

            <div className="editor-form-actions preview-actions">
              <button
                onClick={handleSubmit}
                className="btn-primary btn-submit"
                disabled={submitting || !title.trim() || !content.trim()}
              >
                {submitting 
                  ? 'Publishing...' 
                  : isEditMode ? 'Update Article Now' : 'Publish Article Now'}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setActiveTab('write')}
              >
                Back to Editor
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .create-edit-page {
          max-width: 840px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
        }

        .form-wrapper-card {
          padding: 40px;
        }

        .form-title {
          font-size: 2rem;
          margin-bottom: 8px;
        }

        .form-subtitle {
          color: var(--text-secondary);
          margin-bottom: 24px;
          font-size: 0.95rem;
        }

        .input-helper-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 6px;
        }

        .formatting-tips {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .input-helper-text {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .main-editor-textarea {
          min-height: 320px;
          line-height: 1.6;
        }

        .editor-form-actions {
          display: flex;
          gap: 16px;
          margin-top: 30px;
          border-top: 1px solid var(--border-glass);
          padding-top: 24px;
        }

        /* Preview styles */
        .live-preview-container {
          animation: fadeIn 0.3s ease-out;
        }

        .preview-header {
          border-bottom: 1px solid var(--border-glass);
          padding-bottom: 20px;
          margin-bottom: 24px;
        }

        .preview-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-bottom: 12px;
        }

        .preview-meta .author-badge {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--accent-gradient);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 750;
        }

        .preview-meta .author-name {
          font-weight: 600;
          color: var(--accent-secondary);
        }

        .preview-title {
          font-size: 2.2rem;
          line-height: 1.3;
          font-weight: 800;
        }

        .preview-body {
          font-size: 1.1rem;
          color: var(--text-primary);
          line-height: 1.85;
          min-height: 200px;
        }

        .preview-empty-text {
          font-style: italic;
          color: var(--text-muted);
          text-align: center;
          padding: 60px 0;
        }

        .preview-actions {
          margin-top: 40px;
        }

        .form-loading-container, .error-form-card {
          max-width: 840px;
          margin: 0 auto;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 100px 40px;
          gap: 16px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--border-glass);
          border-top-color: var(--accent-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .form-wrapper-card {
            padding: 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default CreateEditPost;
