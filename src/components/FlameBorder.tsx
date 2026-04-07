import React from 'react';
import { motion } from 'motion/react';

export const FlameBorder: React.FC<{ children: React.ReactNode; className?: string; style?: React.CSSProperties }> = ({ children, className = "", style }) => {
  return (
    <div className={`relative rounded-2xl ${className}`} style={style}>
      {/* Flame Animation Layers */}
      <div className="absolute inset-0 rounded-2xl border border-gold/30 shadow-[0_0_15px_rgba(212,175,55,0.2)]" />
      
      {/* Animated Glow Layers */}
      <motion.div
        animate={{ 
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.02, 1],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 rounded-2xl border-2 border-gold/20 blur-sm pointer-events-none"
      />
      
      <motion.div
        animate={{ 
          boxShadow: [
            "0 0 20px rgba(212,175,55,0.2), inset 0 0 10px rgba(212,175,55,0.1)",
            "0 0 40px rgba(212,175,55,0.4), inset 0 0 20px rgba(212,175,55,0.2)",
            "0 0 20px rgba(212,175,55,0.2), inset 0 0 10px rgba(212,175,55,0.1)"
          ]
        }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 rounded-2xl pointer-events-none"
      />

      {/* Flickering Flame Effect */}
      <div className="absolute -inset-1 rounded-2xl opacity-30 pointer-events-none overflow-hidden">
         <motion.div 
            animate={{ y: [0, -10, 0], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-gold/40 to-transparent blur-xl"
         />
      </div>

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
