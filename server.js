require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { db } = require('./database'); // Trigger database creation

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors({
  origin: '*', // We can restrict this in production if needed
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json());

// Log incoming API calls
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

const fs = require('fs');
const distPath = path.join(__dirname, '../frontend/dist');

if (fs.existsSync(distPath)) {
  console.log(`[Static Serving] Production build folder found at ${distPath}. Serving compiled React assets...`);
  app.use(express.static(distPath));
  // Catch-all route to serve the built index.html for React Router
  app.get('*', (req, res, next) => {
    if (req.url.startsWith('/api')) {
      return next(); // Pass through to Express api endpoints
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  console.log('[Static Serving] No compiled React build found. Running in API-only dev server mode.');
  // Root helper page in development
  app.get('/', (req, res) => {
    res.status(200).send(`
      <html>
        <head>
          <title>InkFlow API // Active</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              background: #080c14;
              color: #f8fafc;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              text-align: center;
            }
            .card {
              background: rgba(14, 20, 34, 0.65);
              backdrop-filter: blur(20px);
              -webkit-backdrop-filter: blur(20px);
              padding: 40px;
              border-radius: 16px;
              border: 1px solid rgba(255, 255, 255, 0.08);
              box-shadow: 0 12px 40px rgba(0, 0, 0, 0.45);
              max-width: 480px;
            }
            h1 { background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #14b8a6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin: 0 0 12px; font-size: 1.8rem; font-weight: 800; }
            p { color: #cbd5e1; font-size: 0.95rem; margin-bottom: 24px; line-height: 1.6; }
            .btn {
              display: inline-flex;
              background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #14b8a6 100%);
              color: white;
              padding: 10px 22px;
              border-radius: 8px;
              text-decoration: none;
              font-weight: 600;
              font-size: 0.95rem;
              box-shadow: 0 4px 14px rgba(99, 102, 241, 0.28);
              transition: all 0.2s ease;
            }
            .btn:hover {
              transform: translateY(-2px);
              box-shadow: 0 6px 20px rgba(99, 102, 241, 0.45);
            }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>InkFlow API Server</h1>
            <p>The backend services are successfully active in development mode. To browse the blogging platform UI, click the link below to open the frontend client:</p>
            <a class="btn" href="http://localhost:3000">Open InkFlow UI Client</a>
          </div>
        </body>
      </html>
    `);
  });
}


// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
