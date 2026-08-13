import { createSlice } from '@reduxjs/toolkit';

const initialState = JSON.parse(localStorage.getItem("cart")) || [];

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const existingItem = state.find(i => i.id === action.payload.id);
      if (existingItem) {
        existingItem.qty = action.payload.qty;
      } else {
        state.push(action.payload);
      }
      localStorage.setItem("cart", JSON.stringify(state));
    },

    removeFromCart: (state, action) => {
      const filtered = state.filter((item) => item.id !== action.payload);
      localStorage.setItem("cart", JSON.stringify(filtered));
      return filtered;
    },

    updateQuantity: (state, action) => {
      const { id, qty } = action.payload;
      const item = state.find(item => item.id === id);
      if (item) {
        item.qty = qty;
      }
      localStorage.setItem("cart", JSON.stringify(state));
    },

    clearCart: () => {
      localStorage.setItem("cart", JSON.stringify([]));
      return [];
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;