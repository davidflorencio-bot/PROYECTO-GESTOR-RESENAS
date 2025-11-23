const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    // NO conectar en entorno de test - Jest maneja la conexión
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    // En test, no salir del proceso
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;