/**
 * MEME GAME - Database Connection Module
 * 
 * This module establishes and exports the SQLite database connection
 * for the Meme Game application. It handles the connection to the 
 * local SQLite database file and provides error handling for
 * connection issues.
 * 
 * Database: SQLite (file-based database)
 * File: meme.db (created in the same directory)
 * 
 * @author Shadmehr Rahmati (s337544)
 * @course Web Applications I - 2024/2025
 */

// === IMPORTS ===
import sqlite from 'sqlite3';

/**
 * SQLite Database Connection
 * 
 * Opens a connection to the SQLite database file 'meme.db'.
 * If the file doesn't exist, SQLite will create it automatically.
 * 
 * The database contains the following tables:
 * - users: User accounts with authentication data
 * - memes: Meme images and metadata
 * - captions: Text captions linked to memes
 * - matches: Completed game sessions for users
 * 
 * Connection Settings:
 * - File: meme.db (relative to server directory)
 * - Mode: Read/Write (default)
 * - Auto-create: Yes (if file doesn't exist)
 */
const db = new sqlite.Database('meme.db', (err) => {
    if (err) {
        // Database connection failed - this is a critical error
        console.error('❌ Failed to connect to SQLite database:', err.message);
        throw err; // Stop server startup if database is unavailable
    } else {
        // Database connection successful
        console.log('✅ Connected to SQLite database (meme.db)');
        console.log('📊 Database ready for queries');
    }
});

// Export the database connection for use in DAO modules
export default db;
