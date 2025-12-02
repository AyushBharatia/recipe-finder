import React, { useState, useEffect } from 'react';
import recipeService from '../../services/recipeService';

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'createdAt', label: 'Oldest First' },
  { value: 'cookTime', label: 'Quickest' },
  { value: '-cookTime', label: 'Longest' },
  { value: 'title', label: 'A-Z' },
  { value: '-title', label: 'Z-A' },
];

const SearchFilter = ({ filters, onFilterChange }) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [cuisines, setCuisines] = useState([]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilterChange(localFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      search: '',
      cuisine: '',
      maxTime: '',
      sortBy: '-createdAt',
    };
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <form className="search-filter" onSubmit={handleSubmit}>
      <div className="filter-row">
        <div className="filter-group search-group">
          <input
            type="text"
            name="search"
            value={localFilters.search}
            onChange={handleChange}
            placeholder="Search recipes..."
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <select
            name="cuisine"
            value={localFilters.cuisine}
            onChange={handleChange}
            className="filter-select"
          >
            <option value="">All Cuisines</option>
            {cuisines.map((cuisine) => (
              <option key={cuisine} value={cuisine}>
                {cuisine}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <input
            type="number"
            name="maxTime"
            value={localFilters.maxTime}
            onChange={handleChange}
            placeholder="Max cook time (min)"
            min="1"
            className="filter-input"
          />
        </div>

        <div className="filter-group">
          <select
            name="sortBy"
            value={localFilters.sortBy}
            onChange={handleChange}
            className="filter-select"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-buttons">
          <button type="submit" className="filter-btn search-btn">
            Search
          </button>
          <button type="button" onClick={handleReset} className="filter-btn reset-btn">
            Reset
          </button>
        </div>
      </div>
    </form>
  );
};

export default SearchFilter;
