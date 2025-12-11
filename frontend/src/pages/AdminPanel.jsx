import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import adminService from '../services/adminService';
import Message from '../components/common/Message';
import './AdminPanel.css';

// Icons
const UsersIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const RecipeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" />
    <line x1="6" y1="17" x2="18" y2="17" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3,6 5,6 21,6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const AdminPanel = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('users');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/');
      return;
    }
    fetchData();
  }, [isAdmin, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, usersData, recipesData] = await Promise.all([
        adminService.getStats(),
        adminService.getAllUsers(),
        adminService.getAllRecipes(),
      ]);
      setStats(statsData);
      setUsers(usersData);
      setRecipes(recipesData);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load admin data' });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminService.updateUserRole(userId, newRole);
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
      setStats(prev => ({
        ...prev,
        totalAdmins: newRole === 'admin' ? prev.totalAdmins + 1 : prev.totalAdmins - 1
      }));
      setMessage({ type: 'success', text: `User role updated to ${newRole}` });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update role' });
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete "${userName}"? This will also delete all their recipes.`)) {
      return;
    }
    try {
      await adminService.deleteUser(userId);
      setUsers(users.filter(u => u._id !== userId));
      setRecipes(recipes.filter(r => r.createdBy?._id !== userId));
      setStats(prev => ({ ...prev, totalUsers: prev.totalUsers - 1 }));
      setMessage({ type: 'success', text: 'User deleted successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to delete user' });
    }
  };

  const handleDeleteRecipe = async (recipeId, recipeTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${recipeTitle}"?`)) {
      return;
    }
    try {
      await adminService.deleteRecipe(recipeId);
      setRecipes(recipes.filter(r => r._id !== recipeId));
      setStats(prev => ({ ...prev, totalRecipes: prev.totalRecipes - 1 }));
      setMessage({ type: 'success', text: 'Recipe deleted successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to delete recipe' });
    }
  };

  if (loading) {
    return (
      <div className="admin-panel">
        <div className="admin-loading">Loading admin panel...</div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      {message && (
        <Message type={message.type} onClose={() => setMessage(null)}>
          {message.text}
        </Message>
      )}

      <div className="admin-header">
        <h1>
          <ShieldIcon />
          Admin Panel
        </h1>
      </div>

      {/* Stats Cards */}
      <div className="admin-stats">
        <div className="stat-card">
          <div className="stat-icon users">
            <UsersIcon />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats?.totalUsers || 0}</span>
            <span className="stat-label">Total Users</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon admins">
            <ShieldIcon />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats?.totalAdmins || 0}</span>
            <span className="stat-label">Admins</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon recipes">
            <RecipeIcon />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats?.totalRecipes || 0}</span>
            <span className="stat-label">Total Recipes</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon preset">
            <RecipeIcon />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats?.presetRecipes || 0}</span>
            <span className="stat-label">Preset Recipes</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <UsersIcon />
          Users ({users.length})
        </button>
        <button
          className={`admin-tab ${activeTab === 'recipes' ? 'active' : ''}`}
          onClick={() => setActiveTab('recipes')}
        >
          <RecipeIcon />
          Recipes ({recipes.length})
        </button>
      </div>

      {/* Content */}
      <div className="admin-content">
        {activeTab === 'users' && (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        className={`role-select ${user.role}`}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteUser(user._id, user.name)}
                        title="Delete user"
                      >
                        <TrashIcon />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'recipes' && (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Cuisine</th>
                  <th>Created By</th>
                  <th>Type</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recipes.map(recipe => (
                  <tr key={recipe._id}>
                    <td>{recipe.title}</td>
                    <td>{recipe.cuisine}</td>
                    <td>{recipe.createdBy?.name || 'System'}</td>
                    <td>
                      <span className={`recipe-type ${recipe.isPreset ? 'preset' : 'user'}`}>
                        {recipe.isPreset ? 'Preset' : 'User'}
                      </span>
                    </td>
                    <td>{new Date(recipe.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteRecipe(recipe._id, recipe.title)}
                        title="Delete recipe"
                      >
                        <TrashIcon />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
