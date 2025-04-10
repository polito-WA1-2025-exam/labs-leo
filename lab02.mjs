const sqlite = require('sqlite3');
const db = new sqlite.Database('./meme_game.db');

// Database wrapper for promises
const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// Example methods for memes
const memeDAO = {
  getAllMemes: async () => {
    return await dbAll('SELECT * FROM memes');
  },
  
  getMemeById: async (id) => {
    return await dbGet('SELECT * FROM memes WHERE id = ?', [id]);
  },
  
  createMeme: async (imageUrl) => {
    return await dbRun('INSERT INTO memes (image_url) VALUES (?)', [imageUrl]);
  },
  
  // Other methods for updating and deleting memes
};

// Example methods for generating game rounds
const gameDAO = {
  createGame: async (userId) => {
    return await dbRun('INSERT INTO games (user_id) VALUES (?)', [userId]);
  },
  
  completeGame: async (gameId, totalScore) => {
    return await dbRun('UPDATE games SET completed = 1, total_score = ? WHERE id = ?', 
                      [totalScore, gameId]);
  },
  
  getUserGames: async (userId) => {
    return await dbAll(`
      SELECT g.*, COUNT(r.id) as rounds_played 
      FROM games g 
      LEFT JOIN rounds r ON g.id = r.game_id
      WHERE g.user_id = ?
      GROUP BY g.id
      ORDER BY g.date_time DESC
    `, [userId]);
  },
  
  // Methods for managing rounds
};

// Example method to get random meme for game
const getRandomMemeForGame = async (gameId) => {
  // Get memes that haven't been used in this game
  const usedMemes = await dbAll(
    'SELECT meme_id FROM rounds WHERE game_id = ?', [gameId]
  );
  
  const usedMemeIds = usedMemes.map(row => row.meme_id);
  
  let whereClause = usedMemeIds.length > 0 
    ? `WHERE m.id NOT IN (${usedMemeIds.join(',')})` 
    : '';
  
  // Get random meme
  return await dbGet(`
    SELECT m.* FROM memes m
    ${whereClause}
    ORDER BY RANDOM()
    LIMIT 1
  `);
};

// Method to get captions for a round
const getCaptionsForRound = async (memeId) => {
  // Get the three correct captions for this meme
  const correctCaptions = await dbAll(`
    SELECT c.id, c.text, mc.points 
    FROM captions c
    JOIN meme_captions mc ON c.id = mc.caption_id
    WHERE mc.meme_id = ?
    ORDER BY mc.points DESC
  `, [memeId]);
  
  if (correctCaptions.length !== 3) {
    throw new Error('Meme must have exactly 3 correct captions');
  }
  
  // Get 4 additional wrong captions
  const wrongCaptions = await dbAll(`
    SELECT c.id, c.text, 0 as points
    FROM captions c
    WHERE c.id NOT IN (
      SELECT caption_id FROM meme_captions WHERE meme_id = ?
    )
    ORDER BY RANDOM()
    LIMIT 4
  `, [memeId]);
  
  // Combine and shuffle
  return [...correctCaptions, ...wrongCaptions]
    .sort(() => Math.random() - 0.5);
};
