import { Container, Navbar, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { LoginButton, LogoutButton } from '../login/Auth';
import PropTypes from 'prop-types';
import './navheader.css';

function NavHeader(props) {
    return(
        <Navbar className='navbar' expand="lg">
            <Container>
                <Link to='/' className='navbar-brand'>
                    <span className="brand-icon">🎮</span>
                    <span className="brand-text">MemeMatch</span>
                </Link>
                
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="mx-auto">
                        <Link to='/' className='nav-link'>
                            <i className="bi bi-house-door"></i> Home
                        </Link>
                        <Link to='/game' className='nav-link'>
                            <i className="bi bi-controller"></i> Play
                        </Link>
                        {props.loggedIn && (
                            <Link to='/profile' className='nav-link'>
                                <i className="bi bi-person"></i> Profile
                            </Link>
                        )}
                    </Nav>
                    
                    <div className="user-section">
                        {props.loggedIn && (
                            <div className="user-info">
                                <span className="user-name">
                                    <i className="bi bi-person-circle"></i>
                                    {props.user?.name}
                                </span>
                                <span className="user-points">
                                    <i className="bi bi-star-fill"></i>
                                    {props.user?.points || 0} pts
                                </span>
                            </div>
                        )}
                        
                        {props.loggedIn ? (
                            <LogoutButton logout={props.logout} />
                        ) : (
                            <div className="auth-buttons">
                                <LoginButton />
                                <Link to="/register" className="nav-btn signup-btn">
                                    <i className="bi bi-person-plus"></i> Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
}

NavHeader.propTypes = {
    user: PropTypes.object,
    logout: PropTypes.func,
    loggedIn: PropTypes.bool,
};

export default NavHeader;