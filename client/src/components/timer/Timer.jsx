import { useEffect, useRef } from "react";
import './timer.css';
import PropTypes from "prop-types";

function MyTimer(props) {
  const timerRef = useRef(null);
  const MAX_SECONDS = 30; // Maximum timer value
  
  // Calculate the circumference for the progress circle
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  
  // Calculate progress for the SVG circle
  const progress = (props.seconds / MAX_SECONDS) * circumference;
  
  useEffect(() => {
    // Clear any existing timer to prevent race conditions
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Only start a new timer if we're not stopped and have time left
    if (!props.stopTimer && props.seconds > 0) {
      timerRef.current = setInterval(() => {
        props.setSeconds(prevSeconds => {
          // When we reach 1 second, disable interaction to prevent multiple calls
          if (prevSeconds === 1) {
            props.setDisableBtn(true);
          }
          
          // If we've reached 0, clear the interval and call the time up function
          if (prevSeconds <= 1) {
            clearInterval(timerRef.current);
            timerRef.current = null;
            props.endTimeFunc();
            return 0;
          }
          
          return prevSeconds - 1;
        });
      }, 1000);
    }
    
    // Cleanup function to prevent memory leaks
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [props.stopTimer]); // Only re-run effect when stopTimer changes

  // Determine timer class based on remaining time
  const getTimerClass = () => {
    if (props.seconds <= 5) return "timer-box danger";
    if (props.seconds <= 10) return "timer-box warning";
    return "timer-box";
  };

  return (
    <div className={getTimerClass()}>
      {/* Circular progress indicator */}
      <div className="timer-progress">
        <svg width="80" height="80">
          <circle 
            className="timer-progress-background"
            cx="40" 
            cy="40" 
            r={radius} 
          />
          <circle 
            className="timer-progress-value"
            cx="40" 
            cy="40" 
            r={radius}
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
          />
        </svg>
      </div>
      
      {/* Timer text */}
      <span className="timer-text">
        {props.seconds < 10 ? "0" + props.seconds : props.seconds}
      </span>
    </div>
  );
}

MyTimer.propTypes = {
  seconds: PropTypes.number.isRequired,
  setSeconds: PropTypes.func.isRequired,
  endTimeFunc: PropTypes.func.isRequired,
  stopTimer: PropTypes.bool.isRequired,
  setDisableBtn: PropTypes.func.isRequired
};

export default MyTimer;