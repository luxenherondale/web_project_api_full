const express = require('express');
const router = express.Router();
const { createUser } = require('../controllers/users');
const { validateUserCreation } = require('../middleware/validation');

router.post('/', validateUserCreation, createUser);

module.exports = router;
