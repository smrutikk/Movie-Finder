import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const API_KEY = 'd81ac4c';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [movies, setMovies] = useState([]);
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
    setFavorites(savedFavorites);
    const savedTheme = localStorage.getItem('theme');
    setDarkMode(savedTheme === 'dark');
    fetchRandomMovies();
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.body.setAttribute('data-theme', 'dark');
    } else {
      document.body.setAttribute('data-theme', 'light');
    }
  }, [darkMode]);

  const fetchRandomMovies = async () => {
    try {
      const response = await fetch(
        `https://www.omdbapi.com/?apikey=${API_KEY}&s=movie&type=movie&page=1`
      );
      const data = await response.json();
      if (data.Search) {
        const shuffled = data.Search.sort(() => 0.5 - Math.random());
        setFeaturedMovies(shuffled.slice(0, 8));
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const searchMovies = async () => {
    if (!searchTerm) return;
    try {
      const response = await fetch(
        `https://www.omdbapi.com/?apikey=${API_KEY}&s=${encodeURIComponent(searchTerm)}`
      );
      const data = await response.json();
      setMovies(data.Search || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const toggleTheme = () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  const toggleFavorite = (movie) => {
    const isFavorite = favorites.some(fav => fav.imdbID === movie.imdbID);
    let newFavorites;
    
    if (isFavorite) {
      newFavorites = favorites.filter(fav => fav.imdbID !== movie.imdbID);
    } else {
      newFavorites = [...favorites, {
        imdbID: movie.imdbID,
        Title: movie.Title,
        Year: movie.Year,
        Poster: movie.Poster
      }];
    }
    
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  const showDetails = async (imdbID) => {
    try {
      const response = await fetch(
        `https://www.omdbapi.com/?apikey=${API_KEY}&i=${imdbID}`
      );
      const movie = await response.json();
      setSelectedMovie(movie);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const MovieCard = ({ movie }) => {
    const isFavorite = favorites.some(fav => fav.imdbID === movie.imdbID);
    
    return (
      <div className="col">
        <div className="card h-100 movie-card">
          <img 
            src={movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster'}
            className="card-img-top poster" 
            alt={movie.Title}
          />
          <div className="card-body">
            <h5 className="card-title">{movie.Title}</h5>
            <p className="card-text">{movie.Year}</p>
            <button 
              className={`btn ${isFavorite ? 'btn-danger' : 'btn-outline-danger'}`}
              onClick={() => toggleFavorite(movie)}
            >
              {isFavorite ? 'Remove Favorite' : 'Add Favorite'}
            </button>
            <button 
              className="btn btn-primary ms-2"
              onClick={() => showDetails(movie.imdbID)}
            >
              Details
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div data-theme={darkMode ? 'dark' : 'light'}>
      <nav className="navbar bg-body-tertiary">
        <div className="container">
          <h1 className="navbar-brand">Movie Finder</h1>
          <button className="btn btn-outline-secondary" onClick={toggleTheme}>
            🌓
          </button>
        </div>
      </nav>

      <div className="container my-4">
        <div className="input-group mb-4">
          <input
            type="text"
            className="form-control"
            placeholder="Search for movies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchMovies()}
          />
          <button className="btn btn-primary" onClick={searchMovies}>
            Search
          </button>
        </div>

        <h2 className="mb-3">{movies.length ? `Search Results for "${searchTerm}"` : 'Featured Movies'}</h2>
        <div className="row row-cols-1 row-cols-md-3 row-cols-lg-4 g-4">
          {(movies.length ? movies : featuredMovies).map((movie) => (
            <MovieCard key={movie.imdbID} movie={movie} />
          ))}
        </div>

        <h2 className="my-4">Favorites</h2>
        <div className="row row-cols-1 row-cols-md-3 row-cols-lg-4 g-4">
          {favorites.map((movie) => (
            <MovieCard key={movie.imdbID} movie={movie} />
          ))}
        </div>
      </div>

      <Modal show={!!selectedMovie} onHide={() => setSelectedMovie(null)} centered size="lg">
        {selectedMovie && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>{selectedMovie.Title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="row">
                <div className="col-md-4">
                  <img
                    src={selectedMovie.Poster !== 'N/A' ? selectedMovie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster'}
                    className="img-fluid rounded"
                    alt="Poster"
                  />
                </div>
                <div className="col-md-8">
                  <p><strong>Year:</strong> {selectedMovie.Year}</p>
                  <p><strong>Rating:</strong> {selectedMovie.imdbRating}</p>
                  <p><strong>Runtime:</strong> {selectedMovie.Runtime}</p>
                  <p><strong>Genre:</strong> {selectedMovie.Genre}</p>
                  <p><strong>Director:</strong> {selectedMovie.Director}</p>
                  <p><strong>Cast:</strong> {selectedMovie.Actors}</p>
                  <p>{selectedMovie.Plot}</p>
                </div>
              </div>
            </Modal.Body>
          </>
        )}
      </Modal>

      <style>{`
        :root {
          --bg-color: linear-gradient(135deg,rgb(194, 161, 255) ,rgb(140, 184, 255) );
          --text-color: #000000;
        }

        [data-theme="dark"] {
          --bg-color: #1a1a1a;
          --text-color: #ffffff;
        }

        body {
          background: var(--bg-color);
          color: var(--text-color);
          transition: background-color 0.3s, color 0.3s;
          min-height: 100vh;
        }

        .movie-card {
          transition: transform 0.2s;
        }

        .movie-card:hover {
          transform: translateY(-5px);
        }

        .poster {
          height: 400px;
          object-fit: cover;
        }
      `}</style>
    </div>
  );
}

export default App;