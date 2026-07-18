import React, { useState, useEffect } from 'react';
import PostCard from '../components/PostCard';
import { API_URL } from '../config';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('latest'); // latest, oldest, popular
  const [retrying, setRetrying] = useState(false);

  const fetchPosts = async (isRetry = false) => {
    if (isRetry) {
      setRetrying(true);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const response = await fetch(`${API_URL}/posts`);
      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }
      const data = await response.json();
      setPosts(data);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError({
        message: 'Unable to retrieve blog articles.',
        details: err.message,
        url: `${API_URL}/posts`
      });
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Filter and sort logic
  const filteredPosts = posts
    .filter((post) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        post.title.toLowerCase().includes(searchLower) ||
        post.content.toLowerCase().includes(searchLower) ||
        post.author_name.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'latest') {
        return new Date(b.created_at) - new Date(a.created_at);
      } else if (sortBy === 'oldest') {
        return new Date(a.created_at) - new Date(b.created_at);
      } else if (sortBy === 'popular') {
        return (b.comment_count || 0) - (a.comment_count || 0);
      }
      return 0;
    });

  return (
    <div className="home-page-container fade-in">
      {/* Hero Section */}
      <section className="hero-section glass-card">
        <h1 className="hero-title">
          Where Ideas Flow <span className="gradient-text font-black">Freely</span>
        </h1>
        <p className="hero-subtitle">
          Explore articles on technology, design, life, and developer experiences.
          Share your voice, write, and engage with the community.
        </p>
      </section>

      {/* Control Bar (Search & Filter) */}
      <div className="control-bar glass-card">
        <div className="search-box">
          <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search articles by title, author, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="clear-search-btn">
              ✕
            </button>
          )}
        </div>

        <div className="filter-options">
          <label className="filter-label">Sort by:</label>
          <select
            className="filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="latest">Latest</option>
            <option value="oldest">Oldest</option>
            <option value="popular">Most Commented</option>
          </select>
        </div>
      </div>

      {/* Main Feed */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Curating the latest articles...</p>
        </div>
      ) : error ? (
        <div className="glass-card error-diagnostic-card">
          <div className="error-icon-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="error-svg">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          <h3>Connection Error</h3>
          <p className="error-message-text">{error.message}</p>
          
          <div className="error-explanation">
            <p><strong>Possible Reasons:</strong></p>
            <ul>
              <li><strong>Cold Start:</strong> Render free-tier databases and backends spin down after 15 minutes of inactivity. It can take up to 60 seconds to wake back up.</li>
              <li><strong>API URL Configuration:</strong> The frontend might be pointing to a different or outdated Render deployment.</li>
              <li><strong>Local Offline:</strong> If testing locally, check that your backend server is actually running.</li>
            </ul>
          </div>

          <div className="diagnostic-info-box">
            <details>
              <summary>Show Technical Diagnostic Details</summary>
              <div className="diagnostic-content">
                <p><strong>Request URL:</strong> <code>{error.url}</code></p>
                <p><strong>Error Details:</strong> <code>{error.details}</code></p>
                <p><strong>Hostname:</strong> <code>{window.location.hostname}</code></p>
                <p className="diagnostic-tip">Tip: If this URL is incorrect, set the <code>VITE_API_URL</code> environment variable in your Vercel project settings to your backend Render URL (e.g. <code>https://your-app.onrender.com/api</code>).</p>
              </div>
            </details>
          </div>

          <button 
            className="btn btn-primary retry-btn" 
            onClick={() => fetchPosts(true)}
            disabled={retrying}
            style={{ marginTop: '10px' }}
          >
            {retrying ? (
              <>
                <div className="spinner-mini"></div>
                Waking up server...
              </>
            ) : (
              'Retry Connection'
            )}
          </button>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="glass-card empty-feed-card">
          <h3>No articles found</h3>
          <p>
            {searchQuery 
              ? "We couldn't find any articles matching your search criteria. Try a different query!"
              : "The blog is currently empty. Be the first to share an article!"}
          </p>
        </div>
      ) : (
        <div className="posts-grid">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      <style>{`
        .home-page-container {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .hero-section {
          padding: 60px 40px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          position: relative;
          overflow: hidden;
        }

        .hero-section::before {
          content: '';
          position: absolute;
          width: 300px;
          height: 300px;
          background: rgba(99, 102, 241, 0.08);
          filter: blur(80px);
          border-radius: 50%;
          top: -100px;
          left: -50px;
          pointer-events: none;
        }

        .hero-title {
          font-size: 2.8rem;
          font-weight: 800;
          letter-spacing: -0.5px;
          line-height: 1.15;
        }

        .hero-subtitle {
          font-size: 1.15rem;
          color: var(--text-secondary);
          max-width: 680px;
          line-height: 1.6;
        }

        .font-black {
          font-weight: 800;
        }

        /* Control Bar styling */
        .control-bar {
          padding: 16px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }

        .search-box {
          position: relative;
          flex-grow: 1;
          max-width: 600px;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 16px;
          color: var(--text-muted);
          pointer-events: none;
        }

        .search-input {
          width: 100%;
          padding: 12px 16px 12px 48px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-glass);
          border-radius: var(--border-radius-md);
          color: var(--text-primary);
          font-size: 0.95rem;
          transition: var(--transition-smooth);
        }

        [data-theme='light'] .search-input {
          background: rgba(0, 0, 0, 0.01);
        }

        .search-input:focus {
          outline: none;
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 3px var(--accent-glow);
          background: rgba(255, 255, 255, 0.05);
        }

        .clear-search-btn {
          position: absolute;
          right: 16px;
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          font-size: 0.9rem;
          padding: 4px;
        }

        .clear-search-btn:hover {
          color: var(--text-primary);
        }

        .filter-options {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .filter-label {
          font-family: var(--font-heading);
          font-weight: 500;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .filter-select {
          background: var(--bg-secondary);
          border: 1px solid var(--border-glass);
          color: var(--text-primary);
          padding: 10px 16px;
          border-radius: var(--border-radius-md);
          outline: none;
          cursor: pointer;
          font-size: 0.9rem;
          transition: var(--transition-smooth);
        }

        .filter-select:focus {
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 3px var(--accent-glow);
        }

        /* Loading Spinner */
        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 0;
          gap: 16px;
          color: var(--text-secondary);
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

        .home-error-banner {
          margin-top: 20px;
        }

        .empty-feed-card {
          padding: 60px;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .empty-feed-card h3 {
          font-size: 1.6rem;
          color: var(--accent-secondary);
        }

        .empty-feed-card p {
          color: var(--text-secondary);
          max-width: 480px;
          margin: 0 auto;
        }

        @media (max-width: 768px) {
          .hero-section {
            padding: 40px 20px;
          }
          .hero-title {
            font-size: 2.1rem;
          }
          .control-bar {
            flex-direction: column;
            align-items: stretch;
          }
          .filter-options {
            justify-content: space-between;
          }
        }

        /* Error Diagnostic Card styling */
        .error-diagnostic-card {
          padding: 40px;
          text-align: center;
          max-width: 600px;
          margin: 40px auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          border: 1px solid rgba(239, 68, 68, 0.2);
          box-shadow: 0 12px 40px rgba(239, 68, 68, 0.08);
          background: rgba(14, 20, 34, 0.45);
        }

        .error-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          margin-bottom: 8px;
        }

        .error-svg {
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }

        .error-diagnostic-card h3 {
          font-size: 1.6rem;
          color: #f8fafc;
          margin: 0;
        }

        .error-message-text {
          color: var(--text-secondary);
          font-size: 1.05rem;
          margin: 0;
        }

        .error-explanation {
          text-align: left;
          width: 100%;
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid var(--border-glass);
          padding: 20px;
          border-radius: var(--border-radius-md);
          font-size: 0.9rem;
          line-height: 1.6;
        }

        .error-explanation p {
          margin-top: 0;
          margin-bottom: 10px;
          color: var(--text-primary);
        }

        .error-explanation ul {
          margin: 0;
          padding-left: 20px;
          color: var(--text-secondary);
        }

        .error-explanation li {
          margin-bottom: 8px;
        }

        .error-explanation li:last-child {
          margin-bottom: 0;
        }

        .diagnostic-info-box {
          width: 100%;
          text-align: left;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid var(--border-glass);
          border-radius: var(--border-radius-md);
          font-size: 0.85rem;
          color: var(--text-secondary);
          box-sizing: border-box;
        }

        .diagnostic-info-box details {
          padding: 12px 16px;
        }

        .diagnostic-info-box summary {
          cursor: pointer;
          font-weight: 600;
          user-select: none;
          color: var(--text-primary);
          outline: none;
        }

        .diagnostic-content {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid var(--border-glass);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .diagnostic-content p {
          margin: 0;
        }

        .diagnostic-content code {
          background: rgba(255, 255, 255, 0.06);
          padding: 2px 6px;
          border-radius: 4px;
          font-family: monospace;
          color: var(--accent-secondary);
          word-break: break-all;
        }

        .diagnostic-tip {
          font-style: italic;
          color: var(--text-muted);
          margin-top: 4px !important;
          line-height: 1.4;
        }

        .retry-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          font-size: 0.95rem;
          font-weight: 600;
          border-radius: var(--border-radius-md);
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .spinner-mini {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Home;
