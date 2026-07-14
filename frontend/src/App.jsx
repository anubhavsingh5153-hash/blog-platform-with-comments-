import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import PostDetails from './pages/PostDetails';
import CreateEditPost from './pages/CreateEditPost';
import Auth from './pages/Auth';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <div className="app-container">
            {/* Ambient Background Glow Elements */}
            <div className="ambient-glow-wrapper">
              <div className="glow-blob blob-1"></div>
              <div className="glow-blob blob-2"></div>
              <div className="glow-blob blob-3"></div>
            </div>

            <Navbar />
            
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/posts/:id" element={<PostDetails />} />
                <Route path="/create-post" element={<CreateEditPost />} />
                <Route path="/posts/:id/edit" element={<CreateEditPost />} />
                <Route path="/auth" element={<Auth />} />
              </Routes>
            </main>
          </div>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
