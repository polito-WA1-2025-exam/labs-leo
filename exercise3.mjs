 
// Answer
function Answer(response, respondentUsername, score, date) {
  this.response = response;
  this.respondentUsername = respondentUsername;
  this.score = score;
  this.date = new Date(date);
}

// Question
function Question(question, questionerUsername, date) {
  this.question = question;
  this.questionerUsername = questionerUsername;
  this.date = new Date(date);
  this.answers = [];

  // Add answer
  this.add = function(answer) {
    this.answers.push(answer);
  };

  // Find answers by username
  this.find = function(username) {
    return this.answers.filter(answer => answer.respondentUsername === username);
  };

  // Get answers after a specific date
  this.afterDate = function(date) {
    const targetDate = new Date(date);
    return this.answers.filter(answer => answer.date > targetDate);
  };

  // List answers sorted by date (ascending)
  this.listByDate = function() {
    return [...this.answers].sort((a, b) => a.date - b.date);
  };

  // List answers sorted by score (descending)
  this.listByScore = function() {
    return [...this.answers].sort((a, b) => b.score - a.score);
  };
}

// Create a question and add answers
const q = new Question(
  "What's your favorite pet?",
  "poli",
  "2025-02-28"
);

q.add(new Answer("Dog", "doglover", 3, "2025-03-01"));
q.add(new Answer("cat", "cati", 10, "2025-02-29"));
q.add(new Answer("hamester", "hamham", 20, "2025-03-02"));
q.add(new Answer("bird", "polimo", 5, "2025-02-28"));
