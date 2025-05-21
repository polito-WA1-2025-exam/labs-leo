/* Data Access Object (DAO) module for accessing users data */

import { rejects } from "assert";
import db from "./db.mjs";
import crypto from "crypto";

// NOTE: all functions return error messages as json object { error: <string> }
export default function UserDao() {

    // This function retrieves one user by id
    this.getUserById = (id) => {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM users WHERE user_id=?';
            db.get(query, [id], (err, row) => {
                if (err) {
                    reject(err);
                }
                if (row === undefined) {
                    resolve({error: 'User not found.'});
                } else {
                    resolve(row);
                }
            });
        });
    };

    this.getUserByCredentials = (email, password) => {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM users WHERE user_email=?';
            db.get(query, [email], (err, row) => {
                if (err) {
                    reject(err);
                } else if (row === undefined) {
                    resolve(false);
                }
                else {
                    const user = { id: row.user_id, username: row.user_email, name: row.user_name, points: row.user_points };
                    // Check the hashes with an async call, this operation may be CPU-intensive (and we don't want to block the server)
                    crypto.scrypt(password, row.user_salt, 32, function (err, hashedPassword) { // WARN: it is 64 and not 32 (as in the week example) in the DB
                        if (err) reject(err);
                        if (!crypto.timingSafeEqual(Buffer.from(row.user_pass, 'hex'), hashedPassword)) // WARN: it is hash and not password (as in the week example) in the DB
                            resolve(false);
                        else
                            resolve(user);
                    });
                }
            });
        });
    };
}
