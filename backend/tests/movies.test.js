const request = require('supertest');
const app = require('../server');
const Movie = require('../models/movie.model');

describe('Movies Controller - COMPLETE', () => {
  beforeEach(async () => {
    await Movie.deleteMany({});
  });

  test('GET /movies - should get all movies with pagination', async () => {
    await Movie.create([
      {
        title: 'Movie 1',
        overview: 'Overview 1',
        genre: ['Action'],
        releaseDate: new Date('2024-01-01'),
        poster: 'poster1.jpg',
        backdrop: 'backdrop1.jpg',
        duration: 120,
        rating: 7.5
      },
      {
        title: 'Movie 2',
        overview: 'Overview 2',
        genre: ['Drama'],
        releaseDate: new Date('2024-02-01'),
        poster: 'poster2.jpg',
        backdrop: 'backdrop2.jpg',
        duration: 130,
        rating: 8.0
      }
    ]);

    const response = await request(app)
      .get('/api/movies')
      .expect(200);

    expect(response.body.movies).toHaveLength(2);
    expect(response.body.totalMovies).toBe(2);
    expect(response.body.currentPage).toBe(1);
  });

  test('GET /movies - should filter by genre', async () => {
    await Movie.create([
      {
        title: 'Action Movie',
        overview: 'Action overview',
        genre: ['Action'],
        releaseDate: new Date(),
        poster: 'action.jpg',
        backdrop: 'action-bd.jpg',
        duration: 120
      },
      {
        title: 'Drama Movie',
        overview: 'Drama overview',
        genre: ['Drama'],
        releaseDate: new Date(),
        poster: 'drama.jpg',
        backdrop: 'drama-bd.jpg',
        duration: 110
      }
    ]);

    const response = await request(app)
      .get('/api/movies?genre=Action')
      .expect(200);

    expect(response.body.movies).toHaveLength(1);
    expect(response.body.movies[0].title).toBe('Action Movie');
  });

  test('GET /movies - should search by title', async () => {
    await Movie.create({
      title: 'Avatar The Way of Water',
      overview: 'Avatar sequel',
      genre: ['Sci-Fi'],
      releaseDate: new Date(),
      poster: 'avatar.jpg',
      backdrop: 'avatar-bd.jpg',
      duration: 192
    });

    const response = await request(app)
      .get('/api/movies?search=Avatar')
      .expect(200);

    expect(response.body.movies).toHaveLength(1);
    expect(response.body.movies[0].title).toBe('Avatar The Way of Water');
  });

  test('GET /movies - should sort by rating', async () => {
    await Movie.create([
      {
        title: 'Low Rating',
        overview: 'Low rated movie',
        genre: ['Action'],
        releaseDate: new Date(),
        poster: 'low.jpg',
        backdrop: 'low-bd.jpg',
        duration: 100,
        rating: 5.0
      },
      {
        title: 'High Rating',
        overview: 'High rated movie',
        genre: ['Drama'],
        releaseDate: new Date(),
        poster: 'high.jpg',
        backdrop: 'high-bd.jpg',
        duration: 120,
        rating: 9.0
      }
    ]);

    const response = await request(app)
      .get('/api/movies?sort=rating')
      .expect(200);

    expect(response.body.movies[0].title).toBe('High Rating');
    expect(response.body.movies[1].title).toBe('Low Rating');
  });

  test('GET /movies/random - should get random movies', async () => {
    await Movie.create([
      {
        title: 'Random 1',
        overview: 'Random 1 overview',
        genre: ['Comedy'],
        releaseDate: new Date(),
        poster: 'r1.jpg',
        backdrop: 'r1-bd.jpg',
        duration: 90
      },
      {
        title: 'Random 2',
        overview: 'Random 2 overview',
        genre: ['Horror'],
        releaseDate: new Date(),
        poster: 'r2.jpg',
        backdrop: 'r2-bd.jpg',
        duration: 95
      }
    ]);

    const response = await request(app)
      .get('/api/movies/random?limit=2')
      .expect(200);

    expect(response.body).toHaveLength(2);
  });

  test('GET /movies/:id - should get movie by id', async () => {
    const movie = await Movie.create({
      title: 'Specific Movie',
      overview: 'Specific movie overview',
      genre: ['Thriller'],
      releaseDate: new Date('2024-03-15'),
      poster: 'specific.jpg',
      backdrop: 'specific-bd.jpg',
      duration: 115,
      rating: 7.8,
      platforms: [
        { name: 'Netflix', available: true },
        { name: 'Amazon Prime', available: false }
      ]
    });

    const response = await request(app)
      .get(`/api/movies/${movie._id}`)
      .expect(200);

    expect(response.body.title).toBe('Specific Movie');
    expect(response.body.rating).toBe(7.8);
    expect(response.body.platforms).toHaveLength(2);
  });

  test('GET /movies/:id - should return 404 for non-existent movie', async () => {
    const response = await request(app)
      .get('/api/movies/507f1f77bcf86cd799439011')
      .expect(404);

    expect(response.body.error).toContain('no encontrada');
  });

  test('GET /movies/genre/:genre - should get movies by genre', async () => {
    await Movie.create([
      {
        title: 'Comedy 1',
        overview: 'Funny movie',
        genre: ['Comedy'],
        releaseDate: new Date(),
        poster: 'comedy1.jpg',
        backdrop: 'comedy1-bd.jpg',
        duration: 95,
        rating: 7.2
      },
      {
        title: 'Comedy 2',
        overview: 'Hilarious movie',
        genre: ['Comedy', 'Romance'],
        releaseDate: new Date(),
        poster: 'comedy2.jpg',
        backdrop: 'comedy2-bd.jpg',
        duration: 105,
        rating: 7.8
      }
    ]);

    const response = await request(app)
      .get('/api/movies/genre/Comedy')
      .expect(200);

    expect(response.body).toHaveLength(2);
    expect(response.body[0].genre).toContain('Comedy');
  });

  test('GET /movies/genres - should get all genres', async () => {
    await Movie.create([
      {
        title: 'Movie 1',
        overview: 'Overview 1',
        genre: ['Action', 'Adventure'],
        releaseDate: new Date(),
        poster: 'm1.jpg',
        backdrop: 'm1-bd.jpg',
        duration: 120
      },
      {
        title: 'Movie 2',
        overview: 'Overview 2',
        genre: ['Drama', 'Romance'],
        releaseDate: new Date(),
        poster: 'm2.jpg',
        backdrop: 'm2-bd.jpg',
        duration: 110
      }
    ]);

    const response = await request(app)
      .get('/api/movies/genres')
      .expect(200);

    expect(response.body).toContain('Action');
    expect(response.body).toContain('Adventure');
    expect(response.body).toContain('Drama');
    expect(response.body).toContain('Romance');
  });
});