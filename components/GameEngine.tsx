
import React, { useEffect, useRef, useCallback } from 'react';
import { GameStatus, Phase, Obstacle, Collectible, PowerUpType, Theme } from '../types';
import { COLORS, GAME_CONFIG } from '../constants';

interface GameEngineProps {
  status: GameStatus;
  currentPhase: Phase;
  theme: Theme;
  jumpTrigger: number;
  onGameOver: (score: number, starsCollected: number) => void;
  onScoreUpdate: (score: number, combo: number, powerUp: PowerUpType | null) => void;
  onJump: () => void;
  onTogglePhase: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

const GameEngine: React.FC<GameEngineProps> = ({ status, currentPhase, theme, jumpTrigger, onGameOver, onScoreUpdate, onJump, onTogglePhase }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | undefined>(undefined);

  const jumpCountRef = useRef(0);
  const isMobile = useRef(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));

  const scoreRef = useRef(0);
  const comboRef = useRef(1);
  const starsCollectedRef = useRef(0);
  const speedRef = useRef(GAME_CONFIG.INITIAL_SPEED);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const collectiblesRef = useRef<Collectible[]>([]);
  const lastSpawnXRef = useRef(0);
  const distanceRef = useRef(0);
  const glitchIntensityRef = useRef(0);
  const frameCountRef = useRef(0);
  const particlesRef = useRef<Particle[]>([]);
  const cameraShakeRef = useRef(0);
  const activePowerUpRef = useRef<PowerUpType | null>(null);
  const powerUpTimerRef = useRef(0);
  const lastPhaseRef = useRef<Phase>(currentPhase);
  const phaseFlashRef = useRef(0);

  // Jump physics refs
  const playerYRef = useRef(0);
  const playerVYRef = useRef(0);
  const isGroundedRef = useRef(true);

  const initGame = useCallback(() => {
    scoreRef.current = 0;
    comboRef.current = 1;
    starsCollectedRef.current = 0;
    speedRef.current = GAME_CONFIG.INITIAL_SPEED;
    obstaclesRef.current = [];
    collectiblesRef.current = [];
    distanceRef.current = 0;
    lastSpawnXRef.current = window.innerWidth;
    glitchIntensityRef.current = 0;
    particlesRef.current = [];
    cameraShakeRef.current = 0;
    activePowerUpRef.current = null;
    powerUpTimerRef.current = 0;
    playerYRef.current = 0;
    playerVYRef.current = 0;
    isGroundedRef.current = true;
    jumpCountRef.current = 0;
    phaseFlashRef.current = 0;
  }, []);

  // Detect phase change for "Juice" effects
  useEffect(() => {
    if (status === GameStatus.PLAYING && lastPhaseRef.current !== currentPhase) {
      cameraShakeRef.current = 15;
      glitchIntensityRef.current = 1.0;
      phaseFlashRef.current = 1.0;

      // Spawn explosion particles
      const px = window.innerWidth * GAME_CONFIG.PLAYER_X_PERCENT;
      const py = playerYRef.current || (window.innerHeight * GAME_CONFIG.GROUND_Y_PERCENT - GAME_CONFIG.PLAYER_SIZE);
      for (let i = 0; i < 20; i++) {
        particlesRef.current.push({
          x: px + 20,
          y: py + 20,
          vx: (Math.random() - 0.5) * 15,
          vy: (Math.random() - 0.5) * 15,
          life: 1.0,
          color: COLORS[currentPhase]
        });
      }
    }
    lastPhaseRef.current = currentPhase;
  }, [currentPhase, status]);

  // Handle jump signal
  useEffect(() => {
    if (status === GameStatus.PLAYING && jumpCountRef.current < 2) {
      playerVYRef.current = GAME_CONFIG.JUMP_FORCE;
      jumpCountRef.current += 1;
      isGroundedRef.current = false;

      // Dust particles
      const px = window.innerWidth * GAME_CONFIG.PLAYER_X_PERCENT;
      const py = playerYRef.current;
      for (let i = 0; i < 10; i++) {
        particlesRef.current.push({
          x: px + 20,
          y: py + 40,
          vx: (Math.random() - 0.5) * 5,
          vy: (Math.random() - 0.5) * 2,
          life: 0.8,
          color: theme.playerColor
        });
      }
    }
  }, [jumpTrigger, status, theme.playerColor]);

  useEffect(() => {
    if (status === GameStatus.PLAYING) initGame();
  }, [status, initGame]);

  const update = (width: number, height: number) => {
    if (status !== GameStatus.PLAYING) return;

    frameCountRef.current++;
    const playerX = width * GAME_CONFIG.PLAYER_X_PERCENT;
    const playerSize = GAME_CONFIG.PLAYER_SIZE;
    const groundY = height * GAME_CONFIG.GROUND_Y_PERCENT;

    // Player Jump Physics
    if (!isGroundedRef.current) {
      playerVYRef.current += GAME_CONFIG.GRAVITY;
      playerYRef.current += playerVYRef.current;

      const landingY = groundY - playerSize;
      if (playerYRef.current >= landingY) {
        playerYRef.current = landingY;
        playerVYRef.current = 0;
        isGroundedRef.current = true;
        jumpCountRef.current = 0;
      }
    } else {
      playerYRef.current = groundY - playerSize;
      jumpCountRef.current = 0;
    }

    const playerY = playerYRef.current;

    // PowerUp handling
    if (activePowerUpRef.current) {
      powerUpTimerRef.current -= 16;
      if (powerUpTimerRef.current <= 0) {
        activePowerUpRef.current = null;
        onScoreUpdate(scoreRef.current, comboRef.current, null);
      }
    }

    // Speed scaling - significantly reduced ramping to allow reaching 200+
    const baseSpeed = GAME_CONFIG.INITIAL_SPEED + (scoreRef.current * 0.02); // Was 0.1, now 0.02
    const slowMoMult = activePowerUpRef.current === PowerUpType.SLOW_MO ? 0.5 : 1.0;
    speedRef.current = Math.min(GAME_CONFIG.MAX_SPEED, baseSpeed * slowMoMult);
    distanceRef.current += speedRef.current;

    // Spawning logic
    if (width - lastSpawnXRef.current > 0) {
      // Use configured gaps instead of hardcoded 300-600
      const minGap = GAME_CONFIG.MIN_OBSTACLE_GAP;
      const maxGap = GAME_CONFIG.MAX_OBSTACLE_GAP;
      const gap = minGap + Math.random() * (maxGap - minGap);
      const newX = width + gap;

      const obs: Obstacle = {
        id: Math.random().toString(),
        x: newX,
        y: groundY - GAME_CONFIG.OBSTACLE_HEIGHT,
        width: GAME_CONFIG.OBSTACLE_WIDTH,
        height: GAME_CONFIG.OBSTACLE_HEIGHT,
        phase: Math.random() > 0.5 ? Phase.BLUE : Phase.ORANGE,
        passed: false
      };
      obstaclesRef.current.push(obs);
      lastSpawnXRef.current = newX;

      // Spawn Stars / PowerUps - adjusted heights so some require jumping ("dots at the top")
      if (Math.random() < GAME_CONFIG.STAR_SPAWN_CHANCE) {
        collectiblesRef.current.push({
          id: Math.random().toString(),
          x: newX + gap / 2,
          y: groundY - 60 - Math.random() * 200, // Increased height range
          type: Math.random() < GAME_CONFIG.POWERUP_SPAWN_CHANCE ? 'POWERUP' : 'STAR',
          subType: [PowerUpType.MAGNET, PowerUpType.SLOW_MO, PowerUpType.GHOST][Math.floor(Math.random() * 3)],
          collected: false
        });
      }
    }

    // Update Particles
    particlesRef.current = particlesRef.current.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.02;
      return p.life > 0;
    });

    // Move & Collision: Collectibles
    collectiblesRef.current = collectiblesRef.current.filter(c => {
      c.x -= speedRef.current;

      // Magnet logic
      if (activePowerUpRef.current === PowerUpType.MAGNET) {
        const dx = playerX + playerSize / 2 - c.x;
        const dy = playerY + playerSize / 2 - c.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 400) {
          c.x += dx * 0.12;
          c.y += dy * 0.12;
        }
      }

      const isColliding = (
        playerX < c.x + 20 &&
        playerX + playerSize > c.x - 20 &&
        playerY < c.y + 20 &&
        playerY + playerSize > c.y - 20
      );

      if (isColliding && !c.collected) {
        c.collected = true;
        if (c.type === 'STAR') {
          starsCollectedRef.current += 1;
        } else {
          activePowerUpRef.current = c.subType || PowerUpType.MAGNET;
          powerUpTimerRef.current = GAME_CONFIG.POWERUP_DURATION;
          onScoreUpdate(scoreRef.current, comboRef.current, activePowerUpRef.current);
          cameraShakeRef.current = 10;
        }
        return false;
      }
      return c.x > -50;
    });

    // Move & Collision: Obstacles
    obstaclesRef.current = obstaclesRef.current.filter(obs => {
      obs.x -= speedRef.current;

      const isColliding = (
        playerX < obs.x + obs.width &&
        playerX + playerSize > obs.x &&
        playerY < obs.y + obs.height &&
        playerY + playerSize > obs.y
      );

      if (isColliding) {
        if (obs.phase === currentPhase && activePowerUpRef.current !== PowerUpType.GHOST) {
          onGameOver(scoreRef.current, starsCollectedRef.current);
          return false;
        } else {
          // If ghosting through, add glitch
          glitchIntensityRef.current = Math.min(1, glitchIntensityRef.current + 0.1);
        }
      }

      if (!obs.passed && obs.x + obs.width < playerX) {
        obs.passed = true;
        comboRef.current = Math.min(10, comboRef.current + (1 / 10)); // Slightly slower combo increase
        scoreRef.current += Math.floor(1 * comboRef.current);
        onScoreUpdate(scoreRef.current, Math.floor(comboRef.current), activePowerUpRef.current);
      }

      return obs.x + obs.width > -50;
    });

    // Decay visual FX
    if (glitchIntensityRef.current > 0) glitchIntensityRef.current -= 0.05;
    if (cameraShakeRef.current > 0) cameraShakeRef.current -= 0.5;
    if (phaseFlashRef.current > 0) phaseFlashRef.current -= 0.04;

    lastSpawnXRef.current -= speedRef.current;
  };

  const draw = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.save();
    if (cameraShakeRef.current > 0) {
      ctx.translate((Math.random() - 0.5) * cameraShakeRef.current, (Math.random() - 0.5) * cameraShakeRef.current);
    }

    ctx.clearRect(0, 0, width, height);
    const groundY = height * GAME_CONFIG.GROUND_Y_PERCENT;

    // Background Phase Flash
    if (phaseFlashRef.current > 0) {
      ctx.fillStyle = COLORS[currentPhase];
      ctx.globalAlpha = phaseFlashRef.current * 0.15;
      ctx.fillRect(0, 0, width, height);
      ctx.globalAlpha = 1.0;
    }

    // Grid - Color Shift with score
    const hue = (scoreRef.current * 0.5) % 360;
    ctx.strokeStyle = `hsla(${hue}, 50%, 20%, 0.5)`;
    ctx.lineWidth = 1;
    const scroll = (distanceRef.current % 50);
    for (let x = -scroll; x < width; x += 50) {
      ctx.beginPath(); ctx.moveTo(x, groundY); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = groundY; y < height; y += (y - groundY) * 0.4 + 10) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }

    // Particles
    particlesRef.current.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, 4, 4);
    });
    ctx.globalAlpha = 1.0;

    // Collectibles
    collectiblesRef.current.forEach(c => {
      ctx.fillStyle = c.type === 'STAR' ? COLORS.STAR : COLORS.POWERUP;
      ctx.shadowBlur = 10; ctx.shadowColor = ctx.fillStyle;
      ctx.beginPath();
      if (c.type === 'STAR') {
        // Draw star shape
        const cx = c.x;
        const cy = c.y;
        const outer = 10;
        const inner = 5;
        for (let i = 0; i < 5; i++) {
          ctx.lineTo(Math.cos((18 + i * 72) / 180 * Math.PI) * outer + cx, -Math.sin((18 + i * 72) / 180 * Math.PI) * outer + cy);
          ctx.lineTo(Math.cos((54 + i * 72) / 180 * Math.PI) * inner + cx, -Math.sin((54 + i * 72) / 180 * Math.PI) * inner + cy);
        }
      }
      else ctx.fillRect(c.x - 10, c.y - 10, 20, 20);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Obstacles
    obstaclesRef.current.forEach(obs => {
      const isSolid = obs.phase === currentPhase && activePowerUpRef.current !== PowerUpType.GHOST;
      ctx.fillStyle = COLORS[obs.phase];
      ctx.globalAlpha = isSolid ? 1.0 : 0.2;

      if (isSolid) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = COLORS[obs.phase];
      }

      ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

      // Accents
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.strokeRect(obs.x + 5, obs.y + 5, obs.width - 10, obs.height - 10);

      ctx.globalAlpha = 1.0;
      ctx.shadowBlur = 0;
    });

    // Player
    const playerX = width * GAME_CONFIG.PLAYER_X_PERCENT;
    const playerSize = GAME_CONFIG.PLAYER_SIZE;
    const playerY = playerYRef.current;

    if (glitchIntensityRef.current > 0) {
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(playerX - 15 * glitchIntensityRef.current, playerY, playerSize, playerSize);
      ctx.fillStyle = '#00ffff';
      ctx.fillRect(playerX + 15 * glitchIntensityRef.current, playerY, playerSize, playerSize);
    }

    ctx.fillStyle = theme.playerColor;
    ctx.shadowBlur = 20 + (phaseFlashRef.current * 40);
    ctx.shadowColor = theme.glowColor;
    if (activePowerUpRef.current === PowerUpType.GHOST) ctx.globalAlpha = 0.5;

    // Smooth jump visual tilt
    ctx.save();
    if (!isGroundedRef.current) {
      ctx.translate(playerX + playerSize / 2, playerY + playerSize / 2);
      ctx.rotate(playerVYRef.current * 0.02);
      ctx.translate(-(playerX + playerSize / 2), -(playerY + playerSize / 2));
    }

    ctx.fillRect(playerX, playerY, playerSize, playerSize);

    // Inner details
    ctx.fillStyle = '#fff';
    ctx.fillRect(playerX + 10, playerY + 10, playerSize - 20, playerSize - 20);
    ctx.restore();

    ctx.globalAlpha = 1.0; ctx.shadowBlur = 0;
    ctx.restore();
  };

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    update(canvas.width, canvas.height);
    draw(ctx, canvas.width, canvas.height);
    requestRef.current = requestAnimationFrame(animate);
  }, [status, currentPhase, theme, jumpTrigger]);

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize); handleResize();
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [animate]);

  return (
    <>
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />

      {status === GameStatus.PLAYING && isMobile.current && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Jump Button (Bottom Left) */}
          <button
            onTouchStart={(e) => { e.preventDefault(); onJump(); }}
            className="absolute bottom-8 left-8 w-24 h-24 bg-white/10 border-4 border-white/20 rounded-full flex items-center justify-center pointer-events-auto active:scale-90 active:bg-white/30 transition-all"
          >
            <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[20px] border-b-white -mt-1"></div>
          </button>

          {/* Shift Button (Bottom Right) */}
          <button
            onTouchStart={(e) => { e.preventDefault(); onTogglePhase(); }}
            className="absolute bottom-8 right-8 w-24 h-24 bg-[#00f2ff]/10 border-4 border-[#00f2ff]/30 rounded-full flex items-center justify-center pointer-events-auto active:scale-90 active:bg-[#00f2ff]/40 transition-all"
          >
            <div className="flex gap-1">
              <div className="w-3 h-8 bg-[#00f2ff]"></div>
              <div className="w-3 h-8 bg-[#ff8c00]"></div>
            </div>
          </button>
        </div>
      )}
    </>
  );
};

export default GameEngine;
