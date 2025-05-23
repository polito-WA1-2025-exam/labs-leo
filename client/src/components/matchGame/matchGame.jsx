/**
 * MEME GAME - Main Game Component
 * 
 * This is the core game interface component that handles the complete
 * meme matching gameplay experience. It manages game rounds, timing,
 * scoring, and user interactions for both guest and authenticated players.
 * 
 * Features:
 * - Single round for guest players
 * - Three rounds for authenticated players
 * - 30-second timer per round
 * - Real-time scoring and feedback
 * - Visual indication of correct/incorrect answers
 * - Smooth transitions between rounds
 * - Instructions modal for first-time players
 * 
 * @author Shadmehr Rahmati (s337544)
 * @course Web Applications I - 2024/2025
 */

// === IMPORTS ===
import "./game.css";
import { useEffect, useState } from "react";
import { Captions, Round } from "../../memeModels.mjs"; // Data models
import { Col, Row, Container } from 'react-bootstrap';   // Bootstrap components
import { useNavigate } from "react-router-dom";          // React Router navigation
import PropTypes from "prop-types";                      // Runtime type checking
import API from "../../API.mjs";                         // API communication layer
import MyTimer from "../timer/Timer";                    // Custom timer component
import InstructionsModal from "../instructionsModal/InstructionsModal"; // Help modal
import { useGameContext } from "../../contexts/GameContext"; // Game state context

/**
 * GameMatch Component
 * 
 * Main game interface component that orchestrates the entire gameplay experience.
 * Handles different behavior for guest vs authenticated users, manages game state,
 * timers, scoring, and navigation between rounds.
 * 
 * @param {Object} props - Component props
 * @param {Object|null} props.user - Current user object (null for guests)
 * @param {Function} props.setUser - Function to update user state
 * @param {Function} props.logout - Function to handle user logout
 * @param {Function} props.setFeedbackFromError - Function to display error messages
 */
function GameMatch(props) {
    // === HOOKS AND CONTEXT ===
    const navigate = useNavigate();
    
    // Get game context for shared state management
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

    // === GAME STATE ===
    
    // Current round data
    const [captions, setCaptions] = useState([]);    // Array of caption options
    const [meme, setMeme] = useState({});            // Current meme object

    // Game progress tracking
    const [round, setRound] = useState(1);           // Current round number (1-3)
    const [roundPoints, setRoundPoints] = useState(0); // Points earned in current round
    const [totalPoints, setTotalPoints] = useState(0); // Total points across all rounds
    const [saveRound, setSaveRound] = useState([]);   // Array storing completed rounds

    // User interaction state
    const [selectedCap, setSelectedCap] = useState(null);      // ID of selected caption
    const [correctCaptions, setCorrectCaptions] = useState([]); // IDs of correct captions
    const [disableBtn, setDisableBtn] = useState(false);       // Disable buttons during processing
    
    // Timer state
    const roundSeconds = 30;                         // Duration of each round
    const [seconds, setSeconds] = useState(roundSeconds); // Current timer value
    const [stopTimer, setStopTimer] = useState(false);   // Flag to stop/start timer

    // === INITIALIZATION ===
    
    /**
     * First-time Player Instructions
     * 
     * Check if user has played before and show instructions modal
     * Uses localStorage to track first-time players
     */
    useEffect(() => {
        const hasPlayedBefore = localStorage.getItem('memeGamePlayed');
        if (!hasPlayedBefore) {
            setShowInstructions(true);
            localStorage.setItem('memeGamePlayed', 'true');
        }
    }, []);

    // === API FUNCTIONS ===

    /**
     * Get Round Data for Guest Players
     * 
     * Fetches a single random round for non-authenticated users.
     * Guest players only get one round per session.
     */
    const getCaptionSingle = async () => {
        setIsLoading(true);
        try {
            const response = await API.getCaptionSingle();
            setMeme(response.meme);
            setCaptions(response.captions);
        } catch (error) {
            console.error('Error fetching guest round:', error);
            setFeedbackFromError(error);
        } finally {
            // Reset UI state for new round
            setDisableBtn(false);
            setStopTimer(false);
            setSeconds(roundSeconds);
            setCorrectCaptions([]);
            setSelectedCap(null);
            setIsLoading(false);
        }
    };

    /**
     * Get Round Data for Authenticated Players
     * 
     * Fetches round data for logged-in users playing multi-round games.
     * Server tracks used memes to prevent repetition within the same game.
     */
    const getCaptionsMulti = async () => {
        setIsLoading(true);
        try {
            const response = await API.getCaptionMulti();
            setMeme(response.meme);
            setCaptions(response.captions);
        } catch (error) {
            console.error('Error fetching multi-round:', error);
            setFeedbackFromError(error);
        } finally {
            // Reset UI state for new round
            setDisableBtn(false);
            setStopTimer(false);
            setSeconds(roundSeconds);
            setCorrectCaptions([]);
            setSelectedCap(null);
            setIsLoading(false);
        }
    };

    /**
     * Initialize Match Session
     * 
     * Prepares server session for new multi-round game.
     * Resets points and used memes list on the server.
     */
    const initMatch = async () => {
        setSelectedCap(null);
        setSaveRound([]);

        try {
            await API.initMatchLogged();
        } catch (error) {
            console.error('Error initializing match:', error);
            setFeedbackFromError(error);
        }
    };

    // === GAME INTERACTION HANDLERS ===

    /**
     * Handle Caption Selection
     * 
     * Called when user clicks on a caption button.
     * Prevents multiple selections and triggers answer validation.
     * 
     * @param {Object} cap - Selected caption object
     */
    const checkSelection = (cap) => {
        if (disableBtn) return; // Prevent multiple selections during processing
        
        // Stop timer and disable further input
        setStopTimer(true);
        setDisableBtn(true);
        
        // Process the selection
        sendRoundResults(cap);
    };

    /**
     * Process Round Results
     * 
     * Sends user's answer to server for validation and handles the response.
     * Manages scoring, feedback display, and round progression.
     * 
     * @param {Object} cap - Selected caption (or timeout placeholder)
     */
    const sendRoundResults = async (cap) => {
        try {
            // Create round object with user's selection
            let sendRound = new Round(
                props.user ? props.user.id : 0,    // User ID (0 for guests)
                meme,                              // Current meme
                captions,                          // All caption options
                0,                                 // Points (calculated by server)
                cap,                               // Selected caption
                0,                                 // Points (calculated by server)
                round,                             // Current round number
                []                                 // Correct captions (filled by server)
            );
            
            let res = '';
            let correctCapId = [];
            
            // Send to appropriate API endpoint based on user status
            if (props.user) {
                res = await API.checkRoundLog(sendRound);
            } else {
                res = await API.checkRound(sendRound);
            }
            
            // Process server response
            if (res) {
                sendRound.points = res.points;
                sendRound.correctCaption = res.correctCap;
                correctCapId = res.correctCapId;
                setTotalPoints(prevTotal => prevTotal + res.points);
            }
            
            setRoundPoints(sendRound.points);
            setCorrectCaptions(correctCapId);

            // Handle round progression based on user type and round number
            if (props.user && round < 3) {
                // Authenticated user - save round and continue to next
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
                // Authenticated user - final round, end game
                setTimeout(() => callEndGame(sendRound), 3000);
            } else {
                // Guest player - show final message and return to home
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
            console.error('Error processing round results:', error);
            setFeedbackFromError(error);
        }
    };

    /**
     * Trigger End Game Process
     * 
     * Wrapper function to call endMatch with the final round data.
     * 
     * @param {Object} sendRound - Final round object
     */
    const callEndGame = (sendRound) => {
        endMatch(sendRound);
    }

    /**
     * End Match and Save Results
     * 
     * Called when authenticated user completes all 3 rounds.
     * Saves complete match to database and updates user's total points.
     * 
     * @param {Object} sendRound - Final round object
     */
    const endMatch = async (sendRound) => {
        try {
            setSelectedCap(null);
            let match_points = 0;
            let match_id = 0;
            
            // Prepare complete match data for database
            const send_obj = {
                user_id: props.user.id,
                match_details: [...saveRound, sendRound] // All rounds including final
            };

            // Show end game transition
            setTransitionMessage("Game Complete!");
            setShowRoundTransition(true);
            
            // Save match to database
            const result = await API.createMatch(send_obj);
            match_points = result.points;
            match_id = result.id;

            // Update user's total points in local state
            const tot_point = props.user.points + match_points;
            props.setUser({
                id: props.user.id,
                name: props.user.name,
                points: tot_point,
                username: props.user.username
            });
            
            // Navigate to results page
            setTimeout(() => {
                setShowRoundTransition(false);
                navigate('/resume', { state: { match_id: match_id } });
            }, 2000);
        } catch (error) {
            console.error('Error ending match:', error);
            setFeedbackFromError(error);
        }
    };

    /**
     * Handle Timer Expiration
     * 
     * Called when the 30-second timer runs out.
     * Submits a "time up" answer with no selection.
     */
    const endTimerFunc = () => {
        if (disableBtn) return; // Prevent multiple calls if already processing
        
        // Create a placeholder caption object for "time up" scenario
        sendRoundResults(new Captions(0, "Not provided, time up!", 0));
    };

    // === EFFECT HOOKS ===

    /**
     * Round Initialization Effect
     * 
     * Runs when component mounts or round number changes.
     * Initializes match session for logged users and fetches round data.
     */
    useEffect(() => {
        if (props.user) {
            // Authenticated user logic
            if (round === 1) {
                initMatch(); // Initialize session for first round
            }
            
            if (round <= 3) {
                getCaptionsMulti(); // Fetch round data
            }
        } else {
            // Guest user logic
            getCaptionSingle();
        }
        
        // Reset round points for new round
        setRoundPoints(0);
    }, [round]); // Dependency: re-run when round changes

    // === RENDER ===

    // Loading state display
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
            {/* === MODAL OVERLAYS === */}
            
            {/* Instructions modal for first-time players */}
            {showInstructions && (
                <InstructionsModal onClose={() => setShowInstructions(false)} />
            )}
            
            {/* Round transition animation overlay */}
            <div className={`round-transition ${showRoundTransition ? 'active' : ''}`}>
                <div className="round-transition-content">
                    {transitionMessage}
                </div>
            </div>

            {/* === GAME HEADER === */}
            <div className="game-title">
                {props.user ? `Round ${round} of 3` : 'Guest Game (Round 1)'}
            </div>
            
            {/* Points feedback display */}
            <div className="resume-points">
                {disableBtn && roundPoints > 0 ? `You earned +${roundPoints} points!` : ''}
            </div>
            
            {/* === MAIN GAME LAYOUT === */}
            <Row>
                {/* === LEFT SIDE: MEME AND TIMER === */}
                <Col md={6} className="side-container">
                    {/* Meme image display */}
                    <div className="meme-container">
                        <img src={meme?.img_url} alt="Meme" />
                    </div>
                    
                    {/* Timer component */}
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
                
                {/* === RIGHT SIDE: CAPTION OPTIONS === */}
                <Col md={6} className="captions-container">
                    {captions.map((cap) => (
                        <button 
                            onClick={() => {
                                setSelectedCap(cap.id);
                                checkSelection(cap);
                            }} 
                            disabled={disableBtn}
                            key={round + "_" + cap.id} // Unique key for each round/caption
                            className={`
                                ${!disableBtn ? "hover" : ""}
                                ${disableBtn && correctCaptions.includes(cap.id) ? "green-class" : ""}
                                ${disableBtn && cap.id === selectedCap && !correctCaptions.includes(cap.id) ? "red-class" : ""}
                                ${disableBtn && cap.id === selectedCap ? "btn-selected" : ""}
                            `}
                        >
                            {cap.text}
                            
                            {/* Feedback overlays for correct answers */}
                            {disableBtn && correctCaptions.includes(cap.id) && 
                                <span className="caption-feedback correct show">Correct!</span>
                            }
                            
                            {/* Feedback overlays for incorrect selected answers */}
                            {disableBtn && cap.id === selectedCap && !correctCaptions.includes(cap.id) && 
                                <span className="caption-feedback incorrect show">Incorrect!</span>
                            }
                        </button>
                    ))}
                </Col>
            </Row>

            {/* === FLOATING HELP BUTTON === */}
            <div className="help-button" onClick={() => setShowInstructions(true)}>
                <i className="bi bi-question-lg"></i>
            </div>
        </Container>
    );
}

// === PROP TYPES VALIDATION ===
GameMatch.propTypes = {
    user: PropTypes.object,               // Current user object (can be null)
    setUser: PropTypes.func,              // Function to update user state
    logout: PropTypes.func,               // Function to handle logout
    setFeedbackFromError: PropTypes.func, // Function to display error messages
};

export default GameMatch;
