import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { 
  Users, 
  History as HistoryIcon, 
  Zap, 
  Skull, 
  Globe,
  Sparkles,
  Activity,
  X,
  Eye,
  Leaf
} from 'lucide-react';

import { useGameState } from './hooks/useGameState';
import { PreCalculatedOutcome } from './types/game';
import { generateFateOutcome, generateInitialEra, generateFallbackFateOutcome, generateFallbackInitialEra } from './services/aiService';
import { SetupPage } from './pages/SetupPage';
import { GenesisPage } from './pages/GenesisPage';
import { FatePage } from './pages/FatePage';
import { TreePage } from './pages/TreePage';
import { ProfilePage } from './pages/ProfilePage';
import { SpaceBackground } from './components/SpaceBackground';
import { ResultModal, ChronicleModal, YearSelectionModal, Modal, ShopModal, BonusChoiceModal, BonusModal, ObserverControls, WorldModal, RaceModal } from './components/Modals';
import { Typewriter } from './components/Typewriter';
import { StatInfoWindow, FullscreenImage, CircularProgress } from './components/UI';
import { HabitatChart } from './components/HabitatChart';
import { getCompatibility } from './config/constants';
import { InactivityOverlay } from './components/InactivityOverlay';
import { Archives } from './components/Archives';

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [lastClickTime, setLastClickTime] = useState(Date.now());
  const [isInactive, setIsInactive] = useState(false);

  useEffect(() => {
    const handleGlobalClick = () => {
      setLastClickTime(Date.now());
    };

    window.addEventListener('click', handleGlobalClick);
    window.addEventListener('touchstart', handleGlobalClick);
    return () => {
      window.removeEventListener('click', handleGlobalClick);
      window.removeEventListener('touchstart', handleGlobalClick);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isInactive && Date.now() - lastClickTime > 600000) { // 600 seconds
        setIsInactive(true);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lastClickTime, isInactive]);

  const { 
    gameState, 
    setGameState, 
    secondsToNextYear, 
    secondsToNextPrayer, 
    applyPendingResult, 
    applyPendingEra,
    handleTap,
    resetGame,
    saveGame
  } = useGameState(isInactive);

  const activeSection = location.pathname.substring(1) as 'genesis' | 'fate' | 'tree' | 'profile' | 'setup';
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingEra, setIsGeneratingEra] = useState(false);
  const [eraLoadingCountdown, setEraLoadingCountdown] = useState(60);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [setupPlanet, setSetupPlanet] = useState<any>(null);
  const [previewPlanet, setPreviewPlanet] = useState<any>(null);
  const [previewRace, setPreviewRace] = useState<any>(null);

  // Redirect to setup if no planet/race selected and not on setup page
  useEffect(() => {
    if (gameState.year === 0 && !gameState.eraDescription && location.pathname !== '/setup') {
      navigate('/setup');
    }
  }, [gameState.year, gameState.eraDescription, location.pathname, navigate]);

  const [statInfoWindow, setStatInfoWindow] = useState<{ x: number; y: number; title: string; desc: string } | null>(null);
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [showShopModal, setShowShopModal] = useState(false);
  const [showBonusChoiceModal, setShowBonusChoiceModal] = useState(false);
  const [showArchives, setShowArchives] = useState(false);
  const [eraGenerationAttempts, setEraGenerationAttempts] = useState(0);
  const [eraGenerationFailed, setEraGenerationFailed] = useState(false);
  const [isGenerationInProgress, setIsGenerationInProgress] = useState(false);
  const [isQuotaExceeded, setIsQuotaExceeded] = useState(false);
  const [pendingSetupData, setPendingSetupData] = useState<{planet: any, race: any} | null>(null);

  const [fateLoadingCountdown, setFateLoadingCountdown] = useState(60);
  const [fateGenerationAttempts, setFateGenerationAttempts] = useState(0);
  const [fateGenerationFailed, setFateGenerationFailed] = useState(false);
  const [pendingFateData, setPendingFateData] = useState<{years: number, choiceIndex: number, isObserver: boolean, wasStartingObserver: boolean} | null>(null);

  const saveGameRef = useRef(saveGame);
  useEffect(() => {
    saveGameRef.current = saveGame;
  }, [saveGame]);

  // Auto-save every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      saveGameRef.current();
      console.log('Game auto-saved');
    }, 5 * 60 * 1000); // 5 minutes
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isGenerating) {
      timer = setInterval(() => {
        setFateLoadingCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isGenerating]);

  // Helper for pre-calculating fate outcomes
  const calculatePreCalculatedData = (years: number, isObserverMode: boolean, isBonusActive: boolean, selectedChoiceIndex: number) => {
    const data: PreCalculatedOutcome[] = [];
    const baseGrowth = gameState.race?.stats.avgGrowth || 2;
    const baseMortality = gameState.race?.stats.avgMortality || 1;
    const compatibility = gameState.compatibility;
    const stability = gameState.stability;
    
    // New formula: (100 - compatibility) / baseMortality / 10
    const maxDeclineBase = (100 - compatibility) / (baseMortality || 0.1) / 10;
    const minDeclineBase = baseMortality;

    const successThreshold = isObserverMode ? 0.7 : 0.6;
    const effectiveBonusActive = isObserverMode ? false : isBonusActive;

    if (years === 1) {
      // Success chance is now strictly 60% (70% in observer)
      const isSuccess = Math.random() < successThreshold;
      
      let growthPercent = 0;
      if (isSuccess) {
        // Random between 0.1% and baseGrowth (birth rate)
        const minGrowth = 0.1;
        const maxGrowth = Math.max(minGrowth, baseGrowth);
        growthPercent = minGrowth + Math.random() * (maxGrowth - minGrowth);
      } else {
        // New logic: random between minDeclineBase and maxDeclineBase
        const min = Math.min(minDeclineBase, maxDeclineBase);
        const max = Math.max(minDeclineBase, maxDeclineBase);
        growthPercent = -(min + Math.random() * (max - min));
      }

      const originalGrowthPercent = Number(growthPercent.toFixed(2));
      let finalGrowthPercent = originalGrowthPercent;

      if (effectiveBonusActive) {
        if (isSuccess) finalGrowthPercent = originalGrowthPercent * 2;
        else finalGrowthPercent = 0;
      }

      data.push({ 
        year: gameState.year + 1, 
        isSuccess, 
        growthPercent: Number(finalGrowthPercent.toFixed(2)),
        originalGrowthPercent,
        prayersUsed: effectiveBonusActive
      });
    } else {
      const successThreshold = isObserverMode ? 0.7 : 0.6;
      const step = years > 100 ? 10 : (years > 10 ? 5 : 1);
      for (let i = step; i <= years; i += step) {
        const isSuccess = Math.random() < successThreshold;
        
        let growthPercent = 0;
        if (isSuccess) {
          // Random between 0.1% and baseGrowth (birth rate) * step
          const minGrowth = 0.1;
          const maxGrowth = Math.max(minGrowth, baseGrowth);
          growthPercent = (minGrowth + Math.random() * (maxGrowth - minGrowth)) * step;
        } else {
          // New logic: random between minDeclineBase and maxDeclineBase
          const min = Math.min(minDeclineBase, maxDeclineBase);
          const max = Math.max(minDeclineBase, maxDeclineBase);
          growthPercent = -(min + Math.random() * (max - min)) * step;
        }
        
        const originalGrowthPercent = Number(growthPercent.toFixed(2));
        let finalGrowthPercent = originalGrowthPercent;

        if (effectiveBonusActive) {
          if (isSuccess) finalGrowthPercent = originalGrowthPercent * 2;
          else finalGrowthPercent = 0;
        }

        data.push({ 
          year: gameState.year + i, 
          isSuccess, 
          growthPercent: Number(finalGrowthPercent.toFixed(2)),
          originalGrowthPercent,
          prayersUsed: effectiveBonusActive
        });
      }
    }
    return data;
  };

  // Handle fate retry logic when timer reaches 0
  useEffect(() => {
    if (isGenerating && fateLoadingCountdown === 0 && !gameState.pendingResult && !fateGenerationFailed && !isGenerationInProgress) {
      if (fateGenerationAttempts === 1) {
        const retry = async () => {
          setFateGenerationAttempts(2);
          setFateLoadingCountdown(30); // 30 seconds for the second attempt
          setIsQuotaExceeded(false);
          setIsGenerationInProgress(true);
          try {
            const years = pendingFateData!.years;
            const currentIsObserver = pendingFateData!.isObserverMode;
            const selectedChoiceIndex = pendingFateData!.choiceIndex;
            
            const preCalculatedData = calculatePreCalculatedData(
              years, 
              currentIsObserver, 
              gameState.isBonusActive || gameState.isBonusEarned,
              selectedChoiceIndex
            );

            const result = await generateFateOutcome(gameState, selectedChoiceIndex, years, currentIsObserver, preCalculatedData);
            
            if (result.newEra) {
              showEraText(result.newEra.description);
            }

            setGameState(prev => ({ ...prev, pendingResult: result }));
            if (result.accelerationBonus && !pendingFateData!.isObserverMode) {
              setShowBonusChoiceModal(true);
            }
            setIsGenerating(false);
            setPendingFateData(null);
          } catch (error: any) {
            console.error('Fate generation failed after retries:', error);
            // If retry fails, use fallback regardless of error type
            const preCalculatedData = calculatePreCalculatedData(
              pendingFateData!.years, 
              pendingFateData!.isObserverMode, 
              gameState.isBonusActive || gameState.isBonusEarned,
              pendingFateData!.choiceIndex
            );
            const fallbackResult = generateFallbackFateOutcome(gameState, pendingFateData!.choiceIndex, pendingFateData!.years, preCalculatedData);
            setGameState(prev => ({ ...prev, pendingResult: fallbackResult }));
            setIsGenerating(false);
            setPendingFateData(null);
          } finally {
            setIsGenerationInProgress(false);
          }
        };
        retry();
      } else {
        setFateGenerationFailed(true);
      }
    }
  }, [fateLoadingCountdown, isGenerating, gameState.pendingResult, fateGenerationFailed, fateGenerationAttempts, pendingFateData, isGenerationInProgress, gameState]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    let phraseTimer: NodeJS.Timeout;

    if (isGeneratingEra) {
      timer = setInterval(() => {
        setEraLoadingCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      phraseTimer = setInterval(() => {
        setCurrentPhraseIndex(Math.floor(Math.random() * 10));
      }, 5000);
    }

    return () => {
      if (timer) clearInterval(timer);
      if (phraseTimer) clearInterval(phraseTimer);
    };
  }, [isGeneratingEra, eraGenerationAttempts]);

  // Handle retry logic when timer reaches 0
  useEffect(() => {
    if (isGeneratingEra && eraLoadingCountdown === 0 && !gameState.eraDescription && !eraGenerationFailed && !isGenerationInProgress) {
      if (eraGenerationAttempts === 1) {
        const retry = async () => {
          setEraGenerationAttempts(2);
          setEraLoadingCountdown(30); // 30 seconds for the second attempt
          setIsQuotaExceeded(false);
          setIsGenerationInProgress(true);
          try {
            const era = await generateInitialEra(pendingSetupData!.planet, pendingSetupData!.race);
            setGameState(prev => ({
              ...prev,
              planet: pendingSetupData!.planet,
              race: pendingSetupData!.race,
              year: 0,
              population: 144,
              availableYears: 10,
              prayers: 500,
              era: era.name,
              eraDescription: era.description,
              currentSituation: era.initialSituation || prev.currentSituation,
              choices: Array.isArray(era.initialChoices) 
                ? era.initialChoices.map((c: any, i: number) => ({ ...c, id: `choice-init-${Date.now()}-${i}` })) 
                : prev.choices,
              eraYear: 0
            }));
            showEraText(era.description);
            setIsGeneratingEra(false);
            navigate('/genesis');
            setSetupPlanet(null);
            setPendingSetupData(null);
          } catch (error: any) {
            console.error('Era generation failed after retries:', error);
            // If retry fails, use fallback regardless of error type
            const era = generateFallbackInitialEra(pendingSetupData!.planet, pendingSetupData!.race);
            setGameState(prev => ({
              ...prev,
              planet: pendingSetupData!.planet,
              race: pendingSetupData!.race,
              year: 0,
              population: 144,
              availableYears: 10,
              prayers: 500,
              era: era.name,
              eraDescription: era.description,
              currentSituation: era.initialSituation,
              choices: era.initialChoices.map((c: any, i: number) => ({ ...c, id: `choice-init-fallback-${Date.now()}-${i}` })),
              eraYear: 0
            }));
            showEraText(era.description);
            setIsGeneratingEra(false);
            navigate('/genesis');
            setSetupPlanet(null);
            setPendingSetupData(null);
          } finally {
            setIsGenerationInProgress(false);
          }
        };
        retry();
      } else {
        setEraGenerationFailed(true);
      }
    }
  }, [eraLoadingCountdown, isGeneratingEra, gameState.eraDescription, eraGenerationFailed, eraGenerationAttempts, pendingSetupData, navigate, isGenerationInProgress, gameState]);

  const [eraTypewriterText, setEraTypewriterText] = useState<string | null>(null);
  const [isEraTypewriterComplete, setIsEraTypewriterComplete] = useState(false);
  const [isEraTypewriterSkipped, setIsEraTypewriterSkipped] = useState(false);
  const [isStartingObserver, setIsStartingObserver] = useState(false);

  const showEraText = (text: string) => {
    setEraTypewriterText(text);
    setIsEraTypewriterComplete(false);
    setIsEraTypewriterSkipped(false);
  };
  const isObserverMode = gameState.isObserverMode;
  const setIsObserverMode = (val: boolean | ((prev: boolean) => boolean)) => {
    setGameState(prev => ({
      ...prev,
      isObserverMode: typeof val === 'function' ? val(prev.isObserverMode) : val
    }));
  };
  const [showChronicleModal, setShowChronicleModal] = useState(false);
  const [showWorldModal, setShowWorldModal] = useState(false);
  const [showRaceModal, setShowRaceModal] = useState(false);
  const [showYearSelectionModal, setShowYearSelectionModal] = useState(false);
  const [selectedChoiceIndex, setSelectedChoiceIndex] = useState<number | null>(null);
  const [selectedYearsToPass, setSelectedYearsToPass] = useState(1);
  const [fullscreenImage, setFullscreenImage] = useState<{ src: string; alt: string } | null>(null);

  const handleStatClick = useCallback((e: React.MouseEvent, title: string, desc: string) => {
    e.stopPropagation();
    setStatInfoWindow({ x: e.clientX, y: e.clientY, title, desc });
  }, []);

  const handleStatHide = useCallback(() => {
    setStatInfoWindow(null);
  }, []);

  const handleSetupDone = async (planet: any, race: any) => {
    if (isGeneratingEra) return;
    setSetupPlanet(planet);
    setPendingSetupData({ planet, race });
    setIsGeneratingEra(true);
    setEraLoadingCountdown(60);
    setEraGenerationAttempts(1);
    setEraGenerationFailed(false);
    setIsQuotaExceeded(false);
    setIsGenerationInProgress(true);
    setCurrentPhraseIndex(Math.floor(Math.random() * 10));
    
    try {
      const era = await generateInitialEra(planet, race);
      setGameState(prev => ({
        ...prev,
        planet,
        race,
        year: 0,
        population: 144,
        availableYears: 10,
        prayers: 500,
        era: era.name,
        eraDescription: era.description,
        currentSituation: era.initialSituation || prev.currentSituation,
        choices: Array.isArray(era.initialChoices) 
          ? era.initialChoices.map((c: any, i: number) => ({ ...c, id: `choice-init-${Date.now()}-${i}` })) 
          : prev.choices,
        eraYear: 0
      }));
      showEraText(era.description);
      setIsGeneratingEra(false);
      navigate('/genesis');
      setSetupPlanet(null);
      setPendingSetupData(null);
    } catch (error: any) {
      console.error('Initial era generation failed:', error);
      const errorStr = JSON.stringify(error);
      const isQuota = error?.message?.includes('429') || error?.status === 429 || errorStr.includes('429') || errorStr.includes('RESOURCE_EXHAUSTED') || errorStr.includes('rate limit');
      if (isQuota) {
        setIsQuotaExceeded(true);
        setEraLoadingCountdown(10); // Wait 10 seconds for retry
      } else {
        // Use fallback immediately for other errors
        const era = generateFallbackInitialEra(planet, race);
        setGameState(prev => ({
          ...prev,
          planet,
          race,
          year: 0,
          population: 144,
          availableYears: 10,
          prayers: 500,
          era: era.name,
          eraDescription: era.description,
          currentSituation: era.initialSituation,
          choices: era.initialChoices.map((c: any, i: number) => ({ ...c, id: `choice-init-fallback-${Date.now()}-${i}` })),
          eraYear: 0
        }));
        showEraText(era.description);
        setIsGeneratingEra(false);
        navigate('/genesis');
        setSetupPlanet(null);
        setPendingSetupData(null);
      }
    } finally {
      setIsGenerationInProgress(false);
    }
  };

  const handleSkipEraGeneration = () => {
    if (!pendingSetupData) {
      setIsGeneratingEra(false);
      navigate('/genesis');
      return;
    }
    setGameState(prev => ({
      ...prev,
      planet: pendingSetupData.planet,
      race: pendingSetupData.race,
      year: 0,
      population: 144,
      availableYears: 10,
      prayers: 500,
      era: "Новая Эра",
      eraDescription: "История этого мира начинается с чистого листа. Вы — Наблюдатель, и судьба этой цивилизации теперь в ваших руках.",
      eraYear: 0
    }));
    setIsGeneratingEra(false);
    navigate('/genesis');
    setSetupPlanet(null);
    setPendingSetupData(null);
  };

  useEffect(() => {
    const handleToggleHide = () => {
      setGameState(prev => ({ ...prev, isObserverHidden: !prev.isObserverHidden }));
    };
    window.addEventListener('toggleObserverHide', handleToggleHide);
    return () => window.removeEventListener('toggleObserverHide', handleToggleHide);
  }, []);

  const handleFateChoice = async (years: number, choiceIndex?: number) => {
    const finalChoiceIndex = choiceIndex !== undefined ? choiceIndex : selectedChoiceIndex;
    if (finalChoiceIndex === null) return;
    
    setIsGenerating(true);
    setShowYearSelectionModal(false);
    setSelectedYearsToPass(years);
    setFateLoadingCountdown(60);
    setFateGenerationAttempts(1);
    setFateGenerationFailed(false);
    setIsQuotaExceeded(false);
    setIsGenerationInProgress(true);

    let currentIsObserver = gameState.isObserverMode;
    let wasStartingObserver = false;
    if (isStartingObserver) {
      currentIsObserver = true;
      wasStartingObserver = true;
      setGameState(prev => ({ 
        ...prev, 
        isObserverMode: true,
        observerYearsToDeduct: years, 
        isBonusEarned: false 
      }));
      setIsStartingObserver(false);
    }

    // Pre-calculate outcomes
    const preCalculatedData = calculatePreCalculatedData(years, currentIsObserver, gameState.isBonusActive || gameState.isBonusEarned, finalChoiceIndex);

    setPendingFateData({ years, choiceIndex: finalChoiceIndex, isObserver: currentIsObserver, wasStartingObserver });
    
    try {
      const result = await generateFateOutcome(gameState, finalChoiceIndex, years, currentIsObserver, preCalculatedData);
      
      if (result.newEra) {
        showEraText(result.newEra.description);
      }

      setGameState(prev => ({ ...prev, pendingResult: result }));
      if (result.accelerationBonus && !currentIsObserver) {
        setShowBonusChoiceModal(true);
      }
      setIsGenerating(false);
      setPendingFateData(null);
    } catch (error: any) {
      console.error('Fate generation failed:', error);
      const errorStr = JSON.stringify(error);
      const isQuota = error?.message?.includes('429') || error?.status === 429 || errorStr.includes('429') || errorStr.includes('RESOURCE_EXHAUSTED') || errorStr.includes('rate limit');
      if (isQuota) {
        setIsQuotaExceeded(true);
        setFateLoadingCountdown(10); // Wait 10 seconds for retry
      } else {
        // Use fallback immediately for other errors
        const fallbackResult = generateFallbackFateOutcome(gameState, selectedChoiceIndex, years, preCalculatedData);
        // Ensure fallback also respects pre-calculated data if possible, 
        // but fallback usually generates its own. 
        // For now, let's just use the fallback as is, or update it too.
        setGameState(prev => ({ ...prev, pendingResult: fallbackResult }));
        setIsGenerating(false);
        setPendingFateData(null);
      }
    } finally {
      setIsGenerationInProgress(false);
    }
  };

  const handleApplyResult = (withBonus: boolean, skipBonus: boolean = false) => {
    if (gameState.pendingResult?.newEra) {
      showEraText(gameState.pendingResult.newEra.description);
    }
    applyPendingResult(withBonus, selectedYearsToPass, skipBonus);
    setShowBonusChoiceModal(false);
    setShowBonusModal(false);
    
    // Navigate to fate and scroll to top
    navigate('/fate');
    setTimeout(() => {
      const element = document.getElementById('current-situation');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
  };

  const handleBonusComplete = () => {
    setShowBonusModal(false);
  };

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeSection]);

  const handleBuy = (type: 'years' | 'prayers', amount: number) => {
    setGameState(prev => ({
      ...prev,
      availableYears: type === 'years' ? prev.availableYears + amount : prev.availableYears,
      prayers: type === 'prayers' ? prev.prayers + amount : prev.prayers
    }));
    setShowShopModal(false);
  };

  // Observer Mode Flow
  useEffect(() => {
    if (isObserverMode && !isGenerating && !gameState.pendingResult) {
      const yearsRequired = gameState.observerYearsToDeduct || 1;
      
      // Just wait for years to accumulate, don't turn off
      if (gameState.availableYears < yearsRequired) {
        return;
      }

      const randomChoice = Math.floor(Math.random() * gameState.choices.length);
      setSelectedChoiceIndex(randomChoice);
      handleFateChoice(yearsRequired, randomChoice);
    }
  }, [isObserverMode, isGenerating, gameState.pendingResult, gameState.availableYears, gameState.choices.length, gameState.observerYearsToDeduct]);

  // Auto-apply result in Observer Mode
  useEffect(() => {
    if (isObserverMode && gameState.pendingResult && !isGenerating) {
      const timer = setTimeout(() => {
        applyPendingResult(false, selectedYearsToPass);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isObserverMode, gameState.pendingResult, isGenerating, applyPendingResult, selectedYearsToPass]);

  return (
    <div className="relative min-h-screen flex flex-col items-center text-white overflow-x-hidden custom-scrollbar">
      <SpaceBackground />

      <AnimatePresence>
        {isGeneratingEra && (
          <motion.div 
            key="modal-generating-era"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/60 flex flex-col items-center justify-center p-8 text-center backdrop-blur-md"
          >
            <SpaceBackground />
            <div className="absolute top-12 right-12 font-mono text-4xl text-gold/20">
              {eraLoadingCountdown}s
            </div>
            
            <motion.div
              animate={{ 
                rotate: 360,
                scale: [1, 1.1, 1],
                filter: ["drop-shadow(0 0 20px rgba(212,175,55,0.3))", "drop-shadow(0 0 60px rgba(212,175,55,0.7))", "drop-shadow(0 0 20px rgba(212,175,55,0.3))"]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="w-40 h-40 mb-16 relative"
            >
              <img src="https://i.ibb.co/VW4W5PQs/Ciivbut.png" alt="Loading" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 rounded-full border-2 border-gold/20 border-t-gold animate-spin" />
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentPhraseIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-8"
              >
                <h2 className="text-2xl font-light text-gold glow-gold mb-2 uppercase tracking-widest">
                  {setupPlanet?.loadingPhrases?.[currentPhraseIndex] || "Формирование первой эпохи..."}
                </h2>
              </motion.div>
            </AnimatePresence>

            <div className="w-full max-w-md bg-white/5 h-1 rounded-full overflow-hidden mb-4">
              <motion.div 
                className="h-full bg-gold shadow-[0_0_10px_rgba(212,175,55,0.5)]"
                initial={{ width: "0%" }}
                animate={{ width: `${((60 - eraLoadingCountdown) / 60) * 100}%` }}
                transition={{ duration: 1, ease: "linear" }}
              />
            </div>

            <p className="text-white/40 font-mono text-[10px] uppercase tracking-[0.3em]">
              Инициализация мира {setupPlanet?.name}
            </p>

            {isQuotaExceeded && (
              <p className="mt-4 text-red-400 font-mono text-[10px] uppercase tracking-widest animate-pulse">
                Превышена квота API. Ожидание восстановления...
              </p>
            )}

            {eraGenerationFailed && (
              <div className="flex flex-col gap-4 mt-12">
                <motion.button 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => {
                    setEraGenerationAttempts(1);
                    setEraLoadingCountdown(60);
                    setEraGenerationFailed(false);
                    setIsQuotaExceeded(false);
                    handleSetupDone(pendingSetupData?.planet, pendingSetupData?.race);
                  }}
                  className="px-8 py-3 bg-gold text-black rounded-xl font-mono text-[10px] uppercase tracking-widest font-bold hover:bg-white transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                >
                  Повторить попытку
                </motion.button>
                <motion.button 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={handleSkipEraGeneration}
                  className="px-8 py-3 bg-white/10 text-white/60 border border-white/10 rounded-xl font-mono text-[10px] uppercase tracking-widest font-bold hover:bg-white/20 transition-all"
                >
                  Пропустить и начать игру
                </motion.button>
              </div>
            )}

            {eraGenerationAttempts === 2 && !eraGenerationFailed && (
              <p className="mt-8 text-gold/60 font-mono text-[8px] uppercase tracking-widest animate-pulse">
                Повторная попытка генерации...
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {location.pathname === '/setup' ? (
        <SetupPage 
          onDone={handleSetupDone} 
          gameState={gameState} 
          onPreviewPlanet={setPreviewPlanet} 
          onPreviewRace={setPreviewRace} 
          onSelectPlanet={setSetupPlanet} 
        />
      ) : gameState.population <= 0 ? (
        <div className="h-screen flex flex-col items-center justify-center p-8 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="z-10">
            <Skull size={80} className="text-red-500 mb-8 mx-auto" />
            <h1 className="text-5xl font-light text-white mb-4">Цивилизация погибла</h1>
            <p className="text-white/40 mb-12 max-w-md mx-auto">Ваш народ не смог пережить испытания судьбы. История {gameState.race.name} на планете {gameState.planet.name} подошла к концу.</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-12 py-4 bg-gold text-black rounded-full font-mono uppercase tracking-widest font-bold hover:bg-white transition-all"
            >
              Начать заново
            </button>
          </motion.div>
        </div>
      ) : (
        <>

      {isObserverMode && (
        <ObserverControls 
          isHidden={gameState.isObserverHidden}
          onToggleHide={() => setGameState(prev => ({ ...prev, isObserverHidden: !prev.isObserverHidden }))}
          onTurnOff={() => {
            setIsObserverMode(false);
            setGameState(prev => ({ ...prev, isObserverHidden: false }));
          }}
        />
      )}

      {/* Header Stats */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-md border-b border-white/10 px-4 md:px-8 py-3 md:py-5 rounded-b-[10px] flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
        {/* PC Left Section */}
        <div className="hidden md:flex items-center gap-8">
          <div className="flex flex-col">
            <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest">Планета</span>
            <span className="text-xs font-mono text-gold uppercase">{gameState.planet.name}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest">Раса</span>
            <span className="text-xs font-mono text-gold uppercase">{gameState.race.name}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest">Совместимость</span>
            <span className="text-xs font-mono text-yellow-400">{gameState.compatibility}%</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest">Стабильность</span>
            <span className="text-xs font-mono text-green-400">{gameState.stability}%</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest">Эра</span>
            <span className="text-xs font-mono text-gold uppercase">{gameState.era}</span>
          </div>
        </div>

        {/* PC Center Navigation - Removed from header */}
        <div className="hidden md:block" />

        {/* PC Right Section */}
        <div className="hidden md:flex items-center gap-8">
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest">Год Эпохи</span>
            <span className="text-xs font-mono text-gold">{gameState.eraYear}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest">Всего лет</span>
            <span className="text-xs font-mono text-gold">{gameState.year}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest">Население</span>
            <span className="text-xs font-mono text-gold">
              {gameState.population >= 1000000 ? (gameState.population / 1000000).toFixed(2) + 'M' : gameState.population.toLocaleString()}
            </span>
          </div>
          <div className="flex flex-col items-end cursor-pointer" onClick={() => setShowShopModal(true)}>
            <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest">Лет в работе</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-gold">{gameState.availableYears}</span>
              <div className="w-8 h-8 relative">
                <CircularProgress progress={( (60 - secondsToNextYear) / 60) * 100} size={32} />
                <span className="absolute inset-0 flex items-center justify-center text-[8px] font-mono text-gold/60">{secondsToNextYear}s</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end cursor-pointer" onClick={() => setShowShopModal(true)}>
            <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest">Молитвы</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-gold">{gameState.prayers}</span>
              <div className="w-8 h-8 relative">
                <CircularProgress progress={( (300 - secondsToNextPrayer) / 300) * 100} size={32} />
                <span className="absolute inset-0 flex items-center justify-center text-[8px] font-mono text-gold/60">{secondsToNextPrayer}s</span>
              </div>
            </div>
          </div>
          <button onClick={() => navigate('/history')} className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-gold/10 hover:border-gold/30 transition-all text-gold">
            <HistoryIcon size={20} />
          </button>
          <button onClick={() => navigate('/profile')} className={`p-2 rounded-xl border transition-all ${activeSection === 'profile' ? 'bg-gold/20 border-gold text-gold' : 'bg-white/5 border-white/10 text-white/40 hover:text-white'}`}>
            <Users size={20} />
          </button>
        </div>

        {/* Mobile Header Layout */}
        <div className="flex md:hidden items-center justify-between w-full gap-2">
          <div className="flex flex-col items-center">
            <span className="text-[7px] font-mono text-white/40 uppercase tracking-widest">Планета</span>
            <span className="text-[10px] font-mono text-gold uppercase">{gameState.planet.name}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[7px] font-mono text-white/40 uppercase tracking-widest">Раса</span>
            <span className="text-[10px] font-mono text-gold uppercase">{gameState.race.name}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[7px] font-mono text-white/40 uppercase tracking-widest">Год Эпохи</span>
            <span className="text-[10px] font-mono text-gold">{gameState.eraYear}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[7px] font-mono text-white/40 uppercase tracking-widest">Всего лет</span>
            <span className="text-[10px] font-mono text-gold">{gameState.year}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[7px] font-mono text-white/40 uppercase tracking-widest">Население</span>
            <span className="text-[10px] font-mono text-gold">
              {gameState.population >= 1000000 ? (gameState.population / 1000000).toFixed(1) + 'M' : gameState.population.toLocaleString()}
            </span>
          </div>
          <button onClick={() => navigate('/history')} className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-gold">
            <HistoryIcon size={14} />
          </button>
          <button onClick={() => navigate('/profile')} className={`p-1.5 rounded-lg border transition-all ${activeSection === 'profile' ? 'bg-gold/20 border-gold text-gold' : 'bg-white/5 border-white/10 text-white/40'}`}>
            <Users size={14} />
          </button>
        </div>

        <div className="flex md:hidden items-center justify-between w-full gap-2 border-t border-white/5 pt-2">
          <div className="flex flex-col items-center">
            <span className="text-[7px] font-mono text-white/40 uppercase tracking-widest">Эра</span>
            <span className="text-[10px] font-mono text-gold uppercase">{gameState.era}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[7px] font-mono text-white/40 uppercase tracking-widest">Стаб</span>
            <span className="text-[10px] font-mono text-green-400">{gameState.stability}%</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[7px] font-mono text-white/40 uppercase tracking-widest">Совм</span>
            <span className="text-[10px] font-mono text-yellow-400">{gameState.compatibility}%</span>
          </div>
          <div className="flex flex-col items-center cursor-pointer" onClick={() => setShowShopModal(true)}>
            <span className="text-[7px] font-mono text-white/40 uppercase tracking-widest">Лет в работе</span>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-mono text-gold">{gameState.availableYears}</span>
              <div className="w-5 h-5 relative">
                <CircularProgress progress={( (60 - secondsToNextYear) / 60) * 100} size={20} />
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center cursor-pointer" onClick={() => setShowShopModal(true)}>
            <span className="text-[7px] font-mono text-white/40 uppercase tracking-widest">Молитвы</span>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-mono text-gold">{gameState.prayers}</span>
              <div className="w-5 h-5 relative">
                <CircularProgress progress={( (300 - secondsToNextPrayer) / 300) * 100} size={20} />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl px-4 md:px-6 pt-40 md:pt-48 pb-48 flex flex-col items-center">
        <AnimatePresence mode="wait">
          <Routes location={location}>
            <Route path="/setup" element={<SetupPage onDone={handleSetupDone} gameState={gameState} onPreviewPlanet={setPreviewPlanet} onPreviewRace={setPreviewRace} onSelectPlanet={setSetupPlanet} />} />
            <Route path="/genesis" element={
              <GenesisPage 
                gameState={gameState} 
                setActiveSection={(section) => navigate(`/${section}`)}
                setShowWorldModal={setShowWorldModal}
                setShowRaceModal={setShowRaceModal}
                handleStatClick={handleStatClick}
                handleStatHide={handleStatHide}
                setFullscreenImage={setFullscreenImage}
                onOpenArchives={() => navigate('/history')}
                applyPendingEra={applyPendingEra}
              />
            } />
            <Route path="/fate" element={
              <FatePage 
                gameState={gameState}
                isObserverMode={isObserverMode}
                setIsObserverMode={(val) => {
                  if (val) {
                    setIsStartingObserver(true);
                    setSelectedChoiceIndex(Math.floor(Math.random() * gameState.choices.length));
                    setShowYearSelectionModal(true);
                  } else {
                    setIsObserverMode(false);
                  }
                }}
                isGenerating={isGenerating}
                setSelectedChoiceIndex={setSelectedChoiceIndex}
                setShowYearSelectionModal={setShowYearSelectionModal}
                setSelectedYearsToPass={setSelectedYearsToPass}
                setGameState={setGameState}
              />
            } />
            <Route path="/tree" element={
              <TreePage 
                gameState={gameState} 
                onFateClick={() => navigate('/fate')}
                onBonusClick={() => setShowBonusModal(true)}
                onEraClick={() => showEraText(gameState.eraDescription)}
              />
            } />
            <Route path="/profile" element={
              <ProfilePage 
                gameState={gameState} 
                isObserverMode={isObserverMode}
                setIsObserverMode={setIsObserverMode}
                setObserverYearsToDeduct={(years) => setGameState(prev => ({ ...prev, observerYearsToDeduct: years }))}
                resetGame={resetGame}
              />
            } />
            <Route path="/history" element={
              <Archives 
                gameState={gameState} 
                onClose={() => navigate(-1)} 
              />
            } />
            <Route path="*" element={<Navigate to="/genesis" replace />} />
          </Routes>
        </AnimatePresence>
      </main>

      {/* Footer / Navbar */}
      <div className="fixed bottom-0 left-0 right-0 z-[110] flex flex-col items-center">
        {/* Desktop Navigation Block */}
        <div className="hidden md:flex items-center gap-4 mb-[5px]">
          <button 
            onClick={() => navigate('/genesis')} 
            className={`px-8 py-3 rounded-xl border font-mono text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${
              activeSection === 'genesis' ? 'bg-gold/20 border-gold text-gold glow-gold' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
            }`}
          >
            <Globe size={14} className="text-gold" />
            Генезис
          </button>
          <button 
            onClick={() => navigate('/fate')} 
            className={`px-8 py-3 rounded-xl border font-mono text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${
              activeSection === 'fate' ? 'bg-gold/20 border-gold text-gold glow-gold' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
            }`}
          >
            <Eye size={14} className="text-gold" />
            Ткач Судеб
          </button>
          <button 
            onClick={() => navigate('/tree')} 
            className={`px-8 py-3 rounded-xl border font-mono text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${
              activeSection === 'tree' ? 'bg-gold/20 border-gold text-gold glow-gold' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
            }`}
          >
            <Leaf size={14} className="text-gold" />
            Дерево Жизни
          </button>
        </div>

        {/* Desktop Footer Text */}
        <div className="hidden md:block mb-[10px] pointer-events-none">
          <span className="text-[10px] font-mono text-white/20 uppercase tracking-[0.5em]">
            Ты не Бог, Ты — Наблюдатель
          </span>
        </div>

        {/* Mobile Navbar */}
        <nav className="md:hidden w-full bg-black/25 backdrop-blur-[2px] border-t border-white/10 rounded-t-[10px] flex flex-col items-center pt-[5px] pb-2">
          <div className="flex items-center justify-around w-full px-4 mb-[5px]">
            <button onClick={() => navigate('/genesis')} className={`flex flex-col items-center gap-1 transition-all ${activeSection === 'genesis' ? 'text-gold scale-110' : 'text-white/40'}`}>
              <Globe size={14} />
              <span className="font-mono text-[8px] uppercase tracking-widest">Генезис</span>
            </button>
            <button onClick={() => navigate('/fate')} className={`flex flex-col items-center gap-1 transition-all ${activeSection === 'fate' ? 'text-gold scale-110' : 'text-white/40'}`}>
              <Eye size={14} />
              <span className="font-mono text-[8px] uppercase tracking-widest">Ткач Судеб</span>
            </button>
            <button onClick={() => navigate('/tree')} className={`flex flex-col items-center gap-1 transition-all ${activeSection === 'tree' ? 'text-gold scale-110' : 'text-white/40'}`}>
              <Leaf size={14} />
              <span className="font-mono text-[8px] uppercase tracking-widest text-center leading-tight">Дерево Жизни</span>
            </button>
          </div>
          <span className="text-[8px] font-mono text-white/20 uppercase tracking-[0.3em]">
            Ты не Бог, Ты — Наблюдатель
          </span>
        </nav>
      </div>

      </>
      )}

      {/* Modals */}
      <AnimatePresence>
        {isGenerating && !gameState.isObserverHidden && (
          <motion.div 
            key="modal-generating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/60 flex flex-col items-center justify-center p-8 text-center backdrop-blur-md"
          >
            <SpaceBackground />
            <div className="absolute top-12 right-12 font-mono text-4xl text-gold/20">
              {fateLoadingCountdown}s
            </div>

            <motion.div
              animate={{ 
                rotate: 360,
                scale: [1, 1.2, 1],
                filter: ["drop-shadow(0 0 20px rgba(212,175,55,0.3))", "drop-shadow(0 0 60px rgba(212,175,55,0.7))", "drop-shadow(0 0 20px rgba(212,175,55,0.3))"]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="w-32 h-32 mb-12"
            >
              <img src="https://i.ibb.co/VW4W5PQs/Ciivbut.png" alt="Loading" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            </motion.div>
            <h2 className="text-2xl font-light text-gold glow-gold mb-4">Плетение нитей судьбы...</h2>
            <p className="text-white/40 font-mono text-[10px] uppercase tracking-[0.3em]">
              Просчитываем {selectedYearsToPass} {selectedYearsToPass === 1 ? 'год' : 'лет'} истории
            </p>

            {isQuotaExceeded && (
              <p className="mt-4 text-red-400 font-mono text-[10px] uppercase tracking-widest animate-pulse">
                Превышена квота API. Ожидание восстановления...
              </p>
            )}

            {fateGenerationFailed && (
              <div className="flex flex-col gap-4 mt-12">
                <motion.button 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => {
                    setFateGenerationAttempts(1);
                    setFateLoadingCountdown(60);
                    setFateGenerationFailed(false);
                    setIsQuotaExceeded(false);
                    handleFateChoice(selectedYearsToPass);
                  }}
                  className="px-8 py-3 bg-gold text-black rounded-xl font-mono text-[10px] uppercase tracking-widest font-bold hover:bg-white transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                >
                  Повторить попытку
                </motion.button>
                <motion.button 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => {
                    if (pendingFateData?.wasStartingObserver) {
                      setIsObserverMode(false);
                      setGameState(prev => ({ ...prev, observerYearsToDeduct: 0 }));
                    }
                    setIsGenerating(false);
                    setFateGenerationFailed(false);
                    setPendingFateData(null);
                  }}
                  className="px-8 py-3 bg-white/10 text-white/60 border border-white/10 rounded-xl font-mono text-[10px] uppercase tracking-widest font-bold hover:bg-white/20 transition-all"
                >
                  Вернуться назад
                </motion.button>
              </div>
            )}

            {fateGenerationAttempts === 2 && !fateGenerationFailed && (
              <p className="mt-8 text-gold/60 font-mono text-[8px] uppercase tracking-widest animate-pulse">
                Повторная попытка генерации...
              </p>
            )}
          </motion.div>
        )}

        {showYearSelectionModal && !gameState.isObserverHidden && (
          <YearSelectionModal 
            key="modal-year-selection"
            availableYears={gameState.availableYears}
            onSelect={handleFateChoice}
            onClose={() => {
              setShowYearSelectionModal(false);
              setIsStartingObserver(false);
            }}
            isObserver={isStartingObserver}
          />
        )}

        {gameState.pendingResult && !showBonusChoiceModal && !showBonusModal && !gameState.isObserverHidden && (
          <ResultModal 
            key="modal-result"
            result={gameState.pendingResult}
            isObserverMode={isObserverMode}
            gameState={gameState}
            onApply={(withBonus) => {
              handleApplyResult(withBonus);
            }}
          />
        )}

        {showBonusChoiceModal && gameState.pendingResult?.accelerationBonus && !gameState.isObserverHidden && (
          <BonusChoiceModal 
            key="modal-bonus-choice"
            bonus={gameState.pendingResult.accelerationBonus}
            prayers={gameState.prayers}
            onSkip={() => setShowBonusChoiceModal(false)}
            onUse={() => {
              setGameState(prev => ({
                ...prev,
                accelerationBonus: gameState.pendingResult!.accelerationBonus,
                bonusTaps: 0,
                isBonusEarned: false
              }));
              setShowBonusChoiceModal(false);
              setShowBonusModal(true);
            }}
          />
        )}

        {showShopModal && !gameState.isObserverHidden && (
          <ShopModal 
            key="modal-shop"
            onClose={() => setShowShopModal(false)}
            onBuy={handleBuy}
          />
        )}

        {showChronicleModal && !gameState.isObserverHidden && (
          <ChronicleModal 
            key="modal-chronicle"
            chronicles={gameState.chronicles}
            onClose={() => setShowChronicleModal(false)}
          />
        )}

        {showBonusModal && gameState.accelerationBonus && !gameState.isObserverHidden && (
          <BonusModal 
            key="modal-bonus-activation"
            bonus={gameState.accelerationBonus}
            taps={gameState.bonusTaps}
            prayers={gameState.prayers}
            onTap={handleTap}
            onClose={() => {
              setShowBonusModal(false);
              setGameState(prev => ({ ...prev, accelerationBonus: null }));
            }}
            onComplete={handleBonusComplete}
          />
        )}

        {eraTypewriterText && !gameState.isObserverHidden && (
          <Modal key="modal-era-text" onClose={() => setEraTypewriterText(null)} title={`Новая эра: ${gameState.era}`}>
            <div className="space-y-6">
              <div className="p-6 bg-white/5 rounded-2xl border border-white/10 max-h-[60vh] overflow-y-auto custom-scrollbar">
                <p className="text-white/80 leading-relaxed whitespace-pre-line">
                  <Typewriter 
                    text={eraTypewriterText} 
                    speed={30} 
                    onComplete={() => setIsEraTypewriterComplete(true)} 
                    skip={isEraTypewriterSkipped}
                  />
                </p>
              </div>
              <button
                onClick={() => {
                  if (isEraTypewriterComplete || isEraTypewriterSkipped) {
                    setEraTypewriterText(null);
                  } else {
                    setIsEraTypewriterSkipped(true);
                  }
                }}
                className="w-full py-4 bg-gold text-black rounded-xl font-mono uppercase tracking-widest text-sm font-bold hover:bg-white transition-all"
              >
                {isEraTypewriterComplete || isEraTypewriterSkipped ? 'Продолжить' : 'Пропустить'}
              </button>
            </div>
          </Modal>
        )}

        {(showWorldModal || previewPlanet) && !gameState.isObserverHidden && (
          <WorldModal
            key="modal-world"
            planet={previewPlanet || gameState.planet}
            onClose={() => { setShowWorldModal(false); setPreviewPlanet(null); }}
            onFullscreen={setFullscreenImage}
            onStatClick={handleStatClick}
            onStatHide={handleStatHide}
          />
        )}

        {(showRaceModal || previewRace) && !gameState.isObserverHidden && (
          <RaceModal
            key="modal-race"
            race={previewRace || gameState.race}
            planet={setupPlanet || gameState.planet}
            onClose={() => { setShowRaceModal(false); setPreviewRace(null); }}
            onFullscreen={setFullscreenImage}
            onStatClick={handleStatClick}
            onStatHide={handleStatHide}
            compatibility={previewRace 
              ? getCompatibility(previewRace.habitat, setupPlanet?.habitat || gameState.planet.habitat) 
              : gameState.compatibility}
          />
        )}

        {fullscreenImage && (
          <FullscreenImage 
            key="modal-fullscreen-image"
            src={fullscreenImage.src} 
            alt={fullscreenImage.alt} 
            onClose={() => setFullscreenImage(null)} 
          />
        )}

        {statInfoWindow && (
          <StatInfoWindow 
            key="modal-stat-info"
            info={statInfoWindow} 
            onClose={() => setStatInfoWindow(null)} 
          />
        )}

        {isInactive && (
          <InactivityOverlay 
            onContinue={() => {
              setLastClickTime(Date.now());
              setIsInactive(false);
            }} 
          />
        )}

        {showArchives && (
          <Archives 
            gameState={gameState} 
            onClose={() => setShowArchives(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
