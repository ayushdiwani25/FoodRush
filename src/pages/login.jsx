import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { m } from "framer-motion";
import { Card, CardContent, Input, Button } from "@/components/ui";
import { Link, useNavigate } from "react-router-dom";
import { login } from "@/redux";
import { validateLogin } from "@/lib";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state.user.isLoggedIn);

  const [form, setForm] = useState({ email: "", password: "" });
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      navigate("/profile");
    }
  }, [isLoggedIn, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form structures locally first
    const validation = validateLogin(form);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, form.email, form.password);
      const firebaseUser = userCredential.user;

      // Fetch user profile info from Firestore
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);
      const profileData = userDoc.exists() ? userDoc.data() : {};

      // Construct user object for your Redux store
      const userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: profileData.name || firebaseUser.displayName || "User",
        phone: profileData.phone || "",
        isAdmin: profileData.isAdmin || false,
        memberSince: profileData.memberSince || new Date().toLocaleDateString(),
      };

      dispatch(login(userData));
      setLoginSuccess(true);

      setTimeout(() => {
        navigate("/profile");
      }, 1500);
    } catch (err) {
      console.error("Login error:", err);
      setError(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loginSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FCFBF7] p-4">
        <m.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="bg-white border border-neutral-100 p-8 rounded-3xl shadow-xl text-center max-w-sm w-full"
        >
          <div className="w-16 h-16 rounded-full bg-green-50 text-green-500 flex items-center justify-center text-3xl mx-auto mb-4 border border-green-100">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-neutral-900 mb-2">
            Welcome Back!
          </h2>
          <p className="text-neutral-500 text-sm font-medium">Successfully logged in. Redirecting...</p>
        </m.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF8F6] p-4 relative overflow-hidden font-sans">
      {/* Soft warm orange glowing accents (Mesh effect on light theme) */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-orange-100/50 blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-orange-200/40 blur-3xl" />

      {/* Premium Floating Vector Food SVGs */}
      <div className="absolute inset-0 pointer-events-none select-none">
        {/* Pizza */}
        <m.div 
          className="absolute text-orange-500/12 top-[15%] left-[10%]"
          animate={{ y: [0, -15, 0], rotate: [0, 8, -8, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg className="w-14 h-14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 22h20L12 2zM7 17a2 2 0 11-4 0 2 2 0 014 0zM17 17a2 2 0 11-4 0 2 2 0 014 0zM12 11a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </m.div>

        {/* Burger */}
        <m.div 
          className="absolute text-orange-500/12 top-[65%] left-[8%]"
          animate={{ y: [0, 15, 0], rotate: [0, -10, 10, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg className="w-14 h-14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M5 12a7 7 0 0114 0M3 15h18a2 2 0 012 2v1a2 2 0 01-2 2H3a2 2 0 01-2-2v-1a2 2 0 012-2z" />
          </svg>
        </m.div>

        {/* Drink */}
        <m.div 
          className="absolute text-orange-500/12 top-[20%] right-[12%]"
          animate={{ y: [0, -12, 0], rotate: [0, -6, 6, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v2a2 2 0 01-2 2h-2M3 8h14v9a4 4 0 01-4 4H7a4 4 0 01-4-4V8zM6 3v3M10 3v3M14 3v3" />
          </svg>
        </m.div>

        {/* Taco / Ice Cream */}
        <m.div 
          className="absolute text-orange-500/12 top-[70%] right-[10%]"
          animate={{ y: [0, 18, 0], rotate: [0, 12, -12, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg className="w-14 h-14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 12a5 5 0 005-5 5 5 0 00-10 0 5 5 0 005 5zm0 0v8M8 20h8" />
          </svg>
        </m.div>
      </div>

      <m.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="rounded-3xl shadow-xl bg-white border border-neutral-100/80 overflow-hidden">
          <CardContent className="p-8">
            <h2 className="text-3xl font-extrabold text-center text-neutral-900 mb-1 tracking-tight">
              Welcome Back
            </h2>
            <p className="text-neutral-400 text-sm text-center mb-8 font-medium">
              Login to your account
            </p>

            {error && (
              <div className="bg-red-50 border border-red-150 text-red-600 px-4 py-3 rounded-xl mb-6 text-xs font-bold leading-relaxed flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0 text-red-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  name="email"
                  type="email"
                  placeholder="Email Address"
                  value={form.email}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full py-6 px-4 border border-neutral-200 rounded-xl bg-neutral-50/50 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all text-neutral-800 placeholder-neutral-400 font-semibold"
                />
              </div>

              <div>
                <Input
                  name="password"
                  type="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full py-6 px-4 border border-neutral-200 rounded-xl bg-neutral-50/50 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all text-neutral-800 placeholder-neutral-400 font-semibold"
                />
              </div>

              <m.div whileHover={{ scale: loading ? 1 : 1.01 }} whileTap={{ scale: loading ? 1 : 0.99 }}>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-extrabold rounded-xl text-base shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </m.div>
            </form>
            <p className="text-center text-neutral-400 text-xs font-semibold mt-8">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-orange-600 font-extrabold hover:text-orange-700 transition-colors"
              >
                Sign Up Here →
              </Link>
            </p>
          </CardContent>
        </Card>
      </m.div>
    </div>
  );
}