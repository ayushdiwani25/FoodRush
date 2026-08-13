import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  isLoggedIn: false,
  addresses: [],
  selectedAddress: null,
  favorites: []
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login: (state, action) => {
      state.user = action.payload;
      state.isLoggedIn = true;
    },

    logout: (state) => {
      state.user = null;
      state.isLoggedIn = false;
      state.addresses = [];
      state.selectedAddress = null;
      state.favorites = [];
    },

    restoreUserFromStorage: (state, action) => {
      state.user = action.payload.user;
      state.isLoggedIn = action.payload.isLoggedIn;
      state.addresses = action.payload.addresses || [];
      state.favorites = action.payload.favorites || [];
    },

    addAddress: (state, action) => {
      state.addresses.push(action.payload);
    },

    deleteAddress: (state, action) => {
      state.addresses = state.addresses.filter(addr => addr.id !== action.payload);
    },

    selectAddress: (state, action) => {
      state.selectedAddress = action.payload;
    },

    updateProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    }
  }
});

export const {
  login,
  logout,
  restoreUserFromStorage,
  addAddress,
  deleteAddress,
  selectAddress,
  updateProfile
} = userSlice.actions;

export default userSlice.reducer;
