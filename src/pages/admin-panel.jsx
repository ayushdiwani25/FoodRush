import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { m } from "framer-motion";
import { setCurrentRestaurant, loadRestaurantItems, addItem, updateItem, deleteItem } from "@/redux";
import { db } from "../firebase";
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";

export default function RestaurantAdminPanel() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoggedIn } = useSelector(state => state.user);
  const { items } = useSelector(state => state.restaurant);

  const [restaurantsList, setRestaurantsList] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [itemsLoading, setItemsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    desc: "",
    price: "",
    category: "Pizza",
    veg: true,
    badge: ""
  });

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  const loadItemsForRestaurant = useCallback(async (restaurant, allMenusList = null) => {
    setItemsLoading(true);
    try {
      let allMenus = allMenusList;
      if (!allMenus) {
        const menuSnap = await getDocs(collection(db, "menus"));
        allMenus = menuSnap.docs.map(doc => doc.data());
      }
      
      const menuItems = allMenus.filter(item => restaurant.menu.includes(item.id));
      dispatch(loadRestaurantItems(menuItems));
    } catch (err) {
      console.error("Error loading restaurant items from Firestore:", err);
    } finally {
      setItemsLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "restaurants"));
        const rests = querySnapshot.docs.map(doc => doc.data());
        setRestaurantsList(rests);

        if (rests.length > 0) {
          const firstRestaurant = rests[0];
          setSelectedRestaurant(firstRestaurant);
          dispatch(setCurrentRestaurant(firstRestaurant));
          
          const menuSnap = await getDocs(collection(db, "menus"));
          const allMenus = menuSnap.docs.map(doc => doc.data());
          loadItemsForRestaurant(firstRestaurant, allMenus);
        }
      } catch (err) {
        console.error("Error loading restaurants in admin panel:", err);
      }
    };
    fetchRestaurants();
  }, [dispatch, loadItemsForRestaurant]);

  const handleSelectRestaurant = async (restaurant) => {
    setSelectedRestaurant(restaurant);
    dispatch(setCurrentRestaurant(restaurant));
    await loadItemsForRestaurant(restaurant);
    setEditingItem(null);
    setShowAddForm(false);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.category) {
      alert("Please fill required fields");
      return;
    }

    if (editingItem) {
      const updatedItem = {
        ...editingItem,
        ...formData,
        price: Number(formData.price),
        updatedAt: new Date().toISOString()
      };

      try {
        const itemDocRef = doc(db, "menus", editingItem.id.toString());
        await setDoc(itemDocRef, updatedItem, { merge: true });
        dispatch(updateItem(updatedItem));
      } catch (err) {
        console.error("Error updating item in Firestore:", err);
      }
      setEditingItem(null);
    } else {
      try {
        const menusRef = collection(db, "menus");
        const newDocRef = doc(menusRef); // Auto doc ID
        const newItem = {
          id: newDocRef.id,
          ...formData,
          price: Number(formData.price),
          restaurantId: selectedRestaurant?.id,
          isCustom: true,
          createdAt: new Date().toISOString()
        };
        await setDoc(newDocRef, newItem);

        const restDocRef = doc(db, "restaurants", selectedRestaurant.id.toString());
        const updatedMenu = [...selectedRestaurant.menu, newItem.id];
        await updateDoc(restDocRef, {
          menu: updatedMenu
        });

        dispatch(addItem(newItem));
        
        const updatedRest = { ...selectedRestaurant, menu: updatedMenu };
        setSelectedRestaurant(updatedRest);
        dispatch(setCurrentRestaurant(updatedRest));
      } catch (err) {
        console.error("Error adding new item to Firestore:", err);
      }
    }

    setFormData({
      name: "",
      desc: "",
      price: "",
      category: "Pizza",
      veg: true,
      badge: ""
    });
    setShowAddForm(false);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      desc: item.desc,
      price: item.price,
      category: item.category,
      veg: item.veg,
      badge: item.badge || ""
    });
    setShowAddForm(true);
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        const itemDocRef = doc(db, "menus", itemId.toString());
        await deleteDoc(itemDocRef);

        const restDocRef = doc(db, "restaurants", selectedRestaurant.id.toString());
        const updatedMenu = selectedRestaurant.menu.filter(id => id !== itemId);
        await updateDoc(restDocRef, {
          menu: updatedMenu
        });

        dispatch(deleteItem(itemId));

        const updatedRest = { ...selectedRestaurant, menu: updatedMenu };
        setSelectedRestaurant(updatedRest);
        dispatch(setCurrentRestaurant(updatedRest));
      } catch (err) {
        console.error("Error deleting item from Firestore:", err);
      }
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingItem(null);
    setFormData({
      name: "",
      desc: "",
      price: "",
      category: "Pizza",
      veg: true,
      badge: ""
    });
  };

  const isMenuItemFromData = (item) => {
    return selectedRestaurant && selectedRestaurant.menu.includes(item.id);
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "All" || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["All", ...new Set(items.map(item => item.category))];

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4">
        <m.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Restaurant Admin Panel</h1>
          <p className="text-gray-600">Manage your restaurant menu items</p>
        </m.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md p-4 h-fit">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Your Restaurants</h2>
            <div className="space-y-2">
              {restaurantsList.map(restaurant => (
                <button
                  type="button"
                  key={restaurant.id}
                  onClick={() => handleSelectRestaurant(restaurant)}
                  className={`w-full text-left p-3 rounded-lg transition font-medium ${
                    selectedRestaurant?.id === restaurant.id
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  {restaurant.name}
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3">
            {selectedRestaurant ? (
              <>
                <m.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-lg shadow-md p-6 mb-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-800 mb-2">
                        {selectedRestaurant.name}
                      </h2>
                      <p className="text-gray-600 mb-2">{selectedRestaurant.location}</p>
                      <p className="text-gray-600">{selectedRestaurant.cuisines.join(", ")}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-orange-500">⭐ {selectedRestaurant.rating}</div>
                      <p className="text-gray-600">Menu Items: {items.length}</p>
                    </div>
                  </div>
                </m.div>

                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <input
                      type="text"
                      placeholder="Search items..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowAddForm(!showAddForm)}
                      className="px-6 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition"
                    >
                      {showAddForm ? "Cancel" : "+ Add Item"}
                    </button>
                  </div>
                </div>

                {showAddForm && (
                  <m.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg shadow-md p-6 mb-6 border-2 border-orange-500"
                  >
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">
                      {editingItem ? "Edit Item" : "Add New Item"}
                    </h3>
                    <form onSubmit={handleAddItem} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Item Name *
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleFormChange}
                            placeholder="e.g., Margherita Pizza"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category *
                          </label>
                          <select
                            name="category"
                            value={formData.category}
                            onChange={handleFormChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            required
                          >
                            <option value="Pizza">Pizza</option>
                            <option value="Burger">Burger</option>
                            <option value="Drink">Drink</option>
                            <option value="Appetizer">Appetizer</option>
                            <option value="Dessert">Dessert</option>
                            <option value="Salad">Salad</option>
                            <option value="Pasta">Pasta</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Price (₹) *
                          </label>
                          <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleFormChange}
                            placeholder="e.g., 299"
                            step="10"
                            min="0"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Badge (e.g., Bestseller, Hot Pick)
                          </label>
                          <input
                            type="text"
                            name="badge"
                            value={formData.badge}
                            onChange={handleFormChange}
                            placeholder="e.g., Bestseller"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          name="desc"
                          value={formData.desc}
                          onChange={handleFormChange}
                          placeholder="Describe your item..."
                          rows="3"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            name="veg"
                            checked={formData.veg}
                            onChange={handleFormChange}
                            className="w-4 h-4 rounded"
                          />
                          <span className="text-gray-700 font-medium">Vegetarian</span>
                        </label>
                      </div>
                      <div className="flex gap-4">
                        <button
                          type="submit"
                          className="px-6 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition"
                        >
                          {editingItem ? "Update Item" : "Add Item"}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancel}
                          className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </m.div>
                )}

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-2xl font-bold text-gray-800">
                      Menu Items ({filteredItems.length})
                    </h3>
                  </div>
                  {itemsLoading ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-orange-500"></div>
                    </div>
                  ) : filteredItems.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Price</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Source</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Badge</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredItems.map((item) => (
                            <m.tr
                              key={item.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="border-b border-gray-200 hover:bg-gray-50 transition"
                            >
                              <td className="px-6 py-4 text-gray-800 font-medium">{item.name}</td>
                              <td className="px-6 py-4 text-gray-700">
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                  {item.category}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-gray-800 font-semibold">₹{item.price}</td>
                              <td className="px-6 py-4 text-gray-700">
                                {item.veg ? "Veg" : "Non-Veg"}
                              </td>
                              <td className="px-6 py-4 text-gray-700">
                                {isMenuItemFromData(item) ? (
                                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                                    Menu
                                  </span>
                                ) : (
                                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">
                                    Custom
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-gray-700">
                                {item.badge ? (
                                  <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                                    {item.badge}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                              <td className="px-6 py-4 flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleEditItem(item)}
                                  className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition"
                                >
                                  Delete
                                </button>
                              </td>
                            </m.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      <p className="text-lg">No items found. Add your first item to get started!</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-600 text-lg">Select a restaurant to manage items</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
