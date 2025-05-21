import { Modal, Button } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './InstructionsModal.css';

function InstructionsModal({ onClose }) {
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  // Close modal with Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <Modal 
      show={true} 
      onHide={onClose} 
      centered 
      size="lg"
      className="instructions-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>How to Play Meme Game</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="step-indicator">
          {Array(totalSteps).fill().map((_, i) => (
            <div 
              key={i} 
              className={`step ${i + 1 === step ? 'active' : ''} ${i + 1 < step ? 'completed' : ''}`}
              onClick={() => setStep(i + 1)}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="step-content animated-fade-in">
            <h3>Welcome to Meme Game!</h3>
            <p>Match the funniest caption to the meme image and earn points!</p>
         
            <ul>
              <li>Each round shows one meme image and 7 possible captions</li>
              <li>Select the caption that best matches the meme</li>
              <li>Guest players: Play 1 round</li>
              <li>Registered players: Play 3 rounds and save your score</li>
            </ul>
          </div>
        )}

        {step === 2 && (
          <div className="step-content animated-fade-in">
            <h3>Race Against Time!</h3>
            <p>You have 30 seconds to choose a caption for each meme.</p>
            <div className="instruction-image">
              <div className="timer-demo">
                <div className="timer-circle">30</div>
                <div className="timer-circle warning">10</div>
                <div className="timer-circle danger">3</div>
              </div>
            </div>
            <ul>
              <li>The timer turns yellow when 10 seconds remain</li>
              <li>The timer turns red when 5 seconds remain</li>
              <li>If time runs out, you&apos;ll move to the next round without earning points</li>
            </ul>
          </div>
        )}

        {step === 3 && (
          <div className="step-content animated-fade-in">
            <h3>Scoring and Benefits</h3>
            <p>Earn points for selecting the correct captions!</p>
            <div className="instruction-image">
              <div className="score-example">
                <div className="score-card">
                  <h4>+10 POINTS</h4>
                  <p>Per correct answer</p>
                </div>
              </div>
            </div>
            <ul>
              <li>Creating an account lets you:</li>
              <li>Play full 3-round games</li>
              <li>Track your progress on your profile page</li>
              <li>Compete on the leaderboard</li>
              <li>Unlock achievements (coming soon!)</li>
            </ul>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        {step > 1 && (
          <Button variant="outline-secondary" onClick={prevStep}>
            Previous
          </Button>
        )}
        <Button variant="primary" onClick={nextStep}>
          {step === totalSteps ? "Got it!" : "Next"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

InstructionsModal.propTypes = {
  onClose: PropTypes.func.isRequired
};

export default InstructionsModal;