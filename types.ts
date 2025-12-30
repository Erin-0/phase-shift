
export enum Phase {
  BLUE = 'BLUE',
  ORANGE = 'ORANGE'
}

export enum GameStatus {
  START = 'START',
  PLAYING = 'PLAYING',
  GAMEOVER = 'GAMEOVER',
  SHOP = 'SHOP'
}

export enum PowerUpType {
  MAGNET = 'MAGNET',
  SLOW_MO = 'SLOW_MO',
  GHOST = 'GHOST'
}

export interface Obstacle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  phase: Phase;
  passed: boolean;
}

export interface Collectible {
  id: string;
  x: number;
  y: number;
  type: 'STAR' | 'POWERUP';
  subType?: PowerUpType;
  collected: boolean;
}

export interface Theme {
  id: string;
  name: string;
  price: number;
  playerColor: string;
  glowColor: string;
  description: string;
}

export interface Mission {
  id: string;
  description: string;
  target: number;
  progress: number;
  completed: boolean;
  reward: number;
  type: 'SCORE' | 'STARS' | 'DISTANCE' | 'PHASE_SWITCH' | 'NO_GLITCH';
}

export interface UserProfile {
  uid: string;
  username: string;
  email: string;
  photoBase64?: string;
  highScore: number;
  stars: number;
  ownedThemes: string[];
  activeThemeId: string;
  missions: Mission[];
  lastLogin: string; // ISO Date string
}

export interface GameState {
  status: GameStatus;
  score: number;
  highScore: number;
  stars: number;
  // Track stars collected in the current/last run
  lastRunStars: number;
  currentPhase: Phase;
  speed: number;
  distance: number;
  combo: number;
  activePowerUp: PowerUpType | null;
}export const FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

