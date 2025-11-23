const express = require('express');
const router = express.Router();
const tvshowController = require('../controllers/tvshows.controller');
const authController = require('../controllers/auth.controller');

// Rutas públicas
router.get('/', tvshowController.getAllTVShows);
router.get('/random', tvshowController.getRandomTVShows);
router.get('/genres', tvshowController.getGenres);
router.get('/genre/:genre', tvshowController.getTVShowsByGenre);
router.get('/:id', tvshowController.getTVShowById);

// Rutas protegidas (admin en el futuro)
router.use(authController.protect);
router.post('/', tvshowController.createTVShow);
router.put('/:id', tvshowController.updateTVShow);

module.exports = router;