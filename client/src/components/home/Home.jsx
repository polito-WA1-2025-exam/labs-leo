import { useNavigate } from 'react-router-dom';
import './home.css';
import { Container } from 'react-bootstrap';
import InstructionsModal from '../instructionsModal/InstructionsModal';
import { useState } from 'react';

function Home() {
    const navigate = useNavigate();
    const [showInstructions, setShowInstructions] = useState(false);

    return (
        <Container fluid className="home-container">
            {showInstructions && (
                <InstructionsModal onClose={() => setShowInstructions(false)} />
            )}
            
            <div className="home-card">
                <h1 className="title">Meme Match Game</h1>
                <p className="subtitle">
                    Test your meme knowledge by matching captions to images. 
                    Play rounds, earn points, and have fun!
                </p>
                <div className="home-buttons">
                    <button 
                        onClick={() => navigate('/game')} 
                        className="btn-home"
                    >
                        Start Game
                    </button>
                    <button 
                        onClick={() => setShowInstructions(true)} 
                        className="btn-instructions"
                    >
                        How to Play
                    </button>
                </div>
            </div>
        </Container>
    );
}

export default Home;