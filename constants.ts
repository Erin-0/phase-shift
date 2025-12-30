
import { Phase, Theme } from './types';

export const COLORS = {
  [Phase.BLUE]: '#00f2ff',
  [Phase.ORANGE]: '#ff8c00',
  PLAYER: '#ffffff',
  GRID: '#1a1a1a',
  BG: '#050505',
  STAR: '#ffd700',
  POWERUP: '#ff00ff'
};

export const THEMES: Theme[] = [
  { id: 'classic', name: 'Classic Neon', price: 0, playerColor: '#ffffff', glowColor: '#ffffff', description: 'The original digital frontier.' },
  { id: 'cyber', name: 'Cyber Rogue', price: 50, playerColor: '#ff0055', glowColor: '#ff0055', description: 'Aggressive pink aesthetics.' },
  { id: 'emerald', name: 'Emerald Flux', price: 150, playerColor: '#00ff88', glowColor: '#00ff88', description: 'Stable green matrix flow.' },
  { id: 'void', name: 'Void Walker', price: 300, playerColor: '#8a2be2', glowColor: '#8a2be2', description: 'The deepest purple of the digital void.' },
  { id: 'gold', name: 'Pure Gold', price: 500, playerColor: '#ffd700', glowColor: '#ffd700', description: 'Reserved for the elite sync-runners.' }
];

export const GAME_CONFIG = {
  INITIAL_SPEED: 7, // Reduced from 8
  SPEED_INCREMENT: 0.01, // Adjusted to match new logic (was 0.0008 but unused)
  MAX_SPEED: 20, // Reduced from 32
  PLAYER_X_PERCENT: 0.15,
  PLAYER_SIZE: 40,
  OBSTACLE_WIDTH: 50,
  OBSTACLE_HEIGHT: 80,
  MIN_OBSTACLE_GAP: 400, // Increased from 350
  MAX_OBSTACLE_GAP: 700, // Increased from 650
  GROUND_Y_PERCENT: 0.65,
  GRAVITY: 0.8,
  JUMP_FORCE: -16,
  DIFFICULTY_STEPS: {
    CLUSTER_START: 50, // Delayed
    TRIPLE_START: 100, // Delayed
    RAPID_PHASE: 150   // Delayed
  },
  POWERUP_DURATION: 8000,
  STAR_SPAWN_CHANCE: 0.6,
  POWERUP_SPAWN_CHANCE: 0.08
};
