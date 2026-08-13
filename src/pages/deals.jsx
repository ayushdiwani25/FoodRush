import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { m } from "framer-motion";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

export default function DealsPage() {
  const navigate = useNavigate();
  const [copiedCode, setCopiedCode] = useState(null);
  const [deals, setDeals] = useState([]);
  const [promos, setPromos] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDealsData = async () => {
      try {
        setLoading(true);
        const dealsSnap = await getDocs(collection(db, "deals"));
        const dealsList = dealsSnap.docs.map(doc => doc.data());
        setDeals(dealsList);

        const promosSnap = await getDocs(collection(db, "promos"));
        const promosList = promosSnap.docs.map(doc => doc.data());
        setPromos(promosList);

        const restSnap = await getDocs(collection(db, "restaurants"));
        const restList = restSnap.docs.map(doc => doc.data());
        setRestaurants(restList);
      } catch (err) {
        console.error("Error fetching deals data from Firestore:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDealsData();
  }, []);

  const handleCopyPromo = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FCFBF7]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFBF7] py-12 px-4 md:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <m.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-left"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-neutral-900 tracking-tight mb-3">
            Special Deals & Offers
          </h1>
          <p className="text-neutral-500 text-base md:text-lg">
            Save big on your favorite restaurants and dishes
          </p>
        </m.div>

        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-14"
        >
          <div className="flex items-center gap-2 mb-6">
            <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-3-12h5.25c.621 0 1.125.504 1.125 1.125v10.75c0 .621-.504 1.125-1.125 1.125H3.75A1.125 1.125 0 012.625 17.25V6.875C2.625 6.254 3.129 5.75 3.75 5.75H13.5m-3-2V5.75M6.75 5.75H10.5m-3.5 12h7" />
            </svg>
            <h2 className="text-2xl font-extrabold text-neutral-900 tracking-tight">Promo Codes</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {promos.map(promo => (
              <m.div
                key={promo.code}
                whileHover={{ y: -4 }}
                className="bg-linear-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white shadow-md hover:shadow-lg transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-wider opacity-85">Promo Code</p>
                    <p className="text-2xl font-black tracking-tight">{promo.code}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyPromo(promo.code)}
                    className="px-4 py-2 bg-white text-orange-600 rounded-xl hover:bg-neutral-50 font-bold transition-all text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    {copiedCode === promo.code ? (
                      <>
                        <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-green-600">Copied</span>
                      </>
                    ) : (
                      <>
                         <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xl font-extrabold mb-1.5">
                  ₹{promo.discount} Off
                </p>
                <p className="text-xs font-medium text-orange-50/90 mb-4 leading-relaxed opacity-95">{promo.description}</p>
                <div className="text-[10px] font-bold bg-white/10 px-2.5 py-1 rounded-full w-fit">
                  Min. order: ₹{promo.minOrder}
                </div>
              </m.div>
            ))}
          </div>
        </m.div>

        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-14"
        >
          <div className="flex items-center gap-2 mb-6">
            <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
            </svg>
            <h2 className="text-2xl font-extrabold text-neutral-900 tracking-tight">Restaurant Offers</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deals.map((deal, index) => {
              const restaurant = restaurants.find(
                r => r.id === deal.restaurantId
              );
              return (
                <m.div
                  key={deal.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  onClick={() => navigate(`/restaurant/${deal.restaurantId}`)}
                  className="bg-white rounded-2xl border border-neutral-100 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1.5"
                >
                  <div className="relative h-40 bg-linear-to-br from-orange-500 to-red-600 flex items-center justify-center">
                    <div className="text-center text-white">
                      <p className="text-5xl font-black tracking-tight">{deal.discount}%</p>
                      <p className="text-sm font-extrabold tracking-widest">OFF</p>
                    </div>
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
                  </div>

                  <div className="p-6 flex flex-col justify-between h-[calc(100%-10rem)]">
                    <div>
                      <h3 className="text-lg font-extrabold text-neutral-900 mb-1.5 tracking-tight">
                        {deal.title}
                      </h3>
                      <p className="text-neutral-500 text-xs mb-4 leading-relaxed line-clamp-2">{deal.description}</p>

                      {restaurant && (
                        <div className="mb-4 pb-4 border-b border-neutral-50">
                          <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mb-1">At Restaurant</p>
                          <p className="font-extrabold text-neutral-800 text-sm hover:text-orange-600 transition">
                            {restaurant.name}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center mt-auto">
                      <span className="text-[10px] font-bold text-neutral-400 bg-neutral-50 border border-neutral-100 px-2.5 py-1 rounded-full">
                        Till {deal.validTill}
                      </span>
                      <button type="button" className="px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 font-bold text-xs cursor-pointer shadow-2xs">
                        Order Now
                      </button>
                    </div>
                  </div>
                </m.div>
              );
            })}
          </div>
        </m.div>

        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-orange-50/50 rounded-3xl p-8 border border-orange-100/50"
        >
          <div className="flex items-center gap-2 mb-6">
            <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-3m0 0V9m0 6h3m-3 0H9m12-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-extrabold text-neutral-900 tracking-tight">
              How to Use Promo Codes
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-5 border border-neutral-100/50 shadow-2xs">
              <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center font-extrabold text-sm mb-4 border border-orange-100/30">1</div>
              <h3 className="font-extrabold text-neutral-900 mb-1.5 text-sm tracking-tight">
                Add Items to Cart
              </h3>
              <p className="text-neutral-500 text-xs leading-relaxed">
                Browse restaurants and add your favorite dishes to your cart
              </p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-neutral-100/50 shadow-2xs">
              <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center font-extrabold text-sm mb-4 border border-orange-100/30">2</div>
              <h3 className="font-extrabold text-neutral-900 mb-1.5 text-sm tracking-tight">
                Copy the Promo Code
              </h3>
              <p className="text-neutral-500 text-xs leading-relaxed">
                Click the copy button to copy any promo code from above
              </p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-neutral-100/50 shadow-2xs">
              <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center font-extrabold text-sm mb-4 border border-orange-100/30">3</div>
              <h3 className="font-extrabold text-neutral-900 mb-1.5 text-sm tracking-tight">
                Apply at Checkout
              </h3>
              <p className="text-neutral-500 text-xs leading-relaxed">
                Paste the code at checkout and enjoy your discount!
              </p>
            </div>
          </div>
        </m.div>
      </div>
    </div>
  );
}
