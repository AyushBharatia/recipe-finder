import api from './api';

const favoriteService = {
  async getFavorites(userId) {
    const response = await api.get(`/users/${userId}/favorites`);
    return response.data;
  },

  async addFavorite(userId, recipeId) {
    const response = await api.post(`/users/${userId}/favorites`, { recipeId });
    return response.data;
  },

  async removeFavorite(userId, recipeId) {
    const response = await api.delete(`/users/${userId}/favorites/${recipeId}`);
    return response.data;
  },
};

export default favoriteService;
