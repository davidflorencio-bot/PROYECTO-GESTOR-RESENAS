const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movies.controller');
const authController = require('../controllers/auth.controller');

// Rutas públicas
router.get('/', movieController.getAllMovies);
router.get('/random', movieController.getRandomMovies);
router.get('/genres', movieController.getGenres);
router.get('/genre/:genre', movieController.getMoviesByGenre);
router.get('/:id', movieController.getMovieById);

// Rutas protegidas (admin en el futuro)
router.use(authController.protect);
router.post('/', movieController.createMovie);
router.put('/:id', movieController.updateMovie);

module.exports = router;