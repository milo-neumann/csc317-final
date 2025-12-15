const express = require('express');
const { requireLogin } = require('../middleware/auth');
const path = require("path");
const db = require(path.join(__dirname, "..", "data", "database.js")); // keep for future DB use if needed
const { findUserById } = require("../data/userQueries");

const router = express.Router();

// 🧾 Dashboard (My Account)
router.get('/dashboard', requireLogin, (req, res) => {
  res.render('dashboard', {
    title: 'My Account',
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
