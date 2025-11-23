const request = require('supertest');
const app = require('../server');
const User = require('../models/user.model');

describe('Auth Controller', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  test('POST /register - should register new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        passwordConfirm: 'password123'
      })
      .expect(201);

    expect(response.body.status).toBe('success');
    expect(response.body.data.user.email).toBe('test@example.com');
  });

  test('POST /login - should login existing user', async () => {
    await User.create({
      username: 'loginuser',
      email: 'login@example.com',
      password: 'password123'
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login@example.com',
        password: 'password123'
      })
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(response.body.token).toBeDefined();
  });
});