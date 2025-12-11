import api from './api';

// Get dashboard statistics
export const getStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

// Get all users
export const getAllUsers = async () => {
  const response = await api.get('/admin/users');
  return response.data;
};

// Update user role
export const updateUserRole = async (userId, role) => {
  const response = await api.patch(`/admin/users/${userId}/role`, { role });
  return response.data;
};

// Delete user
export const deleteUser = async (userId) => {
  const response = await api.delete(`/admin/users/${userId}`);
  return response.data;
};

// Get all recipes (admin view - includes private recipes)
export const getAllRecipes = async () => {
  const response = await api.get('/admin/recipes');
  return response.data;
};

// Delete any recipe
export const deleteRecipe = async (recipeId) => {
  const response = await api.delete(`/admin/recipes/${recipeId}`);
  return response.data;
};

export default {
  getStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllRecipes,
  deleteRecipe,
};
