import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { m } from "framer-motion";
import { SearchComponent } from "@/components";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { OptimizedImage } from "../components/ui";

export default function RestaurantsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [restaurants, setRestaurants] = useState([]);
  const [deals, setDeals] = useState([]);
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters and sorting states
  const [vegFilter, setVegFilter] = useState("all"); // "all", "veg", "nonveg"
  const [ratingFilter, setRatingFilter] = useState(false); // true/false for 4.0+
  const [sortBy, setSortBy] = useState("default"); // "default", "time", "cost", "rating"

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "restaurants"));
        const rests = querySnapshot.docs.map((doc) => doc.data());
        setRestaurants(rests);

        const dealsSnapshot = await getDocs(collection(db, "deals"));
        const dealsList = dealsSnapshot.docs.map((doc) => doc.data());
        setDeals(dealsList);

        const menusSnapshot = await getDocs(collection(db, "menus"));
        const menusList = menusSnapshot.docs.map((doc) => doc.data());
        setMenus(menusList);
      } catch (err) {
        console.error("Error fetching restaurants/deals/menus from Firestore:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getRestaurantVegStatus = (restaurant) => {
    const restaurantMenu = menus.filter((item) =>
      restaurant.menu?.includes(item.id)
    );
    const hasVegItems = restaurantMenu.some((item) => item.veg);
    const hasNonVegItems = restaurantMenu.some((item) => !item.veg);
    if (hasVegItems && !hasNonVegItems) return "veg";
    if (hasNonVegItems && !hasVegItems) return "nonveg";
    return "both";
  };

  const getMinDeliveryTime = (timeStr) => {
    const match = timeStr?.match(/^(\d+)/);
    return match ? parseInt(match[1], 10) : 999;
  };

  // FE 07: Memoize filtered and sorted restaurant results
  const filteredAndSortedRestaurants = useMemo(() => {
    return restaurants
      .filter((restaurant) => {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch =
          restaurant.name?.toLowerCase().includes(searchLower) ||
          restaurant.cuisines?.some((cuisine) => cuisine.toLowerCase().includes(searchLower)) ||
          restaurant.location?.toLowerCase().includes(searchLower) ||
          restaurant.description?.toLowerCase().includes(searchLower);

        if (!matchesSearch) return false;

        // Apply Veg Filter
        if (vegFilter === "veg") {
          const vegStatus = getRestaurantVegStatus(restaurant);
          if (vegStatus !== "veg") return false;
        }
        if (vegFilter === "nonveg") {
          const vegStatus = getRestaurantVegStatus(restaurant);
          if (vegStatus === "veg") return false;
        }

        // Apply Rating 4.0+ filter
        if (ratingFilter) {
          if ((restaurant.rating || 0) < 4.0) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "rating") {
          return (b.rating || 0) - (a.rating || 0);
        }
        if (sortBy === "cost") {
          return (a.deliveryFee || 0) - (b.deliveryFee || 0);
        }
        if (sortBy === "time") {
          return getMinDeliveryTime(a.deliveryTime) - getMinDeliveryTime(b.deliveryTime);
        }
        return 0;
      });
  }, [restaurants, searchQuery, vegFilter, ratingFilter, sortBy, menus]);

  const handleSearch = (item, type) => {
    if (type === "restaurants") {
      navigate(`/restaurant/${item.id}`);
    } else if (typeof item === "string") {
      setSearchQuery(item);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FCFBF7]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFBF7] py-12 px-4 md:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-10 text-left">
          <m.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold text-neutral-900 tracking-tight mb-3"
          >
            Order from Top Restaurants
          </m.h1>
          <m.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-neutral-500 text-base md:text-lg"
          >
            Discover the best restaurants and cuisines near you
          </m.p>
        </header>

        {/* Search */}
        <div className="mb-8">
          <SearchComponent onSearch={handleSearch} />
        </div>

        {/* Filters and Sorting Bar */}
        <nav aria-label="Restaurant Filters" className="flex flex-wrap items-center gap-3 mb-10 pb-4 border-b border-neutral-100">
          {/* Veg Filter Toggle */}
          <button
            type="button"
            aria-pressed={vegFilter === "veg"}
            onClick={() => setVegFilter((prev) => (prev === "veg" ? "all" : "veg"))}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 border flex items-center gap-1.5 cursor-pointer min-h-[40px] focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:outline-none ${
              vegFilter === "veg"
                ? "bg-green-50 text-green-700 border-green-300 shadow-2xs ring-2 ring-green-100"
                : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
            }`}
          >
            <span className="w-3.5 h-3.5 border border-green-600 rounded-xs flex items-center justify-center bg-white shrink-0" aria-hidden="true">
              <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
            </span>
            <span>Pure Veg</span>
          </button>

          {/* Non-Veg Filter Toggle */}
          <button
            type="button"
            aria-pressed={vegFilter === "nonveg"}
            onClick={() => setVegFilter((prev) => (prev === "nonveg" ? "all" : "nonveg"))}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 border flex items-center gap-1.5 cursor-pointer min-h-[40px] focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none ${
              vegFilter === "nonveg"
                ? "bg-red-50 text-red-700 border-red-300 shadow-2xs ring-2 ring-red-100"
                : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
            }`}
          >
            <span className="w-3.5 h-3.5 border border-red-600 rounded-xs flex items-center justify-center bg-white shrink-0" aria-hidden="true">
              <span className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[6px] border-b-red-600"></span>
            </span>
            <span>Non-Veg</span>
          </button>

          {/* Rating 4.0+ Filter Toggle */}
          <button
            type="button"
            aria-pressed={ratingFilter}
            onClick={() => setRatingFilter((prev) => !prev)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 border flex items-center gap-1.5 cursor-pointer min-h-[40px] focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none ${
              ratingFilter
                ? "bg-orange-50 text-orange-700 border-orange-200 shadow-2xs"
                : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
            }`}
          >
            ⭐ Rating 4.0+
          </button>

          {/* Divider */}
          <span className="h-6 w-[1px] bg-neutral-200 mx-1 hidden sm:inline-block" aria-hidden="true"></span>

          {/* Sort Options */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider mr-1 hidden sm:inline-block">Sort by:</span>

            {/* Default/Relevance */}
            <button
              type="button"
              onClick={() => setSortBy("default")}
              aria-pressed={sortBy === "default"}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border cursor-pointer min-h-[36px] focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none ${
                sortBy === "default"
                  ? "bg-neutral-900 text-white border-neutral-900"
                  : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
              }`}
            >
              Relevance
            </button>

            {/* Rating */}
            <button
              type="button"
              onClick={() => setSortBy("rating")}
              aria-pressed={sortBy === "rating"}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border cursor-pointer min-h-[36px] focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none ${
                sortBy === "rating"
                  ? "bg-neutral-900 text-white border-neutral-900"
                  : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
              }`}
            >
              Rating
            </button>

            {/* Delivery Time */}
            <button
              type="button"
              onClick={() => setSortBy("time")}
              aria-pressed={sortBy === "time"}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border cursor-pointer min-h-[36px] focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none ${
                sortBy === "time"
                  ? "bg-neutral-900 text-white border-neutral-900"
                  : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
              }`}
            >
              Delivery Time
            </button>
          </div>
        </nav>

        {/* Restaurant Cards Grid */}
        <main>
          {filteredAndSortedRestaurants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredAndSortedRestaurants.map((restaurant) => (
                <m.article
                  key={restaurant.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`View ${restaurant.name} menu`}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  whileHover={{ y: -6 }}
                  onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      navigate(`/restaurant/${restaurant.id}`);
                    }
                  }}
                  className="bg-white rounded-2xl border border-neutral-100 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col focus-visible:ring-4 focus-visible:ring-orange-500 focus-visible:outline-none"
                >
                  {/* Restaurant Banner Image */}
                  <div className="relative h-48 overflow-hidden bg-neutral-100">
                    <OptimizedImage
                      src={restaurant.image}
                      alt={`${restaurant.name} restaurant cover`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      aspectRatio="h-full"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-neutral-800 shadow-xs flex items-center gap-1">
                      <span className="text-amber-500">⭐</span> {restaurant.rating || "4.5"}
                    </div>
                  </div>

                  {/* Details Section */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h2 className="text-xl font-black text-neutral-900 mb-1">{restaurant.name}</h2>
                      <p className="text-xs font-semibold text-orange-600 mb-2">{restaurant.cuisines?.join(", ")}</p>
                      <p className="text-xs text-neutral-500 line-clamp-2 mb-4 leading-relaxed">{restaurant.description}</p>
                    </div>

                    <div className="pt-4 border-t border-neutral-100 flex items-center justify-between text-xs font-bold text-neutral-600">
                      <div className="flex items-center gap-1">
                        <svg aria-hidden="true" className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{restaurant.deliveryTime || "25-35 mins"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg aria-hidden="true" className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>${restaurant.deliveryFee || 2.99} delivery</span>
                      </div>
                    </div>
                  </div>
                </m.article>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-neutral-100">
              <p className="text-neutral-500 font-semibold text-lg">No restaurants match your filters.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setVegFilter("all");
                  setRatingFilter(false);
                  setSortBy("default");
                }}
                className="mt-4 px-6 py-2.5 bg-orange-600 text-white rounded-xl text-xs font-bold hover:bg-orange-700 transition cursor-pointer min-h-[40px] focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none"
              >
                Reset Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
