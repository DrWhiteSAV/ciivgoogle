import React from 'react';
import { motion } from 'motion/react';
import { Atom, ArrowUpRight, ArrowDownRight, X } from 'lucide-react';
import { Skill } from '../types/game';

export const FlameBorder: React.FC<{ children: React.ReactNode; className?: string; style?: React.CSSProperties }> = ({ children, className = "", style }) => {
  return (
    <div className={`relative rounded-2xl ${className}`} style={style}>
      <div className="absolute inset-0 rounded-2xl border border-gold/30 shadow-[0_0_15px_rgba(212,175,55,0.2)]" />
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

export const TypewriterText: React.FC<{ text: string; delay?: number }> = ({ text, delay = 0.02 }) => {
  return (
    <motion.span>
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * delay }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
};

export const CircularProgress: React.FC<{ progress: number; size?: number }> = ({ progress, size = 60 }) => {
  const radius = size / 2 - 4;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="2"
          fill="transparent"
          className="text-white/10"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="2"
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          className="text-gold"
        />
      </svg>
    </div>
  );
};

export const SkillCard = React.memo(({ skill, index, color }: { skill: Skill, index: number, color: 'gold' | 'red' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    className="relative group w-full max-w-sm"
  >
    <div className={`p-6 rounded-2xl border ${color === 'gold' ? 'border-gold/20 bg-gold/5' : 'border-red-500/20 bg-red-500/5'} backdrop-blur-md transition-all cursor-help relative overflow-hidden`}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl ${color === 'gold' ? 'bg-gold/10 text-gold' : 'bg-red-500/10 text-red-500'}`}>
          {color === 'gold' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Год {skill.year}</span>
            <span className={`text-[8px] font-mono px-2 py-0.5 rounded border ${color === 'gold' ? 'border-gold/30 text-gold' : 'border-red-500/30 text-red-500'}`}>
              {color === 'gold' ? 'ПРОГРЕСС' : 'РЕГРЕСС'}
            </span>
          </div>
          <h4 className="text-sm font-medium text-white mb-2">{skill.name}</h4>
          <p className="text-xs text-white/60 leading-relaxed">{skill.desc}</p>
        </div>
      </div>
      <div className={`absolute -right-4 -bottom-4 opacity-5 ${color === 'gold' ? 'text-gold' : 'text-red-500'}`}>
        <Atom size={80} />
      </div>
    </div>
  </motion.div>
));

export const StatInfoWindow: React.FC<{ 
  info: { x: number; y: number; title: string; desc: string }; 
  onClose: () => void 
}> = ({ info, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed z-[500] pointer-events-none flex flex-col items-center justify-center text-center p-4 select-none"
      style={{
        top: info.y,
        left: info.x,
        transform: 'translate(-50%, -120%)',
      }}
    >
      <div className="bg-black/10 backdrop-blur-[20px] border border-gold/30 p-4 rounded-2xl shadow-[0_0_30px_rgba(212,175,55,0.3)]">
        <span className="text-sm font-mono text-gold uppercase tracking-[0.3em] font-bold glow-gold mb-2 block">
          {info.title}
        </span>
        <p className="text-[11px] text-white/80 font-mono uppercase font-bold tracking-widest max-w-[220px] leading-tight">
          {info.desc}
        </p>
      </div>
    </motion.div>
  );
};

export const FullscreenImage: React.FC<{ src: string; alt: string; onClose: () => void }> = ({ src, alt, onClose }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4 md:p-12"
    onClick={onClose}
  >
    <button 
      onClick={onClose}
      className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors z-[210]"
    >
      <X size={32} />
    </button>
    <motion.img 
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      src={src} 
      alt={alt} 
      className="max-w-full max-h-full object-contain shadow-2xl rounded-[10px]"
      referrerPolicy="no-referrer"
      onClick={(e) => e.stopPropagation()}
    />
  </motion.div>
);
