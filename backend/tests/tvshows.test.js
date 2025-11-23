const request = require('supertest');
const app = require('../server');
const TVShow = require('../models/tvshow.model');

describe('TVShows Controller - COMPLETE', () => {
  beforeEach(async () => {
    await TVShow.deleteMany({});
  });

  test('GET /tvshows - should get all tv shows', async () => {
    await TVShow.create([
      {
        title: 'Series 1',
        overview: 'Series 1 overview',
        genre: ['Drama'],
        firstAirDate: new Date('2024-01-01'),
        poster: 'series1.jpg',
        backdrop: 'series1-bd.jpg',
        numberOfSeasons: 2,
        numberOfEpisodes: 16,
        rating: 8.2
      },
      {
        title: 'Series 2',
        overview: 'Series 2 overview',
        genre: ['Comedy'],
        firstAirDate: new Date('2024-02-01'),
        poster: 'series2.jpg',
        backdrop: 'series2-bd.jpg',
        numberOfSeasons: 1,
        numberOfEpisodes: 8,
        rating: 7.8
      }
    ]);

    const response = await request(app)
      .get('/api/tvshows')
      .expect(200);

    expect(response.body.tvshows).toHaveLength(2);
    expect(response.body.totalTVShows).toBe(2);
  });

  test('GET /tvshows - should filter by genre', async () => {
    await TVShow.create([
      {
        title: 'Drama Series',
        overview: 'Drama series overview',
        genre: ['Drama'],
        firstAirDate: new Date(),
        poster: 'drama.jpg',
        backdrop: 'drama-bd.jpg',
        numberOfSeasons: 3
      },
      {
        title: 'Comedy Series',
        overview: 'Comedy series overview',
        genre: ['Comedy'],
        firstAirDate: new Date(),
        poster: 'comedy.jpg',
        backdrop: 'comedy-bd.jpg',
        numberOfSeasons: 2
      }
    ]);

    const response = await request(app)
      .get('/api/tvshows?genre=Drama')
      .expect(200);

    expect(response.body.tvshows).toHaveLength(1);
    expect(response.body.tvshows[0].title).toBe('Drama Series');
  });

  test('GET /tvshows/random - should get random tv shows', async () => {
    await TVShow.create([
      {
        title: 'Random Series 1',
        overview: 'Random 1 overview',
        genre: ['Action'],
        firstAirDate: new Date(),
        poster: 'rs1.jpg',
        backdrop: 'rs1-bd.jpg',
        numberOfSeasons: 1
      },
      {
        title: 'Random Series 2',
        overview: 'Random 2 overview',
        genre: ['Sci-Fi'],
        firstAirDate: new Date(),
        poster: 'rs2.jpg',
        backdrop: 'rs2-bd.jpg',
        numberOfSeasons: 2
      }
    ]);

    const response = await request(app)
      .get('/api/tvshows/random?limit=2')
      .expect(200);

    expect(response.body).toHaveLength(2);
  });

  test('GET /tvshows/:id - should get tv show by id', async () => {
    const tvshow = await TVShow.create({
      title: 'Specific Series',
      overview: 'Specific series overview',
      genre: ['Thriller', 'Mystery'],
      firstAirDate: new Date('2024-03-20'),
      lastAirDate: new Date('2024-05-22'),
      poster: 'specific.jpg',
      backdrop: 'specific-bd.jpg',
      numberOfSeasons: 1,
      numberOfEpisodes: 10,
      rating: 8.5,
      seasons: [
        {
          seasonNumber: 1,
          episodeCount: 10,
          airDate: new Date('2024-03-20'),
          overview: 'First season'
        }
      ],
      platforms: [
        { name: 'HBO Max', available: true }
      ]
    });

    const response = await request(app)
      .get(`/api/tvshows/${tvshow._id}`)
      .expect(200);

    expect(response.body.title).toBe('Specific Series');
    expect(response.body.rating).toBe(8.5);
    expect(response.body.seasons).toHaveLength(1);
    expect(response.body.platforms).toHaveLength(1);
  });

  test('GET /tvshows/genre/:genre - should get tv shows by genre', async () => {
    await TVShow.create([
      {
        title: 'Fantasy Series',
        overview: 'Fantasy series overview',
        genre: ['Fantasy'],
        firstAirDate: new Date(),
        poster: 'fantasy.jpg',
        backdrop: 'fantasy-bd.jpg',
        numberOfSeasons: 3,
        rating: 8.7
      },
      {
        title: 'Fantasy Drama',
        overview: 'Fantasy drama overview',
        genre: ['Fantasy', 'Drama'],
        firstAirDate: new Date(),
        poster: 'fantasy2.jpg',
        backdrop: 'fantasy2-bd.jpg',
        numberOfSeasons: 2,
        rating: 8.3
      }
    ]);

    const response = await request(app)
      .get('/api/tvshows/genre/Fantasy')
      .expect(200);

    expect(response.body).toHaveLength(2);
    expect(response.body[0].genre).toContain('Fantasy');
  });

  test('GET /tvshows/genres - should get all genres', async () => {
    await TVShow.create([
      {
        title: 'Series A',
        overview: 'Series A overview',
        genre: ['Action', 'Adventure'],
        firstAirDate: new Date(),
        poster: 'sa.jpg',
        backdrop: 'sa-bd.jpg',
        numberOfSeasons: 2
      },
      {
        title: 'Series B',
        overview: 'Series B overview',
        genre: ['Drama', 'Romance'],
        firstAirDate: new Date(),
        poster: 'sb.jpg',
        backdrop: 'sb-bd.jpg',
        numberOfSeasons: 1
      }
    ]);

    const response = await request(app)
      .get('/api/tvshows/genres')
      .expect(200);

    expect(response.body).toContain('Action');
    expect(response.body).toContain('Adventure');
    expect(response.body).toContain('Drama');
    expect(response.body).toContain('Romance');
  });
});