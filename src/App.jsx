import React from "react";
import Search from "./components/Search";
import { useDebounce } from "react-use";
import { useEffect, useState } from "react";
import Spinner from "./components/Spinner";
import MovieCard from "./components/MovieCard";
import { updateSearchCount, getTrendingMovies } from "./appwrite.js";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

const App = () => {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [searchTerm, setSearchTerm] = React.useState("");

  const [movieList, setMovieList] = React.useState([]);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  
  const [trendingMovies, setTrendingMovies] = React.useState([]);

  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);

  const fetchMovies = async (query = '') => {
    setLoading(true);
    setErrorMessage("");
    try {
      const endpoint = query ? 
      `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
      : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
      const response = await fetch(endpoint, API_OPTIONS);


      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      if(data.Response === "false") {
        setErrorMessage(data.Error || "Failed to fetch movies. Please try again later.");
        setMovieList([]);
        return;
      }
      console.log(movieList)

      setMovieList(data.results || []); 
      if(query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
        // console.log(data.results[0]);
      }

    } catch (error) {
      console.error("Error fetching movies:", error);
      setErrorMessage("Failed to fetch movies. Please try again later.");
    }  finally {
        setLoading(false);
      }
  };

  const fetchTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();
      setTrendingMovies(movies);
    }catch(error) {
      console.log("Error fetching trending movies:", error);
    }
  }

  useEffect(() => {
    fetchMovies(searchTerm);

  }, [debouncedSearchTerm]);
  useEffect(() => {
    fetchTrendingMovies();
  }, []);

  return (
    <main>
      <div className="pattern" />
      <div className="wrapper">
        <header>
        <img src="./hero.png" alt="Hero Banner" />
          <h1>nmn<span className="text-gradient">फ़िल्में</span></h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        { trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trending Movies</h2>
            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.searchTerm} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="all-movies">
          <h2 >All Movies</h2>
          { loading ? (
            <Spinner />
          ): errorMessage ? (
            <p className="text-red-600">{errorMessage}</p>
          ): (
            <ul>
              {movieList.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
};

export default App;
