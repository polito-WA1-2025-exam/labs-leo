// File: App.jsx
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Components
import Navbar from './components/Navbar';
import GamePage from './pages/GamePage';
import HistoryPage from './pages/HistoryPage';
import CreatePage from './pages/CreatePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function App() {
  const [user, setUser] = useState(null);
  
  const handleLogin = (userData) => {
    setUser(userData);
  };
  
  const handleLogout = () => {
    setUser(null);
  };
  
  return (
    <Router>
      <div className="app-container">
        <Navbar user={user} onLogout={handleLogout} />
        <Routes>
          <Route path="/game" element={<GamePage user={user} />} />
          <Route path="/history" element={user ? <HistoryPage user={user} /> : <Navigate to="/login" />} />
          <Route path="/create" element={user ? <CreatePage user={user} /> : <Navigate to="/login" />} />
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="/register" element={<RegisterPage onLogin={handleLogin} />} />
          <Route path="/" element={<Navigate to="/game" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

// File: App.css
:root {
  --primary-color: #6610f2;
  --secondary-color: #fd7e14;
  --bg-color: #f8f9fa;
  --card-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

body {
  background-color: var(--bg-color);
  font-family: 'Roboto', sans-serif;
  padding-bottom: 2rem;
}

.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.meme-container {
  max-width: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: var(--card-shadow);
  margin-bottom: 1.5rem;
}

.meme-img {
  width: 100%;
  max-height: 450px;
  object-fit: contain;
  background-color: #000;
}

.caption-card {
  border-radius: 8px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 0.75rem;
  box-shadow: var(--card-shadow);
}

.caption-card:hover {
  transform: translateY(-3px);
  border-color: var(--primary-color);
}

.caption-card.selected {
  border-color: var(--primary-color);
  background-color: rgba(102, 16, 242, 0.1);
}

.caption-card.correct {
  border-color: #28a745;
  background-color: rgba(40, 167, 69, 0.1);
}

.caption-card.incorrect {
  border-color: #dc3545;
  background-color: rgba(220, 53, 69, 0.1);
}

.caption-text {
  font-size: 1.1rem;
  font-weight: 500;
}

.round-badge {
  background-color: var(--primary-color);
  color: white;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.5rem;
}

.points-badge {
  background-color: var(--secondary-color);
  color: white;
  border-radius: 8px;
  padding: 0.25rem 0.5rem;
  font-weight: bold;
}

.result-container {
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  margin-bottom: 1.5rem;
  box-shadow: var(--card-shadow);
}

.result-correct {
  background-color: rgba(40, 167, 69, 0.1);
  border: 1px solid #28a745;
}

.result-incorrect {
  background-color: rgba(220, 53, 69, 0.1);
  border: 1px solid #dc3545;
}

.history-card {
  border-radius: 8px;
  box-shadow: var(--card-shadow);
  margin-bottom: 1rem;
  overflow: hidden;
}

.history-meme {
  height: 120px;
  object-fit: cover;
}

.history-caption {
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.auth-container {
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: var(--card-shadow);
  background-color: white;
}

// File: components/Navbar.jsx
import { Link } from 'react-router-dom';
import { Navbar, Container, Nav, Button } from 'react-bootstrap';

function NavbarComponent({ user, onLogout }) {
  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <i className="bi bi-emoji-laughing me-2"></i>Meme Game
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarNav" />
        <Navbar.Collapse id="navbarNav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/game">Play</Nav.Link>
            {user && <Nav.Link as={Link} to="/history">History</Nav.Link>}
            {user && <Nav.Link as={Link} to="/create">Create</Nav.Link>}
          </Nav>
          <div className="d-flex">
            {user ? (
              <>
                <span className="navbar-text me-3">
                  <i className="bi bi-person-circle me-1"></i>{user.username}
                </span>
                <Button variant="outline-light" size="sm" onClick={onLogout}>Logout</Button>
              </>
            ) : (
              <>
                <Button as={Link} to="/login" variant="outline-light" size="sm" className="me-2">Login</Button>
                <Button as={Link} to="/register" variant="light" size="sm">Register</Button>
              </>
            )}
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavbarComponent;

// File: components/MemeDisplay.jsx
function MemeDisplay({ meme }) {
  return (
    <div className="meme-container">
      <img 
        src={meme.imageUrl || "https://via.placeholder.com/800x500?text=Meme+Loading"} 
        alt={meme.title || "Meme"} 
        className="meme-img" 
      />
    </div>
  );
}

export default MemeDisplay;

// File: components/CaptionOption.jsx
function CaptionOption({ caption, selected, onClick, result }) {
  let className = "caption-card p-3";
  
  if (selected && result === "correct") {
    className += " correct";
  } else if (selected && result === "incorrect") {
    className += " incorrect";
  } else if (selected) {
    className += " selected";
  }
  
  return (
    <div className={className} onClick={onClick}>
      <div className="d-flex justify-content-between align-items-center">
        <p className="caption-text mb-0">{caption.text}</p>
        <div className="form-check">
          <input 
            className="form-check-input" 
            type="radio" 
            checked={selected} 
            onChange={() => {}} 
          />
          <label className="form-check-label"></label>
        </div>
      </div>
    </div>
  );
}

export default CaptionOption;

// File: components/GameResult.jsx
import { Button } from 'react-bootstrap';

function GameResult({ result, earnedPoints, correctCaptions, onNextRound }) {
  const isCorrect = result === "correct";
  
  return (
    <div className={`result-container ${isCorrect ? 'result-correct' : 'result-incorrect'} mt-4`}>
      <div className="d-flex align-items-center mb-2">
        {isCorrect ? (
          <>
            <i className="bi bi-check-circle-fill text-success me-2 fs-4"></i>
            <h4 className="mb-0">Correct!</h4>
          </>
        ) : (
          <>
            <i className="bi bi-x-circle-fill text-danger me-2 fs-4"></i>
            <h4 className="mb-0">Not quite!</h4>
          </>
        )}
      </div>
      <p className="mb-2">You earned <span className="fw-bold">{earnedPoints} points</span>{isCorrect ? '!' : '.'}</p>
      
      {!isCorrect && correctCaptions && (
        <>
          <p className="mb-0">The best captions for this meme would be:</p>
          <ul className="mt-2">
            {correctCaptions.map((caption) => (
              <li key={caption.id}>
                <strong>{caption.text}</strong> ({caption.points} points)
              </li>
            ))}
          </ul>
        </>
      )}
      
      <div className="d-grid gap-2 mt-3">
        <Button 
          variant={isCorrect ? "success" : "primary"} 
          onClick={onNextRound}
        >
          <i className="bi bi-arrow-right me-2"></i>Next Round
        </Button>
      </div>
    </div>
  );
}

export default GameResult;

// File: components/GameStats.jsx
import { Card } from 'react-bootstrap';

function GameStats({ rounds, currentRound, maxRounds }) {
  return (
    <Card className="mb-4">
      <Card.Header className="bg-primary text-white">
        <i className="bi bi-trophy me-2"></i>Current Game
      </Card.Header>
      <Card.Body>
        {rounds.map((round, index) => (
          <div key={index} className="d-flex align-items-center mb-3">
            <div className={`round-badge ${index + 1 === currentRound ? 'bg-secondary' : ''}`}>
              {index + 1}
            </div>
            <div>
              <h6 className="mb-0">{round.meme ? round.meme.title : 'Round ' + (index + 1)}</h6>
              {round.selectedCaption ? (
                <small className="text-muted">Caption: "{round.selectedCaption.text}"</small>
              ) : (
                <small className="text-muted">{index + 1 === currentRound ? 'In progress...' : 'Upcoming...'}</small>
              )}
            </div>
            {round.earnedPoints !== undefined && (
              <span className="points-badge ms-auto">{round.earnedPoints} pts</span>
            )}
          </div>
        ))}
      </Card.Body>
    </Card>
  );
}

export default GameStats;

// File: components/UserStats.jsx
import { Card } from 'react-bootstrap';

function UserStats({ totalGames, bestScore, totalScore }) {
  return (
    <Card className="mb-4">
      <Card.Header className="bg-success text-white">
        <i className="bi bi-person-badge me-2"></i>Your Stats
      </Card.Header>
      <Card.Body>
        <div className="d-flex justify-content-between mb-2">
          <span>Total Games:</span>
          <span className="fw-bold">{totalGames}</span>
        </div>
        <div className="d-flex justify-content-between mb-2">
          <span>Best Score:</span>
          <span className="fw-bold">{bestScore} points</span>
        </div>
        <div className="d-flex justify-content-between">
          <span>Total Score:</span>
          <span className="fw-bold">{totalScore} points</span>
        </div>
      </Card.Body>
    </Card>
  );
}

export default UserStats;

// File: components/HowToPlay.jsx
import { Card } from 'react-bootstrap';

function HowToPlay() {
  return (
    <Card>
      <Card.Header className="bg-info text-white">
        <i className="bi bi-question-circle me-2"></i>How to Play
      </Card.Header>
      <Card.Body>
        <ol className="mb-0">
          <li>Each game consists of 3 rounds</li>
          <li>Each round shows a random meme and 7 captions</li>
          <li>Select the caption that best fits the meme</li>
          <li>Earn 1-3 points for correct answers</li>
          <li>Try to get the highest score!</li>
        </ol>
      </Card.Body>
    </Card>
  );
}

export default HowToPlay;

// File: pages/GamePage.jsx
import { useState, useEffect } from 'react';
import { Container, Row, Col, Alert, Button } from 'react-bootstrap';
import MemeDisplay from '../components/MemeDisplay';
import CaptionOption from '../components/CaptionOption';
import GameResult from '../components/GameResult';
import GameStats from '../components/GameStats';
import UserStats from '../components/UserStats';
import HowToPlay from '../components/HowToPlay';

// Sample data (would be replaced with API calls)
const sampleMemes = [
  { id: 1, imageUrl: 'meme1.jpg', title: 'Distracted Boyfriend' },
  { id: 2, imageUrl: 'meme2.jpg', title: 'Woman Yelling at Cat' },
  { id: 3, imageUrl: 'meme3.jpg', title: 'Drake Hotline Bling' }
];

const sampleCaptions = [
  { id: 1, text: 'Me trying to focus on work' },
  { id: 2, text: 'When the WiFi drops for 0.0001 seconds' },
  { id: 3, text: 'When someone says "React is just a library"' },
  { id: 4, text: 'JavaScript: == vs ===' },
  { id: 5, text: 'Debugging your own code vs. debugging someone else\'s' },
  { id: 6, text: 'Promises vs. Callbacks' },
  { id: 7, text: 'Coffee is just bean soup' },
  { id: 8, text: 'CSS is a programming language' },
  { id: 9, text: 'Tabs vs. Spaces' },
  { id: 10, text: 'When you fix one bug and create three more' }
];

const correctCaptionsMap = {
  1: [
    { id: 1, text: 'Me trying to focus on work', points: 3 },
    { id: 5, text: 'Debugging your own code vs. debugging someone else\'s', points: 2 },
    { id: 9, text: 'Tabs vs. Spaces', points: 1 }
  ],
  2: [
    { id: 2, text: 'When the WiFi drops for 0.0001 seconds', points: 3 },
    { id: 3, text: 'When someone says "React is just a library"', points: 2 },
    { id: 10, text: 'When you fix one bug and create three more', points: 1 }
  ],
  3: [
    { id: 4, text: 'JavaScript: == vs ===', points: 3 },
    { id: 6, text: 'Promises vs. Callbacks', points: 2 },
    { id: 8, text: 'CSS is a programming language', points: 1 }
  ]
};

function GamePage({ user }) {
  const maxRounds = user ? 3 : 1;
  
  const [gameState, setGameState] = useState({
    inProgress: false,
    currentRound: 1,
    score: 0,
    rounds: [],
    gameCompleted: false
  });
  
  const [roundState, setRoundState] = useState({
    meme: null,
    captions: [],
    selectedCaptionId: null,
    submitted: false,
    result: null,
    earnedPoints: 0,
    correctCaptions: null
  });
  
  // Start a new game
  const startGame = () => {
    setGameState({
      inProgress: true,
      currentRound: 1,
      score: 0,
      rounds: Array(maxRounds).fill().map((_, i) => ({ roundNumber: i + 1 })),
      gameCompleted: false
    });
    
    startRound(1);
  };
  
  // Start a new round
  const startRound = (roundNumber) => {
    // In a real app, we would fetch this from the API
    const meme = sampleMemes[roundNumber - 1];
    
    // Get correct captions for this meme
    const correctCaptions = correctCaptionsMap[meme.id];
    
    // Get random incorrect captions to fill up to 7 total captions
    const incorrectCaptionIds = sampleCaptions
      .filter(c => !correctCaptions.some(cc => cc.id === c.id))
      .map(c => c.id);
    
    // Randomly select 4 incorrect captions
    const selectedIncorrectIds = [];
    while (selectedIncorrectIds.length < 4 && incorrectCaptionIds.length > 0) {
      const randomIndex = Math.floor(Math.random() * incorrectCaptionIds.length);
      selectedIncorrectIds.push(incorrectCaptionIds.splice(randomIndex, 1)[0]);
    }
    
    // Combine correct and incorrect captions
    const allCaptionIds = [...correctCaptions.map(c => c.id), ...selectedIncorrectIds];
    
    // Shuffle the captions
    const shuffledCaptionIds = allCaptionIds.sort(() => Math.random() - 0.5);
    
    // Get the full caption objects
    const captions = shuffledCaptionIds.map(id => 
      sampleCaptions.find(c => c.id === id)
    );
    
    setRoundState({
      meme,
      captions,
      selectedCaptionId: null,
      submitted: false,
      result: null,
      earnedPoints: 0,
      correctCaptions: null
    });
  };
  
  // Select a caption
  const selectCaption = (captionId) => {
    if (!roundState.submitted) {
      setRoundState(prev => ({
        ...prev,
        selectedCaptionId: captionId
      }));
    }
  };
  
  // Submit the answer
  const submitAnswer = () => {
    if (!roundState.selectedCaptionId) return;
    
    // Check if the selected caption is correct
    const correctCaptions = correctCaptionsMap[roundState.meme.id];
    const selectedCaption = correctCaptions.find(c => c.id === roundState.selectedCaptionId);
    
    const isCorrect = !!selectedCaption;
    const earnedPoints = selectedCaption ? selectedCaption.points : 0;
    
    // Update round state
    setRoundState(prev => ({
      ...prev,
      submitted: true,
      result: isCorrect ? "correct" : "incorrect",
      earnedPoints,
      correctCaptions: isCorrect ? null : correctCaptions
    }));
    
    // Update game state
    setGameState(prev => {
      const newRounds = [...prev.rounds];
      newRounds[prev.currentRound - 1] = {
        ...newRounds[prev.currentRound - 1],
        meme: roundState.meme,
        selectedCaption: sampleCaptions.find(c => c.id === roundState.selectedCaptionId),
        earnedPoints
      };
      
      return {
        ...prev,
        rounds: newRounds,
        score: prev.score + earnedPoints
      };
    });
  };
  
  // Move to the next round or end the game
  const nextRound = () => {
    if (gameState.currentRound < maxRounds) {
      setGameState(prev => ({
        ...prev,
        currentRound: prev.currentRound + 1
      }));
      
      startRound(gameState.currentRound + 1);
    } else {
      setGameState(prev => ({
        ...prev,
        gameCompleted: true,
        inProgress: false
      }));
    }
  };
  
  // Initialize the game on component mount
  useEffect(() => {
    startGame();
  }, []);
  
  return (
    <Container>
      {/* Game Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="bi bi-controller me-2"></i>What do you meme?
        </h2>
        <div>
          <span className="badge bg-primary me-2">Round: {gameState.currentRound}/{maxRounds}</span>
          <span className="badge bg-success">Score: {gameState.score} points</span>
        </div>
      </div>
      
      {gameState.gameCompleted ? (
        <Row>
          <Col lg={8}>
            <div className="card p-4 mb-4">
              <h3 className="text-center mb-4">Game Completed!</h3>
              <p className="text-center fs-4 mb-4">
                Your final score: <span className="fw-bold text-success">{gameState.score} points</span>
              </p>
              
              <h4 className="mb-3">Round Summary:</h4>
              {gameState.rounds.map((round, index) => (
                <div key={index} className="d-flex align-items-center mb-3 p-2 border rounded">
                  <div className="round-badge me-3">{index + 1}</div>
                  <div>
                    <h5 className="mb-1">{round.meme.title}</h5>
                    <p className="mb-0">
                      Caption: "{round.selectedCaption.text}" - 
                      <span className={`fw-bold ${round.earnedPoints > 0 ? 'text-success' : 'text-danger'}`}>
                        {round.earnedPoints} points
                      </span>
                    </p>
                  </div>
                </div>
              ))}
              
              <div className="d-grid gap-2 mt-4">
                <Button variant="primary" size="lg" onClick={startGame}>
                  <i className="bi bi-arrow-repeat me-2"></i>Play Again
                </Button>
              </div>
            </div>
          </Col>
          <Col lg={4}>
            <UserStats 
              totalGames={5} 
              bestScore={8} 
              totalScore={27} 
            />
            <HowToPlay />
          </Col>
        </Row>
      ) : (
        <Row>
          <Col lg={8}>
            {/* Meme Display */}
            {roundState.meme && <MemeDisplay meme={roundState.meme} />}
            
            {/* Instructions */}
            <Alert variant="info" className="mb-4">
              <i className="bi bi-info-circle me-2"></i>
              Select the caption that best fits this meme!
            </Alert>
            
            {/* Caption Options */}
            <div className="caption-options">
              {roundState.captions.map((caption) => (
                <CaptionOption 
                  key={caption.id}
                  caption={caption}
                  selected={roundState.selectedCaptionId === caption.id}
                  onClick={() => selectCaption(caption.id)}
                  result={roundState.submitted && roundState.selectedCaptionId === caption.id ? roundState.result : null}
                />
              ))}
            </div>
            
            {/* Submit Button (only shown if not submitted) */}
            {!roundState.submitted && (
              <div className="d-grid gap-2 mt-4">
                <Button 
                  variant="primary" 
                  size="lg" 
                  onClick={submitAnswer}
                  disabled={!roundState.selectedCaptionId}
                >
                  <i className="bi bi-check-circle me-2"></i>Submit Answer
                </Button>
              </div>
            )}
            
            {/* Result (only shown after submission) */}
            {roundState.submitted && (
              <GameResult 
                result={roundState.result}
                earnedPoints={roundState.earnedPoints}
                correctCaptions={roundState.correctCaptions}
                onNextRound={nextRound}
              />
            )}
          </Col>
          
          <Col lg={4}>
            {/* Game Stats */}
            <GameStats 
              rounds={gameState.rounds} 
              currentRound={gameState.currentRound}
              maxRounds={maxRounds}
            />
            
            {/* User Stats (only for logged-in users) */}
            {user && (
              <UserStats 
                totalGames={5} 
                bestScore={8} 
                totalScore={27} 
              />
            )}
            
            {/* How to Play */}
            <HowToPlay />
          </Col>
        </Row>
      )}
    </Container>
  );
}

export default GamePage;

// File: pages/HistoryPage.jsx
import { Container, Row, Col, Card } from 'react-bootstrap';

// Sample data
const sampleHistory = [
  {
    id: 1,
    date: '2023-04-13',
    score: 6,
    rounds: [
      { memeId: 1, memeTitle: 'Distracted Boyfriend', imageUrl: 'meme1.jpg', caption: 'Me trying to focus on work', points: 3 },
      { memeId: 2, memeTitle: 'Woman Yelling at Cat', imageUrl: 'meme2.jpg', caption: 'When someone says "React is just a library"', points: 2 },
      { memeId: 3, memeTitle: 'Drake Hotline Bling', imageUrl: 'meme3.jpg', caption: 'CSS is a programming language', points: 1 }
    ]
  },
  {
    id: 2,
    date: '2023-04-12',
    score: 8,
    rounds: [
      { memeId: 2, memeTitle: 'Woman Yelling at Cat', imageUrl: 'meme2.jpg', caption: 'When the WiFi drops for 0.0001 seconds', points: 3 },
      { memeId: 3, memeTitle: 'Drake Hotline Bling', imageUrl: 'meme3.jpg', caption: 'JavaScript: == vs ===', points: 3 },
      { memeId: 1, memeTitle: 'Distracted Boyfriend', imageUrl: 'meme1.jpg', caption: 'Debugging your own code vs. debugging someone else\'s', points: 2 }
    ]
  }
];

function HistoryPage({ user }) {
  // In a real app, we would fetch the user's game history from the API
  const gameHistory = sampleHistory;
  const totalScore = gameHistory.reduce((sum, game) => sum + game.score, 0);
  
  return (
    <Container>
      <h2 className="mb-4">
        <i className="bi bi-clock-history me-2"></i>Your Game History
      </h2>
      
      <div className="mb-4 p-3 bg-light rounded">
        <div className="d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Total Games: {gameHistory.length}</h4>
          <h4 className="mb-0">Total Score: <span className="text-success">{totalScore} points</span></h4>
        </div>
      </div>
      
      {gameHistory.map((game) => (
        <Card key={game.id} className="mb-4">
          <Card.Header className="bg-primary text-white">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Game #{game.id} - {game.date}</h5>
              <span className="badge bg-warning">Score: {game.score} points</span>
            </div>
          </Card.Header>
          <Card.Body>
            <Row>
              {game.rounds.map((round, index) => (
                <Col md={4} key={index}>
                  <div className="history-card">
                    <img 
                      src={`https://via.placeholder.com/400x200?text=${round.memeTitle}`} 
                      alt={round.memeTitle} 
                      className="w-100 history-meme"
                    />
                    <div className="p-2">
                      <h6>{round.memeTitle}</h6>
                      <p className="history-caption">"{round.caption}"</p>
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Round {index + 1}</span>
                        <span className="points-badge">{round.points} pts</span>
                      </div>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>
      ))}
    </Container>
  );
}

export default HistoryPage;

// File: pages/CreatePage.jsx
import { useState } from 'react';
import { Container, Form, Button, Row, Col, Card, Alert } from 'react-bootstrap';

// Sample data
const sampleMemes = [
  { id: 1, imageUrl: 'meme1.jpg', title: 'Distracted Boyfriend' },
  { id: 2, imageUrl: 'meme2.jpg', title: 'Woman Yelling at Cat' },
  { id: 3, imageUrl: 'meme3.jpg', title: 'Drake Hotline Bling' },
  { id: 4, imageUrl: 'meme4.jpg', title: 'Two Buttons' },
  { id: 5, imageUrl: 'meme5.jpg', title: 'Change My Mind' }
];

const sampleCaptions = [
  { id: 1, text: 'Me trying to focus on work' },
  { id: 2, text: 'When the WiFi drops for 0.0001 seconds' },
  { id: 3, text: 'When someone says "React is just a library"' },
  { id: 4, text: 'JavaScript: == vs ===' },
  { id: 5, text: 'Debugging your own code vs. debugging someone else\'s' },
  { id: 6, text: 'Promises vs. Callbacks' },
  { id: 7, text: 'Coffee is just bean soup' },
  { id: 8, text: 'CSS is a programming language' },
  { id: 9, text: 'Tabs vs. Spaces' },
  { id: 10, text: 'When you fix one bug and create three more' }
];

function CreatePage({ user }) {
  const [selectedMeme, setSelectedMeme] = useState('');
  const [captionText, setCaptionText] = useState('');
  const [captionPoints, setCaptionPoints] = useState('3');
  const [useExistingCaption, setUseExistingCaption] = useState(false);
  const [selectedExistingCaption, setSelectedExistingCaption] = useState('');
  const [alert, setAlert] = useState({ show: false, variant: '', message: '' });
  
  const handleMemeSelect = (e) => {
    setSelectedMeme(e.target.value);
  };
  
  const handleCaptionTypeChange = (e) => {
    setUseExistingCaption(e.target.value === 'existing');
  };
  
  const handleExistingCaptionSelect = (e) => {
    setSelectedExistingCaption(e.target.value);
  };
  
  const handlePointsChange = (e) => {
    setCaptionPoints(e.target.value);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!selectedMeme) {
      setAlert({
        show: true,
        variant: 'danger',
        message: 'Please select a meme'
      });
      return;
    }
    
    if (useExistingCaption && !selectedExistingCaption) {
      setAlert({
        show: true,
        variant: 'danger',
        message: 'Please select an existing caption'
      });
      return;
    }
    
    if (!useExistingCaption && !captionText.trim()) {
      setAlert({
        show: true,
        variant: 'danger',
        message: 'Please enter a caption'
      });
      return;
    }
    
    // In a real app, we would submit this to the API
    const caption = useExistingCaption 
      ? sampleCaptions.find(c => c.id === parseInt(selectedExistingCaption))
      : { text: captionText };
    
    const meme = sampleMemes.find(m => m.id === parseInt(selectedMeme));
    
    // Show success message
    setAlert({
      show: true,
      variant: 'success',
      message: `Successfully associated "${caption.text}" with "${meme.title}" for ${captionPoints} points!`
    });
    
    // Reset form
    setSelectedMeme('');
    setCaptionText('');
    setCaptionPoints('3');
    setUseExistingCaption(false);
    setSelectedExistingCaption('');
  };
  
  return (
    <Container>
      <h2 className="mb-4">
        <i className="bi bi-plus-circle me-2"></i>Create Meme-Caption Association
      </h2>
      
      {alert.show && (
        <Alert variant={alert.variant} dismissible onClose={() => setAlert({ show: false })}>
          {alert.message}
        </Alert>
      )}
      
      <Row>
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Select Meme</Form.Label>
                  <Form.Select 
                    value={selectedMeme} 
                    onChange={handleMemeSelect}
                    required
                  >
                    <option value="">Choose a meme...</option>
                    {sampleMemes.map(meme => (
                      <option key={meme.id} value={meme.id}>{meme.title}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Caption Type</Form.Label>
                  <div>
                    <Form.Check
                      inline
                      type="radio"
                      id="new-caption"
                      label="New Caption"
                      name="captionType"
                      value="new"
                      checked={!useExistingCaption}
                      onChange={handleCaptionTypeChange}
                    />
                    <Form.Check
                      inline
                      type="radio"
                      id="existing-caption"
                      label="Existing Caption"
                      name="captionType"
                      value="existing"
                      checked={useExistingCaption}
                      onChange={handleCaptionTypeChange}
                    />
                  </div>
                </Form.Group>
                
                {useExistingCaption ? (
                  <Form.Group className="mb-3">
                    <Form.Label>Select Existing Caption</Form.Label>
                    <Form.Select 
                      value={selectedExistingCaption} 
                      onChange={handleExistingCaptionSelect}
                      required
                    >
                      <option value="">Choose a caption...</option>
                      {sampleCaptions.map(caption => (
                        <option key={caption.id} value={caption.id}>{caption.text}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                ) : (
                  <Form.Group className="mb-3">
                    <Form.Label>New Caption Text</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={captionText}
                      onChange={(e) => setCaptionText(e.target.value)}
                      placeholder="Enter a funny caption..."
                      required
                    />
                  </Form.Group>
                )}
                
                <Form.Group className="mb-4">
                  <Form.Label>Points for this Caption</Form.Label>
                  <div>
                    <Form.Check
                      inline
                      type="radio"
                      id="points-3"
                      label="3 Points"
                      name="points"
                      value="3"
                      checked={captionPoints === '3'}
                      onChange={handlePointsChange}
                    />
                    <Form.Check
                      inline
                      type="radio"
                      id="points-2"
                      label="2 Points"
                      name="points"
                      value="2"
                      checked={captionPoints === '2'}
                      onChange={handlePointsChange}
                    />
                    <Form.Check
                      inline
                      type="radio"
                      id="points-1"
                      label="1 Point"
                      name="points"
                      value="1"
                      checked={captionPoints === '1'}
                      onChange={handlePointsChange}
                    />
                  </div>
                </Form.Group>
                
                <div className="d-grid">
                  <Button variant="primary" type="submit">
                    <i className="bi bi-check-lg me-2"></i>Create Association
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4}>
          <Card bg="light" className="mb-4">
            <Card.Header>
              <i className="bi bi-info-circle me-2"></i>Instructions
            </Card.Header>
            <Card.Body>
              <p>Create associations between memes and captions:</p>
              <ol>
                <li>Select a meme from the database</li>
                <li>Choose to use an existing caption or create a new one</li>
                <li>Assign point value (1-3 points)</li>
              </ol>
              <Alert variant="warning">
                <small>
                  <i className="bi bi-exclamation-triangle me-1"></i>
                  Each meme can have at most 3 correct captions, with different point values (1, 2, and 3 points)
                </small>
              </Alert>
            </Card.Body>
          </Card>
          
          {selectedMeme && (
            <Card className="mb-4">
              <Card.Header>
                <i className="bi bi-image me-2"></i>Selected Meme
              </Card.Header>
              <Card.Body className="text-center">
                <img 
                  src={`https://via.placeholder.com/300x200?text=${sampleMemes.find(m => m.id === parseInt(selectedMeme))?.title}`} 
                  alt="Selected Meme" 
                  className="img-fluid mb-2"
                />
                <h5>{sampleMemes.find(m => m.id === parseInt(selectedMeme))?.title}</h5>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default CreatePage;

// File: pages/LoginPage.jsx
import { useState } from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }
    
    // Mock login (in a real app, this would call the API)
    if (username === 'user1' && password === 'password') {
      const userData = {
        id: 1,
        username: 'user1',
        email: 'user1@example.com'
      };
      
      onLogin(userData);
      navigate('/game');
    } else {
      setError('Invalid username or password');
    }
  };
  
  return (
    <Container>
      <div className="auth-container">
        <h2 className="text-center mb-4">
          <i className="bi bi-person-circle me-2"></i>Login
        </h2>
        
        {error && (
          <Alert variant="danger">{error}</Alert>
        )}
        
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </Form.Group>
          
          <Form.Group className="mb-4">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </Form.Group>
          
          <div className="d-grid">
            <Button variant="primary" type="submit">
              <i className="bi bi-box-arrow-in-right me-2"></i>Login
            </Button>
          </div>
        </Form>
        
        <div className="text-center mt-3">
          <p>Don't have an account? <Link to="/register">Register</Link></p>
        </div>
      </div>
    </Container>
  );
}

export default LoginPage;

// File: pages/RegisterPage.jsx
import { useState } from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

function RegisterPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!username || !email || !password || !confirmPassword) {
      setError('Please fill out all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    // Mock registration (in a real app, this would call the API)
    const userData = {
      id: 1,
      username,
      email
    };
    
    onLogin(userData);
    navigate('/game');
  };
  
  return (
    <Container>
      <div className="auth-container">
        <h2 className="text-center mb-4">
          <i className="bi bi-person-plus me-2"></i>Register
        </h2>
        
        {error && (
          <Alert variant="danger">{error}</Alert>
        )}
        
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              required
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Choose a password"
              required
            />
          </Form.Group>
          
          <Form.Group className="mb-4">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
            />
          </Form.Group>
          
          <div className="d-grid">
            <Button variant="primary" type="submit">
              <i className="bi bi-person-check me-2"></i>Register
            </Button>
          </div>
        </Form>
        
        <div className="text-center mt-3">
          <p>Already have an account? <Link to="/login">Login</Link></p>
        </div>
      </div>
    </Container>
  );
}

export default RegisterPage;
