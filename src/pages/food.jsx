import React, { useState, useEffect, useMemo } from "react";
import { m } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart, useDebounce, useMenusQuery, useRestaurantsQuery } from "../hooks";
import { OptimizedImage } from "../components/ui";

export default function Food() {
  const { addItem: addToCartAction, cartItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [addedItems, setAddedItems] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(() => location.state?.category || "All");
  const [prevCategoryState, setPrevCategoryState] = useState(location.state?.category);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: menu = [], isLoading: isMenuLoading } = useMenusQuery();
  const { data: restaurants = [], isLoading: isRestaurantsLoading } = useRestaurantsQuery();
  const loading = isMenuLoading || isRestaurantsLoading;

  const debouncedSearch = useDebounce(searchQuery, 250);

  if (location.state?.category !== prevCategoryState) {
    setPrevCategoryState(location.state?.category);
    setSelectedCategory(location.state?.category || "All");
  }

  const categories = useMemo(() => ["All", ...new Set(menu.map((item) => item.category))], [menu]);

  const filteredMenu = useMemo(() => {
    return menu.filter((item) => {
      const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
      const matchesSearch = item.name?.toLowerCase().includes(debouncedSearch.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [menu, selectedCategory, debouncedSearch]);

  const getRestaurantForItem = (itemId) => {
    return restaurants.find((restaurant) => restaurant.menu?.includes(itemId));
  };

  const handleImageClick = (itemId) => {
    const restaurant = getRestaurantForItem(itemId);
    if (restaurant) {
      navigate(`/restaurant/${restaurant.id}`);
    }
  };

  const handleAddToCart = (item) => {
    const existingItem = cartItems.find((i) => i.id === item.id);
    const restaurant = getRestaurantForItem(item.id);

    if (!addedItems[item.id]) {
      const targetQty = existingItem ? (existingItem.qty || 1) + 1 : 1;
      addToCartAction({
        ...item,
        restaurantName: restaurant?.name,
        restaurantId: restaurant?.id,
      }, targetQty);

      setAddedItems((prev) => ({ ...prev, [item.id]: true }));
      setTimeout(() => {
        setAddedItems((prev) => ({ ...prev, [item.id]: false }));
      }, 1500);
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
    <div className="min-h-screen bg-[#FCFBF7] text-neutral-800 flex flex-col font-sans py-12 px-4 md:px-8">
      <header className="text-center px-6 mb-12">
        <m.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-extrabold text-neutral-900 tracking-tight mb-3"
        >
          Explore Our Delicious Menu
        </m.h1>
        <m.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-neutral-500 text-base md:text-lg max-w-2xl mx-auto"
        >
          Choose from our handpicked selection of mouth-watering dishes
        </m.p>
      </header>

      <section aria-label="Search Dishes" className="max-w-2xl mx-auto px-6 mb-10 w-full">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400">
            <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            role="searchbox"
            aria-label="Search for dishes"
            placeholder="Search for dishes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-6 py-4 pl-12 bg-white border border-neutral-200 rounded-2xl shadow-xs focus:outline-hidden focus:border-orange-500 transition-all duration-300 focus:ring-4 focus:ring-orange-500/10 text-neutral-800 placeholder-neutral-400 font-semibold focus-visible:outline-orange-500"
          />

          {searchQuery && (
            <m.button
              type="button"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => setSearchQuery("")}
              aria-label="Clear search text"
              className="absolute right-4 top-4.5 min-w-[36px] min-h-[36px] flex items-center justify-center text-neutral-400 hover:text-neutral-600 transition focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none"
            >
              <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </m.button>
          )}
        </div>

        {searchQuery && (
          <m.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-orange-600 font-bold mt-2 px-2"
          >
            Found {filteredMenu.length} result{filteredMenu.length !== 1 ? "s" : ""} for "{searchQuery}"
          </m.p>
        )}
      </section>

      <nav aria-label="Category Filters" className="flex flex-wrap justify-center gap-3 px-6 pb-12 w-full">
        {categories.map((category) => (
          <m.button
            key={category}
            type="button"
            onClick={() => setSelectedCategory(category)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-pressed={selectedCategory === category}
            className={`px-6 py-2.5 rounded-full text-sm font-extrabold transition-all duration-300 cursor-pointer border min-h-[44px] focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none ${selectedCategory === category
                ? "bg-orange-50 text-orange-600 border-orange-100 shadow-2xs"
                : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
              }`}
          >
            {category}
          </m.button>
        ))}
      </nav>

      <section aria-label="Food Menu Items" className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMenu.map((item) => (
            <m.article
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -6 }}
              className="relative"
            >
              <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden h-full flex flex-col hover:shadow-xl transition-all duration-500">
                <div
                  className="relative bg-neutral-50 overflow-hidden h-40 cursor-pointer group"
                  onClick={() => handleImageClick(item.id)}
                  tabIndex={0}
                  role="button"
                  aria-label={`View restaurant serving ${item.name}`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleImageClick(item.id);
                    }
                  }}
                >
                  <OptimizedImage
                    src={item.img}
                    alt={item.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    aspectRatio="h-full"
                  />
                  {item.badge && (
                    <span className="absolute top-3 left-3 bg-orange-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-xs">
                      {item.badge}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-neutral-950 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
                </div>

                <div className="flex-1 p-5 flex flex-col">
                  <span className="text-[10px] text-orange-600 uppercase tracking-wider font-extrabold mb-1">
                    {item.category}
                  </span>

                  <h2 className="text-base font-extrabold text-neutral-900 mb-1 line-clamp-1 tracking-tight">
                    {item.name}
                  </h2>

                  {item.desc && (
                    <p className="text-xs text-neutral-500 line-clamp-2 mb-2 leading-relaxed">
                      {item.desc}
                    </p>
                  )}

                  <div className="mb-3 flex items-center justify-between">
                    {item.veg ? (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-50 border border-green-200/50 px-2 py-0.5 rounded-md w-fit">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" aria-hidden="true"></span>
                        Veg
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-50 border border-red-200/50 px-2 py-0.5 rounded-md w-fit">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" aria-hidden="true"></span>
                        Non-Veg
                      </span>
                    )}

                    {item.time && (
                      <span className="text-xs text-neutral-500 font-medium flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                        {item.time}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 mb-4">
                    <span className="text-amber-400 text-xs" aria-hidden="true">★</span>
                    <span className="text-xs font-bold text-neutral-700">{item.rating || "4.5"}</span>
                    <span className="text-xs text-neutral-400 font-medium">({item.reviews || "120+"})</span>
                  </div>

                  <div className="mt-auto pt-3 border-t border-neutral-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-neutral-400 block font-medium">Price</span>
                      <span className="text-lg font-black text-neutral-900">₹{item.price}</span>
                    </div>

                    <m.button
                      type="button"
                      onClick={() => handleAddToCart(item)}
                      disabled={addedItems[item.id]}
                      aria-label={`Add ${item.name} to cart`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all duration-300 flex items-center gap-1.5 shadow-xs cursor-pointer min-h-[40px] focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none ${addedItems[item.id]
                          ? "bg-green-600 text-white"
                          : "bg-orange-600 hover:bg-orange-700 text-white"
                        }`}
                    >
                      {addedItems[item.id] ? (
                        <>
                          <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          Added!
                        </>
                      ) : (
                        "Add to Cart"
                      )}
                    </m.button>
                  </div>
                </div>
              </div>
            </m.article>
          ))}
        </div>
      </section>
    </div>
  );
}