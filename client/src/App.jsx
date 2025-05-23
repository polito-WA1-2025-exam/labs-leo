/**
 * MEME GAME - Main React Application Component
 * 
 * Root component that handles routing, authentication state management,
 * and global application context. Provides the main structure for the
 * Meme Game web application.
 * 
 * Features:
 * - User authentication (login/logout/register)
 * - Route protection for authenticated pages
 * - Global feedback system with toast notifications
 * - Context providers for shared state
 * 
 * @author Shadmehr Rahmati (s337544)
 * @course Web Applications I - 2024/2025
 */

// === IMPORTS ===
import './App.css'
import API from './API.mjs'

// Component imports
import NavHeader from './components/navheader/NavHeader'
import Resume from './components/resume/Resume'
import Home from './components/home/Home'
import GameMatch from './components/matchGame/matchGame'
import ProfilePage from './components/profilePage/ProfilePage';
import { LoginForm } from './components/login/Auth'
import Register from './components/register/Register'

// Context providers
import FeedbackContext from './contexts/Context'
import { GameProvider } from './contexts/GameContext'

// External libraries
import 'bootstrap/dist/css/bootstrap.min.css'      // Bootstrap CSS framework
import 'bootstrap-icons/font/bootstrap-icons.css'; // Bootstrap Icons

// React hooks and components
import { useState } from 'react'
import { Toast, ToastBody } from 'react-bootstrap'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'

/**
 * Main Application Component
 * 
 * Manages global application state including:
 * - User authentication status
 * - User profile information
 * - Feedback messages and notifications
 * - Routing between different pages
 */
function App() {
  // === STATE MANAGEMENT ===
  
  // User authentication state
  const [user, setUser] = useState(null);        // Current user object (null if not logged in)
  const [loggedIn, setLoggedIn] = useState(false); // Boolean flag for login status
  
  // Feedback system state
  const [feedback, setFeedback] = useState('');   // Message to display in toast notification
  
  // Navigation hook for programmatic routing
  const navigate = useNavigate();

  // === AUTHENTICATION HANDLERS ===

  /**
   * Handle user login
   * 
   * @param {Object} credentials - { username: string, password: string }
   * Updates user state and shows welcome message on successful login
   */
  const handleLogin = async (credentials) => {
    try {
      // Call API to authenticate user
      const user = await API.logIn(credentials);
      
      // Update application state
      setUser(user);
      setLoggedIn(true);
      setFeedback("Welcome, " + user.name);
      
    } catch (error) {
      // Error handling is done in the API layer and individual components
      console.error('Login error:', error);
    }
  };

  /**
   * Handle user logout
   * 
   * Clears user session, resets state, and redirects to home page
   */
  const handleLogout = async () => {
    try {
      // Call API to end server session
      await API.logOut();
      
      // Store username for farewell message before clearing state
      const userName = user?.name || 'User';
      
      // Clean up application state
      navigate('/');                    // Redirect to home page
      setFeedback("See you soon " + userName);
      setLoggedIn(false);              // Clear login status
      setUser(null);                   // Clear user data
      
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails on server, clear local state
      setLoggedIn(false);
      setUser(null);
      navigate('/');
    }
  };

  /**
   * Handle user registration
   * 
   * @param {Object} information - { name: string, username: string, password: string }
   * Creates new user account and automatically logs them in
   */
  const handleRegister = async (information) => {
    try {
      // Call API to create new user account
      const user = await API.SignUp(information);
      
      // Update application state (user is automatically logged in after registration)
      setUser(user);
      setLoggedIn(true);
      setFeedback("Welcome, " + user.name);
      
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  // === ERROR HANDLING ===

  /**
   * Set feedback message from API errors
   * 
   * @param {Object} err - Error object from API calls
   * Displays error messages to user and handles authorization errors
   */
  const setFeedbackFromError = (err) => {
    let message = '';
    
    // Extract error message from error object
    if (err.error) {
      message = err.error;
    } else {
      message = "Unknown Error";
    }
    
    // Display error message to user
    setFeedback(message);
    
    // Handle authorization errors by logging out user after delay
    setTimeout(() => {
      if (message === 'Not authorized') {
        handleLogout();
      }
    }, 2000);
  };

  // === RENDER ===
  return (
    <FeedbackContext.Provider value={{setFeedback, setFeedbackFromError}}>
      <div className='App min-vh-100 d-flex flex-column'>
        
        {/* === NAVIGATION HEADER === */}
        <NavHeader 
          logout={handleLogout} 
          user={user} 
          loggedIn={loggedIn} 
        />

        {/* === MAIN CONTENT ROUTES === */}
        <Routes> 
          {/* Home page - accessible to all users */}
          <Route 
            path="/" 
            element={<Home />} 
          />
          
          {/* Game resume page - protected route (requires login) */}
          <Route 
            path="/resume" 
            element={
              !loggedIn ? 
                <Navigate replace to="/login" /> : 
                <Resume setFeedbackFromError={setFeedbackFromError} />
            } 
          />
          
          {/* Main game page - accessible to all, but behavior differs for logged/guest users */}
          <Route 
            path="/game" 
            element={
              <GameProvider user={user} setUser={setUser} setFeedbackFromError={setFeedbackFromError}>
                <GameMatch 
                  user={user} 
                  setUser={setUser} 
                  logout={handleLogout} 
                  setFeedbackFromError={setFeedbackFromError} 
                />
              </GameProvider>
            } 
          />
          
          {/* User profile page - protected route (requires login) */}
          <Route 
            path="/profile" 
            element={
              !loggedIn ? 
                <Navigate replace to="/login" /> : 
                <ProfilePage 
                  user={user} 
                  logout={handleLogout} 
                  setFeedbackFromError={setFeedbackFromError} 
                />
            } 
          />
          
          {/* Login page - accessible to all users */}
          <Route 
            path="/login" 
            element={<LoginForm login={handleLogin} />} 
          />
          
          {/* Registration page - accessible to all users */}
          <Route 
            path="/register" 
            element={<Register register={handleRegister} />} 
          />
        </Routes>

        {/* === FEEDBACK TOAST NOTIFICATION === */}
        {/* 
          Global notification system that displays feedback messages
          Automatically hides after 4 seconds
          Positioned at top-right of screen
        */}
        <Toast
          show={feedback !== ''}          // Show when there's a feedback message
          autohide                        // Automatically hide after delay
          onClose={() => setFeedback('')} // Clear feedback when toast closes
          delay={4000}                    // Show for 4 seconds
          position="top-end"              // Position at top-right
          className="feedback"            // CSS class for styling
        >
          <ToastBody className='feedbackBody'>
            {feedback}
          </ToastBody>
        </Toast>
      </div>
    </FeedbackContext.Provider>
  )
}

export default App
