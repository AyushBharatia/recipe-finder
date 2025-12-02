import React, { useState, useEffect } from 'react';
import recipeService from '../../services/recipeService';

const RecipeForm = ({ initialData, onSubmit, loading, submitLabel }) => {
  const [formData, setFormData] = useState({
    title: '',
    cuisine: '',
    ingredients: [''],
    cookTime: '',
    servings: '',
    instructions: '',
    imageUrl: '',
    nutrition: {
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
    },
  });
  const [errors, setErrors] = useState({});
  const [cuisines, setCuisines] = useState([]);
  const [isOtherCuisine, setIsOtherCuisine] = useState(false);
  const [customCuisine, setCustomCuisine] = useState('');

  useEffect(() => {
    const fetchCuisines = async () => {
      try {
        const data = await recipeService.getCuisines();
        setCuisines(data);
      } catch (error) {
        console.error('Failed to fetch cuisines:', error);
      }
    };
    fetchCuisines();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        cuisine: initialData.cuisine || '',
        ingredients: initialData.ingredients?.length ? initialData.ingredients : [''],
        cookTime: initialData.cookTime || '',
        servings: initialData.servings || '',
        instructions: initialData.instructions || '',
        imageUrl: initialData.imageUrl || '',
        nutrition: {
          calories: initialData.nutrition?.calories || '',
          protein: initialData.nutrition?.protein || '',
          carbs: initialData.nutrition?.carbs || '',
          fat: initialData.nutrition?.fat || '',
        },
      });
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    if (!formData.cuisine && !isOtherCuisine) {
      newErrors.cuisine = 'Cuisine is required';
    } else if (isOtherCuisine && !customCuisine.trim()) {
      newErrors.cuisine = 'Please enter a custom cuisine';
    }

    const validIngredients = formData.ingredients.filter((i) => i.trim());
    if (validIngredients.length === 0) {
      newErrors.ingredients = 'At least one ingredient is required';
    }

    if (!formData.cookTime) {
      newErrors.cookTime = 'Cook time is required';
    } else if (parseInt(formData.cookTime) < 1) {
      newErrors.cookTime = 'Cook time must be at least 1 minute';
    }

    if (!formData.servings) {
      newErrors.servings = 'Servings is required';
    } else if (parseInt(formData.servings) < 1) {
      newErrors.servings = 'Servings must be at least 1';
    }

    if (formData.imageUrl && !/^https?:\/\/.+/.test(formData.imageUrl)) {
      newErrors.imageUrl = 'Please enter a valid URL';
    }

    ['calories', 'protein', 'carbs', 'fat'].forEach((field) => {
      if (formData.nutrition[field] && parseFloat(formData.nutrition[field]) < 0) {
        newErrors[`nutrition.${field}`] = `${field.charAt(0).toUpperCase() + field.slice(1)} must be positive`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith('nutrition.')) {
      const nutritionField = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        nutrition: { ...prev.nutrition, [nutritionField]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleCuisineChange = (e) => {
    const value = e.target.value;
    if (value === 'Other') {
      setIsOtherCuisine(true);
      setFormData((prev) => ({ ...prev, cuisine: '' }));
    } else {
      setIsOtherCuisine(false);
      setCustomCuisine('');
      setFormData((prev) => ({ ...prev, cuisine: value }));
    }
    if (errors.cuisine) {
      setErrors((prev) => ({ ...prev, cuisine: '' }));
    }
  };

  const handleIngredientChange = (index, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = value;
    setFormData((prev) => ({ ...prev, ingredients: newIngredients }));
    if (errors.ingredients) {
      setErrors((prev) => ({ ...prev, ingredients: '' }));
    }
  };

  const addIngredient = () => {
    setFormData((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, ''],
    }));
  };

  const removeIngredient = (index) => {
    if (formData.ingredients.length > 1) {
      const newIngredients = formData.ingredients.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, ingredients: newIngredients }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Prepare data for submission
    const submitData = {
      title: formData.title.trim(),
      cuisine: isOtherCuisine ? customCuisine.trim() : formData.cuisine,
      ingredients: formData.ingredients.filter((i) => i.trim()),
      cookTime: parseInt(formData.cookTime),
      servings: parseInt(formData.servings),
      instructions: formData.instructions.trim(),
      imageUrl: formData.imageUrl.trim() || undefined,
    };

    // Add nutrition if any values are provided
    const nutrition = {};
    let hasNutrition = false;
    ['calories', 'protein', 'carbs', 'fat'].forEach((field) => {
      if (formData.nutrition[field]) {
        nutrition[field] = parseFloat(formData.nutrition[field]);
        hasNutrition = true;
      }
    });
    if (hasNutrition) {
      submitData.nutrition = nutrition;
    }

    onSubmit(submitData);
  };

  return (
    <form className="recipe-form" onSubmit={handleSubmit}>
      <div className="form-section">
        <h3>Basic Information</h3>

        <div className="form-group">
          <label htmlFor="title">Recipe Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={errors.title ? 'input-error' : ''}
            placeholder="Enter recipe title"
          />
          {errors.title && <span className="error-text">{errors.title}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="cuisine">Cuisine *</label>
            <select
              id="cuisine"
              name="cuisine"
              value={isOtherCuisine ? 'Other' : formData.cuisine}
              onChange={handleCuisineChange}
              className={errors.cuisine ? 'input-error' : ''}
            >
              <option value="">Select Cuisine</option>
              {cuisines.map((cuisine) => (
                <option key={cuisine} value={cuisine}>
                  {cuisine}
                </option>
              ))}
              <option value="Other">Other</option>
            </select>
            {isOtherCuisine && (
              <input
                type="text"
                value={customCuisine}
                onChange={(e) => {
                  setCustomCuisine(e.target.value);
                  if (errors.cuisine) {
                    setErrors((prev) => ({ ...prev, cuisine: '' }));
                  }
                }}
                className={errors.cuisine ? 'input-error' : ''}
                placeholder="Enter custom cuisine (e.g., Dessert)"
                style={{ marginTop: '8px' }}
              />
            )}
            {errors.cuisine && <span className="error-text">{errors.cuisine}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="cookTime">Cook Time (minutes) *</label>
            <input
              type="number"
              id="cookTime"
              name="cookTime"
              value={formData.cookTime}
              onChange={handleChange}
              className={errors.cookTime ? 'input-error' : ''}
              min="1"
              placeholder="30"
            />
            {errors.cookTime && <span className="error-text">{errors.cookTime}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="servings">Servings *</label>
            <input
              type="number"
              id="servings"
              name="servings"
              value={formData.servings}
              onChange={handleChange}
              className={errors.servings ? 'input-error' : ''}
              min="1"
              placeholder="4"
            />
            {errors.servings && <span className="error-text">{errors.servings}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="imageUrl">Image URL (optional)</label>
          <input
            type="url"
            id="imageUrl"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            className={errors.imageUrl ? 'input-error' : ''}
            placeholder="https://example.com/image.jpg"
          />
          {errors.imageUrl && <span className="error-text">{errors.imageUrl}</span>}
        </div>
      </div>

      <div className="form-section">
        <h3>Ingredients *</h3>
        {errors.ingredients && <span className="error-text">{errors.ingredients}</span>}

        <div className="ingredients-list">
          {formData.ingredients.map((ingredient, index) => (
            <div key={index} className="ingredient-row">
              <input
                type="text"
                value={ingredient}
                onChange={(e) => handleIngredientChange(index, e.target.value)}
                placeholder={`Ingredient ${index + 1}`}
              />
              {formData.ingredients.length > 1 && (
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => removeIngredient(index)}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        <button type="button" className="add-btn" onClick={addIngredient}>
          + Add Ingredient
        </button>
      </div>

      <div className="form-section">
        <h3>Instructions</h3>
        <div className="form-group">
          <textarea
            id="instructions"
            name="instructions"
            value={formData.instructions}
            onChange={handleChange}
            rows="6"
            placeholder="Enter cooking instructions..."
          />
        </div>
      </div>

      <div className="form-section">
        <h3>Nutrition Information (optional)</h3>
        <div className="form-row nutrition-row">
          <div className="form-group">
            <label htmlFor="nutrition.calories">Calories</label>
            <input
              type="number"
              id="nutrition.calories"
              name="nutrition.calories"
              value={formData.nutrition.calories}
              onChange={handleChange}
              min="0"
              placeholder="0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="nutrition.protein">Protein (g)</label>
            <input
              type="number"
              id="nutrition.protein"
              name="nutrition.protein"
              value={formData.nutrition.protein}
              onChange={handleChange}
              min="0"
              placeholder="0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="nutrition.carbs">Carbs (g)</label>
            <input
              type="number"
              id="nutrition.carbs"
              name="nutrition.carbs"
              value={formData.nutrition.carbs}
              onChange={handleChange}
              min="0"
              placeholder="0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="nutrition.fat">Fat (g)</label>
            <input
              type="number"
              id="nutrition.fat"
              name="nutrition.fat"
              value={formData.nutrition.fat}
              onChange={handleChange}
              min="0"
              placeholder="0"
            />
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Saving...' : submitLabel || 'Save Recipe'}
        </button>
      </div>
    </form>
  );
};

export default RecipeForm;
