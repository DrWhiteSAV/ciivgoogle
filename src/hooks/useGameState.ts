import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, Skill, ChronicleEntry, EraInfo } from '../types/game';
import { PLANETS, RACES, getCompatibility, Habitat } from '../config/constants';
import { generateFateOutcome, generateInitialEra } from '../services/aiService';

const STORAGE_KEY = 'civ_game_state';

const INITIAL_STATE: GameState = {
  planet: PLANETS[0],
  race: RACES[0],
  year: 0,
  population: 144,
  era: 'Первобытная эпоха',
  eraDescription: '',
  eraYear: 0,
  pastEras: [],
  history: ['Начало времен. Цивилизация зародилась.'],
  availableYears: 10,
  chronicles: [],
  currentSituation: 'Ваша цивилизация только что зародилась. Первые поселения появились в плодородных долинах. Что станет вашим первым шагом к величию?',
  choices: [
    { id: 'choice-init-1', title: 'Путь Единства', desc: 'Объединить племена под знаменем общей веры.' },
    { id: 'choice-init-2', title: 'Путь Познания', desc: 'Сфокусироваться на изучении окружающего мира.' },
    { id: 'choice-init-3', title: 'Путь Силы', desc: 'Установить жесткую иерархию и дисциплину.' }
  ],
  skills: [],
  accelerationBonus: null,
  bonusTaps: 0,
  isBonusActive: false,
  pendingResult: null,
  stability: 100,
  compatibility: 100,
  prayers: 500,
  prayerRegenSeconds: 300,
  observerYearsToDeduct: 1,
  isObserverHidden: false,
  isBonusEarned: false,
  isObserverMode: false,
  pendingEra: null,
  heroes: [],
  relics: [],
  ideology: 'Традиционализм',
  externalContacts: [],
  victoryProgress: 0,
  currentSoundscape: 'Звуки природы, треск костра, шепот ветра'
};

export const useGameState = (isInactive: boolean = false) => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...INITIAL_STATE, ...parsed };
      } catch (e) {
        console.error('Failed to parse saved game state', e);
      }
    }
    return INITIAL_STATE;
  });

  const [secondsToNextYear, setSecondsToNextYear] = useState(60);
  const [secondsToNextPrayer, setSecondsToNextPrayer] = useState(300);

  // Timer for available years
  useEffect(() => {
    if (isInactive) return;

    const interval = setInterval(() => {
      setSecondsToNextYear(prev => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
      setSecondsToNextPrayer(prev => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isInactive]);

  useEffect(() => {
    if (secondsToNextYear === 0) {
      setGameState(gs => ({
        ...gs,
        availableYears: gs.availableYears + 1
      }));
      setSecondsToNextYear(60);
    }
  }, [secondsToNextYear]);

  useEffect(() => {
    if (secondsToNextPrayer === 0) {
      const regenAmount = Math.floor(Math.random() * 91) + 10; // 10-100
      setGameState(gs => ({
        ...gs,
        prayers: gs.prayers + regenAmount
      }));
      setSecondsToNextPrayer(300);
    }
  }, [secondsToNextPrayer]);

  // Stability calculation
  useEffect(() => {
    const progressCount = gameState.skills.filter(s => s.type === 'progress').length;
    const regressCount = gameState.skills.filter(s => s.type === 'regress').length;
    const totalSkills = progressCount + regressCount;
    const stability = totalSkills === 0 ? 100 : Math.ceil((progressCount / totalSkills) * 100);
    
    if (gameState.stability !== stability) {
      setGameState(prev => ({ ...prev, stability }));
    }
  }, [gameState.skills]);

  // Compatibility calculation
  useEffect(() => {
    const baseCompatibility = getCompatibility(gameState.race.habitat as Habitat, gameState.planet.habitat as Habitat);
    // Compatibility is base + incremental changes from fate
    // But wait, the user wants stability to be the formula.
    // Let's keep compatibility as it is (incremental) but fix the overwrite issue.
    if (gameState.year === 0 && gameState.compatibility !== baseCompatibility) {
      setGameState(prev => ({ ...prev, compatibility: baseCompatibility }));
    }
  }, [gameState.race, gameState.planet, gameState.year]);

  const applyPendingResult = useCallback((withBonus: boolean, yearsToPass: number, skipBonus: boolean = false) => {
    const result = gameState.pendingResult;
    if (!result) return;

    setGameState(prev => {
      let currentPop = prev.population;
      const newChronicles: ChronicleEntry[] = [];
      const baseYear = prev.year;
      const baseEraYear = prev.eraYear;
      
      // Process each year's growth
      if (Array.isArray(result.chronicles)) {
        result.chronicles.forEach((c: any, index: number) => {
          const prayersUsed = c.prayersUsed || withBonus;
          const originalGrowthPercent = c.originalGrowthPercent !== undefined ? c.originalGrowthPercent : (c.growthPercent || 0);
          let growthPercent = c.growthPercent || 0;
          
          // Enforce prayer bonus rules strictly
          if (prayersUsed) {
            if (originalGrowthPercent < 0) {
              growthPercent = 0;
            } else if (originalGrowthPercent > 0) {
              // Ensure it's doubled if it wasn't already
              // We compare with original to see if it needs doubling
              if (Math.abs(growthPercent - originalGrowthPercent) < 0.01) {
                growthPercent = originalGrowthPercent * 2;
              }
            }
          }
          
          const chronicleYear = c.year || (baseYear + index + 1);
          const chronicleEraYear = c.eraYear || (baseEraYear + index + 1);
          
          if (prev.chronicles.some(existing => existing.year === chronicleYear)) {
            return;
          }
          
          const factor = growthPercent / 100;
          const oldPop = currentPop;
          // Round up population as requested
          currentPop = Math.max(0, Math.ceil(oldPop * (1 + factor)));
          
          newChronicles.push({
            ...c,
            id: `chronicle-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
            year: chronicleYear,
            eraYear: chronicleEraYear,
            population: currentPop,
            oldPopulation: oldPop,
            growthPercent: growthPercent,
            originalGrowthPercent: originalGrowthPercent,
            prayersUsed: prayersUsed,
            era: prev.era,
            choiceTitle: result.choiceTitle
          });
        });
      }

      const finalPop = currentPop;
      const newYear = baseYear + yearsToPass;
      
      // Era progression logic
      let newEraYear = baseEraYear + yearsToPass;
      let pendingEra = prev.pendingEra;

      if (result.newEra) {
        pendingEra = {
          ...result.newEra,
          yearReached: newYear,
          yearsPassedAtTransition: newEraYear,
          populationAtTransition: finalPop
        };
      }

      let compatibilityChange = result.outcomeType === 'positive' ? 1 : -2;
      
      if (withBonus && !skipBonus && result.outcomeType === 'positive') {
        compatibilityChange += 2;
      }

      const newCompatibility = Math.min(100, Math.max(0, prev.compatibility + compatibilityChange));

      const newSkill: Skill = {
        id: `skill-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: result.acquiredSkill?.name || 'Новый навык',
        desc: result.acquiredSkill?.description || 'Описание навыка',
        year: newYear,
        era: prev.era,
        type: result.outcomeType === 'positive' ? 'progress' : 'regress'
      };

      // Prayer logic for 1-year results
      let newPrayers = prev.prayers;
      if (yearsToPass === 1 && !prev.isObserverMode) {
        if (result.outcomeType === 'positive') {
          newPrayers += 1;
        } else {
          newPrayers = Math.max(0, newPrayers - 1);
        }
      }

      return {
        ...prev,
        year: newYear,
        population: finalPop,
        compatibility: newCompatibility,
        eraYear: newEraYear,
        pendingEra: pendingEra,
        availableYears: Math.max(0, prev.availableYears - yearsToPass),
        chronicles: [...prev.chronicles, ...newChronicles],
        currentSituation: result.newSituation || prev.currentSituation,
        choices: Array.isArray(result.newChoices) 
          ? result.newChoices.map((c: any, i: number) => ({ ...c, id: `choice-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}` })) 
          : prev.choices,
        history: [...prev.history, `Год ${newYear}: ${result.choiceTitle || 'Выбор сделан'}`],
        skills: [...prev.skills, newSkill],
        heroes: result.hero 
          ? [...prev.heroes, { ...result.hero, id: `hero-${Date.now()}`, yearBorn: newYear, era: prev.era }] 
          : prev.heroes,
        relics: result.relic 
          ? [...prev.relics, { ...result.relic, id: `relic-${Date.now()}`, yearFound: newYear, era: prev.era }] 
          : prev.relics,
        ideology: result.ideology || prev.ideology,
        externalContacts: result.externalContact 
          ? Array.from(new Set([...prev.externalContacts, result.externalContact])) 
          : prev.externalContacts,
        victoryProgress: Math.min(100, Math.min((newEraYear / 200) * 100, (([...prev.skills, newSkill].filter(s => s.era === prev.era && s.type === 'progress').length) / 25) * 100)),
        currentSoundscape: result.currentSoundscape || prev.currentSoundscape,
        accelerationBonus: skipBonus ? null : ((result.accelerationBonus && !prev.isBonusActive) ? {
          name: result.accelerationBonus.name,
          desc: result.accelerationBonus.description,
          prayerText: result.accelerationBonus.prayerText,
          tapsRequired: result.accelerationBonus.tapsRequired,
          yearsToPass: result.accelerationBonus.yearsToPass
        } : prev.accelerationBonus),
        bonusTaps: 0,
        isBonusActive: false,
        isBonusEarned: false,
        prayers: newPrayers,
        pendingResult: null
      };
    });
  }, [gameState.pendingResult]);

  const handleTap = useCallback((onComplete?: () => void) => {
    if (!gameState.accelerationBonus || gameState.isBonusActive || gameState.prayers <= 0) return;
    
    setGameState(prev => {
      const newTaps = prev.bonusTaps + 1;
      const newPrayers = Math.max(0, prev.prayers - 1);
      
      if (newTaps >= (prev.accelerationBonus?.tapsRequired || 100)) {
        return {
          ...prev,
          bonusTaps: newTaps,
          isBonusActive: true,
          isBonusEarned: true,
          prayers: newPrayers,
          availableYears: prev.availableYears + (prev.accelerationBonus?.yearsToPass || 5)
        };
      }
      return { ...prev, bonusTaps: newTaps, prayers: newPrayers };
    });
  }, [gameState.accelerationBonus, gameState.isBonusActive, gameState.prayers]);

  const resetGame = useCallback(() => {
    setGameState(prev => ({
      ...INITIAL_STATE,
      availableYears: prev.availableYears,
      prayers: prev.prayers
    }));
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const saveGame = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  }, [gameState]);

  const applyPendingEra = useCallback(() => {
    setGameState(prev => {
      if (!prev.pendingEra) return prev;
      
      const eraSkills = prev.skills.filter(s => s.era === prev.era);
      const newPastEras = [...prev.pastEras, {
        name: prev.era,
        description: prev.eraDescription,
        yearReached: prev.year,
        yearsPassed: prev.eraYear,
        population: prev.population,
        progressCount: eraSkills.filter(s => s.type === 'progress').length,
        regressCount: eraSkills.filter(s => s.type === 'regress').length,
        skills: eraSkills,
        ideology: prev.ideology,
        externalContacts: prev.externalContacts,
        soundscape: prev.currentSoundscape,
        victoryProgress: prev.victoryProgress
      }];

      return {
        ...prev,
        era: prev.pendingEra.name,
        eraDescription: prev.pendingEra.description,
        currentSituation: prev.pendingEra.newSituation || prev.currentSituation,
        choices: Array.isArray(prev.pendingEra.newChoices) 
          ? prev.pendingEra.newChoices.map((c: any, i: number) => ({ ...c, id: `choice-era-${Date.now()}-${i}` })) 
          : prev.choices,
        eraYear: 0,
        victoryProgress: 0,
        pastEras: newPastEras,
        pendingEra: null
      };
    });
  }, []);

  return {
    gameState,
    setGameState,
    secondsToNextYear,
    secondsToNextPrayer,
    applyPendingResult,
    applyPendingEra,
    handleTap,
    resetGame,
    saveGame
  };
};
