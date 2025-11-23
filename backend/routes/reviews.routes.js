const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviews.controller');
const { protect } = require('../middleware/auth.middleware');

// Rutas públicas
router.get('/', reviewController.getAllReviews);
router.get('/movie/:movieId', reviewController.getReviewsByMovie);

// Rutas protegidas
router.use(protect);

router.get('/user/my-reviews', reviewController.getUserReviews);
router.post('/', reviewController.createReview);
router.put('/:id', reviewController.updateReview);
router.delete('/:id', reviewController.deleteReview);
router.patch('/:id/rate', reviewController.rateReview);

module.exports = router;