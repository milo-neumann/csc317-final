const path = require("path");
const db = require(path.join(__dirname, "database.js"));

// Find user by username
function findUserByUsername(username) {
  return db.prepare("SELECT * FROM users WHERE username = ?").get(username);
}

// Find user by email
function findUserByEmail(email) {
  return db.prepare("SELECT * FROM users WHERE email = ?").get(email);
}

// Find user by ID
function findUserById(id) {
  return db.prepare("SELECT * FROM users WHERE id = ?").get(id);
}

// Create user
function createUser({ username, email, passwordHash }) {
  const stmt = db.prepare(`
    INSERT INTO users (email, username, password)
    VALUES (?, ?, ?)
  `);
  const result = stmt.run(email, username, passwordHash);
  return result.lastInsertRowid;
}

module.exports = {
  findUserByUsername,
  findUserByEmail,
  findUserById,
  createUser,
};
