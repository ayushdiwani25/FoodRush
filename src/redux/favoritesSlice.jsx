import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  favoriteRestaurants: [],
  favoriteItems: []
};

const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    addFavoriteRestaurant: (state, action) => {
      if (!state.favoriteRestaurants.find(r => r.id === action.payload.id)) {
        state.favoriteRestaurants.push(action.payload);
      }
    }
  }
});

export const {
  addFavoriteRestaurant
} = favoritesSlice.actions;

export default favoritesSlice.reducer;
