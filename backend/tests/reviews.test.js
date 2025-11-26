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

    // Create test tvshow
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

  test('POST /reviews - should return 400 for missing data (e.g., missing rating)', async () => {
        const response = await request(app)
            .post('/api/reviews')
            .set('Authorization', `Bearer ${token}`)
            .send({
                movieId: movieId,
                itemType: 'Movie',
                text: 'Missing rating test',
                // rating: MISSING
            })
            .expect(400);

        expect(response.body.error).toContain('rating: Path `rating` is required');
    });

  test('PUT /reviews/:id - should return 404 for non-existent review ID', async () => {
        const response = await request(app)
            .put('/api/reviews/507f1f77bcf86cd799439999') // ID no existente
            .set('Authorization', `Bearer ${token}`)
            .send({ text: 'Update attempt' })
            .expect(404);

        expect(response.body.error).toContain('Reseña no encontrada');
    });
  test('PUT /reviews/:id - should return 403 if user tries to update another user\'s review', async () => {
        const otherUser = await User.create({
            username: 'hacker',
            email: 'hacker@example.com',
            password: 'password123'
        });
        
        // Crear una reseña con el usuario "testuser"
        const review = await Review.create({
            movieId: movieId,
            itemType: 'Movie',
            userId: userId, 
            text: 'Original text',
            rating: 3
        });
        
        // Mockear el token global para simular que OTRO usuario hace el PUT
        const otherToken = 'other-user-token'; 
        
        // **IMPORTANTE:** En tu setup.js, necesitarás un mecanismo para simular que `req.user` cambia al usuario 'hacker' 
        // o necesitas crear el test antes de mockear `auth.middleware`.
        // Como tu setup.js mockea `auth.middleware` de forma global, este test **solo pasará si modificas tu setup.js** // para permitir cambiar el usuario mockeado o si usas un token real.
        
        // Asumiendo que has ajustado el mock de autenticación para usar un token válido para 'hacker':
        const response = await request(app)
            .put(`/api/reviews/${review._id}`)
            .set('Authorization', `Bearer ${otherToken}`) // Token del otro usuario
            .send({ text: 'Hacked update' })
            .expect(403);

        expect(response.body.error).toContain('No tienes permiso para modificar esta reseña');
    });

    // TESTS PARA DELETE /reviews/:id
    test('DELETE /reviews/:id - should return 404 for non-existent review ID', async () => {
        const response = await request(app)
            .delete('/api/reviews/507f1f77bcf86cd799439999') // ID no existente
            .set('Authorization', `Bearer ${token}`)
            .expect(404);

        expect(response.body.error).toContain('Reseña no encontrada');
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