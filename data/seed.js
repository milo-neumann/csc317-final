// seeds the prices into the prices table of the database
const path = require("path");
const db = require(path.join(__dirname, "database.js"));

function seed() {
  db.exec(`
  drop table prices;
  CREATE TABLE prices (
  id integer primary key autoincrement, 
  stock_id integer, 
  day integer, 
  price real 
  );
`);

  // TODO: select all stock ids from stocks to do a for loop
  const insert = db.prepare(`INSERT INTO prices (stock_id, day, price) VALUES (?, ?, ?)`);
  
  for (i = 0; i < 7; i++) {
      insert.run(1, i + 1, 25 * Math.random());
  }
  
  return db.prepare("select stock_id, day, price from prices").all();
}

module.exports = seed;
