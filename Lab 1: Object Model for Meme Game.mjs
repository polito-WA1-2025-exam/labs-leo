// Import day.js for date handling
const dayjs = require('dayjs');

// Meme constructor
function Meme(id, imageUrl, title) {
  this.id = id;
  this.imageUrl = imageUrl;
  this.title = title;
}

// Caption constructor
function Caption(id, text) {
  this.id = id;
  this.text = text;
}

// MemeCaption constructor (association between Meme and Caption)
function MemeCaption(id, memeId, captionId, points) {
  this.id = id;
  this.memeId = memeId;
  this.captionId = captionId;
  this.points = points; // 1, 2, or 3 points
}

// Round constructor
function Round(id, gameId, memeId, selectedCaptionId, earnedPoints) {
  this.id = id;
  this.gameId = gameId;
  this.memeId = memeId;
  this.selectedCaptionId = selectedCaptionId;
  this.earnedPoints = earnedPoints || 0; // Default to 0 points
}

// Game constructor
function Game(id, userId, timestamp, completed) {
  this.id = id;
  this.userId = userId; // null for anonymous users
  this.timestamp = timestamp || dayjs().format(); // Default to current time
  this.completed = completed || false; // Default to not completed
}

// User constructor
function User(id, username, email) {
  this.id = id;
  this.username = username;
  this.email = email;
}

// MemeCollection - manages a collection of memes
function MemeCollection() {
  this.memes = [];
  
  // Add a new meme
  this.addMeme = function(meme) {
    this.memes.push(meme);
  };
  
  // Get a meme by ID
  this.getMeme = function(id) {
    return this.memes.find(m => m.id === id);
  };
  
  // Get all memes
  this.getAllMemes = function() {
    return [...this.memes];
  };
  
  // Get a random meme
  this.getRandomMeme = function() {
    const randomIndex = Math.floor(Math.random() * this.memes.length);
    return this.memes[randomIndex];
  };
  
  // Delete a meme by ID
  this.deleteMeme = function(id) {
    const index = this.memes.findIndex(m => m.id === id);
    if (index !== -1) {
      this.memes.splice(index, 1);
      return true;
    }
    return false;
  };
}

// CaptionCollection - manages a collection of captions
function CaptionCollection() {
  this.captions = [];
  
  // Add a new caption
  this.addCaption = function(caption) {
    this.captions.push(caption);
  };
  
  // Get a caption by ID
  this.getCaption = function(id) {
    return this.captions.find(c => c.id === id);
  };
  
  // Get all captions
  this.getAllCaptions = function() {
    return [...this.captions];
  };
  
  // Delete a caption by ID
  this.deleteCaption = function(id) {
    const index = this.captions.findIndex(c => c.id === id);
    if (index !== -1) {
      this.captions.splice(index, 1);
      return true;
    }
    return false;
  };
}

// MemeCaptionCollection - manages associations between memes and captions
function MemeCaptionCollection() {
  this.memeCaptions = [];
  
  // Add a new meme-caption association
  this.addMemeCaption = function(memeCaption) {
    // Ensure points are 1, 2, or 3
    if (![1, 2, 3].includes(memeCaption.points)) {
      throw new Error('Points must be 1, 2, or 3');
    }
    
    // Ensure there are no more than 3 correct captions per meme
    const correctCaptionsForMeme = this.memeCaptions.filter(mc => 
      mc.memeId === memeCaption.memeId);
      
    if (correctCaptionsForMeme.length >= 3) {
      throw new Error('A meme can have at most 3 correct captions');
    }
    
    // Ensure no duplicate point values for the same meme
    const existingPoints = correctCaptionsForMeme.map(mc => mc.points);
    if (existingPoints.includes(memeCaption.points)) {
      throw new Error(`This meme already has a caption worth ${memeCaption.points} points`);
    }
    
    this.memeCaptions.push(memeCaption);
  };
  
  // Get correct captions for a meme
  this.getCorrectCaptionsForMeme = function(memeId) {
    return this.memeCaptions.filter(mc => mc.memeId === memeId);
  };
  
  // Check if a caption is correct for a meme and return points
  this.getCaptionPointsForMeme = function(memeId, captionId) {
    const memeCaption = this.memeCaptions.find(mc => 
      mc.memeId === memeId && mc.captionId === captionId);
    
    return memeCaption ? memeCaption.points : 0;
  };
  
  // Delete a meme-caption association
  this.deleteMemeCaption = function(id) {
    const index = this.memeCaptions.findIndex(mc => mc.id === id);
    if (index !== -1) {
      this.memeCaptions.splice(index, 1);
      return true;
    }
    return false;
  };
}

// GameCollection - manages a collection of games
function GameCollection() {
  this.games = [];
  this.rounds = [];
  
  // Add a new game
  this.createGame = function(userId) {
    const id = this.games.length + 1;
    const game = new Game(id, userId, dayjs().format(), false);
    this.games.push(game);
    return game;
  };
  
  // Get a game by ID
  this.getGame = function(id) {
    return this.games.find(g => g.id === id);
  };
  
  // Get all games for a user
  this.getGamesForUser = function(userId) {
    return this.games.filter(g => g.userId === userId);
  };
  
  // Add a round to a game
  this.addRound = function(gameId, memeId, selectedCaptionId, earnedPoints) {
    const id = this.rounds.length + 1;
    const round = new Round(id, gameId, memeId, selectedCaptionId, earnedPoints);
    this.rounds.push(round);
    return round;
  };
  
  // Get rounds for a game
  this.getRoundsForGame = function(gameId) {
    return this.rounds.filter(r => r.gameId === gameId);
  };
  
  // Complete a game
  this.completeGame = function(gameId) {
    const game = this.getGame(gameId);
    if (game) {
      game.completed = true;
      return true;
    }
    return false;
  };
  
  // Calculate total score for a game
  this.calculateGameScore = function(gameId) {
    const rounds = this.getRoundsForGame(gameId);
    return rounds.reduce((total, round) => total + round.earnedPoints, 0);
  };
  
  // Calculate total score for a user
  this.calculateUserTotalScore = function(userId) {
    const games = this.getGamesForUser(userId).filter(g => g.completed);
    let totalScore = 0;
    
    for (const game of games) {
      totalScore += this.calculateGameScore(game.id);
    }
    
    return totalScore;
  };
}

// Create and populate sample data
function createSampleData() {
  // Create collections
  const memeCollection = new MemeCollection();
  const captionCollection = new CaptionCollection();
  const memeCaptionCollection = new MemeCaptionCollection();
  
  // Add sample memes
  memeCollection.addMeme(new Meme(1, 'meme1.jpg', 'Distracted Boyfriend'));
  memeCollection.addMeme(new Meme(2, 'meme2.jpg', 'Woman Yelling at Cat'));
  memeCollection.addMeme(new Meme(3, 'meme3.jpg', 'Drake Hotline Bling'));
  memeCollection.addMeme(new Meme(4, 'meme4.jpg', 'Two Buttons'));
  memeCollection.addMeme(new Meme(5, 'meme5.jpg', 'Change My Mind'));
  
  // Add sample captions
  captionCollection.addCaption(new Caption(1, 'Me trying to focus on work'));
  captionCollection.addCaption(new Caption(2, 'When the WiFi drops for 0.0001 seconds'));
  captionCollection.addCaption(new Caption(3, 'When someone says "React is just a library"'));
  captionCollection.addCaption(new Caption(4, 'JavaScript: == vs ==='));
  captionCollection.addCaption(new Caption(5, 'Debugging your own code vs. debugging someone else\'s'));
  captionCollection.addCaption(new Caption(6, 'Promises vs. Callbacks'));
  captionCollection.addCaption(new Caption(7, 'Coffee is just bean soup'));
  captionCollection.addCaption(new Caption(8, 'CSS is a programming language'));
  captionCollection.addCaption(new Caption(9, 'Tabs vs. Spaces'));
  captionCollection.addCaption(new Caption(10, 'When you fix one bug and create three more'));
  
  // Create meme-caption associations
  // Meme 1 associations
  memeCaptionCollection.addMemeCaption(new MemeCaption(1, 1, 1, 3)); // 3 points
  memeCaptionCollection.addMemeCaption(new MemeCaption(2, 1, 5, 2)); // 2 points
  memeCaptionCollection.addMemeCaption(new MemeCaption(3, 1, 9, 1)); // 1 point
  
  // Meme 2 associations
  memeCaptionCollection.addMemeCaption(new MemeCaption(4, 2, 2, 3)); // 3 points
  memeCaptionCollection.addMemeCaption(new MemeCaption(5, 2, 3, 2)); // 2 points
  memeCaptionCollection.addMemeCaption(new MemeCaption(6, 2, 10, 1)); // 1 point
  
  // Meme 3 associations
  memeCaptionCollection.addMemeCaption(new MemeCaption(7, 3, 4, 3)); // 3 points
  memeCaptionCollection.addMemeCaption(new MemeCaption(8, 3, 6, 2)); // 2 points
  memeCaptionCollection.addMemeCaption(new MemeCaption(9, 3, 8, 1)); // 1 point
  
  // Meme 4 associations
  memeCaptionCollection.addMemeCaption(new MemeCaption(10, 4, 4, 3)); // 3 points
  memeCaptionCollection.addMemeCaption(new MemeCaption(11, 4, 9, 2)); // 2 points
  memeCaptionCollection.addMemeCaption(new MemeCaption(12, 4, 6, 1)); // 1 point
  
  // Meme 5 associations
  memeCaptionCollection.addMemeCaption(new MemeCaption(13, 5, 7, 3)); // 3 points
  memeCaptionCollection.addMemeCaption(new MemeCaption(14, 5, 8, 2)); // 2 points
  memeCaptionCollection.addMemeCaption(new MemeCaption(15, 5, 3, 1)); // 1 point
  
  return { memeCollection, captionCollection, memeCaptionCollection };
}

// Sample usage
const { memeCollection, captionCollection, memeCaptionCollection } = createSampleData();

// Display some sample data
console.log("Memes:", memeCollection.getAllMemes());
console.log("Captions:", captionCollection.getAllCaptions());
console.log("Correct captions for Meme 1:", memeCaptionCollection.getCorrectCaptionsForMeme(1));

// Export for use in other modules
module.exports = {
  Meme,
  Caption,
  MemeCaption,
  Round,
  Game,
  User,
  MemeCollection,
  CaptionCollection,
  MemeCaptionCollection,
  GameCollection,
  createSampleData
};
