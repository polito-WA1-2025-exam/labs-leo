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
