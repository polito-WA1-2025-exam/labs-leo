import { Accordion, Card, Badge, Spinner } from 'react-bootstrap';
import RoundBox from '../roundBox/RoundBox';
import './history.css';
import PropTypes from "prop-types";

function ProfileHistory(props) {
    // If loading, show spinner
    if (props.isLoading) {
        return (
            <div className="history-loading">
                <Spinner animation="border" variant="primary" />
                <p>Loading your game history...</p>
            </div>
        );
    }
    
    // If no history, show message
    if (!props.history || props.history.length === 0) {
        return (
            <div className="history-empty">
                <i className="bi bi-emoji-neutral"></i>
                <h3>No Game History Yet</h3>
                <p>Play your first game to see your history here!</p>
            </div>
        );
    }
    
    return (
        <div className='history-container'>
            <div className="history-header">
                <h3 className="history-title">Your Recent Games</h3>
                <Badge bg="primary" className="history-count">
                    {props.history.length} games played
                </Badge>
            </div>
            
            <div className="history-list">
                {props.history.map((game, index) => {
                    const gameNumber = props.history.length - index;
                    const gameDetails = JSON.parse(game.match_details);
                    const isValidGame = gameDetails.length === 3;
                    const gameDate = new Date(game.match_id);
                    
                    return (
                        <Card className='game-card' key={index}>
                            <Accordion defaultActiveKey="">
                                <Accordion.Item eventKey={index.toString()}>
                                    <Accordion.Header>
                                        <div className="game-header">
                                            <div className="game-number">
                                                Game #{gameNumber < 10 ? `0${gameNumber}` : gameNumber}
                                            </div>
                                            <div className="game-info">
                                                <div className="game-points">
                                                    <i className="bi bi-star-fill"></i> 
                                                    {isValidGame ? game.match_points : 'Invalid'} points
                                                </div>
                                                <div className="game-date">
                                                    <i className="bi bi-calendar"></i>
                                                    {gameDate.toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    </Accordion.Header>
                                    <Accordion.Body>
                                        <div className="game-details">
                                            <h5 className="details-title">Round Details</h5>
                                            <RoundBox 
                                                match_details={gameDetails} 
                                                styles={"history-round-box"} 
                                                from={"history"}
                                            />
                                        </div>
                                    </Accordion.Body>
                                </Accordion.Item>
                            </Accordion>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}

ProfileHistory.propTypes = {
    history: PropTypes.arrayOf(PropTypes.object),
    isLoading: PropTypes.bool
};

export default ProfileHistory;