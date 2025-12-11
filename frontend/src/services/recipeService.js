import api from './api';

const recipeService = {
  async getAll(params = {}) {
    const response = await api.get('/recipes', { params });
    return response.data;
  },

  async getCuisines() {
    const response = await api.get('/recipes/cuisines');
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/recipes/${id}`);
    return response.data;
  },

  async create(recipeData) {
    // recipeData is FormData for file uploads
    const response = await api.post('/recipes', recipeData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async update(id, recipeData) {
    // recipeData is FormData for file uploads
    const response = await api.put(`/recipes/${id}`, recipeData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/recipes/${id}`);
    return response.data;
  },
};

export default recipeService;
