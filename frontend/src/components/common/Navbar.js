import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Recipe Finder</Link>
      </div>

      <div className="navbar-menu">
        <Link to="/recipes" className="navbar-link">
          Recipes
        </Link>

        {isAuthenticated ? (
          <>
            <Link to="/recipes/new" className="navbar-link">
              Add Recipe
            </Link>
            <Link to="/favorites" className="navbar-link">
              Favorites
            </Link>
            <span className="navbar-user">Hello, {user?.name}</span>
            <button onClick={handleLogout} className="navbar-btn logout-btn">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="navbar-link">
              Login
            </Link>
            <Link to="/register" className="navbar-btn register-btn">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
