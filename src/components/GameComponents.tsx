import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Zap, Baby, Activity, TrendingUp, Skull } from 'lucide-react';
import { Tech } from '../types/game';
import { Habitat, getCompatibility } from '../config/constants';
import { CircularProgress } from './UI';

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

export const PlanetImageFull: React.FC<{ planet: any; className?: string; opacity?: number; onClick?: () => void }> = ({ planet, className = "", opacity = 1, onClick }) => (
  <div className={`relative w-full ${className}`}>
    <div 
      className="relative aspect-[1280/714] w-full overflow-hidden rounded-[10px] border border-white/10 cursor-pointer border-light-animation" 
      style={{ opacity: opacity * 0.8 }}
      onClick={onClick}
    >
      <img src={planet.image} alt={planet.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
    </div>
    <div className="text-center mt-3">
      <span className="text-[16px] md:text-[24px] font-mono text-gold uppercase tracking-widest glow-gold">
        {planet.name}
      </span>
    </div>
  </div>
);

export const RaceImageFull: React.FC<{ race: any; className?: string; opacity?: number; onClick?: () => void }> = ({ race, className = "", opacity = 1, onClick }) => (
  <div className={`relative w-full ${className}`}>
    <div 
      className="relative aspect-[1280/714] w-full overflow-hidden rounded-[10px] border border-white/10 cursor-pointer border-light-animation" 
      style={{ opacity: opacity * 0.8 }}
      onClick={onClick}
    >
      <img src={race.image} alt={race.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
    </div>
    <div className="text-center mt-3">
      <span className="text-[16px] md:text-[24px] font-mono text-gold uppercase tracking-widest glow-gold">
        {race.name}
      </span>
    </div>
  </div>
);

export const RaceImageMini: React.FC<{ race: any; className?: string; onClick?: () => void }> = ({ race, className = "", onClick }) => (
  <div className={`relative w-full ${className}`}>
    <div 
      className="relative aspect-square w-full overflow-hidden rounded-[10px] border border-white/10 cursor-pointer border-light-animation"
      style={{ opacity: 0.8 }}
      onClick={onClick}
    >
      <img src={race.image} alt={race.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
    </div>
    <div className="text-center mt-3">
      <span className="text-[14px] md:text-[20px] font-mono text-gold uppercase tracking-widest glow-gold">
        {race.name}
      </span>
    </div>
  </div>
);

export const RaceTable = ({ race }: { race: any }) => (
  <div className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-[10px] font-mono">
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div>
        <div className="text-gold/60 uppercase mb-1 flex items-center gap-1"><Baby size={10} /> Репродукция</div>
        <div className="text-white/80">Тип: {race.reproduction.type}</div>
        <div className="text-white/80">Срок: {race.reproduction.term}</div>
        <div className="text-white/80">Потомство: {race.reproduction.offspring}</div>
      </div>
      <div>
        <div className="text-gold/60 uppercase mb-1 flex items-center gap-1"><Activity size={10} /> Развитие</div>
        <div className="text-white/80">Взросление: {race.development.maturation}</div>
        <div className="text-white/80">Срок жизни: {race.development.lifespan}</div>
        <div className="text-white/80">Особенности: {race.development.features}</div>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-2">
      <div>
        <div className="text-green-400/60 uppercase mb-1 flex items-center gap-1"><TrendingUp size={10} /> Прирост</div>
        <div className="text-white/80">{race.stats.avgGrowth}% в год</div>
      </div>
      <div>
        <div className="text-red-400/60 uppercase mb-1 flex items-center gap-1"><Skull size={10} /> Смертность</div>
        <div className="text-white/80">{race.stats.avgMortality}% в год</div>
      </div>
    </div>
  </div>
);

export const PlanetCompatibilityTable = ({ race, planet }: { race: any, planet: any }) => {
  const compatibility = getCompatibility(race.habitat, planet.habitat);
  return (
    <div className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-[10px] font-mono">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gold/60 uppercase">Совместимость с {planet.name}</span>
        <span className={`text-lg font-bold ${compatibility > 70 ? 'text-green-400' : compatibility > 40 ? 'text-yellow-400' : 'text-red-400'}`}>
          {compatibility}%
        </span>
      </div>
      <div className="text-white/40 leading-relaxed">
        Влияет на смертность, срок жизни и прирост населения.
      </div>
    </div>
  );
};
