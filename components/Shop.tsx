
import React from 'react';
import { THEMES } from '../constants';
import { Theme } from '../types';

interface ShopProps {
  stars: number;
  ownedThemes: string[];
  activeThemeId: string;
  onClose: () => void;
  onPurchase: (theme: Theme) => void;
  onSelect: (id: string) => void;
}

const Shop: React.FC<ShopProps> = ({ stars, ownedThemes, activeThemeId, onClose, onPurchase, onSelect }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-black/95 p-6 overflow-y-auto">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-4xl md:text-6xl font-orbitron font-black text-white italic">DIMENSION SHOP</h2>
          <div className="px-6 py-3 bg-[#ffd700] text-black font-black font-orbitron text-xl">STARS: {stars}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {THEMES.map(theme => {
            const isOwned = ownedThemes.includes(theme.id);
            const isActive = activeThemeId === theme.id;
            const canAfford = stars >= theme.price;

            return (
              <div 
                key={theme.id}
                className={`p-6 border-2 transition-all ${isActive ? 'border-[#00f2ff] bg-white/5' : 'border-gray-800'}`}
              >
                <div 
                  className="w-full h-24 mb-4 flex items-center justify-center border border-gray-700 bg-black"
                  style={{ boxShadow: `inset 0 0 20px ${theme.glowColor}22` }}
                >
                  <div className="w-12 h-12" style={{ backgroundColor: theme.playerColor, boxShadow: `0 0 20px ${theme.glowColor}` }}></div>
                </div>
                <h3 className="text-xl font-orbitron font-bold text-white mb-2">{theme.name}</h3>
                <p className="text-gray-500 text-xs mb-4 h-8">{theme.description}</p>
                
                {isActive ? (
                  <div className="w-full py-2 bg-[#00f2ff] text-black text-center font-bold font-orbitron text-sm">ACTIVE</div>
                ) : isOwned ? (
                  <button 
                    onClick={() => onSelect(theme.id)}
                    className="w-full py-2 border border-white text-white hover:bg-white hover:text-black transition-colors font-bold font-orbitron text-sm"
                  >
                    SELECT
                  </button>
                ) : (
                  <button 
                    disabled={!canAfford}
                    onClick={() => onPurchase(theme)}
                    className={`w-full py-2 font-bold font-orbitron text-sm ${canAfford ? 'bg-white text-black hover:bg-[#ffd700]' : 'bg-gray-800 text-gray-500'}`}
                  >
                    BUY: {theme.price}★
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <button 
          onClick={onClose}
          className="mt-12 px-12 py-4 border-2 border-white text-white font-orbitron font-black hover:bg-white hover:text-black transition-all"
        >
          BACK TO CORE
        </button>
      </div>
    </div>
  );
};

export default Shop;
