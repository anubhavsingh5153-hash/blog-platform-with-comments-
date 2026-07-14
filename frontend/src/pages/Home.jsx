import React, { useState, useEffect } from 'react';
import PostCard from '../components/PostCard';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('latest'); // latest, oldest, popular

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/posts');
        if (!response.ok) {
          throw new Error('Failed to retrieve posts.');
        }
        const data = await response.json();
        setPosts(data);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('Unable to load articles. Please check back later.');
      } finally {
        setLoading(false);
      }
    };

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
        <div className="alert-banner alert-error home-error-banner">{error}</div>
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
      `}</style>
    </div>
  );
};

export default Home;
