import { useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addToCart, removeFromCart, updateQuantity, clearCart } from "../redux/cartSlice";

export function useCart() {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart || []);

  const totalItemsCount = useMemo(() => {
    return cartItems.reduce((total, item) => total + (item.qty || 1), 0);
  }, [cartItems]);

  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (Number(item.price) || 0) * (item.qty || 1), 0);
  }, [cartItems]);

  const deliveryFee = useMemo(() => {
    return subtotal > 0 ? (subtotal > 30 ? 0 : 2.99) : 0;
  }, [subtotal]);

  const tax = useMemo(() => {
    return subtotal * 0.08; // 8% estimated tax
  }, [subtotal]);

  const grandTotal = useMemo(() => {
    return subtotal + deliveryFee + tax;
  }, [subtotal, deliveryFee, tax]);

  const addItem = useCallback(
    (item, qty = 1) => {
      dispatch(addToCart({ ...item, qty }));
    },
    [dispatch]
  );

  const removeItem = useCallback(
    (id) => {
      dispatch(removeFromCart(id));
    },
    [dispatch]
  );

  const updateQty = useCallback(
    (id, qty) => {
      if (qty <= 0) {
        dispatch(removeFromCart(id));
      } else {
        dispatch(updateQuantity({ id, qty }));
      }
    },
    [dispatch]
  );

  const clear = useCallback(() => {
    dispatch(clearCart());
  }, [dispatch]);

  return {
    cartItems,
    totalItemsCount,
    subtotal,
    deliveryFee,
    tax,
    grandTotal,
    addItem,
    removeItem,
    updateQty,
    clearCart: clear,
  };
}
