import React, { useState } from 'react';
import { motion } from 'motion/react';
import { History as HistoryIcon, Sparkles, Search, X, Filter } from 'lucide-react';
import { GameState } from '../types/game';
import { FlameBorder, TypewriterText } from '../components/UI';

interface FatePageProps {
  gameState: GameState;
  isObserverMode: boolean;
  setIsObserverMode: (val: boolean) => void;
  isGenerating: boolean;
  setSelectedChoiceIndex: (idx: number) => void;
  setShowYearSelectionModal: (show: boolean) => void;
  setSelectedYearsToPass: (years: number) => void;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

export const FatePage: React.FC<FatePageProps> = ({
  gameState,
  isObserverMode,
  setIsObserverMode,
  isGenerating,
  setSelectedChoiceIndex,
  setShowYearSelectionModal,
  setSelectedYearsToPass,
  setGameState
}) => {
  const [hoveredChoice, setHoveredChoice] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEra, setFilterEra] = useState('Все');

  const eras = Array.from(new Set(gameState.chronicles.map(c => c.era).filter(Boolean)));

  const filteredChronicles = gameState.chronicles.filter(entry => {
    const matchesSearch = 
      entry.event.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (entry.choiceTitle && entry.choiceTitle.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesEra = filterEra === 'Все' || entry.era === filterEra;
    
    return matchesSearch && matchesEra;
  });

  return (
    <motion.div
      key="fate"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-4xl flex flex-col items-center"
    >
      <div className="relative mb-8 flex flex-col items-center">
        {!isObserverMode && (
          <button
            onClick={() => setIsObserverMode(true)}
            className="mb-4 px-6 py-2 rounded-full border border-gold/40 text-gold/60 hover:border-gold hover:text-gold transition-all font-mono text-[10px] tracking-[0.2em] uppercase"
          >
            Включить режим наблюдателя
          </button>
        )}

        <motion.div
          animate={{ 
            filter: ["drop-shadow(0 0 20px rgba(212,175,55,0.2))", "drop-shadow(0 0 40px rgba(212,175,55,0.5))", "drop-shadow(0 0 20px rgba(212,175,55,0.2))"] 
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="w-48 h-48 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform active:scale-95"
          onClick={() => {
            if (!isObserverMode) {
              setSelectedChoiceIndex(Math.floor(Math.random() * gameState.choices.length));
              setShowYearSelectionModal(true);
            }
          }}
        >
          <img 
            src="https://i.ibb.co/VW4W5PQs/Ciivbut.png" 
            alt="Loom of Fate Butterfly" 
            className="w-full h-full object-contain"
            referrerPolicy="no-referrer"
          />
        </motion.div>
      </div>

      <div className="text-center mt-[3px] mb-[3px]">
        <p className="text-gold/80 italic text-[9px] md:text-[10px] leading-tight max-w-2xl mx-auto">
          <TypewriterText text="Даже взмах крыла бабочки может привести к тайфуну на другом конце света" />
        </p>
      </div>

      <FlameBorder id="current-situation" className={`w-full mb-16 bg-transparent md:p-8 p-[5%]`} style={{ fontSize: '100%' }}>
        <div className="text-center">
          <h3 className="text-xs font-mono text-gold/40 uppercase tracking-[0.3em] mb-4">Текущая ситуация</h3>
          <p className="text-white/90 text-lg md:text-xl leading-snug md:leading-relaxed md:text-[100%] text-[70%]">
            {gameState.currentSituation}
          </p>
        </div>
      </FlameBorder>

      <div className="relative w-full mb-16">
        <div className="absolute -top-16 left-0 w-full h-16 pointer-events-none -z-10">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 1000 100" preserveAspectRatio="none">
            {gameState.choices.map((choice, i) => {
              const x2 = i === 0 ? 150 : i === 1 ? 500 : 850;
              const pathD = `M 500 0 C 500 50, ${x2} 50, ${x2} 100`;
              return (
                <React.Fragment key={`branch-${choice.id || i}`}>
                  <motion.path
                    d={pathD}
                    stroke="#D4AF37"
                    strokeWidth="1"
                    fill="none"
                    opacity={hoveredChoice === i ? 0.8 : 0.2}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                  />
                  <motion.circle
                    r="3"
                    fill="#D4AF37"
                    style={{
                      offsetPath: `path('${pathD}')`,
                      offsetRotate: "auto",
                      filter: "drop-shadow(0 0 5px #D4AF37) drop-shadow(0 0 10px #D4AF37)"
                    }}
                    initial={{ offsetDistance: "0%" }}
                    animate={{ offsetDistance: "100%" }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                      delay: i * 0.4
                    }}
                  />
                </React.Fragment>
              );
            })}
          </svg>
        </div>

        <div className="md:hidden space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {gameState.choices.map((choice, i) => (
              <motion.button
                key={`choice-mobile-${choice.id || i}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (isGenerating || gameState.availableYears < 1) return;
                  setSelectedChoiceIndex(i);
                  setShowYearSelectionModal(true);
                  setSelectedYearsToPass(1);
                }}
                disabled={isGenerating || gameState.availableYears < 1}
                className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col gap-3 ${
                  hoveredChoice === i ? 'border-gold/50 bg-gold/10' : 'border-white/10 bg-white/5'
                } ${isGenerating || gameState.availableYears < 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-gold uppercase tracking-widest">Вариант {i + 1}</span>
                  <Sparkles size={14} className="text-gold/40" />
                </div>
                <h3 className="text-sm font-medium text-white">{choice.title}</h3>
                <p className="text-[11px] text-white/60 leading-relaxed italic">"{choice.desc}"</p>
              </motion.button>
            ))}
          </div>
        </div>

        <div className="hidden md:grid md:grid-cols-3 gap-6 mb-6">
          {gameState.choices.map((choice, i) => (
            <button
              key={`choice-combined-pc-${choice.id || i}`}
              onMouseEnter={() => setHoveredChoice(i)}
              onMouseLeave={() => setHoveredChoice(null)}
              onClick={() => {
                setSelectedChoiceIndex(i);
                setShowYearSelectionModal(true);
                setSelectedYearsToPass(1);
              }}
              disabled={isGenerating || gameState.availableYears < 1}
              className={`group relative p-8 bg-transparent border border-white/10 rounded-3xl transition-all hover:bg-gold/10 hover:border-gold/50 text-left flex flex-col min-h-[200px] ${
                isGenerating || gameState.availableYears < 1 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <div className="text-xs font-mono text-gold uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full border border-gold/30 flex items-center justify-center text-[10px]">{i + 1}</span>
                {choice.title}
              </div>
              <p className="text-sm text-white/60 leading-relaxed">{choice.desc}</p>
              {hoveredChoice === i && (
                <motion.div layoutId="choice-glow" className="absolute inset-0 bg-gold/5 rounded-3xl blur-2xl" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chronicles at the bottom of FatePage */}
      <div className="w-full mt-16 border-t border-white/5 pt-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-mono text-gold/40 uppercase tracking-[0.3em]">Летопись цивилизации</h3>
            <div className="flex items-center gap-2 text-[10px] font-mono text-white/20 uppercase">
              <HistoryIcon size={14} />
              <span>{filteredChronicles.length} из {gameState.chronicles.length} записей</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative w-full md:w-64 group">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-gold transition-colors" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по летописи..."
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-8 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-gold/50 transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Era Filter */}
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar pb-2 md:pb-0">
              <Filter size={14} className="text-white/20 shrink-0" />
              <button
                onClick={() => setFilterEra('Все')}
                className={`px-3 py-1.5 rounded-lg font-mono text-[9px] uppercase tracking-widest transition-all shrink-0 ${
                  filterEra === 'Все' ? 'bg-gold text-black' : 'bg-white/5 text-white/40 border border-white/10'
                }`}
              >
                Все
              </button>
              {eras.map(era => (
                <button
                  key={`filter-era-${era}`}
                  onClick={() => setFilterEra(era!)}
                  className={`px-3 py-1.5 rounded-lg font-mono text-[9px] uppercase tracking-widest transition-all shrink-0 ${
                    filterEra === era ? 'bg-gold text-black' : 'bg-white/5 text-white/40 border border-white/10'
                  }`}
                >
                  {era}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="space-y-6 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
          {filteredChronicles.length > 0 ? (
            [...filteredChronicles].reverse().map((entry) => (
              <div key={entry.id} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-gold/30 transition-all">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-mono text-gold uppercase tracking-widest">ГОД {entry.year}</span>
                    <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest">{entry.era}</span>
                  </div>
                  <span className={`text-[9px] font-mono px-2 py-1 rounded bg-white/5 ${entry.growthPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {entry.growthPercent >= 0 ? '+' : ''}{entry.growthPercent.toFixed(1)}%
                  </span>
                </div>
                
                <h4 className="text-xs font-medium text-white mb-2">{entry.choiceTitle}</h4>
                
                <div className="space-y-3 mb-3">
                  {entry.event.split('\n').map((paragraph, idx) => (
                    paragraph.trim() && (
                      <p key={`fate-para-${entry.id}-${idx}`} className="text-[11px] text-white/60 leading-relaxed italic">
                        "{paragraph.trim()}"
                      </p>
                    )
                  ))}
                </div>

                <div className="flex justify-between items-center text-[8px] font-mono text-white/30 uppercase border-t border-white/5 pt-2">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <span className="text-white/20">Население:</span>
                      <span className="text-white/60">
                        {entry.population >= 1000000 ? (entry.population / 1000000).toFixed(2) + 'M' : entry.population.toLocaleString()}
                      </span>
                    </div>
                    {entry.oldPopulation && (
                      <div className="flex items-center gap-1">
                        <span className="text-white/20">Было:</span>
                        <span className="text-white/40">
                          {entry.oldPopulation >= 1000000 ? (entry.oldPopulation / 1000000).toFixed(2) + 'M' : entry.oldPopulation.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center border border-dashed border-white/10 rounded-2xl">
              <p className="text-white/20 font-mono text-xs uppercase tracking-widest">История еще не написана</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
