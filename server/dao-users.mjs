/**
 * MEME GAME - User Data Access Object (DAO)
 * 
 * This module handles all database operations related to user management.
 * It provides secure authentication methods and user data retrieval
 * with proper password hashing and validation.
 * 
 * Features:
 * - Secure password verification with salted hashing
 * - User lookup by ID and credentials
 * - Timing-safe password comparison to prevent timing attacks
 * - Promise-based async database operations
 * 
 * @author Shadmehr Rahmati (s337544)
 * @course Web Applications I - 2024/2025
 */

// === IMPORTS ===
import { rejects } from "assert";
import db from "./db.mjs";      // SQLite database connection
import crypto from "crypto";    // Node.js crypto module for secure hashing

/**
 * User Data Access Object Constructor
 * 
 * Creates a new UserDao instance with methods for user database operations.
 * All methods return Promises and handle errors gracefully.
 * 
 * Note: All functions return error messages as JSON objects { error: <string> }
 * when operations fail, and actual data when successful.
 */
export default function UserDao() {

    /**
     * Get User by ID
     * 
     * Retrieves a user record from the database using their unique ID.
     * Used internally for user session management and profile data.
     * 
     * @param {number} id - User's database ID
     * @returns {Promise<Object>} User object or error object
     * @resolves {Object} Complete user record from database
     * @rejects {Error} Database error or connection issues
     */
    this.getUserById = (id) => {
        return new Promise((resolve, reject) => {
            // SQL query to find user by primary key
            const query = 'SELECT * FROM users WHERE user_id=?';
            
            // Execute query with parameterized value (prevents SQL injection)
            db.get(query, [id], (err, row) => {
                if (err) {
                    // Database error (connection issues, etc.)
                    reject(err);
                    return;
                }
                
                if (row === undefined) {
                    // User not found in database
                    resolve({error: 'User not found.'});
                } else {
                    // User found - return complete database record
                    resolve(row);
                }
            });
        });
    };

    /**
     * Authenticate User by Credentials
     * 
     * Verifies user login credentials using secure password hashing.
     * This is the core authentication method used by Passport.js strategy.
     * 
     * Security features:
     * - Salted password hashing with scrypt
     * - Timing-safe comparison to prevent timing attacks
     * - Async crypto operations to prevent blocking
     * 
     * @param {string} email - User's email address (username)
     * @param {string} password - Plain text password from login form
     * @returns {Promise<Object|false>} User object if valid, false if invalid
     * @resolves {Object} { id, username, name, points } if authentication succeeds
     * @resolves {false} If credentials are invalid (wrong email or password)
     * @rejects {Error} Database error or crypto operation failure
     */
    this.getUserByCredentials = (email, password) => {
        return new Promise((resolve, reject) => {
            // First, find user by email address
            const query = 'SELECT * FROM users WHERE user_email=?';
            
            db.get(query, [email], (err, row) => {
                if (err) {
                    // Database error
                    reject(err);
                    return;
                } 
                
                if (row === undefined) {
                    // User not found - email doesn't exist
                    resolve(false);
                    return;
                }
                
                // User found - now verify password
                // Create clean user object (exclude sensitive data)
                const user = { 
                    id: row.user_id, 
                    username: row.user_email, 
                    name: row.user_name, 
                    points: row.user_points 
                };
                
                /**
                 * Password Verification Process:
                 * 1. Hash the provided password with the stored salt
                 * 2. Compare with stored hash using timing-safe comparison
                 * 3. Return user object if match, false if no match
                 */
                crypto.scrypt(password, row.user_salt, 32, function (err, hashedPassword) {
                    if (err) {
                        // Crypto operation failed
                        reject(err);
                        return;
                    }
                    
                    // Compare hashed password with stored hash
                    // timingSafeEqual prevents timing attacks by taking constant time
                    const storedHash = Buffer.from(row.user_pass, 'hex');
                    const providedHash = hashedPassword;
                    
                    if (!crypto.timingSafeEqual(storedHash, providedHash)) {
                        // Password doesn't match
                        resolve(false);
                    } else {
                        // Password matches - authentication successful
                        resolve(user);
                    }
                });
            });
        });
    };
}
