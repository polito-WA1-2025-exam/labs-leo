const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, 'meme_game.db');

// Create a new database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    
    // Create Memes table
    db.run(`CREATE TABLE IF NOT EXISTS memes (
      meme_id INTEGER PRIMARY KEY,
      image_url TEXT NOT NULL,
      title TEXT NOT NULL
    )`, createCaptionsTable);
  }
});

// Create Captions table
function createCaptionsTable(err) {
  if (err) {
    console.error('Error creating memes table:', err.message);
    return;
  }
  
  db.run(`CREATE TABLE IF NOT EXISTS captions (
    caption_id INTEGER PRIMARY KEY,
    caption_text TEXT NOT NULL
  )`, createMemeCaptionsTable);
}

// Create MemeCaptions table
function createMemeCaptionsTable(err) {
  if (err) {
    console.error('Error creating captions table:', err.message);
    return;
  }
  
  db.run(`CREATE TABLE IF NOT EXISTS meme_captions (
    meme_id INTEGER,
    caption_id INTEGER,
    points INTEGER CHECK(points IN (1, 2, 3)),
    PRIMARY KEY (meme_id, caption_id),
    FOREIGN KEY (meme_id) REFERENCES memes (meme_id),
    FOREIGN KEY (caption_id) REFERENCES captions (caption_id)
  )`, createGamesTable);
}

// Create Games table
function createGamesTable(err) {
  if (err) {
    console.error('Error creating meme_captions table:', err.message);
    return;
  }
  
  db.run(`CREATE TABLE IF NOT EXISTS games (
    game_id INTEGER PRIMARY KEY,
    user_id INTEGER,
    completed INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0,
    started_at TEXT NOT NULL,
    completed_at TEXT
  )`, createRoundsTable);
}

// Create Rounds table
function createRoundsTable(err) {
  if (err) {
    console.error('Error creating games table:', err.message);
    return;
  }
  
  db.run(`CREATE TABLE IF NOT EXISTS rounds (
    round_id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id INTEGER NOT NULL,
    meme_id INTEGER NOT NULL,
    selected_caption_id INTEGER,
    points INTEGER DEFAULT 0,
    completed INTEGER DEFAULT 0,
    FOREIGN KEY (game_id) REFERENCES games (game_id),
    FOREIGN KEY (meme_id) REFERENCES memes (meme_id),
    FOREIGN KEY (selected_caption_id) REFERENCES captions (caption_id)
  )`, createRoundAvailableCaptionsTable);
}

// Create RoundAvailableCaptions table
function createRoundAvailableCaptionsTable(err) {
  if (err) {
    console.error('Error creating rounds table:', err.message);
    return;
  }
  
  db.run(`CREATE TABLE IF NOT EXISTS round_available_captions (
    round_id INTEGER,
    caption_id INTEGER,
    PRIMARY KEY (round_id, caption_id),
    FOREIGN KEY (round_id) REFERENCES rounds (round_id),
    FOREIGN KEY (caption_id) REFERENCES captions (caption_id)
  )`, (err) => {
    if (err) {
      console.error('Error creating round_available_captions table:', err.message);
    } else {
      console.log('All tables created successfully.');
    }
  });
}

module.exports = db;
