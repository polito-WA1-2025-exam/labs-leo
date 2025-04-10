const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

// User APIs
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    // Hash password and create user
    // Return user without password
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    // Verify credentials and create session
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Game APIs
app.post('/api/games', async (req, res) => {
  try {
    const { userId } = req.body;
    // Create new game
    const result = await gameDAO.createGame(userId);
    res.status(201).json({ id: result.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/games/:gameId', async (req, res) => {
  try {
    const gameId = parseInt(req.params.gameId);
    const game = await gameDAO.getGameById(gameId);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    res.json(game);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Round APIs
app.post('/api/games/:gameId/rounds', async (req, res) => {
  try {
    const gameId = parseInt(req.params.gameId);
    // Get current round number
    const roundCount = await dbGet(
      'SELECT COUNT(*) as count FROM rounds WHERE game_id = ?',
      [gameId]
    );
    
    if (roundCount.count >= 3) {
      return res.status(400).json({ error: 'Game already has 3 rounds' });
    }
    
    // Get random meme for this round
    const meme = await getRandomMemeForGame(gameId);
    
    // Get 7 captions (3 correct, 4 wrong)
    const captions = await getCaptionsForRound(meme.id);
    
    // Create round in database
    const roundNumber = roundCount.count + 1;
    const result = await dbRun(
      'INSERT INTO rounds (game_id, meme_id, round_number) VALUES (?, ?, ?)',
      [gameId, meme.id, roundNumber]
    );
    
    res.status(201).json({
      roundId: result.id,
      roundNumber,
      meme,
      captions: captions.map(c => ({ id: c.id, text: c.text }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Submit caption selection for a round
app.put('/api/rounds/:roundId/select', async (req, res) => {
  try {
    const roundId = parseInt(req.params.roundId);
    const { captionId } = req.body;
    
    // Get round info
    const round = await dbGet(
      'SELECT r.*, g.user_id FROM rounds r JOIN games g ON r.game_id = g.id WHERE r.id = ?',
      [roundId]
    );
    
    if (!round) {
      return res.status(404).json({ error: 'Round not found' });
    }
    
    // Check if caption is valid for this meme
    const memeCaption = await dbGet(
      'SELECT points FROM meme_captions WHERE meme_id = ? AND caption_id = ?',
      [round.meme_id, captionId]
    );
    
    const score = memeCaption ? memeCaption.points : 0;
    
    // Update round with selection and score
    await dbRun(
      'UPDATE rounds SET selected_caption_id = ?, score = ? WHERE id = ?',
      [captionId, score, roundId]
    );
    
    // If this was the third round, complete the game
    if (round.round_number === 3) {
      const totalScore = await dbGet(
        'SELECT SUM(score) as total FROM rounds WHERE game_id = ?',
        [round.game_id]
      );
      
      await gameDAO.completeGame(round.game_id, totalScore.total);
    }
    
    // Get correct captions if user was wrong
    let bestCaptions = [];
    if (score === 0) {
      bestCaptions = await dbAll(`
        SELECT c.id, c.text, mc.points
        FROM captions c
        JOIN meme_captions mc ON c.id = mc.caption_id
        WHERE mc.meme_id = ?
        ORDER BY mc.points DESC
        LIMIT 2
      `, [round.meme_id]);
    }
    
    res.json({
      roundId,
      score,
      isCorrect: score > 0,
      bestCaptions: score === 0 ? bestCaptions : []
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user game history
app.get('/api/users/:userId/games', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const games = await gameDAO.getUserGames(userId);
    
    // Get detailed round info for each completed game
    const gamesWithRounds = await Promise.all(
      games.filter(g => g.completed).map(async game => {
        const rounds = await dbAll(`
          SELECT r.*, m.image_url, c.text as selected_caption
          FROM rounds r
          JOIN memes m ON r.meme_id = m.id
          LEFT JOIN captions c ON r.selected_caption_id = c.id
          WHERE r.game_id = ?
          ORDER BY r.round_number
        `, [game.id]);
        
        return { ...game, rounds };
      })
    );
    
    res.json(gamesWithRounds);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API for logged users to create new meme-caption associations
app.post('/api/meme-captions', async (req, res) => {
  try {
    const { memeId, captionText, points, userId } = req.body;
    
    if (![1, 2, 3].includes(points)) {
      return res.status(400).json({ error: 'Points must be 1, 2, or 3' });
    }
    
    // Find or create caption
    let caption;
    caption = await dbGet('SELECT * FROM captions WHERE text = ?', [captionText]);
    
    if (!caption) {
      const result = await dbRun('INSERT INTO captions (text) VALUES (?)', [captionText]);
      caption = { id: result.id, text: captionText };
    }
    
    // Create association
    const existingAssoc = await dbGet(
      'SELECT * FROM meme_captions WHERE meme_id = ? AND caption_id = ?',
      [memeId, caption.id]
    );
    
    if (existingAssoc) {
      return res.status(400).json({ error: 'This meme-caption association already exists' });
    }
    
    // Check how many captions with this point value already exist for this meme
    const existingWithPoints = await dbGet(
      'SELECT COUNT(*) as count FROM meme_captions WHERE meme_id = ? AND points = ?',
      [memeId, points]
    );
    
    if (existingWithPoints.count > 0) {
      return res.status(400).json({ 
        error: `A caption with ${points} points already exists for this meme` 
      });
    }
    
    await dbRun(
      'INSERT INTO meme_captions (meme_id, caption_id, points, created_by) VALUES (?, ?, ?, ?)',
      [memeId, caption.id, points, userId]
    );
    
    res.status(201).json({
      memeId,
      captionId: caption.id,
      captionText: caption.text,
      points
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
