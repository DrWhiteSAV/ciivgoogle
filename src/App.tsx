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
  MapPin
} from 'lucide-react';
import { PLANETS, RACES } from './constants';

// --- Types ---

type Section = 'genesis' | 'fate' | 'progress';

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

const FlameBorder: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => {
  return (
    <div className={`relative p-8 rounded-2xl ${className}`}>
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

      // Draw nebula-like glow
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width / 1.2
      );
      gradient.addColorStop(0, 'rgba(212, 175, 55, 0.08)');
      gradient.addColorStop(0.3, 'rgba(100, 50, 200, 0.03)');
      gradient.addColorStop(0.6, 'rgba(50, 150, 255, 0.02)');
      gradient.addColorStop(1, 'rgba(5, 5, 5, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

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
    pendingResult: null
  });

  const [activeSection, setActiveSection] = useState<Section>('genesis');
  const [hoveredChoice, setHoveredChoice] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedYearsToPass, setSelectedYearsToPass] = useState(0);
  const [showBonusNotify, setShowBonusNotify] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showChronicleModal, setShowChronicleModal] = useState(false);
  const [secondsToNextYear, setSecondsToNextYear] = useState(60);
  const [generationTimer, setGenerationTimer] = useState(0);
  const [generationError, setGenerationError] = useState<string | null>(null);
  
  // Timer for available years and countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsToNextYear(prev => {
        if (prev <= 1) {
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

  const handleFateChoice = async (choiceIndex: number) => {
    if (selectedYearsToPass < 0 || gameState.availableYears < selectedYearsToPass) return;
    
    setIsGenerating(true);
    setGenerationError(null);
    const choice = gameState.choices[choiceIndex];
    
    try {
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      
      const prompt = `
        Вы - ИИ "Ткач Судеб" для игры CIIV. 
        Текущее состояние:
        Планета: ${gameState.planet.name} (${gameState.planet.desc})
        Раса: ${gameState.race.name} (${gameState.race.desc})
        Биология расы: ${JSON.stringify((gameState.race as any).bio)}
        Текущее население: ${gameState.population}
        Текущий год: ${gameState.year}
        Текущая эпоха: ${gameState.era}
        Ситуация: ${gameState.currentSituation}
        Выбранный путь: ${choice.title} - ${choice.desc}
        Прошло лет: ${selectedYearsToPass}

        ЗАДАЧА:
        1. Напишите краткую летопись (хронику) для КАЖДОГО года из этих ${selectedYearsToPass} лет.
        2. Опишите новую ситуацию.
        3. Предложите 3 новых варианта выбора.
        4. Рассчитайте изменение населения в ПРОЦЕНТАХ (populationGrowthPercent) за ВЕСЬ период (${selectedYearsToPass} лет). 
           ВАЖНО: 
           - Рост должен быть СТРОГО реалистичным. 
           - Если раса мечет икру (нерест), учитывайте, что выживает лишь 0.5-1% потомства. 
           - Учитывайте болезни, хищников и нехватку ресурсов на старте. 
           - Средний здоровый прирост для примитивной цивилизации: 1-3% в ГОД. 
           - В случае катастроф прирост может быть отрицательным (например, -10%).
           - Из 144 особей НЕ МОЖЕТ стать миллион за 20 лет. Максимум 200-300 особей при идеальных условиях.
        5. Сгенерируйте 1 новый навык и 1 бонус ускорения.

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
        pendingResult: { ...result, choiceTitle: choice.title }
      }));

      setShowBonusNotify(true);
    } catch (error) {
      console.error("AI Generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const applyPendingResult = (withBonus: boolean) => {
    const result = gameState.pendingResult;
    if (!result) return;

    // Calculate population growth based on percentage from AI
    const growthPercent = result.populationGrowthPercent || 0;
    let finalGrowthFactor = growthPercent / 100;

    // Bonus influence: 
    // If bonus active, we mitigate losses or boost growth slightly
    if (withBonus) {
      if (finalGrowthFactor < 0) finalGrowthFactor *= 0.5; // Mitigate 50% of loss
      else finalGrowthFactor *= 1.2; // Boost growth by 20%
    } else {
      // 50% chance of "unforeseen circumstances" if no bonus was used
      if (Math.random() > 0.5) {
        finalGrowthFactor -= 0.05; // Extra 5% loss due to lack of preparation
      }
    }

    const populationChange = Math.floor(gameState.population * finalGrowthFactor);

    setGameState(prev => {
      const newYear = prev.year + selectedYearsToPass + (withBonus ? 5 : 0);
      const newPop = Math.max(1, Math.floor(prev.population + populationChange));
      const newEra = getEra(newYear, newPop);

      const newSkill: Skill = {
        id: Math.random().toString(36).substr(2, 9),
        name: result.acquiredSkill.name,
        desc: result.acquiredSkill.description,
        year: newYear
      };

      return {
        ...prev,
        year: newYear,
        population: newPop,
        era: newEra,
        availableYears: prev.availableYears - selectedYearsToPass,
        chronicles: [...prev.chronicles, ...result.chronicles],
        currentSituation: result.newSituation,
        choices: result.newChoices,
        history: [...prev.history, `Год ${newYear}: ${result.choiceTitle}`],
        skills: [...prev.skills, newSkill],
        accelerationBonus: withBonus ? prev.accelerationBonus : result.accelerationBonus,
        bonusTaps: 0,
        isBonusActive: false,
        pendingResult: null
      };
    });

    setShowResultModal(false);
    setShowChronicleModal(true);
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
      <div className="relative min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden">
        <SpaceBackground />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-4xl bg-transparent border border-white/10 p-8 md:p-12 rounded-3xl shadow-[0_0_50px_rgba(212,175,55,0.05)]"
        >
          <div className="text-center mb-12">
            <img src="https://i.ibb.co/D0mRFhJ/civilogo.png" alt="Logo" className="h-16 mx-auto mb-6 glow-gold" />
            <h1 className="text-3xl md:text-5xl font-light glow-gold mb-4">
              {setupPhase === 'planet' ? 'Выберите мир' : 'Выберите расу'}
            </h1>
            <p className="text-white/40 font-mono text-xs uppercase tracking-widest">
              {setupPhase === 'planet' ? 'Где начнется ваша история?' : 'Кто станет венцом творения?'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {setupPhase === 'planet' ? (
              PLANETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setGameState(prev => ({ ...prev, planet: p }));
                    setSetupPhase('race');
                  }}
                  className="group flex flex-col p-6 bg-transparent border border-white/10 rounded-2xl text-left transition-all hover:bg-gold/10 hover:border-gold/50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/5 rounded-lg group-hover:bg-gold/20 transition-colors">
                        {(p as any).icon || <MapPin size={16} />}
                      </div>
                      <span className="text-lg font-medium text-gold group-hover:glow-gold">{p.name}</span>
                    </div>
                  </div>
                  <p className="text-xs text-white/50 leading-relaxed">{p.desc}</p>
                </button>
              ))
            ) : (
              RACES.map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    setGameState(prev => ({ ...prev, race: r }));
                    setSetupPhase('done');
                  }}
                  className="group flex flex-col p-6 bg-transparent border border-white/10 rounded-2xl text-left transition-all hover:bg-gold/10 hover:border-gold/50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/5 rounded-lg group-hover:bg-gold/20 transition-colors">
                        {(r as any).icon || <User size={16} />}
                      </div>
                      <span className="text-lg font-medium text-gold group-hover:glow-gold">{r.name}</span>
                    </div>
                  </div>
                  <div className="text-[10px] font-mono text-white/30 uppercase mb-2">{r.type} | {r.trait}</div>
                  <p className="text-xs text-white/50 leading-relaxed">{r.desc}</p>
                </button>
              ))
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden overflow-y-auto selection:bg-gold/30 custom-scrollbar">
      <SpaceBackground />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-20 flex items-center justify-between px-6 md:px-12 bg-gradient-to-b from-deep-black to-transparent backdrop-blur-sm">
        <div className="hidden md:flex items-center gap-6 text-xs font-mono text-gold/60">
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
            <span className="text-white/30">ГОДЫ В РАБОТЕ</span>
            <span className="text-gold flex items-center gap-1">
              {gameState.availableYears} <Clock size={12} className="animate-pulse" />
            </span>
          </div>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2">
          <img 
            src="https://i.ibb.co/D0mRFhJ/civilogo.png" 
            alt="CIIV Logo" 
            className="h-12 md:h-16 drop-shadow-[0_0_15px_rgba(212,175,55,0.5)] cursor-pointer"
            onClick={() => setActiveSection('genesis')}
          />
        </div>

        <nav className="hidden md:flex items-center gap-8">
          {(['genesis', 'fate', 'progress'] as Section[]).map((s) => (
            <button
              key={s}
              onClick={() => setActiveSection(s)}
              className={`text-xs font-mono uppercase tracking-widest transition-all hover:text-gold ${
                activeSection === s ? 'text-gold glow-gold' : 'text-white/50'
              }`}
            >
              {s === 'genesis' ? 'Генезис' : s === 'fate' ? 'Ткач Судеб' : 'Прогресс'}
            </button>
          ))}
        </nav>
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
              <div className="relative mb-12 group">
                <motion.div
                  animate={{ 
                    filter: ["drop-shadow(0 0 20px rgba(212,175,55,0.3))", "drop-shadow(0 0 50px rgba(212,175,55,0.6))", "drop-shadow(0 0 20px rgba(212,175,55,0.3))"] 
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="w-72 h-72 md:w-[400px] md:h-[400px] flex items-center justify-center relative"
                >
                  <img 
                    src="https://i.ibb.co/D0mRFhJ/civilogo.png" 
                    alt="CIIV Logo Large" 
                    className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Scan Line */}
                  <motion.div 
                    className="absolute inset-x-0 h-px bg-gold/50 shadow-[0_0_15px_rgba(212,175,55,0.8)] z-10"
                    animate={{ top: ['10%', '90%', '10%'] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  />
                </motion.div>
              </div>

              <h1 className="text-4xl md:text-7xl font-light tracking-tighter mb-4 glow-gold">
                Цивилизация {gameState.race.name}
              </h1>
              <p className="text-gold/60 font-mono text-sm tracking-[0.3em] uppercase mb-12">
                Мир: {gameState.planet.name} | Эра: {gameState.era}
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full max-w-4xl border-t border-b border-white/10 py-12 mb-16">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Год</span>
                  <span className="text-2xl md:text-4xl font-mono text-gold">{gameState.year}</span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Население</span>
                  <span className="text-2xl md:text-4xl font-mono text-gold">
                    {gameState.population >= 1000000 
                      ? (gameState.population / 1000000).toFixed(2) + 'M' 
                      : gameState.population.toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Эра</span>
                  <span className="text-2xl md:text-4xl font-mono text-gold">{gameState.era}</span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Стабильность</span>
                  <span className="text-2xl md:text-4xl font-mono text-gold">94%</span>
                </div>
              </div>

              {/* Biological Info Blocks */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mb-16">
                <div className="bg-transparent border border-white/10 p-6 rounded-2xl text-left">
                  <h4 className="text-[10px] font-mono text-gold uppercase tracking-widest mb-4">Репродукция</h4>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between"><span className="text-white/40">Тип:</span> <span>{(gameState.race as any).bio.reproduction}</span></div>
                    <div className="flex justify-between"><span className="text-white/40">Срок:</span> <span>{(gameState.race as any).bio.pregnancy}</span></div>
                    <div className="flex justify-between"><span className="text-white/40">Потомство:</span> <span>{(gameState.race as any).bio.offspring}</span></div>
                  </div>
                </div>
                <div className="bg-transparent border border-white/10 p-6 rounded-2xl text-left">
                  <h4 className="text-[10px] font-mono text-gold uppercase tracking-widest mb-4">Развитие</h4>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between"><span className="text-white/40">Взросление:</span> <span>{(gameState.race as any).bio.maturation}</span></div>
                    <div className="flex justify-between"><span className="text-white/40">Срок жизни:</span> <span>{(gameState.race as any).bio.lifespan}</span></div>
                  </div>
                </div>
                <div className="bg-transparent border border-white/10 p-6 rounded-2xl text-left">
                  <h4 className="text-[10px] font-mono text-gold uppercase tracking-widest mb-4">Особенности</h4>
                  <p className="text-xs text-white/60 leading-relaxed">{(gameState.race as any).desc}</p>
                </div>
              </div>

              {/* World and Race Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mb-16">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  className="bg-transparent border border-white/10 p-8 rounded-3xl text-left hover:border-gold/30 transition-all group"
                >
                  <div className="flex items-center gap-3 mb-4 text-gold">
                    <Globe size={24} className="group-hover:animate-pulse" />
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
                  className="bg-transparent border border-white/10 p-8 rounded-3xl text-left hover:border-gold/30 transition-all group"
                >
                  <div className="flex items-center gap-3 mb-4 text-gold">
                    <User size={24} className="group-hover:animate-bounce" />
                    <h3 className="text-xl font-light">Раса: {gameState.race.name}</h3>
                  </div>
                  <p className="text-white/60 text-sm leading-relaxed mb-6">{gameState.race.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-transparent rounded-full text-[10px] font-mono text-white/40 uppercase border border-white/5">{gameState.race.type}</span>
                    <span className="px-3 py-1 bg-transparent rounded-full text-[10px] font-mono text-white/40 uppercase border border-white/5">{gameState.race.trait}</span>
                  </div>
                </motion.div>
              </div>

              {/* Scroll Hint */}
              <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mt-16 flex flex-col items-center gap-2 text-white/20 font-mono text-[10px] uppercase"
              >
                Листайте вниз
                <ChevronRight className="rotate-90" size={16} />
              </motion.div>
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
              <div className="relative mb-8">
                <motion.div
                  animate={{ 
                    filter: ["drop-shadow(0 0 20px rgba(212,175,55,0.2))", "drop-shadow(0 0 40px rgba(212,175,55,0.5))", "drop-shadow(0 0 20px rgba(212,175,55,0.2))"] 
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-48 h-48 flex items-center justify-center"
                >
                  <img 
                    src="https://i.ibb.co/VW4W5PQs/Ciivbut.png" 
                    alt="Loom of Fate Butterfly" 
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </motion.div>
                
                {/* Tree Beam SVG */}
                <svg className="absolute top-full left-1/2 -translate-x-1/2 w-full h-32 overflow-visible pointer-events-none">
                  <motion.line
                    x1="50%" y1="0" x2="50%" y2="100%"
                    stroke="url(#beamGradient)"
                    strokeWidth="4"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5 }}
                  />
                  <motion.circle
                    cx="50%" cy="100%" r="4"
                    fill="#D4AF37"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <defs>
                    <linearGradient id="beamGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#D4AF37" />
                      <stop offset="50%" stopColor="#D4AF37" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* 2. Motto */}
              <div className="text-center mb-12">
                <p className="text-gold/80 italic text-lg md:text-xl max-w-2xl mx-auto">
                  <TypewriterText text="Даже взмах крыла бабочки может привести к тайфуну на другом конце света" />
                </p>
              </div>

              {/* 3. Situation Block (Transparent with flame border) */}
              <FlameBorder className="w-full mb-16 bg-transparent">
                <div className="text-center">
                  <h3 className="text-xs font-mono text-gold/40 uppercase tracking-[0.3em] mb-4">Текущая ситуация</h3>
                  <p className="text-white/90 text-lg md:text-xl leading-relaxed">
                    {gameState.currentSituation}
                  </p>
                </div>
              </FlameBorder>

              {/* 4. Choices with branches */}
              <div className="relative w-full mb-16">
                {/* SVG Branches with animated orbs - Positioned between situation and choices */}
                {/* SVG Branches with animated orbs - Positioned between situation and choices */}
                <div className="absolute -top-16 left-0 w-full h-16 pointer-events-none -z-10">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 1000 100" preserveAspectRatio="none">
                    {gameState.choices.map((_, i) => {
                      const x2 = i === 0 ? 150 : i === 1 ? 500 : 850;
                      const pathD = `M 500 0 C 500 50, ${x2} 50, ${x2} 100`;
                      return (
                        <React.Fragment key={i}>
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {gameState.choices.map((choice, i) => (
                    <button
                      key={i}
                      onMouseEnter={() => setHoveredChoice(i)}
                      onMouseLeave={() => setHoveredChoice(null)}
                      onClick={() => handleFateChoice(i)}
                      disabled={isGenerating || selectedYearsToPass === 0}
                      className={`group relative p-6 bg-transparent border border-white/10 rounded-2xl transition-all hover:bg-gold/10 hover:border-gold/50 text-center flex flex-col items-center gap-3 ${
                        isGenerating || selectedYearsToPass === 0 ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <div className="text-[10px] font-mono text-gold uppercase tracking-widest">{choice.title}</div>
                      <div className="text-sm text-white/60 group-hover:text-white transition-colors">{choice.desc}</div>
                      {hoveredChoice === i && (
                        <motion.div layoutId="choice-glow" className="absolute inset-0 bg-gold/5 rounded-2xl blur-xl" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Time Selection */}
              <div className="w-full max-w-md bg-transparent border border-white/10 p-6 rounded-2xl mb-16">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono text-white/40 uppercase tracking-widest">Срок симуляции</span>
                  <span className="text-gold font-mono">{selectedYearsToPass} л.</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max={gameState.availableYears} 
                  value={selectedYearsToPass}
                  onChange={(e) => setSelectedYearsToPass(parseInt(e.target.value))}
                  className="w-full accent-gold bg-white/10 h-1 rounded-full appearance-none cursor-pointer"
                />
                <div className="flex justify-between mt-2 text-[10px] font-mono text-white/20">
                  <span>0 лет</span>
                  <span>{gameState.availableYears} лет</span>
                </div>
                {gameState.availableYears < 1 && (
                  <p className="text-[10px] text-red-400/60 mt-2 text-center font-mono">Недостаточно лет в работе. Ждите начисления...</p>
                )}
              </div>

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
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      className="relative pl-12"
                    >
                      <div className="absolute left-3 top-2 w-2 h-2 rounded-full bg-gold shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
                      <div className="text-[10px] font-mono text-gold/40 mb-1">ГОД {c.year}</div>
                      <p className="text-sm text-white/70 leading-relaxed">{c.event}</p>
                    </motion.div>
                  ))}
                  
                  {gameState.chronicles.length === 0 && (
                    <p className="text-center text-white/20 font-mono text-xs italic py-12">История еще не написана...</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === 'progress' && (
            <motion.div
              key="progress"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-5xl flex flex-col items-center"
            >
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-5xl font-light glow-gold mb-4 uppercase tracking-tighter">Прогресс Цивилизации</h2>
                <p className="text-white/40 font-mono text-xs uppercase tracking-[0.3em]">Технологии и навыки вашего народа</p>
              </div>

              {/* Acceleration Bonus Card */}
              <div className="w-full max-w-md mb-16">
                {(gameState.accelerationBonus || gameState.pendingResult?.accelerationBonus) ? (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative p-8 rounded-3xl border border-white/20 bg-white/5 backdrop-blur-[10px] overflow-hidden group shadow-2xl"
                  >
                    <div className="absolute top-0 right-0 p-4">
                      <Zap className="text-gold animate-pulse" size={24} />
                    </div>
                    <h3 className="text-2xl font-light text-gold mb-2">
                      {gameState.accelerationBonus?.name || gameState.pendingResult?.accelerationBonus.name}
                    </h3>
                    <p className="text-white/80 text-sm mb-8">
                      {gameState.accelerationBonus?.desc || gameState.pendingResult?.accelerationBonus.desc}
                    </p>
                    
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-gold shadow-[0_0_10px_#D4AF37]"
                          animate={{ 
                            width: `${(gameState.bonusTaps / (gameState.accelerationBonus?.tapsRequired || gameState.pendingResult?.accelerationBonus.tapsRequired)) * 100}%` 
                          }}
                        />
                      </div>
                      <p className="text-[10px] font-mono text-white/40 uppercase">
                        Нажмите {(gameState.accelerationBonus?.tapsRequired || gameState.pendingResult?.accelerationBonus.tapsRequired) - gameState.bonusTaps} раз для активации
                      </p>
                      
                      <button 
                        onClick={() => {
                          const required = gameState.accelerationBonus?.tapsRequired || gameState.pendingResult?.accelerationBonus.tapsRequired;
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
                        className="w-full py-4 bg-gold text-black font-bold rounded-xl hover:bg-white transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] active:scale-95"
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

              {/* Skill Tree */}
              <div className="w-full">
                <h3 className="text-xs font-mono text-white/30 uppercase tracking-[0.3em] mb-8 text-center">Древо навыков</h3>
                <div className="flex flex-wrap justify-center gap-6">
                  {gameState.skills.length > 0 ? (
                    gameState.skills.map((skill, index) => (
                      <motion.div
                        key={skill.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative group"
                      >
                        {index > 0 && (
                          <div className="absolute -left-6 top-1/2 w-6 h-px bg-gold/30" />
                        )}
                        <div 
                          className="w-40 h-40 rounded-full border border-gold/20 flex flex-col items-center justify-center p-4 text-center hover:border-gold transition-all cursor-help bg-deep-black/50 backdrop-blur-md"
                          title={skill.desc}
                        >
                          <Atom className="text-gold mb-2" size={24} />
                          <span className="text-[10px] font-mono text-white/40 mb-1">ГОД {skill.year}</span>
                          <span className="text-xs font-medium text-white group-hover:text-gold transition-colors">{skill.name}</span>
                          
                          {/* Tooltip on hover */}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-48 p-4 bg-deep-black border border-gold/30 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-2xl">
                            <p className="text-[10px] text-white/80 leading-relaxed">{skill.desc}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-white/20 font-mono text-xs italic">История навыков пока пуста...</div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Motto */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 h-16 flex items-center justify-center pointer-events-none">
        <div className="bg-deep-black/80 backdrop-blur-md px-8 py-2 rounded-t-2xl border-t border-l border-r border-white/10">
          <p className="text-[10px] md:text-xs font-mono text-gold/60 tracking-[0.4em] uppercase">
            Ты не Бог, Ты — Наблюдатель
          </p>
        </div>
      </footer>

      {/* Mobile Navigation (Tab Bar) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[60] h-20 bg-deep-black/90 backdrop-blur-xl border-t border-white/10 flex items-center justify-around px-4">
        <button 
          onClick={() => setActiveSection('genesis')}
          className={`flex flex-col items-center gap-1 ${activeSection === 'genesis' ? 'text-gold' : 'text-white/40'}`}
        >
          <Globe size={20} />
          <span className="text-[8px] font-mono uppercase">Генезис</span>
        </button>
        <button 
          onClick={() => setActiveSection('fate')}
          className={`flex flex-col items-center gap-1 ${activeSection === 'fate' ? 'text-gold' : 'text-white/40'}`}
        >
          <Sparkles size={20} />
          <span className="text-[8px] font-mono uppercase">Судьба</span>
        </button>
        <button 
          onClick={() => setActiveSection('progress')}
          className={`flex flex-col items-center gap-1 ${activeSection === 'progress' ? 'text-gold' : 'text-white/40'}`}
        >
          <HistoryIcon size={20} />
          <span className="text-[8px] font-mono uppercase">Прогресс</span>
        </button>
      </div>
      {/* Modals for Choice Flow */}
      <AnimatePresence>
        {showBonusNotify && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-md w-full bg-white/5 border border-white/20 p-8 rounded-3xl text-center backdrop-blur-[10px] shadow-2xl"
            >
              <Rocket className="text-gold mx-auto mb-6" size={48} />
              <h3 className="text-2xl font-light text-gold mb-4 uppercase tracking-tight">Доступен Прогресс!</h3>
              <p className="text-white/80 text-sm leading-relaxed mb-8">
                Для этого пути доступен бонус: <span className="text-gold font-bold">{gameState.pendingResult?.accelerationBonus.name}</span>. 
                Перейдите на страницу <span className="text-gold">Прогресс</span>, чтобы активировать его. 
                Без бонуса шанс негативных последствий составляет 50%.
              </p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => {
                    setShowBonusNotify(false);
                    setActiveSection('progress');
                  }}
                  className="w-full py-4 bg-gold text-black font-bold rounded-xl hover:bg-white transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                >
                  ПЕРЕЙТИ К ПРОГРЕССУ
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
              className="max-w-md w-full bg-white/5 border border-white/20 p-8 rounded-3xl text-center backdrop-blur-[10px] shadow-2xl"
            >
              {gameState.pendingResult?.populationChange >= 0 ? (
                <Sparkles className="text-emerald-400 mx-auto mb-6" size={48} />
              ) : (
                <ZapOff className="text-red-400 mx-auto mb-6" size={48} />
              )}
              <h3 className="text-2xl font-light text-gold mb-4 uppercase tracking-tight">Последствия выбора</h3>
              <div className="space-y-6 mb-8">
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-[10px] font-mono text-white/40 uppercase mb-1">Изменение населения</p>
                  <p className={`text-2xl font-mono ${gameState.pendingResult?.populationGrowthPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {gameState.pendingResult?.populationGrowthPercent > 0 ? '+' : ''}{gameState.pendingResult?.populationGrowthPercent}%
                  </p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-[10px] font-mono text-white/40 uppercase mb-1">Освоен навык</p>
                  <p className="text-lg text-gold">{gameState.pendingResult?.acquiredSkill.name}</p>
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
              className="max-w-2xl w-full max-h-[80vh] overflow-y-auto custom-scrollbar bg-white/5 border border-white/20 p-8 md:p-12 rounded-3xl backdrop-blur-[10px] shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-8 text-gold">
                <HistoryIcon size={24} />
                <h3 className="text-2xl font-light uppercase tracking-tighter">Летопись Времен</h3>
              </div>
              <div className="space-y-6 mb-12">
                {gameState.chronicles.slice(-Math.max(1, selectedYearsToPass)).map((c, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-6 border-l border-gold/20 pl-6 py-2"
                  >
                    <span className="text-gold font-mono text-sm min-w-[60px]">ГОД {c.year}</span>
                    <p className="text-white/80 text-sm leading-relaxed">{c.event}</p>
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
      </AnimatePresence>
    </div>
  );
}
