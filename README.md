# Group "Leo"

## Members
- s337544 RAHMATI SHADMEHR

# Exercise "MEME GAME"

# Lab Journal

(you may update this file to keep track of the progress of your group work, throughout the weeks)

# Meme Caption Game - Database Design

## Database Structure

Our meme caption game application uses the following database tables:

### 1. Memes Table
- **memeId** (INTEGER PRIMARY KEY): Unique identifier for each meme
- **imageUrl** (TEXT): URL to the meme image
- **title** (TEXT): Title or description of the meme

### 2. Captions Table
- **captionId** (INTEGER PRIMARY KEY): Unique identifier for each caption
- **captionText** (TEXT): The text content of the caption

### 3. MemeCaption Table
- **memeId** (INTEGER, FOREIGN KEY): Reference to a meme
- **captionId** (INTEGER, FOREIGN KEY): Reference to a caption
- **points** (INTEGER): Points value (1, 2, or 3) for this meme-caption combination

### 4. Games Table
- **gameId** (INTEGER PRIMARY KEY): Unique identifier for each game
- **userId** (INTEGER): Identifier for the user playing the game
- **totalScore** (INTEGER): Total score accumulated in the game
- **completed** (INTEGER): Boolean flag (0/1) indicating if the game is completed
- **startedAt** (TEXT): Timestamp when the game started
- **completedAt** (TEXT): Timestamp when the game was completed

### 5. Rounds Table
- **roundId** (INTEGER PRIMARY KEY): Unique identifier for each round
- **gameId** (INTEGER, FOREIGN KEY): Reference to the game this round belongs to
- **memeId** (INTEGER, FOREIGN KEY): The meme used in this round
- **selectedCaptionId** (INTEGER, FOREIGN KEY): The caption selected by the player
- **points** (INTEGER): Points earned in this round
- **completed** (INTEGER): Boolean flag (0/1) indicating if the round is completed
