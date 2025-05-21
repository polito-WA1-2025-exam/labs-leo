import './App.css'
import API from './API.mjs'

import NavHeader from './components/navheader/NavHeader'
import Resume from './components/resume/Resume'
import Home from './components/home/Home'
import GameMatch from './components/matchGame/matchGame'
import ProfilePage from './components/profilePage/ProfilePage';
import { LoginForm } from './components/login/Auth'
import FeedbackContext from './contexts/Context'
import { GameProvider } from './contexts/GameContext'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css';

import { useState } from 'react'
import { Toast, ToastBody } from 'react-bootstrap'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import Register from './components/register/Register'

function App() {
  const [user, setUser] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [feedback, setFeedback] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (credentials) => {
    const user = await API.logIn(credentials);
    setUser(user); setLoggedIn(true);setFeedback("Welcome, " + user.name);
  };

  const handleLogout = async () => {
    await API.logOut();
    // clean up everything
    navigate('/');
    setFeedback("See you soon " + user.name);
    setLoggedIn(false); setUser(null);
  };

  const handleRegister = async (information) => {
    const user = await API.SignUp(information);
    setUser(user); setLoggedIn(true);setFeedback("Welcome, " + user.name);
  };

  const setFeedbackFromError = (err) => {
    let message = '';
    if (err.error) message = err.error;
    else message = "Unknown Error";
    setFeedback(message); // Assuming only one error message at a time
    setTimeout(() => message === 'Not authorized' ? handleLogout() : null, 2000);
  };

  return (
    <FeedbackContext.Provider value={{setFeedback, setFeedbackFromError}} >
      <div className='App min-vh-100 d-flex flex-column'>
        <NavHeader logout={handleLogout} user={user} loggedIn={loggedIn} />

        <Routes> 
            <Route path="/" element={ <Home />} />        
            <Route path="/resume" element={!loggedIn ? <Navigate replace to="/login" /> : <Resume setFeedbackFromError={setFeedbackFromError} />} />
            <Route path="/game" element={
              <GameProvider user={user} setUser={setUser} setFeedbackFromError={setFeedbackFromError}>
                <GameMatch user={user} setUser={setUser} logout={handleLogout} setFeedbackFromError={setFeedbackFromError} />
              </GameProvider>
            } /> 
            <Route path="/profile" element={ !loggedIn ? <Navigate replace to="/login" /> : <ProfilePage user={user} logout={handleLogout} setFeedbackFromError={setFeedbackFromError}  />} />
            <Route path="/login" element={<LoginForm login={handleLogin} />} />
            <Route path="/register" element={<Register register={handleRegister}/>} />
        </Routes>
        <Toast
            show={feedback !== ''}
            autohide
            onClose={() => setFeedback('')}
            delay={4000}
            position="top-end"
            className="feedback"
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