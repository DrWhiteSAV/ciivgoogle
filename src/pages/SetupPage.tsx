import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { PLANETS, RACES } from '../config/constants';
import { SpaceBackground } from '../components/SpaceBackground';
import { PlanetImageFull, RaceImageFull, RaceTable, PlanetCompatibilityTable } from '../components/GameComponents';
import { HabitatChart } from '../components/HabitatChart';
import { FullscreenImage, StatInfoWindow } from '../components/UI';
import { GameState } from '../types/game';

interface SetupPageProps {
  onDone: (planet: any, race: any) => void;
  gameState: GameState;
  onPreviewPlanet?: (planet: any) => void;
  onPreviewRace?: (race: any) => void;
  onSelectPlanet?: (planet: any) => void;
}

export const SetupPage: React.FC<SetupPageProps> = ({ onDone, gameState, onPreviewPlanet, onPreviewRace, onSelectPlanet }) => {
  const [setupPhase, setSetupPhase] = useState<'planet' | 'race'>('planet');
  const [fullscreenImage, setFullscreenImage] = useState<{ src: string; alt: string } | null>(null);
  const [statInfoWindow, setStatInfoWindow] = useState<{ x: number; y: number; title: string; desc: string } | null>(null);
  const [selectedPlanet, setSelectedPlanet] = useState(gameState.planet);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [setupPhase]);

  const handleStatClick = useCallback((e: React.MouseEvent, title: string, desc: string) => {
    e.stopPropagation();
    setStatInfoWindow({ x: e.clientX, y: e.clientY, title, desc });
  }, []);

  const handleStatHide = useCallback(() => {
    setStatInfoWindow(null);
  }, []);

  return (
    <div className="relative h-screen flex flex-col items-center justify-start px-[3%] py-5 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl flex flex-col bg-transparent p-[1px] md:p-4 rounded-3xl max-h-full"
      >
        <div className="text-center mt-0 mb-0 relative py-0 flex-shrink-0 bg-transparent border border-white/10 rounded-2xl">
          {setupPhase === 'race' && (
            <button 
              onClick={() => setSetupPhase('planet')}
              className="absolute top-1/2 -translate-y-1/2 left-4 text-gold/60 hover:text-gold flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest transition-all group z-10"
            >
              <ArrowLeft size={10} className="group-hover:-translate-x-1 transition-transform" /> НАЗАД
            </button>
          )}
          <h1 className="text-xl md:text-3xl font-light glow-gold mb-[1px] leading-tight">
            {setupPhase === 'planet' ? 'Выберите мир' : 'Выберите расу'}
          </h1>
          <p className="text-white/40 font-mono text-[9px] uppercase tracking-widest leading-tight">
            {setupPhase === 'planet' ? 'Где начнется ваша история?' : 'Кто станет венцом творения?'}
          </p>
        </div>

        <div 
          ref={scrollContainerRef}
          className="grid grid-cols-1 md:grid-cols-2 gap-[2%] flex-1 overflow-y-auto pr-1 custom-scrollbar mt-4"
        >
          {setupPhase === 'planet' ? (
            PLANETS.map((p) => (
              <div 
                key={p.id} 
                className="flex flex-col p-3 bg-transparent border border-white/10 rounded-2xl text-left transition-all min-w-0 hover:border-gold/30 group"
              >
                <PlanetImageFull planet={p} onClick={() => onPreviewPlanet?.(p)} />
                <p 
                  className="text-[11px] text-white/50 leading-snug mb-2 mt-2 cursor-pointer hover:text-white transition-colors"
                  onClick={() => onPreviewPlanet?.(p)}
                >
                  {p.shortDesc}
                </p>
                <HabitatChart data={p.habitat} color="#d4af37" onStatClick={handleStatClick} onStatHide={handleStatHide} />
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedPlanet(p); onSelectPlanet?.(p); setSetupPhase('race'); }}
                  className="mt-auto w-full py-2 bg-transparent border border-gold/50 text-gold rounded-xl transition-all hover:bg-gold/20 font-mono uppercase tracking-widest text-[10px] border-glow-gold glow-gold"
                >
                  Выбрать этот мир
                </button>
              </div>
            ))
          ) : (
            RACES.map((r) => (
              <div 
                key={r.id} 
                className="flex flex-col p-3 bg-transparent border border-white/10 rounded-2xl text-left transition-all min-w-0 hover:border-gold/30 group"
              >
                <RaceImageFull race={r} onClick={() => onPreviewRace?.(r)} />
                <div 
                  className="text-[9px] font-mono text-white/30 uppercase mb-2 mt-2 cursor-pointer hover:text-gold transition-colors"
                  onClick={() => onPreviewRace?.(r)}
                >
                  {r.type} | {r.trait}
                </div>
                <p 
                  className="text-[11px] text-white/50 leading-snug mb-2 cursor-pointer hover:text-white transition-colors line-clamp-3"
                  onClick={() => onPreviewRace?.(r)}
                >
                  {r.biology || r.desc}
                </p>
                <HabitatChart data={r.habitat} color="#6432c8" onStatClick={handleStatClick} onStatHide={handleStatHide} />
                <div onClick={(e) => e.stopPropagation()}>
                  <RaceTable race={r} />
                </div>
                <div onClick={(e) => e.stopPropagation()} className="mt-2">
                  <PlanetCompatibilityTable race={r} planet={selectedPlanet} />
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); onDone(selectedPlanet, r); }}
                  className="mt-auto w-full py-2 bg-transparent border border-gold/50 text-gold rounded-xl transition-all hover:bg-gold/20 font-mono uppercase tracking-widest text-[10px] border-glow-gold glow-gold"
                >
                  Вплести в полотно
                </button>
              </div>
            ))
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {fullscreenImage && (
          <FullscreenImage 
            key="setup-fullscreen-image"
            src={fullscreenImage.src} 
            alt={fullscreenImage.alt} 
            onClose={() => setFullscreenImage(null)} 
          />
        )}
        {statInfoWindow && (
          <StatInfoWindow 
            key="setup-stat-info"
            info={statInfoWindow} 
            onClose={handleStatHide} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};
