import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-page">
      <div className="hero-section">
        <h1>Welcome to Recipe Finder</h1>
        <p>Discover, create, and save your favorite recipes</p>

        <div className="hero-buttons">
          <Link to="/recipes" className="hero-btn primary-btn">
            Browse Recipes
          </Link>
          {!isAuthenticated && (
            <Link to="/register" className="hero-btn secondary-btn">
              Get Started
            </Link>
          )}
        </div>
      </div>

      <div className="features-section">
        <div className="feature-card">
          <span className="feature-icon">🔍</span>
          <h3>Search & Filter</h3>
          <p>Find recipes by name, cuisine, cook time, or ingredients</p>
        </div>

        <div className="feature-card">
          <span className="feature-icon">📝</span>
          <h3>Create Recipes</h3>
          <p>Share your own recipes with the community</p>
        </div>

        <div className="feature-card">
          <span className="feature-icon">❤️</span>
          <h3>Save Favorites</h3>
          <p>Build your personal collection of favorite recipes</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
