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
    setCurrentRestaurant: (state, action) => {
      state.currentRestaurant = action.payload;
      state.items = [];
    },

    loadRestaurantItems: (state, action) => {
      state.items = action.payload;
    },

    addItem: (state, action) => {
      state.items.push(action.payload);
    },

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

    deleteItem: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },

    setRestaurants: (state, action) => {
      state.restaurants = action.payload;
    },

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
