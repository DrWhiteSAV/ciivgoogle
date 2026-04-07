import React from 'react';
import { Clock } from 'lucide-react';
import { GameState } from '../types';

export const Header: React.FC<{
  gameState: GameState;
  secondsToNextYear: number;
  activeSection: 'genesis' | 'fate' | 'tree';
  setActiveSection: (section: 'genesis' | 'fate' | 'tree') => void;
}> = ({ gameState, secondsToNextYear, activeSection, setActiveSection }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex flex-col md:flex-row items-center justify-between px-4 md:px-12 pt-2 pb-[3px] bg-black/40 backdrop-blur-md border-b border-x border-white/10 md:border-x-0 rounded-b-2xl md:rounded-none">
      {/* Mobile Stats */}
      <div className="grid md:hidden grid-cols-4 gap-x-2 gap-y-1 text-[9px] font-mono uppercase tracking-tighter w-full">
        <div className="flex flex-col items-center"><span className="text-white/30">ПЛАНЕТА</span> <span className="text-gold truncate w-full text-center">{gameState.planet.name}</span></div>
        <div className="flex flex-col items-center"><span className="text-white/30">РАСА</span> <span className="text-gold truncate w-full text-center">{gameState.race.name}</span></div>
        <div className="flex flex-col items-center"><span className="text-white/30">ГОД ЦИВИЛИЗАЦИИ</span> <span className="text-gold">{gameState.year}</span></div>
        <div className="flex flex-col items-center"><span className="text-white/30">НАСЕЛЕНИЕ</span> <span className="text-gold">{gameState.population.toLocaleString()}</span></div>
        <div className="flex flex-col items-center"><span className="text-white/30">ЭРА</span> <span className="text-gold truncate w-full text-center">{gameState.era}</span></div>
        <div className="flex flex-col items-center"><span className="text-white/30">СТАБИЛЬНОСТЬ</span> <span className="text-gold">{gameState.stability}%</span></div>
        <div className="flex flex-col items-center"><span className="text-white/30">СОВМЕСТИМОСТЬ</span> <span className="text-gold">{gameState.compatibility}%</span></div>
        <div className="flex flex-col items-center"><span className="text-white/30">ГОДЫ В РАБОТЕ</span> <span className="text-gold">{gameState.availableYears}</span></div>
      </div>

      <div className="hidden md:flex items-center gap-6 text-[10px] font-mono uppercase tracking-widest">
        <div className="flex flex-col">
          <span className="text-white/30">ПЛАНЕТА</span>
          <span className="text-gold">{gameState.planet.name}</span>
        </div>
        <div className="w-px h-8 bg-white/10" />
        <div className="flex flex-col">
          <span className="text-white/30">РАСА</span>
          <span className="text-gold">{gameState.race.name}</span>
        </div>
        <div className="w-px h-8 bg-white/10" />
        <div className="flex flex-col">
          <span className="text-white/30">ГОД ЦИВИЛИЗАЦИИ</span>
          <span className="text-gold">{gameState.year}</span>
        </div>
        <div className="w-px h-8 bg-white/10" />
        <div className="flex flex-col">
          <span className="text-white/30">НАСЕЛЕНИЕ</span>
          <span className="text-gold">
            {gameState.population >= 1000000 
              ? (gameState.population / 1000000).toFixed(2) + 'M' 
              : gameState.population.toLocaleString()}
          </span>
        </div>
        <div className="w-px h-8 bg-white/10" />
        <div className="flex flex-col">
          <span className="text-white/30">ЭРА</span>
          <span className="text-gold">{gameState.era}</span>
        </div>
        <div className="w-px h-8 bg-white/10" />
        <div className="flex flex-col">
          <span className="text-white/30">СТАБИЛЬНОСТЬ</span>
          <span className={`font-mono ${gameState.stability > 70 ? 'text-green-400' : gameState.stability > 40 ? 'text-yellow-400' : 'text-red-400'}`}>
            {gameState.stability}%
          </span>
        </div>
        <div className="w-px h-8 bg-white/10" />
        <div className="flex flex-col">
          <span className="text-white/30">СОВМЕСТИМОСТЬ</span>
          <span className={`font-mono ${gameState.compatibility > 70 ? 'text-green-400' : gameState.compatibility > 40 ? 'text-yellow-400' : 'text-red-400'}`}>
            {gameState.compatibility}%
          </span>
        </div>
        <div className="w-px h-8 bg-white/10" />
        <div className="flex flex-col">
          <span className="text-white/30">ГОДЫ В РАБОТЕ</span>
          <span className="text-gold flex items-center gap-2">
            {gameState.availableYears} 
            <span className="text-[10px] text-white/20">({secondsToNextYear}с)</span>
            <Clock size={12} className="animate-spin-slow" />
          </span>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-8">
        {(['genesis', 'fate', 'tree'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setActiveSection(s)}
            className={`text-xs font-mono uppercase tracking-widest transition-all hover:text-gold ${
              activeSection === s ? 'text-gold glow-gold' : 'text-white/50'
            }`}
          >
            {s === 'genesis' ? 'Генезис' : s === 'fate' ? 'Ткач Судеб' : 'Дерево Жизни'}
          </button>
        ))}
      </div>
    </header>
  );
};
