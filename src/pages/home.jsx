import React from "react";
import { m } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { OptimizedImage } from "../components/ui";

export default function Home() {
  const navigate = useNavigate();

  const galleryItems = [
    { id: 1, label: "Pizza", category: "Pizza", img: "https://res.cloudinary.com/dyoht5hxt/image/upload/f_auto,q_auto,w_500,h_400,c_fill/v1780460244/Margherita-Royale_go5p4a.png" },
    { id: 2, label: "Burger", category: "Burger", img: "https://res.cloudinary.com/dyoht5hxt/image/upload/f_auto,q_auto,w_500,h_400,c_fill/v1780460238/Classic-Smash-Burger_amwrwx.png" },
    { id: 3, label: "Cold Drink", category: "Drinks", img: "https://res.cloudinary.com/dyoht5hxt/image/upload/f_auto,q_auto,w_500,h_400,c_fill/v1780460244/Mango-Chiller_viabwr.png" },
  ];

  return (
    <div className="relative min-h-screen bg-[#FCFBF7] text-neutral-800 flex flex-col font-sans">
      
      <section 
        aria-label="Hero Section"
        className="relative w-full overflow-hidden bg-cover bg-center bg-no-repeat flex flex-col justify-center min-h-[85vh] lg:min-h-[90vh] px-6 lg:px-20 py-20"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.3) 60%, rgba(252, 251, 247, 1) 100%), url(https://res.cloudinary.com/dyoht5hxt/image/upload/f_auto,q_auto,w_1920,c_fill/v1780460184/background_zbrr9a.jpg)`,
        }}
      >
        <m.div 
          className="relative z-10 max-w-4xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <m.h1 
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-extrabold text-white drop-shadow-md leading-[1.15] mb-6 tracking-tight"
          >
            Deliciousness <br /> 
            Delivered <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-400 to-amber-300">To Your Door</span>
          </m.h1>

          <m.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-lg md:text-xl text-neutral-100 max-w-2xl mb-8 leading-relaxed drop-shadow-xs"
          >
            Craving something delicious? Order from the best local restaurants. Fast delivery, fresh food, and great deals right to your doorstep.
          </m.p>

          <m.button
            onClick={() => navigate("/food")}
            aria-label="Explore food menu"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-lg rounded-xl shadow-lg transition-all duration-300 tracking-wide flex items-center gap-2.5 w-fit cursor-pointer min-h-[48px] focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
          >
            <span>Explore Food</span>
            <m.span
              aria-hidden="true"
              animate={{ x: [0, 6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              →
            </m.span>
          </m.button>

          <m.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex gap-4 pt-12 flex-wrap"
          >
            <m.div 
              className="flex flex-col bg-white/10 backdrop-blur-md rounded-xl px-5 py-4 border border-white/10 shadow-xs"
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.15)" }}
            >
              <span className="text-3xl font-black text-amber-300">1000+</span>
              <span className="text-xs text-neutral-200 font-bold tracking-wide uppercase mt-1">Dishes</span>
            </m.div>
            <m.div 
              className="flex flex-col bg-white/10 backdrop-blur-md rounded-xl px-5 py-4 border border-white/10 shadow-xs"
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.15)" }}
            >
              <span className="text-3xl font-black text-amber-300">50+</span>
              <span className="text-xs text-neutral-200 font-bold tracking-wide uppercase mt-1">Restaurants</span>
            </m.div>
            <m.div 
              className="flex flex-col bg-white/10 backdrop-blur-md rounded-xl px-5 py-4 border border-white/10 shadow-xs"
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.15)" }}
            >
              <span className="text-3xl font-black text-amber-300">⭐ 4.8</span>
              <span className="text-xs text-neutral-200 font-bold tracking-wide uppercase mt-1">Rating</span>
            </m.div>
          </m.div>
        </m.div>
      </section>

      <section 
        aria-label="About FoodRush"
        className="relative bg-[#FAF9F6] border-y border-neutral-100/50 py-24 px-6 lg:px-20"
      >
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-linear-to-br from-orange-500 to-red-500 rounded-2xl shadow-lg shadow-orange-500/20 flex items-center justify-center text-white">
          <svg aria-hidden="true" className="w-9 h-9" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 3v7a6 6 0 006 6v3a2 2 0 002 2h0a2 2 0 002-2v-3a6 6 0 006-6V3M9 3v4M15 3v4" />
          </svg>
        </div>
        
        <m.div 
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-extrabold text-neutral-900 mb-6 tracking-tight mt-4">
            About Us
          </h2>
          <p className="text-neutral-600 max-w-3xl mx-auto text-lg leading-relaxed font-medium">
            At <span className="font-extrabold text-orange-600">FoodRush</span>, we believe food is not just about eating, it's about
            creating unforgettable experiences. Our mission is to connect you with the best cuisines and deliver your favorite meals quickly and safely. Whether you love pizza, burgers, or refreshing drinks, we've got something special for you.
          </p>
        </m.div>
      </section>

      <section 
        aria-label="Featured Food Categories"
        className="max-w-6xl mx-auto w-full px-6 py-20 relative z-20"
      >
        <m.div 
          className="grid grid-cols-1 sm:grid-cols-3 gap-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          {galleryItems.map((item) => (
            <m.article
              key={item.id}
              role="button"
              tabIndex={0}
              aria-label={`Explore ${item.label} category`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative overflow-hidden rounded-3xl shadow-md group cursor-pointer h-80 border border-neutral-100 hover:border-orange-500/30 transition-all duration-300 focus-visible:ring-4 focus-visible:ring-orange-500 focus-visible:outline-none"
              onClick={() => navigate('/food', { state: { category: item.category } })}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  navigate('/food', { state: { category: item.category } });
                }
              }}
            >
              <div className="absolute inset-0 bg-linear-to-t from-neutral-900/80 via-neutral-900/10 to-transparent z-10 transition-all duration-300 pointer-events-none"></div>
              
              <OptimizedImage
                src={item.img}
                alt={`${item.label} food category`}
                className="w-full h-full"
                aspectRatio="h-full"
              />
              
              <m.div
                className="absolute bottom-5 left-5 right-5 bg-white/95 backdrop-blur-md py-4 px-5 rounded-2xl flex items-center justify-between z-20 border border-white/40 shadow-lg"
                initial={{ y: 5, opacity: 0.95 }}
                whileHover={{ y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div>
                  <h3 className="text-neutral-950 font-extrabold text-base tracking-tight">{item.label}</h3>
                  <p className="text-orange-600 text-xs font-bold flex items-center gap-1 mt-0.5">
                    Explore menu
                    <svg aria-hidden="true" className="w-3 h-3 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </p>
                </div>
                <div className="w-9 h-9 rounded-full bg-orange-50 border border-orange-100/50 flex items-center justify-center text-orange-600">
                  {item.id === 1 && (
                    <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 22h20L12 2zM12 6l6 12H6L12 6z" />
                      <circle cx="12" cy="13" r="1.5" fill="currentColor" />
                      <circle cx="9" cy="15" r="1" fill="currentColor" />
                      <circle cx="15" cy="15" r="1" fill="currentColor" />
                    </svg>
                  )}
                  {item.id === 2 && (
                    <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10a4 4 0 018 0h2a4 4 0 018 0M3 14h18M3 17h18a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                  )}
                  {item.id === 3 && (
                    <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 3h12l-2 18H8L6 3zM6 8h12M15 3l1 3" />
                    </svg>
                  )}
                </div>
              </m.div>
            </m.article>
          ))}
        </m.div>
      </section>

      <section 
        aria-label="Order Call To Action"
        className="max-w-5xl mx-auto px-6 pb-24 w-full relative z-20"
      >
        <m.div
          className="bg-linear-to-br from-orange-500 to-red-600 rounded-3xl p-12 shadow-xl shadow-orange-500/10 border border-orange-500/20 text-white text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.01 }}
        >
          <h3 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
            Ready to Order?
          </h3>
          <p className="text-orange-50 text-base md:text-lg mb-8 max-w-2xl mx-auto">
            Discover delicious meals from your favorite local restaurants ready to be delivered straight to your door.
          </p>
          <m.button
            onClick={() => navigate("/food")}
            aria-label="Browse full food menu"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-4 bg-white text-orange-600 font-extrabold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 text-lg cursor-pointer min-h-[48px] focus-visible:ring-4 focus-visible:ring-white focus-visible:outline-none"
          >
            Browse Menu →
          </m.button>
        </m.div>
      </section>
    
    </div>
  );
}
