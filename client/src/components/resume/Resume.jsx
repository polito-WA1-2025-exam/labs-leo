import { useLocation, useNavigate } from "react-router-dom";
import "./resume.css";
import { useEffect, useState } from "react";
import API from "../../API.mjs";
import RoundBox from "../roundBox/RoundBox";
import PropTypes from "prop-types";


function Resume(props){
    const location = useLocation();
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [points, setPoints] = useState(0);

    const getHistoryGame = async () => {
        if(location.state){
            await API.getHistoryMatch(location.state.match_id)
            .then(result => {setHistory(result.details); setPoints(result.points);})
            .catch(error =>  {console.error('Error:', error); props.setFeedbackFromError(error);});
        }
    };

    useEffect(() => {
        getHistoryGame();
    }, []);

    return(
        <div className="resume-container">
            <div className="resume-header">
                <h1 className="resume-title">Game Results</h1>
                <div className="resume-score">
                    <div className="score-display">
                        <div className="score-label">You earned</div>
                        <div className="score-value">{points} points</div>
                        <div className="score-badge">
                            <i className="bi bi-trophy-fill"></i>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="resume-history">
                <h2 className="history-title">Game Summary</h2>
                <RoundBox match_details={history} styles={"resume-match-container"} from={"resume"}/>
            </div>
            
            <div className="resume-actions">
                <button 
                    onClick={() => navigate('/game')} 
                    className='restart-button'
                >
                    <i className="bi bi-arrow-repeat"></i>
                    <span>Play Again</span>
                </button>
                
                <button 
                    onClick={() => navigate('/profile')} 
                    className='profile-button'
                >
                    <i className="bi bi-person"></i>
                    <span>View Profile</span>
                </button>
            </div>
        </div>
    )
}

Resume.propTypes = {
    setFeedbackFromError: PropTypes.func.isRequired,
};

export default Resume;