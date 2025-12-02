import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import favoriteService from '../services/favoriteService';
import RecipeCard from '../components/recipes/RecipeCard';
import Message from '../components/common/Message';
import '../components/recipes/Recipes.css';

const Favorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchFavorites = useCallback(async () => {
    if (!user) return;

    try {
      const data = await favoriteService.getFavorites(user._id);
      setFavorites(data);
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to fetch favorites. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleRemoveFavorite = async (recipeId) => {
    try {
      await favoriteService.removeFavorite(user._id, recipeId);
      setFavorites((prev) =>
        prev.filter((fav) => (fav.recipeId?._id || fav.recipeId) !== recipeId)
      );
      setMessage({ type: 'success', text: 'Removed from favorites!' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to remove from favorites. Please try again.',
      });
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading favorites...</p>
      </div>
    );
  }

  return (
    <div className="favorites-page">
      <div className="favorites-header">
        <h1>My Favorite Recipes</h1>
      </div>

      {message.text && (
        <Message
          type={message.type}
          message={message.text}
          onClose={() => setMessage({ type: '', text: '' })}
        />
      )}

      {favorites.length === 0 ? (
        <div className="no-favorites">
          <p>You haven't added any recipes to your favorites yet.</p>
          <Link to="/recipes" className="browse-btn">
            Browse Recipes
          </Link>
        </div>
      ) : (
        <div className="recipes-grid">
          {favorites.map((favorite) => {
            const recipe = favorite.recipeId;
            if (!recipe || typeof recipe === 'string') return null;

            return (
              <RecipeCard
                key={favorite._id}
                recipe={recipe}
                isFavorite={true}
                onFavoriteToggle={handleRemoveFavorite}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Favorites;
