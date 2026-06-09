import React from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

// Hero section with characters and search bar
export default function Hero({ searchQuery, setSearchQuery }) {
  return (
    <div className="relative w-full max-w-4xl mx-auto mb-8">
      <div className="flex justify-between items-end relative z-10 w-[110%] -ml-[5%] px-4 sm:px-0">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="relative group -ml-8 sm:-ml-16 md:-ml-24 z-20"
        >
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-2xl shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-sm font-bold text-main border-none">
            อุ๊ย.. แชร์จอเลยครับ
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-none"></div>
          </div>
          <img
            src="/kkan.png"
            alt="Kkan"
            className="w-32 sm:w-40 md:w-56 h-auto drop-shadow-xl"
          />
        </motion.div>

        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="relative group -mr-8 sm:-mr-16 md:-mr-24 z-10"
        >
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-2xl shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-sm font-bold text-main border-none">
            Happy Coding ครับ!
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-none"></div>
          </div>
          <img
            src="/kneeti.png"
            alt="Kneeti"
            className="w-32 sm:w-40 md:w-56 h-auto drop-shadow-xl scale-x-[-1]"
          />
        </motion.div>
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl px-4 z-30 mt-8">
        <div className="relative group/search">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-main/40 group-focus-within/search:text-main transition-colors">
            <Search size={20} />
          </div>
          <input
            type="text"
            placeholder="Search docs, snippets, or stacks..."
            className="w-full bg-white py-4 pl-12 pr-6 rounded-2xl shadow-sm focus:shadow-md focus:outline-none text-main placeholder:text-main/40 font-medium transition-all border-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}