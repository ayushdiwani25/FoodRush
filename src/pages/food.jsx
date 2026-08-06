import { useSelector, useDispatch } from "react-redux";
import { addToCart } from "@/redux";
import { m } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

export default function Food() {
  const cartItems = useSelector((state) => state.cart || []);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [addedItems, setAddedItems] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(() => location.state?.category || "All");
  const [prevCategoryState, setPrevCategoryState] = useState(location.state?.category);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [menu, setMenu] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  if (location.state?.category !== prevCategoryState) {
    setPrevCategoryState(location.state?.category);
    setSelectedCategory(location.state?.category || "All");
  }

  // Load menu and restaurants from Firestore
  useEffect(() => {
    const fetchCatalogData = async () => {
      try {
        setLoading(true);
        const menuSnap = await getDocs(collection(db, "menus"));
        const menuList = menuSnap.docs.map(doc => doc.data());
        setMenu(menuList);

        const restSnap = await getDocs(collection(db, "restaurants"));
        const restList = restSnap.docs.map(doc => doc.data());
        setRestaurants(restList);
      } catch (err) {
        console.error("Error fetching menu or restaurants from Firestore:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalogData();
  }, []);

  // Debounce search input to avoid filtering on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const categories = ["All", ...new Set(menu.map((item) => item.category))];

  const filteredMenu = menu.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(debouncedSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Get restaurant for an item
  const getRestaurantForItem = (itemId) => {
    return restaurants.find(restaurant => restaurant.menu.includes(itemId));
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

    // Only allow adding once per click session, prevent spamming
    if (!addedItems[item.id]) {
      if (existingItem) {
        dispatch(addToCart({ ...item, restaurantName: restaurant?.name, restaurantId: restaurant?.id, qty: existingItem.qty + 1 }));
      } else {
        dispatch(addToCart({ ...item, restaurantName: restaurant?.name, restaurantId: restaurant?.id, qty: 1 }));
      }

      // Show animation feedback & lock button temporarily
      setAddedItems(prev => ({ ...prev, [item.id]: true }));
      setTimeout(() => {
        setAddedItems(prev => ({ ...prev, [item.id]: false }));
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
      {/* Header */}
      <m.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center px-6 mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-neutral-900 tracking-tight mb-3">
          Explore Our Delicious Menu
        </h1>
        <p className="text-neutral-500 text-base md:text-lg max-w-2xl mx-auto">
          Choose from our handpicked selection of mouth-watering dishes
        </p>
      </m.div>

      {/* Search Bar */}
      <m.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="max-w-2xl mx-auto px-6 mb-10 w-full"
      >
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search for dishes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-6 py-4 pl-12 bg-white border border-neutral-200 rounded-2xl shadow-xs focus:outline-hidden focus:border-orange-500 transition-all duration-300 focus:ring-4 focus:ring-orange-500/10 text-neutral-800 placeholder-neutral-400 font-semibold"
          />
          
          {searchQuery && (
            <m.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-4.5 text-neutral-400 hover:text-neutral-600 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
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
      </m.div>

      {/* Category Filter */}
      <m.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex flex-wrap justify-center gap-3 px-6 pb-12 w-full"
      >
        {categories.map((category) => (
          <m.button
            key={category}
            onClick={() => setSelectedCategory(category)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-6 py-2.5 rounded-full text-sm font-extrabold transition-all duration-300 cursor-pointer border ${
              selectedCategory === category
                ? "bg-orange-50 text-orange-600 border-orange-100 shadow-2xs"
                : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
            }`}
          >
            {category}
          </m.button>
        ))}
      </m.div>

      {/* Menu Grid */}
      <m.div
        className="container mx-auto px-4 pb-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMenu.map((item) => (
            <m.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -6 }}
              className="relative"
            >
              {/* Card Container */}
              <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden h-full flex flex-col hover:shadow-xl transition-all duration-500">

                {/* Image Section */}
                <div className="relative bg-neutral-50 overflow-hidden h-40 flex items-center justify-center cursor-pointer group" onClick={() => handleImageClick(item.id)}>
                  <m.div
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="h-full w-full flex items-center justify-center"
                  >
                    <img
                      src={item.img}
                      alt={item.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </m.div>
                  <div className="absolute inset-0 bg-neutral-950 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                </div>

                {/* Content Section */}
                <div className="flex-1 p-5 flex flex-col">
                  {/* Category Badge */}
                  <span className="text-[10px] text-orange-600 uppercase tracking-wider font-extrabold mb-1">
                    {item.category}
                  </span>

                  {/* Item Name */}
                  <h2 className="text-base font-extrabold text-neutral-900 mb-1.5 line-clamp-1 tracking-tight">
                    {item.name}
                  </h2>

                  {/* Veg/NonVeg */}
                  <div className="mb-3">
                    {item.veg ? (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-50 border border-green-200/50 px-2 py-0.5 rounded-md w-fit">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        Veg
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-50 border border-red-200/50 px-2 py-0.5 rounded-md w-fit">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        Non-Veg
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-neutral-500 text-xs mb-4 line-clamp-2 grow leading-relaxed">
                    {item.desc}
                  </p>

                  {/* Rating & Time */}
                  <div className="flex justify-between items-center mb-4 py-2.5 border-t border-neutral-50 text-xs font-semibold">
                    <span className="flex items-center gap-1 text-amber-500 bg-amber-50 border border-amber-100/50 px-2 py-0.5 rounded-md">
                      <svg className="w-3 h-3 fill-amber-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {item.rating}
                    </span>
                    <span className="flex items-center gap-1 text-neutral-400">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 15 13.5" />
                      </svg>
                      {item.time}
                    </span>
                  </div>

                  {/* Price & Add to Cart Button */}
                  <div className="flex items-center justify-between gap-3 mt-auto">
                    <span className="text-xl font-black tracking-tight text-neutral-900">
                      ₹{item.price}
                    </span>

                    <m.button
                      onClick={() => handleAddToCart(item)}
                      whileHover={addedItems[item.id] ? {} : { scale: 1.02 }}
                      whileTap={addedItems[item.id] ? {} : { scale: 0.98 }}
                      disabled={addedItems[item.id]}
                      className={`px-4 py-2 font-extrabold rounded-xl shadow-xs transition-all duration-300 flex items-center justify-center gap-1.5 text-xs cursor-pointer ${
                        addedItems[item.id]
                          ? "bg-neutral-200 text-neutral-400 cursor-not-allowed shadow-none"
                          : "bg-orange-600 hover:bg-orange-700 text-white shadow-sm"
                      }`}
                    >
                      {addedItems[item.id] ? (
                        <>
                          <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Added!</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                          <span>Add</span>
                        </>
                      )}
                    </m.button>
                  </div>
                </div>
              </div>
            </m.div>
          ))}
        </div>
      </m.div>

      {/* Empty State */}
      {filteredMenu.length === 0 && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <p className="text-xl text-neutral-600 font-extrabold mb-4">
            {searchQuery ? `No items found for "${searchQuery}"` : "No items found in this category"}
          </p>
          <m.button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All");
            }}
            whileHover={{ scale: 1.05 }}
            className="px-6 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition shadow-sm cursor-pointer"
          >
            Clear Filters
          </m.button>
        </m.div>
      )}
    </div>
  );
}