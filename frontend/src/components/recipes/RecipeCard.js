import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

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
            {isFavorite ? '♥' : '♡'}
          </button>
        )}
      </div>
      <div className="recipe-card-content">
        <h3 className="recipe-card-title">{recipe.title}</h3>
        <span className="recipe-card-cuisine">{recipe.cuisine}</span>
        <div className="recipe-card-meta">
          <span className="recipe-card-time">⏱ {recipe.cookTime} min</span>
          <span className="recipe-card-servings">👥 {recipe.servings} servings</span>
        </div>
        <Link to={`/recipes/${recipe._id}`} className="recipe-card-link">
          View Recipe
        </Link>
      </div>
    </div>
  );
};

export default RecipeCard;
