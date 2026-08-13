import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  orders: [],
  activeOrder: null
};

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    placeOrder: (state, action) => {
      const now = Date.now();
      const activeExpireTime = now + 10 * 60 * 1000; // 10 minutes from now
      
      const newOrder = {
        id: action.payload.id || `ORD-${Date.now()}`,
        items: action.payload.items,
        total: action.payload.total,
        restaurant: action.payload.restaurant,
        address: action.payload.address,
        paymentMethod: action.payload.paymentMethod,
        status: action.payload.status || "Placed",
        createdAt: action.payload.createdAt || new Date().toISOString(),
        estimatedDelivery: action.payload.estimatedDelivery || new Date(Date.now() + 30 * 60000).toLocaleTimeString(),
        promoApplied: action.payload.promoApplied !== undefined ? action.payload.promoApplied : (action.payload.promoCode || null),
        isActive: action.payload.isActive !== undefined ? action.payload.isActive : true,
        activeExpireTime: action.payload.activeExpireTime || activeExpireTime,
        placedAt: action.payload.placedAt || now,
        userId: action.payload.userId || null,
        discount: action.payload.discount || 0,
        subtotal: action.payload.subtotal || action.payload.total,
        deliveryCharge: action.payload.deliveryCharge || 0,
        docId: action.payload.docId || null,
        review: action.payload.review || null,
        rating: action.payload.rating || null
      };
      state.orders.unshift(newOrder);
      state.activeOrder = newOrder;
    },

    loadOrders: (state, action) => {
      state.orders = action.payload;
    },

    updateOrderStatus: (state, action) => {
      const order = state.orders.find(o => o.id === action.payload.orderId);
      if (order) {
        order.status = action.payload.status;
      }
      if (state.activeOrder?.id === action.payload.orderId) {
        state.activeOrder.status = action.payload.status;
      }
    },

    cancelOrder: (state, action) => {
      const order = state.orders.find(o => o.id === action.payload);
      if (order) {
        order.status = "Cancelled";
      }
    },

    clearActiveOrder: (state) => {
      state.activeOrder = null;
    },

    addReview: (state, action) => {
      const order = state.orders.find(o => o.id === action.payload.orderId);
      if (order) {
        order.review = action.payload.review;
        order.rating = action.payload.rating;
      }
    },

    expireActiveOrders: (state) => {
      const now = Date.now();
      state.orders.forEach(order => {
        if (order.isActive && order.activeExpireTime && now >= order.activeExpireTime) {
          order.isActive = false;
          if (order.status !== "Cancelled" && order.status !== "Delivered") {
            order.status = "Delivered";
          }
        }
      });
      if (state.activeOrder && state.activeOrder.isActive && state.activeOrder.activeExpireTime && now >= state.activeOrder.activeExpireTime) {
        state.activeOrder.isActive = false;
        if (state.activeOrder.status !== "Cancelled" && state.activeOrder.status !== "Delivered") {
          state.activeOrder.status = "Delivered";
        }
      }
    }
  }
});

export const {
  placeOrder,
  loadOrders,
  updateOrderStatus,
  cancelOrder,
  clearActiveOrder,
  addReview,
  expireActiveOrders
} = orderSlice.actions;

export default orderSlice.reducer;
