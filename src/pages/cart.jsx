import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../hooks";
import { OptimizedImage } from "../components/ui";

export default function Cart() {
  const { cartItems, subtotal, deliveryFee, tax, grandTotal, updateQty, removeItem } = useCart();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50/50 to-yellow-50/50 py-8 px-4 md:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold text-center text-neutral-900 mb-8 tracking-tight">
          Your Shopping Cart
        </h1>

        {cartItems.length === 0 ? (
          <div className="text-center bg-white p-12 rounded-3xl shadow-xs border border-neutral-100 max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 text-neutral-300 flex items-center justify-center" aria-hidden="true">
              <svg className="w-14 h-14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-neutral-800 mb-2">Your cart is empty</h2>
            <p className="text-sm text-neutral-500 mb-6">Looks like you haven't added any delicious dishes yet.</p>
            <button
              type="button"
              onClick={() => navigate("/food")}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-extrabold transition cursor-pointer shadow-sm focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none"
            >
              Explore Menu
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <main className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <article
                  key={item.id}
                  className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 md:p-5 rounded-2xl border border-neutral-100 shadow-xs hover:shadow-md transition"
                >
                  <div className="w-full sm:w-28 h-28 shrink-0 rounded-xl overflow-hidden">
                    <OptimizedImage
                      src={item.img}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      aspectRatio="h-full"
                    />
                  </div>

                  <div className="flex-1 w-full">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="font-extrabold text-base text-neutral-900">{item.name}</h2>
                        {item.restaurantName && (
                          <p className="text-xs text-orange-600 font-bold mt-0.5">
                            From: {item.restaurantName}
                          </p>
                        )}
                      </div>
                      <span className="text-lg font-black text-neutral-900">
                        ₹{Number(item.price) * (item.qty || 1)}
                      </span>
                    </div>

                    <div className="mt-1">
                      {item.veg ? (
                        <span className="text-[11px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-md inline-flex items-center gap-1 border border-green-200/50">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" aria-hidden="true"></span> Veg
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-md inline-flex items-center gap-1 border border-red-200/50">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" aria-hidden="true"></span> Non-Veg
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-50">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateQty(item.id, (item.qty || 1) - 1)}
                          aria-label={`Decrease quantity of ${item.name}`}
                          className="min-w-[36px] min-h-[36px] bg-neutral-100 hover:bg-orange-100 text-neutral-800 hover:text-orange-600 rounded-lg font-bold flex items-center justify-center transition focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none"
                        >
                          −
                        </button>

                        <span className="font-extrabold text-sm px-3 min-w-[24px] text-center" aria-label={`Quantity: ${item.qty || 1}`}>
                          {item.qty || 1}
                        </span>

                        <button
                          type="button"
                          onClick={() => updateQty(item.id, (item.qty || 1) + 1)}
                          aria-label={`Increase quantity of ${item.name}`}
                          className="min-w-[36px] min-h-[36px] bg-neutral-100 hover:bg-orange-100 text-neutral-800 hover:text-orange-600 rounded-lg font-bold flex items-center justify-center transition focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        aria-label={`Remove ${item.name} from cart`}
                        className="text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition min-h-[36px] flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none"
                      >
                        <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </main>

            <aside className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-lg sticky top-24">
              <h2 className="text-lg font-black text-neutral-900 mb-4 border-b border-neutral-100 pb-3">Order Summary</h2>

              <div className="space-y-2.5 text-sm mb-4">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-neutral-900">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Delivery Fee</span>
                  <span className="font-bold text-neutral-900">
                    {deliveryFee === 0 ? <span className="text-green-600 font-extrabold">FREE</span> : `₹${deliveryFee}`}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Estimated Tax (5%)</span>
                  <span className="font-bold text-neutral-900">₹{tax.toFixed(0)}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100 flex justify-between text-lg font-black text-neutral-900 mb-6">
                <span>Total</span>
                <span className="text-orange-600">₹{grandTotal.toFixed(0)}</span>
              </div>

              <button
                type="button"
                onClick={() => navigate("/checkout")}
                aria-label="Proceed to checkout"
                className="w-full bg-linear-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-3.5 rounded-xl font-extrabold text-base transition-all transform hover:scale-[1.02] shadow-md flex items-center justify-center gap-2 cursor-pointer min-h-[48px] focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none"
              >
                <span>Proceed to Checkout</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}