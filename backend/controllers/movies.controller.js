const Movie = require('../models/movie.model');

// Obtener todas las películas con filtros
exports.getAllMovies = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Construir filtros
    let filter = {};
    
    // Filtro por género
    if (req.query.genre) {
      filter.genre = { $in: [req.query.genre] };
    }
    
    // Filtro por plataforma
    if (req.query.platform) {
      filter['platforms.name'] = req.query.platform;
    }
    
    // Búsqueda por texto
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }
    
    // Filtro por año
    if (req.query.year) {
      const year = parseInt(req.query.year);
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year + 1, 0, 1);
      filter.releaseDate = { $gte: startDate, $lt: endDate };
    }

    // Ordenamiento
    let sort = {};
    switch (req.query.sort) {
      case 'rating':
        sort = { rating: -1 };
        break;
      case 'release_date':
        sort = { releaseDate: -1 };
        break;
      case 'title':
        sort = { title: 1 };
        break;
      case 'popularity':
        sort = { popularity: -1 };
        break;
      default:
        sort = { releaseDate: -1 };
    }

    const movies = await Movie.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Movie.countDocuments(filter);

    res.json({
      movies,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalMovies: total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener películas aleatorias (para carrusel hero)
exports.getRandomMovies = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const movies = await Movie.aggregate([
      { $match: { backdrop: { $exists: true, $ne: null } } },
      { $sample: { size: limit } }
    ]);

    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener película por ID
exports.getMovieById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const movie = await Movie.findById(id);
    
    if (!movie) {
      return res.status(404).json({ error: 'Película no encontrada' });
    }

    res.json(movie);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener películas por género
exports.getMoviesByGenre = async (req, res) => {
  try {
    const { genre } = req.params;
    const limit = parseInt(req.query.limit) || 20;

    const movies = await Movie.find({ genre: { $in: [genre] } })
      .sort({ rating: -1 })
      .limit(limit);

    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear película (admin)
exports.createMovie = async (req, res) => {
  try {
    const movie = new Movie(req.body);
    await movie.save();
    
    res.status(201).json({
      message: 'Película creada exitosamente',
      movie
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Actualizar película (admin)
exports.updateMovie = async (req, res) => {
  try {
    const { id } = req.params;
    
    const movie = await Movie.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!movie) {
      return res.status(404).json({ error: 'Película no encontrada' });
    }

    res.json({
      message: 'Película actualizada exitosamente',
      movie
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Obtener géneros únicos
exports.getGenres = async (req, res) => {
  try {
    const genres = await Movie.distinct('genre');
    res.json(genres.sort());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};