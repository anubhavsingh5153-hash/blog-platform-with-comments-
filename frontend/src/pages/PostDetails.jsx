import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import CommentSection from '../components/CommentSection';

const PostDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [scrollProgress, setScrollProgress] = useState(0);

  // Monitor scroll for the progress indicator
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight <= 0) {
        setScrollProgress(0);
        return;
      }
      const scrollPosition = window.pageYOffset;
      const progress = (scrollPosition / totalHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [post]);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Post not found.');
          }
          throw new Error('Failed to retrieve post details.');
        }
        const data = await response.json();
        setPost(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this post? This will also delete all comments.')) {
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        addToast('Article deleted successfully', 'success');
        navigate('/');
      } else {
        const data = await response.json();
        addToast(data.error || 'Failed to delete post.', 'error');
      }
    } catch (err) {
      console.error('Delete post error:', err);
      addToast('Network error deleting post.', 'error');
    }
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Immersive layout parser to support basic formatting in content (lists, quotes, subheads)
  const parseContentLayout = (content) => {
    if (!content) return [];
    
    // Split into paragraphs (double line-break)
    const paragraphs = content.split('\n\n');

    return paragraphs.map((block, index) => {
      const trimmedBlock = block.trim();

      // Parse blockquote: > line
      if (trimmedBlock.startsWith('>')) {
        const quoteText = trimmedBlock.replace(/^>\s*/, '');
        return (
          <blockquote key={index} className="parsed-blockquote">
            {quoteText}
          </blockquote>
        );
      }

      // Parse headers: ### or #### line
      if (trimmedBlock.startsWith('###')) {
        const headerText = trimmedBlock.replace(/^###+\s*/, '');
        return (
          <h4 key={index} className="parsed-h4">
            {headerText}
          </h4>
        );
      }

      // Parse bullet points: - item or * item
      if (trimmedBlock.startsWith('-') || trimmedBlock.startsWith('*')) {
        const listItems = trimmedBlock.split('\n').map((item, itemIdx) => {
          const cleanItem = item.replace(/^[-*]\s*/, '');
          return (
            <li key={itemIdx} className="parsed-list-item">
              {cleanItem}
            </li>
          );
        });
        return (
          <ul key={index} className="parsed-list">
            {listItems}
          </ul>
        );
      }

      // Standard paragraphs
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

  if (loading) {
    return (
      <div className="details-loading-container fade-in">
        <div className="spinner"></div>
        <p>Polishing layout, gathering words...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="glass-card error-details-card fade-in">
        <h3>Oops! Article Not Found</h3>
        <p>{error || 'The post you are trying to view does not exist or has been deleted.'}</p>
        <Link to="/" className="btn-primary mt-4">
          Back to Articles
        </Link>
      </div>
    );
  }

  const isAuthor = user && post.author_id === user.id;

  return (
    <article className="post-details-container fade-in">
      {/* Dynamic Scroll Progress Bar */}
      <div className="scroll-progress-container">
        <div 
          className="scroll-progress-bar" 
          style={{ width: `${scrollProgress}%` }}
        ></div>
      </div>

      {/* Back button */}
      <Link to="/" className="back-link">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        Back to Feed
      </Link>

      <div className="glass-card post-article-card">
        {/* Post Title */}
        <header className="article-header">
          <div className="article-meta">
            <span className="author-name">By {post.author_name}</span>
            <span className="meta-separator">•</span>
            <time className="published-date">{formatDate(post.created_at)}</time>
          </div>
          <h1 className="article-title">{post.title}</h1>

          {/* Author CRUD actions */}
          {isAuthor && (
            <div className="author-actions-bar">
              <Link to={`/posts/${post.id}/edit`} className="btn-secondary btn-sm-action">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z"></path></svg>
                Edit Post
              </Link>
              <button onClick={handleDelete} className="btn-danger btn-sm-action">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                Delete
              </button>
            </div>
          )}
        </header>

        {/* Post content parsed layout */}
        <div className="article-body">
          {parseContentLayout(post.content)}
        </div>
      </div>

      {/* Comments section */}
      <CommentSection postId={post.id} postAuthorId={post.author_id} />

      <style>{`
        .post-details-container {
          display: flex;
          flex-direction: column;
          max-width: 820px;
          margin: 0 auto;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 24px;
          font-family: var(--font-heading);
          font-weight: 600;
          color: var(--text-secondary);
          align-self: flex-start;
        }

        .back-link:hover {
          color: var(--accent-primary);
          transform: translateX(-4px);
        }

        .post-article-card {
          padding: 44px;
          overflow: hidden;
        }

        .article-header {
          border-bottom: 1px solid var(--border-glass);
          padding-bottom: 24px;
          margin-bottom: 34px;
        }

        .article-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          color: var(--text-muted);
          margin-bottom: 12px;
        }

        .article-meta .author-name {
          font-weight: 600;
          color: var(--accent-secondary);
        }

        .article-title {
          font-size: 2.5rem;
          line-height: 1.25;
          font-weight: 800;
        }

        .author-actions-bar {
          display: flex;
          gap: 12px;
          margin-top: 20px;
        }

        .btn-sm-action {
          padding: 6px 14px;
          font-size: 0.85rem;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .article-body {
          font-size: 1.1rem;
          color: var(--text-primary);
          line-height: 1.85;
          letter-spacing: -0.1px;
        }

        .article-paragraph {
          margin-bottom: 26px;
        }

        .details-loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 100px 0;
          gap: 16px;
          color: var(--text-secondary);
        }

        .error-details-card {
          padding: 60px 40px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .mt-4 {
          margin-top: 16px;
        }

        @media (max-width: 768px) {
          .post-article-card {
            padding: 26px;
          }
          .article-title {
            font-size: 1.8rem;
          }
        }
      `}</style>
    </article>
  );
};

export default PostDetails;
