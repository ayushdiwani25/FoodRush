import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { m } from "framer-motion";
import { addFavoriteRestaurant, addToCart, clearCart } from "@/redux";
import { db } from "../firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";

export default function RestaurantDetailsPage() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart || []);

  const [restaurant, setRestaurant] = useState(null);
  const [restaurantMenu, setRestaurantMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [vegFilter, setVegFilter] = useState("all");
  const [addedItems, setAddedItems] = useState({});
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [pendingItem, setPendingItem] = useState(null);

  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        setLoading(true);
        const docRef = doc(db, "restaurants", restaurantId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const restData = docSnap.data();
          setRestaurant(restData);

          const menuSnapshot = await getDocs(collection(db, "menus"));
          const allMenus = menuSnapshot.docs.map(d => d.data());
          const matchedMenu = allMenus.filter(item => restData.menu.includes(item.id));
          setRestaurantMenu(matchedMenu);
        }
      } catch (err) {
        console.error("Error fetching restaurant details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurantData();
  }, [restaurantId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-orange-500"></div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Restaurant not found</p>
      </div>
    );
  }

  const uniqueCategories = ["All", ...new Set(restaurantMenu.map(item => item.category))];
  const filteredMenu = restaurantMenu
    .filter(item => selectedCategory === "All" || item.category === selectedCategory)
    .filter(item => {
      if (vegFilter === "veg") return item.veg === true;
      if (vegFilter === "nonveg") return item.veg === false;
      return true;
    });

  const handleAddToCart = (item) => {
    const activeRestaurantId = cartItems.length > 0 ? cartItems[0].restaurantId : null;

    if (activeRestaurantId && activeRestaurantId !== restaurant.id) {
      setPendingItem(item);
      setShowReplaceModal(true);
      return;
    }

    const existingItem = cartItems.find((i) => i.id === item.id);

    if (!addedItems[item.id]) {
      if (existingItem) {
        dispatch(addToCart({ ...item, restaurantName: restaurant.name, restaurantId: restaurant.id, qty: existingItem.qty + 1 }));
      } else {
        dispatch(addToCart({ ...item, restaurantName: restaurant.name, restaurantId: restaurant.id, qty: 1 }));
      }

      setAddedItems(prev => ({ ...prev, [item.id]: true }));
      setTimeout(() => {
        setAddedItems(prev => ({ ...prev, [item.id]: false }));
      }, 1500);
    }
  };

  const handleReplaceCart = () => {
    if (pendingItem) {
      dispatch(clearCart());
      dispatch(addToCart({ ...pendingItem, restaurantName: restaurant.name, restaurantId: restaurant.id, qty: 1 }));

      setAddedItems(prev => ({ ...prev, [pendingItem.id]: true }));
      setTimeout(() => {
        setAddedItems(prev => ({ ...prev, [pendingItem.id]: false }));
      }, 1500);
    }
    setShowReplaceModal(false);
    setPendingItem(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative h-64 md:h-96 overflow-hidden bg-gray-200">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30"></div>

        <button
          type="button"
          onClick={() => navigate("/restaurants")}
          className="absolute top-4 left-4 bg-white text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100"
        >
          ← Back
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-20 mb-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                {restaurant.name}
              </h1>
              <p className="text-gray-600 text-lg mb-4">
                {restaurant.cuisines.join(" • ")}
              </p>
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⭐</span>
                  <div>
                    <p className="font-bold text-lg text-gray-800">
                      {restaurant.rating}
                    </p>
                    <p className="text-sm text-gray-600">Rating</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🚚</span>
                  <div>
                    <p className="font-bold text-lg text-gray-800">
                      ₹{restaurant.deliveryFee}
                    </p>
                    <p className="text-sm text-gray-600">Delivery Fee</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⏱️</span>
                  <div>
                    <p className="font-bold text-lg text-gray-800">
                      {restaurant.deliveryTime}
                    </p>
                    <p className="text-sm text-gray-600">Delivery Time</p>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsFavorite(!isFavorite);
                dispatch(addFavoriteRestaurant(restaurant));
              }}
              className={`px-6 py-3 rounded-lg font-semibold transition ${isFavorite
                  ? "bg-red-100 text-red-600 border-2 border-red-600"
                  : "bg-gray-100 text-gray-600 border-2 border-gray-300"
                }`}
            >
              {isFavorite ? "❤️ Saved" : "🤍 Save"}
            </button>
          </div>

          {restaurant.offers && (
            <div className="mt-6 bg-linear-to-r from-orange-100 to-red-100 border-2 border-orange-300 rounded-lg p-4">
              <p className="text-orange-800 font-semibold">{restaurant.offers}</p>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mb-8">
        <div className="sticky top-0 z-20 bg-gray-50/95 backdrop-blur-xs py-4 border-b border-gray-200 mb-8">
          <div className="mb-4 overflow-x-auto">
            <div className="flex gap-3 pb-2">
              {uniqueCategories.map(category => (
                <button
                  type="button"
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-3 rounded-full font-semibold whitespace-nowrap transition ${selectedCategory === category
                    ? "bg-orange-500 text-white"
                    : "bg-white text-gray-700 border-2 border-gray-300 hover:border-orange-500"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setVegFilter("all")}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 border flex items-center gap-1.5 cursor-pointer ${vegFilter === "all"
                ? "bg-neutral-900 text-white border-neutral-900 shadow-2xs"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              <span>All Dishes</span>
            </button>

            <button
              type="button"
              onClick={() => setVegFilter("veg")}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 border flex items-center gap-1.5 cursor-pointer ${vegFilter === "veg"
                ? "bg-green-50 text-green-700 border-green-300 shadow-2xs ring-2 ring-green-100"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              <span className="w-3.5 h-3.5 border border-green-600 rounded-xs flex items-center justify-center bg-white shrink-0">
                <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
              </span>
              <span>Veg Only</span>
            </button>

            <button
              type="button"
              onClick={() => setVegFilter("nonveg")}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 border flex items-center gap-1.5 cursor-pointer ${vegFilter === "nonveg"
                ? "bg-red-50 text-red-700 border-red-300 shadow-2xs ring-2 ring-red-100"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              <span className="w-3.5 h-3.5 border border-red-600 rounded-xs flex items-center justify-center bg-white shrink-0">
                <span className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[6px] border-b-red-600"></span>
              </span>
              <span>Non-Veg Only</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMenu.map((item, index) => (
            <m.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition"
            >
              <div className="relative h-40 bg-gray-200 overflow-hidden">
                <img
                  src={item.img}
                  alt={item.name}
                  className="w-full h-full object-cover hover:scale-110 transition"
                />
                {item.badge && (
                  <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                    {item.badge}
                  </div>
                )}
                {item.veg ? (
                  <div className="absolute top-3 left-3 w-6 h-6 border-2 border-green-600 rounded flex items-center justify-center bg-white">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                ) : (
                  <div className="absolute top-3 left-3 w-6 h-6 border-2 border-red-600 rounded flex items-center justify-center bg-white">
                    <div className="w-2 h-2 bg-red-600"></div>
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-800 mb-1">
                  {item.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {item.desc}
                </p>

                <div className="flex justify-between items-center mb-3">
                  <span className="text-2xl font-bold text-orange-500">
                    ₹{item.price}
                  </span>
                  <span className="flex items-center text-yellow-500 font-semibold">
                    ⭐ {item.rating}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleAddToCart(item)}
                  disabled={addedItems[item.id]}
                  className={`w-full px-4 py-3 rounded-lg font-semibold transition ${addedItems[item.id]
                      ? "bg-gray-400 cursor-not-allowed text-gray-200"
                      : "bg-orange-500 text-white hover:bg-orange-600"
                    }`}
                >
                  {addedItems[item.id] ? "Added!" : "Add to Cart"}
                </button>
              </div>
            </m.div>
          ))}
        </div>
      </div>

      {showReplaceModal && pendingItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <m.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                ⚠️ Replace cart items?
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Your cart contains dishes from <span className="font-semibold text-gray-800">{cartItems[0]?.restaurantName}</span>. Discard these items and start a new order from <span className="font-semibold text-gray-800">{restaurant.name}</span>?
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowReplaceModal(false);
                    setPendingItem(null);
                  }}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReplaceCart}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-650 text-white font-bold rounded-xl shadow-md transition"
                >
                  Discard & Add
                </button>
              </div>
            </div>
          </m.div>
        </div>
      )}
    </div>
  );
}
