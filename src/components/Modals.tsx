import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Zap, History as HistoryIcon, TrendingUp, TrendingDown, Users, Activity, Sparkles } from 'lucide-react';
import { GameState, ChronicleEntry } from '../types/game';
import { CircularProgress } from './UI';
import { HabitatChart } from './HabitatChart';
import { getCompatibility } from '../config/constants';

interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  transparent?: boolean;
  hideHeader?: boolean;
}

export const Modal: React.FC<ModalProps> = ({ onClose, children, title, transparent, hideHeader }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className={`fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-[20px]`}
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.9, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.9, y: 20 }}
      className={`bg-black/10 backdrop-blur-[20px] border border-gold/30 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)]`}
      onClick={e => e.stopPropagation()}
    >
      {!hideHeader && (
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h3 className="text-lg font-mono text-gold uppercase tracking-widest">{title}</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {children}
      </div>
    </motion.div>
  </motion.div>
);

export const WorldModal: React.FC<{
  planet: any;
  onClose: () => void;
  onFullscreen: (img: { src: string; alt: string }) => void;
  onStatClick: (e: React.MouseEvent, title: string, desc: string) => void;
  onStatHide: () => void;
}> = ({ planet, onClose, onFullscreen, onStatClick, onStatHide }) => (
  <Modal onClose={onClose} hideHeader>
    <div className="space-y-8">
      <div 
        className="relative w-full aspect-[1280/714] rounded-[10px] overflow-hidden border border-white/10 group cursor-pointer" 
        onClick={() => onFullscreen({ src: planet.image, alt: planet.name })}
      >
        <img 
          src={planet.image} 
          alt={planet.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
          referrerPolicy="no-referrer" 
        />
        <div 
          className="absolute top-4 right-4 p-2 bg-black/60 backdrop-blur-md rounded-full border border-gold/50 text-gold hover:scale-110 transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)]" 
          onClick={(e) => { e.stopPropagation(); onClose(); }}
        >
          <X size={18} className="drop-shadow-[0_0_5px_rgba(212,175,55,0.5)]" />
        </div>
      </div>

      <div className="p-6 bg-gold/5 border border-gold/20 rounded-2xl">
        <p className="text-sm text-white/90 leading-relaxed italic">
          {planet.shortDesc}
        </p>
      </div>

      <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
        <h4 className="text-[10px] font-mono text-gold uppercase tracking-widest mb-6 flex items-center gap-2">
          <Activity size={14} /> Характеристики мира
        </h4>
        <HabitatChart 
          data={planet.habitat} 
          color="#d4af37" 
          onStatClick={onStatClick} 
          onStatHide={onStatHide} 
        />
      </div>

      <div className="p-8 bg-white/5 border border-white/10 rounded-3xl">
        <h4 className="text-xs font-mono text-gold uppercase tracking-widest mb-6 flex items-center gap-2">
          <HistoryIcon size={14} /> История возникновения
        </h4>
        <div className="space-y-4 max-h-[30rem] overflow-y-auto pr-4 custom-scrollbar">
          {planet.history.split('\n').map((paragraph: string, i: number) => (
            paragraph.trim() && (
              <p key={`world-para-${planet.id}-${i}`} className="text-sm text-white/70 leading-relaxed text-justify">
                {paragraph.trim()}
              </p>
            )
          ))}
        </div>
      </div>

      <button
        onClick={onClose}
        className="w-full py-4 bg-white/5 border border-white/10 text-white/40 rounded-xl font-mono uppercase tracking-widest text-sm hover:bg-white/10 transition-all"
      >
        Закрыть
      </button>
    </div>
  </Modal>
);

export const RaceModal: React.FC<{
  race: any;
  planet: any;
  onClose: () => void;
  onFullscreen: (img: { src: string; alt: string }) => void;
  onStatClick: (e: React.MouseEvent, title: string, desc: string) => void;
  onStatHide: () => void;
  compatibility: number;
}> = ({ race, planet, onClose, onFullscreen, onStatClick, onStatHide, compatibility }) => (
  <Modal onClose={onClose} hideHeader>
    <div className="space-y-6">
      <div 
        className="relative w-full aspect-[1280/714] rounded-[10px] overflow-hidden border border-white/10 group cursor-pointer" 
        onClick={() => onFullscreen({ src: race.image, alt: race.name })}
      >
        <img src={race.image} alt={race.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        <div 
          className="absolute top-4 right-4 p-2 bg-black/60 backdrop-blur-md rounded-full border border-gold/30 text-gold hover:scale-110 transition-all" 
          onClick={(e) => { e.stopPropagation(); onClose(); }}
        >
          <Sparkles size={16} />
        </div>
      </div>

      <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
        <h4 className="text-[10px] font-mono text-gold uppercase tracking-widest mb-4">Биология расы</h4>
        <div className="max-h-48 overflow-y-auto custom-scrollbar pr-2">
          <p className="text-xs text-white/60 leading-relaxed whitespace-pre-line">{race.biology || race.desc}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
          <h4 className="text-[10px] font-mono text-gold uppercase tracking-widest mb-4">Репродукция</h4>
          <div className="space-y-2 text-[11px]">
            <div className="flex justify-between"><span className="text-white/40">Тип:</span> <span>{race.reproduction.type}</span></div>
            <div className="flex justify-between"><span className="text-white/40">Срок:</span> <span>{race.reproduction.term}</span></div>
            <div className="flex justify-between"><span className="text-white/40">Потомство:</span> <span>{race.reproduction.offspring}</span></div>
          </div>
        </div>
        <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
          <h4 className="text-[10px] font-mono text-gold uppercase tracking-widest mb-4">Развитие</h4>
          <div className="space-y-2 text-[11px]">
            <div className="flex justify-between"><span className="text-white/40">Взросление:</span> <span>{race.development.maturation}</span></div>
            <div className="flex justify-between"><span className="text-white/40">Срок жизни:</span> <span>{race.development.lifespan}</span></div>
            <div className="flex justify-between"><span className="text-white/40">Особенности:</span> <span>{race.development.features}</span></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
          <h4 className="text-[10px] font-mono text-gold uppercase tracking-widest mb-4">Статистика</h4>
          <div className="space-y-2 text-[11px]">
            <div className="flex justify-between"><span className="text-white/40">Прирост:</span> <span className="text-green-400">+{race.stats.avgGrowth}%</span></div>
            <div className="flex justify-between"><span className="text-white/40">Смертность:</span> <span className="text-red-400">{race.stats.avgMortality}%</span></div>
            <div className="flex justify-between mt-4"><span className="text-white/40">Совместимость:</span> <span className="text-yellow-400">{compatibility}%</span></div>
          </div>
        </div>
        <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
          <h4 className="text-[10px] font-mono text-gold uppercase tracking-widest mb-4">Предпочтения среды</h4>
          <HabitatChart data={race.habitat} color="#6432c8" onStatClick={onStatClick} onStatHide={onStatHide} />
        </div>
      </div>

      <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
        <h4 className="text-[10px] font-mono text-gold uppercase tracking-widest mb-4">История расы</h4>
        <div className="max-h-48 overflow-y-auto custom-scrollbar pr-2">
          <p className="text-xs text-white/60 leading-relaxed whitespace-pre-line">{race.history}</p>
        </div>
      </div>

      <button
        onClick={onClose}
        className="w-full py-4 bg-white/5 border border-white/10 text-white/40 rounded-xl font-mono uppercase tracking-widest text-sm hover:bg-white/10 transition-all"
      >
        Закрыть
      </button>
    </div>
  </Modal>
);

export const ResultModal: React.FC<{ 
  result: any; 
  onApply: (bonus: boolean) => void;
  isObserverMode: boolean;
  gameState: GameState;
}> = ({ result, onApply, isObserverMode, gameState }) => {
  if (!result) return null;

  const chronicles = result.chronicles || [];
  const isBonusApplied = gameState.isBonusActive || gameState.isBonusEarned;
  
  // Calculate total population change summary
  let currentPop = gameState.population;
  const processedChronicles = chronicles.map((c: any) => {
    const oldPop = currentPop;
    const prayersUsed = c.prayersUsed || isBonusApplied;
    const originalGrowthPercent = c.originalGrowthPercent !== undefined ? c.originalGrowthPercent : (c.growthPercent || 0);
    let growthPercent = c.growthPercent || 0;
    
    // Enforce prayer bonus rules for display
    if (prayersUsed) {
      if (originalGrowthPercent < 0) {
        growthPercent = 0;
      } else if (originalGrowthPercent > 0) {
        // Double it if it wasn't already doubled
        if (Math.abs(growthPercent - originalGrowthPercent) < 0.01) {
          growthPercent = originalGrowthPercent * 2;
        }
      }
    }
    
    // Round up population as requested
    currentPop = Math.max(0, Math.ceil(oldPop * (1 + growthPercent / 100)));
    return { ...c, prayersUsed, growthPercent, originalGrowthPercent, population: currentPop, oldPopulation: oldPop };
  });

  const totalGrowthPercent = processedChronicles.reduce((acc: number, c: any) => acc + (c.growthPercent || 0), 0);

  return (
    <Modal onClose={() => onApply(false)} title="Результат Ткача">
      <div className="space-y-6">
        {(gameState.isBonusActive || gameState.isBonusEarned) && (
          <div className="p-3 bg-gold/20 border border-gold/40 rounded-xl text-center">
            <span className="text-[10px] font-mono text-gold uppercase tracking-widest font-bold">
              ✨ Бонус молитв применен: Рост x2, Убыль нивелирована
            </span>
          </div>
        )}
        <div className={`p-6 rounded-2xl border ${result.isSuccess ? 'border-gold/20 bg-gold/5' : 'border-red-500/20 bg-red-500/5'}`}>
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-xl ${result.isSuccess ? 'bg-gold/10 text-gold' : 'bg-red-500/10 text-red-500'}`}>
              <Zap size={24} />
            </div>
            <div>
              <h4 className="text-xl font-medium">{result.isSuccess ? 'Успех' : 'Неудача'}</h4>
              <p className="text-white/40 text-xs font-mono uppercase tracking-widest">Путь: {result.choiceTitle}</p>
            </div>
          </div>
          <p className="text-white/80 leading-relaxed break-words">{result.newSituation}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-white/5 rounded-xl border border-white/10">
            <span className="text-[10px] font-mono text-white/40 uppercase block mb-1">Итоговый рост</span>
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className={totalGrowthPercent >= 0 ? 'text-green-400' : 'text-red-400'} />
              <span className={`text-lg font-mono ${totalGrowthPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {totalGrowthPercent > 0 ? '+' : ''}{totalGrowthPercent.toFixed(2)}%
              </span>
            </div>
          </div>
          <div className="p-4 bg-white/5 rounded-xl border border-white/10">
            <span className="text-[10px] font-mono text-white/40 uppercase block mb-1">Новый навык</span>
            <span className="text-sm font-medium text-gold break-words">{result.acquiredSkill?.name || 'Нет'}</span>
          </div>
        </div>

        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
          <span className="text-[10px] font-mono text-white/40 uppercase block mb-2">Новая численность</span>
          <div className="flex items-center gap-3">
             <span className="text-2xl font-mono text-gold">
               {currentPop.toLocaleString()}
             </span>
          </div>
        </div>

        <div className="space-y-4">
          <h5 className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Хроника событий:</h5>
          <div className="space-y-4">
            {processedChronicles.map((c: any, idx: number) => (
              <div key={`result-chronicle-${idx}`} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-gold/30 transition-all">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-mono text-gold uppercase tracking-widest">ГОД {c.year}</span>
                    <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest">{gameState.era}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {c.prayersUsed && c.originalGrowthPercent !== undefined && c.oldPopulation !== undefined && (
                      <div className="flex flex-col items-end gap-1">
                        <div className="px-2 py-0.5 rounded bg-white/5 border border-white/5">
                          <span className="text-[7px] font-mono text-white/40 uppercase">
                            БЕЗ МОЛИТВ: {c.originalGrowthPercent >= 0 ? '+' : ''}{c.originalGrowthPercent.toFixed(2)}%
                          </span>
                        </div>
                        <div className={`px-2 py-1 rounded border ${c.growthPercent >= 0 ? 'bg-green-400/10 border-green-400/20 text-green-400' : 'bg-red-400/10 border-red-400/20 text-red-400'}`}>
                          <span className="text-[9px] font-mono font-bold">
                            С МОЛИТВАМИ: {c.growthPercent >= 0 ? '+' : ''}{c.growthPercent.toFixed(2)}%
                          </span>
                        </div>
                        <span className="text-[7px] font-mono text-white/20 uppercase">
                          НАСЕЛЕНИЕ: {c.population.toLocaleString()} (БЫЛО: {c.oldPopulation.toLocaleString()})
                        </span>
                      </div>
                    )}
                    {!c.prayersUsed && c.growthPercent !== undefined && (
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-[9px] font-mono px-2 py-1 rounded bg-white/5 ${c.growthPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {c.growthPercent >= 0 ? 'Прибыль' : 'Убыток'} {c.growthPercent >= 0 ? '+' : ''}{c.growthPercent.toFixed(2)}%
                        </span>
                        <span className="text-[7px] font-mono text-white/20 uppercase">
                          НАСЕЛЕНИЕ: {c.population.toLocaleString()} (БЫЛО: {c.oldPopulation?.toLocaleString()})
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <p className="text-[11px] text-white/60 leading-relaxed italic mb-3">"{c.event}"</p>
              </div>
            ))}
          </div>
        </div>

        {!isObserverMode ? (
          <button
            onClick={() => onApply(gameState.isBonusEarned)}
            className="w-full py-4 bg-gold text-black rounded-xl font-mono uppercase tracking-widest text-sm font-bold hover:bg-white transition-all shadow-[0_0_30px_rgba(212,175,55,0.3)]"
          >
            Принять судьбу
          </button>
        ) : (
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent('toggleObserverHide'));
            }}
            className="w-full py-3 bg-white/5 border border-white/10 text-white/40 rounded-xl font-mono uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all"
          >
            Скрыть режим
          </button>
        )}
      </div>
    </Modal>
  );
};

export const ChronicleModal: React.FC<{ 
  chronicles: ChronicleEntry[]; 
  onClose: () => void;
}> = ({ chronicles, onClose }) => (
  <Modal onClose={onClose} title="Летопись времен">
    <div className="space-y-6">
      {chronicles.slice().reverse().map((c) => (
        <div key={c.id} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-gold/30 transition-all">
          <div className="flex justify-between items-start mb-2">
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-mono text-gold uppercase tracking-widest">ГОД {c.year}</span>
              <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest">{c.era}</span>
            </div>
            <div className="flex flex-col items-end gap-1">
              {c.prayersUsed && c.originalGrowthPercent !== undefined && c.oldPopulation !== undefined && (
                <div className="flex flex-col items-end gap-1">
                  <div className="px-2 py-0.5 rounded bg-white/5 border border-white/5">
                    <span className="text-[7px] font-mono text-white/40 uppercase">
                      БЕЗ МОЛИТВ: {c.originalGrowthPercent >= 0 ? '+' : ''}{c.originalGrowthPercent.toFixed(2)}%
                    </span>
                  </div>
                  <div className={`px-2 py-1 rounded border ${c.growthPercent >= 0 ? 'bg-green-400/10 border-green-400/20 text-green-400' : 'bg-red-400/10 border-red-400/20 text-red-400'}`}>
                    <span className="text-[9px] font-mono font-bold">
                      С МОЛИТВАМИ: {c.growthPercent >= 0 ? '+' : ''}{c.growthPercent.toFixed(2)}%
                    </span>
                  </div>
                  <span className="text-[7px] font-mono text-white/20 uppercase">
                    НАСЕЛЕНИЕ: {c.population.toLocaleString()} (БЫЛО: {c.oldPopulation.toLocaleString()})
                  </span>
                </div>
              )}
              {!c.prayersUsed && c.growthPercent !== undefined && (
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-[9px] font-mono px-2 py-1 rounded bg-white/5 ${c.growthPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {c.growthPercent >= 0 ? 'Прибыль' : 'Убыток'} {c.growthPercent >= 0 ? '+' : ''}{c.growthPercent.toFixed(2)}%
                  </span>
                  <span className="text-[7px] font-mono text-white/20 uppercase">
                    НАСЕЛЕНИЕ: {c.population.toLocaleString()} (БЫЛО: {c.oldPopulation?.toLocaleString()})
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <h4 className="text-xs font-medium text-white mb-2">{c.choiceTitle}</h4>
          <p className="text-[11px] text-white/60 leading-relaxed mb-3">{c.event}</p>
        </div>
      ))}
    </div>
  </Modal>
);

export const YearSelectionModal: React.FC<{
  availableYears: number;
  onSelect: (years: number) => void;
  onClose: () => void;
  isObserver?: boolean;
}> = ({ availableYears, onSelect, onClose, isObserver }) => {
  const maxYears = isObserver 
    ? (availableYears % 10 === 0 ? availableYears / 10 : Math.ceil(availableYears / 100) * 10)
    : availableYears;
  
  // Refined maxYears logic based on user request:
  // "от 1 до лет в работе, деленное на 10... если не кратное делению на 10, то округляй десятки в большую сторону"
  // Example: 1507 -> 160, 207 -> 21 (wait, 207/10 = 20.7, rounding tens up? 21? or 30?)
  // "если лет в работе 207, то от 1 до 21" -> this means Math.ceil(availableYears / 10)
  const calculatedMax = Math.ceil(availableYears / 10);
  
  const [years, setYears] = React.useState(1);
  
  return (
    <Modal onClose={onClose} title={isObserver ? "Количество лет за цикл" : "Выбор периода"}>
      <div className="space-y-8 py-4">
        <div className="text-center">
          <span className="text-4xl font-mono text-gold glow-gold">{years}</span>
          <span className="text-white/40 font-mono ml-2 uppercase text-sm">лет</span>
        </div>
        
        <input 
          type="range" 
          min="1" 
          max={calculatedMax} 
          value={years}
          onChange={(e) => setYears(parseInt(e.target.value))}
          className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-gold"
        />
        
        <div className="flex justify-between text-[10px] font-mono text-white/20 uppercase">
          <span>1 год</span>
          <span>{calculatedMax} лет</span>
        </div>

        <button
          onClick={() => onSelect(years)}
          className="w-full py-4 bg-gold/10 border border-gold/30 text-gold rounded-xl font-mono uppercase tracking-widest text-sm hover:bg-gold/20 transition-all"
        >
          {isObserver ? "Запустить цикл" : "Начать плетение"}
        </button>
      </div>
    </Modal>
  );
};

export const ShopModal: React.FC<{ 
  onClose: () => void;
  onBuy: (type: 'years' | 'prayers', amount: number) => void;
}> = ({ onClose, onBuy }) => {
  const [purchaseType, setPurchaseType] = useState<'years' | 'prayers' | null>(null);
  const [amount, setAmount] = useState(100);

  if (purchaseType) {
    const rate = purchaseType === 'years' ? 10 : 100;
    const price = amount;
    const totalAmount = amount * rate;

    return (
      <Modal onClose={() => setPurchaseType(null)} title="Оформление покупки">
        <div className="space-y-8 py-4 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center text-gold">
              {purchaseType === 'years' ? <HistoryIcon size={32} /> : <Zap size={32} />}
            </div>
            <div>
              <h4 className="text-xl font-medium text-gold uppercase tracking-widest">
                {purchaseType === 'years' ? 'Лет в работе' : 'Молитвы'}
              </h4>
              <p className="text-xs text-white/40 uppercase font-mono tracking-widest mt-1">Курс: {rate} за 1 рубль</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-center gap-4 px-8">
              <div className="flex flex-col items-center">
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                  className={`w-32 py-4 bg-white/5 border ${amount < 100 ? 'border-red-500/50' : 'border-white/10'} rounded-xl text-center text-4xl font-mono text-gold focus:outline-none focus:border-gold/50 transition-all`}
                />
                <span className="text-[10px] text-white/40 uppercase font-mono mt-2">рублей</span>
              </div>
            </div>
            
            {amount < 100 && (
              <div className="text-red-400 text-[10px] font-mono uppercase animate-pulse">
                Минимальная сумма покупки — 100 рублей
              </div>
            )}

            <div className="p-4 bg-gold/5 border border-gold/20 rounded-2xl">
              <span className="text-[10px] text-white/40 uppercase font-mono block mb-1">Вы получите</span>
              <span className="text-2xl font-mono text-gold">+{totalAmount} {purchaseType === 'years' ? 'лет' : 'молитв'}</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => {
                if (amount < 100) return;
                onBuy(purchaseType, totalAmount);
                setPurchaseType(null);
              }}
              disabled={amount < 100}
              className={`w-full py-4 rounded-xl font-mono uppercase tracking-widest text-sm font-bold transition-all shadow-[0_0_30px_rgba(212,175,55,0.3)] ${
                amount < 100 ? 'bg-white/5 text-white/20 cursor-not-allowed' : 'bg-gold text-black hover:bg-white'
              }`}
            >
              Оплатить {price} руб.
            </button>
            <button
              onClick={() => setPurchaseType(null)}
              className="w-full py-4 bg-white/5 border border-white/10 text-white/40 rounded-xl font-mono uppercase tracking-widest text-sm hover:bg-white/10 transition-all"
            >
              Отмена
            </button>
          </div>
          
          <p className="text-[9px] text-white/20 uppercase tracking-widest leading-relaxed">
            Это симуляция оплаты для бета-тестирования.<br />Средства не будут списаны.
          </p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal onClose={onClose} title="Магазин">
      <div className="space-y-6">
        <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gold/10 rounded-lg text-gold">
                <HistoryIcon size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gold uppercase">Лет в работе</h4>
                <p className="text-[10px] text-white/40 uppercase">10 ЛЕТ = 1 РУБЛЬ</p>
              </div>
            </div>
            <button 
              onClick={() => setPurchaseType('years')}
              className="px-4 py-2 bg-gold text-black rounded-lg text-xs font-bold uppercase"
            >
              Купить
            </button>
          </div>
          <p className="text-[11px] text-white/60 leading-relaxed">
            Годы в работе — это ваш основной ресурс для изменения судьбы. Они накапливаются со временем (1 год в минуту). 
            Покупка лет позволяет вам мгновенно получить возможность плести нити истории на большие периоды.
          </p>
        </div>

        <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gold/10 rounded-lg text-gold">
                <Zap size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gold uppercase">Молитвы</h4>
                <p className="text-[10px] text-white/40 uppercase">100 МОЛИТВ = 1 РУБЛЬ</p>
              </div>
            </div>
            <button 
              onClick={() => setPurchaseType('prayers')}
              className="px-4 py-2 bg-gold text-black rounded-lg text-xs font-bold uppercase"
            >
              Купить
            </button>
          </div>
          <p className="text-[11px] text-white/60 leading-relaxed">
            Молитвы — это духовная энергия вашего народа. Они позволяют вам вмешиваться в естественный ход событий, 
            усиливая положительные эффекты и нивелируя катастрофы. Молитвы восстанавливаются каждые 5 минут, 
            но вы можете пополнить их запас здесь.
          </p>
        </div>
      </div>
    </Modal>
  );
};

export const BonusChoiceModal: React.FC<{
  bonus: any;
  prayers: number;
  onSkip: () => void;
  onUse: () => void;
}> = ({ bonus, prayers, onSkip, onUse }) => (
  <Modal onClose={onSkip} title="Выбор вмешательства">
    <div className="space-y-6 text-center py-4">
      <div className="w-40 h-40 mx-auto mb-4 relative">
        <img 
          src="https://i.ibb.co/pjpF7crT/mol.png" 
          alt="Prayer Icon" 
          className="w-full h-full object-contain rounded-full"
          referrerPolicy="no-referrer"
        />
      </div>
      <h4 className="text-xl font-medium text-gold">{bonus.name}</h4>
      <p className="text-sm text-white/60 leading-relaxed max-w-sm mx-auto italic">
        "{bonus.prayerText || bonus.desc}"
      </p>
      <p className="text-[10px] font-mono text-gold/60 uppercase tracking-widest">
        Требуется молитв: {bonus.tapsRequired}
      </p>
      
      <div className="grid grid-cols-1 gap-3 pt-4">
        <button
          onClick={onUse}
          disabled={prayers < bonus.tapsRequired}
          className={`w-full py-4 rounded-xl font-mono uppercase tracking-widest text-sm font-bold transition-all ${
            prayers >= bonus.tapsRequired 
              ? 'bg-gold text-black hover:bg-white' 
              : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/10'
          }`}
        >
          {prayers >= bonus.tapsRequired ? 'Использовать молитвы' : 'Недостаточно молитв'}
        </button>
        <button
          onClick={onSkip}
          className="w-full py-4 bg-white/5 border border-white/10 text-white/40 rounded-xl font-mono uppercase tracking-widest text-sm hover:bg-white/10 transition-all"
        >
          Продолжить без молитв
        </button>
      </div>
      <p className="text-[10px] text-white/20 uppercase">
        При пропуске бонус будет удален
      </p>
    </div>
  </Modal>
);
export const ObserverControls: React.FC<{
  isHidden: boolean;
  onToggleHide: () => void;
  onTurnOff: () => void;
}> = ({ isHidden, onToggleHide, onTurnOff }) => {
  return (
    <div className="fixed top-24 right-4 z-[9999] flex flex-col gap-2">
      <button
        onClick={onToggleHide}
        className="px-4 py-2 bg-black/80 backdrop-blur-md border border-gold/30 text-gold rounded-full font-mono text-[10px] uppercase tracking-widest hover:bg-gold/40 transition-all shadow-[0_0_30px_rgba(212,175,55,0.3)]"
      >
        {isHidden ? 'Показать режим' : 'Скрыть режим'}
      </button>
      {!isHidden && (
        <button
          onClick={onTurnOff}
          className="px-4 py-2 bg-red-500/20 backdrop-blur-md border border-red-500/30 text-red-400 rounded-full font-mono text-[10px] uppercase tracking-widest hover:bg-red-500/30 transition-all shadow-xl"
        >
          Выключить наблюдателя
        </button>
      )}
    </div>
  );
};

export const BonusModal: React.FC<{
  bonus: any;
  taps: number;
  prayers: number;
  onTap: () => void;
  onClose: () => void;
  onComplete: () => void;
}> = ({ bonus, taps, prayers, onTap, onClose, onComplete }) => {
  const [isClicked, setIsClicked] = useState(false);
  
  useEffect(() => {
    if (taps >= bonus.tapsRequired) {
      onComplete();
    }
  }, [taps, bonus.tapsRequired, onComplete]);

  return (
    <Modal onClose={onClose} hideHeader>
      <div className="w-full max-w-[320px] h-full max-h-[580px] flex flex-col items-center justify-center text-center overflow-hidden py-4 px-4 mx-auto">
        {/* 1. Название молитвы */}
        <h4 className="text-lg font-medium text-gold leading-tight h-10 flex items-center justify-center w-full">
          {bonus.name}
        </h4>

        {/* Отступ 5px */}
        <div className="h-[5px] flex-shrink-0" />

        {/* 2. Счетчик кликеров */}
        <div className="flex items-center justify-center gap-2 h-12 flex-shrink-0 w-full">
          <motion.span 
            key={taps}
            initial={{ scale: 1.2, color: '#FFD700' }}
            animate={{ scale: 1, color: '#FFD700' }}
            className="text-4xl font-mono glow-gold"
          >
            {taps}
          </motion.span>
          <span className="text-xl font-mono text-white/20">/</span>
          <span className="text-xl font-mono text-white/40">{bonus.tapsRequired}</span>
        </div>

        {/* Отступ 5px */}
        <div className="h-[5px] flex-shrink-0" />

        {/* 3. Картинка кликера */}
        <div className="w-52 h-52 flex items-center justify-center relative flex-shrink-0 mx-auto">
          <motion.button
            onPointerDown={(e) => {
              e.preventDefault();
              setIsClicked(true);
              onTap();
              setTimeout(() => setIsClicked(false), 100);
            }}
            animate={!isClicked ? {
              scale: [1, 1.02, 1],
            } : { scale: 0.95 }}
            transition={!isClicked ? {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            } : { duration: 0.1 }}
            disabled={taps >= bonus.tapsRequired}
            className="w-full h-full rounded-full flex items-center justify-center transition-all duration-150 relative group disabled:opacity-50"
          >
            <img 
              src="https://i.ibb.co/pjpF7crT/mol.png" 
              alt="Prayer" 
              className={`w-full h-full object-contain transition-all duration-150 ${isClicked ? 'brightness-125 scale-105' : ''}`}
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gold/20 animate-ping rounded-full opacity-0 group-active:opacity-100 pointer-events-none" />
          </motion.button>
        </div>

        {/* Отступ 5px */}
        <div className="h-[5px] flex-shrink-0" />

        {/* 4. Быстро нажимайте для активации */}
        <p className="text-[10px] text-white/20 uppercase tracking-widest animate-pulse h-6 flex items-center justify-center w-full flex-shrink-0">
          Быстро нажимайте для активации
        </p>

        {/* Отступ 5px */}
        <div className="h-[5px] flex-shrink-0" />

        {/* 5. Текст молитвы */}
        <div className="flex-1 flex items-start justify-center px-2 overflow-y-auto min-h-0 w-full">
          <p className="text-xs text-white/60 leading-relaxed italic text-center w-full">
            "{bonus.prayerText || bonus.desc}"
          </p>
        </div>

        {/* Отступ 5px */}
        <div className="h-[5px] flex-shrink-0" />

        {/* 6. Кнопка Закрыть */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-white/5 border border-white/10 text-white/40 rounded-xl font-mono uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all flex-shrink-0"
        >
          Закрыть
        </button>
      </div>
    </Modal>
  );
};
