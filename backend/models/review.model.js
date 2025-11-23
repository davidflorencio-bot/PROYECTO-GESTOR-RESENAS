const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  movieId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'itemType',
    required: true
  },
  itemType: {
    type: String,
    enum: ['Movie', 'TVShow'],
    required: true
  },
  movieTitle: {
    type: String,
    required: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  date: {
    type: Date,
    default: Date.now
  },
  likes: {
    type: Number,
    default: 0
  },
  dislikes: {
    type: Number,
    default: 0
  },
  helpful: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    type: {
      type: String,
      enum: ['like', 'dislike']
    }
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  lastEdited: Date
}, {
  timestamps: true
});

// Índices compuestos para mejor performance
reviewSchema.index({ movieId: 1, date: -1 });
reviewSchema.index({ userId: 1, date: -1 });
reviewSchema.index({ rating: -1 });

// Middleware para actualizar estadísticas de la película/serie
reviewSchema.post('save', async function() {
  const Movie = mongoose.model('Movie');
  const TVShow = mongoose.model('TVShow');
  
  try {
    let model;
    if (this.itemType === 'Movie') {
      model = Movie;
    } else {
      model = TVShow;
    }
    
    const stats = await this.constructor.aggregate([
      { $match: { movieId: this.movieId, itemType: this.itemType } },
      {
        $group: {
          _id: '$movieId',
          averageRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 }
        }
      }
    ]);
    
    if (stats.length > 0) {
      await model.findByIdAndUpdate(this.movieId, {
        rating: parseFloat(stats[0].averageRating.toFixed(1)),
        voteCount: stats[0].reviewCount
      });
    }
  } catch (error) {
    console.error('Error actualizando estadísticas:', error);
  }
});

reviewSchema.post('remove', async function() {
  const Movie = mongoose.model('Movie');
  const TVShow = mongoose.model('TVShow');
  
  try {
    let model;
    if (this.itemType === 'Movie') {
      model = Movie;
    } else {
      model = TVShow;
    }
    
    const stats = await this.constructor.aggregate([
      { $match: { movieId: this.movieId, itemType: this.itemType } },
      {
        $group: {
          _id: '$movieId',
          averageRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 }
        }
      }
    ]);
    
    if (stats.length > 0) {
      await model.findByIdAndUpdate(this.movieId, {
        rating: parseFloat(stats[0].averageRating.toFixed(1)),
        voteCount: stats[0].reviewCount
      });
    } else {
      await model.findByIdAndUpdate(this.movieId, {
        rating: 0,
        voteCount: 0
      });
    }
  } catch (error) {
    console.error('Error actualizando estadísticas después de eliminar:', error);
  }
});

module.exports = mongoose.model('Review', reviewSchema);