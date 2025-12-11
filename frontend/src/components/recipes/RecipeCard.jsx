import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Inline SVG Icons
const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const HeartIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const RecipeCard = ({ recipe, onFavoriteToggle, isFavorite }) => {
  const { isAuthenticated } = useAuth();

  const placeholderImage = 'https://via.placeholder.com/300x200?text=No+Image';

  return (
    <div className="recipe-card">
      <div className="recipe-card-image">
        <img
          src={recipe.imageUrl || placeholderImage}
          alt={recipe.title}
          onError={(e) => {
            e.target.src = placeholderImage;
          }}
        />
        {isAuthenticated && (
          <button
            className={`favorite-btn ${isFavorite ? 'favorited' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              onFavoriteToggle(recipe._id);
            }}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <HeartIcon filled={isFavorite} />
          </button>
        )}
      </div>
      <div className="recipe-card-content">
        <h3 className="recipe-card-title">{recipe.title}</h3>
        <span className="recipe-card-cuisine">{recipe.cuisine}</span>
        <div className="recipe-card-meta">
          <span className="recipe-card-time">
            <ClockIcon />
            {recipe.cookTime} min
          </span>
          <span className="recipe-card-servings">
            <UsersIcon />
            {recipe.servings} servings
          </span>
        </div>
        <Link to={`/recipes/${recipe._id}`} className="recipe-card-link">
          View Recipe
        </Link>
      </div>
    </div>
  );
};

export default RecipeCard;
