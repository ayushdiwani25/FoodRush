import React, { useEffect, useState, lazy, Suspense } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AnimatePresence, MotionConfig, LazyMotion, m, domAnimation } from "framer-motion";
import { Navbar, Footer } from "@/components";

import { restoreUserFromStorage } from "./redux";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const Home = lazy(() => import("./pages/home"));
const Food = lazy(() => import("./pages/food"));
const Cart = lazy(() => import("./pages/cart"));
const Checkout = lazy(() => import("./pages/checkout"));
const RestaurantsPage = lazy(() => import("./pages/restaurants"));
const RestaurantDetailsPage = lazy(() => import("./pages/restaurant-details"));
const ProfilePage = lazy(() => import("./pages/profile"));
const OrdersPage = lazy(() => import("./pages/orders"));
const DealsPage = lazy(() => import("./pages/deals"));
const RestaurantAdminPanel = lazy(() => import("./pages/admin-panel"));
const LoginPage = lazy(() => import("./pages/login"));
const SignupPage = lazy(() => import("./pages/signup"));

const PageFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-orange-50/50">
    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-orange-500"></div>
  </div>
);

const PageTransition = ({ children }) => (
  <m.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.4, ease: "easeInOut" }}
  >
    {children}
  </m.div>
);

export default function App() {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart || []);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          let profileData = {};
          if (userDoc.exists()) {
            profileData = userDoc.data();
          }

          dispatch(
            restoreUserFromStorage({
              user: {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                name: profileData.name || firebaseUser.displayName || "User",
                phone: profileData.phone || "",
                isAdmin: profileData.isAdmin || false,
                memberSince: profileData.memberSince || new Date().toLocaleDateString(),
              },
              isLoggedIn: true,
              addresses: profileData.addresses || [],
              favorites: profileData.favorites || [],
            })
          );
        } else {
          dispatch(
            restoreUserFromStorage({
              user: null,
              isLoggedIn: false,
              addresses: [],
              favorites: [],
            })
          );
        }
      } catch (error) {
        console.error("Error restoring user session from Firebase:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="App flex flex-col min-h-screen">
      <MotionConfig reducedMotion="user">
        <LazyMotion features={domAnimation}>
          <Router>
            <Navbar cartCount={cartItems.reduce((total, item) => total + (item.qty || 1), 0)} />
            <main className="flex-1 flex flex-col">
              <AnimatePresence mode="wait">
                <Suspense fallback={<PageFallback />}>
                  <Routes>
                    <Route path="/" element={<PageTransition><Home /></PageTransition>} />
                    <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
                    <Route path="/signup" element={<PageTransition><SignupPage /></PageTransition>} />
                    <Route path="/restaurants" element={<PageTransition><RestaurantsPage /></PageTransition>} />
                    <Route path="/restaurant/:restaurantId" element={<PageTransition><RestaurantDetailsPage /></PageTransition>} />
                    <Route path="/food" element={<PageTransition><Food /></PageTransition>} />
                    <Route path="/cart" element={<PageTransition><Cart /></PageTransition>} />
                    <Route path="/checkout" element={<PageTransition><Checkout /></PageTransition>} />
                    <Route path="/profile" element={<PageTransition><ProfilePage /></PageTransition>} />
                    <Route path="/orders" element={<PageTransition><OrdersPage /></PageTransition>} />
                    <Route path="/deals" element={<PageTransition><DealsPage /></PageTransition>} />
                    <Route path="/admin/restaurants" element={<PageTransition><RestaurantAdminPanel /></PageTransition>} />
                  </Routes>
                </Suspense>
              </AnimatePresence>
            </main>
            <Footer />
          </Router>
        </LazyMotion>
      </MotionConfig>
    </div>
  );
}