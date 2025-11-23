const request = require('supertest');
const app = require('../server');
const User = require('../models/user.model');

describe('Users Controller - COMPLETE', () => {
  let token, userId;

  beforeAll(async () => {
    await User.deleteMany({});
    // Crear usuario de prueba explícitamente
    const user = await User.create({
      _id: '507f1f77bcf86cd799439011',
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });
    userId = user._id;
    token = 'test-token';
  });

  test('GET /auth/me - should get current user profile', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(response.body.data.user.email).toBe('test@example.com');
    expect(response.body.data.user.username).toBe('testuser');
  });

  test('PATCH /auth/updateMe - should update username', async () => {
    const response = await request(app)
      .patch('/api/auth/updateMe')
      .set('Authorization', `Bearer ${token}`)
      .send({
        username: 'updatedusername'
      })
      .expect(200);

    expect(response.body.data.user.username).toBe('updatedusername');
    expect(response.body.data.user.email).toBe('test@example.com'); // Email should remain
  });

  test('PATCH /auth/updateMe - should update avatar', async () => {
    const response = await request(app)
      .patch('/api/auth/updateMe')
      .set('Authorization', `Bearer ${token}`)
      .send({
        avatar: 'https://example.com/new-avatar.jpg'
      })
      .expect(200);

    expect(response.body.data.user.avatar).toBe('https://example.com/new-avatar.jpg');
  });

  test('POST /auth/watchlist - should add movie to watchlist', async () => {
    const response = await request(app)
      .post('/api/auth/watchlist')
      .set('Authorization', `Bearer ${token}`)
      .send({
        itemId: '507f1f77bcf86cd799439011',
        itemType: 'movie',
        title: 'Inception',
        poster: 'inception-poster.jpg'
      })
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(response.body.message).toBe('Agregado a tu lista');
    expect(response.body.watchlist).toHaveLength(1);
    expect(response.body.watchlist[0].title).toBe('Inception');
  });

  test('POST /auth/watchlist - should add tvshow to watchlist', async () => {
    const response = await request(app)
      .post('/api/auth/watchlist')
      .set('Authorization', `Bearer ${token}`)
      .send({
        itemId: '507f1f77bcf86cd799439012',
        itemType: 'tvshow',
        title: 'Breaking Bad',
        poster: 'breaking-bad-poster.jpg'
      })
      .expect(200);

    expect(response.body.message).toBe('Agregado a tu lista');
  });

  test('POST /auth/watchlist - should fail with duplicate item', async () => {
    // Add first time
    await request(app)
      .post('/api/auth/watchlist')
      .set('Authorization', `Bearer ${token}`)
      .send({
        itemId: '507f1f77bcf86cd799439013',
        itemType: 'movie',
        title: 'The Matrix',
        poster: 'matrix-poster.jpg'
      });

    // Try duplicate
    const response = await request(app)
      .post('/api/auth/watchlist')
      .set('Authorization', `Bearer ${token}`)
      .send({
        itemId: '507f1f77bcf86cd799439013',
        itemType: 'movie',
        title: 'The Matrix',
        poster: 'matrix-poster.jpg'
      })
      .expect(400);

    expect(response.body.error).toContain('Ya está en tu lista');
  });

  test('DELETE /auth/watchlist - should remove from watchlist', async () => {
    // First add item
    await request(app)
      .post('/api/auth/watchlist')
      .set('Authorization', `Bearer ${token}`)
      .send({
        itemId: '507f1f77bcf86cd799439014',
        itemType: 'movie',
        title: 'Movie to remove',
        poster: 'remove-poster.jpg'
      });

    // Then remove it
    const response = await request(app)
      .delete('/api/auth/watchlist')
      .set('Authorization', `Bearer ${token}`)
      .send({
        itemId: '507f1f77bcf86cd799439014',
        itemType: 'movie'
      })
      .expect(200);

    expect(response.body.message).toBe('Removido de tu lista');
  });

  test('GET /auth/watchlist - should get user watchlist', async () => {
    // Add some items first
    await request(app)
      .post('/api/auth/watchlist')
      .set('Authorization', `Bearer ${token}`)
      .send({
        itemId: '507f1f77bcf86cd799439015',
        itemType: 'movie',
        title: 'Watchlist Movie 1',
        poster: 'wm1.jpg'
      });

    await request(app)
      .post('/api/auth/watchlist')
      .set('Authorization', `Bearer ${token}`)
      .send({
        itemId: '507f1f77bcf86cd799439016',
        itemType: 'tvshow',
        title: 'Watchlist Series 1',
        poster: 'ws1.jpg'
      });

    const response = await request(app)
      .get('/api/auth/watchlist')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(response.body.data.watchlist).toHaveLength(2);
    expect(response.body.data.watchlist[0].title).toBe('Watchlist Movie 1');
    expect(response.body.data.watchlist[1].title).toBe('Watchlist Series 1');
  });
});