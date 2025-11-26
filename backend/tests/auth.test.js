const request = require('supertest');
const app = require('../server');
const User = require('../models/user.model');

describe('Auth Controller', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  test('POST /register - should return 400 if passwords do not match', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send({
                username: 'failuser',
                email: 'fail@example.com',
                password: 'password123',
                passwordConfirm: 'differentpassword' // Error
            })
            .expect(400);

        expect(response.body.error).toContain('Las contraseñas no coinciden');
    });

    test('POST /register - should return 400 for missing fields (e.g., email)', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send({
                username: 'failuser2',
                password: 'password123',
                passwordConfirm: 'password123'
            })
            .expect(400); // Mongoose validation error usually results in 400 or 500.

        expect(response.body.error).toBeDefined(); // Verifica el error de validación de Mongoose
    });

    test('POST /login - should return 401 for incorrect password', async () => {
        await User.create({
            username: 'badlogin',
            email: 'badlogin@example.com',
            password: 'correctpassword'
        });

        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'badlogin@example.com',
                password: 'incorrectpassword' // Error
            })
            .expect(401);

        expect(response.body.error).toContain('Email o contraseña incorrectos');
    });

    test('POST /login - should return 404 for non-existent user email', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'nonexistent@example.com', // Error
                password: 'anypassword'
            })
            .expect(404);

        expect(response.body.error).toContain('Email o contraseña incorrectos');
    });

    // TEST ADICIONAL PARA CUBRIR LA LÓGICA DEL MODELO User.js (Línea 70)
    test('POST /register - should return 400 for duplicate email', async () => {
        await User.create({
            username: 'duplicateuser',
            email: 'duplicate@example.com',
            password: 'password123'
        });

        const response = await request(app)
            .post('/api/auth/register')
            .send({
                username: 'newuser',
                email: 'duplicate@example.com', // Duplicado
                password: 'password123',
                passwordConfirm: 'password123'
            })
            .expect(400);

        expect(response.body.error).toContain('El email o nombre de usuario ya está en uso');
    });
});