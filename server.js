const path = require("path");
const express = require("express");
const session = require("express-session");

const app = express();
const db = require(path.join(__dirname, "data", "database.js"));
const seed = require(path.join(__dirname, "data", "seed.js"));
const PORT = process.env.PORT || 3000;

// ----- VIEW ENGINE (Pug) -----
app.set("view engine", "pug");
// If your views folder is in the default location "./views", no need to set app.set("views", ...)

// ----- MIDDLEWARE -----

// Serve everything in /public as static assets (CSS, images, client JS, etc.)
app.use(express.static(path.join(__dirname, "public")));

// Parse JSON bodies (for reseed API, etc.)
app.use(express.json());

// Parse form data from POST <form> submissions (for login/register)
app.use(express.urlencoded({ extended: false }));

// Session middleware (must come BEFORE routers that use req.session)
app.use(
  session({
    secret: "super-secret-key", // change this to something random
    resave: false,
    saveUninitialized: false,
  })
);

// Make currentUser available in all views
app.use((req, res, next) => {
  if (req.session.userId) {
    res.locals.currentUser = {
      id: req.session.userId,
      username: req.session.username,
      email: req.session.email,
    };
  } else {
    res.locals.currentUser = null;
  }
  next();
});

// ----- ROUTERS -----
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");

// Auth + profile routes (login, register, dashboard, profile, logout, etc.)
app.use("/", authRouter);
app.use("/", profileRouter);

// Landing page: redirect root to /login
app.get("/", (req, res) => {
  res.redirect("/login");
});

// ----- OTHER ROUTES (stocks, reseed) -----

// Stock symbols will bring up the stock template populated with data for that stock
app.get("/stock/:sym", (req, res) => {
  const sym = req.params.sym.toUpperCase();
  const stock = db.prepare("select * from stocks WHERE symbol = ?").get(sym);
  try {
    const prices = db.prepare("select * from prices WHERE stock_id = ?").all(stock.id);
    res.render("stock", { stock: stock, price_rows: prices });
  } catch (error) {
    console.error(`Error finding ${sym} presumably: `, error);
    if (!stock) {
      res.status(404).send(`Stock symbol ${sym} not found`);
    } else {
      res
        .status(500)
        .send("Unknown server error, maybe an issue with Pug template");
    }
  }
});

// adding to cart
app.post('/api/add_to_cart', (req, res) => {
  const insert = db.prepare("INSERT INTO cart (user, symbol, quantity, price) VALUES (?, ?, ?, ?);")
  insert.run(req.body.user, req.body.symbol, req.body.quantity, req.body.price);
  res.status(200).json({
    message: 'hi',
    data: req.body
  });
});

// dumping cart
app.post('/api/dump_cart', (req, res) => {
  const dump = db.prepare("DELETE FROM cart WHERE user = ?;")
  dump.run(req.body.user);
  res.status(200).send('cart succesfully deleted for ' + req.body.user);  
});

// Route to fill out the price database
app.get("/reseed", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "reseed.html"));
});

app.get("/api/reseed", (req, res) => {
  const rows = seed();
  res.json(rows);
});

// ----- START SERVER -----
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
