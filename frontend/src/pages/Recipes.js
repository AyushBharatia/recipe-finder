import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import recipeService from '../services/recipeService';
import favoriteService from '../services/favoriteService';
import RecipeCard from '../components/recipes/RecipeCard';
import SearchFilter from '../components/recipes/SearchFilter';
import Message from '../components/common/Message';
import '../components/recipes/Recipes.css';

const Recipes = () => {
  const { user, isAuthenticated } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 9,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    search: '',
    cuisine: '',
    maxTime: '',
    sortBy: '-createdAt',
  });

  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy: filters.sortBy,
      };

      if (filters.search) params.search = filters.search;
      if (filters.cuisine) params.cuisine = filters.cuisine;
      if (filters.maxTime) params.maxTime = filters.maxTime;

      const data = await recipeService.getAll(params);
      setRecipes(data.results || []);
      setPagination((prev) => ({
        ...prev,
        total: data.total,
        totalPages: data.totalPages,
      }));
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to fetch recipes. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  const fetchFavorites = useCallback(async () => {
    if (!isAuthenticated || !user) return;
    try {
      const data = await favoriteService.getFavorites(user._id);
      setFavorites(data.map((fav) => fav.recipeId?._id || fav.recipeId));
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFavoriteToggle = async (recipeId) => {
    if (!isAuthenticated) return;

    try {
      const isFavorite = favorites.includes(recipeId);

      if (isFavorite) {
        await favoriteService.removeFavorite(user._id, recipeId);
        setFavorites((prev) => prev.filter((id) => id !== recipeId));
        setMessage({ type: 'success', text: 'Removed from favorites!' });
      } else {
        await favoriteService.addFavorite(user._id, recipeId);
        setFavorites((prev) => [...prev, recipeId]);
        setMessage({ type: 'success', text: 'Added to favorites!' });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to update favorites. Please try again.',
      });
    }
  };

  return (
    <div className="recipes-page">
      <div className="recipes-header">
        <h1>Recipes</h1>
        {isAuthenticated && (
          <Link to="/recipes/new" className="add-recipe-btn">
            + Add Recipe
          </Link>
        )}
      </div>

      {message.text && (
        <Message
          type={message.type}
          message={message.text}
          onClose={() => setMessage({ type: '', text: '' })}
        />
      )}

      <SearchFilter filters={filters} onFilterChange={handleFilterChange} />

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading recipes...</p>
        </div>
      ) : recipes.length === 0 ? (
        <div className="no-recipes">
          <p>No recipes found.</p>
          {filters.search || filters.cuisine || filters.maxTime ? (
            <p>Try adjusting your filters.</p>
          ) : (
            <p>Be the first to add a recipe!</p>
          )}
        </div>
      ) : (
        <>
          <div className="recipes-grid">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe._id}
                recipe={recipe}
                isFavorite={favorites.includes(recipe._id)}
                onFavoriteToggle={handleFavoriteToggle}
              />
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Previous
              </button>

              <div className="pagination-info">
                Page {pagination.page} of {pagination.totalPages}
              </div>

              <button
                className="pagination-btn"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Recipes;
