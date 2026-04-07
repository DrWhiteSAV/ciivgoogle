import React from 'react';
import { motion } from 'motion/react';
import { Zap, Sparkles, Search, History as HistoryIcon, X } from 'lucide-react';
import { GameState, Skill, ChronicleEntry } from '../types/game';
import { SkillCard } from '../components/UI';

interface TreePageProps {
  gameState: GameState;
  onFateClick: () => void;
  onBonusClick: () => void;
  onEraClick: () => void;
}

export const TreePage: React.FC<TreePageProps> = ({ gameState, onFateClick, onBonusClick, onEraClick }) => {
  const [activeTab, setActiveTab] = React.useState<'progress' | 'regress' | 'chronicles'>('progress');
  const [selectedEraIndex, setSelectedEraIndex] = React.useState<number | null>(null); // null means current era
  const [searchQuery, setSearchQuery] = React.useState('');

  const eras = [...gameState.pastEras, { 
    name: gameState.era, 
    description: gameState.eraDescription,
    yearReached: gameState.year - gameState.eraYear,
    yearsPassed: gameState.eraYear,
    population: gameState.population,
    progressCount: gameState.skills.filter(s => s.type === 'progress' && s.year >= gameState.year - gameState.eraYear).length,
    regressCount: gameState.skills.filter(s => s.type === 'regress' && s.year >= gameState.year - gameState.eraYear).length,
    skills: gameState.skills.filter(s => s.year >= gameState.year - gameState.eraYear)
  }];

  const currentViewEra = selectedEraIndex !== null ? eras[selectedEraIndex] : eras[eras.length - 1];
  const isCurrentEra = selectedEraIndex === null || selectedEraIndex === eras.length - 1;

  // Filter skills by search query
  const filteredSkills = currentViewEra.skills.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const progressSkills = filteredSkills.filter(s => s.type === 'progress');
  const regressSkills = filteredSkills.filter(s => s.type === 'regress');

  // Filter chronicles by era and search query
  const eraChronicles = gameState.chronicles.filter(c => {
    const eraName = selectedEraIndex !== null ? eras[selectedEraIndex].name : gameState.era;
    return c.era === eraName;
  });

  const filteredChronicles = eraChronicles.filter(c => 
    c.event.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (c.choiceTitle && c.choiceTitle.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const nextEraProgressNeeded = 25;
  const nextEraYearsNeeded = 200;

  return (
    <motion.div
      key="tree"
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="w-full max-w-7xl flex flex-col items-center"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-5xl font-light glow-gold mb-4 uppercase tracking-widest">Дерево Жизни</h2>
        <p className="text-white/40 font-mono text-xs uppercase tracking-[0.3em]">Хронология достижений и упадка</p>
      </div>

      {/* Race Image - Restored & Enlarged */}
      <div className="relative w-48 h-48 md:w-60 md:h-60 mb-12 group">
        <motion.div 
          className="absolute inset-0 bg-gold/20 blur-3xl rounded-full"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <div className="relative h-full w-full rounded-full border-2 border-gold/30 p-1.5 overflow-hidden bg-black/40 backdrop-blur-sm">
          <img 
            src={gameState.race.image} 
            alt={gameState.race.name} 
            className="w-full h-full object-cover rounded-full grayscale group-hover:grayscale-0 transition-all duration-700"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-6 py-2 bg-black/80 border border-gold/30 rounded-full backdrop-blur-md">
          <span className="text-[10px] md:text-xs font-mono text-gold uppercase tracking-[0.2em] whitespace-nowrap">{gameState.race.name}</span>
        </div>
      </div>

      {/* Era Selector - Centered & Wrapping */}
      <div className="w-full flex justify-center mb-6 px-4">
        <div className="flex flex-wrap justify-center gap-2 max-w-2xl">
          {eras.map((era, idx) => (
            <button
              key={`era-tab-${idx}`}
              onClick={() => setSelectedEraIndex(idx)}
              className={`px-4 py-2 rounded-xl border font-mono text-[9px] uppercase tracking-widest transition-all ${
                (selectedEraIndex === idx || (selectedEraIndex === null && idx === eras.length - 1))
                  ? 'bg-gold/20 border-gold text-gold glow-gold'
                  : 'bg-white/5 border-white/10 text-white/40 hover:border-white/30'
              }`}
            >
              {era.name}
            </button>
          ))}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="w-full max-w-4xl mb-8 px-4">
        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search size={16} className="text-white/20 group-focus-within:text-gold transition-colors" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по названию, описанию или событию..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-gold/50 focus:bg-gold/5 transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-4 flex items-center text-white/20 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Main Content - 3 Columns for Desktop */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full items-start">
        
        {/* Era Stats Block - Compact (Order 1 on mobile) */}
        <div className="flex flex-col items-center order-1 md:order-2">
          <div className="w-full max-w-[340px] bg-white/5 border border-white/10 rounded-3xl p-5 backdrop-blur-md">
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="flex flex-col gap-1 p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest">Лет прошло</span>
                <span className="text-lg text-gold font-light">{currentViewEra.yearsPassed}</span>
              </div>
              <div className="flex flex-col gap-1 p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest">Население</span>
                <span className="text-lg text-gold font-light">
                  {currentViewEra.population >= 1000000 
                    ? (currentViewEra.population / 1000000).toFixed(1) + 'M' 
                    : currentViewEra.population.toLocaleString()}
                </span>
              </div>
              <div className="flex flex-col gap-1 p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest">Прогресс</span>
                <span className="text-lg text-gold font-light">{currentViewEra.progressCount}</span>
              </div>
              <div className="flex flex-col gap-1 p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest">Регресс</span>
                <span className="text-lg text-red-500 font-light">{currentViewEra.regressCount}</span>
              </div>
            </div>

            {isCurrentEra && (
              <div className="pt-5 border-t border-white/5 space-y-4">
                <div className="flex flex-col gap-2">
                  <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest">До следующей эпохи:</span>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-[9px] font-mono">
                      <span className="text-white/60">Прогресс: {currentViewEra.progressCount}/{nextEraProgressNeeded}</span>
                      <span className="text-gold">{Math.min(100, Math.floor((currentViewEra.progressCount / nextEraProgressNeeded) * 100))}%</span>
                    </div>
                    <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gold transition-all duration-500" 
                        style={{ width: `${Math.min(100, (currentViewEra.progressCount / nextEraProgressNeeded) * 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[9px] font-mono">
                      <span className="text-white/60">Лет: {currentViewEra.yearsPassed}/{nextEraYearsNeeded}</span>
                      <span className="text-gold">{Math.min(100, Math.floor((currentViewEra.yearsPassed / nextEraYearsNeeded) * 100))}%</span>
                    </div>
                    <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gold transition-all duration-500" 
                        style={{ width: `${Math.min(100, (currentViewEra.yearsPassed / nextEraYearsNeeded) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
                <button
                  onClick={onEraClick}
                  className="w-full py-3 bg-gold/10 border border-gold/30 rounded-xl text-gold font-mono text-[9px] uppercase tracking-widest hover:bg-gold/20 transition-all"
                >
                  Описание эпохи
                </button>
              </div>
            )}
          </div>

          {/* Chronicles Section for Desktop (Below stats) */}
          <div className="hidden md:flex flex-col w-full max-w-[340px] mt-6">
            <button
              onClick={() => setActiveTab(activeTab === 'chronicles' ? 'progress' : 'chronicles')}
              className={`w-full py-3 rounded-xl border font-mono text-[9px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                activeTab === 'chronicles' 
                  ? 'bg-gold text-black border-gold' 
                  : 'bg-white/5 border-white/10 text-white/40 hover:border-white/30'
              }`}
            >
              <HistoryIcon size={14} />
              {activeTab === 'chronicles' ? 'Скрыть летопись' : 'Показать летопись'}
            </button>
          </div>
        </div>

        {/* Mobile Tabs (Order 2 on mobile) */}
        <div className="flex md:hidden w-full max-w-sm bg-white/5 border border-white/10 rounded-xl p-1 mb-4 order-2 mx-auto overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('progress')}
            className={`flex-1 min-w-[80px] py-2 rounded-lg font-mono text-[9px] uppercase tracking-widest transition-all ${
              activeTab === 'progress' ? 'bg-gold text-black' : 'text-white/40'
            }`}
          >
            Прогресс
          </button>
          <button
            onClick={() => setActiveTab('regress')}
            className={`flex-1 min-w-[80px] py-2 rounded-lg font-mono text-[9px] uppercase tracking-widest transition-all ${
              activeTab === 'regress' ? 'bg-red-500 text-white' : 'text-white/40'
            }`}
          >
            Регресс
          </button>
          <button
            onClick={() => setActiveTab('chronicles')}
            className={`flex-1 min-w-[80px] py-2 rounded-lg font-mono text-[9px] uppercase tracking-widest transition-all ${
              activeTab === 'chronicles' ? 'bg-white/20 text-white' : 'text-white/40'
            }`}
          >
            Летопись
          </button>
        </div>

        {/* Progress List (Order 3 on mobile) */}
        <div className={`flex flex-col items-center order-3 md:order-3 ${activeTab !== 'progress' && activeTab !== 'chronicles' ? 'hidden md:flex' : activeTab === 'chronicles' ? 'hidden' : 'flex'}`}>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-8 h-px bg-gradient-to-r from-transparent to-gold/50" />
            <h3 className="text-lg font-mono text-gold uppercase tracking-widest">Прогресс</h3>
            <div className="w-8 h-px bg-gradient-to-l from-transparent to-gold/50" />
          </div>
          <div className="flex flex-col gap-4 w-full items-center">
            {progressSkills.length > 0 ? (
              progressSkills.map((s, i) => <SkillCard key={s.id} skill={s} index={i} color="gold" />)
            ) : (
              <div className="text-white/20 font-mono text-[10px] uppercase py-8">
                {searchQuery ? 'Ничего не найдено' : 'Нет достижений'}
              </div>
            )}
          </div>
        </div>

        {/* Regress List (Order 4 on mobile) */}
        <div className={`flex flex-col items-center order-4 md:order-1 ${activeTab !== 'regress' && activeTab !== 'chronicles' ? 'hidden md:flex' : activeTab === 'chronicles' ? 'hidden' : 'flex'}`}>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-8 h-px bg-gradient-to-r from-transparent to-red-500/50" />
            <h3 className="text-lg font-mono text-red-500 uppercase tracking-widest">Регресс</h3>
            <div className="w-8 h-px bg-gradient-to-l from-transparent to-red-500/50" />
          </div>
          <div className="flex flex-col gap-4 w-full items-center">
            {regressSkills.length > 0 ? (
              regressSkills.map((s, i) => <SkillCard key={s.id} skill={s} index={i} color="red" />)
            ) : (
              <div className="text-white/20 font-mono text-[10px] uppercase py-8">
                {searchQuery ? 'Ничего не найдено' : 'Нет упадка'}
              </div>
            )}
          </div>
        </div>

        {/* Chronicles List (Full width or overlay when active) */}
        {activeTab === 'chronicles' && (
          <div className="col-span-1 md:col-span-3 flex flex-col items-center order-5 mt-8 w-full">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-px bg-gradient-to-r from-transparent to-gold/50" />
              <h3 className="text-xl font-mono text-gold uppercase tracking-widest">Летопись эпохи</h3>
              <div className="w-12 h-px bg-gradient-to-l from-transparent to-gold/50" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {filteredChronicles.length > 0 ? (
                [...filteredChronicles].reverse().map((entry, i) => (
                  <motion.div 
                    key={entry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-gold/30 transition-all flex flex-col"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[10px] font-mono text-gold uppercase tracking-widest">ГОД {entry.year}</span>
                      <span className={`text-[10px] font-mono px-2 py-1 rounded bg-white/5 ${entry.growthPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {entry.growthPercent >= 0 ? '+' : ''}{entry.growthPercent.toFixed(1)}%
                      </span>
                    </div>
                    <h4 className="text-sm font-medium text-white mb-3">{entry.choiceTitle}</h4>
                    <p className="text-xs text-white/60 leading-relaxed line-clamp-4">{entry.event}</p>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-12 text-center border border-dashed border-white/10 rounded-2xl">
                  <p className="text-white/20 font-mono text-xs uppercase tracking-widest">
                    {searchQuery ? 'Ничего не найдено' : 'История этой эпохи еще не написана'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </motion.div>
  );
};
