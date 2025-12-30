
import React from 'react';
import { Phase, PowerUpType } from '../types';
import { COLORS } from '../constants';

interface HUDProps {
  score: number;
  highScore: number;
  phase: Phase;
  stars: number;
  combo: number;
  activePowerUp: PowerUpType | null;
}

const HUD: React.FC<HUDProps> = ({ score, highScore, phase, stars, combo, activePowerUp }) => {
  return (
    <div className="absolute top-0 left-0 w-full p-4 md:p-8 flex justify-between items-start pointer-events-none z-30 select-none">
      <div className="flex flex-col gap-2">
        <div className="text-4xl md:text-6xl font-orbitron font-black text-white leading-none">
          {score.toString().padStart(4, '0')}
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-[#ffd700] text-black font-black font-orbitron text-sm rounded">
            STARS: {stars}
          </div>
          {combo > 1 && (
            <div className="px-3 py-1 bg-white text-black font-black font-orbitron text-sm rounded animate-pulse">
              X{combo} COMBO
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col items-end gap-3">
        <div className="flex items-center gap-4">
          <div className={`px-4 py-2 border-2 transition-all duration-300 font-orbitron text-xs font-bold ${phase === Phase.BLUE ? 'bg-[#00f2ff] text-black border-[#00f2ff]' : 'opacity-20 text-[#00f2ff] border-[#00f2ff]'}`}>BLUE</div>
          <div className={`px-4 py-2 border-2 transition-all duration-300 font-orbitron text-xs font-bold ${phase === Phase.ORANGE ? 'bg-[#ff8c00] text-black border-[#ff8c00]' : 'opacity-20 text-[#ff8c00] border-[#ff8c00]'}`}>ORANGE</div>
        </div>
        {activePowerUp && (
          <div className="px-4 py-2 bg-[#ff00ff] text-white font-orbitron font-bold text-xs rounded animate-bounce">
            SYSTEM BOOST: {activePowerUp}
          </div>
        )}
      </div>
    </div>
  );
};

export default HUD;
