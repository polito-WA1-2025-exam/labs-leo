import "./game.css";
import { useEffect, useState } from "react";
import { Captions, Round } from "../../memeModels.mjs";
import { Col, Row, Container } from 'react-bootstrap';
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import API from "../../API.mjs";
import MyTimer from "../timer/Timer";
import InstructionsModal from "../instructionsModal/InstructionsModal";
import { useGameContext } from "../../contexts/GameContext";

function GameMatch(props) {
    const navigate = useNavigate();
    const { 
        isLoading, 
        setIsLoading, 
        showInstructions, 
        setShowInstructions,
        showRoundTransition,
        setShowRoundTransition,
        transitionMessage,
        setTransitionMessage,
        setFeedbackFromError
    } = useGameContext();

    const [captions, setCaptions] = useState([]);
    const [meme, setMeme] = useState({});

    const [round, setRound] = useState(1);
    const [roundPoints, setRoundPoints] = useState(0);
    const [totalPoints, setTotalPoints] = useState(0);
    const [saveRound, setSaveRound] = useState([]);

    const [selectedCap, setSelectedCap] = useState(null);
    const [correctCaptions, setCorrectCaptions] = useState([]);
    const [disableBtn, setDisableBtn] = useState(false);
    
    const roundSeconds = 30;
    const [seconds, setSeconds] = useState(roundSeconds);
    const [stopTimer, setStopTimer] = useState(false);
    
    // Check if first time playing
    useEffect(() => {
        const hasPlayedBefore = localStorage.getItem('memeGamePlayed');
        if (!hasPlayedBefore) {
            setShowInstructions(true);
            localStorage.setItem('memeGamePlayed', 'true');
        }
    }, []);

    // Function called when user is not logged in
    const getCaptionSingle = async () => {
        setIsLoading(true);
        try {
            const response = await API.getCaptionSingle();
            setMeme(response.meme);
            setCaptions(response.captions);
        } catch (error) {
            console.error('Error:', error);
            setFeedbackFromError(error);
        } finally {
            setDisableBtn(false);
            setStopTimer(false);
            setSeconds(roundSeconds);
            setCorrectCaptions([]);
            setSelectedCap(null);
            setIsLoading(false);
        }
    };

    // Function called when user is logged in
    const getCaptionsMulti = async () => {
        setIsLoading(true);
        try {
            const response = await API.getCaptionMulti();
            setMeme(response.meme);
            setCaptions(response.captions);
        } catch (error) {
            console.error('Error:', error);
            setFeedbackFromError(error);
        } finally {
            setDisableBtn(false);
            setStopTimer(false);
            setSeconds(roundSeconds);
            setCorrectCaptions([]);
            setSelectedCap(null);
            setIsLoading(false);
        }
    };

    // Clear points and the array of obj containing the rounds to save
    const initMatch = async () => {
        setSelectedCap(null);
        setSelectedCap(null);
        setSaveRound([]);

        try {
            await API.initMatchLogged();
        } catch (error) {
            console.error('Error:', error);
            setFeedbackFromError(error);
        }
    };

    // Function called when user clicks on caption
    const checkSelection = (cap) => {
        if (disableBtn) return; // Prevent multiple selections
        
        setStopTimer(true);
        setDisableBtn(true);
        sendRoundResults(cap);
    };

    // Function called when user clicks on caption or time is up
    const sendRoundResults = async (cap) => {
        try {
            let sendRound = new Round(
                props.user ? props.user.id : 0,
                meme,
                captions,
                0,
                cap,
                0,
                round,
                []
            );
            
            let res = '';
            let correctCapId = [];
            
            if (props.user) {
                res = await API.checkRoundLog(sendRound);
            } else {
                res = await API.checkRound(sendRound);
            }
            
            if (res) {
                sendRound.points = res.points;
                sendRound.correctCaption = res.correctCap;
                correctCapId = res.correctCapId;
                setTotalPoints(prevTotal => prevTotal + res.points);
            }
            
            setRoundPoints(sendRound.points);
            setCorrectCaptions(correctCapId);

            if (props.user && round < 3) {
                setSaveRound((old) => [...old, sendRound]);
                
                // Show round transition animation
                setTimeout(() => {
                    setTransitionMessage(`Round ${round + 1}`);
                    setShowRoundTransition(true);
                    
                    setTimeout(() => {
                        setShowRoundTransition(false);
                        setRound(oldRound => oldRound + 1);
                    }, 1500);
                }, 3000);
            } else if (props.user && round === 3) {
                setTimeout(() => callEndGame(sendRound), 3000);
            } else {
                // Guest player - show congratulatory message if correct, otherwise encourage signup
                setTimeout(() => {
                    if (correctCapId.includes(cap.id)) {
                        setTransitionMessage(`You Won! Total Points: ${totalPoints + sendRound.points}`);
                    } else {
                        setTransitionMessage("Nice try! Sign up to play full games!");
                    }
                    setShowRoundTransition(true);
                    
                    setTimeout(() => {
                        setShowRoundTransition(false);
                        navigate('/');
                    }, 3000);
                }, 3000);
            }
        } catch (error) {
            console.error('Error:', error);
            setFeedbackFromError(error);
        }
    };

    const callEndGame = (sendRound) => {
        endMatch(sendRound);
    }

    // Function called when the user ends the 3rd round
    const endMatch = async (sendRound) => {
        try {
            setSelectedCap(null);
            let match_points = 0;
            let match_id = 0;
            
            const send_obj = {
                user_id: props.user.id,
                match_details: [...saveRound, sendRound]
            };

            // Show end game transition
            setTransitionMessage("Game Complete!");
            setShowRoundTransition(true);
            
            const result = await API.createMatch(send_obj);
            match_points = result.points;
            match_id = result.id;

            const tot_point = props.user.points + match_points;
            props.setUser({
                id: props.user.id,
                name: props.user.name,
                points: tot_point,
                username: props.user.username
            });
            
            setTimeout(() => {
                setShowRoundTransition(false);
                navigate('/resume', { state: { match_id: match_id } });
            }, 2000);
        } catch (error) {
            console.error('Error:', error);
            setFeedbackFromError(error);
        }
    };

    const endTimerFunc = () => {
        if (disableBtn) return; // Prevent multiple calls
        sendRoundResults(new Captions(0, "Not provided, time up!", 0));
    };

    useEffect(() => {
        if (props.user) {
            if (round === 1) {
                initMatch();
            }
            
            if (round <= 3) {
                getCaptionsMulti();
            }
        } else {
            getCaptionSingle();
        }
        
        setRoundPoints(0);
    }, [round]);

    // Loading state
    if (isLoading) {
        return (
            <Container className="game-container">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p className="loading-text">Loading round {round}</p>
                </div>
            </Container>
        );
    }
    
    return (
        <Container className="game-container">
            {/* Instructions modal */}
            {showInstructions && (
                <InstructionsModal onClose={() => setShowInstructions(false)} />
            )}
            
            {/* Round transition animation */}
            <div className={`round-transition ${showRoundTransition ? 'active' : ''}`}>
                <div className="round-transition-content">
                    {transitionMessage}
                </div>
            </div>

            <div className="game-title">
                {props.user ? `Round ${round} of 3` : 'Guest Game (Round 1)'}
            </div>
            
            <div className="resume-points">
                {disableBtn && roundPoints > 0 ? `You earned +${roundPoints} points!` : ''}
            </div>
            
            <Row>
                <Col md={6} className="side-container">
                    <div className="meme-container">
                        <img src={meme?.img_url} alt="Meme" />
                    </div>
                    <div className="timer-container">
                        <MyTimer 
                            seconds={seconds} 
                            setSeconds={setSeconds} 
                            endTimeFunc={endTimerFunc} 
                            stopTimer={stopTimer} 
                            setDisableBtn={setDisableBtn} 
                        />
                    </div>
                </Col>
                
                <Col md={6} className="captions-container">
                    {captions.map((cap) => (
                        <button 
                            onClick={() => {
                                setSelectedCap(cap.id);
                                checkSelection(cap);
                            }} 
                            disabled={disableBtn}
                            key={round + "_" + cap.id} 
                            className={`
                                ${!disableBtn ? "hover" : ""}
                                ${disableBtn && correctCaptions.includes(cap.id) ? "green-class" : ""}
                                ${disableBtn && cap.id === selectedCap && !correctCaptions.includes(cap.id) ? "red-class" : ""}
                                ${disableBtn && cap.id === selectedCap ? "btn-selected" : ""}
                            `}
                        >
                            {cap.text}
                            {disableBtn && correctCaptions.includes(cap.id) && 
                                <span className="caption-feedback correct show">Correct!</span>
                            }
                            {disableBtn && cap.id === selectedCap && !correctCaptions.includes(cap.id) && 
                                <span className="caption-feedback incorrect show">Incorrect!</span>
                            }
                        </button>
                    ))}
                </Col>
            </Row>

            {/* Help button */}
            <div className="help-button" onClick={() => setShowInstructions(true)}>
                <i className="bi bi-question-lg"></i>
            </div>
        </Container>
    );
}

GameMatch.propTypes = {
    user: PropTypes.object,
    setUser: PropTypes.func,
    logout: PropTypes.func,
    setFeedbackFromError: PropTypes.func,
};

export default GameMatch;