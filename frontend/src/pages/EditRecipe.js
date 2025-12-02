import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import recipeService from '../services/recipeService';
import RecipeForm from '../components/recipes/RecipeForm';
import Message from '../components/common/Message';
import '../components/recipes/Recipes.css';

const EditRecipe = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchRecipe = async () => {
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
    };

    fetchRecipe();
  }, [id]);

  const handleSubmit = async (recipeData) => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await recipeService.update(id, recipeData);
      setMessage({ type: 'success', text: 'Recipe updated successfully!' });
      setTimeout(() => {
        navigate(`/recipes/${id}`);
      }, 1500);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.msg ||
        'Failed to update recipe. Please try again.';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setSaving(false);
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
      <div className="recipe-form-page">
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
    <div className="recipe-form-page">
      <Link to={`/recipes/${id}`} className="back-link">
        ← Back to Recipe
      </Link>

      <h1>Edit Recipe</h1>

      {message.text && (
        <Message
          type={message.type}
          message={message.text}
          onClose={() => setMessage({ type: '', text: '' })}
        />
      )}

      <RecipeForm
        initialData={recipe}
        onSubmit={handleSubmit}
        loading={saving}
        submitLabel="Update Recipe"
      />
    </div>
  );
};

export default EditRecipe;
