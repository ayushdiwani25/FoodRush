import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { m } from "framer-motion";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

export default function SearchComponent({ onSearch }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [results, setResults] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    const fetchSearchData = async () => {
      try {
        const restsSnap = await getDocs(collection(db, "restaurants"));
        setRestaurants(restsSnap.docs.map(doc => doc.data()));
      } catch (err) {
        console.error("Error fetching search data from Firestore:", err);
      }
    };
    fetchSearchData();
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (!value.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      setResults(null);
      return;
    }

    const lowerValue = value.toLowerCase();

    // Get restaurant suggestions
    const restaurantSuggestions = restaurants.filter(
      (r) =>
        r.name.toLowerCase().includes(lowerValue) ||
        r.cuisines.some((c) => c.toLowerCase().includes(lowerValue))
    ).slice(0, 5);

    setSuggestions(restaurantSuggestions);
    setShowSuggestions(restaurantSuggestions.length > 0);
  };

  // Click on a suggestion
  const handleSuggestionClick = (item) => {
    setQuery(item.name);
    setSuggestions([]);
    setShowSuggestions(false);
    
    // Navigate to restaurant details page
    navigate(`/restaurant/${item.id}`);
    
    // Call onSearch callback
    onSearch?.(item, "restaurants");
  };

  const handleSearch = () => {
    if (!query.trim()) {
      setResults(null);
      return;
    }

    const lowerQuery = query.toLowerCase();
    setShowSuggestions(false);

    const restaurantResults = restaurants.filter(
      (r) =>
        r.name.toLowerCase().includes(lowerQuery) ||
        r.cuisines.some((c) => c.toLowerCase().includes(lowerQuery))
    );
    setResults({ type: "restaurants", data: restaurantResults });
  };

  return (
    <div className="w-full mb-8 font-sans">
      <div className="flex gap-2.5 mb-4 relative">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search restaurants by name or cuisine..."
            value={query}
            onChange={handleInputChange}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            onFocus={() =>
              query.trim() && suggestions.length > 0 && setShowSuggestions(true)
            }
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="w-full pl-11 pr-4 py-3.5 border border-neutral-200 rounded-xl focus:outline-hidden focus:border-orange-500 shadow-xs focus:ring-4 focus:ring-orange-500/10 transition-all text-neutral-800 placeholder-neutral-400 bg-white"
          />

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <m.div 
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-100 rounded-xl shadow-lg z-20 max-h-64 overflow-y-auto"
            >
              {suggestions.map((item, index) => (
                <m.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleSuggestionClick(item)}
                  className="px-4 py-3.5 border-b border-neutral-50 hover:bg-orange-50/50 cursor-pointer transition flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-neutral-800 text-sm">
                      {item.name}
                    </p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {item.cuisines.join(", ")}
                    </p>
                  </div>
                  <div className="text-neutral-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
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
          className="px-6 py-3.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold transition shadow-sm hover:shadow-md cursor-pointer"
        >
          Search
        </button>
      </div>

      {results && (
        <m.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white border-2 border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto"
        >
          {results.data.length > 0 ? (
            <div>
              <p className="font-semibold mb-3">
                Found {results.data.length} restaurants
              </p>
              {results.data.map((item, index) => (
                <m.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition"
                  onClick={() => {
                    navigate(`/restaurant/${item.id}`);
                    onSearch?.(item, "restaurants");
                  }}
                >
                  <p className="font-semibold text-gray-800">{item.name}</p>
                  <p className="text-sm text-gray-600">
                    {item.cuisines.join(", ")}
                  </p>
                </m.div>
              ))}
            </div>
          ) : (
            <m.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-gray-600 text-center py-4"
            >
              No results found
            </m.p>
          )}
        </m.div>
      )}
    </div>
  );
}
