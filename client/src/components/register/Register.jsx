import { Alert, Form, Container } from "react-bootstrap";
import "./register.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import PropTypes from "prop-types";

function Register(props){
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
  
    const [show, setShow] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
  
    const navigate = useNavigate();
  
    const handleSubmit = (event) => {
      event.preventDefault();
      const information = { username, password, name };
  
      props.register(information)
        .then(() => navigate("/"))
        .catch((err) => {
          if(err.message === "Unauthorized")
            setErrorMessage("Invalid username and/or password");
          else
            setErrorMessage(err.message);
          setShow(true);
        });
    };

    return(
        <Container className="register-container">
            <div className="register-form-container">
                <h1 className="register-title">Create Account</h1>
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
                    <Form.Group className="mb-3" controlId="name">
                        <Form.Label>Username</Form.Label>
                        <Form.Control
                            type="text"
                            value={name} 
                            placeholder="Choose a username (e.g. MemeMaster)"
                            onChange={(ev) => setName(ev.target.value)}
                            required={true} 
                            minLength={4}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="password">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            type="password"
                            value={password} 
                            placeholder="Choose a secure password"
                            onChange={(ev) => setPassword(ev.target.value)}
                            required={true} 
                            minLength={6}
                        />
                        <Form.Text className="text-muted">
                            Password must be at least 6 characters long.
                        </Form.Text>
                    </Form.Group>
                    <button type="submit" className="register-button">Sign Up</button>
                </Form>
                <div className="login-link-container">
                    <Link to="/login" className="login-link">Already have an account? Log in</Link>
                </div>
            </div>
        </Container>
    )
}

Register.propTypes = {
  register: PropTypes.func.isRequired,
};

export default Register;