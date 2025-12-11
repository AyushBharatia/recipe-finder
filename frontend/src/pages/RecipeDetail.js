import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import recipeService from '../services/recipeService';
import favoriteService from '../services/favoriteService';
import Message from '../components/common/Message';
import RoleGuard from '../components/common/RoleGuard';
import '../components/recipes/Recipes.css';

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

const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

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
        <ArrowLeftIcon />
        <span>Back to Recipes</span>
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
                <ClockIcon />
                <span>{recipe.cookTime} minutes</span>
              </div>
              <div className="meta-item">
                <UsersIcon />
                <span>{recipe.servings} servings</span>
              </div>
            </div>

            <div className="recipe-actions">
              <button
                className={`action-icon-btn favorite-icon-btn ${isFavorite ? 'favorited' : ''}`}
                onClick={handleFavoriteToggle}
                title={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
              >
                <HeartIcon filled={isFavorite} />
              </button>

              <RoleGuard
                allowedRoles={['admin', 'user']}
                requireOwnership={true}
                ownerId={recipe.createdBy}
              >
                <Link to={`/recipes/${id}/edit`} className="action-icon-btn edit-icon-btn" title="Edit Recipe">
                  <EditIcon />
                </Link>
                <button
                  className="action-icon-btn delete-icon-btn"
                  onClick={() => setShowDeleteConfirm(true)}
                  title="Delete Recipe"
                >
                  <TrashIcon />
                </button>
              </RoleGuard>
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
