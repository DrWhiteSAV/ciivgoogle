import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Zap } from 'lucide-react';
import { Tech } from '../types';
import { CircularProgress } from './CircularProgress';

export const TechCard: React.FC<{ 
  tech: Tech; 
  onStart: (id: string) => void; 
  onComplete: (id: string) => void;
}> = ({ tech, onStart, onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(tech.duration);

  useEffect(() => {
    if (!tech.startTime || tech.completed) return;
    
    const interval = setInterval(() => {
      const elapsed = (Date.now() - tech.startTime!) / 1000;
      const p = Math.min((elapsed / tech.duration) * 100, 100);
      setProgress(p);
      setTimeLeft(Math.max(tech.duration - elapsed, 0));
      
      if (p >= 100) {
        onComplete(tech.id);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [tech.startTime, tech.completed, tech.duration, tech.id, onComplete]);

  return (
    <div 
      className={`bg-transparent border p-6 rounded-2xl flex flex-col items-center text-center group transition-all ${
        tech.completed ? 'border-gold/50 bg-gold/5' : 'border-white/10 hover:border-gold/30'
      }`}
    >
      <div className="mb-6 relative">
        <CircularProgress progress={tech.completed ? 100 : progress} size={80} />
        <div className={`absolute inset-0 flex items-center justify-center transition-transform ${
          tech.completed ? 'text-gold scale-110' : 'text-white/30 group-hover:text-gold group-hover:scale-110'
        }`}>
          {tech.icon}
        </div>
      </div>
      <h3 className={`text-lg font-medium mb-1 ${tech.completed ? 'text-gold' : ''}`}>{tech.name}</h3>
      <p className="text-white/40 text-xs font-mono mb-6">
        {tech.completed ? 'ОСВОЕНО' : timeLeft > 0 ? `${Math.floor(timeLeft / 60)}:${String(Math.floor(timeLeft % 60)).padStart(2, '0')}` : 'ГОТОВО'}
      </p>
      
      {!tech.startTime && !tech.completed && (
        <button 
          onClick={() => onStart(tech.id)}
          className="w-full py-2 bg-transparent border border-white/10 rounded-lg text-[10px] font-mono uppercase tracking-widest hover:bg-gold/20 hover:border-gold transition-all"
        >
          Начать
        </button>
      ) }
      
      {tech.startTime && !tech.completed && (
        <div className="w-full h-1 bg-transparent rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gold"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>
      )}

      {tech.completed && (
        <div className="flex items-center gap-1 text-[10px] font-mono text-gold uppercase">
          <Zap size={10} /> Бонус активен
        </div>
      )}
    </div>
  );
};
