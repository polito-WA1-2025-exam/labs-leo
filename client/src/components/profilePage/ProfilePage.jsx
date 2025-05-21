import { useEffect, useState } from 'react';
import './profilePage.css';
import API from '../../API.mjs';
import { Container, Tabs, Tab, Button } from 'react-bootstrap';
import ProfileInfo from '../profileInfo/Info';
import ProfileHistory from '../profileHistory/History';
import PropTypes from "prop-types";
import { useNavigate } from 'react-router-dom';

function ProfilePage(props){
    const [history, setHistory] = useState([]);
    const [activeTab, setActiveTab] = useState('profile');
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const getHistory = async () => {
        setIsLoading(true);
        try {
            const response = await API.getHistory();
            setHistory(response);
        } catch (error) {
            console.error('Error fetching data:', error.error);
            props.setFeedbackFromError(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getHistory();
    }, []);

    return(
        <Container className="profile-page-container">
            <div className="profile-header">
                <h1 className="profile-title">My Profile</h1>
                <div className="profile-actions">
                    <Button 
                        className="play-button" 
                        onClick={() => navigate('/game')}
                    >
                        <i className="bi bi-controller"></i> Play Game
                    </Button>
                </div>
            </div>
            
            <div className="profile-tabs-container">
                <Tabs
                    id="profile-tabs"
                    activeKey={activeTab}
                    onSelect={(k) => setActiveTab(k)}
                    className="profile-tabs"
                >
                    <Tab eventKey="profile" title={<><i className="bi bi-person"></i> Profile Info</>}>
                        <ProfileInfo user={props.user} />
                    </Tab>
                    <Tab eventKey="history" title={<><i className="bi bi-clock-history"></i> Game History</>}>
                        <ProfileHistory 
                            history={history} 
                            isLoading={isLoading} 
                        />
                    </Tab>
                </Tabs>
            </div>
        </Container>
    )
}

ProfilePage.propTypes = {
    user: PropTypes.object.isRequired,
    logout: PropTypes.func.isRequired,
    setFeedbackFromError: PropTypes.func.isRequired,
};

export default ProfilePage;