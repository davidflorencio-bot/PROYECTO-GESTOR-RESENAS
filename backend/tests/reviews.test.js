const request = require('supertest');
const app = require('../server');
const Review = require('../models/review.model');
const Movie = require('../models/movie.model');
const TVShow = require('../models/tvshow.model');
const User = require('../models/user.model');

describe('Reviews Controller - COMPLETE', () => {
  let token, movieId, tvshowId, userId;

  beforeEach(async () => {
    // Limpiar colecciones antes de cada test
    await User.deleteMany({});
    await Review.deleteMany({});
    await Movie.deleteMany({});
    await TVShow.deleteMany({});

    // Usar el usuario global de test
    const user = await User.create({
      _id: '507f1f77bcf86cd799439011',
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });
    userId = user._id;
    token = 'test-token';

    // Crear película y serie de prueba
    const movie = await Movie.create({
      title: 'Review Movie',
      overview: 'Movie for reviews',
      genre: ['Action'],
      releaseDate: new Date(),
      poster: 'movie-poster.jpg',
      backdrop: 'movie-backdrop.jpg',
      duration: 120
    });
    movieId = movie._id;

    const tvshow = await TVShow.create({
      title: 'Review TV Show',
      overview: 'TV Show for reviews',
      genre: ['Drama'],
      firstAirDate: new Date(),
      poster: 'tv-poster.jpg',
      backdrop: 'tv-backdrop.jpg',
      numberOfSeasons: 1
    });
    tvshowId = tvshow._id;
  });

  test('POST /reviews - should create movie review', async () => {
    const response = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send({
        movieId: movieId,
        itemType: 'Movie',
        text: 'Amazing movie! Great acting.',
        rating: 5
      })
      .expect(201);

    expect(response.body.message).toBe('Reseña creada exitosamente');
    expect(response.body.review.rating).toBe(5);
    expect(response.body.review.text).toBe('Amazing movie! Great acting.');
  });

  test('POST /reviews - should create TV show review', async () => {
    const response = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send({
        movieId: tvshowId,
        itemType: 'TVShow',
        text: 'Great series, loved the characters.',
        rating: 4
      })
      .expect(201);

    expect(response.body.message).toBe('Reseña creada exitosamente');
    expect(response.body.review.rating).toBe(4);
  });

  test('POST /reviews - should fail with duplicate review', async () => {
    // Create first review
    await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send({
        movieId: movieId,
        itemType: 'Movie',
        text: 'First review',
        rating: 3
      });

    // Try duplicate
    const response = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send({
        movieId: movieId,
        itemType: 'Movie',
        text: 'Duplicate review',
        rating: 4
      })
      .expect(400);

    expect(response.body.error).toContain('Ya has realizado una reseña para esta película/serie');
  });

  test('GET /reviews/movie/:id - should get reviews for movie', async () => {
    await Review.create({
      movieId: movieId,
      itemType: 'Movie',
      movieTitle: 'Review Movie',
      username: 'reviewuser',
      userId: userId,
      text: 'Test review content',
      rating: 4
    });

    const response = await request(app)
      .get(`/api/reviews/movie/${movieId}`)
      .expect(200);

    expect(response.body.reviews).toHaveLength(1);
    expect(response.body.reviews[0].text).toBe('Test review content');
    expect(response.body.totalReviews).toBe(1);
  });

  test('GET /reviews/user/my-reviews - should get user reviews', async () => {
    await Review.create({
      movieId: movieId,
      itemType: 'Movie',
      movieTitle: 'Review Movie',
      username: 'reviewuser',
      userId: userId,
      text: 'My personal review',
      rating: 5
    });

    const response = await request(app)
      .get('/api/reviews/user/my-reviews')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.reviews).toHaveLength(1);
    expect(response.body.reviews[0].text).toBe('My personal review');
  });

  test('PUT /reviews/:id - should update review', async () => {
    const review = await Review.create({
      movieId: movieId,
      itemType: 'Movie',
      movieTitle: 'Review Movie',
      username: 'reviewuser',
      userId: userId,
      text: 'Original text',
      rating: 3
    });

    const response = await request(app)
      .put(`/api/reviews/${review._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        text: 'Updated text',
        rating: 5
      })
      .expect(200);

    expect(response.body.message).toBe('Reseña actualizada exitosamente');
    expect(response.body.review.text).toBe('Updated text');
    expect(response.body.review.rating).toBe(5);
    expect(response.body.review.isEdited).toBe(true);
  });

  test('DELETE /reviews/:id - should delete review', async () => {
    const review = await Review.create({
      movieId: movieId,
      itemType: 'Movie',
      movieTitle: 'Review Movie',
      username: 'reviewuser',
      userId: userId,
      text: 'Review to delete',
      rating: 2
    });

    const response = await request(app)
      .delete(`/api/reviews/${review._id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.message).toBe('Reseña eliminada exitosamente');

    // Verify it's deleted
    const deletedReview = await Review.findById(review._id);
    expect(deletedReview).toBeNull();
  });

  test('PATCH /reviews/:id/rate - should rate review', async () => {
    const otherUser = await User.create({
      username: 'otheruser',
      email: 'other@example.com',
      password: 'password123'
    });

    const review = await Review.create({
      movieId: movieId,
      itemType: 'Movie',
      movieTitle: 'Review Movie',
      username: 'otheruser',
      userId: otherUser._id,
      text: 'Review to rate',
      rating: 4
    });

    const response = await request(app)
      .patch(`/api/reviews/${review._id}/rate`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        type: 'like'
      })
      .expect(200);

    expect(response.body.message).toBe('Calificación guardada exitosamente');
    expect(response.body.likes).toBe(1);
  });
});