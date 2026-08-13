import { useState, useMemo } from "react";
import { useDebounce } from "./useDebounce";

export function useRestaurants(initialList = []) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("All");
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("recommended");

  const debouncedSearch = useDebounce(searchTerm, 250);

  const filteredRestaurants = useMemo(() => {
    return initialList
      .filter((restaurant) => {
        const nameMatch = restaurant.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          restaurant.cuisine?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          restaurant.description?.toLowerCase().includes(debouncedSearch.toLowerCase());

        const cuisineMatch =
          selectedCuisine === "All" ||
          restaurant.cuisine?.toLowerCase() === selectedCuisine.toLowerCase();

        const ratingMatch = (restaurant.rating || 0) >= minRating;

        return nameMatch && cuisineMatch && ratingMatch;
      })
      .sort((a, b) => {
        if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
        if (sortBy === "deliveryTime") return (a.deliveryTimeMinutes || 30) - (b.deliveryTimeMinutes || 30);
        if (sortBy === "deliveryFee") return (a.deliveryFee || 0) - (b.deliveryFee || 0);
        return 0; // recommended / default order
      });
  }, [initialList, debouncedSearch, selectedCuisine, minRating, sortBy]);

  return {
    searchTerm,
    setSearchTerm,
    selectedCuisine,
    setSelectedCuisine,
    minRating,
    setMinRating,
    sortBy,
    setSortBy,
    restaurants: filteredRestaurants,
    totalCount: filteredRestaurants.length,
  };
}
