import { useState } from 'react';
import { Alert, Form, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import PropTypes from "prop-types";
import './auth.css';

function LoginForm(props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [show, setShow] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    const credentials = { username, password };

    props.login(credentials)
      .then(() => navigate("/"))
      .catch((err) => {
        if(err.message === "Unauthorized")
          setErrorMessage("Invalid username and/or password");
        else
          setErrorMessage(err.message);
        setShow(true);
      });
  };

  return (
    <Container className="loginContainer">
      <div className="login-form-container">
        <h1 className="login-title">Login</h1>
        <Form onSubmit={handleSubmit}>
          <Alert
            dismissible
            show={show}
            onClose={() => setShow(false)}
            variant="danger">
            {errorMessage}
          </Alert>
          <Form.Group className="mb-3" controlId="username">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={username} 
              placeholder="Example: john.doe@polito.it"
              onChange={(ev) => setUsername(ev.target.value)}
              required={true}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="password">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              value={password} 
              placeholder="Enter your password"
              onChange={(ev) => setPassword(ev.target.value)}
              required={true} 
              minLength={6}
            />
          </Form.Group>
          <button type="submit" className="login-button">Login</button>
        </Form>
        <div className="newAccContainer">
          <Link to="/register" className="newAccount">No account? Create one!</Link>
        </div>
      </div>
    </Container>
  );
}

LoginForm.propTypes = {
  login: PropTypes.func,
};

function LogoutButton(props) {
  return (
    <button 
      className="nav-btn logout-btn" 
      onClick={props.logout}
    >
      <i className="bi bi-box-arrow-right"></i> Logout
    </button>
  );
}

LogoutButton.propTypes = {
  logout: PropTypes.func
};

function LoginButton() {
  const navigate = useNavigate();
  return (
    <button 
      className="nav-btn" 
      onClick={() => navigate('/login')}
    >
      <i className="bi bi-person"></i> Login
    </button>
  );
}

export { LoginForm, LogoutButton, LoginButton };