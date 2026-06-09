import React from "react";
import { motion, AnimatePresence } from "framer-motion";

// CSS-based Pixel Art Tamagotchi
const CssTamagotchi = () => (
  <div className="relative w-16 h-16 mb-4 mt-2 scale-110">
    {/* Pixel Afro (using blocky shadows to simulate pixels) */}
    <div className="absolute -top-3 left-2 w-12 h-6 bg-[#5c3a21] z-10" />
    <div className="absolute -top-4 left-4 w-8 h-8 bg-[#5c3a21] z-10" />
    <div className="absolute -top-1 -left-1 w-18 h-8 bg-[#5c3a21] z-10" style={{ width: '4.5rem' }} />

    {/* Pixel Body */}
    <div className="absolute inset-0 top-2 bg-panel border-4 border-main z-20 flex flex-col items-center pt-2">
      {/* Pixel Screen */}
      <div className="w-10 h-6 bg-[#E4E3BC] border-2 border-main flex items-center justify-center mt-1">
        <div className="flex gap-1.5 items-end h-full pb-1">
          <div className="w-1 h-1 bg-main animate-pulse"></div>
          <div className="w-2 h-0.5 bg-main mb-0.5"></div>
          <div className="w-1 h-1 bg-main animate-pulse"></div>
        </div>
      </div>
      {/* Pixel Buttons */}
      <div className="flex gap-1.5 mt-2">
        <div className="w-1.5 h-1.5 bg-main"></div>
        <div className="w-1.5 h-1.5 bg-main"></div>
        <div className="w-1.5 h-1.5 bg-main"></div>
      </div>
    </div>

    {/* Pixel Trash Can */}
    <motion.div 
      animate={{ y: [-2, 2, -2] }}
      transition={{ duration: 1.5, repeat: Infinity, steps: 4 }}
      className="absolute -bottom-1 -right-6 w-6 h-8 z-30"
    >
      <div className="w-6 h-1.5 bg-main relative z-20">
         <div className="w-3 h-1 bg-main absolute -top-1 left-1.5"></div>
      </div>
      <div className="w-5 h-6 bg-[#f87171] mx-auto border-x-2 border-b-2 border-main flex justify-center gap-0.5 pt-1">
         <div className="w-0.5 h-3 bg-white/60"></div>
         <div className="w-0.5 h-3 bg-white/60"></div>
      </div>
    </motion.div>
  </div>
);

export default function ConfirmModal({ isOpen, title, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-main/20 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-surface rounded-[2rem] p-6 max-w-xs w-full shadow-xl flex flex-col items-center text-center relative border-none"
          >
            {/* The Bouncing Pure CSS Afro Tamagotchi */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="mt-2"
            >
              <CssTamagotchi />
            </motion.div>

            {/* Title / Question */}
            <h2 className="text-sm font-semibold text-main mb-6 px-2 leading-relaxed opacity-90">
              {title}
            </h2>

            {/* Action Buttons */}
            <div className="flex gap-3 w-full">
              <button
                onClick={onCancel}
                className="flex-1 py-2.5 rounded-xl bg-panel text-main/70 text-xs font-bold hover:bg-hover hover:text-main transition-colors border-none"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 py-2.5 rounded-xl bg-[#f87171] text-white text-xs font-bold hover:bg-red-500 transition-colors shadow-sm border-none"
              >
                Confirm
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
