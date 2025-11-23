const TVShow = require('../models/tvshow.model');

// Obtener todas las series con filtros
exports.getAllTVShows = async (req, res) => {
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
      filter.firstAirDate = { $gte: startDate, $lt: endDate };
    }

    // Ordenamiento
    let sort = {};
    switch (req.query.sort) {
      case 'rating':
        sort = { rating: -1 };
        break;
      case 'release_date':
        sort = { firstAirDate: -1 };
        break;
      case 'title':
        sort = { title: 1 };
        break;
      case 'popularity':
        sort = { popularity: -1 };
        break;
      default:
        sort = { firstAirDate: -1 };
    }

    const tvshows = await TVShow.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await TVShow.countDocuments(filter);

    res.json({
      tvshows,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalTVShows: total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener series aleatorias (para carrusel hero)
exports.getRandomTVShows = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const tvshows = await TVShow.aggregate([
      { $match: { backdrop: { $exists: true, $ne: null } } },
      { $sample: { size: limit } }
    ]);

    res.json(tvshows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener serie por ID
exports.getTVShowById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const tvshow = await TVShow.findById(id);
    
    if (!tvshow) {
      return res.status(404).json({ error: 'Serie no encontrada' });
    }

    res.json(tvshow);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener series por género
exports.getTVShowsByGenre = async (req, res) => {
  try {
    const { genre } = req.params;
    const limit = parseInt(req.query.limit) || 20;

    const tvshows = await TVShow.find({ genre: { $in: [genre] } })
      .sort({ rating: -1 })
      .limit(limit);

    res.json(tvshows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear serie (admin)
exports.createTVShow = async (req, res) => {
  try {
    const tvshow = new TVShow(req.body);
    await tvshow.save();
    
    res.status(201).json({
      message: 'Serie creada exitosamente',
      tvshow
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Actualizar serie (admin)
exports.updateTVShow = async (req, res) => {
  try {
    const { id } = req.params;
    
    const tvshow = await TVShow.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!tvshow) {
      return res.status(404).json({ error: 'Serie no encontrada' });
    }

    res.json({
      message: 'Serie actualizada exitosamente',
      tvshow
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Obtener géneros únicos
exports.getGenres = async (req, res) => {
  try {
    const genres = await TVShow.distinct('genre');
    res.json(genres.sort());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};