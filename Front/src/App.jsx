import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import URLShortener from './components/URLShortener'
import LinkDetails from './components/LinkDetails'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import './App.css'

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) {
    return <div className="loading-spinner"><div className="spinner"></div></div>
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />
}

function AppContent() {
  const { isAuthenticated, user } = useAuth()

  return (
    <div className="app">
      <header className="header">
        <div className="container">
          <Link to="/" className="logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M8 12C8 9.79086 9.79086 8 12 8H16C18.2091 8 20 9.79086 20 12V16C20 18.2091 18.2091 20 16 20H12C9.79086 20 8 18.2091 8 16V12Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 20L16 24M16 8L20 12M20 20L24 24M8 8L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span>URL Shortener</span>
          </Link>
          <nav className="nav">
            <Link to="/" className="nav-link">Главная</Link>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="nav-link">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M15 15.75V14.25C15 13.4544 14.6839 12.6913 14.1213 12.1287C13.5587 11.5661 12.7956 11.25 12 11.25H6C5.20435 11.25 4.44129 11.5661 3.87868 12.1287C3.31607 12.6913 3 13.4544 3 14.25V15.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 8.25C10.6569 8.25 12 6.90685 12 5.25C12 3.59315 10.6569 2.25 9 2.25C7.34315 2.25 6 3.59315 6 5.25C6 6.90685 7.34315 8.25 9 8.25Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {user?.username}
                </Link>
              </>
            ) : (
              <Link to="/login" className="nav-link auth-link">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M11.25 12.75L15 9M15 9L11.25 5.25M15 9H6M6 15.75H3.75C3.35218 15.75 2.97064 15.592 2.68934 15.3107C2.40804 15.0294 2.25 14.6478 2.25 14.25V3.75C2.25 3.35218 2.40804 2.97064 2.68934 2.68934C2.97064 2.40804 3.35218 2.25 3.75 2.25H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Войти
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="main">
        <Routes>
          <Route path="/" element={<URLShortener />} />
          <Route path="/link/:code" element={<LinkDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>

      <footer className="footer">
        <div className="container">
          <p>&copy; 2026 URL Shortener.</p>
        </div>
      </footer>
    </div>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  )
}

export default App

