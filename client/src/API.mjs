/**
 * MEME GAME - Frontend API Communication Layer
 * 
 * This module handles all HTTP communication between the React frontend
 * and the Express.js backend server. It provides a clean interface for
 * authentication, game operations, and user data management.
 * 
 * Features:
 * - Authentication API calls (login, register, logout)
 * - Game round management (guest and logged users)
 * - Answer checking and scoring
 * - User history and match tracking
 * - Centralized error handling
 * 
 * @author Shadmehr Rahmati (s337544)
 * @course Web Applications I - 2024/2025
 */

// === CONFIGURATION ===

// Backend server base URL - all API calls will be prefixed with this
const SERVER_URL = 'http://localhost:3001/api';

// === AUTHENTICATION FUNCTIONS ===

/**
 * User Login
 * 
 * @param {Object} credentials - { username: string, password: string }
 * @returns {Promise<Object>} User object with { id, name, username, points }
 * @throws {Error} If authentication fails or network error occurs
 */
const logIn = async (credentials) => {
    return await fetch(SERVER_URL + '/sessions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',  // Include authentication cookies in request
        body: JSON.stringify(credentials),
    }).then(handleInvalidResponse)   // Check for HTTP errors
    .then(response => response.json()); // Parse JSON response
}

/**
 * User Registration
 * 
 * @param {Object} informations - { name: string, username: string, password: string }
 * @returns {Promise<Object>} User object after successful registration and auto-login
 * @throws {Error} If registration fails (e.g., username already exists)
 */
const SignUp = async (informations) => {
    return await fetch(SERVER_URL + '/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',  // Include cookies for automatic login after registration
        body: JSON.stringify(informations),
    }).then(handleInvalidResponse)
    .then(response => response.json());
}

/**
 * Get Current User Information
 * 
 * Checks if user is currently authenticated and returns user data
 * 
 * @returns {Promise<Object>} Current user object if authenticated
 * @throws {Error} If user is not authenticated or session expired
 */
const getUserInfo = async () => {
    return await fetch(SERVER_URL + '/sessions/current', {
        credentials: 'include'  // Send session cookie to verify authentication
    }).then(handleInvalidResponse)
    .then(response => response.json());
}

/**
 * User Logout
 * 
 * Destroys server-side session and logs out the current user
 * 
 * @returns {Promise<Response>} Empty response indicating successful logout
 * @throws {Error} If logout fails (rare, usually succeeds even if already logged out)
 */
const logOut = async() => {
    return await fetch(SERVER_URL + '/sessions/current', {
      method: 'DELETE',
      credentials: 'include'  // Include session cookie to identify session to destroy
    }).then(handleInvalidResponse);
}

// === UTILITY FUNCTIONS ===

/**
 * HTTP Response Validation
 * 
 * Checks if HTTP response is successful and has correct content type
 * 
 * @param {Response} response - Fetch API response object
 * @returns {Response} Same response if valid
 * @throws {Error} If response indicates error or wrong content type
 */
function handleInvalidResponse(response) {
    // Check for HTTP error status codes (4xx, 5xx)
    if (!response.ok) { 
        throw Error(response.statusText) 
    }
    
    // Verify response is JSON (expected by all our API endpoints)
    let type = response.headers.get('Content-Type');
    if (type !== null && type.indexOf('application/json') === -1){
        throw new TypeError(`Expected JSON, got ${type}`)
    }
    
    return response;
}

// === GAME API FUNCTIONS ===

/**
 * Get Round for Guest Player
 * 
 * Fetches a single game round for non-authenticated users
 * Returns random meme with 7 caption options (2 correct, 5 incorrect)
 * 
 * @returns {Promise<Object>} { meme: MemeObject, captions: CaptionArray }
 * @throws {Error} If unable to generate round or server error
 */
async function getCaptionSingle(){
    const response = await fetch(`${SERVER_URL}/round/single`);
    
    if(!response.ok) {
        const errMessage = await response.json();
        throw errMessage;
    } else {
        const captionJson = await response.json();
        return captionJson;
    }
}

/**
 * Get Round for Logged-In Player
 * 
 * Fetches a game round for authenticated users in multi-round games
 * Excludes memes used in previous rounds of the same game session
 * 
 * @returns {Promise<Object>} { meme: MemeObject, captions: CaptionArray }
 * @throws {Error} If user not authenticated or unable to generate round
 */
async function getCaptionMulti(){
    const response = await fetch(`${SERVER_URL}/loggedround`, {
        credentials: 'include'  // Required for session-based meme tracking
    });
    
    if(!response.ok) {
        const errMessage = await response.json();
        throw errMessage;
    } else {
        const captionJson = await response.json();
        return captionJson;
    }
}

/**
 * Check Round Answer for Guest Player
 * 
 * Validates answers for a single round and returns results
 * 
 * @param {Object} round - { meme_id: number, selected_captions: number[] }
 * @returns {Promise<Object>} { points: number, correctCapId: number[], correctCap: string[] }
 * @throws {Error} If unable to check answers or server error
 */
async function checkRound(round){
    const response = await fetch(`${SERVER_URL}/checkRound`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'}, 
        body: JSON.stringify(round),  // Send round data for validation
    });
    
    if(!response.ok) {
        const errMessage = await response.json();
        throw errMessage;
    } else {
        const captionJson = await response.json();
        return captionJson;
    }
}

/**
 * Check Round Answer for Logged-In Player
 * 
 * Validates answers for logged-in user and updates session score
 * 
 * @param {Object} round - { meme_id: number, selected_captions: number[] }
 * @returns {Promise<Object>} { points: number, correctCapId: number[], correctCap: string[] }
 * @throws {Error} If user not authenticated or unable to check answers
 */
async function checkRoundLog(round){
    const response = await fetch(`${SERVER_URL}/checkRoundLog`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'}, 
        body: JSON.stringify(round),
        credentials: 'include'  // Required for session score tracking
    });
    
    if(!response.ok) {
        const errMessage = await response.json();
        throw errMessage;
    } else {
        const captionJson = await response.json();
        return captionJson;
    }
}

/**
 * Create Match Record
 * 
 * Saves a completed game session to database for logged-in users
 * Updates user's total points and creates match history record
 * 
 * @param {Object} match - Complete match details with all rounds
 * @returns {Promise<Object>} { id: number, points: number } - Match ID and total points
 * @throws {Error} If user not authenticated or unable to save match
 */
async function createMatch(match){
    const response = await fetch(`${SERVER_URL}/createMatch`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'}, 
        body: JSON.stringify(match),  // Complete match data
        credentials: 'include'        // Required for user identification
    });

    if(!response.ok) {
        const errMessage = await response.json();
        throw errMessage;
    } else {
        const id = await response.json();
        return id;
    }
}

/**
 * Get User Game History
 * 
 * Retrieves all completed matches for the authenticated user
 * 
 * @returns {Promise<Array>} Array of match objects with basic info
 * @throws {Error} If user not authenticated or unable to fetch history
 */
async function getHistory(){
    const response = await fetch(`${SERVER_URL}/history`,{
        credentials: 'include'  // Required for user identification
    });

    if(!response.ok) {
        const errMessage = await response.json();
        throw errMessage;
    } else {
        const captionJson = await response.json();
        return captionJson;
    }
}

/**
 * Get Detailed Match History
 * 
 * Retrieves detailed information for a specific match
 * Includes all rounds, answers, and scoring details
 * 
 * @param {number} match_id - Database ID of the match to retrieve
 * @returns {Promise<Object>} Complete match details including all rounds
 * @throws {Error} If user not authenticated or match not found
 */
async function getHistoryMatch(match_id){
    const response = await fetch(`${SERVER_URL}/matchHistory/${match_id}`,{
        credentials: 'include'  // Required for authorization check
    });
    
    if(!response.ok) {
        const errMessage = await response.json();
        throw errMessage;
    } else {
        const captionJson = await response.json();
        return captionJson;
    }
}

/**
 * Initialize Match Session
 * 
 * Prepares server session for a new multi-round game
 * Resets score counter and used memes list
 * 
 * @returns {Promise<boolean>} True if initialization successful
 * @throws {Error} If user not authenticated or initialization fails
 */
async function initMatchLogged(){
    const response = await fetch(`${SERVER_URL}/initMatch`,{
        credentials: 'include'  // Required for session management
    });

    if(!response.ok) {
        const errMessage = await response.json();
        throw errMessage;
    } else {
        return true;  // Simple success indicator
    }
}

// === API OBJECT EXPORT ===

/**
 * Exported API object containing all available functions
 * 
 * This object provides a clean interface for components to interact
 * with the backend without needing to know implementation details
 */
const API = {
    // Authentication functions
    logIn, 
    getUserInfo, 
    logOut, 
    SignUp,
    
    // Game functions
    getCaptionSingle,     // Get round for guest players
    getCaptionMulti,      // Get round for logged players
    checkRound,           // Check guest answers
    checkRoundLog,        // Check logged user answers
    initMatchLogged,      // Initialize game session
    
    // Match management
    createMatch,          // Save completed match
    
    // History functions
    getHistory,           // Get user's match history
    getHistoryMatch       // Get specific match details
};

export default API;
