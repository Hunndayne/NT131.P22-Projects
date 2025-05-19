const express = require('express');
const router = express.Router();
const { userinfo, getUser, updateUser, deleteUser } = require('../controllers/user.controllers');

// router.get('/', getUser);
router.put('/', updateUser);
router.get('/', userinfo);
router.delete('/', deleteUser);

module.exports = router;