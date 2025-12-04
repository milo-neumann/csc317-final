const path = require("path");
const express = require("express");
const app = express();
const db = require(path.join(__dirname, "data", "database.js"));
const seed = require(path.join(__dirname, "data", "seed.js"));
const PORT = process.env.PORT || 3000;

// Serve everything in /public as static assets
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// (Optional) Explicit route for home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
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
