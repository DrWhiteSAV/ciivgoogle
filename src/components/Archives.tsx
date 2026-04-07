import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  History, 
  Users, 
  Library, 
  Globe, 
  Award, 
  X, 
  Music, 
  Scroll, 
  Compass, 
  Shield, 
  Sparkles 
} from 'lucide-react';
import { GameState } from '../types/game';
import { SpaceBackground } from './SpaceBackground';

interface ArchivesProps {
  gameState: GameState;
  onClose: () => void;
}

type Tab = 'timeline' | 'heroes' | 'museum' | 'culture' | 'legacy';

export const Archives: React.FC<ArchivesProps> = ({ gameState, onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('timeline');
  const [selectedEraName, setSelectedEraName] = useState<string>(gameState.era);

  const allEras = [...gameState.pastEras.map(e => e.name), gameState.era];
  
  const isCurrentEra = selectedEraName === gameState.era;
  const currentEraInfo = gameState.pastEras.find(e => e.name === selectedEraName);

  const filteredChronicles = gameState.chronicles.filter(c => c.era === selectedEraName);
  const filteredHeroes = gameState.heroes.filter(h => h.era === selectedEraName);
  const filteredRelics = gameState.relics.filter(r => r.era === selectedEraName);
  const filteredSkills = isCurrentEra 
    ? gameState.skills.filter(s => s.era === gameState.era)
    : currentEraInfo?.skills || [];

  const ideology = isCurrentEra ? gameState.ideology : currentEraInfo?.ideology;
  const externalContacts = isCurrentEra ? gameState.externalContacts : currentEraInfo?.externalContacts;
  const soundscape = isCurrentEra ? gameState.currentSoundscape : currentEraInfo?.soundscape;
  const victoryProgress = isCurrentEra ? gameState.victoryProgress : currentEraInfo?.victoryProgress;

  const tabs = [
    { id: 'timeline', label: 'Летопись', icon: <History size={16} /> },
    { id: 'heroes', label: 'Герои', icon: <Users size={16} /> },
    { id: 'museum', label: 'Музей', icon: <Library size={16} /> },
    { id: 'culture', label: 'Культура', icon: <Globe size={16} /> },
    { id: 'legacy', label: 'Наследие', icon: <Award size={16} /> },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-xl overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none opacity-50">
        <SpaceBackground />
      </div>

      <div className="relative w-full h-full md:w-[95vw] md:h-[90vh] md:max-w-6xl bg-black/20 md:border md:border-white/10 md:rounded-[32px] overflow-hidden flex flex-col shadow-2xl backdrop-blur-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/5 bg-white/2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold border border-gold/20">
              <Scroll size={18} />
            </div>
            <div>
              <h2 className="text-base md:text-xl font-light text-white uppercase tracking-widest">Архивы Цивилизации</h2>
              <p className="text-[8px] md:text-xs text-white/40 font-mono uppercase tracking-tighter">Хранилище памяти и достижений</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
          >
            <X size={20} md:size={24} />
          </button>
        </div>

        {/* Era Selector */}
        <div className="flex items-center gap-2 p-2 md:p-4 bg-white/[0.02] border-b border-white/5 overflow-x-auto no-scrollbar">
          <span className="text-[8px] md:text-[10px] font-mono text-white/20 uppercase tracking-widest px-2 shrink-0">Выбор эпохи:</span>
          {allEras.map((eraName) => (
            <button
              key={eraName}
              onClick={() => setSelectedEraName(eraName)}
              className={`px-3 py-1.5 rounded-lg font-mono text-[8px] md:text-[10px] uppercase tracking-tighter transition-all shrink-0 border ${
                selectedEraName === eraName 
                  ? 'bg-gold/20 border-gold/40 text-gold' 
                  : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
              }`}
            >
              {eraName}
            </button>
          ))}
        </div>

        {/* Tabs Navigation - Tags on mobile, Tabs on desktop */}
        <div className="grid grid-cols-3 md:flex border-b border-white/5 bg-black/20 p-2 md:p-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex items-center justify-center gap-2 px-2 md:px-6 py-2 md:py-4 text-[10px] md:text-xs font-mono uppercase tracking-widest transition-all relative rounded-xl md:rounded-none ${
                activeTab === tab.id 
                  ? 'text-gold bg-gold/10 md:bg-transparent' 
                  : 'text-white/40 hover:text-white/70 bg-white/5 md:bg-transparent'
              }`}
            >
              {tab.icon}
              <span className="text-[8px] md:text-[10px]">{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="activeTab"
                  className="hidden md:block absolute bottom-0 left-0 right-0 h-0.5 bg-gold"
                />
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 bg-gradient-to-b from-transparent to-white/[0.02]">
          <AnimatePresence mode="wait">
            {activeTab === 'timeline' && (
              <motion.div 
                key="timeline"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4 max-w-3xl mx-auto"
              >
                {(filteredChronicles.length === 0) ? (
                  <div className="flex flex-col items-center justify-center h-64 text-white/20">
                    <History size={48} className="mb-4 opacity-20" />
                    <p className="font-mono text-xs uppercase tracking-widest">Летопись этой эпохи пуста</p>
                  </div>
                ) : (
                  [...filteredChronicles].reverse().map((entry, i) => (
                    <div key={entry.id} className="relative pl-6 md:pl-8 pb-6 md:pb-8 border-l border-white/10 last:border-0 last:pb-0 bg-white/[0.01] rounded-r-xl p-2 mb-2">
                      <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-gold shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
                      <div className="flex flex-col gap-1 md:gap-2">
                        <div className="flex items-center gap-3">
                          <span className="text-gold font-mono text-xs font-bold">ГОД {entry.year}</span>
                          <span className="text-white/30 text-[8px] md:text-[10px] uppercase font-mono tracking-widest">{entry.era}</span>
                        </div>
                        <p className="text-white/80 text-xs md:text-sm leading-relaxed">{entry.event}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center gap-1 text-[8px] md:text-[10px] font-mono uppercase tracking-tighter text-white/40">
                            <Users size={10} />
                            <span>{entry.population.toLocaleString()}</span>
                          </div>
                          <div className={`text-[8px] md:text-[10px] font-mono uppercase tracking-tighter ${entry.growthPercent >= 0 ? 'text-green-500/70' : 'text-red-500/70'}`}>
                            {entry.growthPercent > 0 ? '+' : ''}{entry.growthPercent}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </motion.div>
            )}

            {activeTab === 'heroes' && (
              <motion.div 
                key="heroes"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                {(filteredHeroes.length === 0) ? (
                  <div className="flex flex-col items-center justify-center h-64 text-white/20">
                    <Users size={48} className="mb-4 opacity-20" />
                    <p className="font-mono text-xs uppercase tracking-widest">В эту эпоху великие личности не явились</p>
                  </div>
                ) : (
                  filteredHeroes.map((hero) => (
                    <div key={hero.id} className="p-4 md:p-6 bg-white/[0.02] border border-white/10 rounded-2xl hover:border-gold/30 transition-all group">
                      <div className="flex items-start justify-between mb-3 md:mb-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gold/10 flex items-center justify-center text-gold border border-gold/20 group-hover:scale-110 transition-transform">
                          <Shield size={20} md:size={24} />
                        </div>
                        <div className="text-right">
                          <div className="text-[8px] md:text-[10px] font-mono uppercase tracking-widest text-white/30">{hero.era}</div>
                          <div className="text-[10px] md:text-xs font-mono text-gold">Год {hero.yearBorn}</div>
                        </div>
                      </div>
                      <h3 className="text-base md:text-lg font-medium text-white mb-1">{hero.name}</h3>
                      <div className="text-[10px] md:text-xs font-mono text-gold/60 uppercase tracking-widest mb-3 md:mb-4">{hero.title}</div>
                      <p className="text-xs md:text-sm text-white/60 leading-relaxed italic">"{hero.bio}"</p>
                    </div>
                  ))
                )}
              </motion.div>
            )}

            {activeTab === 'museum' && (
              <motion.div 
                key="museum"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-2 md:grid-cols-3 gap-4"
              >
                {(filteredRelics.length === 0) ? (
                  <div className="col-span-full flex flex-col items-center justify-center h-64 text-white/20">
                    <Library size={48} className="mb-4 opacity-20" />
                    <p className="font-mono text-xs uppercase tracking-widest">В эту эпоху музей не пополнился</p>
                  </div>
                ) : (
                  filteredRelics.map((relic) => (
                    <div key={relic.id} className="p-4 md:p-5 bg-white/[0.02] border border-white/10 rounded-2xl flex flex-col items-center text-center hover:bg-white/[0.07] transition-all">
                      <div className={`w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center mb-3 md:mb-4 border ${relic.type === 'relic' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' : 'bg-blue-500/10 border-blue-500/20 text-blue-400'}`}>
                        {relic.type === 'relic' ? <Sparkles size={20} md:size={24} /> : <Compass size={20} md:size={24} />}
                      </div>
                      <div className="text-[8px] md:text-[10px] font-mono uppercase tracking-widest text-white/30 mb-1">Год {relic.yearFound}</div>
                      <h3 className="text-xs md:text-white font-medium mb-1 md:mb-2">{relic.name}</h3>
                      <p className="text-[10px] md:text-xs text-white/50 leading-relaxed">{relic.description}</p>
                    </div>
                  ))
                )}
              </motion.div>
            )}

            {activeTab === 'culture' && (
              <motion.div 
                key="culture"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 md:space-y-8"
              >
                <div className="p-6 md:p-8 bg-white/[0.02] border border-white/10 rounded-3xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 md:p-8 opacity-5">
                    <Globe size={80} md:size={120} />
                  </div>
                  <h3 className="text-[8px] md:text-xs font-mono uppercase tracking-[0.3em] text-gold mb-4 md:mb-6">Идеология эпохи</h3>
                  <div className="text-2xl md:text-4xl font-light text-white mb-3 md:mb-4 uppercase tracking-widest">{ideology}</div>
                  <p className="text-white/40 text-xs md:text-sm max-w-2xl leading-relaxed">
                    Этот путь определял мировоззрение вашего народа в эпоху {selectedEraName}.
                  </p>
                </div>

                <div>
                  <h3 className="text-[8px] md:text-xs font-mono uppercase tracking-[0.3em] text-white/40 mb-4 md:mb-6 px-2">Контакты эпохи</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    {(!externalContacts || externalContacts.length === 0) ? (
                      <div className="col-span-full p-6 md:p-8 border border-dashed border-white/10 rounded-2xl text-center text-white/20 font-mono text-[10px] md:text-xs uppercase tracking-widest">
                        Контакты не были установлены
                      </div>
                    ) : (
                      externalContacts.map((contact, i) => (
                        <div key={i} className="p-3 md:p-4 bg-white/[0.02] border border-white/10 rounded-xl flex items-center gap-3 md:gap-4">
                          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-white/5 flex items-center justify-center text-white/40">
                            <Globe size={16} md:size={20} />
                          </div>
                          <span className="text-white/80 font-mono text-xs md:text-sm">{contact}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'legacy' && (
              <motion.div 
                key="legacy"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 md:space-y-8"
              >
                <div className="p-6 md:p-8 bg-white/[0.02] border border-white/10 rounded-3xl">
                  <div className="flex items-center justify-between mb-6 md:mb-8">
                    <h3 className="text-[8px] md:text-xs font-mono uppercase tracking-[0.3em] text-gold">Наследие эпохи: {selectedEraName}</h3>
                    <span className="text-gold font-mono text-lg md:text-xl">{Math.round(victoryProgress)}%</span>
                  </div>
                  <div className="w-full h-1.5 md:h-2 bg-white/5 rounded-full overflow-hidden mb-4 md:mb-6">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${victoryProgress}%` }}
                      className="h-full bg-gradient-to-r from-gold/50 to-gold shadow-[0_0_20px_rgba(212,175,55,0.5)]"
                    />
                  </div>
                  <p className="text-white/40 text-[10px] md:text-sm leading-relaxed text-center font-mono uppercase tracking-widest">
                    {isCurrentEra 
                      ? "Ваша цивилизация стремится к завершению текущей эпохи. Наберите 25 навыков прогресса или проживите 200 лет."
                      : "История этой эпохи завершена и стала частью великого наследия вашего народа."}
                  </p>
                </div>

                <div className="p-6 md:p-8 bg-white/[0.02] border border-white/10 rounded-3xl flex items-start gap-4 md:gap-6">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gold/10 flex items-center justify-center text-gold border border-gold/20 shrink-0">
                    <Music size={24} md:size={32} />
                  </div>
                  <div>
                    <h3 className="text-[8px] md:text-xs font-mono uppercase tracking-[0.3em] text-white/40 mb-1 md:mb-2">Звуковой Ландшафт</h3>
                    <p className="text-base md:text-xl text-white/80 font-light italic leading-relaxed">
                      "{soundscape}"
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
