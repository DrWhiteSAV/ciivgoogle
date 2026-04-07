import React from 'react';
import { motion } from 'motion/react';
import { GameState } from '../types';

export const GameOverModal: React.FC<{
  gameState: GameState;
  resetGame: () => void;
}> = ({ gameState, resetGame }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="fixed inset-0 z-[300] flex items-center justify-center bg-black p-6 overflow-y-auto"
  >
    <div className="max-w-2xl w-full text-center space-y-8 py-12">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <h2 className="text-5xl md:text-7xl font-display text-red-600 uppercase tracking-widest mb-4">
          Цивилизация погибла
        </h2>
        <div className="h-px w-full bg-gradient-to-r from-transparent via-red-600 to-transparent mb-8" />
      </motion.div>

      <div className="space-y-6 text-white/70 font-serif italic text-lg leading-relaxed">
        <p>
          Нити судьбы оборвались. Популяция вашей расы сократилась до критического минимума, 
          недостаточного для поддержания генетического разнообразия и социальной структуры.
        </p>
        <p>
          История {gameState.race.name} на планете {gameState.planet.name} подошла к концу в {gameState.year} году. 
          Ваши достижения и ошибки станут лишь пылью в бесконечном космосе.
        </p>
      </div>

      <div className="pt-12 space-y-4">
        <p className="text-gold/40 font-mono text-xs uppercase tracking-[0.3em] mb-8">
          Титры: Ткач Судеб CIIV
        </p>
        <button
          onClick={resetGame}
          className="px-12 py-4 bg-white text-black font-bold uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all rounded-full"
        >
          Начать новый цикл
        </button>
      </div>
    </div>
  </motion.div>
);
