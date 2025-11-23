// Middleware de autenticación reutilizable
const { protect } = require('../controllers/auth.controller');

module.exports = { protect };
