import React from 'react';
import { motion } from 'motion/react';
import { Activity, History as HistoryIcon } from 'lucide-react';
import { GameState } from '../types/game';
import { HabitatChart } from '../components/HabitatChart';

interface GenesisPageProps {
  gameState: GameState;
  setActiveSection: (section: 'genesis' | 'fate' | 'tree') => void;
  setShowWorldModal: (show: boolean) => void;
  setShowRaceModal: (show: boolean) => void;
  handleStatClick: (e: React.MouseEvent, title: string, desc: string) => void;
  handleStatHide: () => void;
  setFullscreenImage: (img: { src: string; alt: string } | null) => void;
  onOpenArchives: () => void;
  applyPendingEra: () => void;
}

export const GenesisPage: React.FC<GenesisPageProps> = ({ 
  gameState, 
  setActiveSection, 
  setShowWorldModal, 
  setShowRaceModal,
  handleStatClick,
  handleStatHide,
  setFullscreenImage,
  onOpenArchives,
  applyPendingEra
}) => {
  const eraSkills = gameState.skills.filter(s => s.year > (gameState.pastEras[gameState.pastEras.length - 1]?.yearReached || 0));
  const eraProgressSkills = eraSkills.filter(s => s.type === 'progress').length;

  return (
    <motion.div
      key="genesis"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="flex flex-col items-center text-center w-full"
    >
      <div className="relative mb-12 group w-full max-w-2xl">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          animate={{ 
            filter: ["drop-shadow(0 0 20px rgba(212,175,55,0.3))", "drop-shadow(0 0 60px rgba(212,175,55,0.7))", "drop-shadow(0 0 20px rgba(212,175,55,0.3))"],
            scale: [1, 1.05, 1]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="w-full flex flex-col items-center justify-center relative cursor-pointer"
          onClick={() => setActiveSection('fate')}
        >
          <img src="https://i.ibb.co/D0mRFhJ/civilogo.png" alt="Logo" className="w-full max-w-xl mx-auto glow-gold-lg" />
        </motion.div>
      </div>

      <h1 className="text-4xl md:text-7xl font-light tracking-tighter mb-4 glow-gold">
        Цивилизация {gameState.race.name}
      </h1>
      <p className="text-gold/60 font-mono text-sm tracking-[0.3em] uppercase mb-12">
        Мир: {gameState.planet.name} | Эра: {gameState.era}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mb-16">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          onClick={() => setShowWorldModal(true)}
          className="flex flex-col bg-transparent border border-white/10 rounded-[10px] text-left hover:border-gold/30 transition-all group cursor-pointer overflow-hidden p-0"
        >
          <div className="relative w-full aspect-square border-light-animation overflow-hidden">
            <img 
               src={gameState.planet.image} 
               alt={gameState.planet.name} 
               className="w-full h-full object-cover opacity-100 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110" 
               referrerPolicy="no-referrer" 
             />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/95 via-black/80 to-transparent">
              <h3 className="text-2xl font-light text-gold glow-gold mb-2">{gameState.planet.name}</h3>
              <p className="text-white/90 text-xs leading-relaxed mb-4 italic break-words">
                {gameState.planet.shortDesc}
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-0.5 bg-black/40 backdrop-blur-sm rounded-full text-[9px] font-mono text-gold/60 uppercase border border-gold/20">Грав: {gameState.planet.habitat.grav}g</span>
                <span className="px-2 py-0.5 bg-black/40 backdrop-blur-sm rounded-full text-[9px] font-mono text-gold/60 uppercase border border-gold/20">Атмо: {gameState.planet.habitat.atmo}%</span>
                <span className="px-2 py-0.5 bg-black/40 backdrop-blur-sm rounded-full text-[9px] font-mono text-gold/60 uppercase border border-gold/20">Рад: {gameState.planet.habitat.rad}%</span>
              </div>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          onClick={() => setShowRaceModal(true)}
          className="flex flex-col bg-transparent border border-white/10 rounded-[10px] text-left hover:border-gold/30 transition-all group cursor-pointer overflow-hidden p-0"
        >
          <div className="relative w-full aspect-square border-light-animation overflow-hidden">
            <img 
               src={gameState.race.image} 
               alt={gameState.race.name} 
               className="w-full h-full object-cover opacity-100 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110" 
               referrerPolicy="no-referrer" 
             />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/95 via-black/80 to-transparent">
              <h3 className="text-2xl font-light text-gold glow-gold mb-2">{gameState.race.name}</h3>
              <p className="text-white/90 text-xs leading-relaxed mb-3 italic break-words">
                {gameState.race.biology || gameState.race.desc}
              </p>
              <div className="flex gap-2">
                <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest">{gameState.race.type}</span>
                <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest">{gameState.race.trait}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mb-16">
        <div className="bg-transparent border border-white/10 p-6 rounded-2xl text-left">
          <h4 className="text-[10px] font-mono text-gold uppercase tracking-widest mb-4">Репродукция</h4>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between"><span className="text-white/40">Тип:</span> <span>{(gameState.race as any).reproduction.type}</span></div>
            <div className="flex justify-between"><span className="text-white/40">Срок:</span> <span>{(gameState.race as any).reproduction.term}</span></div>
            <div className="flex justify-between"><span className="text-white/40">Потомство:</span> <span>{(gameState.race as any).reproduction.offspring}</span></div>
          </div>
        </div>
        <div className="bg-transparent border border-white/10 p-6 rounded-2xl text-left">
          <h4 className="text-[10px] font-mono text-gold uppercase tracking-widest mb-4">Развитие</h4>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between"><span className="text-white/40">Взросление:</span> <span>{(gameState.race as any).development.maturation}</span></div>
            <div className="flex justify-between"><span className="text-white/40">Срок жизни:</span> <span>{(gameState.race as any).development.lifespan}</span></div>
          </div>
        </div>
        <div className="bg-transparent border border-white/10 p-6 rounded-2xl text-left min-w-0">
          <h4 className="text-[10px] font-mono text-gold uppercase tracking-widest mb-4">Среда обитания</h4>
          <HabitatChart data={gameState.race.habitat} color="#d4af37" onStatClick={handleStatClick} onStatHide={handleStatHide} />
        </div>
      </div>

      <div className="flex flex-col w-full max-w-4xl border-t border-b border-white/10 py-12 mb-16 gap-12">
        <div className="grid grid-cols-2 gap-4 md:gap-8">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Год</span>
            <span className="text-xl md:text-4xl font-mono text-gold">{gameState.year}</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Годы в работе</span>
            <span className="text-xl md:text-4xl font-mono text-gold">{gameState.availableYears}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 md:gap-8">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Стабильность</span>
            <span className="text-xl md:text-4xl font-mono text-gold">{gameState.stability}%</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Население</span>
            <span className="text-xl md:text-4xl font-mono text-gold">
              {gameState.population >= 1000000 
                ? (gameState.population / 1000000).toFixed(2) + 'M' 
                : gameState.population.toLocaleString()}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Совместимость</span>
            <span className="text-xl md:text-4xl font-mono text-gold">{gameState.compatibility}%</span>
          </div>
        </div>
      </div>

      <div className="w-full max-w-4xl mb-16">
        <div className="text-center mb-8">
          <h3 className="text-xs font-mono text-gold/40 uppercase tracking-[0.3em] mb-4">Текущая ситуация</h3>
          <p className="text-white/90 text-lg md:text-xl leading-snug md:leading-relaxed">
            {gameState.currentSituation}
          </p>
        </div>

        {gameState.eraDescription && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-mono text-gold/40 uppercase tracking-widest">Прогресс Эпохи</span>
              <span className="text-[10px] font-mono text-gold uppercase tracking-widest">{Math.round(gameState.victoryProgress)}%</span>
            </div>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${gameState.victoryProgress}%` }}
                className="h-full bg-gold shadow-[0_0_10px_rgba(212,175,55,0.5)]"
              />
            </div>
          </div>
        )}

        {gameState.pendingEra && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={applyPendingEra}
            className="w-full py-4 bg-gold text-black rounded-xl font-mono uppercase tracking-widest text-sm font-bold hover:bg-white transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)]"
          >
            Начать новую эру: {gameState.pendingEra.name}
          </motion.button>
        )}
      </div>

      {gameState.eraDescription && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="w-full max-w-4xl mb-16 p-8 bg-gold/5 border border-gold/20 rounded-3xl text-left"
        >
          <h4 className="text-[10px] font-mono text-gold uppercase tracking-widest mb-4">Текущая Эра: {gameState.era}</h4>
          <div className="space-y-4 mb-8">
            {gameState.eraDescription.split('\n').map((paragraph, i) => (
              paragraph.trim() && (
                <p key={`era-para-${i}`} className="text-white/80 text-sm leading-relaxed font-light italic">
                  {paragraph.trim()}
                </p>
              )
            ))}
          </div>
        </motion.div>
      )}

      <div className="flex flex-col md:flex-row items-center gap-6 w-full max-w-4xl mb-6">
        <button
          onClick={() => setActiveSection('fate')}
          className="w-full md:flex-1 py-6 bg-gold/10 border border-gold/30 text-gold rounded-2xl font-mono uppercase tracking-[0.2em] text-sm hover:bg-gold/20 transition-all glow-gold border-glow-gold"
        >
          Ткач Судеб
        </button>
        <button
          onClick={() => setActiveSection('tree')}
          className="w-full md:flex-1 py-6 bg-white/5 border border-white/10 text-white/60 rounded-2xl font-mono uppercase tracking-[0.2em] text-sm hover:bg-white/10 transition-all"
        >
          Дерево Жизни
        </button>
      </div>

      <button
        onClick={onOpenArchives}
        className="w-full max-w-4xl py-6 bg-white/5 border border-white/10 text-white/60 rounded-2xl font-mono uppercase tracking-[0.2em] text-sm hover:bg-white/10 transition-all flex items-center justify-center gap-3 mb-12"
      >
        <HistoryIcon size={18} />
        Архивы Цивилизации
      </button>
    </motion.div>
  );
};
