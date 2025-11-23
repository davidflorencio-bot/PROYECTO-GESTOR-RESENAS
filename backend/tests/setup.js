const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');

let mongoServer;

// Mock user para tests
const mockUser = {
  _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
  username: 'testuser',
  email: 'test@example.com'
};

// Mock token JWT
const mockToken = jwt.sign(
  { id: mockUser._id }, 
  process.env.JWT_SECRET || 'test-secret-key-2024',
  { expiresIn: '7d' }
);

beforeAll(async () => {
  // Crear MongoDB en memoria para tests
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Conectar mongoose a la BD en memoria
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Mock del middleware de autenticación para TODAS las rutas protegidas
  jest.mock('../middleware/auth.middleware', () => ({
    protect: (req, res, next) => {
      req.user = mockUser;
      next();
    }
  }));
}, 30000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
  jest.restoreAllMocks();
});

afterEach(async () => {
  // Limpiar todas las colecciones después de cada test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    try {
      await collections[key].deleteMany();
    } catch (error) {
      // Ignorar errores de colecciones no existentes
    }
  }
});

// Exportar mocks para usar en tests
global.mockUser = mockUser;
global.mockToken = mockToken;