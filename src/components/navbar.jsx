import React, { useState, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import { m, AnimatePresence } from "framer-motion";
import { useAuth } from "../hooks";

// ===== HELPER: Navigation Links Data =====
const NAVBAR_LINKS = [
  {
    path: "/",
    label: "Home",
    icon: (
      <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )
  },
  {
    path: "/restaurants",
    label: "Restaurants",
    icon: (
      <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    )
  },
  {
    path: "/food",
    label: "Menu",
    icon: (
      <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    )
  },
  {
    path: "/deals",
    label: "Deals",
    icon: (
      <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
      </svg>
    )
  }
];

// ===== HELPER: Navigation Link Component =====
function NavbarLink({ path, label, icon }) {
  return (
    <li>
      <NavLink
        to={path}
        className={({ isActive }) =>
          `font-semibold text-sm transition-all duration-300 flex items-center gap-1.5 px-4 py-2 rounded-full focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none ${
            isActive
              ? "text-orange-600 bg-orange-50 border border-orange-100/50 shadow-2xs"
              : "text-neutral-600 hover:text-orange-600 hover:bg-neutral-50"
          }`
        }
      >
        <m.span className="flex items-center gap-1.5" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          {icon}
          <span>{label}</span>
        </m.span>
      </NavLink>
    </li>
  );
}

// ===== HELPER: User Avatar or Login Button =====
function UserSection({ user, isLoggedIn, isAdmin, userName }) {
  if (isLoggedIn && user) {
    return (
      <div className="flex items-center gap-2">
        {isAdmin && (
          <Link
            to="/admin/restaurants"
            className="px-3 py-1.5 rounded-full bg-red-50 hover:bg-red-100 border border-red-100 transition text-red-600 text-xs font-bold hidden md:flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none"
            aria-label="Admin Panel"
            title="Admin Panel"
          >
            <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Admin
          </Link>
        )}
        <Link
          to="/profile"
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-orange-50 border border-neutral-200/40 text-neutral-800 hover:text-orange-600 transition transform hover:scale-105 shadow-2xs focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none"
          aria-label={`User Profile for ${userName}`}
          title={`${userName} - Click to view profile`}
        >
          <m.div
            className="w-7 h-7 bg-linear-to-r from-orange-500 to-red-500 text-white rounded-full flex items-center justify-center font-bold text-xs shadow-xs"
            whileHover={{ scale: 1.1 }}
          >
            {userName?.charAt(0).toUpperCase() || "U"}
          </m.div>
          <span className="text-xs font-bold hidden md:inline">
            {userName?.split(" ")[0]}
          </span>
        </Link>
      </div>
    );
  }

  return (
    <Link
      to="/login"
      className="px-4 py-2 rounded-full bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition transform hover:scale-105 shadow-sm flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none min-h-[36px]"
      aria-label="Log in to your account"
      title="Login"
    >
      <svg
        aria-hidden="true"
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
      </svg>
      <span>Login</span>
    </Link>
  );
}

export default function Navbar({ cartCount = 0 }) {
  // FE 05: Abstract user state via custom hook
  const { user, isLoggedIn, isAdmin, userName } = useAuth();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNavbarHidden, setIsNavbarHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsNavbarHidden(true);
      } else {
        setIsNavbarHidden(false);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <header className="sticky top-0 z-50">
      <nav 
        aria-label="Main Navigation"
        role="navigation"
        className="bg-white/80 backdrop-blur-md text-neutral-800 border-b border-neutral-100/80 shadow-xs transition-transform duration-300 ease-in-out"
        style={{
          transform: isNavbarHidden ? "translateY(-100%)" : "translateY(0)"
        }}
      >
        <div className="flex items-center justify-between px-4 md:px-8 py-3.5">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-2 rounded-lg focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none" 
            aria-label="FoodRush Home Page"
          >
            <m.div
              className="flex items-center gap-2 md:gap-3 cursor-pointer"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <m.img
                src="https://cdn-icons-png.flaticon.com/512/3075/3075977.png"
                alt="FoodRush Logo"
                className="w-7 h-7 md:w-10 md:h-10"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
              />
              <m.h1 className="text-xl md:text-2xl font-black tracking-tight text-neutral-900">
                Food<span className="text-orange-500">Rush</span>
              </m.h1>
            </m.div>
          </Link>

          {/* Desktop Navigation Links */}
          <ul className="hidden md:flex gap-6">
            {NAVBAR_LINKS.map(({ path, label, icon }) => (
              <NavbarLink key={path} path={path} label={label} icon={icon} />
            ))}
          </ul>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-full text-neutral-700 bg-neutral-100 hover:bg-neutral-200 transition focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none"
            aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Right Section: Cart + Orders + User */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-full bg-neutral-100 hover:bg-orange-50 text-neutral-700 hover:text-orange-600 border border-neutral-200/20 transition transform hover:scale-105 shadow-2xs focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none"
              aria-label={`View Cart with ${cartCount} items`}
              title="View Cart"
            >
              <svg
                aria-hidden="true"
                className="w-4 h-4 md:w-5 md:h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M3 9h18l-1 10H4L3 9z" />
                <path d="M9 9V6a3 3 0 016 0v3" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-orange-600 text-white text-[9px] font-extrabold w-4 h-4 flex items-center justify-center rounded-full shadow-xs">
                  {cartCount}
                  <span className="sr-only">items in cart</span>
                </span>
              )}
            </Link>

            {/* Orders Icon */}
            <Link
              to="/orders"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-full bg-neutral-100 hover:bg-orange-50 text-neutral-700 hover:text-orange-600 border border-neutral-200/20 transition transform hover:scale-105 shadow-2xs focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none"
              aria-label="View My Orders"
              title="My Orders"
            >
              <m.svg
                aria-hidden="true"
                className="w-4 h-4 md:w-5 md:h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                animate={{ x: [0, 1.5, -1.5, 0] }}
                transition={{ 
                  duration: 1.2, 
                  repeat: Infinity, 
                  repeatDelay: 4,
                  ease: "easeInOut"
                }}
                whileHover={{ rotate: -5 }}
              >
                <path d="M15 10h4l3 4v2h-6v-2l-2-4z" />
                <circle cx="17" cy="17" r="2" />
                <circle cx="7" cy="17" r="2" />
                <path d="M3 17v-5l4-4h6l1 2h3" />
                <path d="M8 13h5" />
                <circle cx="13" cy="7" r="1" />
                <path d="M10 17h6" />
              </m.svg>
            </Link>

            {/* User Section */}
            <UserSection user={user} isLoggedIn={isLoggedIn} isAdmin={isAdmin} userName={userName} />
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <m.div
              id="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white/95 border-t border-neutral-100/80 backdrop-blur-md shadow-lg overflow-hidden"
            >
              <ul className="flex flex-col gap-1.5 px-4 py-4">
                {NAVBAR_LINKS.map(({ path, label, icon }) => (
                  <li key={path}>
                    <NavLink
                      to={path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none ${
                          isActive ? "bg-orange-50 text-orange-600 shadow-2xs" : "text-neutral-700 hover:bg-neutral-50"
                        }`
                      }
                    >
                      {icon}
                      <span className="text-sm">{label}</span>
                    </NavLink>
                  </li>
                ))}
                {isLoggedIn && isAdmin && (
                  <li>
                    <NavLink
                      to="/admin/restaurants"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none ${
                          isActive ? "bg-red-50 text-red-600 shadow-2xs" : "text-neutral-700 hover:bg-red-50/50"
                        }`
                      }
                    >
                      <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-sm">Admin Panel</span>
                    </NavLink>
                  </li>
                )}
              </ul>
            </m.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
