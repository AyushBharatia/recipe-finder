import React, { useState, useEffect } from 'react';
import recipeService from '../../services/recipeService';

// Inline SVG Icons
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const UsersIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const UtensilsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
    <path d="M7 2v20" />
    <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
  </svg>
);

const ImageIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const UploadIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const RecipeForm = ({ initialData, onSubmit, loading, submitLabel }) => {
  const [formData, setFormData] = useState({
    title: '',
    cuisine: '',
    ingredients: [''],
    cookTime: '',
    servings: '',
    steps: [''],
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
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

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

  // Helper to parse instructions string into steps array
  const parseInstructions = (instructions) => {
    if (!instructions) return [''];
    // Try to split by numbered steps (e.g., "1. Step one 2. Step two")
    const stepPattern = /\d+\.\s*/;
    const parts = instructions.split(stepPattern).filter(s => s.trim());
    return parts.length > 0 ? parts : [instructions];
  };

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        cuisine: initialData.cuisine || '',
        ingredients: initialData.ingredients?.length ? initialData.ingredients : [''],
        cookTime: initialData.cookTime || '',
        servings: initialData.servings || '',
        steps: parseInstructions(initialData.instructions),
        imageUrl: initialData.imageUrl || '',
        nutrition: {
          calories: initialData.nutrition?.calories || '',
          protein: initialData.nutrition?.protein || '',
          carbs: initialData.nutrition?.carbs || '',
          fat: initialData.nutrition?.fat || '',
        },
      });
      // Set existing image as preview
      if (initialData.imageUrl) {
        setImagePreview(initialData.imageUrl);
      }
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

  // Step management
  const handleStepChange = (index, value) => {
    const newSteps = [...formData.steps];
    newSteps[index] = value;
    setFormData((prev) => ({ ...prev, steps: newSteps }));
  };

  const addStep = () => {
    setFormData((prev) => ({
      ...prev,
      steps: [...prev.steps, ''],
    }));
  };

  const removeStep = (index) => {
    if (formData.steps.length > 1) {
      const newSteps = formData.steps.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, steps: newSteps }));
    }
  };

  // Image file handling
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setErrors((prev) => ({ ...prev, image: 'Please select a valid image file (JPEG, PNG, GIF, or WebP)' }));
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, image: 'Image must be less than 5MB' }));
        return;
      }

      setImageFile(file);
      setErrors((prev) => ({ ...prev, image: '' }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, imageUrl: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Convert steps array to numbered instructions string
    const validSteps = formData.steps.filter((s) => s.trim());
    const instructionsString = validSteps
      .map((step, index) => `${index + 1}. ${step.trim()}`)
      .join(' ');

    // Prepare nutrition data
    const nutrition = {};
    let hasNutrition = false;
    ['calories', 'protein', 'carbs', 'fat'].forEach((field) => {
      if (formData.nutrition[field]) {
        nutrition[field] = parseFloat(formData.nutrition[field]);
        hasNutrition = true;
      }
    });

    // Create FormData for file upload
    const formDataToSubmit = new FormData();
    formDataToSubmit.append('title', formData.title.trim());
    formDataToSubmit.append('cuisine', isOtherCuisine ? customCuisine.trim() : formData.cuisine);
    formDataToSubmit.append('ingredients', JSON.stringify(formData.ingredients.filter((i) => i.trim())));
    formDataToSubmit.append('cookTime', parseInt(formData.cookTime));
    formDataToSubmit.append('servings', parseInt(formData.servings));
    formDataToSubmit.append('instructions', instructionsString);

    if (hasNutrition) {
      formDataToSubmit.append('nutrition', JSON.stringify(nutrition));
    }

    // Append image file if selected
    if (imageFile) {
      formDataToSubmit.append('image', imageFile);
    }

    onSubmit(formDataToSubmit);
  };

  return (
    <form className="recipe-form" onSubmit={handleSubmit}>
      <div className="form-section">
        <div className="section-header">
          <h3>Basic Information</h3>
          <div className="section-divider"></div>
        </div>

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
            <label htmlFor="cuisine">
              <UtensilsIcon />
              <span>Cuisine *</span>
            </label>
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
                style={{ marginTop: '6px' }}
              />
            )}
            {errors.cuisine && <span className="error-text">{errors.cuisine}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="cookTime">
              <ClockIcon />
              <span>Cook Time (min) *</span>
            </label>
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
            <label htmlFor="servings">
              <UsersIcon />
              <span>Servings *</span>
            </label>
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
          <label>
            <ImageIcon />
            <span>Recipe Image (optional)</span>
          </label>
          <div className="image-upload-container">
            {imagePreview ? (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
                <button
                  type="button"
                  className="remove-image-btn"
                  onClick={removeImage}
                  aria-label="Remove image"
                >
                  <XIcon />
                </button>
              </div>
            ) : (
              <label className="image-upload-box" htmlFor="image-upload">
                <input
                  type="file"
                  id="image-upload"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
                <UploadIcon />
                <span>Click to upload image</span>
                <span className="upload-hint">JPEG, PNG, GIF, WebP (max 5MB)</span>
              </label>
            )}
          </div>
          {errors.image && <span className="error-text">{errors.image}</span>}
        </div>
      </div>

      <div className="form-section">
        <div className="section-header">
          <h3>Ingredients *</h3>
          <div className="section-divider"></div>
        </div>
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
                  aria-label="Remove ingredient"
                >
                  <XIcon />
                </button>
              )}
            </div>
          ))}
        </div>

        <button type="button" className="add-btn" onClick={addIngredient}>
          <PlusIcon />
          <span>Add Ingredient</span>
        </button>
      </div>

      <div className="form-section">
        <div className="section-header">
          <h3>Instructions</h3>
          <div className="section-divider"></div>
        </div>
        <div className="steps-list">
          {formData.steps.map((step, index) => (
            <div key={index} className="step-row">
              <span className="step-number">Step {index + 1}</span>
              <input
                type="text"
                value={step}
                onChange={(e) => handleStepChange(index, e.target.value)}
                placeholder={`What to do in step ${index + 1}...`}
              />
              {formData.steps.length > 1 && (
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => removeStep(index)}
                  aria-label="Remove step"
                >
                  <XIcon />
                </button>
              )}
            </div>
          ))}
        </div>
        <button type="button" className="add-btn" onClick={addStep}>
          <PlusIcon />
          <span>Add Step</span>
        </button>
      </div>

      <div className="form-section">
        <div className="section-header">
          <h3>Nutrition (optional)</h3>
          <div className="section-divider"></div>
        </div>
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
