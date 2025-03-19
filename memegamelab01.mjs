//import dayjs library for handle dates
import dayjs from 'dayjs'

// ------------- Constructor Functions -------------

// Meme
function Meme(memeId, imageUrl, title) {
  this.memeId = memeId;
  this.imageUrl = imageUrl;
  this.title = title;
}

// Caption
function Caption(captionId, captiontext) {
  this.captionId = captionId;
  this.captiontext = captiontext;
}

// MemeCaption
function MemeCaption(memeId, captionId, points) {
  if (![1, 2, 3].includes(points)) {
    throw new Error('Points must be 1, 2, or 3');
  }
  this.memeId = memeId;
  this.captionId = captionId;
  this.points = points;
}

// Round
function Round(memeId, availableCaptions) {
  this.memeId = memeId;
  this.availableCaptions = availableCaptions;
  this.selectedCaptionId = null;
  this.points = 0;
  this.completed = false;
}

// Game
function Game(gameId, userId = null) {
  this.gameId = gameId;
  this.userId = userId;
  this.rounds = [];
  this.completed = false;
  this.totalScore = 0;
  this.startedAt = dayjs().format('HH:mm:ss-DD/MM/YYYY');
  this.completedAt = null;
}

// ------------- Collection Objects -------------

// MemeCollection
function MemeCollection() {
  this.memes = [];

  // Add a new meme to the collection
  this.addMeme = function(meme) {
    if (!(meme instanceof Meme)) {
      throw new Error('Only Meme objects can be added to MemeCollection');
    }
    if (this.getMemeById(meme.memeId)) {
      throw new Error(`Meme with ID ${meme.memeId} already exists`);
    }
    this.memes.push(meme);
    return meme;
  };

  // Get a meme by its ID
  this.getMemeById = function(memeId) {
    return this.memes.find(meme => meme.memeId === memeId);
  };

  // Get all memes
  this.getAllMemes = function() {
    return [...this.memes];
  };

  // Get random meme
  this.getRandomMeme = function() {
    if (this.memes.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * this.memes.length);
    return this.memes[randomIndex];
  };

  // Delete a meme by its ID
  this.deleteMeme = function(memeId) {
    const initialLength = this.memes.length;
    this.memes = this.memes.filter(meme => meme.memeId !== memeId);
    return initialLength !== this.memes.length;
  };
}

// CaptionCollection
function CaptionCollection() {
  this.captions = [];

  // Add a new caption to the collection
  this.addCaption = function(caption) {
    if (!(caption instanceof Caption)) {
      throw new Error('Only Caption objects can be added to CaptionCollection');
    }
    if (this.getCaptionById(caption.captionId)) {
      throw new Error(`Caption with ID ${caption.captionId} already exists`);
    }
    this.captions.push(caption);
    return caption;
  };

  // Get a caption by its ID
  this.getCaptionById = function(captionId) {
    return this.captions.find(caption => caption.captionId === captionId);
  };

  // Get all captions
  this.getAllCaptions = function() {
    return [...this.captions];
  };

  // Get random captions
  this.getRandomCaptions = function(count) {
    if (this.captions.length < count) return this.captions;
    
    const shuffled = [...this.captions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  // Delete a caption by its ID
  this.deleteCaption = function(captionId) {
    const initialLength = this.captions.length;
    this.captions = this.captions.filter(caption => caption.captionId !== captionId);
    return initialLength !== this.captions.length;
  };
}

// MemeCaptionCollection
function MemeCaptionCollection() {
  this.memeCaptions = [];

  // Add a new meme-caption association
  this.addMemeCaption = function(memeCaption) {
    if (!(memeCaption instanceof MemeCaption)) {
      throw new Error('Only MemeCaption objects can be added to MemeCaptionCollection');
    }
    
    // Check if this meme already has 3 captions with points 1, 2, and 3
    const existingAssociations = this.getMemeCaptionsByMemeId(memeCaption.memeId);
    
    // Check if this meme already has a caption with the same points
    const hasPointsAlready = existingAssociations.some(mc => mc.points === memeCaption.points);
    if (hasPointsAlready) {
      throw new Error(`Meme ID ${memeCaption.memeId} already has a caption with ${memeCaption.points} points`);
    }
    
    // Check if this exact association already exists
    const existingAssociation = this.memeCaptions.find(
      mc => mc.memeId === memeCaption.memeId && mc.captionId === memeCaption.captionId
    );
    if (existingAssociation) {
      throw new Error('This meme-caption association already exists');
    }
    
    this.memeCaptions.push(memeCaption);
    return memeCaption;
  };

  // Get all meme-caption associations for a specific meme
  this.getMemeCaptionsByMemeId = function(memeId) {
    return this.memeCaptions.filter(mc => mc.memeId === memeId);
  };

  // Get all meme-caption associations for a specific caption
  this.getMemeCaptionsByCaptionId = function(captionId) {
    return this.memeCaptions.filter(mc => mc.captionId === captionId);
  };

  // Get the points for a specific meme-caption pair
  this.getPointsForMemeCaption = function(memeId, captionId) {
    const association = this.memeCaptions.find(
      mc => mc.memeId === memeId && mc.captionId === captionId
    );
    return association ? association.points : 0;
  };

  // Get the correct captions for a meme
  this.getCorrectCaptionsForMeme = function(memeId, captionCollection) {
    const associations = this.getMemeCaptionsByMemeId(memeId);
    return associations.map(assoc => {
      const caption = captionCollection.getCaptionById(assoc.captionId);
      return {
        ...caption,
        points: assoc.points
      };
    });
  };

  // Delete a meme-caption association
  this.deleteMemeCaption = function(memeId, captionId) {
    const initialLength = this.memeCaptions.length;
    this.memeCaptions = this.memeCaptions.filter(
      mc => !(mc.memeId === memeId && mc.captionId === captionId)
    );
    return initialLength !== this.memeCaptions.length;
  };
}

// GameCollection
function GameCollection() {
  this.games = [];

  // Add a new game to the collection
  this.addGame = function(game) {
    if (!(game instanceof Game)) {
      throw new Error('Only Game objects can be added to GameCollection');
    }
    if (this.getGameById(game.gameId)) {
      throw new Error(`Game with ID ${game.gameId} already exists`);
    }
    this.games.push(game);
    return game;
  };

  // Get a game by its ID
  this.getGameById = function(gameId) {
    return this.games.find(game => game.gameId === gameId);
  };

  // Get all games for a specific user
  this.getGamesByUserId = function(userId) {
    return this.games.filter(game => game.userId === userId);
  };

  // Get completed games for a specific user
  this.getCompletedGamesByUserId = function(userId) {
    return this.games.filter(game => game.userId === userId && game.completed);
  };

  // Get total score for a user across all completed games
  this.getTotalScoreForUser = function(userId) {
    return this.getCompletedGamesByUserId(userId)
      .reduce((total, game) => total + game.totalScore, 0);
  };

  // Delete a game by its ID
  this.deleteGame = function(gameId) {
    const initialLength = this.games.length;
    this.games = this.games.filter(game => game.gameId !== gameId);
    return initialLength !== this.games.length;
  };
}
