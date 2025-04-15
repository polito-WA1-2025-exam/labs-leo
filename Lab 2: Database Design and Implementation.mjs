/**
 * Database Schema for Meme Game
 * 
 * Tables:
 * 1. users - Stores registered users
 * 2. memes - Stores meme images
 * 3. captions - Stores possible captions
 * 4. meme_captions - Stores associations between memes and captions, including points
 * 5. games - Stores game sessions
 * 6. rounds - Stores individual rounds in a game
 */

const sqlite = require('sqlite3').verbose();
const db = new sqlite.Database('./meme_game.db');

// Create database tables
function createTables() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create users table
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      )`, (err) => {
        if (err) reject(err);
      });

      // Create memes table
      db.run(`CREATE TABLE IF NOT EXISTS memes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        image_url TEXT NOT NULL,
        title TEXT NOT NULL
      )`, (err) => {
        if (err) reject(err);
      });

      // Create captions table
      db.run(`CREATE TABLE IF NOT EXISTS captions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT NOT NULL UNIQUE
      )`, (err) => {
        if (err) reject(err);
      });

      // Create meme_captions table (association table)
      db.run(`CREATE TABLE IF NOT EXISTS meme_captions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        meme_id INTEGER NOT NULL,
        caption_id INTEGER NOT NULL,
        points INTEGER NOT NULL CHECK (points IN (1, 2, 3)),
        FOREIGN KEY (meme_id) REFERENCES memes (id) ON DELETE CASCADE,
        FOREIGN KEY (caption_id) REFERENCES captions (id) ON DELETE CASCADE,
        UNIQUE (meme_id, caption_id),
        UNIQUE (meme_id, points)
      )`, (err) => {
        if (err) reject(err);
      });

      // Create games table
      db.run(`CREATE TABLE IF NOT EXISTS games (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        timestamp TEXT NOT NULL,
        completed BOOLEAN NOT NULL DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
      )`, (err) => {
        if (err) reject(err);
      });

      // Create rounds table
      db.run(`CREATE TABLE IF NOT EXISTS rounds (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        game_id INTEGER NOT NULL,
        meme_id INTEGER NOT NULL,
        selected_caption_id INTEGER,
        earned_points INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (game_id) REFERENCES games (id) ON DELETE CASCADE,
        FOREIGN KEY (meme_id) REFERENCES memes (id) ON DELETE CASCADE,
        FOREIGN KEY (selected_caption_id) REFERENCES captions (id) ON DELETE SET NULL
      )`, (err) => {
        if (err) reject(err);
      });

      resolve();
    });
  });
}

// Insert sample data
function populateSampleData() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Sample users
      db.run(`INSERT OR IGNORE INTO users (username, email, password) VALUES 
        ('user1', 'user1@example.com', 'password1'),
        ('user2', 'user2@example.com', 'password2')
      `, (err) => {
        if (err) reject(err);
      });

      // Sample memes
      db.run(`INSERT OR IGNORE INTO memes (image_url, title) VALUES 
        ('meme1.jpg', 'Distracted Boyfriend'),
        ('meme2.jpg', 'Woman Yelling at Cat'),
        ('meme3.jpg', 'Drake Hotline Bling'),
        ('meme4.jpg', 'Two Buttons'),
        ('meme5.jpg', 'Change My Mind')
      `, (err) => {
        if (err) reject(err);
      });

      // Sample captions
      db.run(`INSERT OR IGNORE INTO captions (text) VALUES 
        ('Me trying to focus on work'),
        ('When the WiFi drops for 0.0001 seconds'),
        ('When someone says "React is just a library"'),
        ('JavaScript: == vs ==='),
        ('Debugging your own code vs. debugging someone else''s'),
        ('Promises vs. Callbacks'),
        ('Coffee is just bean soup'),
        ('CSS is a programming language'),
        ('Tabs vs. Spaces'),
        ('When you fix one bug and create three more')
      `, (err) => {
        if (err) reject(err);
      });

      // Sample meme-caption associations
      // First, let's make sure the tables are populated
      db.get("SELECT COUNT(*) as count FROM memes", (err, row) => {
        if (err) reject(err);
        if (row.count === 5) {
          db.run(`INSERT OR IGNORE INTO meme_captions (meme_id, caption_id, points) VALUES 
            (1, 1, 3), (1, 5, 2), (1, 9, 1),
            (2, 2, 3), (2, 3, 2), (2, 10, 1),
            (3, 4, 3), (3, 6, 2), (3, 8, 1),
            (4, 4, 3), (4, 9, 2), (4, 6, 1),
            (5, 7, 3), (5, 8, 2), (5, 3, 1)
          `, (err) => {
            if (err) reject(err);
            resolve();
          });
        }
      });
    });
  });
}

// Data retrieval functions

// Get all memes
function getAllMemes() {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM memes", (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// Get a specific meme by ID
function getMemeById(id) {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM memes WHERE id = ?", [id], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

// Get all captions
function getAllCaptions() {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM captions", (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// Get correct captions for a meme
function getCorrectCaptionsForMeme(memeId) {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT c.id, c.text, mc.points
      FROM captions c
      JOIN meme_captions mc ON c.id = mc.caption_id
      WHERE mc.meme_id = ?
      ORDER BY mc.points DESC
    `, [memeId], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// Get random captions excluding correct ones for a meme (to fill the 7 options)
function getRandomCaptionsExcludingCorrect(memeId, limit) {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT c.id, c.text
      FROM captions c
      WHERE c.id NOT IN (
        SELECT caption_id FROM meme_captions WHERE meme_id = ?
      )
      ORDER BY RANDOM()
      LIMIT ?
    `, [memeId, limit], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// Get a random meme that hasn't been used in a game
function getRandomMemeForGame(gameId) {
  return new Promise((resolve, reject) => {
    db.get(`
      SELECT m.*
      FROM memes m
      WHERE m.id NOT IN (
        SELECT meme_id FROM rounds WHERE game_id = ?
      )
      ORDER BY RANDOM()
      LIMIT 1
    `, [gameId], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

// Get all games for a user
function getGamesForUser(userId) {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT g.*, 
        (SELECT SUM(earned_points) FROM rounds WHERE game_id = g.id) as total_score
      FROM games g
      WHERE g.user_id = ? AND g.completed = 1
      ORDER BY g.timestamp DESC
    `, [userId], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// Get rounds for a game
function getRoundsForGame(gameId) {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT r.*, m.image_url, m.title as meme_title, c.text as selected_caption
      FROM rounds r
      JOIN memes m ON r.meme_id = m.id
      LEFT JOIN captions c ON r.selected_caption_id = c.id
      WHERE r.game_id = ?
      ORDER BY r.id
    `, [gameId], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// Get total score for a user
function getTotalScoreForUser(userId) {
  return new Promise((resolve, reject) => {
    db.get(`
      SELECT SUM(r.earned_points) as total_score
      FROM rounds r
      JOIN games g ON r.game_id = g.id
      WHERE g.user_id = ? AND g.completed = 1
    `, [userId], (err, row) => {
      if (err) reject(err);
      else resolve(row ? row.total_score || 0 : 0);
    });
  });
}

// Data modification functions

// Create a new game
function createGame(userId = null) {
  return new Promise((resolve, reject) => {
    const timestamp = new Date().toISOString();
    db.run(`
      INSERT INTO games (user_id, timestamp, completed)
      VALUES (?, ?, 0)
    `, [userId, timestamp], function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, userId, timestamp, completed: 0 });
    });
  });
}

// Add a round to a game
function addRound(gameId, memeId, selectedCaptionId, earnedPoints) {
  return new Promise((resolve, reject) => {
    db.run(`
      INSERT INTO rounds (game_id, meme_id, selected_caption_id, earned_points)
      VALUES (?, ?, ?, ?)
    `, [gameId, memeId, selectedCaptionId, earnedPoints], function(err) {
      if (err) reject(err);
      else resolve({ 
        id: this.lastID, 
        gameId, 
        memeId, 
        selectedCaptionId, 
        earnedPoints 
      });
    });
  });
}

// Complete a game
function completeGame(gameId) {
  return new Promise((resolve, reject) => {
    db.run(`
      UPDATE games
      SET completed = 1
      WHERE id = ?
    `, [gameId], function(err) {
      if (err) reject(err);
      else resolve({ changes: this.changes });
    });
  });
}

// Create a new meme-caption association
function createMemeCaption(memeId, captionId, points) {
  return new Promise((resolve, reject) => {
    // First check if this meme already has 3 captions
    db.get(`
      SELECT COUNT(*) as count
      FROM meme_captions
      WHERE meme_id = ?
    `, [memeId], (err, row) => {
      if (err) reject(err);
      else if (row.count >= 3) {
        reject(new Error('This meme already has 3 captions'));
      } else {
        // Check if this meme already has a caption with these points
        db.get(`
          SELECT COUNT(*) as count
          FROM meme_captions
          WHERE meme_id = ? AND points = ?
        `, [memeId, points], (err, row) => {
          if (err) reject(err);
          else if (row.count > 0) {
            reject(new Error(`This meme already has a caption worth ${points} points`));
          } else {
            // Create the association
            db.run(`
              INSERT INTO meme_captions (meme_id, caption_id, points)
              VALUES (?, ?, ?)
            `, [memeId, captionId, points], function(err) {
              if (err) reject(err);
              else resolve({ 
                id: this.lastID, 
                memeId, 
                captionId, 
                points 
              });
            });
          }
        });
      }
    });
  });
}

// Create a new caption
function createCaption(text) {
  return new Promise((resolve, reject) => {
    db.run(`
      INSERT INTO captions (text)
      VALUES (?)
    `, [text], function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, text });
    });
  });
}

// Delete a meme-caption association
function deleteMemeCaption(id) {
  return new Promise((resolve, reject) => {
    db.run(`
      DELETE FROM meme_captions
      WHERE id = ?
    `, [id], function(err) {
      if (err) reject(err);
      else resolve({ changes: this.changes });
    });
  });
}

// Example of database usage
async function testDatabase() {
  try {
    await createTables();
    await populateSampleData();
    
    // Test data retrieval
    const memes = await getAllMemes();
    console.log('All memes:', memes);
    
    const correctCaptions = await getCorrectCaptionsForMeme(1);
    console.log('Correct captions for meme 1:', correctCaptions);
    
    const randomCaptions = await getRandomCaptionsExcludingCorrect(1, 4);
    console.log('Random incorrect captions for meme 1:', randomCaptions);
    
    // Test data modification
    const game = await createGame(1); // For user with ID 1
    console.log('Created game:', game);
    
    // Let's assume the user got a question right
    const round = await addRound(game.id, 1, 1, 3);
    console.log('Added round:', round);
    
    // Complete the game after 3 rounds
    await addRound(game.id, 2, 3, 2);
    await addRound(game.id, 3, 8, 1);
    const completedGame = await completeGame(game.id);
    console.log('Completed game:', completedGame);
    
    // Get user's games
    const userGames = await getGamesForUser(1);
    console.log('Games for user 1:', userGames);
    
    // Get rounds for a game
    const gameRounds = await getRoundsForGame(game.id);
    console.log('Rounds for game:', gameRounds);
    
    // Get total score for a user
    const totalScore = await getTotalScoreForUser(1);
    console.log('Total score for user 1:', totalScore);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    db.close();
  }
}

// Execute the test
// testDatabase();

// Export functions for use in other modules
module.exports = {
  createTables,
  populateSampleData,
  getAllMemes,
  getMemeById,
  getAllCaptions,
  getCorrectCaptionsForMeme,
  getRandomCaptionsExcludingCorrect,
  getRandomMemeForGame,
  getGamesForUser,
  getRoundsForGame,
  getTotalScoreForUser,
  createGame,
  addRound,
  completeGame,
  createMemeCaption,
  createCaption,
  deleteMemeCaption
