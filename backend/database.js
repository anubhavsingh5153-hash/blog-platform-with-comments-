const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite database:', err.message);
  } else {
    console.log('Connected to the SQLite database at:', dbPath);
  }
});

// Enable foreign key support in SQLite
db.serialize(() => {
  db.run('PRAGMA foreign_keys = ON', (err) => {
    if (err) console.error('Failed to enable foreign keys:', err.message);
  });

  // Create Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create Posts table
  db.run(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      author_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Create Comments table
  db.run(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      post_id INTEGER NOT NULL,
      author_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE,
      FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Seeding initial data if database is empty
  db.get('SELECT COUNT(*) AS count FROM users', (err, row) => {
    if (err) {
      console.error('Error checking users for seeding:', err.message);
      return;
    }
    
    if (row && row.count === 0) {
      console.log('Database is empty. Seeding initial test data...');
      
      db.serialize(() => {
        // Seed Users
        db.run(`INSERT INTO users (id, username, email, password, created_at) VALUES 
          (1, 'testwriter', 'writer@test.com', '$2a$10$eBEklxFZ0p2f1yTIvLAzvuR8.OsS09gXTAZ7RYSPdcILtZFBdp7D2', '2026-07-14 07:49:33'),
          (2, 'testuser2', 'user2@test.com', '$2a$10$6SNSKTB4HgKHm19o5ZYGvu76cQBlAncIOYrZwk16IyWqqJ5aP5sz.', '2026-07-14 08:48:55')
        `, (err) => {
          if (err) {
            console.error('Failed to seed users:', err.message);
            return;
          }
          console.log('Seeded users successfully.');
          
          // Seed Posts
          db.run(`INSERT INTO posts (id, title, content, author_id, created_at, updated_at) VALUES 
            (1, 'Mastering Premium CSS Glassmorphism (Updated)', 'Glassmorphism combines transparency, background blur, and fine borders to build layouts that float elegantly over colorful gradient backdrops.\n\nThis application uses a custom design system built with CSS variables to ensure high performance and fluid theme transitions.', 1, '2026-07-14 07:50:24', '2026-07-14 07:51:42'),
            (2, 'Design Foundations of Glassmorphic UI', '### Defining Glassmorphism\nGlassmorphism relies on the visual interplay of blurred layers, light diffusion, and structural depth.\n\n> \"Good design makes a product useful.\" - Dieter Rams\n\n### Core Properties\n- Backdrop filter blur: provides separation from the colorful gradients beneath.\n- Transparent border stroke: helps isolate card contours.\n- Ambient drifting glows: makes the overall page feel organic and responsive.', 1, '2026-07-14 08:00:10', '2026-07-14 08:00:10'),
            (3, 'My First Post', 'This is the body of my first post. It has some interesting content.', 2, '2026-07-14 08:50:24', '2026-07-14 08:50:24')
          `, (err) => {
            if (err) {
              console.error('Failed to seed posts:', err.message);
              return;
            }
            console.log('Seeded posts successfully.');
            
            // Seed Comments
            db.run(`INSERT INTO comments (id, content, post_id, author_id, created_at) VALUES 
              (1, 'Wow, this interface looks incredibly professional and responsive!', 1, 1, '2026-07-14 07:50:59'),
              (2, 'This is a great post! I really enjoyed reading it.', 3, 2, '2026-07-14 08:53:28')
            `, (err) => {
              if (err) {
                console.error('Failed to seed comments:', err.message);
                return;
              }
              console.log('Seeded comments successfully.');
            });
          });
        });
      });
    }
  });
});

// Promise wrappers for database operations
const query = {
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  },

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
};

module.exports = { db, query };
