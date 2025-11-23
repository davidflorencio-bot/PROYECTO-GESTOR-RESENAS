const Review = require('../models/review.model');
const Movie = require('../models/movie.model');
const TVShow = require('../models/tvshow.model');

// Obtener todas las reseñas
exports.getAllReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find()
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'username avatar');

    const total = await Review.countDocuments();

    res.json({
      reviews,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalReviews: total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener reseñas por película/serie
exports.getReviewsByMovie = async (req, res) => {
  try {
    const { movieId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy || 'date';

    // Verificar si la película/serie existe
    const movie = await Movie.findById(movieId);
    const tvshow = await TVShow.findById(movieId);
    
    if (!movie && !tvshow) {
      return res.status(404).json({ error: 'Película o serie no encontrada' });
    }

    const reviews = await Review.find({ movieId })
      .sort({ [sortBy]: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'username avatar');

    const total = await Review.countDocuments({ movieId });

    res.json({
      reviews,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalReviews: total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener reseñas de un usuario
exports.getUserReviews = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ userId })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({ userId });

    res.json({
      reviews,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalReviews: total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear reseña
exports.createReview = async (req, res) => {
  try {
    const { movieId, text, rating, itemType } = req.body;
    const userId = req.user.id;
    const username = req.user.username;

    // Validar que la película/serie existe
    let mediaItem;
    if (itemType === 'Movie') {
      mediaItem = await Movie.findById(movieId);
    } else {
      mediaItem = await TVShow.findById(movieId);
    }

    if (!mediaItem) {
      return res.status(404).json({ error: 'Película o serie no encontrada' });
    }

    // Verificar si el usuario ya hizo una reseña para esta película/serie
    const existingReview = await Review.findOne({ movieId, userId });
    if (existingReview) {
      return res.status(400).json({ error: 'Ya has realizado una reseña para esta película/serie' });
    }

    const review = new Review({
      movieId,
      itemType,
      movieTitle: mediaItem.title,
      username,
      userId,
      text,
      rating
    });

    await review.save();
    
    // Populate para devolver datos completos
    await review.populate('userId', 'username avatar');

    res.status(201).json({
      message: 'Reseña creada exitosamente',
      review
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Editar reseña
exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, rating } = req.body;
    const userId = req.user.id;

    const review = await Review.findById(id);
    
    if (!review) {
      return res.status(404).json({ error: 'Reseña no encontrada' });
    }

    // Verificar que el usuario es el propietario de la reseña
    if (review.userId.toString() !== userId) {
      return res.status(403).json({ error: 'No tienes permiso para editar esta reseña' });
    }

    review.text = text || review.text;
    review.rating = rating || review.rating;
    review.isEdited = true;
    review.lastEdited = new Date();

    await review.save();
    await review.populate('userId', 'username avatar');

    res.json({
      message: 'Reseña actualizada exitosamente',
      review
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Eliminar reseña
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const review = await Review.findById(id);
    
    if (!review) {
      return res.status(404).json({ error: 'Reseña no encontrada' });
    }

    // Verificar que el usuario es el propietario de la reseña
    if (review.userId.toString() !== userId) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar esta reseña' });
    }

    await Review.findByIdAndDelete(id);

    res.json({ message: 'Reseña eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Marcar reseña como útil/no útil
exports.rateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body; // 'like' o 'dislike'
    const userId = req.user.id;

    const review = await Review.findById(id);
    
    if (!review) {
      return res.status(404).json({ error: 'Reseña no encontrada' });
    }

    // Verificar que el usuario no es el autor de la reseña
    if (review.userId.toString() === userId) {
      return res.status(400).json({ error: 'No puedes calificar tu propia reseña' });
    }

    // Buscar si el usuario ya calificó esta reseña
    const existingRating = review.helpful.find(item => 
      item.userId.toString() === userId
    );

    if (existingRating) {
      // Si ya calificó con el mismo tipo, quitar la calificación
      if (existingRating.type === type) {
        review.helpful = review.helpful.filter(item => 
          item.userId.toString() !== userId
        );
        if (type === 'like') {
          review.likes -= 1;
        } else {
          review.dislikes -= 1;
        }
      } else {
        // Si cambió el tipo, actualizar
        existingRating.type = type;
        if (type === 'like') {
          review.likes += 1;
          review.dislikes -= 1;
        } else {
          review.likes -= 1;
          review.dislikes += 1;
        }
      }
    } else {
      // Nueva calificación
      review.helpful.push({ userId, type });
      if (type === 'like') {
        review.likes += 1;
      } else {
        review.dislikes += 1;
      }
    }

    await review.save();

    res.json({
      message: 'Calificación guardada exitosamente',
      likes: review.likes,
      dislikes: review.dislikes
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};