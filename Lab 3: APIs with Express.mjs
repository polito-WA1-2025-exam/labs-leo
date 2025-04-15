/**
 * Meme Game Express API
 */

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const { body, param, validationResult } = require('express-validator');

// Import database functions
const db = require('./database');

// Initialize Express
const app = express();
const port = 3001;

// Middleware
app.use(express.json());
app.use(morgan('dev'));
app.use(cors());

// Error handling middleware
function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

// Initialize database on startup
async function initializeDatabase() {
  try {
    await db.createTables();
    await db.populateSampleData();
    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Database initialization error:', err);
  }
}

// API Routes

// 1. Get all memes
app.get('/api/memes', async (req, res) => {
  try {
    const memes = await db.getAllMemes();
    res.json(memes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. Get a specific meme by ID
app.get('/api/memes/:id', 
  param('id').isInt().withMessage('Meme ID must be an integer'),
  validateRequest,
  async (req, res) => {
    try {
      const meme = await db.getMemeById(req.params.id);
      if (!meme) {
        return res.status(404).json({ error: 'Meme not found' });
      }
      res.json(meme);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// 3. Get all captions
app.get('/api/captions', async (req, res) => {
  try {
    const captions = await db.getAllCaptions();
    res.json(captions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 4. Get correct captions for a meme
app.get('/api/memes/:id/correct-captions',
  param('id').isInt().withMessage('Meme ID must be an integer'),
  validateRequest,
  async (req, res) => {
    try {
      const captions = await db.getCorrectCaptionsForMeme(req.params.id);
      res.json(captions);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// 5. Get random meme for a game (that hasn't been used yet)
app.get('/api/games/:id/random-meme',
  param('id').isInt().withMessage('Game ID must be an integer'),
  validateRequest,
  async (req, res) => {
    try {
      const meme = await db.getRandomMemeForGame(req.params.id);
      if (!meme) {
        return res.status(404).json({ error: 'No more unused memes available' });
      }
      
      // Get correct captions for this meme
      const correctCaptions = await db.getCorrectCaptionsForMeme(meme.id);
      
      // Get random incorrect captions
      const incorrectCaptions = await db.getRandomCaptionsExcludingCorrect(
        meme.id, 
        7 - correctCaptions.length
      );
      
      // Combine and shuffle all captions
      const allCaptions = [...correctCaptions, ...incorrectCaptions]
        .sort(() => Math.random() - 0.5);
      
      res.json({
        meme,
        captions: allCaptions
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// 6. Create a new game
app.post('/api/games',
  body('userId').optional().isInt().withMessage('User ID must be an integer'),
  validateRequest,
  async (req, res) => {
    try {
      const userId = req.body.userId || null; // Optional, null for anonymous users
      const game = await db.createGame(userId);
      res.status(201).json(game);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// 7. Add a round to a game
app.post('/api/games/:id/rounds',
  param('id').isInt().withMessage('Game ID must be an integer'),
  body('memeId').isInt().withMessage('Meme ID must be an integer'),
  body('selectedCaptionId').isInt().withMessage('Caption ID must be an integer'),
  validateRequest,
  async (req, res) => {
    try {
      // Calculate earned points based on the selected caption
      const { memeId, selectedCaptionId } = req.body;
      const correctCaptions = await db.getCorrectCaptionsForMeme(memeId);
      
      // Find if the selected caption is a correct one
      const correctCaption = correctCaptions.find(c => c.id === selectedCaptionId);
      const earnedPoints = correctCaption ? correctCaption.points : 0;
      
      // Add the round
      const round = await db.addRound(
        req.params.id,
        memeId,
        selectedCaptionId,
        earnedPoints
      );
      
      // Return round with result information
      res.status(201).json({
        ...round,
        isCorrect: !!correctCaption,
        earnedPoints,
        correctCaptions: earnedPoints === 0 ? correctCaptions : null
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// 8. Complete a game
app.put('/api/games/:id/complete',
  param('id').isInt().withMessage('Game ID must be an integer'),
  validateRequest,
  async (req, res) => {
    try {
      const result = await db.completeGame(req.params.id);
      
      if (result.changes === 0) {
        return res.status(404).json({ error: 'Game not found' });
      }
      
      // Get game summary
      const rounds = await db.getRoundsForGame(req.params.id);
      const totalScore = rounds.reduce((sum, round) => sum + round.earned_points, 0);
      
      res.json({
        gameId: parseInt(req.params.id),
        completed: true,
        rounds,
        totalScore
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// 9. Get games for a user
app.get('/api/users/:id/games',
  param('id').isInt().withMessage('User ID must be an integer'),
  validateRequest,
  async (req, res) => {
    try {
      const games = await db.getGamesForUser(req.params.id);
      res.json(games);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// 10. Get rounds for a game
app.get('/api/games/:id/rounds',
  param('id').isInt().withMessage('Game ID must be an integer'),
  validateRequest,
  async (req, res) => {
    try {
      const rounds = await db.getRoundsForGame(req.params.id);
      res.json(rounds);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// 11. Get total score for a user
app.get('/api/users/:id/score',
  param('id').isInt().withMessage('User ID must be an integer'),
  validateRequest,
  async (req, res) => {
    try {
      const totalScore = await db.getTotalScoreForUser(req.params.id);
      res.json({ userId: parseInt(req.params.id), totalScore });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// 12. Create a new caption
app.post('/api/captions',
  body('text').isString().notEmpty().withMessage('Caption text is required'),
  validateRequest,
  async (req, res) => {
    try {
      const caption = await db.createCaption(req.body.text);
      res.status(201).json(caption);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// 13. Create a new meme-caption association
app.post('/api/meme-captions',
  body('memeId').isInt().withMessage('Meme ID must be an integer'),
  body('captionId').isInt().withMessage('Caption ID must be an integer'),
  body('points').isInt({ min: 1, max: 3 }).withMessage('Points must be 1, 2, or 3'),
  validateRequest,
  async (req, res) => {
    try {
      const { memeId, captionId, points } = req.body;
      const memeCaption = await db.createMemeCaption(memeId, captionId, points);
      res.status(201).json(memeCaption);
    } catch (err) {
      console.error(err);
      if (err.message.includes('already has')) {
        return res.status(400).json({ error: err.message });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// 14. Delete a meme-caption association
app.delete('/api/meme-captions/:id',
  param('id').isInt().withMessage('Association ID must be an integer'),
  validateRequest,
  async (req, res) => {
    try {
      const result = await db.deleteMemeCaption(req.params.id);
      
      if (result.changes === 0) {
        return res.status(404).json({ error: 'Meme-caption association not found' });
      }
      
      res.status(204).end();
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Start the server
app.listen(port, async () => {
  await initializeDatabase();
  console.log(`Meme Game API server listening at http://localhost:${port}`);
});

/**
 * API Documentation for README
 *
 * [GET] /api/memes
 * Get all memes in the database
 * Sample response: [{"id":1,"image_url":"meme1.jpg","title":"Distracted Boyfriend"}, ...]
 *
 * [GET] /api/memes/:id
 * Get a specific meme by ID
 * Sample response: {"id":1,"image_url":"meme1.jpg","title":"Distracted Boyfriend"}
 * Error response: {"error":"Meme not found"} (404)
 *
 * [GET] /api/captions
 * Get all captions in the database
 * Sample response: [{"id":1,"text":"Me trying to focus on work"}, ...]
 *
 * [GET] /api/memes/:id/correct-captions
 * Get correct captions for a specific meme
 * Sample response: [{"id":1,"text":"Me trying to focus on work","points":3}, ...]
 *
 * [GET] /api/games/:id/random-meme
 * Get a random meme for a game (that hasn't been used yet in this game)
 * Sample response: {"meme":{"id":1,"image_url":"meme1.jpg","title":"Distracted Boyfriend"},"captions":[...]}
 * Error response: {"error":"No more unused memes available"} (404)
 *
 * [POST] /api/games
 * Create a new game
 * Sample request: {"userId":1} (optional, null for anonymous users)
 * Sample response: {"id":1,"userId":1,"timestamp":"2023-04-14T14:30:00.000Z","completed":0}
 *
 * [POST] /api/games/:id/rounds
 * Add a round to a game
 * Sample request: {"memeId":1,"selectedCaptionId":1}
 * Sample response: {"id":1,"gameId":1,"memeId":1,"selectedCaptionId":1,"earnedPoints":3,"isCorrect":true,"correctCaptions":null}
 *
 * [PUT] /api/games/:id/complete
 * Complete a game
 * Sample response: {"gameId":1,"completed":true,"rounds":[...],"totalScore":6}
 * Error response: {"error":"Game not found"} (404)
 *
 * [GET] /api/users/:id/games
 * Get games for a specific user
 * Sample response: [{"id":1,"user_id":1,"timestamp":"2023-04-14T14:30:00.000Z","completed":1,"total_score":6}, ...]
 *
 * [GET] /api/games/:id/rounds
 * Get rounds for a specific game
 * Sample response: [{"id":1,"game_id":1,"meme_id":1,"selected_caption_id":1,"earned_points":3,"image_url":"meme1.jpg","meme_title":"Distracted Boyfriend","selected_caption":"Me trying to focus on work"}, ...]
 *
 * [GET] /api/users/:id/score
 * Get total score for a specific user
 * Sample response: {"userId":1,"totalScore":12}
 *
 * [POST] /api/captions
 * Create a new caption
 * Sample request: {"text":"New caption text"}
 * Sample response: {"id":11,"text":"New caption text"}
 *
 * [POST] /api/meme-captions
 * Create a new meme-caption association
 * Sample request: {"memeId":1,"captionId":11,"points":1}
 * Sample response: {"id":16,"memeId":1,"captionId":11,"points":1}
 * Error response: {"error":"This meme already has 3 captions"} (400)
 * Error response: {"error":"This meme already has a caption worth 1 points"} (400)
 *
 * [DELETE] /api/meme-captions/:id
 * Delete a meme-caption association
 * Response: 204 No Content
 * Error response: {"error":"Meme-caption association not found"} (404)
 */
