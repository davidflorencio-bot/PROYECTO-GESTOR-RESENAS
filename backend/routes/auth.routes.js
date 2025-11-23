const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Rutas públicas
router.post('/register', authController.register);
router.post('/login', authController.login);

// Rutas protegidas
router.use(authController.protect);

router.get('/me', authController.getMe);
router.patch('/updateMe', authController.updateMe);
router.post('/watchlist', authController.addToWatchlist);
router.delete('/watchlist', authController.removeFromWatchlist);
router.get('/watchlist', authController.getWatchlist);

module.exports = router;