import React from 'react';
import { Link } from 'react-router-dom';

const PostCard = ({ post }) => {
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Truncate preview excerpt
  const getExcerpt = (text, maxLength = 120) => {
    if (!text) return '';
    // Strip simple markdown tags for summary representation
    const cleanText = text.replace(/[#*`_>]/g, '');
    if (cleanText.length <= maxLength) return cleanText;
    return cleanText.slice(0, maxLength).trim() + '...';
  };

  // Calculate dynamic reading time
  const calculateReadingTime = (text) => {
    if (!text) return 1;
    const words = text.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200)); // Average reading speed: 200 words per minute
  };

  const readingTime = calculateReadingTime(post.content);

  return (
    <article className="glass-card post-card fade-in">
      <div className="card-accent-line"></div>
      <div className="post-card-content">
        <div className="post-meta">
          <span className="post-author-avatar">
            {post.author_name.slice(0, 1).toUpperCase()}
          </span>
          <span className="post-author">By {post.author_name}</span>
          <span className="meta-separator">•</span>
          <time className="post-date">{formatDate(post.created_at)}</time>
        </div>

        <h3 className="post-title">
          <Link to={`/posts/${post.id}`}>{post.title}</Link>
        </h3>

        <p className="post-excerpt">{getExcerpt(post.content)}</p>

        <div className="post-card-footer">
          <Link to={`/posts/${post.id}`} className="read-more-link">
            Read Article
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="arrow-icon"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </Link>

          <div className="card-stats">
            <span className="reading-time-tag" title="Calculated reading time">
              ⏱️ {readingTime} min read
            </span>
            <span className="comments-count">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="comment-icon"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              {post.comment_count || 0}
            </span>
          </div>
        </div>
      </div>

      <style>{`
        .post-card {
          position: relative;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          height: 100%;
        }

        .card-accent-line {
          height: 4px;
          width: 100%;
          background: var(--accent-gradient);
          position: absolute;
          top: 0;
          left: 0;
        }

        .post-card-content {
          padding: 26px;
          display: flex;
          flex-direction: column;
          height: 100%;
          justify-content: space-between;
          flex-grow: 1;
        }

        .post-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-bottom: 14px;
        }

        .post-author-avatar {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid var(--border-glass-hover);
          color: var(--accent-secondary);
          font-size: 0.7rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        [data-theme='light'] .post-author-avatar {
          background: rgba(0, 0, 0, 0.04);
        }

        .post-author {
          font-weight: 600;
          color: var(--accent-secondary);
        }

        .post-title {
          font-size: 1.35rem;
          margin-bottom: 12px;
          font-weight: 700;
          line-height: 1.3;
        }

        .post-title a:hover {
          color: var(--accent-primary);
        }

        .post-excerpt {
          font-size: 0.95rem;
          color: var(--text-secondary);
          margin-bottom: 24px;
          flex-grow: 1;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.6;
        }

        .post-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid var(--border-glass);
          padding-top: 16px;
          margin-top: auto;
        }

        .read-more-link {
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 0.9rem;
          color: var(--accent-primary);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .read-more-link:hover {
          color: var(--accent-secondary);
        }

        .read-more-link:hover .arrow-icon {
          transform: translateX(4px);
        }

        .arrow-icon {
          transition: var(--transition-smooth);
        }

        .card-stats {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .reading-time-tag {
          font-size: 0.8rem;
          color: var(--text-muted);
          background: rgba(255, 255, 255, 0.02);
          padding: 2px 8px;
          border-radius: 20px;
          border: 1px solid var(--border-glass);
        }

        [data-theme='light'] .reading-time-tag {
          background: rgba(0, 0, 0, 0.02);
        }

        .comments-count {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .comment-icon {
          stroke: var(--text-muted);
        }
      `}</style>
    </article>
  );
};

export default PostCard;
