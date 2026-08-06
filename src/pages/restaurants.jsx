import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { m } from "framer-motion";
import { SearchComponent } from "@/components";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

export default function RestaurantsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [restaurants, setRestaurants] = useState([]);
  const [deals, setDeals] = useState([]);
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters and sorting states
  const [vegFilter, setVegFilter] = useState("all"); // "all", "veg"
  const [ratingFilter, setRatingFilter] = useState(false); // true/false for 4.0+
  const [sortBy, setSortBy] = useState("default"); // "default", "time", "cost", "rating"

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "restaurants"));
        const rests = querySnapshot.docs.map(doc => doc.data());
        setRestaurants(rests);

        const dealsSnapshot = await getDocs(collection(db, "deals"));
        const dealsList = dealsSnapshot.docs.map(doc => doc.data());
        setDeals(dealsList);

        const menusSnapshot = await getDocs(collection(db, "menus"));
        const menusList = menusSnapshot.docs.map(doc => doc.data());
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
      restaurant.menu.includes(item.id)
    );
    const hasVegItems = restaurantMenu.some((item) => item.veg);
    const hasNonVegItems = restaurantMenu.some((item) => !item.veg);
    if (hasVegItems && !hasNonVegItems) return "veg";
    if (hasNonVegItems && !hasVegItems) return "nonveg";
    return "both";
  };

  const getMinDeliveryTime = (timeStr) => {
    const match = timeStr.match(/^(\d+)/);
    return match ? parseInt(match[1], 10) : 999;
  };

  const filteredAndSortedRestaurants = restaurants
    .filter((restaurant) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = (
        restaurant.name.toLowerCase().includes(searchLower) ||
        restaurant.cuisines.some(cuisine => cuisine.toLowerCase().includes(searchLower)) ||
        restaurant.location.toLowerCase().includes(searchLower) ||
        restaurant.description.toLowerCase().includes(searchLower)
      );

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
        if (restaurant.rating < 4.0) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "rating") {
        return b.rating - a.rating;
      }
      if (sortBy === "cost") {
        return a.deliveryFee - b.deliveryFee;
      }
      if (sortBy === "time") {
        return getMinDeliveryTime(a.deliveryTime) - getMinDeliveryTime(b.deliveryTime);
      }
      return 0;
    });

  const handleSearch = (item, type) => {
    if (type === "restaurants") {
      navigate(`/restaurant/${item.id}`);
    } else if (typeof item === "string") {
      setSearchQuery(item);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFBF7] py-12 px-4 md:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <m.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-left"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-neutral-900 tracking-tight mb-3">
            Order from Top Restaurants
          </h1>
          <p className="text-neutral-500 text-base md:text-lg">
            Discover the best restaurants and cuisines near you
          </p>
        </m.div>

        {/* Search */}
        <div className="mb-8">
          <SearchComponent onSearch={handleSearch} />
        </div>

        {/* Filters and Sorting Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-10 pb-4 border-b border-neutral-100">
          {/* Veg Filter Toggle */}
          <button
            type="button"
            onClick={() => setVegFilter(prev => prev === "veg" ? "all" : "veg")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 border flex items-center gap-1.5 cursor-pointer ${vegFilter === "veg"
              ? "bg-green-50 text-green-700 border-green-300 shadow-2xs ring-2 ring-green-100"
              : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
              }`}
          >
            <span className="w-3.5 h-3.5 border border-green-600 rounded-xs flex items-center justify-center bg-white shrink-0">
              <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
            </span>
            <span>Pure Veg</span>
          </button>

          {/* Non-Veg Filter Toggle */}
          <button
            type="button"
            onClick={() => setVegFilter(prev => prev === "nonveg" ? "all" : "nonveg")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 border flex items-center gap-1.5 cursor-pointer ${vegFilter === "nonveg"
              ? "bg-red-50 text-red-700 border-red-300 shadow-2xs ring-2 ring-red-100"
              : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
              }`}
          >
            <span className="w-3.5 h-3.5 border border-red-600 rounded-xs flex items-center justify-center bg-white shrink-0">
              <span className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[6px] border-b-red-600"></span>
            </span>
            <span>Non-Veg</span>
          </button>

          {/* Rating 4.0+ Filter Toggle */}
          <button
            type="button"
            onClick={() => setRatingFilter(prev => !prev)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 border flex items-center gap-1.5 cursor-pointer ${ratingFilter
              ? "bg-orange-50 text-orange-700 border-orange-200 shadow-2xs"
              : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
              }`}
          >
            ⭐ Rating 4.0+
          </button>

          {/* Divider */}
          <span className="h-6 w-[1px] bg-neutral-200 mx-1 hidden sm:inline-block"></span>

          {/* Sort Options */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider mr-1 hidden sm:inline-block">Sort by:</span>

            {/* Default/Relevance */}
            <button
              type="button"
              onClick={() => setSortBy("default")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border cursor-pointer ${sortBy === "default"
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
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border cursor-pointer ${sortBy === "rating"
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
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border cursor-pointer ${sortBy === "time"
                ? "bg-neutral-900 text-white border-neutral-900"
                : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
                }`}
            >
              Delivery Time
            </button>

            {/* Delivery Cost */}
            <button
              type="button"
              onClick={() => setSortBy("cost")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border cursor-pointer ${sortBy === "cost"
                ? "bg-neutral-900 text-white border-neutral-900"
                : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
                }`}
            >
              Cost: Low to High
            </button>
          </div>
        </div>

        {/* Deals Section */}
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-14"
        >
          <div className="flex items-center gap-2 mb-6">
            <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581a1.44 1.44 0 002.036 0l4.318-4.318a1.44 1.44 0 000-2.036L10.01 3.659A2.25 2.25 0 008.318 3h-1.25" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 7.5h.007v.008H6V7.5z" />
            </svg>
            <h2 className="text-2xl font-extrabold text-neutral-900 tracking-tight">Special Deals</h2>
          </div>
          {loading ? (
            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory">
              {[1, 2, 3].map((n) => (
                <div key={n} className="shrink-0 w-[280px] md:w-[350px] h-[160px] bg-neutral-200/60 animate-pulse rounded-2xl"></div>
              ))}
            </div>
          ) : (
            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory">
              {deals.map(deal => (
                <m.div
                  key={deal.id}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="shrink-0 w-[280px] md:w-[350px] snap-start bg-linear-to-br from-orange-500 to-red-600 rounded-2xl p-5 text-white shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <h3 className="font-extrabold text-lg mb-1.5 tracking-tight">{deal.title}</h3>
                  <p className="text-xs text-orange-50 mb-4 font-medium leading-relaxed opacity-90">{deal.description}</p>
                  <div className="flex justify-between items-end border-t border-white/10 pt-3">
                    <span className="text-2xl font-black tracking-tight">{deal.discount}% OFF</span>
                    <span className="text-[10px] opacity-75 font-semibold bg-white/10 px-2.5 py-1 rounded-full">Till {deal.validTill}</span>
                  </div>
                </m.div>
              ))}
            </div>
          )}
        </m.div>

        {/* Restaurants Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-neutral-100 overflow-hidden h-[360px] animate-pulse">
                <div className="h-48 bg-neutral-200/60"></div>
                <div className="p-5">
                  <div className="h-5 bg-neutral-200/60 rounded-sm w-3/4 mb-3"></div>
                  <div className="h-4 bg-neutral-200/60 rounded-sm w-1/2 mb-4"></div>
                  <div className="h-8 bg-neutral-200/40 rounded-sm mt-4"></div>
                </div>
              </div>
            ))
          ) : filteredAndSortedRestaurants.length > 0 ? (
            filteredAndSortedRestaurants.map((restaurant, index) => {
              const vegStatus = getRestaurantVegStatus(restaurant);
              return (
                <m.div
                  key={restaurant.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                  className="group bg-white rounded-2xl border border-neutral-100 overflow-hidden hover:shadow-xl hover:border-orange-500/20 hover:shadow-orange-500/3 transition-all duration-300 cursor-pointer transform hover:-translate-y-1.5"
                >
                  {/* Image */}
                  <div className="relative overflow-hidden h-48 bg-neutral-100">
                    <img
                      src={restaurant.image}
                      alt={restaurant.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-lg font-extrabold text-neutral-900 mb-2.5 tracking-tight group-hover:text-orange-600 transition-colors duration-300">
                      {restaurant.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                      <span className="flex items-center gap-1 text-amber-500 font-bold text-xs bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100/50">
                        <svg className="w-3.5 h-3.5 fill-amber-500" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {restaurant.rating}
                      </span>

                      {/* Veg/Non-Veg Badge */}
                      {vegStatus === "veg" && (
                        <span className="flex items-center gap-1 text-green-700 font-bold text-xs bg-green-50 px-2 py-0.5 rounded-md border border-green-200/50 shrink-0">
                          <span className="w-3.5 h-3.5 border border-green-600 rounded-xs flex items-center justify-center bg-white shrink-0">
                            <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                          </span>
                          Pure Veg
                        </span>
                      )}
                      {vegStatus === "nonveg" && (
                        <span className="flex items-center gap-1 text-red-700 font-bold text-xs bg-red-50 px-2 py-0.5 rounded-md border border-red-200/50 shrink-0">
                          <span className="w-3.5 h-3.5 border border-red-600 rounded-xs flex items-center justify-center bg-white shrink-0">
                            <span className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[6px] border-b-red-600"></span>
                          </span>
                          Non-Veg
                        </span>
                      )}
                      {vegStatus === "both" && (
                        <span className="flex items-center gap-1 text-neutral-600 font-bold text-xs bg-neutral-50 px-2 py-0.5 rounded-md border border-neutral-200/50 shrink-0">
                          <span className="flex gap-0.5">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                          </span>
                          Veg & Non-Veg
                        </span>
                      )}

                      <span className="text-neutral-400 text-xs font-semibold hidden sm:inline">•</span>
                      <div className="flex flex-wrap gap-1 items-center">
                        {restaurant.cuisines.map((cuisine) => (
                          <button
                            key={cuisine}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSearchQuery(cuisine);
                            }}
                            className="px-2 py-0.5 rounded-md bg-neutral-50 hover:bg-orange-50 hover:text-orange-600 text-neutral-500 text-[10px] font-bold border border-neutral-200/40 hover:border-orange-200 transition-all cursor-pointer"
                          >
                            {cuisine}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between text-xs font-semibold text-neutral-500 mb-3 pt-2.5 border-t border-neutral-50">
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <rect x="1" y="3" width="14" height="12" rx="2" />
                          <polygon points="15,7 19,7 22,10 22,15 15,15" />
                          <circle cx="5" cy="18" r="2" />
                          <circle cx="17" cy="18" r="2" />
                        </svg>
                        ₹{restaurant.deliveryFee} delivery
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 15 13.5" />
                        </svg>
                        {restaurant.deliveryTime}
                      </span>
                    </div>

                    {!restaurant.isOpen && (
                      <div className="bg-red-50 text-red-600 px-3 py-2 rounded-xl text-xs font-bold text-center mt-3 border border-red-100/50">
                        Currently Closed
                      </div>
                    )}
                  </div>
                </m.div>
              );
            })
          ) : (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full text-center py-16"
            >
              <p className="text-xl text-neutral-600 font-extrabold mb-4">
                No restaurants match the search/filter criteria.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setVegFilter("all");
                  setRatingFilter(false);
                  setSortBy("default");
                }}
                className="px-6 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition shadow-sm cursor-pointer"
              >
                Clear All Filters
              </button>
            </m.div>
          )}
        </div>
      </div>
    </div>
  );
}
