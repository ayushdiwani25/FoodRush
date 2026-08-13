import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { clearCart, placeOrder } from "@/redux";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

export default function Checkout() {
  const cartItems = useSelector((state) => state.cart || []);
  const { isLoggedIn, user } = useSelector(state => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(() => {
    try {
      const savedCheckout = localStorage.getItem("checkout");
      return savedCheckout ? JSON.parse(savedCheckout) : {
        fullName: "",
        phone: "",
        address: "",
        city: "",
        postalCode: "",
        paymentMethod: "card",
      };
    } catch {
      return {
        fullName: "",
        phone: "",
        address: "",
        city: "",
        postalCode: "",
        paymentMethod: "card",
      };
    }
  });

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState("");
  const [promos, setPromos] = useState([]);

  useEffect(() => {
    const fetchPromos = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "promos"));
        const promosList = querySnapshot.docs.map(doc => doc.data());
        setPromos(promosList);
      } catch (err) {
        console.error("Error fetching promos from Firestore:", err);
      }
    };
    fetchPromos();
  }, []);

  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.qty,
    0
  );

  const deliveryCharge = totalPrice > 500 ? 0 : 50;
  
  let discountAmount = 0;
  if (appliedPromo) {
    discountAmount = appliedPromo.discount;
  }
  
  const finalTotal = Math.max(totalPrice + deliveryCharge - discountAmount, 0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedData = {
      ...formData,
      [name]: value,
    };
    setFormData(updatedData);
    localStorage.setItem("checkout", JSON.stringify(updatedData));
  };

  const validateForm = () => {
    if (!formData.fullName || !formData.phone || !formData.address || !formData.city || !formData.postalCode) {
      alert("Please fill all fields");
      return false;
    }
    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return false;
    }
    return true;
  };

  const handleApplyPromo = () => {
    if (!promoCode.trim()) {
      setPromoError("Please enter a promo code");
      return;
    }

    const promo = promos.find(p => p.code === promoCode.toUpperCase());
    
    if (!promo) {
      setPromoError("Invalid promo code");
      setAppliedPromo(null);
      return;
    }

    if (totalPrice < promo.minOrder) {
      setPromoError(`Minimum order ₹${promo.minOrder} required for this code`);
      setAppliedPromo(null);
      return;
    }

    setAppliedPromo(promo);
    setPromoError("");
    setPromoCode("");
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCode("");
    setPromoError("");
  };

  const handlePlaceOrder = async () => {
    if (!isLoggedIn) {
      alert("Please login first");
      return;
    }
    
    if (!validateForm()) return;

    let verifiedSubtotal = totalPrice;
    try {
      const menuSnap = await getDocs(collection(db, "menus"));
      if (!menuSnap.empty) {
        const dbPrices = new Map();
        menuSnap.docs.forEach(doc => {
          const item = doc.data();
          dbPrices.set(item.id?.toString(), item.price);
        });

        verifiedSubtotal = cartItems.reduce((sum, item) => {
          const actualPrice = dbPrices.get(item.id?.toString()) ?? item.price;
          return sum + (actualPrice * (item.quantity || 1));
        }, 0);
      }
    } catch (err) {
      console.warn("Could not fetch DB menus for price verification, falling back to calculated cart total:", err);
    }

    const verifiedTotal = Math.max(0, verifiedSubtotal + deliveryCharge - discountAmount);

    const orderData = {
      items: cartItems,
      total: verifiedTotal,
      restaurant: cartItems[0]?.restaurantName || "Multiple Restaurants",
      address: `${formData.address}, ${formData.city}, ${formData.postalCode}`,
      paymentMethod: formData.paymentMethod,
      promoApplied: appliedPromo?.code || null,
      discount: discountAmount,
      subtotal: verifiedSubtotal,
      deliveryCharge: deliveryCharge,
    };
    
    const orderId = `ORD-${Date.now()}`;
    const newOrder = {
      ...orderData,
      id: orderId,
      userId: user?.uid || null,
      status: "Placed",
      createdAt: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 30 * 60000).toLocaleTimeString(),
      isActive: true,
      activeExpireTime: Date.now() + 10 * 60 * 1000,
      placedAt: Date.now(),
    };

    dispatch(placeOrder(newOrder));

    try {
      await addDoc(collection(db, "orders"), newOrder);
    } catch (err) {
      console.error("Failed to save order to Firestore:", err);
    }

    setOrderPlaced(true);
    dispatch(clearCart());

    setTimeout(() => {
      navigate("/orders");
    }, 2000);
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-linear-to-br from-green-50 to-emerald-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-md">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-bold text-green-600 mb-2">
            Order Confirmed!
          </h1>
          <p className="text-gray-600 mb-4">
            Thank you for your order. Your food will be delivered soon!
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to My Orders in 2 seconds...
          </p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen bg-linear-to-br from-orange-50 to-yellow-50 p-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-orange-600 mb-6">Checkout</h1>
          <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
            <p className="text-lg text-gray-600">
              Your cart is empty. Please add items before checking out.
            </p>
            <button
              type="button"
              onClick={() => navigate("/food")}
              className="mt-6 bg-orange-500 text-white px-6 py-3 rounded-xl hover:bg-orange-600 transition"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 to-yellow-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center text-orange-600 mb-10">
          🛍️ Checkout
        </h1>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Delivery Address
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Address *
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter your delivery address"
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Enter city"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      placeholder="Enter postal code"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    Payment Method
                  </h3>
                  <div className="space-y-3">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={formData.paymentMethod === "card"}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-orange-500"
                      />
                      <span className="ml-3 text-gray-700 font-medium">
                        💳 Credit/Debit Card
                      </span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="upi"
                        checked={formData.paymentMethod === "upi"}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-orange-500"
                      />
                      <span className="ml-3 text-gray-700 font-medium">
                        📱 UPI
                      </span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={formData.paymentMethod === "cod"}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-orange-500"
                      />
                      <span className="ml-3 text-gray-700 font-medium">
                        💰 Cash on Delivery
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-lg h-fit sticky top-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Order Summary
              </h2>

              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center text-sm pb-3 border-b"
                  >
                    <div>
                      <p className="font-semibold text-gray-800">{item.name}</p>
                      <p className="text-gray-500 text-xs">
                        ₹{item.price} × {item.qty}
                      </p>
                    </div>
                    <p className="font-bold text-orange-600">
                      ₹{item.price * item.qty}
                    </p>
                  </div>
                ))}
              </div>

              <hr className="my-4" />

              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <h3 className="text-sm font-bold text-gray-800 mb-2">💰 Promo Code</h3>
                {appliedPromo ? (
                  <div className="flex justify-between items-center bg-green-100 p-2 rounded border border-green-300 mb-2">
                    <div>
                      <p className="text-xs text-gray-600">Applied:</p>
                      <p className="font-bold text-green-700">{appliedPromo.code}</p>
                      <p className="text-xs text-green-600">-₹{appliedPromo.discount}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemovePromo}
                      className="text-red-600 hover:text-red-800 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => {
                        setPromoCode(e.target.value);
                        setPromoError("");
                      }}
                      placeholder="Enter promo code"
                      className="flex-1 px-2 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      className="px-3 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition"
                    >
                      Apply
                    </button>
                  </div>
                )}
                {promoError && (
                  <p className="text-xs text-red-600 mt-2">{promoError}</p>
                )}
              </div>

              <hr className="my-4" />

              <div className="flex justify-between text-gray-700 mb-2">
                <span>Subtotal:</span>
                <span>₹{totalPrice}</span>
              </div>

              <div className="flex justify-between text-gray-700 mb-3">
                <span>
                  Delivery:
                  {deliveryCharge === 0 && (
                    <span className="text-green-600 text-sm ml-1">
                      (Free for orders above ₹500)
                    </span>
                  )}
                </span>
                <span>
                  {deliveryCharge === 0 ? (
                    <span className="text-green-600 font-semibold">Free</span>
                  ) : (
                    `₹${deliveryCharge}`
                  )}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600 font-semibold mb-3">
                  <span>Discount:</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}

              <hr className="my-3" />

              <div className="flex justify-between text-xl font-bold text-orange-600 mb-6">
                <span>Total:</span>
                <span>₹{finalTotal}</span>
              </div>

              <button
                type="button"
                onClick={handlePlaceOrder}
                className="w-full bg-linear-to-r from-orange-500 to-red-500 
                hover:from-orange-600 hover:to-red-600 text-white py-3 rounded-xl 
                text-lg font-semibold transition-all hover:scale-105"
              >
                Place Order 🚀
              </button>

              <button
                type="button"
                onClick={() => navigate("/cart")}
                className="w-full mt-3 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-xl 
                font-semibold transition"
              >
                Back to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
