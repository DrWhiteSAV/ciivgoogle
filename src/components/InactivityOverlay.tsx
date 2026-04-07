import React from 'react';
import { motion } from 'motion/react';
import { SpaceBackground } from './SpaceBackground';

interface InactivityOverlayProps {
  onContinue: () => void;
}

export const InactivityOverlay: React.FC<InactivityOverlayProps> = ({ onContinue }) => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/90 backdrop-blur-md">
      <SpaceBackground />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center text-center max-w-md px-6"
      >
        <motion.div
          animate={{ 
            filter: ["drop-shadow(0 0 20px rgba(212,175,55,0.3))", "drop-shadow(0 0 60px rgba(212,175,55,0.7))", "drop-shadow(0 0 20px rgba(212,175,55,0.3))"],
            scale: [1, 1.05, 1]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="w-full max-w-xs mb-12"
        >
          <img src="https://i.ibb.co/D0mRFhJ/civilogo.png" alt="Logo" className="w-full glow-gold-lg" />
        </motion.div>

        <h2 className="text-3xl font-light text-gold glow-gold mb-6 uppercase tracking-widest">
          Вы еще здесь?
        </h2>
        
        <p className="text-white/60 font-mono text-sm leading-relaxed mb-12">
          Система обнаружила отсутствие активности. Начисление лет и молитв приостановлено для защиты баланса мироздания.
        </p>

        <motion.button
          whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(212,175,55,0.4)" }}
          whileTap={{ scale: 0.95 }}
          onClick={onContinue}
          className="px-12 py-4 bg-gold text-black rounded-xl font-mono text-sm uppercase tracking-[0.3em] font-bold shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-all"
        >
          Продолжить игру
        </motion.button>
      </motion.div>
    </div>
  );
};
