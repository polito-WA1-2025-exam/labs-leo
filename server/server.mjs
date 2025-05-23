/**
 * MEME GAME - Backend Server
 * 
 * Main Express.js server for the Meme Game application.
 * Handles authentication, game logic, and API endpoints.
 * 
 * Features:
 * - User authentication with Passport.js
 * - Session management for game state
 * - RESTful API for game operations
 * - SQLite database integration
 * 
 * @author Shadmehr Rahmati (s337544)
 * @course Web Applications I - 2024/2025
 */

// === IMPORTS ===
import express from 'express';
import morgan from 'morgan';           // HTTP request logger middleware
import cors from 'cors';               // Cross-Origin Resource Sharing
import UserDao from './dao-users.mjs'; // User data access object
import MemeDao from './meme-dao.mjs';  // Meme/game data access object
import crypto from "crypto";           // For password hashing
import db from "./db.mjs";            // Database connection

// Initialize data access objects
const userDao = new UserDao();
const memeDao = new MemeDao();

// === EXPRESS SETUP ===
const app = new express();

// Middleware setup
app.use(morgan('dev'));        // Log HTTP requests in development format
app.use(express.json());       // Parse JSON bodies from requests

// === CORS CONFIGURATION ===
// Allow cross-origin requests from frontend (running on port 5173)
const corsOptions = {
  origin: 'http://localhost:5173',  // Frontend URL
  optionsSuccessStatus: 200,        // Support legacy browsers
  credentials: true                 // Allow cookies/credentials
};
app.use(cors(corsOptions));

// === AUTHENTICATION SETUP (PASSPORT.JS) ===

// Import authentication-related modules
import passport from 'passport';                    // Main authentication middleware
import LocalStrategy from 'passport-local';         // Username/password strategy

// Initialize Passport
app.use(passport.initialize());

/**
 * Configure Local Strategy for username/password authentication
 * Verifies user credentials against database
 */
passport.use(new LocalStrategy(async function verify(username, password, callback) {
    try {
        // Attempt to authenticate user with provided credentials
        const user = await userDao.getUserByCredentials(username, password);
        
        if (!user) {
            // Authentication failed - invalid credentials
            return callback(null, false, 'Incorrect username or password');
        }
        
        // Authentication successful - return user object
        return callback(null, user);
    } catch (error) {
        // Database or other error during authentication
        return callback(error);
    }
}));

/**
 * Serialize user for session storage
 * Determines what user data is stored in the session
 */
passport.serializeUser(function (user, callback) {
    // Store complete user object in session
    callback(null, user);
});

/**
 * Deserialize user from session
 * Reconstructs user object from session data
 */
passport.deserializeUser(function (user, callback) {
    // Return user object (available as req.user in routes)
    return callback(null, user);
    
    // Alternative: Re-fetch user from database for extra security
    // return userDao.getUserById(user.id).then(user => callback(null, user)).catch(err => callback(err, null));
});

// === SESSION CONFIGURATION ===
import session from 'express-session';

app.use(session({
    secret: "This is a very secret information used to initialize the session!",
    resave: false,              // Don't save session if unmodified
    saveUninitialized: false,   // Don't create session until something stored
}));

// Use Passport session authentication
app.use(passport.authenticate('session'));

// === MIDDLEWARE FUNCTIONS ===

/**
 * Authentication middleware
 * Protects routes that require user to be logged in
 */
const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next(); // User is authenticated, proceed
    }
    return res.status(401).json({error: 'Not authorized'});
};

// === UTILITY FUNCTIONS ===

/**
 * Handle validation errors from express-validator
 * Formats and returns validation errors in consistent format
 */
const onValidationErrors = (validationResult, res) => {
    const errors = validationResult.formatWith(errorFormatter);
    return res.status(422).json({validationErrors: errors.mapped()});
};

/**
 * Format validation error messages
 * Extracts only the error message from validation result
 */
const errorFormatter = ({msg}) => {
    return msg;
};

// === AUTHENTICATION ROUTES ===

/**
 * POST /api/sessions
 * User login endpoint
 * 
 * Body: { username: string, password: string }
 * Returns: User object if successful, error if failed
 */
app.post('/api/sessions', function(req, res, next) {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err); // Database or system error
        }
        
        if (!user) {
            // Authentication failed - wrong credentials
            return res.status(401).json({ error: info});
        }
        
        // Authentication successful - establish login session
        req.login(user, (err) => {
            if (err) {
                return next(err);
            }
            
            // Return authenticated user data
            return res.json(req.user);
        });
    })(req, res, next);
});

/**
 * POST /api/signup
 * User registration endpoint
 * 
 * Body: { name: string, username: string, password: string }
 * Returns: User object if successful, error if failed
 */
app.post('/api/signup', function(req, res, next) {
    // Generate random salt for password hashing
    const salt = crypto.randomBytes(8).toString('hex');
    
    // Hash password with salt using scrypt
    crypto.scrypt(req.body.password, salt, 32, function (err, hashedPassword) {
        if (err) { 
            return next(err); 
        }
        
        // Insert new user into database
        db.run('INSERT INTO users (user_name, user_email, user_pass, user_salt, user_points) VALUES (?,?,?,?,0)', [
            req.body.name,
            req.body.username,
            hashedPassword.toString('hex'),
            salt
        ], function(err) {
            if (err) { 
                return next(err); 
            }
            
            // Create user object for session
            var user = {
                id: this.lastID,        // Database-generated ID
                name: req.body.name,
                points: 0,              // Initial points
                username: req.body.username,
            };
            
            // Automatically log in the new user
            req.login(user, function(err) {
                if (err) { 
                    return next(err); 
                }
                return res.json(req.user);
            });
        });
    });
});

/**
 * GET /api/sessions/current
 * Check current authentication status
 * 
 * Returns: User object if logged in, error if not authenticated
 */
app.get('/api/sessions/current', (req, res) => {
    if (req.isAuthenticated()) {
        res.status(200).json(req.user);
    } else {
        res.status(401).json({error: 'Not authenticated'});
    }
});

/**
 * DELETE /api/sessions/current
 * User logout endpoint
 * 
 * Destroys current session and logs out user
 */
app.delete('/api/sessions/current', (req, res) => {
    req.logout(() => {
        res.end(); // Send empty response
    });
});

// === GAME SESSION MANAGEMENT ===

/**
 * GET /api/initMatch
 * Initialize a new game session for logged-in user
 * 
 * Resets session variables for tracking game progress:
 * - points: accumulates score across rounds
 * - meme: tracks used memes to avoid repetition
 */
app.get('/api/initMatch', isLoggedIn, async (req, res) => {
    try {
        req.session.points = Number(0);  // Reset points counter
        req.session.meme = [];           // Reset used memes list
        await req.session.save();        // Persist session changes
        
        res.status(200).json({message: 'Game session initialized'});
    } catch (error) {
        console.error(`ERROR initializing match: ${error.message}`);
        res.status(500).json({error: 'Failed to initialize game session'});
    }
});

// === GAME ROUND ROUTES ===

/**
 * GET /api/round/single
 * Get a single round for guest players (not logged in)
 * 
 * Returns: { meme: MemeObject, captions: CaptionArray }
 * Used for single-round guest gameplay
 */
app.get('/api/round/single', async (req, res) => {
    try {
        // Get random meme for the round
        const chosen_meme = await memeDao.getMeme();
        
        // Get all captions for this meme (correct + incorrect)
        const captions = await memeDao.getCaptions(chosen_meme.id);
        
        // Prepare round data
        const round = {
            meme: chosen_meme, 
            captions: captions
        };
        
        res.json(round);
    } catch (error) {
        console.error(`ERROR getting single round: ${error.message}`);
        res.status(503).json({error: 'Not able to get the single round.'});
    }
});

/**
 * GET /api/loggedround
 * Get a round for logged-in players (multi-round game)
 * 
 * Returns: { meme: MemeObject, captions: CaptionArray }
 * Excludes previously used memes and tracks progress in session
 */
app.get('/api/loggedround', isLoggedIn, async (req, res) => {
    try {
        // Get random meme excluding those already used in this game
        const chosen_meme = await memeDao.getMeme(req.session.meme);
        
        // Get all captions for this meme
        const captions = await memeDao.getCaptions(chosen_meme.id);
        
        // Add this meme to used list to prevent repetition
        req.session.meme.push(chosen_meme.id);
        await req.session.save();
        
        // Prepare round data
        const round = {
            meme: chosen_meme, 
            captions: captions
        };
        
        res.json(round);
    } catch (error) {
        console.error(`ERROR getting logged round: ${error.message}`);
        res.status(503).json({error: 'Impossible to get the round.'});
    }
});

// === ANSWER CHECKING ROUTES ===

/**
 * POST /api/checkRound
 * Check answers for guest player round
 * 
 * Body: { meme_id: number, selected_captions: number[] }
 * Returns: { points: number, correctCapId: number[], correctCap: string[] }
 */
app.post('/api/checkRound', async (req, res) => {
    try {
        // Calculate points earned for selected answers
        const points = await memeDao.checkRoundPoints(req.body);
        
        // Get correct captions for this meme
        const correctCaptions = await memeDao.correctRoundCaptions(req.body);
        
        res.json({
            points: points.points,                    // Points earned this round
            correctCapId: correctCaptions.ids,        // IDs of correct captions
            correctCap: correctCaptions.captions      // Text of correct captions
        });
    } catch (error) {
        console.error(`ERROR checking round: ${error.message}`);
        res.status(503).json({error: 'Not able to check the result.'});
    }
});

/**
 * POST /api/checkRoundLog
 * Check answers for logged-in player round
 * 
 * Body: { meme_id: number, selected_captions: number[] }
 * Returns: { points: number, correctCapId: number[], correctCap: string[] }
 * Also updates session points for multi-round tracking
 */
app.post('/api/checkRoundLog', isLoggedIn, async (req, res) => {
    try {
        // Calculate points earned for selected answers
        const points = await memeDao.checkRoundPoints(req.body);
        
        // Get correct captions for this meme
        const correctCaptions = await memeDao.correctRoundCaptions(req.body);
        
        // Add points to session total (across all rounds)
        req.session.points += Number(points.points);
        await req.session.save();
        
        res.json({
            points: points.points,                    // Points earned this round
            correctCapId: correctCaptions.ids,        // IDs of correct captions
            correctCap: correctCaptions.captions      // Text of correct captions
        });
    } catch (error) {
        console.error(`ERROR checking logged round: ${error.message}`);
        res.status(503).json({error: 'Not able to check the result.'});
    }
});

/**
 * POST /api/createMatch
 * Save completed game match for logged-in user
 * 
 * Body: Match details (rounds, answers, etc.)
 * Returns: { id: number, points: number }
 * Stores complete match history and updates user's total points
 */
app.post('/api/createMatch', isLoggedIn, async (req, res) => {
    try {
        // Save match details to database
        const last_id = await memeDao.createMatch(
            req.body,                           // Match details from frontend
            req.session.points,                 // Total points earned
            req.session.passport.user.id        // User ID from session
        );
        
        // Update user's total points in database
        const response = await memeDao.setMatchPoints(
            req.session.passport.user.id, 
            req.session.points
        );
        
        res.json({
            id: last_id,                // Database ID of saved match
            points: req.session.points  // Total points earned
        });
    } catch (error) {
        console.error(`ERROR creating match: ${error.message}`);
        res.status(503).json({error: 'Not able to store the match.'});
    }
});

// === USER HISTORY ROUTES ===

/**
 * GET /api/history
 * Get game history for logged-in user
 * 
 * Returns: Array of user's completed matches
 */
app.get('/api/history', isLoggedIn, async (req, res) => {
    try {
        const response = await memeDao.getHistory(req.user.id);
        res.json(response);
    } catch (error) {
        console.error(`ERROR getting history: ${error.message}`);
        res.status(503).json({error: 'Not able to retrieve history.'});
    }
});

/**
 * GET /api/matchHistory/:id
 * Get detailed history for a specific match
 * 
 * Params: id - Match ID
 * Returns: Detailed match information including all rounds
 */
app.get('/api/matchHistory/:id', isLoggedIn, async (req, res) => {
    try {
        const response = await memeDao.getMatchHistory(req.params.id);
        res.json(response);
    } catch (error) {
        console.error(`ERROR getting match history: ${error.message}`);
        res.status(503).json({error: 'Not able to retrieve match history of game.'});
    }
});

// === SERVER STARTUP ===

const port = 3001;

// Start the Express server
app.listen(port, () => {
    console.log(`🚀 MEME GAME Server listening at http://localhost:${port}`);
    console.log(`📊 Database: SQLite (meme.db)`);
    console.log(`🔐 Authentication: Passport.js with Local Strategy`);
    console.log(`🎮 Ready for frontend connections on port 5173`);
});
