import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  restaurants: [],
  currentRestaurant: null,
  items: []
};

const restaurantSlice = createSlice({
  name: "restaurant",
  initialState,
  reducers: {
    // Set current restaurant
    setCurrentRestaurant: (state, action) => {
      state.currentRestaurant = action.payload;
      state.items = [];
    },

    // Load restaurant items (from MENU data + Firestore custom items)
    loadRestaurantItems: (state, action) => {
      state.items = action.payload;
    },

    // Add new item to restaurant menu (Firestore sync handled in component)
    addItem: (state, action) => {
      state.items.push(action.payload);
    },

    // Update existing item (Firestore sync handled in component)
    updateItem: (state, action) => {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = {
          ...state.items[index],
          ...action.payload,
          updatedAt: new Date().toISOString()
        };
      }
    },

    // Delete item from menu (Firestore sync handled in component)
    deleteItem: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },

    // Set all restaurants
    setRestaurants: (state, action) => {
      state.restaurants = action.payload;
    },

    // Update restaurant info
    updateRestaurantInfo: (state, action) => {
      if (state.currentRestaurant) {
        state.currentRestaurant = { ...state.currentRestaurant, ...action.payload };
        const index = state.restaurants.findIndex(r => r.id === state.currentRestaurant.id);
        if (index !== -1) {
          state.restaurants[index] = state.currentRestaurant;
        }
      }
    }
  }
});

export const {
  setCurrentRestaurant,
  loadRestaurantItems,
  addItem,
  updateItem,
  deleteItem,
  setRestaurants,
  updateRestaurantInfo
} = restaurantSlice.actions;

export default restaurantSlice.reducer;
