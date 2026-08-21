'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, ShieldCheck, Tag, Star, ArrowRight, 
  Filter, Sparkles, CheckCircle2, Search, Shirt, Trophy
} from 'lucide-react';
import Navbar from '../../components/Navbar';

const STORE_ITEMS = [
  {
    id: 's1',
    title: 'Yonex Astrox 99 Pro Badminton Racket',
    brand: 'YONEX',
    category: 'Equipment',
    price: '₹14,999',
    originalPrice: '₹18,000',
    discount: '16% OFF',
    rating: 4.9,
    sponsorBadge: 'OFFICIAL EQUIPMENT PARTNER',
    imgUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 's2',
    title: 'Custom Pro Team Dri-Fit Jersey (Name + Number)',
    brand: 'SPORTORA APPAREL',
    category: 'Jerseys',
    price: '₹899',
    originalPrice: '₹1,499',
    discount: '40% OFF',
    rating: 5.0,
    sponsorBadge: 'CUSTOM TEAM KIT',
    imgUrl: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 's3',
    title: 'Red Bull Energy Pack (24 Cans + Gym Shaker)',
    brand: 'RED BULL',
    category: 'Nutrition',
    price: '₹2,400',
    originalPrice: '₹3,000',
    discount: '20% OFF',
    rating: 4.8,
    sponsorBadge: 'OFFICIAL HYDRATION SPONSOR',
    imgUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 's4',
    title: 'Puma Non-Marking Indoor Court Shoes',
    brand: 'PUMA',
    category: 'Footwear',
    price: '₹4,500',
    originalPrice: '₹6,000',
    discount: '25% OFF',
    rating: 4.7,
    sponsorBadge: 'ARENA FOOTWEAR SPONSOR',
    imgUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600',
  }
];

export default function StorePage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cartCount, setCartCount] = useState(0);

  const filteredItems = STORE_ITEMS.filter(
    (item) => selectedCategory === 'All' || item.category === selectedCategory
  );

  return (
    <main className="min-h-screen bg-[#080B10] text-white selection:bg-[#00FF66] selection:text-black pt-28 pb-20 px-6">
      <Navbar />

      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* HERO SPONSOR BANNER */}
        <div className="clean-glass rounded-[36px] p-8 sm:p-12 border border-[#00FF66]/30 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00FF66]/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="space-y-4 max-w-2xl relative z-10 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00FF66]/10 border border-[#00FF66]/40 text-xs font-mono font-bold text-[#00FF66]">
              <Sparkles className="w-4 h-4" /> OFFICIAL SPONSORS & EQUIPMENT MARKETPLACE
            </div>

            <h1 className="text-4xl sm:text-6xl font-black italic tracking-tight text-white uppercase">
              GEAR UP FOR <span className="text-[#00FF66]">VICTORY</span>
            </h1>

            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
              Buy verified equipment, custom team jerseys, and pro nutrition directly from official tournament sponsors with exclusive athlete discounts.
            </p>
          </div>

          {/* Cart Status Badge */}
          <div className="bg-black/60 p-6 rounded-3xl border border-white/10 text-center shrink-0 w-full sm:w-auto">
            <div className="text-xs font-mono text-gray-400 uppercase">MY ARENA CART</div>
            <div className="text-3xl font-black text-[#00FF66] my-1">{cartCount} ITEMS</div>
            <button className="w-full bg-[#00FF66] text-black font-extrabold text-xs uppercase px-6 py-2.5 rounded-full hover:bg-emerald-300 transition-all flex items-center justify-center gap-1.5">
              <ShoppingBag className="w-4 h-4" /> CHECKOUT
            </button>
          </div>
        </div>

        {/* CATEGORY FILTER & BRAND TICKER */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/10 pb-6">
          
          <div className="flex gap-2 overflow-x-auto w-full sm:w-auto">
            {['All', 'Equipment', 'Jerseys', 'Footwear', 'Nutrition'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all italic ${
                  selectedCategory === cat
                    ? 'bg-[#00FF66] text-black shadow-lg shadow-[#00FF66]/20'
                    : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="text-xs font-mono text-gray-500 uppercase tracking-widest">
            • 100% ORIGINAL SPONSOR GUARANTEE
          </div>

        </div>

        {/* PRODUCTS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ y: -8 }}
              className="clean-glass rounded-3xl overflow-hidden border border-white/10 hover:border-[#00FF66]/50 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="relative h-52 bg-black overflow-hidden">
                  <img
                    src={item.imgUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter contrast-110"
                  />
                  <span className="absolute top-3 left-3 bg-[#00FF66] text-black text-[10px] font-black px-3 py-1 rounded-full uppercase">
                    {item.discount}
                  </span>
                  <span className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md text-[#00FF66] text-[9px] font-bold px-2.5 py-1 rounded-md border border-[#00FF66]/30">
                    {item.sponsorBadge}
                  </span>
                </div>

                <div className="p-5">
                  <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 mb-1">
                    <span>{item.brand}</span>
                    <span className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star className="w-3 h-3 fill-amber-400" /> {item.rating}
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-base leading-snug group-hover:text-[#00FF66] transition-colors">
                    {item.title}
                  </h3>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-white/5 flex items-center justify-between mt-4">
                <div>
                  <span className="text-xs text-gray-500 line-through mr-2">{item.originalPrice}</span>
                  <span className="text-xl font-black text-[#00FF66]">{item.price}</span>
                </div>

                <button
                  onClick={() => setCartCount(cartCount + 1)}
                  className="bg-white/10 hover:bg-[#00FF66] hover:text-black text-white p-3 rounded-full transition-all"
                >
                  <ShoppingBag className="w-4 h-4" />
                </button>
              </div>

            </motion.div>
          ))}
        </div>

      </div>
    </main>
  );
}
