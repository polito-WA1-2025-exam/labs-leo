/**
 * MEME GAME - Timer Component
 * 
 * A circular countdown timer component that provides visual feedback
 * for the 30-second time limit in each game round. Features a 
 * color-coded progress ring and automatic time-up handling.
 * 
 * Features:
 * - Circular progress indicator with SVG animation
 * - Color-coded warning system (green → yellow → red)
 * - Automatic interval management and cleanup
 * - Zero-padding for display consistency
 * - Time-up callback functionality
 * 
 * @author Shadmehr Rahmati (s337544)
 * @course Web Applications I - 2024/2025
 */

// === IMPORTS ===
import { useEffect, useRef } from "react";
import './timer.css';              // Timer-specific styles
import PropTypes from "prop-types"; // Runtime type checking

/**
 * MyTimer Component
 * 
 * Displays a countdown timer with circular progress visualization.
 * Manages automatic countdown, visual feedback, and time-up events.
 * 
 * @param {Object} props - Component props
 * @param {number} props.seconds - Current seconds remaining
 * @param {Function} props.setSeconds - Function to update seconds state
 * @param {Function} props.endTimeFunc - Callback when timer reaches 0
 * @param {boolean} props.stopTimer - Flag to pause/stop the timer
 * @param {Function} props.setDisableBtn - Function to disable game buttons
 */
function MyTimer(props) {
  // === TIMER MANAGEMENT ===
  
  // Reference to the setInterval timer for cleanup
  const timerRef = useRef(null);
  
  // === CONFIGURATION ===
  
  // Maximum timer duration (matches game round length)
  const MAX_SECONDS = 30;
  
  // === PROGRESS CIRCLE CALCULATIONS ===
  
  // SVG circle geometry for progress indicator
  const radius = 36;                                    // Circle radius in pixels
  const circumference = 2 * Math.PI * radius;          // Full circle circumference
  
  // Calculate current progress for stroke-dashoffset animation
  // Progress decreases as time runs out (full circle at start, empty at end)
  const progress = (props.seconds / MAX_SECONDS) * circumference;
  
  // === TIMER EFFECT ===
  
  /**
   * Timer Management Effect
   * 
   * Handles the countdown interval creation, cleanup, and time-up logic.
   * Runs when stopTimer prop changes or component mounts/unmounts.
   */
  useEffect(() => {
    // Clear any existing timer to prevent race conditions and memory leaks
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Only start a new timer if conditions are met:
    // 1. Timer is not stopped (game is active)
    // 2. Time remaining is greater than 0
    if (!props.stopTimer && props.seconds > 0) {
      timerRef.current = setInterval(() => {
        props.setSeconds(prevSeconds => {
          // Disable game buttons when timer is almost up (1 second left)
          // This prevents last-second submissions that might cause issues
          if (prevSeconds === 1) {
            props.setDisableBtn(true);
          }
          
          // Handle timer expiration
          if (prevSeconds <= 1) {
            // Clean up the interval
            clearInterval(timerRef.current);
            timerRef.current = null;
            
            // Notify parent component that time is up
            props.endTimeFunc();
            
            // Return 0 to show timer completion
            return 0;
          }
          
          // Decrement the timer by 1 second
          return prevSeconds - 1;
        });
      }, 1000); // Update every 1000ms (1 second)
    }
    
    // Cleanup function for component unmount or effect re-run
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [props.stopTimer]); // Effect dependency: re-run when stopTimer changes

  // === VISUAL STYLING ===

  /**
   * Dynamic Timer Styling
   * 
   * Returns appropriate CSS class based on remaining time.
   * Provides color-coded visual warnings as time runs out.
   * 
   * @returns {string} CSS class name for timer styling
   */
  const getTimerClass = () => {
    if (props.seconds <= 5) {
      return "timer-box danger";    // Red: Critical time (≤5 seconds)
    }
    if (props.seconds <= 10) {
      return "timer-box warning";   // Yellow: Warning time (≤10 seconds)
    }
    return "timer-box";             // Green: Safe time (>10 seconds)
  };

  // === RENDER ===

  return (
    <div className={getTimerClass()}>
      {/* === CIRCULAR PROGRESS INDICATOR === */}
      <div className="timer-progress">
        <svg width="80" height="80">
          {/* Background circle (full circle, always visible) */}
          <circle 
            className="timer-progress-background"
            cx="40" 
            cy="40" 
            r={radius} 
          />
          
          {/* Progress circle (animates based on time remaining) */}
          <circle 
            className="timer-progress-value"
            cx="40" 
            cy="40" 
            r={radius}
            strokeDasharray={circumference}      // Total circumference
            strokeDashoffset={circumference - progress} // Progress offset
          />
        </svg>
      </div>
      
      {/* === TIMER TEXT DISPLAY === */}
      <span className="timer-text">
        {/* Zero-pad single digits for consistent display (e.g., "05" instead of "5") */}
        {props.seconds < 10 ? "0" + props.seconds : props.seconds}
      </span>
    </div>
  );
}

// === PROP TYPES VALIDATION ===
MyTimer.propTypes = {
  seconds: PropTypes.number.isRequired,      // Current countdown value
  setSeconds: PropTypes.func.isRequired,     // Function to update countdown
  endTimeFunc: PropTypes.func.isRequired,    // Callback for time expiration
  stopTimer: PropTypes.bool.isRequired,      // Flag to pause timer
  setDisableBtn: PropTypes.func.isRequired   // Function to disable game buttons
};

export default MyTimer;
