import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

// Inline SVG Icons
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero__overlay">
          <div className="hero__content">
            <h1 className="hero__title">Discover Delicious Recipes</h1>
            <p className="hero__subtitle">
              Find, create, and share your favorite dishes with our community
            </p>
            <div className="hero__buttons">
              <Link to="/recipes" className="hero__btn hero__btn--primary">
                Browse Recipes
              </Link>
              {!isAuthenticated && (
                <Link to="/register" className="hero__btn hero__btn--secondary">
                  Get Started
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="features__container">
          <Link to="/recipes" className="feature">
            <div className="feature__icon">
              <SearchIcon />
            </div>
            <h3 className="feature__title">Search & Filter</h3>
            <p className="feature__text">
              Find recipes by name, cuisine, cook time, or ingredients
            </p>
          </Link>

          <Link to="/recipes/new" className="feature">
            <div className="feature__icon">
              <EditIcon />
            </div>
            <h3 className="feature__title">Create Recipes</h3>
            <p className="feature__text">
              Share your own recipes with the community
            </p>
          </Link>

          <Link to="/favorites" className="feature">
            <div className="feature__icon">
              <HeartIcon />
            </div>
            <h3 className="feature__title">Save Favorites</h3>
            <p className="feature__text">
              Build your personal collection of favorite recipes
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
