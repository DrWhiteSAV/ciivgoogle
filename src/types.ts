import React from 'react';
import { PLANETS, RACES } from './constants';

export type Section = 'genesis' | 'fate' | 'tree';

export interface Tech {
  id: string;
  name: string;
  icon: React.ReactNode;
  duration: number; // in seconds
  startTime: number | null;
  completed: boolean;
}

export interface Skill {
  id: string;
  name: string;
  desc: string;
  year: number;
  type: 'progress' | 'regress';
}

export interface AccelerationBonus {
  name: string;
  desc: string;
  tapsRequired: number;
}

export interface Habitat {
  temp: number;
  grav: number;
  atmo: number;
  rad: number;
  humi: number;
  res: number;
}

export interface GameState {
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

export interface Era {
  name: string;
  minYear: number;
  minPop: number;
}
