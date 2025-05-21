import { createContext, useState, useContext } from 'react';
import PropTypes from 'prop-types';

// Create the context
const GameContext = createContext();

// Custom hook to use the game context
export const useGameContext = () => useContext(GameContext);

// Provider component
export const GameProvider = ({ children, user, setUser, setFeedbackFromError }) => {
  // Game state
  const [isLoading, setIsLoading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showRoundTransition, setShowRoundTransition] = useState(false);
  const [transitionMessage, setTransitionMessage] = useState('');

  // Timer state
  const [seconds, setSeconds] = useState(30);
  const [stopTimer, setStopTimer] = useState(false);
  
  const contextValue = {
    // Game state
    isLoading,
    setIsLoading,
    user,
    setUser,
    showInstructions,
    setShowInstructions,
    showRoundTransition,
    setShowRoundTransition,
    transitionMessage,
    setTransitionMessage,
    setFeedbackFromError,
    
    // Timer state
    seconds,
    setSeconds,
    stopTimer,
    setStopTimer
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};

GameProvider.propTypes = {
  children: PropTypes.node.isRequired,
  user: PropTypes.object,
  setUser: PropTypes.func,
  setFeedbackFromError: PropTypes.func.isRequired
};

export default GameContext;