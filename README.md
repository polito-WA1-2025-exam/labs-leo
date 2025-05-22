# 🎮 MEME GAME - Full Stack Web Application

**Student**: s337544 RAHMATI SHADMEHR  
**Course**: Web Applications I  
**Academic Year**: 2024-2025

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation & Setup](#installation--setup)
- [Game Rules](#game-rules)
- [Architecture](#architecture)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)
- [Screenshots](#screenshots)

## 🎯 Overview

MEME GAME is a fun, interactive web application where players match captions to meme images. Players have 30 seconds to select the correct caption from 7 options. The game features both guest and registered player modes, with score tracking and game history for authenticated users.

### 🌟 Key Features

- **Two Game Modes**: 
  - Guest mode (1 round)
  - Registered user mode (3 rounds with score accumulation)
- **Real-time Timer**: 30-second countdown with visual feedback
- **Authentication System**: Secure login/registration with password hashing
- **Score Tracking**: Points accumulation and leaderboard functionality
- **Game History**: Complete match history for registered players
- **Responsive Design**: Mobile-friendly Bootstrap interface
- **Interactive UI**: Smooth animations and user feedback

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **Vite** - Fast build tool and development server
- **React Router DOM** - Client-side routing
- **Bootstrap 5** + **React Bootstrap** - Responsive UI components
- **Bootstrap Icons** - Icon library
- **PropTypes** - Runtime type checking

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **SQLite3** - Lightweight database
- **Passport.js** - Authentication middleware (Local Strategy)
- **Express Session** - Session management
- **Express Validator** - Input validation
- **Crypto** - Password hashing with salt
- **CORS** - Cross-origin resource sharing
- **Morgan** - HTTP request logger

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### 1. Clone the Repository
```bash
git clone <repository-url>
cd labs-leo
```

### 2. Install Dependencies

**Server Setup:**
```bash
cd server
npm install
```

**Client Setup:**
```bash
cd client
npm install
```

### 3. Start the Application

**Terminal 1 - Start Backend Server:**
```bash
cd server
node server.mjs
```
Server runs on: `http://localhost:3001`

**Terminal 2 - Start Frontend Client:**
```bash
cd client
npm run dev
```
Client runs on: `http://localhost:5173`

### 4. Access the Application
Open your browser and navigate to `http://localhost:5173`

## 🎮 Game Rules

### 🎯 Objective
Match the correct caption(s) to the displayed meme image within 30 seconds.

### 🎲 Gameplay
1. **Guest Players**: Play 1 round without registration
2. **Registered Players**: Play 3 consecutive rounds
3. Each round displays:
   - 1 meme image
   - 7 caption options (2 correct, 5 incorrect)
   - 30-second countdown timer

### 🏆 Scoring
- **Correct Answer**: +5 points
- **Wrong Answer**: 0 points
- **Time Up**: 0 points
- Points accumulate across all 3 rounds for registered users

### 🎨 Visual Feedback
- **Green Buttons**: Correct captions
- **Red Buttons**: Selected wrong caption
- **Timer Colors**: Green → Yellow → Red (based on remaining time)

## 🏗️ Architecture

### Frontend Architecture
```
src/
├── components/          # Reusable React components
│   ├── home/           # Home page component
│   ├── login/          # Authentication components
│   ├── matchGame/      # Main game logic
│   ├── timer/          # Timer component
│   ├── navheader/      # Navigation header
│   ├── profilePage/    # User profile and history
│   └── resume/         # Post-game summary
├── contexts/           # React Context providers
├── assets/            # Static assets
└── API.mjs           # API communication layer
```

### Backend Architecture
```
server/
├── server.mjs         # Main Express server
├── dao-users.mjs      # User data access layer
├── meme-dao.mjs       # Game data access layer
├── MemeModels.mjs     # Data models
├── db.mjs             # Database connection
└── meme.db           # SQLite database file
```

## 📡 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/sessions` | User login | No |
| POST | `/api/signup` | User registration | No |
| GET | `/api/sessions/current` | Check auth status | No |
| DELETE | `/api/sessions/current` | User logout | Yes |

### Game Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/round/single` | Get round for guest | No |
| GET | `/api/loggedround` | Get round for user | Yes |
| POST | `/api/checkRound` | Check guest answer | No |
| POST | `/api/checkRoundLog` | Check user answer | Yes |
| GET | `/api/initMatch` | Initialize game session | Yes |
| POST | `/api/createMatch` | Save completed game | Yes |

### User Data Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/history` | Get user game history | Yes |
| GET | `/api/matchHistory/:id` | Get specific match details | Yes |

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_email TEXT UNIQUE NOT NULL,
    user_name TEXT NOT NULL,
    user_pass TEXT NOT NULL,
    user_salt TEXT NOT NULL,
    user_points INTEGER DEFAULT 0
);
```

### Memes Table
```sql
CREATE TABLE memes (
    meme_id INTEGER PRIMARY KEY AUTOINCREMENT,
    meme_name TEXT NOT NULL
);
```

### Captions Table
```sql
CREATE TABLE captions (
    caption_id INTEGER PRIMARY KEY AUTOINCREMENT,
    caption_text TEXT NOT NULL,
    meme_id INTEGER,
    FOREIGN KEY (meme_id) REFERENCES memes(meme_id)
);
```

### Matches Table
```sql
CREATE TABLE matches (
    match_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    match_details TEXT, -- JSON containing 3 rounds
    match_points INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
```

## 📊 Application Routes

### Frontend Routes

| Route | Component | Description | Protection |
|-------|-----------|-------------|------------|
| `/` | Home | Landing page with start button | Public |
| `/login` | LoginForm | User authentication | Public |
| `/register` | Register | User registration | Public |
| `/game` | GameMatch | Main game interface | Public |
| `/profile` | ProfilePage | User stats and history | Protected |
| `/resume` | Resume | Post-game summary | Protected |

## 🔐 Security Features

### Password Security
- **Salted Hashing**: Uses `crypto.scrypt()` with random salt
- **Timing Safe Comparison**: Prevents timing attacks
- **Minimum Length**: 6 character requirement

### Session Management
- **Secure Sessions**: Express-session with secret key
- **Authentication Middleware**: Route protection
- **Automatic Cleanup**: Session invalidation on logout

### Input Validation
- **Client-side Validation**: React form validation
- **Server-side Validation**: Express-validator middleware
- **SQL Injection Prevention**: Parameterized queries

## 🎨 User Interface Features

### Interactive Elements
- **Responsive Timer**: Circular progress indicator
- **Loading States**: Smooth transitions between rounds
- **Toast Notifications**: User feedback system
- **Modal Instructions**: First-time player guide
- **Animated Transitions**: Round progression effects

### Accessibility
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Support**: Semantic HTML structure
- **Color Contrast**: Accessible color schemes
- **Mobile Responsive**: Touch-friendly interface

## 🧪 Development Features

### Code Quality
- **ESLint Configuration**: Code linting and formatting
- **PropTypes Validation**: Runtime type checking
- **Error Boundaries**: Graceful error handling
- **Component Modularity**: Reusable component architecture

### Development Tools
- **Vite Hot Reload**: Fast development iteration
- **Morgan Logging**: HTTP request logging
- **CORS Configuration**: Development environment setup
- **Git Integration**: Version control with .gitignore

## 📱 Screenshots

*[Add screenshots of your application here]*

- Home page with game start button
- Game interface with timer and captions
- User profile with game history
- Post-game results summary

## 🚀 Future Enhancements

- [ ] Multiplayer functionality
- [ ] Custom meme upload
- [ ] Difficulty levels
- [ ] Social sharing features
- [ ] Mobile app version
- [ ] Real-time leaderboards

## 🤝 Contributing

This is an academic project for the Web Applications I course. While contributions are not expected, feedback and suggestions are welcome.

## 📄 License

This project is created for educational purposes as part of the Web Applications I course at Politecnico di Torino.

## 👨‍💻 Author

**Shadmehr Rahmati** - Student ID: s337544  
Politecnico di Torino - Web Applications I  
Academic Year: 2024-2025

---

*Built with ❤️ using React, Node.js, and modern web technologies*