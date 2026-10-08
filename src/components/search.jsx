import React, { useState,  useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { m } from "framer-motion";
import { useDebounce, useRestaurantsQuery } from "../hooks";

export default function SearchComponent({ onSearch }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [isFocused, setIsFocused] = useState(false);

  const { data: restaurants = [] } = useRestaurantsQuery();

  const debouncedQuery = useDebounce(query, 200);

  const suggestions = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    const lowerValue = debouncedQuery.toLowerCase();
    return restaurants
      .filter(
        (r) =>
          r.name?.toLowerCase().includes(lowerValue) ||
          r.cuisines?.some((c) => c.toLowerCase().includes(lowerValue))
      )
      .slice(0, 5);
  }, [debouncedQuery, restaurants]);

  const showSuggestions = Boolean(isFocused && debouncedQuery.trim() && suggestions.length > 0);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    if (!e.target.value.trim()) {
      setResults(null);
    }
  };

  const handleSuggestionClick = (item) => {
    setQuery(item.name);
    setIsFocused(false);
    navigate(`/restaurant/${item.id}`);
    onSearch?.(item, "restaurants");
  };

  const handleSearch = () => {
    if (!query.trim()) {
      setResults(null);
      return;
    }

    const lowerQuery = query.toLowerCase();
    setIsFocused(false);

    const restaurantResults = restaurants.filter(
      (r) =>
        r.name?.toLowerCase().includes(lowerQuery) ||
        r.cuisines?.some((c) => c.toLowerCase().includes(lowerQuery))
    );
    setResults({ type: "restaurants", data: restaurantResults });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    } else if (e.key === "Escape") {
      setIsFocused(false);
    }
  };

  return (
    <div role="search" className="w-full mb-8 font-sans">
      <div className="flex gap-2.5 mb-4 relative">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
            <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            role="searchbox"
            aria-label="Search restaurants by name or cuisine"
            aria-autocomplete="list"
            aria-expanded={showSuggestions}
            placeholder="Search restaurants by name or cuisine..."
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            className="w-full pl-11 pr-4 py-3.5 border border-neutral-200 rounded-xl focus:outline-hidden focus:border-orange-500 shadow-xs focus:ring-4 focus:ring-orange-500/10 transition-all text-neutral-800 placeholder-neutral-400 bg-white focus-visible:outline-orange-500"
          />

          {showSuggestions && (
            <m.div
              role="listbox"
              aria-label="Search suggestions"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-100 rounded-xl shadow-lg z-20 max-h-64 overflow-y-auto"
            >
              {suggestions.map((item, index) => (
                <m.div
                  key={item.id}
                  role="option"
                  aria-selected="false"
                  tabIndex={0}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleSuggestionClick(item)}
                  onKeyDown={(e) => e.key === "Enter" && handleSuggestionClick(item)}
                  className="px-4 py-3.5 border-b border-neutral-50 hover:bg-orange-50/50 cursor-pointer transition flex items-center justify-between focus:bg-orange-50 focus:outline-none"
                >
                  <div>
                    <p className="font-semibold text-neutral-800 text-sm">{item.name}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">{item.cuisines?.join(", ")}</p>
                  </div>
                  <div className="text-neutral-400">
                    <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </m.div>
              ))}
            </m.div>
          )}
        </div>

        <button
          type="button"
          onClick={handleSearch}
          aria-label="Perform search"
          className="px-6 py-3.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold transition shadow-sm hover:shadow-md cursor-pointer min-h-[44px] focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none"
        >
          Search
        </button>
      </div>

      {results && (
        <m.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white border-2 border-neutral-200 rounded-lg p-4 max-h-96 overflow-y-auto"
        >
          {results.data.length > 0 ? (
            <div>
              <p className="font-semibold mb-3 text-neutral-900">
                Found {results.data.length} restaurant{results.data.length > 1 ? "s" : ""}
              </p>
              {results.data.map((item, index) => (
                <m.div
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-3 border-b border-neutral-100 hover:bg-neutral-50 cursor-pointer transition focus:bg-orange-50 focus:outline-none"
                  onClick={() => {
                    navigate(`/restaurant/${item.id}`);
                    onSearch?.(item, "restaurants");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      navigate(`/restaurant/${item.id}`);
                      onSearch?.(item, "restaurants");
                    }
                  }}
                >
                  <p className="font-semibold text-neutral-800">{item.name}</p>
                  <p className="text-sm text-neutral-600">{item.cuisines?.join(", ")}</p>
                </m.div>
              ))}
            </div>
          ) : (
            <m.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-neutral-600 text-center py-4">
              No results found
            </m.p>
          )}
        </m.div>
      )}
    </div>
  );
}
