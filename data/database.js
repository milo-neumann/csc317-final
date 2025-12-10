// module to initialize and interact with the database
const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "database.sqlite"));
db.pragma("foreign_keys = OFF");

db.exec(`
  CREATE TABLE IF NOT EXISTS stocks (
  id integer primary key AUTOINCREMENT, 
  symbol text, 
  name text, 
  description text
  );
`);
db.exec(`
  CREATE TABLE IF NOT EXISTS prices (
  id integer primary key autoincrement, 
  stock_id integer, 
  day integer, 
  price real 
  );
`);
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);


module.exports = db;
