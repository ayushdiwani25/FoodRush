import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#100F0E] text-neutral-400 border-t border-neutral-900/60 font-sans">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">
        
        <div className="bg-linear-to-br from-orange-500/10 to-red-500/5 rounded-3xl p-8 border border-orange-500/10 mb-12 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="text-center lg:text-left">
            <h3 className="text-xl font-extrabold text-white tracking-tight">Subscribe to our Newsletter</h3>
            <p className="text-neutral-400 text-sm mt-1">Get exclusive offers and weekly coupon codes directly!</p>
          </div>
          <div className="flex w-full lg:w-auto max-w-md gap-2.5">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="bg-neutral-900/80 border border-neutral-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:border-orange-500 w-full placeholder-neutral-600"
            />
            <button className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition duration-300 whitespace-nowrap cursor-pointer">
              Subscribe
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2.5 w-fit">
              <img
                src="https://cdn-icons-png.flaticon.com/512/3075/3075977.png"
                alt="FoodRush Logo"
                className="w-8 h-8 md:w-9 md:h-9"
              />
              <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
                Food<span className="text-orange-500">Rush</span>
              </h2>
            </Link>
            <p className="text-neutral-500 text-sm leading-relaxed max-w-xs">
              Delivering happiness to your doorstep. Fresh, delicious food and fast service anytime, anywhere!
            </p>
            <div className="flex gap-3 pt-2">
              <a href="#" className="w-8 h-8 rounded-lg bg-neutral-900 hover:bg-orange-600 hover:text-white transition flex items-center justify-center text-neutral-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z"/>
                </svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-neutral-900 hover:bg-orange-600 hover:text-white transition flex items-center justify-center text-neutral-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.31 3.02c3.08 0 3.45.01 4.67.07 1.13.05 1.74.24 2.15.4 1.12.43 1.9.96 2.73 1.8.84.83 1.37 1.61 1.8 2.72.16.42.35 1.03.4 2.16.06 1.21.07 1.58.07 4.66s-.01 3.45-.07 4.67c-.05 1.13-.24 1.74-.4 2.15-.43 1.12-.96 1.9-1.8 2.73-.83.84-1.61 1.37-2.72 1.8-.42.16-1.03.35-2.16.4-1.21.06-1.58.07-4.66.07s-3.45-.01-4.67-.07c-1.13-.05-1.74-.24-2.15-.4-1.12-.43-1.9-.96-2.73-1.8-.84-.83-1.37-1.61-1.8-2.72-.16-.42-.35-1.03-.4-2.16C3.03 16.92 3.02 16.55 3.02 13.47s.01-3.45.07-4.67c.05-1.13.24-1.74.4-2.15.43-1.12.96-1.9 1.8-2.73.83-.84 1.61-1.37 2.72-1.8.42-.16 1.03-.35 2.16-.4 1.21-.06 1.58-.07 4.66-.07m0-3c-3.13 0-3.52.01-4.75.07-1.23.06-2.07.25-2.81.54A6.12 6.12 0 001.99 3.39c-.93.93-1.5 2-1.79 2.8-.29.74-.48 1.58-.54 2.81C.01 9.4 0 9.8 0 12.93s.01 3.52.07 4.75c.06 1.23.25 2.07.54 2.81a6.12 6.12 0 002.76 2.76c.8.29 1.63.48 2.8.54 1.24.06 1.63.07 4.76.07s3.52-.01 4.75-.07c1.24-.06 2.07-.25 2.81-.54a6.12 6.12 0 002.76-2.76c.29-.8.48-1.63.54-2.8 0-1.24.07-1.63.07-4.76s-.01-3.52-.07-4.75c-.06-1.24-.25-2.07-.54-2.81a6.12 6.12 0 00-2.76-2.76c-.8-.29-1.63-.48-2.8-.54-1.23-.06-1.62-.07-4.75-.07z"/>
                </svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-neutral-900 hover:bg-orange-600 hover:text-white transition flex items-center justify-center text-neutral-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.56v.02c-.89.39-1.85.66-2.86.78 1.03-.62 1.82-1.6 2.2-2.77-.96.57-2.03.98-3.17 1.21-.9-.96-2.19-1.56-3.62-1.56-2.74 0-4.96 2.22-4.96 4.96 0 .39.04.77.12 1.14-4.12-.21-7.78-2.18-10.22-5.18-.43.74-.68 1.6-.68 2.5 0 1.72.88 3.24 2.22 4.14-.82-.03-1.59-.25-2.26-.63v.06c0 2.4 1.71 4.4 3.98 4.86-.42.11-.86.17-1.31.17-.32 0-.63-.03-.94-.09.63 1.97 2.46 3.4 4.63 3.44-1.7 1.33-3.84 2.12-6.17 2.12-.4 0-.8-.02-1.2-.07 2.2 1.41 4.81 2.24 7.62 2.24 9.14 0 14.14-7.57 14.14-14.14 0-.22 0-.43-.02-.65 1-.72 1.83-1.61 2.5-2.63z"/>
                </svg>
              </a>
            </div>
          </div>

          <div className="space-y-4 md:pl-10">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/" className="text-neutral-400 hover:text-orange-500 transition duration-300">Home</Link></li>
              <li><Link to="/food" className="text-neutral-400 hover:text-orange-500 transition duration-300">Menu</Link></li>
              <li><Link to="/restaurants" className="text-neutral-400 hover:text-orange-500 transition duration-300">Restaurants</Link></li>
              <li><Link to="/deals" className="text-neutral-400 hover:text-orange-500 transition duration-300">Deals & Coupons</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Contact</h3>
            <ul className="space-y-3.5 text-sm text-neutral-400">
              <li className="flex items-center gap-3">
                <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>+91 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 00-2 2z" />
                </svg>
                <span>hello@foodrush.com</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>123 Food Street, City</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>9 AM - 11 PM Daily</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-neutral-900/80 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-neutral-500">
          <p className="text-center md:text-left">&copy; {currentYear} FoodRush. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-6">
            <a href="#" className="hover:text-orange-500 transition duration-300">Privacy Policy</a>
            <a href="#" className="hover:text-orange-500 transition duration-300">Terms of Service</a>
            <a href="#" className="hover:text-orange-500 transition duration-300">Cookies</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
