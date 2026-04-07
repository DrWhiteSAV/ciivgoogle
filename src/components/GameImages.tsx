import React from 'react';

export const RaceImageFull: React.FC<{ race: any; className?: string; opacity?: number; onClick?: () => void }> = ({ race, className = "", opacity = 1, onClick }) => (
  <div className={`relative w-full ${className}`}>
    {/* Label above the image */}
    <div className="text-center mb-3">
      <span className="text-[16px] md:text-[24px] font-mono text-gold uppercase tracking-widest glow-gold">
        {race.name}
      </span>
    </div>
    <div 
      className="relative aspect-[1280/714] w-full overflow-hidden rounded-[10px] border border-white/10 cursor-pointer border-light-animation" 
      style={{ opacity: opacity * 0.8 }}
      onClick={onClick}
    >
      <img src={race.image} alt={race.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
    </div>
  </div>
);

export const RaceImageMini: React.FC<{ race: any; className?: string; onClick?: () => void }> = ({ race, className = "", onClick }) => (
  <div className={`relative w-full ${className}`}>
    {/* Label above the image */}
    <div className="text-center mb-3">
      <span className="text-[14px] md:text-[20px] font-mono text-gold uppercase tracking-widest glow-gold">
        {race.name}
      </span>
    </div>
    <div 
      className="relative aspect-square w-full overflow-hidden rounded-[10px] border border-white/10 cursor-pointer border-light-animation"
      style={{ opacity: 0.8 }}
      onClick={onClick}
    >
      <img src={race.image} alt={race.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
    </div>
  </div>
);

export const PlanetImageFull: React.FC<{ planet: any; className?: string; opacity?: number; onClick?: () => void }> = ({ planet, className = "", opacity = 1, onClick }) => (
  <div className={`relative w-full ${className}`}>
    <div className="text-center mb-3">
      <span className="text-[16px] md:text-[24px] font-mono text-gold uppercase tracking-widest glow-gold">
        {planet.name}
      </span>
    </div>
    <div 
      className="relative aspect-[1280/714] w-full overflow-hidden rounded-[10px] border border-white/10 cursor-pointer border-light-animation" 
      style={{ opacity: opacity * 0.8 }}
      onClick={onClick}
    >
      <img src={planet.image} alt={planet.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
    </div>
  </div>
);
