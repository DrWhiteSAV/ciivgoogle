/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, 
  Zap, 
  Clock, 
  Dna, 
  Cpu, 
  Wheat, 
  PenTool, 
  ArrowRight,
  ChevronRight,
  History as HistoryIcon,
  LayoutGrid,
  Sparkles,
  Atom,
  Microscope,
  Rocket,
  Shield,
  ZapOff,
  User,
  MapPin,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeft,
  Activity,
  Heart,
  Baby,
  Skull,
  X
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer 
} from 'recharts';
import { PLANETS, RACES, getCompatibility, Habitat } from './constants';

// --- Types ---

type Section = 'genesis' | 'fate' | 'tree';

interface Tech {
  id: string;
  name: string;
  icon: React.ReactNode;
  duration: number; // in seconds
  startTime: number | null;
  completed: boolean;
}

interface Skill {
  id: string;
  name: string;
  desc: string;
  year: number;
  type: 'progress' | 'regress';
}

interface AccelerationBonus {
  name: string;
  desc: string;
  tapsRequired: number;
}

interface GameState {
  planet: typeof PLANETS[0];
  race: typeof RACES[0];
  year: number;
  population: number;
  era: string;
  history: string[];
  availableYears: number;
  chronicles: { year: number; event: string }[];
  currentSituation: string;
  choices: { title: string; desc: string }[];
  skills: Skill[];
  accelerationBonus: AccelerationBonus | null;
  bonusTaps: number;
  isBonusActive: boolean;
  pendingResult: any | null;
  stability: number;
  compatibility: number;
}

const ERAS = [
  { name: "Первобытность", minYear: 0, minPop: 0 },
  { name: "Неолит", minYear: 500, minPop: 5000 },
  { name: "Бронзовый век", minYear: 2000, minPop: 50000 },
  { name: "Железный век", minYear: 3500, minPop: 200000 },
  { name: "Античность", minYear: 5000, minPop: 1000000 },
  { name: "Средневековье", minYear: 6500, minPop: 5000000 },
  { name: "Ренессанс", minYear: 8000, minPop: 20000000 },
  { name: "Индустриальная эра", minYear: 9500, minPop: 100000000 },
  { name: "Атомный век", minYear: 10500, minPop: 500000000 },
  { name: "Информационный век", minYear: 11500, minPop: 2000000000 },
  { name: "Космическая эра", minYear: 13000, minPop: 5000000000 },
];

const getEra = (year: number, pop: number) => {
  let currentEra = ERAS[0].name;
  for (const era of ERAS) {
    if (year >= era.minYear && pop >= era.minPop) {
      currentEra = era.name;
    }
  }
  return currentEra;
};

// --- Components ---

const FlameBorder: React.FC<{ children: React.ReactNode; className?: string; style?: React.CSSProperties }> = ({ children, className = "", style }) => {
  return (
    <div className={`relative rounded-2xl ${className}`} style={style}>
      {/* Flame Animation Layers */}
      <div className="absolute inset-0 rounded-2xl border border-gold/30 shadow-[0_0_15px_rgba(212,175,55,0.2)]" />
      
      {/* Animated Glow Layers */}
      <motion.div
        animate={{ 
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.02, 1],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 rounded-2xl border-2 border-gold/20 blur-sm pointer-events-none"
      />
      
      <motion.div
        animate={{ 
          boxShadow: [
            "0 0 20px rgba(212,175,55,0.2), inset 0 0 10px rgba(212,175,55,0.1)",
            "0 0 40px rgba(212,175,55,0.4), inset 0 0 20px rgba(212,175,55,0.2)",
            "0 0 20px rgba(212,175,55,0.2), inset 0 0 10px rgba(212,175,55,0.1)"
          ]
        }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 rounded-2xl pointer-events-none"
      />

      {/* Flickering Flame Effect */}
      <div className="absolute -inset-1 rounded-2xl opacity-30 pointer-events-none overflow-hidden">
         <motion.div 
            animate={{ y: [0, -10, 0], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-gold/40 to-transparent blur-xl"
         />
      </div>

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

const TechCard: React.FC<{ 
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

const SpaceBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let stars: { x: number; y: number; size: number; speed: number; opacity: number }[] = [];

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      stars = Array.from({ length: 300 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2,
        speed: Math.random() * 0.1 + 0.01,
        opacity: Math.random()
      }));
    };

    const draw = () => {
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw galaxy-like background
      const time = Date.now() * 0.0005;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Main galaxy glow
      const galaxyGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, canvas.width * 0.8
      );
      galaxyGradient.addColorStop(0, `rgba(212, 175, 55, ${0.1 + Math.sin(time) * 0.02})`);
      galaxyGradient.addColorStop(0.4, `rgba(100, 50, 200, ${0.05 + Math.cos(time * 0.8) * 0.01})`);
      galaxyGradient.addColorStop(0.7, `rgba(50, 150, 255, ${0.03 + Math.sin(time * 1.2) * 0.01})`);
      galaxyGradient.addColorStop(1, 'rgba(5, 5, 5, 0)');
      
      ctx.fillStyle = galaxyGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Rotating spiral arms (simplified)
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(time * 0.1);
      // Removed 3 large ovals as requested
      ctx.restore();

      stars.forEach(star => {
        ctx.fillStyle = `rgba(212, 175, 55, ${star.opacity})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();

        star.y += star.speed;
        if (star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
        }
        
        // Twinkle
        star.opacity += (Math.random() - 0.5) * 0.05;
        if (star.opacity < 0.1) star.opacity = 0.1;
        if (star.opacity > 0.9) star.opacity = 0.9;
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    init();
    draw();

    const handleResize = () => init();
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 -z-10" />;
};

const TypewriterText: React.FC<{ text: string; delay?: number }> = ({ text, delay = 0.02 }) => {
  return (
    <motion.span>
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * delay }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
};

const CircularProgress: React.FC<{ progress: number; size?: number }> = ({ progress, size = 60 }) => {
  const radius = size / 2 - 4;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="2"
          fill="transparent"
          className="text-white/10"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="2"
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          className="text-gold"
        />
      </svg>
    </div>
  );
};

const SkillCard = React.memo(({ skill, index, color }: { skill: Skill, index: number, color: 'gold' | 'red' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    className="relative group w-full max-w-sm"
  >
    <div className={`p-6 rounded-2xl border ${color === 'gold' ? 'border-gold/20 bg-gold/5' : 'border-red-500/20 bg-red-500/5'} backdrop-blur-md transition-all cursor-help relative overflow-hidden`}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl ${color === 'gold' ? 'bg-gold/10 text-gold' : 'bg-red-500/10 text-red-500'}`}>
          {color === 'gold' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Год {skill.year}</span>
            <span className={`text-[8px] font-mono px-2 py-0.5 rounded border ${color === 'gold' ? 'border-gold/30 text-gold' : 'border-red-500/30 text-red-500'}`}>
              {color === 'gold' ? 'ПРОГРЕСС' : 'РЕГРЕСС'}
            </span>
          </div>
          <h4 className="text-sm font-medium text-white mb-2">{skill.name}</h4>
          <p className="text-xs text-white/60 leading-relaxed">{skill.desc}</p>
        </div>
      </div>
      
      {/* Decorative background element */}
      <div className={`absolute -right-4 -bottom-4 opacity-5 ${color === 'gold' ? 'text-gold' : 'text-red-500'}`}>
        <Atom size={80} />
      </div>
    </div>
  </motion.div>
));

const StatInfoWindow: React.FC<{ 
  info: { x: number; y: number; title: string; desc: string }; 
  onClose: () => void 
}> = ({ info, onClose }) => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed z-[500] pointer-events-none flex flex-col items-center justify-center text-center p-4 select-none"
      style={{
        top: isMobile ? '50%' : info.y,
        left: isMobile ? '50%' : info.x,
        transform: isMobile ? 'translate(-50%, -50%)' : 'translate(0, -100%)',
        marginTop: isMobile ? 0 : -40
      }}
    >
      <span className="text-sm font-mono text-gold uppercase tracking-[0.3em] font-bold glow-gold mb-2 drop-shadow-[0_0_10px_rgba(212,175,55,0.8)]">
        {info.title}
      </span>
      <p className="text-[11px] text-white font-mono uppercase font-bold tracking-widest max-w-[220px] leading-tight drop-shadow-[0_0_12px_rgba(0,0,0,1)] drop-shadow-[0_0_4px_rgba(0,0,0,1)]">
        {info.desc}
      </p>
    </motion.div>
  );
};

const FullscreenImage: React.FC<{ src: string; alt: string; onClose: () => void }> = ({ src, alt, onClose }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4 md:p-12"
    onClick={onClose}
  >
    <button 
      onClick={onClose}
      className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors z-[210]"
    >
      <X size={32} />
    </button>
    <motion.img 
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      src={src} 
      alt={alt} 
      className="max-w-full max-h-full object-contain shadow-2xl rounded-lg"
      referrerPolicy="no-referrer"
      onClick={(e) => e.stopPropagation()}
    />
  </motion.div>
);

const PlanetImageFull: React.FC<{ planet: any; className?: string; opacity?: number; onClick?: () => void }> = ({ planet, className = "", opacity = 1, onClick }) => (
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

const RaceImageFull: React.FC<{ race: any; className?: string; opacity?: number; onClick?: () => void }> = ({ race, className = "", opacity = 1, onClick }) => (
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

const RaceImageMini: React.FC<{ race: any; className?: string; onClick?: () => void }> = ({ race, className = "", onClick }) => (
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

const HabitatChart = React.memo(({ data, color, onStatClick, onStatHide }: { 
  data: Habitat, 
  color: string, 
  onStatClick?: (e: React.MouseEvent, title: string, desc: string) => void,
  onStatHide?: () => void
}) => {
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      if (!entries.length) return;
      const { width, height } = entries[0].contentRect;
      // Only update if we have real dimensions to avoid Recharts warnings
      if (width > 0 && height > 0) {
        setDimensions({ width, height });
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const chartData = useMemo(() => [
    { subject: 'Темп', A: data.temp, fullMark: 100, desc: 'Температура среды' },
    { subject: 'Грав', A: data.grav, fullMark: 100, desc: 'Сила гравитации' },
    { subject: 'Атмо', A: data.atmo, fullMark: 100, desc: 'Плотность атмосферы' },
    { subject: 'Рад', A: data.rad, fullMark: 100, desc: 'Уровень радиации' },
    { subject: 'Влаж', A: data.humi, fullMark: 100, desc: 'Влажность воздуха' },
    { subject: 'Рес', A: data.res, fullMark: 100, desc: 'Доступность ресурсов' },
  ], [data]);

  const CustomTick = (props: any) => {
    const { x, y, payload } = props;
    const item = chartData.find(d => d.subject === payload.value);
    
    return (
      <g 
        transform={`translate(${x},${y})`} 
        className="group cursor-pointer"
        style={{ pointerEvents: 'all' }}
        onPointerDown={(e) => {
          e.stopPropagation();
          onStatClick?.(e as any, item?.subject || '', item?.desc || '');
        }}
        onPointerUp={() => onStatHide?.()}
        onPointerLeave={() => onStatHide?.()}
      >
        <text x={0} y={0} dy={-10} textAnchor="middle" fill="#ffffff60" fontSize={10} className="uppercase">
          {payload.value}
        </text>
        <text x={0} y={10} textAnchor="middle" fill={color} fontSize={10} fontWeight="bold" className="font-mono">
          {item?.A}
        </text>
      </g>
    );
  };

  return (
    <div className="w-full flex flex-col items-center min-w-0 py-2">
      <div ref={containerRef} className="w-full h-52 min-w-0 relative overflow-hidden flex items-center justify-center" style={{ minHeight: '208px' }}>
        {!dimensions && (
          <div className="text-white/5 text-[10px] font-mono uppercase tracking-widest">
            Инициализация...
          </div>
        )}
        {dimensions && (
          <ResponsiveContainer width={dimensions.width} height={dimensions.height}>
            <RadarChart cx="50%" cy="50%" outerRadius="60%" data={chartData}>
              <PolarGrid stroke="#ffffff20" />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={<CustomTick />}
                isAnimationActive={false}
              />
              <Radar
                name="Habitat"
                dataKey="A"
                stroke={color}
                fill={color}
                fillOpacity={0.5}
                isAnimationActive={false}
                animationDuration={0}
                dot={(props: any) => {
                  const { cx, cy, payload } = props;
                  return (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={10}
                      fill={color}
                      fillOpacity={0.8}
                      className="cursor-pointer"
                      style={{ pointerEvents: 'all' }}
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        onStatClick?.(e as any, payload.subject, payload.desc);
                      }}
                      onPointerUp={() => onStatHide?.()}
                      onPointerLeave={() => onStatHide?.()}
                    />
                  );
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
});

const RaceTable = ({ race }: { race: any }) => (
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

const PlanetCompatibilityTable = ({ race, planet }: { race: any, planet: any }) => {
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

// --- Main App ---

export default function App() {
  const [setupPhase, setSetupPhase] = useState<'planet' | 'race' | 'done'>('planet');
  const [gameState, setGameState] = useState<GameState>({
    planet: PLANETS[0],
    race: RACES[0],
    year: 0,
    population: 144,
    era: 'Первобытность',
    history: ['Начало времен. Цивилизация зародилась.'],
    availableYears: 5,
    chronicles: [],
    currentSituation: 'Ваша цивилизация только что зародилась. Первые поселения появились в плодородных долинах. Что станет вашим первым шагом к величию?',
    choices: [
      { title: 'Путь Единства', desc: 'Объединить племена под знаменем общей веры.' },
      { title: 'Путь Познания', desc: 'Сфокусироваться на изучении окружающего мира.' },
      { title: 'Путь Силы', desc: 'Установить жесткую иерархию и дисциплину.' }
    ],
    skills: [],
    accelerationBonus: null,
    bonusTaps: 0,
    isBonusActive: false,
    pendingResult: null,
    stability: 100,
    compatibility: 100
  });

  const [activeSection, setActiveSection] = useState<Section>('genesis');
  const [hoveredChoice, setHoveredChoice] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isObserverMode, setIsObserverMode] = useState(false);
  const [selectedYearsToPass, setSelectedYearsToPass] = useState(0);
  const [showBonusNotify, setShowBonusNotify] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showChronicleModal, setShowChronicleModal] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [secondsToNextYear, setSecondsToNextYear] = useState(59);
  const [selectedChoiceIndex, setSelectedChoiceIndex] = useState<number | null>(null);
  const [showYearSelectionModal, setShowYearSelectionModal] = useState(false);
  const [generationTimer, setGenerationTimer] = useState(0);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [mobileTreeBranch, setMobileTreeBranch] = useState<'progress' | 'regress'>('progress');

  const [showWorldModal, setShowWorldModal] = useState(false);
  const [showRaceModal, setShowRaceModal] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<{ src: string; alt: string } | null>(null);
  const [statInfoWindow, setStatInfoWindow] = useState<{ x: number; y: number; title: string; desc: string } | null>(null);

  const handleStatClick = React.useCallback((e: React.MouseEvent, title: string, desc: string) => {
    e.stopPropagation();
    setStatInfoWindow({
      x: e.clientX,
      y: e.clientY,
      title,
      desc
    });
  }, []);

  const handleStatHide = React.useCallback(() => {
    setStatInfoWindow(null);
  }, []);

  // Removed global click listener to allow hold-to-view logic without immediate closing

  const mainContainerRef = useRef<HTMLDivElement>(null);

  // Observer Mode Logic
  useEffect(() => {
    if (isObserverMode && gameState.availableYears > 0 && !isGenerating && !gameState.pendingResult && !showResultModal && !showChronicleModal && !showYearSelectionModal) {
      const randomChoice = Math.floor(Math.random() * gameState.choices.length);
      const years = gameState.availableYears;
      setSelectedYearsToPass(years);
      handleFateChoice(randomChoice, years);
    }
  }, [isObserverMode, gameState.availableYears, isGenerating, gameState.pendingResult, showResultModal, showChronicleModal, showYearSelectionModal]);

  useEffect(() => {
    if (isObserverMode && gameState.pendingResult && !isGenerating) {
      const timer = setTimeout(() => {
        applyPendingResult(false);
        // Ensure modals are closed in observer mode
        setShowResultModal(false);
        setShowChronicleModal(false);
        setShowBonusNotify(false); // Close Tree of Life modal in observer mode
        setSelectedYearsToPass(0);
      }, 1500); 
      return () => clearTimeout(timer);
    }
  }, [isObserverMode, gameState.pendingResult, isGenerating]);

  // Scroll to top on section/phase change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (mainContainerRef.current) {
      mainContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [setupPhase, activeSection]);

  // Calculate stability whenever skills change
  useEffect(() => {
    if (gameState.skills.length === 0) {
      setGameState(prev => ({ ...prev, stability: 100 }));
      return;
    }
    const progressCount = gameState.skills.filter(s => s.type === 'progress').length;
    const regressCount = gameState.skills.filter(s => s.type === 'regress').length;
    const stability = Math.min(100, Math.max(0, 100 - (regressCount * 15) + (progressCount * 5)));
    setGameState(prev => ({ ...prev, stability }));
  }, [gameState.skills]);

  // Calculate compatibility when race or planet changes
  useEffect(() => {
    const compatibility = getCompatibility(gameState.race.habitat as Habitat, gameState.planet.habitat as Habitat);
    setGameState(prev => ({ ...prev, compatibility }));
  }, [gameState.race, gameState.planet]);

  // Timer for available years and countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsToNextYear(prev => {
        if (prev <= 1) {
          // Increment available years when timer hits zero
          setGameState(gs => ({
            ...gs,
            availableYears: gs.availableYears + 1
          }));
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Removed the separate effect that was causing double increments

  // Generation timer
  useEffect(() => {
    let timer: any;
    if (isGenerating) {
      setGenerationTimer(0);
      timer = setInterval(() => {
        setGenerationTimer(prev => {
          if (prev >= 60) {
            setGenerationError("Ткач немного устал от сложности ваших судеб. Попробуйте повторить или вернитесь к прошлому периоду.");
            setIsGenerating(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isGenerating]);

  const handleFateChoice = async (choiceIndex: number, yearsToPass: number) => {
    if (yearsToPass < 1 || gameState.availableYears < yearsToPass) return;
    
    setIsGenerating(true);
    setGenerationError(null);
    const choice = gameState.choices[choiceIndex];
    
    // Success chance logic:
    // Normal mode: 60% success (0.4 threshold)
    // Observer mode: 75% success (0.25 threshold)
    const baseThreshold = isObserverMode ? 0.25 : 0.4;
    // Pity mechanic: lower stability increases success chance
    const pityBonus = (100 - gameState.stability) / 200; // up to 0.5 bonus
    const finalThreshold = Math.max(0.05, baseThreshold - pityBonus);
    
    const outcomeType = gameState.isBonusActive ? 'positive' : (Math.random() > finalThreshold ? 'positive' : 'negative');
    
    try {
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      
      const prompt = `
        Вы - ИИ "Ткач Судеб" для игры CIIV. 
        Текущее состояние:
        Планета: ${gameState.planet.name} (${gameState.planet.desc})
        Раса: ${gameState.race.name} (${gameState.race.desc})
        Биология расы: ${JSON.stringify((gameState.race as any).reproduction)} | ${JSON.stringify((gameState.race as any).development)}
        Статистика расы: ${JSON.stringify((gameState.race as any).stats)}
        Особенности расы: ${(gameState.race as any).desc}
        Среда обитания расы (диаграмма): ${JSON.stringify(gameState.race.habitat)}
        Среда обитания планеты (диаграмма): ${JSON.stringify(gameState.planet.habitat)}
        Стабильность цивилизации: ${gameState.stability}%
        Совместимость с планетой: ${gameState.compatibility}%
        Текущее население: ${gameState.population}
        Текущий год: ${gameState.year}
        Текущая эпоха: ${gameState.era}
        Ситуация: ${gameState.currentSituation}
        Выбранный путь: ${choice.title} - ${choice.desc}
        Прошло лет: ${yearsToPass}
        
        Навыки ПРОГРЕССА: ${JSON.stringify(gameState.skills.filter(s => s.type === 'progress').map(s => s.name))}
        Навыки РЕГРЕССА: ${JSON.stringify(gameState.skills.filter(s => s.type === 'regress').map(s => s.name))}
        Последние события (5 лет): ${JSON.stringify(gameState.chronicles.slice(-5).map(c => c.event))}

        ПРЕДОПРЕДЕЛЕННЫЙ ИСХОД: ${outcomeType === 'positive' ? 'ПОЛОЖИТЕЛЬНЫЙ (Прогресс)' : 'ОТРИЦАТЕЛЬНЫЙ (Регресс)'}

        ЗАДАЧА:
        1. Напишите краткую летопись (хронику) для КАЖДОГО года из этих ${yearsToPass} лет.
        2. Опишите новую ситуацию, соответствующую исходу (${outcomeType}).
        3. Предложите 3 новых варианта выбора.
        4. Рассчитайте изменение населения в ПРОЦЕНТАХ (populationGrowthPercent) за ВЕСЬ период (${yearsToPass} лет). 
           ВАЖНО: 
           - Если исход ПОЛОЖИТЕЛЬНЫЙ: рост должен быть 1-5% в год.
           - Если исход ОТРИЦАТЕЛЬНЫЙ: рост должен быть отрицательным (убыль) или крайне малым (0-0.5%).
           - Рост должен быть СТРОГО реалистичным. 
           - Если раса мечет икру (нерест), учитывайте, что выживает лишь 0.5-1% потомства. 
           - Учитывайте болезни, хищников и нехватку ресурсов на старте. 
           - Из 144 особей НЕ МОЖЕТ стать миллион за 20 лет. Максимум 200-300 особей при идеальных условиях.
        5. Сгенерируйте 1 новый навык и 1 бонус ускорения. Навык должен быть "успешным" (прогресс) или "неудачным/деградационным" (регресс) в зависимости от исхода.

        ОГРАНИЧЕНИЯ ПО ЭПОХЕ:
        - Если эпоха "${gameState.era}", технологии ДОЛЖНЫ соответствовать этому уровню. 
        - Никаких "газовых коллекторов", "электричества" или "городов", если население меньше 10,000 или год меньше 1000. 
        - На ранних этапах (Первобытность) фокус на выживании, простых орудиях труда, огне, собирательстве, первых верованиях.

        ОТВЕТЬТЕ СТРОГО В ФОРМАТЕ JSON:
        {
          "chronicles": [{"year": number, "event": string}],
          "newSituation": string,
          "newChoices": [{"title": string, "desc": string}],
          "populationGrowthPercent": number,
          "isSuccess": boolean,
          "acquiredSkill": {"name": string, "description": string},
          "accelerationBonus": {"name": string, "description": string, "tapsRequired": number}
        }
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const result = JSON.parse(response.text);
      
      setGameState(prev => ({
        ...prev,
        pendingResult: { 
          ...result, 
          accelerationBonus: isObserverMode ? null : result.accelerationBonus,
          choiceTitle: choice.title, 
          outcomeType 
        }
      }));

      if (!isObserverMode) {
        setShowBonusNotify(true);
      } else {
        // In observer mode, skip bonus notification and show result directly
        setShowResultModal(true);
      }
    } catch (error) {
      console.error("AI Generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const calculateFinalGrowth = (result: any, withBonus: boolean) => {
    const baseGrowthPercent = result.populationGrowthPercent || 0;
    const statFactor = (gameState.compatibility + gameState.stability) / 200; // 0.5 to 1.0
    
    let factor = (baseGrowthPercent / 100) * (0.7 + 0.3 * statFactor);

    if (result.outcomeType === 'positive' && factor < 0) {
      factor = Math.abs(factor) * 0.1;
      if (factor === 0) factor = 0.01;
    }
    
    if (result.outcomeType === 'negative' && factor > 0.02) {
      factor = 0.01;
    }

    if (withBonus) {
      if (factor < 0) factor *= 0.3;
      else factor *= 1.5;
    } else {
      // We don't include the random "unforeseen circumstances" in the UI prediction
      // to keep it clean, but we'll make them much rarer in the actual application.
    }

    if (result.outcomeType === 'positive' && factor < 0) factor = 0;
    
    return factor;
  };

  const applyPendingResult = (withBonus: boolean) => {
    const result = gameState.pendingResult;
    if (!result) return;

    // Use the exact same calculation as shown in the UI
    const finalGrowthFactor = calculateFinalGrowth(result, withBonus);

    const newPopRaw = gameState.population * (1 + finalGrowthFactor);
    const newPop = Math.max(0, Math.floor(newPopRaw));

    setGameState(prev => {
      const newYear = prev.year + selectedYearsToPass + (withBonus ? 5 : 0);
      const newEra = getEra(newYear, newPop);
      
      // Update stability and compatibility based on outcome
      let stabilityChange = result.outcomeType === 'positive' ? 2 : -4;
      let compatibilityChange = result.outcomeType === 'positive' ? 1 : -2;
      
      // Bonus boost
      if (withBonus && result.outcomeType === 'positive') {
        stabilityChange += 3;
        compatibilityChange += 2;
      }

      const newStability = Math.min(100, Math.max(0, prev.stability + stabilityChange));
      const newCompatibility = Math.min(100, Math.max(0, prev.compatibility + compatibilityChange));

      const newSkill: Skill = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: result.acquiredSkill?.name || 'Новый навык',
        desc: result.acquiredSkill?.description || 'Описание навыка',
        year: newYear,
        type: result.outcomeType === 'positive' ? 'progress' : 'regress'
      };

      return {
        ...prev,
        year: newYear,
        population: newPop,
        stability: newStability,
        compatibility: newCompatibility,
        era: newEra,
        availableYears: prev.availableYears - selectedYearsToPass,
        chronicles: [...prev.chronicles, ...(Array.isArray(result.chronicles) ? result.chronicles : [])],
        currentSituation: result.newSituation || prev.currentSituation,
        choices: Array.isArray(result.newChoices) ? result.newChoices : prev.choices,
        history: [...prev.history, `Год ${newYear}: ${result.choiceTitle || 'Выбор сделан'}`],
        skills: [...prev.skills, newSkill],
        accelerationBonus: (result.accelerationBonus && !isObserverMode) ? {
          name: result.accelerationBonus.name,
          desc: result.accelerationBonus.description,
          tapsRequired: result.accelerationBonus.tapsRequired
        } : null,
        bonusTaps: 0,
        isBonusActive: false,
        pendingResult: null
      };
    });

    // Check for Game Over: Population < 50
    if (newPop < 50) {
      setShowGameOver(true);
      setShowResultModal(false);
      setShowChronicleModal(false);
      setIsObserverMode(false);
      return;
    }

    setShowResultModal(false);
    setShowChronicleModal(true);
  };

  const resetGame = () => {
    window.location.reload();
  };

  const accelerateTime = () => {
    setGameState(prev => ({
      ...prev,
      year: prev.year + 10,
      population: prev.population * 1.05,
      history: [...prev.history, `Прошло 10 лет ускоренного развития.`]
    }));
  };

  if (setupPhase !== 'done') {
    return (
      <div className="relative h-screen flex flex-col items-center justify-start px-[3%] py-5 overflow-hidden">
        <SpaceBackground />
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
            key={setupPhase}
            className="grid grid-cols-1 md:grid-cols-2 gap-[2%] flex-1 overflow-y-auto pr-1 custom-scrollbar"
          >
            {setupPhase === 'planet' ? (
              PLANETS.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-col p-3 bg-transparent border border-white/10 rounded-2xl text-left transition-all min-w-0"
                >
                  <div className="mb-2">
                    <PlanetImageFull 
                      planet={p} 
                      className="hover:border-gold/50 transition-all" 
                      onClick={() => setFullscreenImage({ src: p.image, alt: p.name })}
                    />
                  </div>
                  <p className="text-[11px] text-white/50 leading-snug mb-2">{p.desc}</p>
                  
                  <div className="space-y-2">
                    <HabitatChart data={p.habitat} color="#d4af37" onStatClick={handleStatClick} onStatHide={handleStatHide} />
                  </div>

                  <button
                    onClick={() => {
                      setGameState(prev => ({ ...prev, planet: p }));
                      setSetupPhase('race');
                    }}
                    className="mt-3 w-full py-2 bg-transparent border border-gold/50 text-gold rounded-xl transition-all hover:bg-gold/20 font-mono uppercase tracking-widest text-[10px] border-glow-gold glow-gold"
                  >
                    Выбрать этот мир
                  </button>
                </div>
              ))
            ) : (
              RACES.map((r) => (
                <div
                  key={r.id}
                  className="flex flex-col p-3 bg-transparent border border-white/10 rounded-2xl text-left transition-all min-w-0"
                >
                  <div className="mb-2">
                    <RaceImageFull 
                      race={r} 
                      className="hover:border-gold/50 transition-all" 
                      onClick={() => setFullscreenImage({ src: r.image, alt: r.name })}
                    />
                  </div>
                  <div className="text-[9px] font-mono text-white/30 uppercase mb-2">{r.type} | {r.trait}</div>
                  <p className="text-[11px] text-white/50 leading-snug mb-2">{r.desc}</p>
                  
                  <div className="space-y-2">
                    <HabitatChart data={r.habitat} color="#6432c8" onStatClick={handleStatClick} onStatHide={handleStatHide} />
                    <RaceTable race={r} />
                    <PlanetCompatibilityTable race={r} planet={gameState.planet} />
                  </div>

                  <button
                    onClick={() => {
                      setGameState(prev => ({ ...prev, race: r }));
                      setSetupPhase('done');
                    }}
                    className="mt-3 w-full py-2 bg-transparent border border-gold/50 text-gold rounded-xl transition-all hover:bg-gold/20 font-mono uppercase tracking-widest text-[10px] border-glow-gold glow-gold"
                  >
                    Вплести в полотно
                  </button>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Fullscreen Image Viewer */}
        <AnimatePresence>
          {fullscreenImage && (
            <FullscreenImage 
              src={fullscreenImage.src} 
              alt={fullscreenImage.alt} 
              onClose={() => setFullscreenImage(null)} 
            />
          )}
        </AnimatePresence>

        {/* Stat Info Window */}
        <AnimatePresence>
          {statInfoWindow && (
            <StatInfoWindow 
              info={statInfoWindow} 
              onClose={() => setStatInfoWindow(null)} 
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div 
      ref={mainContainerRef}
      className="relative min-h-screen flex flex-col overflow-x-hidden overflow-y-auto selection:bg-gold/30 custom-scrollbar"
    >
      <SpaceBackground />

      {/* Header */}
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
          {(['genesis', 'fate', 'tree'] as Section[]).map((s) => (
            <button
              key={s}
              onClick={() => setActiveSection(s)}
              className={`text-xs font-mono uppercase tracking-widest transition-all hover:text-gold ${
                activeSection === s ? 'text-gold glow-gold' : 'text-white/50'
              }`}
            >
              {s === 'genesis' ? 'Генезис' : s === 'fate' ? 'Ткач Судеб' : 'Дерево жизни'}
            </button>
          ))}
        </div>
        
        {/* Mobile Navigation */}
        <div className="hidden">
          {/* Removed from header on mobile */}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-start p-6 pt-32 pb-40 w-full max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {activeSection === 'genesis' && (
            <motion.div
              key="genesis"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col items-center text-center w-full"
            >
              {/* 1. Large Logo */}
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

              {/* 2. Civilization and World Name */}
              <h1 className="text-4xl md:text-7xl font-light tracking-tighter mb-4 glow-gold">
                Цивилизация {gameState.race.name}
              </h1>
              <p className="text-gold/60 font-mono text-sm tracking-[0.3em] uppercase mb-12">
                Мир: {gameState.planet.name} | Эра: {gameState.era}
              </p>

              {/* 3. World and Race Blocks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mb-16">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  onClick={() => setShowWorldModal(true)}
                  className="bg-transparent border border-white/10 p-8 rounded-3xl text-left hover:border-gold/30 transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-4 mb-4 text-gold">
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-gold/20 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                      <img src={gameState.planet.image} alt={gameState.planet.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <h3 className="text-xl font-light">Мир: {gameState.planet.name}</h3>
                  </div>
                  <p className="text-white/60 text-sm leading-relaxed mb-6">{gameState.planet.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-transparent rounded-full text-[10px] font-mono text-white/40 uppercase border border-white/5">Гравитация: 1.0g</span>
                    <span className="px-3 py-1 bg-transparent rounded-full text-[10px] font-mono text-white/40 uppercase border border-white/5">Атмосфера: O2/N2</span>
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  onClick={() => setShowRaceModal(true)}
                  className="bg-transparent border border-white/10 rounded-3xl text-left hover:border-gold/30 transition-all group cursor-pointer overflow-hidden p-0"
                >
                  <div className="relative aspect-square w-full border-light-animation">
                    <img src={gameState.race.image} alt={gameState.race.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-8 left-8">
                      <h3 className="text-2xl font-light text-gold glow-gold">Раса: {gameState.race.name}</h3>
                      <div className="flex gap-2 mt-2">
                        <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">{gameState.race.type}</span>
                        <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">{gameState.race.trait}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* 4. Reproduction, Development, Habitat (Chart) */}
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
                  <HabitatChart data={gameState.race.habitat as Habitat} color="#d4af37" onStatClick={handleStatClick} onStatHide={handleStatHide} />
                </div>
              </div>

              {/* 5. Statistics Block (2 rows) */}
              <div className="flex flex-col w-full max-w-4xl border-t border-b border-white/10 py-12 mb-16 gap-12">
                {/* Row 1: Year, Years in work */}
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

                {/* Row 2: Stability, Population, Compatibility */}
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

              {/* 6. Navigation Buttons */}
              <div className="flex flex-col md:flex-row items-center gap-6 w-full max-w-4xl mb-12">
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
            </motion.div>
          )}

          {activeSection === 'fate' && (
            <motion.div
              key="fate"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-4xl flex flex-col items-center"
            >
              {/* 1. Logo with radial glow */}
              <div className="relative mb-8 flex flex-col items-center">
                <button
                  onClick={() => setIsObserverMode(!isObserverMode)}
                  className={`mb-6 px-6 py-2 rounded-full border transition-all font-mono text-[10px] tracking-[0.2em] uppercase ${
                    isObserverMode 
                      ? 'bg-gold/20 border-gold text-gold shadow-[0_0_20px_rgba(212,175,55,0.4)]' 
                      : 'bg-transparent border-gold/40 text-gold/60 hover:border-gold hover:text-gold'
                  }`}
                >
                  {isObserverMode ? 'Режим наблюдателя: АКТИВЕН' : 'Включить режим наблюдателя'}
                </button>
                
                <motion.div
                  animate={{ 
                    filter: ["drop-shadow(0 0 20px rgba(212,175,55,0.2))", "drop-shadow(0 0 40px rgba(212,175,55,0.5))", "drop-shadow(0 0 20px rgba(212,175,55,0.2))"] 
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-48 h-48 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform active:scale-95"
                  onClick={() => setIsObserverMode(!isObserverMode)}
                >
                  <img 
                    src="https://i.ibb.co/VW4W5PQs/Ciivbut.png" 
                    alt="Loom of Fate Butterfly" 
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </motion.div>
              </div>

              {/* 2. Motto */}
              <div className="text-center mt-[3px] mb-[3px]">
                <p className="text-gold/80 italic text-[9px] md:text-[10px] leading-tight max-w-2xl mx-auto">
                  <TypewriterText text="Даже взмах крыла бабочки может привести к тайфуну на другом конце света" />
                </p>
              </div>

              {/* 3. Situation Block (Transparent with flame border) */}
      <FlameBorder className={`w-full mb-16 bg-transparent md:p-8 p-[5%]`} style={{ fontSize: '100%' }}>
        <div className="text-center">
          <h3 className="text-xs font-mono text-gold/40 uppercase tracking-[0.3em] mb-4">Текущая ситуация</h3>
          <p className="text-white/90 text-lg md:text-xl leading-snug md:leading-relaxed md:text-[100%] text-[70%]">
            {gameState.currentSituation}
          </p>
        </div>
      </FlameBorder>

              {/* 4. Choices with branches */}
              <div className="relative w-full mb-16">
                {/* SVG Branches with animated orbs - Positioned between situation and choices */}
                <div className="absolute -top-16 left-0 w-full h-16 pointer-events-none -z-10">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 1000 100" preserveAspectRatio="none">
                    {gameState.choices.map((_, i) => {
                      const x2 = i === 0 ? 150 : i === 1 ? 500 : 850;
                      const pathD = `M 500 0 C 500 50, ${x2} 50, ${x2} 100`;
                      return (
                        <React.Fragment key={`branch-${i}`}>
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

                {/* Mobile Version: Separate Titles and Descriptions */}
                <div className="md:hidden space-y-6">
                  {/* 3 Buttons in 1 row (Titles) */}
                  <div className="grid grid-cols-3 gap-2 mb-6">
                    {gameState.choices.map((choice, i) => (
                      <button
                        key={`choice-btn-mobile-${i}`}
                        onMouseEnter={() => setHoveredChoice(i)}
                        onMouseLeave={() => setHoveredChoice(null)}
                        onClick={() => {
                          setSelectedChoiceIndex(i);
                          setShowYearSelectionModal(true);
                          if (selectedYearsToPass === 0) setSelectedYearsToPass(1);
                        }}
                        disabled={isGenerating || gameState.availableYears < 1}
                        className={`group relative p-3 bg-transparent border border-white/10 rounded-xl transition-all hover:bg-gold/10 hover:border-gold/50 text-center flex flex-col items-center justify-center min-h-[60px] ${
                          isGenerating || gameState.availableYears < 1 ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <div className="text-[8px] font-mono text-gold uppercase tracking-widest leading-tight">
                          <span className="mr-1">{i + 1}.</span>
                          {choice.title}
                        </div>
                        {hoveredChoice === i && (
                          <motion.div layoutId="choice-glow-mobile" className="absolute inset-0 bg-gold/5 rounded-xl blur-xl" />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* 3 Text blocks for paths (Descriptions) */}
                  <div className="grid grid-cols-1 gap-4">
                    {gameState.choices.map((choice, i) => (
                      <div 
                        key={`choice-desc-mobile-${i}`}
                        onMouseEnter={() => setHoveredChoice(i)}
                        onMouseLeave={() => setHoveredChoice(null)}
                        onClick={() => {
                          if (isGenerating || gameState.availableYears < 1) return;
                          setSelectedChoiceIndex(i);
                          setShowYearSelectionModal(true);
                          if (selectedYearsToPass === 0) setSelectedYearsToPass(1);
                        }}
                        className={`p-4 rounded-xl border border-white/5 bg-white/5 transition-all cursor-pointer hover:bg-gold/10 hover:border-gold/30 ${
                          hoveredChoice === i ? 'border-gold/30 bg-gold/5' : ''
                        } ${isGenerating || gameState.availableYears < 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="text-[70%] text-white/60 leading-tight flex gap-3">
                          <span className="text-gold font-mono flex-shrink-0">{i + 1}.</span>
                          <span>{choice.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* PC Version: Combined Buttons */}
                <div className="hidden md:grid md:grid-cols-3 gap-6 mb-6">
                  {gameState.choices.map((choice, i) => (
                    <button
                      key={`choice-combined-pc-${i}`}
                      onMouseEnter={() => setHoveredChoice(i)}
                      onMouseLeave={() => setHoveredChoice(null)}
                      onClick={() => {
                        setSelectedChoiceIndex(i);
                        setShowYearSelectionModal(true);
                        if (selectedYearsToPass === 0) setSelectedYearsToPass(1);
                      }}
                      disabled={isGenerating || gameState.availableYears < 1}
                      className={`group relative p-8 bg-transparent border border-white/10 rounded-3xl transition-all hover:bg-gold/10 hover:border-gold/50 text-left flex flex-col gap-4 min-h-[180px] ${
                        isGenerating || gameState.availableYears < 1 ? 'opacity-50 cursor-not-allowed' : ''
                      } ${hoveredChoice === i ? 'border-gold/50 bg-gold/5' : ''}`}
                    >
                      <div className="text-[10px] font-mono text-gold uppercase tracking-widest leading-tight">
                        <span className="mr-1">{i + 1}.</span>
                        {choice.title}
                      </div>
                      <div className="text-sm text-white/60 leading-relaxed">
                        {choice.desc}
                      </div>
                      {hoveredChoice === i && (
                        <motion.div layoutId="choice-glow-pc" className="absolute inset-0 bg-gold/5 rounded-3xl blur-2xl" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Removed Time Selection from main view - now in modal */}

              {/* 6. Chronicles (Chronicle Tree) */}
              <div className="w-full border-t border-white/10 pt-16">
                <div className="flex items-center gap-2 mb-8 text-white/30 font-mono text-[10px] uppercase tracking-widest">
                  <HistoryIcon size={12} /> Летопись времен
                </div>
                <div className="space-y-8 relative">
                  {/* Vertical line for chronicle tree */}
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-gold/30 via-gold/10 to-transparent" />
                  
                  {gameState.chronicles.slice().reverse().map((c, i) => (
                    <motion.div 
                      key={`chronicle-main-${c.year}-${i}`}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      className="relative pl-12"
                    >
                      <div className="absolute left-3 top-2 w-2 h-2 rounded-full bg-gold shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
                      <div className="text-[10px] font-mono text-gold/40 mb-1">ГОД {c.year}</div>
                      <p className="md:text-sm text-[70%] text-white/70 leading-tight md:leading-relaxed">{c.event}</p>
                    </motion.div>
                  ))}
                  
                  {gameState.chronicles.length === 0 && (
                    <p className="text-center text-white/20 font-mono text-xs italic py-12">История еще не написана...</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === 'tree' && (
            <motion.div 
              key="tree"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col items-center w-full"
            >
              <div className="text-center mb-16 w-full">
                <h2 className="text-4xl md:text-6xl font-light glow-gold mb-8">Дерево жизни</h2>
                <div className="w-full max-w-2xl mx-auto mb-8">
                  <RaceImageFull 
                    race={gameState.race} 
                    opacity={0.7} 
                    onClick={() => setFullscreenImage({ src: gameState.race.image, alt: gameState.race.name })}
                  />
                </div>
                <p className="text-white/40 font-mono text-xs uppercase tracking-[0.4em]">Путь эволюции и деградации</p>
              </div>

              {/* Acceleration Bonus Card */}
              <div className="w-full max-w-md mb-16">
                {(gameState.accelerationBonus || gameState.pendingResult?.accelerationBonus) ? (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative p-8 rounded-3xl border border-white/20 bg-transparent backdrop-blur-[10px] overflow-hidden group shadow-2xl"
                  >
                    <div className="absolute top-0 right-0 p-4">
                      <Zap className="text-gold animate-pulse" size={24} />
                    </div>
                    <h3 className="text-2xl font-light text-gold mb-2">
                      {gameState.accelerationBonus?.name || gameState.pendingResult?.accelerationBonus?.name || 'Бонус'}
                    </h3>
                    <p className="text-white/80 text-sm mb-8">
                      {gameState.accelerationBonus?.desc || gameState.pendingResult?.accelerationBonus?.description || 'Активируйте бонус для ускорения развития.'}
                    </p>
                    
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-gold shadow-[0_0_10px_#D4AF37]"
                          animate={{ 
                            width: `${(gameState.bonusTaps / (gameState.accelerationBonus?.tapsRequired || gameState.pendingResult?.accelerationBonus?.tapsRequired || 10)) * 100}%` 
                          }}
                        />
                      </div>
                      <p className="text-[10px] font-mono text-white/40 uppercase">
                        Нажмите {(gameState.accelerationBonus?.tapsRequired || gameState.pendingResult?.accelerationBonus?.tapsRequired || 10) - gameState.bonusTaps} раз для активации
                      </p>
                      
                      <button 
                        onClick={() => {
                          const required = gameState.accelerationBonus?.tapsRequired || gameState.pendingResult?.accelerationBonus?.tapsRequired || 10;
                          if (gameState.bonusTaps + 1 >= required) {
                            setGameState(prev => ({
                              ...prev,
                              bonusTaps: 0,
                              accelerationBonus: null,
                              isBonusActive: true
                            }));
                            // If we came from a pending result, we might want to go back or show the result
                            if (gameState.pendingResult) {
                              setActiveSection('fate');
                              setShowResultModal(true);
                            }
                          } else {
                            setGameState(prev => ({ ...prev, bonusTaps: prev.bonusTaps + 1 }));
                          }
                        }}
                        className="w-full py-4 bg-transparent border border-gold text-gold font-bold rounded-xl hover:bg-gold/10 transition-all shadow-[0_0_15px_rgba(212,175,55,0.5)] active:scale-95"
                      >
                        АКТИВИРОВАТЬ БОНУС
                      </button>
                    </div>
                  </motion.div>
                ) : gameState.isBonusActive ? (
                  <div className="p-8 rounded-3xl border border-emerald-500/20 bg-white/5 text-center backdrop-blur-[10px] shadow-xl">
                    <Sparkles className="text-emerald-400 mx-auto mb-4" size={32} />
                    <h3 className="text-xl font-light text-emerald-400 mb-2">Бонус Активен</h3>
                    <p className="text-white/60 text-xs">Следующий шаг будет безопасным и даст +5 лет развития</p>
                    {gameState.pendingResult && (
                      <button 
                        onClick={() => setActiveSection('fate')}
                        className="mt-6 px-6 py-2 border border-emerald-500/30 rounded-lg text-[10px] font-mono text-emerald-400 hover:bg-emerald-500/10 transition-all"
                      >
                        ВЕРНУТЬСЯ К ВЫБОРУ
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="p-8 rounded-3xl border border-white/10 bg-white/5 text-center backdrop-blur-[10px]">
                    <ZapOff className="text-white/20 mx-auto mb-4" size={32} />
                    <h3 className="text-xl font-light text-white/20 mb-2">Нет активных бонусов</h3>
                    <p className="text-white/40 text-xs">Сделайте выбор в Ткаче Судеб, чтобы получить бонус</p>
                  </div>
                )}
              </div>

              {/* Tree Branches */}
              <div className="w-full max-w-6xl px-4">
                {/* Mobile Toggle */}
                <div className="md:hidden flex justify-center mb-12">
                  <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 backdrop-blur-xl">
                    <button 
                      onClick={() => setMobileTreeBranch('progress')}
                      className={`px-8 py-3 rounded-xl text-[10px] font-mono uppercase tracking-widest transition-all ${mobileTreeBranch === 'progress' ? 'bg-gold text-black shadow-[0_0_15px_rgba(212,175,55,0.3)]' : 'text-white/40'}`}
                    >
                      Прогресс
                    </button>
                    <button 
                      onClick={() => setMobileTreeBranch('regress')}
                      className={`px-8 py-3 rounded-xl text-[10px] font-mono uppercase tracking-widest transition-all ${mobileTreeBranch === 'regress' ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'text-white/40'}`}
                    >
                      Регресс
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 relative">
                  {/* Vertical Divider for Desktop */}
                  <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
                  <div className={`${mobileTreeBranch === 'progress' ? 'flex' : 'hidden md:flex'} flex-col items-center`}>
                    <h3 className="text-xs font-mono text-gold uppercase tracking-[0.4em] mb-12 flex items-center gap-3 bg-gold/5 px-6 py-2 rounded-full border border-gold/20">
                      <TrendingUp size={16} /> Прогресс
                    </h3>
                    <div className="flex flex-col items-center gap-8 w-full">
                      {gameState.skills.filter(s => s.type === 'progress').length > 0 ? (
                        gameState.skills.filter(s => s.type === 'progress').map((skill, index) => (
                          <div key={skill.id} className="w-full flex justify-center">
                            <SkillCard skill={skill} index={index} color="gold" />
                          </div>
                        ))
                      ) : (
                        <div className="text-white/20 font-mono text-xs italic py-12">Ветка прогресса пока пуста...</div>
                      )}
                    </div>
                  </div>

                  {/* Regress Branch */}
                  <div className={`${mobileTreeBranch === 'regress' ? 'flex' : 'hidden md:flex'} flex-col items-center`}>
                    <h3 className="text-xs font-mono text-red-500 uppercase tracking-[0.4em] mb-12 flex items-center gap-3 bg-red-500/5 px-6 py-2 rounded-full border border-red-500/20">
                      <TrendingDown size={16} /> Регресс
                    </h3>
                    <div className="flex flex-col items-center gap-8 w-full">
                      {gameState.skills.filter(s => s.type === 'regress').length > 0 ? (
                        gameState.skills.filter(s => s.type === 'regress').map((skill, index) => (
                          <div key={skill.id} className="w-full flex justify-center">
                            <SkillCard skill={skill} index={index} color="red" />
                          </div>
                        ))
                      ) : (
                        <div className="text-white/20 font-mono text-xs italic py-12">Ветка регресса пока пуста...</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>


      {/* Modals for Choice Flow */}
      <AnimatePresence>
        {showYearSelectionModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-md w-full bg-transparent backdrop-blur-[10px] p-8 rounded-[32px] border border-white/10 shadow-2xl text-center"
            >
              <h3 className="text-xl font-light text-gold mb-6 uppercase tracking-widest">Сколько лет пройдет?</h3>
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono text-white/40 uppercase tracking-widest">Период развития</span>
                  <span className="text-gold font-mono">{selectedYearsToPass} л.</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max={gameState.availableYears} 
                  value={selectedYearsToPass}
                  onChange={(e) => setSelectedYearsToPass(parseInt(e.target.value))}
                  className="w-full accent-gold bg-white/10 h-1 rounded-full appearance-none cursor-pointer"
                />
                <div className="flex justify-between mt-2 text-[10px] font-mono text-white/20">
                  <span>1 год</span>
                  <span>{gameState.availableYears} лет</span>
                </div>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowYearSelectionModal(false)}
                  className="flex-1 py-3 bg-white/5 text-white/60 rounded-xl hover:bg-white/10 transition-all"
                >
                  ОТМЕНА
                </button>
                <button 
                  onClick={() => {
                    if (selectedChoiceIndex !== null) {
                      handleFateChoice(selectedChoiceIndex, selectedYearsToPass);
                      setShowYearSelectionModal(false);
                    }
                  }}
                  className="flex-1 py-3 bg-gold text-black font-bold rounded-xl hover:bg-white transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                >
                  ПОДТВЕРДИТЬ
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Game Over Modal */}
        {showGameOver && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[300] flex items-center justify-center bg-black p-6 overflow-y-auto"
          >
            <div className="max-w-2xl w-full text-center space-y-8 py-12">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1 }}
              >
                <h2 className="text-5xl md:text-7xl font-display text-red-600 uppercase tracking-widest mb-4">
                  Цивилизация погибла
                </h2>
                <div className="h-px w-full bg-gradient-to-r from-transparent via-red-600 to-transparent mb-8" />
              </motion.div>

              <div className="space-y-6 text-white/70 font-serif italic text-lg leading-relaxed">
                <p>
                  Нити судьбы оборвались. Популяция вашей расы сократилась до критического минимума, 
                  недостаточного для поддержания генетического разнообразия и социальной структуры.
                </p>
                <p>
                  История {gameState.race.name} на планете {gameState.planet.name} подошла к концу в {gameState.year} году. 
                  Ваши достижения и ошибки станут лишь пылью в бесконечном космосе.
                </p>
              </div>

              <div className="pt-12 space-y-4">
                <p className="text-gold/40 font-mono text-xs uppercase tracking-[0.3em] mb-8">
                  Титры: Ткач Судеб CIIV
                </p>
                <button
                  onClick={resetGame}
                  className="px-12 py-4 bg-white text-black font-bold uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all rounded-full"
                >
                  Начать новый цикл
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {(isGenerating || generationError) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-6"
          >
            <div className="max-w-md w-full text-center bg-transparent backdrop-blur-[10px] p-12 rounded-[40px] border border-white/10 shadow-2xl relative overflow-hidden">
              {/* Radial Pulse Background */}
              <motion.div 
                animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.3, 0.1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute inset-0 bg-gold/20 rounded-full blur-[100px] pointer-events-none"
              />

              {isGenerating ? (
                <>
                  <div className="relative w-32 h-32 mx-auto mb-8">
                    {/* Rotating Progress Border */}
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="60"
                        stroke="rgba(212, 175, 55, 0.1)"
                        strokeWidth="4"
                        fill="transparent"
                      />
                      <motion.circle
                        cx="64"
                        cy="64"
                        r="60"
                        stroke="#D4AF37"
                        strokeWidth="4"
                        fill="transparent"
                        strokeDasharray="377"
                        initial={{ strokeDashoffset: 377 }}
                        animate={{ strokeDashoffset: 377 - (377 * (generationTimer / 60)) }}
                        transition={{ duration: 1, ease: "linear" }}
                      />
                    </svg>
                    
                    {/* Logo */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        animate={{ 
                          scale: [1, 1.1, 1],
                          filter: ["drop-shadow(0 0 5px rgba(212,175,55,0.3))", "drop-shadow(0 0 20px rgba(212,175,55,0.7))", "drop-shadow(0 0 5px rgba(212,175,55,0.3))"]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="relative"
                      >
                        <motion.img 
                          src="https://i.ibb.co/VW4W5PQs/Ciivbut.png" 
                          alt="Butterfly Logo" 
                          className="w-20 h-20 object-contain"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        />
                      </motion.div>
                    </div>
                  </div>

                  <h3 className="text-2xl font-light text-gold mb-4 uppercase tracking-widest relative z-10">Ткач судеб работает...</h3>
                  <p className="text-white/60 mb-8 relative z-10">Нити времени переплетаются, создавая ваше будущее.</p>
                  
                  <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest relative z-10">Ожидание: {generationTimer}с / 60с</p>
                </>
              ) : (
                <div className="bg-white/5 border border-white/10 p-8 rounded-3xl">
                  <ZapOff size={48} className="text-red-400 mx-auto mb-6" />
                  <h3 className="text-xl font-light text-white mb-4 uppercase tracking-widest">Ткач немного устал</h3>
                  <p className="text-white/60 text-sm mb-8 leading-relaxed">{generationError}</p>
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={() => {
                        setGenerationError(null);
                      }}
                      className="w-full py-4 bg-gold text-black font-bold rounded-xl hover:bg-white transition-all"
                    >
                      ПОПРОБОВАТЬ СНОВА
                    </button>
                    <button 
                      onClick={() => {
                        setGenerationError(null);
                        setIsGenerating(false);
                      }}
                      className="w-full py-4 bg-white/5 border border-white/10 text-white/60 rounded-xl hover:bg-white/10 transition-colors"
                    >
                      ВЕРНУТЬСЯ
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {showBonusNotify && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-md w-full bg-transparent backdrop-blur-[10px] border border-white/20 p-8 rounded-3xl text-center shadow-2xl"
            >
              <Rocket className="text-gold mx-auto mb-6" size={48} />
              <h3 className="text-2xl font-light text-gold mb-4 uppercase tracking-tight">Доступно Древо Жизни!</h3>
              <p className="text-white/80 text-sm leading-relaxed mb-8">
                Для этого пути доступен бонус: <span className="text-gold font-bold">{gameState.pendingResult?.accelerationBonus?.name || 'Особый бонус'}</span>. 
                Перейдите на страницу <span className="text-gold">Дерево жизни</span>, чтобы активировать его. 
                Без бонуса шанс негативных последствий составляет 50%.
              </p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => {
                    setShowBonusNotify(false);
                    setActiveSection('tree');
                  }}
                  className="w-full py-4 bg-gold text-black font-bold rounded-xl hover:bg-white transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                >
                  ПЕРЕЙТИ К ДЕРЕВУ ЖИЗНИ
                </button>
                <button 
                  onClick={() => {
                    setShowBonusNotify(false);
                    setGameState(prev => ({ ...prev, pendingResult: { ...prev.pendingResult, accelerationBonus: null }, accelerationBonus: null }));
                    setShowResultModal(true);
                  }}
                  className="w-full py-4 bg-white/5 border border-white/10 text-white/60 rounded-xl hover:bg-white/10 transition-colors"
                >
                  ПРОДОЛЖИТЬ БЕЗ БОНУСА
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showResultModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-md w-full bg-transparent backdrop-blur-[10px] border border-white/20 p-8 rounded-3xl text-center shadow-2xl"
            >
              {gameState.pendingResult?.populationGrowthPercent >= 0 ? (
                <Sparkles className="text-emerald-400 mx-auto mb-6" size={48} />
              ) : (
                <ZapOff className="text-red-400 mx-auto mb-6" size={48} />
              )}
              <h3 className="text-2xl font-light text-gold mb-4 uppercase tracking-tight">Последствия выбора</h3>
              
              {gameState.isBonusActive && (
                <div className="mb-6 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                  <p className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest flex items-center justify-center gap-2">
                    <Sparkles size={12} /> 
                    {gameState.pendingResult?.populationGrowthPercent < 0 
                      ? 'Штрафы аннулированы на 50%' 
                      : 'Бонусы удвоены'}
                  </p>
                </div>
              )}

              <div className="space-y-6 mb-8">
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-[10px] font-mono text-white/40 uppercase mb-1">Изменение населения</p>
                  <p className={`text-2xl font-mono ${calculateFinalGrowth(gameState.pendingResult, gameState.isBonusActive) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {calculateFinalGrowth(gameState.pendingResult, gameState.isBonusActive) > 0 ? '+' : ''}
                    {(calculateFinalGrowth(gameState.pendingResult, gameState.isBonusActive) * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-[10px] font-mono text-white/40 uppercase mb-1">Освоен навык</p>
                  <p className="text-lg text-gold">{gameState.pendingResult?.acquiredSkill?.name || 'Новый навык'}</p>
                </div>
              </div>
              <button 
                onClick={() => applyPendingResult(gameState.isBonusActive)}
                className="w-full py-4 bg-gold text-black font-bold rounded-xl hover:bg-white transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)]"
              >
                ПРОДОЛЖИТЬ
              </button>
            </motion.div>
          </motion.div>
        )}

        {showChronicleModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-2xl w-full max-h-[80vh] overflow-y-auto custom-scrollbar bg-transparent backdrop-blur-[10px] border border-white/20 p-8 md:p-12 rounded-3xl shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-8 text-gold">
                <HistoryIcon size={24} />
                <h3 className="text-2xl font-light uppercase tracking-tighter">Летопись Времен</h3>
              </div>
              <div className="space-y-6 mb-12">
                {gameState.chronicles.slice(-Math.max(1, selectedYearsToPass)).map((c, i) => (
                  <motion.div 
                    key={`chronicle-modal-${c.year}-${i}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex flex-col gap-1 border-l border-gold/20 pl-6 py-2"
                  >
                    <span className="text-gold font-mono text-sm">ГОД {c.year}</span>
                    <p className="text-white/80 text-[80%] leading-relaxed">{c.event}</p>
                  </motion.div>
                ))}
              </div>
              <button 
                onClick={() => {
                  setShowChronicleModal(false);
                  setSelectedYearsToPass(0);
                }}
                className="w-full py-4 bg-gold text-black font-bold rounded-xl hover:bg-white transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] sticky bottom-0"
              >
                ЗАВЕРШИТЬ ГЛАВУ
              </button>
            </motion.div>
          </motion.div>
        )}

        {showWorldModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center bg-transparent backdrop-blur-sm p-4 md:p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-4xl w-full bg-transparent backdrop-blur-[30px] border border-white/20 rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar relative"
            >
              <button 
                onClick={() => setShowWorldModal(false)} 
                className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors z-[160] bg-black/40 p-2 rounded-full backdrop-blur-sm"
              >
                <ZapOff size={24} />
              </button>

              <div className="w-full aspect-video border-b border-white/10 overflow-hidden border-light-animation">
                <img 
                  src={gameState.planet.image} 
                  alt={gameState.planet.name} 
                  className="w-full h-full object-cover opacity-80"
                  referrerPolicy="no-referrer"
                />
              </div>
              
              <div className="p-8 md:p-12">
                <div className="flex items-center gap-6 text-gold mb-8">
                  <h3 className="text-3xl font-light uppercase tracking-widest glow-gold">{gameState.planet.name}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                    <h4 className="text-xs font-mono text-gold uppercase mb-4 tracking-widest">Описание мира</h4>
                    <p className="text-white/80 leading-relaxed text-sm">{gameState.planet.desc}</p>
                  </div>
                  <div className="p-6 bg-white/5 rounded-2xl border border-white/10 flex flex-col justify-center gap-4">
                    <div className="flex justify-between items-center">
                      <span className="text-white/40 text-xs font-mono uppercase">Гравитация</span>
                      <span className="text-gold font-mono">1.0g</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/40 text-xs font-mono uppercase">Атмосфера</span>
                      <span className="text-gold font-mono">O2/N2</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/40 text-xs font-mono uppercase">Тип ядра</span>
                      <span className="text-gold font-mono">Железо-никель</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="p-6 bg-white/5 rounded-2xl border border-white/10 min-w-0">
                    <h4 className="text-xs font-mono text-gold uppercase mb-4 tracking-widest">Характеристики среды</h4>
                    <HabitatChart data={gameState.planet.habitat} color="#d4af37" onStatClick={handleStatClick} onStatHide={handleStatHide} />
                  </div>

                  <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                    <h4 className="text-xs font-mono text-gold uppercase mb-4 tracking-widest">История мира</h4>
                    <div className="text-white/70 leading-relaxed text-xs max-h-96 overflow-y-auto pr-4 custom-scrollbar whitespace-pre-line">
                      {gameState.planet.history}
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => setShowWorldModal(false)}
                  className="w-full mt-8 py-4 bg-transparent border border-gold/30 text-gold hover:bg-gold/10 rounded-xl transition-all font-mono uppercase tracking-widest border-glow-gold glow-gold"
                >
                  ЗАКРЫТЬ
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showRaceModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center bg-transparent backdrop-blur-sm p-4 md:p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-4xl w-full bg-transparent backdrop-blur-[30px] border border-white/0 md:border-white/20 border-y-0 md:border-y rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar relative"
            >
              <button 
                onClick={() => setShowRaceModal(false)} 
                className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors z-[160] bg-black/40 p-2 rounded-full backdrop-blur-sm"
              >
                <ZapOff size={24} />
              </button>

              <div 
                className="w-full aspect-[1280/714] overflow-hidden border-b border-white/10 cursor-pointer border-light-animation rounded-b-2xl mb-0"
                onClick={() => setFullscreenImage({ src: gameState.race.image, alt: gameState.race.name })}
              >
                <img 
                  src={gameState.race.image} 
                  alt={gameState.race.name} 
                  className="w-full h-full object-cover opacity-80"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="px-[4%] md:px-12 py-8 md:py-12">
                <div className="flex justify-between items-start mt-[10px] mb-[10px]">
                  <div className="w-full text-center">
                    <h3 className="text-3xl font-light uppercase tracking-widest text-gold glow-gold">{gameState.race.name}</h3>
                    <div className="text-[10px] font-mono text-white/30 uppercase mt-2 tracking-[0.3em]">{gameState.race.type} | {gameState.race.trait}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                    <h4 className="text-[10px] font-mono text-gold uppercase mb-4 tracking-widest">Биологический профиль</h4>
                    <p className="text-white/80 leading-relaxed text-sm mb-6">{gameState.race.desc}</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-mono text-gold/60 uppercase border border-gold/10">{gameState.race.type}</span>
                      <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-mono text-gold/60 uppercase border border-gold/10">{gameState.race.trait}</span>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center">
                    <PlanetCompatibilityTable race={gameState.race} planet={gameState.planet} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="p-6 bg-white/5 rounded-2xl border border-white/10 min-w-0">
                    <h4 className="text-[10px] font-mono text-gold uppercase mb-4 tracking-widest">Среда обитания</h4>
                    <HabitatChart data={gameState.race.habitat as Habitat} color="#d4af37" onStatClick={handleStatClick} onStatHide={handleStatHide} />
                  </div>
                  <div className="flex flex-col justify-center">
                    <RaceTable race={gameState.race} />
                  </div>
                </div>

                <div className="w-full mb-8">
                  <div className="p-6 bg-white/5 rounded-2xl border border-white/10 min-h-[320px]">
                    <h4 className="text-[10px] font-mono text-gold uppercase mb-4 tracking-widest">Биология и особенности</h4>
                    <div className="text-white/70 leading-relaxed text-xs pr-4 custom-scrollbar whitespace-pre-line">
                      {gameState.race.history || (gameState.race as any).biology}
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => setShowRaceModal(false)}
                  className="w-full mt-8 py-4 bg-transparent border border-gold/30 text-gold hover:bg-gold/10 rounded-xl transition-all font-mono uppercase tracking-widest border-glow-gold glow-gold"
                >
                  ЗАКРЫТЬ
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Motto */}
      <footer className="fixed bottom-0 left-0 right-0 z-[70] flex items-end justify-center pointer-events-none">
        <div className="bg-transparent px-8 py-2 rounded-t-2xl pointer-events-auto">
          <p className="text-[10px] md:text-xs font-mono text-gold/60 tracking-[0.4em] uppercase">
            Ты не Бог, Ты — Наблюдатель
          </p>
        </div>
      </footer>

      {/* Fullscreen Image Viewer */}
      <AnimatePresence>
        {fullscreenImage && (
          <FullscreenImage 
            src={fullscreenImage.src} 
            alt={fullscreenImage.alt} 
            onClose={() => setFullscreenImage(null)} 
          />
        )}
      </AnimatePresence>

      {/* Stat Info Window */}
      <AnimatePresence>
        {statInfoWindow && (
          <StatInfoWindow 
            info={statInfoWindow} 
            onClose={() => setStatInfoWindow(null)} 
          />
        )}
      </AnimatePresence>

      {/* Mobile Navigation (Tab Bar) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[60] h-16 bg-black/40 backdrop-blur-[10px] border-t border-x border-white/10 flex items-start justify-around px-4 pt-[2px] rounded-t-2xl">
        <button 
          onClick={() => setActiveSection('genesis')}
          className={`flex flex-col items-center gap-1 ${activeSection === 'genesis' ? 'text-gold' : 'text-white/40'}`}
        >
          <Globe size={18} />
          <span className="text-[7px] font-mono uppercase">Генезис</span>
        </button>
        <button 
          onClick={() => setActiveSection('fate')}
          className={`flex flex-col items-center gap-1 ${activeSection === 'fate' ? 'text-gold' : 'text-white/40'}`}
        >
          <Sparkles size={18} />
          <span className="text-[7px] font-mono uppercase">Ткач Судеб</span>
        </button>
        <button 
          onClick={() => setActiveSection('tree')}
          className={`flex flex-col items-center gap-1 ${activeSection === 'tree' ? 'text-gold' : 'text-white/40'}`}
        >
          <HistoryIcon size={18} />
          <span className="text-[7px] font-mono uppercase">Дерево жизни</span>
        </button>
      </div>
    </div>
  );
}
