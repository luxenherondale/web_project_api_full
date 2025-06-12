const express = require('express');
const router = express.Router();
const { login } = require('../controllers/users');
const { validateLogin } = require('../middleware/validation');

router.post('/', validateLogin, login);

module.exports = router;
