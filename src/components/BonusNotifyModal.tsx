import React from 'react';
import { motion } from 'motion/react';
import { Rocket } from 'lucide-react';
import { GameState } from '../types';

export const BonusNotifyModal: React.FC<{
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  setShowBonusNotify: (show: boolean) => void;
  setActiveSection: (section: 'genesis' | 'fate' | 'tree') => void;
  setShowResultModal: (show: boolean) => void;
}> = ({ gameState, setGameState, setShowBonusNotify, setActiveSection, setShowResultModal }) => (
  <motion.div 
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 p-6"
  >
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="max-w-md w-full bg-transparent backdrop-blur-[10px] border border-white/20 p-8 rounded-3xl text-center shadow-2xl"
    >
      <Rocket className="text-gold mx-auto mb-6" size={48} />
      <h3 className="text-2xl font-light text-gold mb-4 uppercase tracking-tight">Доступно Древо Жизни!</h3>
      <p className="text-white/80 text-sm leading-relaxed mb-8">
        Для этого пути доступен бонус: <span className="text-gold font-bold">{gameState.pendingResult?.accelerationBonus?.name || 'Особый бонус'}</span>. 
        Перейдите на страницу <span className="text-gold">Дерево Жизни</span>, чтобы активировать его. 
        Без бонуса шанс негативных последствий составляет 50%.
      </p>
      <div className="flex flex-col gap-3">
        <button 
          onClick={() => {
            setShowBonusNotify(false);
            setActiveSection('tree');
          }}
          className="w-full py-4 bg-gold text-black font-bold rounded-xl hover:bg-white transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)]"
        >
          ПЕРЕЙТИ К ДЕРЕВУ ЖИЗНИ
        </button>
        <button 
          onClick={() => {
            setShowBonusNotify(false);
            setGameState(prev => ({ ...prev, pendingResult: { ...prev.pendingResult, accelerationBonus: null }, accelerationBonus: null }));
            setShowResultModal(true);
          }}
          className="w-full py-4 bg-white/5 border border-white/10 text-white/60 rounded-xl hover:bg-white/10 transition-colors"
        >
          ПРОДОЛЖИТЬ БЕЗ БОНУСА
        </button>
      </div>
    </motion.div>
  </motion.div>
);
