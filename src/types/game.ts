import React from 'react';
import { PLANETS, RACES } from '../config/constants';

export type Section = 'genesis' | 'fate' | 'tree';

export interface Tech {
  id: string;
  name: string;
  icon: React.ReactNode;
  duration: number;
  startTime: number | null;
  completed: boolean;
}

export interface Skill {
  id: string;
  name: string;
  desc: string;
  year: number;
  era: string;
  type: 'progress' | 'regress';
}

export interface AccelerationBonus {
  name: string;
  desc: string;
  prayerText?: string;
  tapsRequired: number;
  yearsToPass: number;
}

export interface EraInfo {
  name: string;
  description: string;
  yearReached: number;
  yearsPassed: number;
  population: number;
  progressCount: number;
  regressCount: number;
  skills: Skill[];
  ideology: string;
  externalContacts: string[];
  soundscape: string;
  victoryProgress: number;
}

export interface ChronicleEntry {
  id: string;
  year: number;
  eraYear: number;
  event: string;
  population: number;
  growthPercent: number;
  oldPopulation?: number;
  era?: string;
  choiceTitle?: string;
  prayersUsed?: boolean;
  originalGrowthPercent?: number;
}

export interface PreCalculatedOutcome {
  year: number;
  isSuccess: boolean;
  growthPercent: number;
  originalGrowthPercent?: number;
  prayersUsed?: boolean;
}

export interface Hero {
  id: string;
  name: string;
  title: string;
  bio: string;
  yearBorn: number;
  era: string;
}

export interface Relic {
  id: string;
  name: string;
  description: string;
  yearFound: number;
  era: string;
  type: 'artifact' | 'relic';
}

export interface GameState {
  planet: typeof PLANETS[0];
  race: typeof RACES[0];
  year: number;
  population: number;
  era: string;
  eraDescription: string;
  eraYear: number;
  pendingEra: any | null;
  pastEras: EraInfo[];
  history: string[];
  availableYears: number;
  chronicles: ChronicleEntry[];
  currentSituation: string;
  choices: { id: string; title: string; desc: string }[];
  skills: Skill[];
  accelerationBonus: AccelerationBonus | null;
  bonusTaps: number;
  isBonusActive: boolean;
  pendingResult: any | null;
  stability: number;
  compatibility: number;
  prayers: number;
  prayerRegenSeconds: number;
  observerYearsToDeduct: number;
  isObserverHidden: boolean;
  isBonusEarned: boolean;
  isObserverMode: boolean;
  // New Narrative Features
  heroes: Hero[];
  relics: Relic[];
  ideology: string;
  externalContacts: string[];
  victoryProgress: number;
  currentSoundscape: string;
}
