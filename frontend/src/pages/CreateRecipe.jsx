import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import recipeService from '../services/recipeService';
import RecipeForm from '../components/recipes/RecipeForm';
import Message from '../components/common/Message';
import '../components/recipes/Recipes.css';

// Inline SVG Icon
const ArrowLeftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const CreateRecipe = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (recipeData) => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const newRecipe = await recipeService.create(recipeData);
      setMessage({ type: 'success', text: 'Recipe created successfully!' });
      setTimeout(() => {
        navigate(`/recipes/${newRecipe._id}`);
      }, 1500);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.msg ||
        'Failed to create recipe. Please try again.';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recipe-form-page">
      <div className="recipe-form-header">
        <Link to="/recipes" className="back-link">
          <ArrowLeftIcon />
          <span>Back to Recipes</span>
        </Link>
        <h1>Create New Recipe</h1>
        <p className="recipe-form-subtitle">Fill in the details below to add your recipe to the collection.</p>
      </div>

      {message.text && (
        <Message
          type={message.type}
          message={message.text}
          onClose={() => setMessage({ type: '', text: '' })}
        />
      )}

      <RecipeForm
        onSubmit={handleSubmit}
        loading={loading}
        submitLabel="Create Recipe"
      />
    </div>
  );
};

export default CreateRecipe;
