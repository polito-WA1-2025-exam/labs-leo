// Meme constructor
function Meme(id, imageUrl) {
  this.id = id;
  this.imageUrl = imageUrl;
}

// Caption constructor
function Caption(id, text) {
  this.id = id;
  this.text = text;
}

// MemeCaption constructor (relationship)
function MemeCaption(id, memeId, captionId, points) {
  this.id = id;
  this.memeId = memeId;
  this.captionId = captionId;
  this.points = points; // 1, 2, or 3
}

// Game constructor
function Game(id, userId, dateTime, completed = false, totalScore = 0) {
  this.id = id;
  this.userId = userId;
  this.dateTime = dateTime;
  this.completed = completed;
  this.totalScore = totalScore;
  this.rounds = []; // Collection of Round objects
}

// Round constructor
function Round(id, gameId, memeId, selectedCaptionId, score = 0) {
  this.id = id;
  this.gameId = gameId;
  this.memeId = memeId;
  this.selectedCaptionId = selectedCaptionId;
  this.score = score;
}

// User constructor
function User(id, username, email, password) {
  this.id = id;
  this.username = username;
  this.email = email;
  this.password = password; // Will be hashed in actual implementation
}

// Collection management for Memes
const MemeCollection = {
  memes: [],
  
  addMeme(imageUrl) {
    const id = this.memes.length ? Math.max(...this.memes.map(m => m.id)) + 1 : 1;
    const newMeme = new Meme(id, imageUrl);
    this.memes.push(newMeme);
    return newMeme;
  },
  
  getMemeById(id) {
    return this.memes.find(m => m.id === id);
  },
  
  getAllMemes() {
    return [...this.memes];
  },
  
  deleteMeme(id) {
    const index = this.memes.findIndex(m => m.id === id);
    if (index !== -1) {
      this.memes.splice(index, 1);
      return true;
    }
    return false;
  }
};

// Caption collection with similar functions
const CaptionCollection = {
  captions: [],
  
  addCaption(text) {
    const id = this.captions.length ? Math.max(...this.captions.map(c => c.id)) + 1 : 1;
    const newCaption = new Caption(id, text);
    this.captions.push(newCaption);
    return newCaption;
  },
  
  // Other methods similar to MemeCollection
};

// MemeCaption collection for relationships
const MemeCaptionCollection = {
  memeCaption: [],
  
  addMemeCaption(memeId, captionId, points) {
    if (points < 1 || points > 3) throw new Error("Points must be 1, 2, or 3");
    
    const id = this.memeCaption.length ? Math.max(...this.memeCaption.map(mc => mc.id)) + 1 : 1;
    const newMC = new MemeCaption(id, memeId, captionId, points);
    this.memeCaption.push(newMC);
    return newMC;
  },
  
  getCaptionsForMeme(memeId) {
    return this.memeCaption.filter(mc => mc.memeId === memeId);
  },
  
  getPointsForMemeCaption(memeId, captionId) {
    const mc = this.memeCaption.find(mc => mc.memeId === memeId && mc.captionId === captionId);
    return mc ? mc.points : 0;
  },
  
  // Other methods for managing relationships
};

// Game and Round collections with similar structures
