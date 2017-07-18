const express = require('express');
const router = express.Router();

//Bring in user model
let User = require('../models/user');

router.get('/register', (req, res) => {
  res.render('register');
});

module.exports = router
