const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviews.controller');
const authController = require('../controllers/auth.controller');

// Rutas públicas
router.get('/', reviewController.getAllReviews);
router.get('/movie/:movieId', reviewController.getReviewsByMovie);

// Rutas protegidas
router.use(authController.protect);

router.get('/user/my-reviews', reviewController.getUserReviews);
router.post('/', reviewController.createReview);
router.put('/:id', reviewController.updateReview);
router.delete('/:id', reviewController.deleteReview);
router.patch('/:id/rate', reviewController.rateReview);

module.exports = router;