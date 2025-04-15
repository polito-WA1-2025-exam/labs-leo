// File: components/MemeForm.jsx
import { useState, useEffect } from 'react';
import { Form, Button, Card, Alert, Row, Col } from 'react-bootstrap';

// In a real app, these would be fetched from the API
const sampleMemes = [
  { id: 1, imageUrl: 'meme1.jpg', title: 'Distracted Boyfriend' },
  { id: 2, imageUrl: 'meme2.jpg', title: 'Woman Yelling at Cat' },
  { id: 3, imageUrl: 'meme3.jpg', title: 'Drake Hotline Bling' },
  { id: 4, imageUrl: 'meme4.jpg', title: 'Two Buttons' },
  { id: 5, imageUrl: 'meme5.jpg', title: 'Change My Mind' }
];

const sampleCaptions = [
  { id: 1, text: 'Me trying to focus on work' },
  { id: 2, text: 'When the WiFi drops for 0.0001 seconds' },
  { id: 3, text: 'When someone says "React is just a library"' },
  { id: 4, text: 'JavaScript: == vs ===' },
  { id: 5, text: 'Debugging your own code vs. debugging someone else\'s' }
];

function MemeForm({ onSubmit, initialData }) {
  const [formData, setFormData] = useState({
    memeId: initialData?.memeId || '',
    captionType: 'new',
    captionId: '',
    captionText: '',
    points: '3'
  });
  
  const [memes, setMemes] = useState([]);
  const [captions, setCaptions] = useState([]);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState({ show: false, variant: '', message: '' });
  
  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear the error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // Validate the form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.memeId) {
      newErrors.memeId = 'Please select a meme';
    }
    
    if (formData.captionType === 'existing' && !formData.captionId) {
      newErrors.captionId = 'Please select a caption';
    }
    
    if (formData.captionType === 'new' && !formData.captionText.trim()) {
      newErrors.captionText = 'Please enter a caption';
    }
    
    if (!['1', '2', '3'].includes(formData.points)) {
      newErrors.points = 'Please select a valid point value';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Prepare data for submission
      const submissionData = {
        memeId: parseInt(formData.memeId),
        points: parseInt(formData.points)
      };
      
      if (formData.captionType === 'existing') {
        submissionData.captionId = parseInt(formData.captionId);
        submissionData.caption = captions.find(c => c.id === parseInt(formData.captionId));
      } else {
        submissionData.captionText = formData.captionText;
      }
      
      submissionData.meme = memes.find(m => m.id === parseInt(formData.memeId));
      
      // Call the parent's onSubmit handler
      onSubmit(submissionData);
      
      // Reset form if not in edit mode
      if (!initialData) {
        setFormData({
          memeId: '',
          captionType: 'new',
          captionId: '',
          captionText: '',
          points: '3'
        });
      }
      
      // Show success message
      setAlert({
        show: true,
        variant: 'success',
        message: initialData 
          ? 'Association updated successfully!' 
          : 'New association created successfully!'
      });
    }
  };
  
  // Load initial data when in edit mode
  useEffect(() => {
    if (initialData) {
      setFormData({
        memeId: initialData.memeId.toString(),
        captionType: initialData.captionId ? 'existing' : 'new',
        captionId: initialData.captionId ? initialData.captionId.toString() : '',
        captionText: initialData.captionText || '',
        points: initialData.points.toString()
      });
    }
    
    // In a real app, we would fetch these from the API
    setMemes(sampleMemes);
    setCaptions(sampleCaptions);
  }, [initialData]);
  
  return (
    <Card className="mb-4">
      <Card.Body>
        {alert.show && (
          <Alert 
            variant={alert.variant} 
            dismissible 
            onClose={() => setAlert({ show: false })}
          >
            {alert.message}
          </Alert>
        )}
        
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Select Meme</Form.Label>
            <Form.Select 
              name="memeId"
              value={formData.memeId} 
              onChange={handleChange}
              isInvalid={!!errors.memeId}
            >
              <option value="">Choose a meme...</option>
              {memes.map(meme => (
                <option key={meme.id} value={meme.id}>
                  {meme.title}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors.memeId}
            </Form.Control.Feedback>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Caption Type</Form.Label>
            <div>
              <Form.Check
                inline
                type="radio"
                id="new-caption"
                label="New Caption"
                name="captionType"
                value="new"
                checked={formData.captionType === 'new'}
                onChange={handleChange}
              />
              <Form.Check
                inline
                type="radio"
                id="existing-caption"
                label="Existing Caption"
                name="captionType"
                value="existing"
                checked={formData.captionType === 'existing'}
                onChange={handleChange}
              />
            </div>
          </Form.Group>
          
          {formData.captionType === 'existing' ? (
            <Form.Group className="mb-3">
              <Form.Label>Select Existing Caption</Form.Label>
              <Form.Select 
                name="captionId"
                value={formData.captionId} 
                onChange={handleChange}
                isInvalid={!!errors.captionId}
              >
                <option value="">Choose a caption...</option>
                {captions.map(caption => (
                  <option key={caption.id} value={caption.id}>
                    {caption.text}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors.captionId}
              </Form.Control.Feedback>
            </Form.Group>
          ) : (
            <Form.Group className="mb-3">
              <Form.Label>New Caption Text</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="captionText"
                value={formData.captionText}
                onChange={handleChange}
                placeholder="Enter a funny caption..."
                isInvalid={!!errors.captionText}
              />
              <Form.Control.Feedback type="invalid">
                {errors.captionText}
              </Form.Control.Feedback>
            </Form.Group>
          )}
          
          <Form.Group className="mb-4">
            <Form.Label>Points for this Caption</Form.Label>
            <div>
              <Form.Check
                inline
                type="radio"
                id="points-3"
                label="3 Points"
                name="points"
                value="3"
                checked={formData.points === '3'}
                onChange={handleChange}
              />
              <Form.Check
                inline
                type="radio"
                id="points-2"
                label="2 Points"
                name="points"
                value="2"
                checked={formData.points === '2'}
                onChange={handleChange}
              />
              <Form.Check
                inline
                type="radio"
                id="points-1"
                label="1 Point"
                name="points"
                value="1"
                checked={formData.points === '1'}
                onChange={handleChange}
              />
            </div>
            {errors.points && (
              <div className="text-danger mt-1 small">{errors.points}</div>
            )}
          </Form.Group>
          
          <div className="d-grid">
            <Button variant="primary" type="submit">
              <i className="bi bi-check-lg me-2"></i>
              {initialData ? 'Update Association' : 'Create Association'}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default MemeForm;

// File: pages/CreatePage.jsx (Updated with form validation)
import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import MemeForm from '../components/MemeForm';

function CreatePage({ user }) {
  const [createdAssociations, setCreatedAssociations] = useState([]);
  const [editingAssociation, setEditingAssociation] = useState(null);
  
  const handleFormSubmit = (data) => {
    if (editingAssociation) {
      // Update existing association
      setCreatedAssociations(prev => 
        prev.map(assoc => 
          assoc.id === editingAssociation.id ? { ...data, id: assoc.id } : assoc
        )
      );
      setEditingAssociation(null);
    } else {
      // Create new association
      const newAssociation = {
        ...data,
        id: Date.now(), // Generate a temporary ID (in a real app, this would come from the API)
        createdAt: new Date().toISOString()
      };
      
      setCreatedAssociations(prev => [...prev, newAssociation]);
    }
  };
  
  const handleEditAssociation = (association) => {
    setEditingAssociation(association);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleDeleteAssociation = (id) => {
    setCreatedAssociations(prev => prev.filter(assoc => assoc.id !== id));
  };
  
  return (
    <Container>
      <h2 className="mb-4">
        <i className="bi bi-plus-circle me-2"></i>
        {editingAssociation ? 'Edit' : 'Create'} Meme-Caption Association
      </h2>
      
      <Row>
        <Col lg={8}>
          <MemeForm 
            onSubmit={handleFormSubmit} 
            initialData={editingAssociation}
          />
          
          {createdAssociations.length > 0 && (
            <div className="mt-4">
              <h3 className="mb-3">Your Created Associations</h3>
              {createdAssociations.map(assoc => (
                <Card key={assoc.id} className="mb-3">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h5>{assoc.meme.title}</h5>
                        <p className="mb-1">
                          <strong>Caption:</strong> {assoc.captionText || assoc.caption.text}
                        </p>
                        <p className="mb-0">
                          <strong>Points:</strong> {assoc.points}
                        </p>
                      </div>
                      <div>
                        <button 
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => handleEditAssociation(assoc)}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteAssociation(assoc.id)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          )}
        </Col>
        
        <Col lg={4}>
          <Card bg="light" className="mb-4">
            <Card.Header>
              <i className="bi bi-info-circle me-2"></i>Instructions
            </Card.Header>
            <Card.Body>
              <p>Create associations between memes and captions:</p>
              <ol>
                <li>Select a meme from the database</li>
                <li>Choose to use an existing caption or create a new one</li>
                <li>Assign point value (1-3 points)</li>
              </ol>
              <Alert variant="warning">
                <small>
                  <i className="bi bi-exclamation-triangle me-1"></i>
                  Each meme can have at most 3 correct captions, with different point values (1, 2, and 3 points)
                </small>
              </Alert>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default CreatePage;

// File: pages/LoginPage.jsx (Updated with form validation)
import { useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

function LoginPage({ onLogin }) {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    if (generalError) {
      setGeneralError('');
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Mock login (in a real app, this would call the API)
      if (formData.username === 'user1' && formData.password === 'password') {
        const userData = {
          id: 1,
          username: 'user1',
          email: 'user1@example.com'
        };
        
        onLogin(userData);
        navigate('/game');
      } else {
        setGeneralError('Invalid username or password');
      }
    }
  };
  
  return (
    <Container>
      <div className="auth-container">
        <h2 className="text-center mb-4">
          <i className="bi bi-person-circle me-2"></i>Login
        </h2>
        
        {generalError && (
          <Alert variant="danger">{generalError}</Alert>
        )}
        
        <Form onSubmit={handleSubmit} noValidate>
          <Form.Group className="mb-3">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              isInvalid={!!errors.username}
            />
            <Form.Control.Feedback type="invalid">
              {errors.username}
            </Form.Control.Feedback>
          </Form.Group>
          
          <Form.Group className="mb-4">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              isInvalid={!!errors.password}
            />
            <Form.Control.Feedback type="invalid">
              {errors.password}
            </Form.Control.Feedback>
          </Form.Group>
          
          <div className="d-grid">
            <Button variant="primary" type="submit">
              <i className="bi bi-box-arrow-in-right me-2"></i>Login
            </Button>
          </div>
        </Form>
        
        <div className="text-center mt-3">
          <p>Don't have an account? <Link to="/register">Register</Link></p>
        </div>
      </div>
    </Container>
  );
}

export default LoginPage;

// File: pages/RegisterPage.jsx (Updated with form validation)
import { useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

function RegisterPage({ onLogin }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    if (generalError) {
      setGeneralError('');
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Mock registration (in a real app, this would call the API)
      // Check if username already exists
      if (formData.username === 'user1') {
        setGeneralError('Username already exists');
        return;
      }
      
      const userData = {
        id: 2, // New user ID
        username: formData.username,
        email: formData.email
      };
      
      onLogin(userData);
      navigate('/game');
    }
  };
  
  return (
    <Container>
      <div className="auth-container">
        <h2 className="text-center mb-4">
          <i className="bi bi-person-plus me-2"></i>Register
        </h2>
        
        {generalError && (
          <Alert variant="danger">{generalError}</Alert>
        )}
        
        <Form onSubmit={handleSubmit} noValidate>
          <Form.Group className="mb-3">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              isInvalid={!!errors.username}
            />
            <Form.Control.Feedback type="invalid">
              {errors.username}
            </Form.Control.Feedback>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              isInvalid={!!errors.email}
            />
            <Form.Control.Feedback type="invalid">
              {errors.email}
            </Form.Control.Feedback>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Choose a password"
              isInvalid={!!errors.password}
            />
            <Form.Control.Feedback type="invalid">
              {errors.password}
            </Form.Control.Feedback>
          </Form.Group>
          
          <Form.Group className="mb-4">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              isInvalid={!!errors.confirmPassword}
            />
            <Form.Control.Feedback type="invalid">
              {errors.confirmPassword}
            </Form.Control.Feedback>
          </Form.Group>
          
          <div className="d-grid">
            <Button variant="primary" type="submit">
              <i className="bi bi-person-check me-2"></i>Register
            </Button>
          </div>
        </Form>
        
        <div className="text-center mt-3">
          <p>Already have an account? <Link to="/login">Login</Link></p>
        </div>
      </div>
    </Container>
  );
}

export default RegisterPage;
