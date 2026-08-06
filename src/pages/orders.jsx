import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { m } from "framer-motion";
import { expireActiveOrders, cancelOrder, loadOrders, addReview } from "@/redux";
import { db } from "../firebase";
import { collection, query, where, onSnapshot, doc, updateDoc, getDocs } from "firebase/firestore";

const getStatusStepIndex = (status) => {
  switch (status) {
    case "Placed": return 1;
    case "Confirmed": return 2;
    case "Out for Delivery": return 3;
    case "Delivered": return 4;
    case "Cancelled": return -1;
    default: return 0;
  }
};

export default function OrdersPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { orders } = useSelector(state => state.orders);
  const { isLoggedIn, user } = useSelector(state => state.user);
  const [activeTab, setActiveTab] = useState("active");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [now, setNow] = useState(0);

  // Write Review Modal state
  const [reviewOrder, setReviewOrder] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Set up ticker to update active order timers in real-time and simulate status progression
  useEffect(() => {
    Promise.resolve().then(() => {
      setNow(Date.now());
    });
    
    const interval = setInterval(() => {
      const currentTime = Date.now();
      setNow(currentTime);

      // Simulate status progression for active orders in real-time
      orders.forEach(async (order) => {
        if (order.isActive && order.status !== "Cancelled" && order.status !== "Delivered") {
          const placed = order.placedAt || (order.createdAt ? new Date(order.createdAt).getTime() : currentTime);
          const expire = order.activeExpireTime || (placed + 10 * 60 * 1000);
          const totalDuration = expire - placed;
          const elapsed = currentTime - placed;

          let targetStatus = "Placed";
          let isActive = true;

          if (elapsed >= totalDuration) {
            targetStatus = "Delivered";
            isActive = false;
          } else if (elapsed >= totalDuration * 0.6) {
            targetStatus = "Out for Delivery";
          } else if (elapsed >= totalDuration * 0.2) {
            targetStatus = "Confirmed";
          }

          if (targetStatus !== order.status || isActive !== order.isActive) {
            try {
              if (order.docId) {
                await updateDoc(doc(db, "orders", order.docId), {
                  status: targetStatus,
                  isActive: isActive
                });
              }
            } catch (err) {
              console.error(`Failed to update status for order ${order.id}:`, err);
            }
          }
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [orders]);

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
  };

  const handleCancelOrder = async (order) => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      try {
        if (order.docId) {
          await updateDoc(doc(db, "orders", order.docId), {
            status: "Cancelled",
            isActive: false,
          });
        } else {
          const ordersRef = collection(db, "orders");
          const q = query(ordersRef, where("id", "==", order.id));
          const querySnapshot = await getDocs(q);
          for (const d of querySnapshot.docs) {
            await updateDoc(doc(db, "orders", d.id), {
              status: "Cancelled",
              isActive: false,
            });
          }
        }
        dispatch(cancelOrder(order.id));
        alert("Order cancelled successfully!");
      } catch (err) {
        console.error("Failed to sync cancellation to Firestore:", err);
        alert("Failed to cancel order: " + err.message);
      }
    }
  };

  const closeModal = () => {
    setSelectedOrder(null);
  };

  const handleOpenReviewModal = (order) => {
    setReviewOrder(order);
    setReviewRating(5);
    setReviewText("");
  };

  const handleCloseReviewModal = () => {
    setReviewOrder(null);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewOrder) return;
    if (!reviewText.trim()) {
      alert("Please enter a review message");
      return;
    }

    setIsSubmittingReview(true);
    try {
      if (reviewOrder.docId) {
        await updateDoc(doc(db, "orders", reviewOrder.docId), {
          review: reviewText.trim(),
          rating: reviewRating
        });
      } else {
        const ordersRef = collection(db, "orders");
        const q = query(ordersRef, where("id", "==", reviewOrder.id));
        const querySnapshot = await getDocs(q);
        for (const d of querySnapshot.docs) {
          await updateDoc(doc(db, "orders", d.id), {
            review: reviewText.trim(),
            rating: reviewRating
          });
        }
      }

      dispatch(addReview({ orderId: reviewOrder.id, review: reviewText.trim(), rating: reviewRating }));
      alert("Review submitted successfully!");
      setReviewOrder(null);
    } catch (err) {
      console.error("Failed to submit review:", err);
      alert("Failed to submit review: " + err.message);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Fetch orders from Firestore on mount and expire stale ones
  useEffect(() => {
    dispatch(expireActiveOrders());

    if (!isLoggedIn || !user) return;

    Promise.resolve().then(() => {
      setOrdersLoading(true);
    });
    const userId = user.uid || user.id;

    // Set up real-time subscription
    const ordersRef = collection(db, "orders");
    const q = query(ordersRef, where("userId", "==", userId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedOrders = snapshot.docs.map(doc => ({
        docId: doc.id,
        ...doc.data()
      }));

      // Sort by placedAt descending in memory
      fetchedOrders.sort((a, b) => (b.placedAt || 0) - (a.placedAt || 0));

      dispatch(loadOrders(fetchedOrders));
      setOrdersLoading(false);
    }, (error) => {
      console.error("Failed to fetch orders from Firestore:", error);
      setOrdersLoading(false);
    });

    return () => unsubscribe();
  }, [dispatch, isLoggedIn, user]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-800 mb-4">
            Please login to view your orders
          </p>
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-semibold"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const activeOrders = orders.filter(
    o => (o.status === "Placed" || o.status === "Confirmed" || o.status === "Out for Delivery") && o.isActive
  );
  const completedOrders = orders.filter(o => o.status === "Delivered");
  const cancelledOrders = orders.filter(o => o.status === "Cancelled");

  const getTimeRemaining = (expireTime, currentNow) => {
    if (!expireTime) return null;
    const remaining = expireTime - currentNow;
    if (remaining <= 0) return null;

    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return { minutes, seconds };
  };

  const displayOrders =
    activeTab === "active"
      ? activeOrders
      : activeTab === "completed"
        ? completedOrders
        : cancelledOrders;

  const getStatusColor = (status) => {
    switch (status) {
      case "Placed":
        return "bg-amber-100 text-amber-800 border border-amber-250";
      case "Confirmed":
        return "bg-blue-100 text-blue-800";
      case "Out for Delivery":
        return "bg-purple-100 text-purple-800";
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Placed":
        return "⏳";
      case "Confirmed":
        return "✓";
      case "Out for Delivery":
        return "🚴";
      case "Delivered":
        return "✓✓";
      case "Cancelled":
        return "✗";
      default:
        return "•";
    }
  };



  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <m.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800">My Orders</h1>
          <p className="text-gray-600 mt-2">Track and manage your all orders</p>
        </m.div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b-2 border-gray-300">
          <button
            type="button"
            onClick={() => setActiveTab("active")}
            className={`px-6 py-4 font-semibold transition border-b-4 ${activeTab === "active"
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-gray-600 hover:text-orange-500"
              }`}
          >
            Active ({activeOrders.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("completed")}
            className={`px-6 py-4 font-semibold transition border-b-4 ${activeTab === "completed"
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-gray-600 hover:text-orange-500"
              }`}
          >
            Completed ({completedOrders.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("cancelled")}
            className={`px-6 py-4 font-semibold transition border-b-4 ${activeTab === "cancelled"
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-gray-600 hover:text-orange-500"
              }`}
          >
            Cancelled ({cancelledOrders.length})
          </button>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {ordersLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-orange-500"></div>
            </div>
          ) : displayOrders.length > 0 ? (
            displayOrders.map((order, index) => {
              const timeRemaining = now ? getTimeRemaining(order.activeExpireTime, now) : null;
              return (
                <m.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition"
                >
                  <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1">Order ID</p>
                      <p className="font-bold text-lg text-gray-800">{order.id}</p>
                    </div>

                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1">Restaurant</p>
                      <p className="font-semibold text-gray-800">
                        {order.restaurant}
                      </p>
                    </div>

                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1">Amount</p>
                      <p className="font-bold text-xl text-orange-500">
                        ₹{order.total}
                      </p>
                    </div>

                    <div>
                      <span
                        className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusIcon(order.status)} {order.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 pb-4 border-b border-gray-200">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Items</p>
                      <p className="font-semibold text-gray-800">
                        {order.items.length} items
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-600 mb-1">🚚 Delivery</p>
                      <p className="font-semibold text-gray-800">
                        {order.estimatedDelivery}
                      </p>
                      {timeRemaining && (
                        <p className="text-xs text-orange-500 font-semibold mt-0.5">
                          ({timeRemaining.minutes}m {timeRemaining.seconds}s left)
                        </p>
                      )}
                    </div>

                    <div>
                      <p className="text-xs text-gray-600 mb-1">📍 Location</p>
                      <p className="font-semibold text-gray-800 truncate">
                        {order.address}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-600 mb-1">📅 Date</p>
                      <p className="font-semibold text-gray-800 text-sm">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Visual Delivery Progress Timeline */}
                  {order.status !== "Cancelled" && (
                    <div className="mb-6 mt-4 p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-4">Delivery Progress</p>
                      <div className="relative flex items-center justify-between w-full px-2">
                        {/* Background Line */}
                        <div className="absolute left-0 right-0 top-4 -translate-y-1/2 h-1 bg-gray-200 z-0 mx-4"></div>
                        
                        {/* Active Progress Line */}
                        <div 
                          className="absolute left-0 top-4 -translate-y-1/2 h-1 bg-orange-500 transition-all duration-500 z-0 mx-4"
                          style={{
                            width: `${
                              getStatusStepIndex(order.status) === 1 ? "0%" :
                              getStatusStepIndex(order.status) === 2 ? "33%" :
                              getStatusStepIndex(order.status) === 3 ? "66%" :
                              getStatusStepIndex(order.status) === 4 ? "100%" : "0%"
                            }`
                          }}
                        ></div>

                        {/* Step 1: Placed */}
                        <div className="flex flex-col items-center z-10">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                            getStatusStepIndex(order.status) >= 1 ? "bg-orange-500 text-white shadow-md scale-110" : "bg-gray-200 text-gray-400"
                          }`}>
                            🛍️
                          </div>
                          <span className={`text-[10px] font-bold mt-1.5 ${getStatusStepIndex(order.status) >= 1 ? "text-orange-600" : "text-gray-400"}`}>Placed</span>
                        </div>

                        {/* Step 2: Confirmed */}
                        <div className="flex flex-col items-center z-10">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                            getStatusStepIndex(order.status) >= 2 ? "bg-orange-500 text-white shadow-md scale-110" : "bg-gray-200 text-gray-400"
                          }`}>
                            👨‍🍳
                          </div>
                          <span className={`text-[10px] font-bold mt-1.5 ${getStatusStepIndex(order.status) >= 2 ? "text-orange-600" : "text-gray-400"}`}>Preparing</span>
                        </div>

                        {/* Step 3: Out for Delivery */}
                        <div className="flex flex-col items-center z-10">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                            getStatusStepIndex(order.status) >= 3 ? "bg-orange-500 text-white shadow-md scale-110" : "bg-gray-200 text-gray-400"
                          }`}>
                            🚴
                          </div>
                          <span className={`text-[10px] font-bold mt-1.5 ${getStatusStepIndex(order.status) >= 3 ? "text-orange-600" : "text-gray-400"}`}>On the Way</span>
                        </div>

                        {/* Step 4: Delivered */}
                        <div className="flex flex-col items-center z-10">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                            getStatusStepIndex(order.status) >= 4 ? "bg-green-500 text-white shadow-md scale-110" : "bg-gray-200 text-gray-400"
                          }`}>
                            🏠
                          </div>
                          <span className={`text-[10px] font-bold mt-1.5 ${getStatusStepIndex(order.status) >= 4 ? "text-green-600" : "text-gray-400"}`}>Delivered</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Delivery Driver Info Card */}
                  {(order.status === "Out for Delivery" || order.status === "Delivered") && (
                    <div className="mb-6 p-4 bg-gray-50 border border-gray-150 rounded-xl flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-2xl">
                          🚴
                        </div>
                        <div>
                          <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Delivery Partner</p>
                          <p className="font-extrabold text-gray-800 text-sm">Rohan Kumar</p>
                          <p className="text-xs text-neutral-500 font-medium">Activa (DL 3C AB 1234) • ⭐ 4.9</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <a 
                          href="tel:+919876543210"
                          className="px-3.5 py-2 bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 font-bold text-xs rounded-lg shadow-2xs flex items-center gap-1.5 transition"
                        >
                          📞 Call Partner
                        </a>
                      </div>
                    </div>
                  )}

                  {order.review && (
                    <div className="mt-2 mb-4 p-4 bg-amber-50/50 rounded-xl border border-amber-100/70">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-sm font-bold text-gray-700">Your Review</span>
                        <div className="flex text-amber-400 text-sm">
                          {"★".repeat(order.rating)}{"☆".repeat(5 - order.rating)}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm italic font-medium">"{order.review}"</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => handleViewDetails(order)}
                      className="flex-1 px-4 py-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 font-semibold"
                    >
                      View Details
                    </button>
                    {order.status === "Delivered" && !order.review && (
                      <button
                        type="button"
                        onClick={() => handleOpenReviewModal(order)}
                        className="flex-1 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 font-semibold"
                      >
                        Write Review
                      </button>
                    )}
                    {(order.status === "Placed" || order.status === "Confirmed") && (
                      <button
                        type="button"
                        onClick={() => handleCancelOrder(order)}
                        className="flex-1 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 font-semibold"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </m.div>
              );
            })
          ) : (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-white rounded-lg border border-gray-200"
            >
              <p className="text-2xl text-gray-600 mb-4">
                {activeTab === "active"
                  ? "No active orders"
                  : activeTab === "completed"
                    ? "No completed orders"
                    : "No cancelled orders"}
              </p>
              <button
                type="button"
                onClick={() => navigate("/restaurants")}
                className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-semibold"
              >
                Start Ordering
              </button>
            </m.div>
          )}
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <m.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-96 overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Order Details</h2>
                    <p className="text-gray-600 mt-1">Order ID: {selectedOrder.id}</p>
                  </div>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-200">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <span className={`px-3 py-1 rounded-full font-semibold text-sm ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusIcon(selectedOrder.status)} {selectedOrder.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                    <p className="text-2xl font-bold text-orange-500">₹{selectedOrder.total}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Restaurant</p>
                    <p className="font-semibold text-gray-800">{selectedOrder.restaurant}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Payment Method</p>
                    <p className="font-semibold text-gray-800 capitalize">{selectedOrder.paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Delivery Time</p>
                    <p className="font-semibold text-gray-800">{selectedOrder.estimatedDelivery}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Order Date</p>
                    <p className="font-semibold text-gray-800">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="mb-6 pb-6 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Items</h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                        <div>
                          <p className="font-semibold text-gray-800">{item.name}</p>
                          <p className="text-sm text-gray-600">Qty: {item.qty}</p>
                        </div>
                        <p className="font-bold text-gray-800">₹{item.price * item.qty}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedOrder.review && (
                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Your Review</h3>
                    <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100/70">
                      <div className="flex text-amber-400 text-lg mb-2">
                        {"★".repeat(selectedOrder.rating)}{"☆".repeat(5 - selectedOrder.rating)}
                      </div>
                      <p className="text-gray-750 italic font-medium">"{selectedOrder.review}"</p>
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-3">Delivery Address</h3>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedOrder.address}</p>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-semibold"
                >
                  Close
                </button>
              </div>
            </m.div>
          </div>
        )}

        {/* Write Review Modal */}
        {reviewOrder && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <m.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Rate & Review</h2>
                  <button
                    type="button"
                    onClick={handleCloseReviewModal}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-gray-600 mb-4 text-center">
                  How was your experience ordering from <span className="font-semibold">{reviewOrder.restaurant}</span>?
                </p>

                <form onSubmit={handleSubmitReview}>
                  {/* Stars */}
                  <div className="flex justify-center gap-2 mb-6">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className={`text-4xl transition-all duration-150 transform hover:scale-120 focus:outline-none ${
                          star <= reviewRating ? "text-amber-400 drop-shadow-sm" : "text-gray-300 hover:text-amber-300"
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>

                  {/* Review Text */}
                  <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-2 text-sm">
                      Your Review
                    </label>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Tell us what you liked or disliked about your food/delivery..."
                      rows="4"
                      maxLength={500}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50/50"
                      required
                    />
                    <p className="text-right text-xs text-gray-500 mt-1">
                      {reviewText.length}/500 characters
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleCloseReviewModal}
                      className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition"
                      disabled={isSubmittingReview}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-650 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50"
                      disabled={isSubmittingReview}
                    >
                      {isSubmittingReview ? "Submitting..." : "Submit Review"}
                    </button>
                  </div>
                </form>
              </div>
            </m.div>
          </div>
        )}
      </div>
    </div>
  );
}
