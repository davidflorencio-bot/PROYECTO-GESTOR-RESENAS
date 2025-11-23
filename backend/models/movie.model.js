const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  originalTitle: {
    type: String,
    trim: true
  },
  overview: {
    type: String,
    required: true
  },
  genre: [{
    type: String,
    required: true
  }],
  releaseDate: {
    type: Date,
    required: true
  },
  poster: {
    type: String,
    required: true
  },
  backdrop: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  voteCount: {
    type: Number,
    default: 0
  },
  duration: {
    type: Number, // en minutos
    required: true
  },
  platforms: [{
    name: String,
    logo: String,
    available: {
      type: Boolean,
      default: false
    }
  }],
  cast: [{
    name: String,
    character: String,
    profile: String
  }],
  director: [String],
  budget: Number,
  revenue: Number,
  status: {
    type: String,
    enum: ['Released', 'In Production', 'Post Production', 'Cancelled'],
    default: 'Released'
  },
  originalLanguage: String,
  popularity: {
    type: Number,
    default: 0
  },
  imdbId: String,
  tmdbId: String
}, {
  timestamps: true
});

// Índices para búsqueda eficiente
movieSchema.index({ title: 'text', overview: 'text' });
movieSchema.index({ genre: 1 });
movieSchema.index({ releaseDate: -1 });
movieSchema.index({ rating: -1 });

module.exports = mongoose.model('Movie', movieSchema);