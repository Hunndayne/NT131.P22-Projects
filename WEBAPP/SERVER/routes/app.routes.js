const express = require('express');
const router = express.Router();
const { search } = require('../controllers/app.controllers');

router.post('/search', search);

module.exports = router;