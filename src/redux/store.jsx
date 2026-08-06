import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./cartSlice";
import userReducer from "./userSlice";
import orderReducer from "./orderSlice";
import favoritesReducer from "./favoritesSlice";
import restaurantReducer from "./restaurantSlice";
 
const store = configureStore({
    reducer: {
        cart: cartReducer,
        user: userReducer,
        orders: orderReducer,
        favorites: favoritesReducer,
        restaurant: restaurantReducer
    },
});
export default store;
