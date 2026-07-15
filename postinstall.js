const { execSync } = require('child_process');

console.log('Running postinstall script...');

// Always install frontend dependencies
console.log('Installing frontend dependencies...');
try {
  execSync('npm install --prefix frontend', { stdio: 'inherit' });
} catch (err) {
  console.error('Failed to install frontend dependencies:', err.message);
  process.exit(1);
}

// Install backend dependencies if NOT on Vercel
if (process.env.VERCEL) {
  console.log('Detected Vercel environment. Skipping backend installation.');
} else {
  console.log('Installing backend dependencies...');
  try {
    execSync('npm install --prefix backend', { stdio: 'inherit' });
  } catch (err) {
    console.error('Failed to install backend dependencies:', err.message);
    process.exit(1);
  }
}

// Build the frontend
console.log('Building frontend...');
try {
  execSync('npm run build --prefix frontend', { stdio: 'inherit' });
} catch (err) {
  console.error('Frontend build failed:', err.message);
  process.exit(1);
}

console.log('Postinstall completed successfully!');
