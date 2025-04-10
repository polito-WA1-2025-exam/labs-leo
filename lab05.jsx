// App.jsx - Main application component
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import GamePage from './pages/GamePage';
import HistoryPage from './pages/HistoryPage';
import CreatePage from './pages/CreatePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';
import AuthContext from './contexts/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const loggedInUser = localStorage.getItem('user');
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser));
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  if (loading) {
    return <div className="text-center p-5">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <Router>
        <div className="d-flex flex-column min-vh-100">
          <Navigation />
          <main className="flex-grow-1">
            <Routes>
              <Route path="/" element={<GamePage />} />
              <Route 
                path="/history" 
                element={user ? <HistoryPage /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/create" 
                element={user ? <CreatePage /> : <Navigate to="/login" />} 
              />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <footer className="bg-light py-3 text-center">
            <p className="m-0">MemeGame &copy; 2025</p>
          </footer>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;




// components/Navigation.jsx
import { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Navbar, Container, Nav, Button } from 'react-bootstrap';
import AuthContext from '../contexts/AuthContext';

function Navigation() {
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);
  
  return (
    <Navbar bg="primary" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <i className="bi bi-emoji-laughing me-2"></i>
          MemeGame
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link 
              as={Link} 
              to="/" 
              active={location.pathname === '/'}
            >
              Play
            </Nav.Link>
            {user && (
              <>
                <Nav.Link 
                  as={Link} 
                  to="/history" 
                  active={location.pathname === '/history'}
                >
                  History
                </Nav.Link>
                <Nav.Link 
                  as={Link} 
                  to="/create" 
                  active={location.pathname === '/create'}
                >
                  Create
                </Nav.Link>
              </>
            )}
          </Nav>
          <div className="d-flex">
            {user ? (
              <>
                <span className="text-light d-flex align-items-center me-3">
                  <i className="bi bi-person-circle me-1"></i>
                  {user.username}
                </span>
                <Button variant="outline-light" onClick={logout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
