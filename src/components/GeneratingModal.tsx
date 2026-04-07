import React from 'react';
import { motion } from 'motion/react';
import { ZapOff } from 'lucide-react';
import { SpaceBackground } from './SpaceBackground';

export const GeneratingModal: React.FC<{
  isGenerating: boolean;
  generationTimer: number;
  generationError: string | null;
  setGenerationError: (error: string | null) => void;
  setIsGenerating: (is: boolean) => void;
}> = ({ isGenerating, generationTimer, generationError, setGenerationError, setIsGenerating }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-6 backdrop-blur-md"
  >
    <SpaceBackground />
    <div className="max-w-md w-full text-center bg-transparent p-12 rounded-[40px] border border-white/10 shadow-2xl relative overflow-hidden">
      {/* Radial Pulse Background */}
      <motion.div 
        animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute inset-0 bg-gold/20 rounded-full blur-[100px] pointer-events-none"
      />

      {isGenerating ? (
        <>
          <div className="relative w-32 h-32 mx-auto mb-8">
            {/* Rotating Progress Border */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="60"
                stroke="rgba(212, 175, 55, 0.1)"
                strokeWidth="4"
                fill="transparent"
              />
              <motion.circle
                cx="64"
                cy="64"
                r="60"
                stroke="#D4AF37"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray="377"
                initial={{ strokeDashoffset: 377 }}
                animate={{ strokeDashoffset: 377 - (377 * (generationTimer / 60)) }}
                transition={{ duration: 1, ease: "linear" }}
              />
            </svg>
            
            {/* Logo */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  filter: ["drop-shadow(0 0 5px rgba(212,175,55,0.3))", "drop-shadow(0 0 20px rgba(212,175,55,0.7))", "drop-shadow(0 0 5px rgba(212,175,55,0.3))"]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="relative"
              >
                <motion.img 
                  src="https://i.ibb.co/VW4W5PQs/Ciivbut.png" 
                  alt="Butterfly Logo" 
                  className="w-20 h-20 object-contain"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                />
              </motion.div>
            </div>
          </div>

          <h3 className="text-2xl font-light text-gold mb-4 uppercase tracking-widest relative z-10">Ткач судеб работает...</h3>
          <p className="text-white/60 mb-8 relative z-10">Нити времени переплетаются, создавая ваше будущее.</p>
          
          <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest relative z-10">Ожидание: {generationTimer}с / 60с</p>
        </>
      ) : (
        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl">
          <ZapOff size={48} className="text-red-400 mx-auto mb-6" />
          <h3 className="text-xl font-light text-white mb-4 uppercase tracking-widest">Ткач немного устал</h3>
          <p className="text-white/60 text-sm mb-8 leading-relaxed">{generationError}</p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => {
                setGenerationError(null);
              }}
              className="w-full py-4 bg-gold text-black font-bold rounded-xl hover:bg-white transition-all"
            >
              ПОПРОБОВАТЬ СНОВА
            </button>
            <button 
              onClick={() => {
                setGenerationError(null);
                setIsGenerating(false);
              }}
              className="w-full py-4 bg-white/5 border border-white/10 text-white/60 rounded-xl hover:bg-white/10 transition-colors"
            >
              ВЕРНУТЬСЯ
            </button>
          </div>
        </div>
      )}
    </div>
  </motion.div>
);
