import React from 'react';
import { Baby, Activity, TrendingUp, Skull } from 'lucide-react';
import { getCompatibility } from '../constants';

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
