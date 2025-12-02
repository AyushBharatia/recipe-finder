import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import recipeService from '../services/recipeService';
import favoriteService from '../services/favoriteService';
import Message from '../components/common/Message';
import '../components/recipes/Recipes.css';

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const placeholderImage = 'https://via.placeholder.com/600x400?text=No+Image';

  const fetchRecipe = useCallback(async () => {
    try {
      const data = await recipeService.getById(id);
      setRecipe(data);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Recipe not found',
      });
    } finally {
      setLoading(false);
    }
  }, [id]);

  const checkFavorite = useCallback(async () => {
    if (!isAuthenticated || !user) return;
    try {
      const favorites = await favoriteService.getFavorites(user._id);
      const isFav = favorites.some(
        (fav) => (fav.recipeId?._id || fav.recipeId) === id
      );
      setIsFavorite(isFav);
    } catch (error) {
      console.error('Failed to check favorite status:', error);
    }
  }, [isAuthenticated, user, id]);

  useEffect(() => {
    fetchRecipe();
  }, [fetchRecipe]);

  useEffect(() => {
    checkFavorite();
  }, [checkFavorite]);

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      if (isFavorite) {
        await favoriteService.removeFavorite(user._id, id);
        setIsFavorite(false);
        setMessage({ type: 'success', text: 'Removed from favorites!' });
      } else {
        await favoriteService.addFavorite(user._id, id);
        setIsFavorite(true);
        setMessage({ type: 'success', text: 'Added to favorites!' });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to update favorites. Please try again.',
      });
    }
  };

  const handleDelete = async () => {
    try {
      await recipeService.delete(id);
      setMessage({ type: 'success', text: 'Recipe deleted successfully!' });
      setTimeout(() => {
        navigate('/recipes');
      }, 1500);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to delete recipe',
      });
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading recipe...</p>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="recipe-detail-page">
        <Message
          type="error"
          message="Recipe not found"
          onClose={() => navigate('/recipes')}
        />
        <Link to="/recipes" className="back-link">
          ← Back to Recipes
        </Link>
      </div>
    );
  }

  return (
    <div className="recipe-detail-page">
      {message.text && (
        <Message
          type={message.type}
          message={message.text}
          onClose={() => setMessage({ type: '', text: '' })}
        />
      )}

      <Link to="/recipes" className="back-link">
        ← Back to Recipes
      </Link>

      <div className="recipe-detail">
        <div className="recipe-detail-header">
          <div className="recipe-detail-image">
            <img
              src={recipe.imageUrl || placeholderImage}
              alt={recipe.title}
              onError={(e) => {
                e.target.src = placeholderImage;
              }}
            />
          </div>

          <div className="recipe-detail-info">
            <h1>{recipe.title}</h1>
            <span className="cuisine-badge">{recipe.cuisine}</span>

            <div className="recipe-meta">
              <div className="meta-item">
                <span className="meta-icon">⏱</span>
                <span>{recipe.cookTime} minutes</span>
              </div>
              <div className="meta-item">
                <span className="meta-icon">👥</span>
                <span>{recipe.servings} servings</span>
              </div>
            </div>

            <div className="recipe-actions">
              <button
                className={`favorite-action-btn ${isFavorite ? 'favorited' : ''}`}
                onClick={handleFavoriteToggle}
              >
                {isFavorite ? '♥ Remove from Favorites' : '♡ Add to Favorites'}
              </button>

              {isAuthenticated && (
                <>
                  <Link to={`/recipes/${id}/edit`} className="edit-btn">
                    Edit Recipe
                  </Link>
                  <button
                    className="delete-btn"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    Delete Recipe
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="recipe-detail-content">
          <div className="recipe-section">
            <h2>Ingredients</h2>
            <ul className="ingredients-list-detail">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index}>{ingredient}</li>
              ))}
            </ul>
          </div>

          {recipe.instructions && (
            <div className="recipe-section">
              <h2>Instructions</h2>
              <div className="instructions-text">
                {recipe.instructions.split('\n').map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
            </div>
          )}

          {recipe.nutrition && Object.keys(recipe.nutrition).length > 0 && (
            <div className="recipe-section">
              <h2>Nutrition Information</h2>
              <div className="nutrition-grid">
                {recipe.nutrition.calories !== undefined && (
                  <div className="nutrition-item">
                    <span className="nutrition-value">{recipe.nutrition.calories}</span>
                    <span className="nutrition-label">Calories</span>
                  </div>
                )}
                {recipe.nutrition.protein !== undefined && (
                  <div className="nutrition-item">
                    <span className="nutrition-value">{recipe.nutrition.protein}g</span>
                    <span className="nutrition-label">Protein</span>
                  </div>
                )}
                {recipe.nutrition.carbs !== undefined && (
                  <div className="nutrition-item">
                    <span className="nutrition-value">{recipe.nutrition.carbs}g</span>
                    <span className="nutrition-label">Carbs</span>
                  </div>
                )}
                {recipe.nutrition.fat !== undefined && (
                  <div className="nutrition-item">
                    <span className="nutrition-value">{recipe.nutrition.fat}g</span>
                    <span className="nutrition-label">Fat</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Delete Recipe?</h3>
            <p>Are you sure you want to delete "{recipe.title}"? This action cannot be undone.</p>
            <div className="modal-actions">
              <button
                className="modal-btn cancel-btn"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button className="modal-btn confirm-delete-btn" onClick={handleDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeDetail;
