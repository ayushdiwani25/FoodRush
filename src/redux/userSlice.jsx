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
    // Login user
    login: (state, action) => {
      state.user = action.payload;
      state.isLoggedIn = true;
    },

    // Logout user — Firebase signOut is called in the component
    logout: (state) => {
      state.user = null;
      state.isLoggedIn = false;
      state.addresses = [];
      state.selectedAddress = null;
      state.favorites = [];
    },

    // Restore user from Firebase auth state + Firestore profile
    restoreUserFromStorage: (state, action) => {
      state.user = action.payload.user;
      state.isLoggedIn = action.payload.isLoggedIn;
      state.addresses = action.payload.addresses || [];
      state.favorites = action.payload.favorites || [];
    },

    // Add address (Firestore sync handled in component)
    addAddress: (state, action) => {
      state.addresses.push(action.payload);
    },

    // Delete address (Firestore sync handled in component)
    deleteAddress: (state, action) => {
      state.addresses = state.addresses.filter(addr => addr.id !== action.payload);
    },

    // Select address
    selectAddress: (state, action) => {
      state.selectedAddress = action.payload;
    },

    // Update user profile (Firestore sync handled in component)
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
