const mongoose = require('mongoose');

const seasonSchema = new mongoose.Schema({
  seasonNumber: {
    type: Number,
    required: true
  },
  episodeCount: {
    type: Number,
    required: true
  },
  airDate: Date,
  overview: String,
  poster: String
});

const tvShowSchema = new mongoose.Schema({
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
  firstAirDate: {
    type: Date,
    required: true
  },
  lastAirDate: Date,
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
  seasons: [seasonSchema],
  numberOfSeasons: {
    type: Number,
    default: 1
  },
  numberOfEpisodes: {
    type: Number,
    default: 1
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
  creators: [String],
  status: {
    type: String,
    enum: ['Returning Series', 'Ended', 'Cancelled', 'In Production'],
    default: 'Returning Series'
  },
  originalLanguage: String,
  popularity: {
    type: Number,
    default: 0
  },
  imdbId: String,
  tmdbId: String,
  networks: [String],
  type: {
    type: String,
    enum: ['Scripted', 'Reality', 'Documentary', 'Animation'],
    default: 'Scripted'
  }
}, {
  timestamps: true
});

// Índices para búsqueda eficiente
tvShowSchema.index({ title: 'text', overview: 'text' });
tvShowSchema.index({ genre: 1 });
tvShowSchema.index({ firstAirDate: -1 });
tvShowSchema.index({ rating: -1 });

module.exports = mongoose.model('TVShow', tvShowSchema);