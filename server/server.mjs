// imports
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import UserDao from './dao-users.mjs';
import MemeDao from './meme-dao.mjs';
import crypto from "crypto";
import db from "./db.mjs";

const userDao = new UserDao();
const memeDao = new MemeDao();

/*** init express and set up the middlewares ***/
const app = new express();
app.use(morgan('dev'));
app.use(express.json());

/** Set up and enable Cross-Origin Resource Sharing (CORS) **/
const corsOptions = {
  origin: 'http://localhost:5173',
  optionsSuccessStatus: 200,
  credentials: true
};
app.use(cors(corsOptions));

/*** Passport ***/

/** Authentication-related imports **/
import passport from 'passport';                              // authentication middleware
import LocalStrategy from 'passport-local';                   // authentication strategy (username and password)

app.use(passport.initialize());

/** Set up authentication strategy to search in the DB a user with a matching password.
 * The user object will contain other information extracted by the method userDao.getUserByCredentials() (i.e., id, username, name).
 **/
passport.use(new LocalStrategy(async function verify(username, password, callback) {
    const user = await userDao.getUserByCredentials(username, password)
    if(!user)
      return callback(null, false, 'Incorrect username or password');

    return callback(null, user); // NOTE: user info in the session (all fields returned by userDao.getUserByCredentials(), i.e, id, username, name)
}));

// Serializing in the session the user object given from LocalStrategy(verify).
passport.serializeUser(function (user, callback) { // this user is id + username + name
    callback(null, user);
});

// Starting from the data in the session, we extract the current (logged-in) user.
passport.deserializeUser(function (user, callback) { // this user is id + email + name
    return callback(null, user); // this will be available in req.user

    // In this method, if needed, we can do extra check here (e.g., double check that the user is still in the database, etc.)
    // e.g.: return userDao.getUserById(id).then(user => callback(null, user)).catch(err => callback(err, null));
});


/** Creating the session */
import session from 'express-session';

app.use(session({
  secret: "This is a very secret information used to initialize the session!",
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.authenticate('session'));


/** Defining authentication verification middleware **/
const isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()) {
      return next();
    }
    return res.status(401).json({error: 'Not authorized'});
};


/*** Utility Functions ***/

// This function is used to handle validation errors
const onValidationErrors = (validationResult, res) => {
    const errors = validationResult.formatWith(errorFormatter);
    return res.status(422).json({validationErrors: errors.mapped()});
};

// Only keep the error message in the response
const errorFormatter = ({msg}) => {
    return msg;
};

/*** Users APIs ***/

// POST /api/sessions
// This route is used for performing login.
app.post('/api/sessions', function(req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err)
      return next(err);
      if (!user) {
        // display wrong login messages
        return res.status(401).json({ error: info});
      }
      // success, perform the login and extablish a login session
      req.login(user, (err) => {
        if (err)
          return next(err);

        // req.user contains the authenticated user, we send all the user info back
        // this is coming from userDao.getUserByCredentials() in LocalStratecy Verify Function
        return res.json(req.user);
      });
  })(req, res, next);
});

app.post('/api/signup', function(req, res, next) {
  const salt = crypto.randomBytes(8).toString('hex');
  crypto.scrypt(req.body.password, salt, 32, function (err, hashedPassword) {
    if (err) { return next(err); }
    db.run('INSERT INTO users (user_name, user_email, user_pass, user_salt, user_points) VALUES (?,?,?,?,0)', [
      req.body.name,
      req.body.username,
      hashedPassword.toString('hex'),
      salt
    ], function(err) {
      if (err) { return next(err); }
      var user = {
        id: this.lastID,
        name: req.body.name,
        points: 0,
        username: req.body.username,
      };
      req.login(user, function(err) {
        if (err) { return next(err); }
        return res.json(req.user);
      });
    });
  });
});

// GET /api/sessions/current
// This route checks whether the user is logged in or not.
app.get('/api/sessions/current', (req, res) => {
  if(req.isAuthenticated()) {
    res.status(200).json(req.user);}
  else
    res.status(401).json({error: 'Not authenticated'});
});

// DELETE /api/session/current
// This route is used for loggin out the current user.
app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => {
    res.end();
  });
});

// Initialize match_points and oldmeme to 0 and empty
app.get('/api/initMatch', isLoggedIn,async (req, res) => {
  req.session.points = Number(0);
  req.session.meme = [];
  await req.session.save();
  res.status(200).json({message: 'done'});
});

// GET ROUND FOR NO LOGGED PLAYER
app.get('/api/round/single', async (req, res) => {
  try {
    const chosen_meme = await memeDao.getMeme();
    const captions = await memeDao.getCaptions(chosen_meme.id);
    const round = {meme: chosen_meme, captions: captions};
    res.json(round);
  } catch (error) {
    console.error(`ERROR: ${error.message}`);
    res.status(503).json({error: 'Not able to get the single round.'});
  }
});

app.get('/api/history', isLoggedIn, async (req, res) => {
  try {
    const response = await memeDao.getHistory(req.user.id);
    //console.log(response);
    res.json(response);
  } catch (error) {
    console.error(`ERROR: ${error.message}`);
    res.status(503).json({error: 'Not able to retrieve history.'});
  }
});

app.get('/api/matchHistory/:id', isLoggedIn, async (req, res) => {
  try {
    const response = await memeDao.getMatchHistory(req.params.id);
    //console.log(response);
    res.json(response);
  } catch (error) {
    console.error(`ERROR: ${error.message}`);
    res.status(503).json({error: 'Not able to retrieve match history of game.'});
  }
});

// GET ROUND FOR LOGGED PLAYER
app.get('/api/loggedround', isLoggedIn, async (req, res) => {
  try {
    const chosen_meme = await memeDao.getMeme(req.session.meme);
    const captions = await memeDao.getCaptions(chosen_meme.id);
    req.session.meme.push(chosen_meme.id);
    await req.session.save();
    const round = {meme: chosen_meme, captions: captions};
    res.json(round);
  } catch (error) {
    console.error(`ERROR: ${error.message}`);
    res.status(503).json({error: 'Impossible to get the round.'});
  }
});

app.post('/api/checkRound', async (req, res) => {
  try {
    const points = await memeDao.checkRoundPoints(req.body);
    const correctCaptions = await memeDao.correctRoundCaptions(req.body);
    res.json({points: points.points, correctCapId: correctCaptions.ids, correctCap: correctCaptions.captions});
  } catch (error) {
    console.error(`ERROR: ${error.message}`);
    res.status(503).json({error: 'Not able to check the result.'});
  }
});

app.post('/api/checkRoundLog', isLoggedIn, async (req, res) => {
  try {
    const points = await memeDao.checkRoundPoints(req.body);
    const correctCaptions = await memeDao.correctRoundCaptions(req.body);
    req.session.points += Number(points.points);
    await req.session.save();
    res.json({points: points.points, correctCapId: correctCaptions.ids, correctCap: correctCaptions.captions});
  } catch (error) {
    console.error(`ERROR: ${error.message}`);
    res.status(503).json({error: 'Not able to check the result.'});
  }
});

// Create Match for logged player with all match details, and update total user points
app.post('/api/createMatch', isLoggedIn, async (req, res) => {
  try {
    const last_id = await memeDao.createMatch(req.body, req.session.points, req.session.passport.user.id);
    // req.body.user_id
    const response = await memeDao.setMatchPoints(req.session.passport.user.id, req.session.points);
    res.json({id: last_id, points: req.session.points});
  } catch (error) {
    console.error(`ERROR: ${error.message}`);
    res.status(503).json({error: 'Not able to store the match.'});
  }
});

const port = 3001;

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
