const path = require("path");
const express = require("express");
const app = express();
const db = require(path.join(__dirname, "data", "database.js"));
const seed = require(path.join(__dirname, "data", "seed.js"));
const PORT = process.env.PORT || 3000;

// Serve everything in /public as static assets
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// enable pug
app.set('view engine', 'pug');

// (Optional) Explicit route for home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// stock symbols will bring up the stock template populated with data for that stock
app.get("/stock/:sym", (req, res) => {
  const sym = req.params.sym.toUpperCase();
  const stock = db.prepare("select * from stocks WHERE symbol = ?").get(sym);
  try {
    const prices = db.prepare("select * from prices WHERE stock_id = ?").all(stock.id);

    res.render('stock', {symbol: stock.symbol, price_rows: prices});
  } catch (error) {
    console.error(`Error finding ${sym} presumably: `, error);
    if (!stock) {
      res.status(404).send(`Stock symbol ${sym} not found`);
    } else {
      res.status(500).send("Unknown server error, maybe an issue with Pug template")
    }

  }
});

// route to fill out the price database
app.get("/reseed", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "reseed.html"));
});
app.post("/api/reseed", (req, res) => {
  const rows = seed();
  res.json(rows);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
