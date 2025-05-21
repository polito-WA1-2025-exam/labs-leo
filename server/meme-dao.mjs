import db from "./db.mjs";
import {Captions, Meme, Round} from "./MemeModels.mjs";


function MapRowsToCaptions(rows){
    return rows.map(row => new Captions(row.caption_id, row.caption_text));
};

export default function MemeDao() {

    this.getMeme = (old_meme = '') => {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM memes WHERE meme_id NOT IN ('+old_meme+') ORDER BY RANDOM() LIMIT 1 ';

            db.get(query, (err, row) => {
                if(err){
                    reject(err);
                }else{
                    resolve(new Meme(row.meme_id, row.meme_name));
                }
            });
        });
    };

    this.getCaptions = (meme_id) => {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM ( SELECT * FROM (SELECT * FROM captions WHERE meme_id != ? ORDER BY RANDOM() LIMIT 5) UNION SELECT * FROM (SELECT * FROM captions WHERE meme_id = ? ORDER BY RANDOM() LIMIT 2)) ORDER BY RANDOM()';
            db.all(query, [meme_id, meme_id], (err, rows) => {
                if (err){
                    reject(err);
                }else {
                    const captions = MapRowsToCaptions(rows);
                    resolve(captions);
                }
            });
        });
    };

    this.createMatch = (match, points, user_id) => {
        return new Promise((resolve, reject) => {
            const query = 'INSERT INTO matches (user_id, match_details, match_points) VALUES (?, ?, ?)';
            db.run(query, [user_id, JSON.stringify(match.match_details), points], function (err){
                if(err)
                    reject(err);
                else
                    resolve(this.lastID);
            });
        });
    };

    this.setMatchPoints = (user_id, points) => {
        return new Promise((resolve, reject) => {
            const query = "UPDATE users SET user_points = user_points + ? WHERE user_id = ?";
            db.run(query, [points, user_id], (err) => {
                if(err){
                    reject(err);
                }else{
                    resolve({ok: true});
                }
            });
        });
    };

    this.getHistory = (user_id) => {
        return new Promise((resolve, reject) => {
            const query = "SELECT match_details, match_points, match_id FROM matches WHERE user_id = ? AND match_details != '' ORDER BY match_id DESC";
            db.all(query, [user_id], (err, rows) => {
                if(err){
                    reject(err);
                }else{
                    resolve(rows);
                }
            });
        });
    };

    this.getMatchHistory = (match_id) => {
        return new Promise((resolve, reject) => {
            const query = "SELECT * FROM matches WHERE match_id = ?";
            db.get(query, [match_id], (err, row) => {
                if(err){
                    reject(err);
                }else{
                    const match_details = JSON.parse(row.match_details).filter((round) => round.points === 5);
                    //console.log(match_details);
                    resolve({points: row.match_points, details: match_details});
                }
            });
        });
    };

    this.checkRoundPoints = (round) => {
        return new Promise((resolve, reject) => {
            const query = "SELECT meme_id FROM captions WHERE caption_id = ?";
            db.get(query, [round.selected_caption.id], (err, row) => {
                if(err){
                    reject(err);
                }else{
                    let points = 0;
                    if(row && row.meme_id === round.meme.id){
                        points = 5;
                    }
                    resolve({points: points});
                }
            });
        });
    };

    this.correctRoundCaptions = (round) => {
        return new Promise((resolve, reject) => {
            const query = "SELECT caption_id, caption_text as text FROM captions WHERE meme_id = ?";
            db.all(query, [round.meme.id], (err, rows) => {
                if(err){
                    reject(err);
                }else{
                    let corrCap = rows.map(a => a.caption_id);
                    let roundCap = round.captions.map((cap) => cap.id);
                    const correctCapId = roundCap.filter((id) => corrCap.includes(id));
                    const captions = rows.filter((obj) => correctCapId.includes(obj.caption_id));
                    resolve({ids: correctCapId, captions: captions});
                }
            });
        });
    };
}