import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import recipeService from '../../services/recipeService';

// Inline SVG Icons
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const FilterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'createdAt', label: 'Oldest First' },
  { value: 'cookTime', label: 'Quickest' },
  { value: '-cookTime', label: 'Longest' },
  { value: 'title', label: 'A-Z' },
  { value: '-title', label: 'Z-A' },
];

const SearchFilter = ({ filters, onFilterChange, showAddButton }) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [cuisines, setCuisines] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef(null);

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

  // Sync localFilters with parent filters prop when it changes externally
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...localFilters, [name]: value };
    setLocalFilters(newFilters);

    // Auto-apply for dropdown/select filters (not search - that needs explicit submit)
    if (name !== 'search') {
      onFilterChange(newFilters);
    }
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
    setIsFilterOpen(false);
  };

  const hasActiveFilters = localFilters.cuisine || localFilters.maxTime || localFilters.sortBy !== '-createdAt';

  return (
    <form className="search-filter" onSubmit={handleSubmit}>
      {/* Search Bar */}
      <div className="search-filter__search">
        <input
          type="text"
          name="search"
          value={localFilters.search}
          onChange={handleChange}
          placeholder="Search recipes..."
          className="search-filter__input"
        />
        <button type="submit" className="search-filter__search-btn" aria-label="Search">
          <SearchIcon />
        </button>
      </div>

      {/* Actions: Filter & Add Recipe */}
      <div className="search-filter__actions">
        <div className="search-filter__filters" ref={filterRef}>
          <button
            type="button"
            className={`search-filter__filter-btn ${hasActiveFilters ? 'search-filter__filter-btn--active' : ''}`}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <FilterIcon />
            <span>Filters</span>
            {hasActiveFilters && <span className="search-filter__badge" />}
            <ChevronDownIcon />
          </button>

        {isFilterOpen && (
          <div className="search-filter__dropdown">
            <div className="search-filter__dropdown-item">
              <label>Cuisine</label>
              <select
                name="cuisine"
                value={localFilters.cuisine}
                onChange={handleChange}
              >
                <option value="">All Cuisines</option>
                {cuisines.map((cuisine) => (
                  <option key={cuisine} value={cuisine}>
                    {cuisine}
                  </option>
                ))}
              </select>
            </div>

            <div className="search-filter__dropdown-item">
              <label>Max Cook Time</label>
              <input
                type="number"
                name="maxTime"
                value={localFilters.maxTime}
                onChange={handleChange}
                placeholder="Minutes"
                min="1"
              />
            </div>

            <div className="search-filter__dropdown-item">
              <label>Sort By</label>
              <select
                name="sortBy"
                value={localFilters.sortBy}
                onChange={handleChange}
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="search-filter__dropdown-actions">
              <button
                type="button"
                className="search-filter__reset-btn"
                onClick={handleReset}
              >
                Reset Filters
              </button>
              <button
                type="submit"
                className="search-filter__apply-btn"
                onClick={() => setIsFilterOpen(false)}
              >
                Apply
              </button>
            </div>
          </div>
        )}
        </div>

        {showAddButton && (
          <Link to="/recipes/new" className="search-filter__add-btn">
            <PlusIcon />
            <span>Add Recipe</span>
          </Link>
        )}
      </div>
    </form>
  );
};

export default SearchFilter;
