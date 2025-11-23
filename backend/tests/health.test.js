const request = require('supertest');
const app = require('../server');

describe('Health Check', () => {
  test('GET /health - should return health status', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);

    expect(response.body.message).toBe('Backend funcionando correctamente');
    expect(response.body.timestamp).toBeDefined();
  });
});