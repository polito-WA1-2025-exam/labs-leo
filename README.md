
## MEME GAME
## Student: s337544 RAHMATI SHADMEHR

## Start
- Open 2 terminals
- cd client --> npm run dev
- cd server --> node .\server.mjs

## React Client Application Routes
- Each route includes the NavHeader Component 
- Route `/`: Home, Show the button start game!
- Route `/profile`: Show the user info + total score + game history
- Route `/game`: You will find the game composed by the clock, the meme and the 7 captions
- Route `/resume`: At the end of the game, show the questions with the best answers and   my answer. At the bottom of the page, the RESTART button will appear!
- Route `/login`: Login form
- Route `/register`: Registration Form

## Main React Components

- `Home` (in `Home.jsx`): Render the home page
- `NavHeader` (in `NavHeader.jsx`): Render the navbar, the component has some links to home '/', login '/login' and profile '/profile'.
- `ProfilePage` (in `ProfilePage.jsx`): Render profile details and user history match. Only logged in users can access the page.
- `Register` (in `Register.jsx`): Render the registration form and create a new user.
- `LoginForm` (in `Auth.jsx`): Render the login form and perform the login. The login and logout buttons are defined in Auth.jsx.
- `GameMatch` (in `matchGame.jsx`): Render the game page. The game page consists of a timer (Timer.jsx), a meme image and 7 captions. Only one caption can be selected. When the user selects the caption or the timer runs out, the client makes a request to the server to check the correct answers. If the user is logged in, a 3 round game is played. Otherwise, if the user is not logged in, only 1 round is played.
After 3 rounds the client asks the server to save the game. If the game is successfully saved, the game ID is sent to the resume page.
- `Resume` (in `Resume.jsx`): Render the resume page. The resume page will only show the correct meme associations with the total points earned in the game. There is a restart button at the bottom of the page.
- `RoundBox` (in `RoundBox.jsx`): Render the history and resume box container.

## API Server

- POST `/api/sessions`: Perform user login.
  - req.body = { username, password }
  - response = {id: xx, username: xx, name: xx, points: xx }
  - response status codes and possible errors: 200- success
                                               401- wrong user pass

- POST `/api/signup`: Perform user registration. If registration is successful, also perform user login.
  - req.body = { username, password, name }
  - response = {id: xx, username: xx, name: xx, points: xx }
  - response status codes: 200- success

- POST `/api/checkRound`: Given the ID of the caption selected by the user, check if the answer is the correct one and return the correct captions of the round.
  - req.body = Round(user_id, meme, captions, points, selected_caption, match_id, round, correctCaptions)
  - response = {points: xx, correctCapId: [xx, xx], correctCap: [{}, {}]}
  - response status codes: 200- success
                           401- Not autorized
- POST `/api/checkRoundLog`: Same as checkRound, but only logged in users can call this API.

- POST `/api/createMatch`: This route is called when a logged in user finishes the 3 round game. This route inserts into the matches table the match completed by the user. It then updates the user_points in the users table.
  - req.body = {user_id: props.user.id, match_details: [{round1},{round2},{round3}]}
  - response status codes: 200- success;
                           401- Not autenticated
                           503- Not able to store the match
                                
- GET `/api/sessions/current`: This route checks whether the user is logged in or not
  - response = {id: xx, username: xx, name: xx, points: xx }
  - response status codes: 200- success
                           401- Not autenticated

- GET `/api/initMatch`: This route is called when a logged in user starts the game, initialising the session parameters match_points and oldmeme to 0 and empty.
  - response status codes: message: done;
                           401- Not autenticated


- GET `/api/round/single`: This route is the same as loggedround, prepare the round for unlogged user.
  - response = {meme: {xxx}, captions: [{},{}...]}
  - response status codes: 200- success
                           401- Not autorized
                           503- Not able to retrieve the single round

- GET `/api/loggedround`: Prepare the round for the registered player. Get a unique meme for the round and 7 captions.
  - req.body = {}
  - response = {meme: {xxx}, captions: [{},{}...]}
  - response status codes: 200- success
                           401- Not autorized

- GET `/api/history`: This route is called when a logged-in user opens the profile page, retrieves all the games played by the session user
  - response = [{match_details: [{},{},{}] match_points: x, match_id: x}, ...]
  - response status codes: 200- success;
                           401- Not autenticated
                           503- Not able to retrieve the history

- GET `/api/matchHistory/:id`: This route is called when a logged in user finishes the 3 round game and is waiting for the game to resume, the game details will only show the correct meme associations.
  - :id ==> Match_id
  - response = {points: row.match_points, details: match_details}
  - response status codes: 200- success;
                           401- Not autenticated
                           503- Not able to retrieve the history



- ...

## Database Tables

- Table `users` - Fields: {user_id, user_email, user_name, user_pass, user_salt, user_points}, user_points starts from 0
- Table `meme` - Fields: {meme_id, meme_name}, meme_name= 'this_memem.jpg'
- Table `captions` - Fields: {caption_id, caption_text, meme_id}, associate to each caption one meme
- Table `matches` - Fields: {match_id, user_id, match_details, match_points}, match_details contains the 3 rounds played.
- ...

