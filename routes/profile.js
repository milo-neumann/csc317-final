const express = require('express');
const { requireLogin } = require('../middleware/auth');
const path = require("path");
const db = require(path.join(__dirname, "..", "data", "database.js")); // keep for future DB use if needed
const { findUserById } = require("../data/userQueries");

const router = express.Router();

// 🧾 Dashboard (My Portfolio)
router.get('/dashboard', requireLogin, (req, res) => {
  const user = findUserById(req.session.userId);
  if (!user) {
    req.session.error = 'User not found.';
    return res.redirect('/login');
  }

  const sql = `
    SELECT
      p.symbol,
      s.name,
      SUM(p.quantity) AS total_quantity,
      AVG(p.purchase_price) AS avg_purchase_price,
      (
        SELECT pr.price
        FROM prices pr
        WHERE pr.stock_id = s.id
        ORDER BY pr.day DESC
        LIMIT 1
      ) AS current_price
    FROM purchases p
    JOIN stocks s ON s.symbol = p.symbol
    WHERE p.user = ?
    GROUP BY p.symbol, s.name
    HAVING SUM(p.quantity) != 0
    ORDER BY p.symbol ASC
  `;

  const rows = db.prepare(sql).all(user.username);

  let portfolioTotal = 0;

  const positions = rows.map((row) => {
    const priceChange = row.current_price - row.avg_purchase_price;
    const pctChange = (priceChange / row.avg_purchase_price) * 100;
    const totalValue = row.current_price * row.total_quantity;
    const totalCost = row.avg_purchase_price * row.total_quantity;

    portfolioTotal += totalValue;

    return {
      symbol: row.symbol,
      name: row.name,
      total_quantity: row.total_quantity,
      avg_purchase_price_str: row.avg_purchase_price.toFixed(2),
      current_price_str: row.current_price.toFixed(2),
      priceChange_str: priceChange.toFixed(2),
      pctChange_str: pctChange.toFixed(2),
      totalValue,                            // numeric for chart
      totalValue_str: totalValue.toFixed(2), // formatted for table
      totalCost_str: totalCost.toFixed(2),
      isUp: priceChange >= 0,
    };
  });

  res.render('dashboard', {
    title: 'My Portfolio',
    positions,
    portfolioTotal_str: portfolioTotal.toFixed(2),
  });
});


// 👤 Profile page
router.get('/profile', requireLogin, async (req, res, next) => {
  try {
    const user = await findUserById(req.session.userId);
    if (!user) {
      req.session.error = 'User not found.';
      return res.redirect('/login');
    }
    res.render('profile', { title: 'Your Profile', user });
  } catch (err) {
    next(err);
  }
});

// 🛒 Shopping cart (requires login)
router.get('/cart', requireLogin, (req, res) => {
  const cart_items = db.prepare("SELECT * FROM cart WHERE user = ?").all(findUserById(req.session.userId).username);

  res.render('cart', {
    title: 'Your Cart',
    cart_items: cart_items,
  });
});

// 🏪 Store page (requires login – you can relax this later if you want)
router.get('/store', requireLogin, (req, res) => {
  res.render('store', {
    title: 'Store',
  });
});

// ℹ️ About page (public)
router.get('/about', (req, res) => {
  res.render('about', {
    title: 'About GatorTrade',
  });
});

module.exports = router;
