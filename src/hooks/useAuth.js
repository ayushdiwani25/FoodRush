import { useSelector, useDispatch } from "react-redux";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { logout } from "../redux/userSlice";
import { clearCart } from "../redux/cartSlice";
import { clearActiveOrder } from "../redux/orderSlice";

export function useAuth() {
  const dispatch = useDispatch();
  const { user, isLoggedIn } = useSelector((state) => state.user || {});

  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch(logout());
      dispatch(clearCart());
      dispatch(clearActiveOrder());
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return {
    user,
    isLoggedIn: Boolean(isLoggedIn && user),
    isAdmin: Boolean(user?.isAdmin),
    userName: user?.name || "User",
    userEmail: user?.email || "",
    logout: handleLogout,
  };
}
