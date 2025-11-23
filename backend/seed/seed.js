const mongoose = require('mongoose');
const Movie = require('../models/movie.model');
const TVShow = require('../models/tvshow.model');
require('dotenv').config();

const sampleMovies = [
  {
    title: "Dune: Part Two",
    originalTitle: "Dune: Part Two",
    overview: "Paul Atreides se une a los Fremen mientras busca venganza contra los conspiradores que destruyeron a su familia.",
    genre: ["Ciencia Ficción", "Aventura", "Drama"],
    releaseDate: new Date("2024-03-01"),
    poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300&h=450&fit=crop",
    backdrop: "https://images.unsplash.com/photo-1465101162946-4377e57745c3?w=800&h=450&fit=crop",
    rating: 8.5,
    voteCount: 5421,
    duration: 166,
    platforms: [
      { name: "HBO Max", logo: "/static/hbo.png", available: true },
      { name: "Amazon Prime", logo: "/static/prime.png", available: true }
    ],
    cast: [
      { name: "Timothée Chalamet", character: "Paul Atreides", profile: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face" },
      { name: "Zendaya", character: "Chani", profile: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face" }
    ],
    director: ["Denis Villeneuve"],
    status: "Released",
    originalLanguage: "en",
    popularity: 95.2
  },
  {
    title: "Godzilla x Kong: The New Empire",
    originalTitle: "Godzilla x Kong: The New Empire",
    overview: "Godzilla y Kong se unen para enfrentarse a una colosal amenaza desconocida escondida en nuestro mundo.",
    genre: ["Acción", "Ciencia Ficción", "Aventura"],
    releaseDate: new Date("2024-03-29"),
    poster: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=300&h=450&fit=crop",
    backdrop: "https://images.unsplash.com/photo-1489599809505-fb40ebc14d59?w=800&h=450&fit=crop",
    rating: 7.2,
    voteCount: 3215,
    duration: 115,
    platforms: [
      { name: "HBO Max", logo: "/static/hbo.png", available: true },
      { name: "Netflix", logo: "/static/netflix.png", available: true }
    ],
    cast: [
      { name: "Rebecca Hall", character: "Dr. Ilene Andrews", profile: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face" },
      { name: "Brian Tyree Henry", character: "Bernie Hayes", profile: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" }
    ],
    director: ["Adam Wingard"],
    status: "Released",
    originalLanguage: "en",
    popularity: 88.7
  },
  {
    title: "Kingdom of the Planet of the Apes",
    originalTitle: "Kingdom of the Planet of the Apes",
    overview: "Muchas generaciones después del reinado de César, los simios son la especie dominante.",
    genre: ["Ciencia Ficción", "Aventura", "Acción"],
    releaseDate: new Date("2024-05-10"),
    poster: "https://images.unsplash.com/photo-1589656966895-2f33e7653819?w=300&h=450&fit=crop",
    backdrop: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=450&fit=crop",
    rating: 7.8,
    voteCount: 2156,
    duration: 145,
    platforms: [
      { name: "Disney+", logo: "/static/disney.png", available: true },
      { name: "HBO Max", logo: "/static/hbo.png", available: true }
    ],
    cast: [
      { name: "Owen Teague", character: "Noa", profile: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face" },
      { name: "Freya Allan", character: "Mae", profile: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face" }
    ],
    director: ["Wes Ball"],
    status: "Released",
    originalLanguage: "en",
    popularity: 87.3
  },
  {
    title: "Furiosa: A Mad Max Saga",
    originalTitle: "Furiosa: A Mad Max Saga",
    overview: "La historia de la joven Furiosa antes de encontrarse con Max Rockatansky en Mad Max: Fury Road.",
    genre: ["Acción", "Aventura", "Ciencia Ficción"],
    releaseDate: new Date("2024-05-24"),
    poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300&h=450&fit=crop",
    backdrop: "https://images.unsplash.com/photo-1465101162946-4377e57745c3?w=800&h=450&fit=crop",
    rating: 8.1,
    voteCount: 1890,
    duration: 148,
    platforms: [
      { name: "HBO Max", logo: "/static/hbo.png", available: true },
      { name: "Amazon Prime", logo: "/static/prime.png", available: true }
    ],
    cast: [
      { name: "Anya Taylor-Joy", character: "Furiosa", profile: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face" },
      { name: "Chris Hemsworth", character: "Dementus", profile: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face" }
    ],
    director: ["George Miller"],
    status: "Released",
    originalLanguage: "en",
    popularity: 89.5
  },
  {
    title: "Bad Boys: Ride or Die",
    originalTitle: "Bad Boys: Ride or Die",
    overview: "Los detectives Mike Lowrey y Marcus Burnett investigan la corrupción en la policía de Miami.",
    genre: ["Acción", "Comedia", "Crimen"],
    releaseDate: new Date("2024-06-07"),
    poster: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=300&h=450&fit=crop",
    backdrop: "https://images.unsplash.com/photo-1489599809505-fb40ebc14d59?w=800&h=450&fit=crop",
    rating: 7.4,
    voteCount: 1567,
    duration: 115,
    platforms: [
      { name: "Netflix", logo: "/static/netflix.png", available: true },
      { name: "Amazon Prime", logo: "/static/prime.png", available: true }
    ],
    cast: [
      { name: "Will Smith", character: "Mike Lowrey", profile: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" },
      { name: "Martin Lawrence", character: "Marcus Burnett", profile: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face" }
    ],
    director: ["Adil El Arbi", "Bilall Fallah"],
    status: "Released",
    originalLanguage: "en",
    popularity: 84.2
  },
  {
    title: "Inside Out 2",
    originalTitle: "Inside Out 2",
    overview: "Riley, ahora una adolescente, experimenta nuevas emociones cuando Ansiedad, Envidia, Aburrimiento y Nostalgia llegan.",
    genre: ["Animación", "Comedia", "Aventura"],
    releaseDate: new Date("2024-06-14"),
    poster: "https://images.unsplash.com/photo-1589656966895-2f33e7653819?w=300&h=450&fit=crop",
    backdrop: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=450&fit=crop",
    rating: 8.3,
    voteCount: 2987,
    duration: 96,
    platforms: [
      { name: "Disney+", logo: "/static/disney.png", available: true }
    ],
    cast: [
      { name: "Amy Poehler", character: "Alegría", profile: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face" },
      { name: "Maya Hawke", character: "Ansiedad", profile: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face" }
    ],
    director: ["Kelsey Mann"],
    status: "Released",
    originalLanguage: "en",
    popularity: 91.8
  },
  {
    title: "A Quiet Place: Day One",
    originalTitle: "A Quiet Place: Day One",
    overview: "Los orígenes del primer día de la invasión de criaturas que cazan por el sonido.",
    genre: ["Terror", "Ciencia Ficción", "Drama"],
    releaseDate: new Date("2024-06-28"),
    poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300&h=450&fit=crop",
    backdrop: "https://images.unsplash.com/photo-1465101162946-4377e57745c3?w=800&h=450&fit=crop",
    rating: 7.6,
    voteCount: 1342,
    duration: 100,
    platforms: [
      { name: "Paramount+", logo: "/static/paramount.png", available: true },
      { name: "Amazon Prime", logo: "/static/prime.png", available: true }
    ],
    cast: [
      { name: "Lupita Nyong'o", character: "Sam", profile: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face" },
      { name: "Joseph Quinn", character: "Eric", profile: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face" }
    ],
    director: ["Michael Sarnoski"],
    status: "Released",
    originalLanguage: "en",
    popularity: 86.4
  },
  {
    title: "Deadpool & Wolverine",
    originalTitle: "Deadpool & Wolverine",
    overview: "Deadpool cambia el curso del MCU con Wolverine en una aventura que desafía la realidad.",
    genre: ["Acción", "Comedia", "Ciencia Ficción"],
    releaseDate: new Date("2024-07-26"),
    poster: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=300&h=450&fit=crop",
    backdrop: "https://images.unsplash.com/photo-1489599809505-fb40ebc14d59?w=800&h=450&fit=crop",
    rating: 8.7,
    voteCount: 4231,
    duration: 127,
    platforms: [
      { name: "Disney+", logo: "/static/disney.png", available: true }
    ],
    cast: [
      { name: "Ryan Reynolds", character: "Wade Wilson / Deadpool", profile: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" },
      { name: "Hugh Jackman", character: "Logan / Wolverine", profile: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face" }
    ],
    director: ["Shawn Levy"],
    status: "Released",
    originalLanguage: "en",
    popularity: 96.1
  }
];

const sampleTVShows = [
  {
    title: "The Last of Us: Season 2",
    originalTitle: "The Last of Us: Season 2",
    overview: "La continuación de la adaptación del aclamado videojuego post-apocalíptico.",
    genre: ["Drama", "Aventura", "Horror"],
    firstAirDate: new Date("2025-01-12"),
    lastAirDate: new Date("2025-03-16"),
    poster: "https://images.unsplash.com/photo-1589656966895-2f33e7653819?w=300&h=450&fit=crop",
    backdrop: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=450&fit=crop",
    rating: 9.3,
    voteCount: 0,
    seasons: [
      {
        seasonNumber: 2,
        episodeCount: 8,
        airDate: new Date("2025-01-12"),
        overview: "Segunda temporada basada en The Last of Us Part II"
      }
    ],
    numberOfSeasons: 2,
    numberOfEpisodes: 16,
    platforms: [
      { name: "HBO Max", logo: "/static/hbo.png", available: true }
    ],
    cast: [
      { name: "Pedro Pascal", character: "Joel", profile: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face" },
      { name: "Bella Ramsey", character: "Ellie", profile: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face" }
    ],
    creators: ["Craig Mazin", "Neil Druckmann"],
    status: "In Production",
    originalLanguage: "en",
    popularity: 94.2,
    type: "Scripted"
  },
  {
    title: "House of the Dragon: Season 2",
    originalTitle: "House of the Dragon: Season 2",
    overview: "La Guerra Civil Targaryen se intensifica mientras los Verdes y los Negros luchan por el Trono de Hierro.",
    genre: ["Drama", "Fantasía", "Aventura"],
    firstAirDate: new Date("2024-06-16"),
    lastAirDate: new Date("2024-08-18"),
    poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300&h=450&fit=crop",
    backdrop: "https://images.unsplash.com/photo-1465101162946-4377e57745c3?w=800&h=450&fit=crop",
    rating: 8.7,
    voteCount: 1890,
    seasons: [
      {
        seasonNumber: 2,
        episodeCount: 8,
        airDate: new Date("2024-06-16"),
        overview: "Segunda temporada de la Danza de los Dragones"
      }
    ],
    numberOfSeasons: 2,
    numberOfEpisodes: 16,
    platforms: [
      { name: "HBO Max", logo: "/static/hbo.png", available: true }
    ],
    cast: [
      { name: "Emma D'Arcy", character: "Rhaenyra Targaryen", profile: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face" },
      { name: "Matt Smith", character: "Daemon Targaryen", profile: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" }
    ],
    creators: ["Ryan Condal"],
    status: "Returning Series",
    originalLanguage: "en",
    popularity: 90.8,
    type: "Scripted"
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB para seed');

    // Limpiar colecciones existentes
    await Movie.deleteMany({});
    await TVShow.deleteMany({});
    console.log('✅ Colecciones limpiadas');

    // Insertar datos de muestra
    await Movie.insertMany(sampleMovies);
    await TVShow.insertMany(sampleTVShows);
    console.log('✅ Datos de muestra insertados');

    console.log(`🎉 Base de datos poblada con ${sampleMovies.length} películas y ${sampleTVShows.length} series!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error poblando la base de datos:', error);
    process.exit(1);
  }
};

seedDatabase();