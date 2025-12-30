import React from 'react';

interface GameOverProps {
  score: number;
  highScore: number;
  starsGained: number;
  onRestart: () => void;
  onMenu: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ score, highScore, starsGained, onRestart, onMenu }) => {
  const isNewRecord = score >= highScore && score > 0;
  // Replace with actual URL when deployed
  const shareText = `I scored ${score} points in Phase Shift! Can you beat my high score of ${highScore}? #PhaseShift #WebGame`;
  const shareUrl = window.location.href;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-black/95 animate-in fade-in zoom-in duration-300 p-6">
      <div className="text-red-500 font-orbitron text-[10px] md:text-sm font-bold tracking-[0.8em] mb-4 animate-pulse uppercase text-center">
        Critical: System De-Sync Occurred
      </div>

      <h2 className="text-5xl md:text-8xl font-orbitron font-black text-white mb-6 md:mb-12 tracking-tighter italic">
        FRACTURED
      </h2>

      <div className="grid grid-cols-3 gap-4 md:gap-8 mb-8 md:mb-16 text-center w-full max-w-2xl">
        <div className="flex flex-col border-l border-gray-800 pl-4">
          <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Yield</span>
          <span className="text-3xl md:text-5xl font-orbitron text-white leading-none">{score}</span>
        </div>
        <div className="flex flex-col border-l border-gray-800 pl-4">
          <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Stars</span>
          <span className="text-3xl md:text-5xl font-orbitron text-[#ffd700] leading-none">+{starsGained}</span>
        </div>
        <div className="flex flex-col border-l border-gray-800 pl-4">
          <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Best</span>
          <span className={`text-3xl md:text-5xl font-orbitron leading-none ${isNewRecord ? 'text-[#00f2ff] drop-shadow-[0_0_10px_#00f2ff]' : 'text-gray-400'}`}>
            {highScore}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-6 w-full max-w-xs">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRestart();
          }}
          className="w-full px-8 md:px-12 py-4 border-2 border-[#ff8c00] text-[#ff8c00] font-orbitron font-black text-lg md:text-xl hover:bg-[#ff8c00] hover:text-black transition-all duration-300 transform hover:scale-105 active:scale-95 uppercase tracking-widest"
        >
          Re-Initialize
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onMenu();
          }}
          className="w-full py-3 border-2 border-white/30 text-white font-orbitron font-bold text-sm tracking-widest hover:border-white hover:bg-white/10 transition-all uppercase"
        >
          Main Menu
        </button>

        <div className="flex gap-4 w-full justify-center">
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 text-center border border-white/20 text-white font-mono text-xs hover:bg-white hover:text-black transition-colors uppercase tracking-widest"
          >
            [X Share]
          </a>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 text-center border border-white/20 text-white font-mono text-xs hover:bg-[#25D366] hover:text-black transition-colors uppercase tracking-widest"
          >
            [WA Share]
          </a>
        </div>

        <div
          className="text-gray-600 text-[9px] md:text-[10px] font-mono uppercase tracking-[0.5em] cursor-pointer hover:text-white transition-colors duration-300 py-2"
          onClick={(e) => {
            e.stopPropagation();
            window.location.reload();
          }}
        >
          Terminate Process
        </div>
      </div>

      {isNewRecord && (
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="text-[#00f2ff] font-orbitron font-black text-4xl md:text-7xl opacity-10 rotate-12 select-none uppercase tracking-tighter">
            New Record
          </div>
        </div>
      )}
    </div>
  );
};

export default GameOver;
