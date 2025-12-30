interface MainMenuProps {
  highScore: number;
  stars: number;
  username?: string;
  onStart: () => void;
  onOpenShop: () => void;
  onOpenLeaderboard: () => void;
  onOpenMissions: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ highScore, stars, username, onStart, onOpenShop, onOpenLeaderboard, onOpenMissions }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-black/70 backdrop-blur-md p-6">
      <div className="flex absolute top-4 right-4 items-center gap-2">
        <span className="text-xs font-mono text-gray-400">OPERATOR:</span>
        <span className="text-sm font-orbitron font-bold text-[#00f2ff]">{username || 'GUEST'}</span>
      </div>

      <div className="relative mb-8 md:mb-10 text-center group">
        <h1 className="text-6xl md:text-9xl font-orbitron font-black italic tracking-tighter text-white select-none transition-transform group-hover:scale-105 duration-700 leading-none">
          PHASE <br className="md:hidden" /><span className="text-[#00f2ff] drop-shadow-[0_0_20px_#00f2ff]">SHIFT</span>
        </h1>
        <div className="absolute -bottom-6 right-0 md:right-4 text-[#ff8c00] font-orbitron text-[10px] md:text-lg font-bold tracking-[0.5em] animate-pulse">
          CORE_ENGINE: ACTIVE
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 w-full max-w-sm">
        <button
          onClick={(e) => { e.stopPropagation(); onStart(); }}
          className="w-full px-8 py-5 bg-white text-black font-orbitron font-black text-2xl hover:bg-[#00f2ff] transition-all duration-300 transform hover:scale-105 border-b-8 border-gray-500 uppercase"
        >
          Begin Sync
        </button>

        <div className="flex gap-2 w-full">
          <button
            onClick={(e) => { e.stopPropagation(); onOpenMissions(); }}
            className="flex-1 px-4 py-3 border border-[#00ff88] text-[#00ff88] bg-black/50 hover:bg-[#00ff88] hover:text-black font-orbitron font-bold text-sm transition-all duration-300 uppercase tracking-widest"
          >
            Missions
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onOpenLeaderboard(); }}
            className="flex-1 px-4 py-3 border border-[#ff8c00] text-[#ff8c00] bg-black/50 hover:bg-[#ff8c00] hover:text-black font-orbitron font-bold text-sm transition-all duration-300 uppercase tracking-widest"
          >
            Rankings
          </button>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); onOpenShop(); }}
          className="relative z-50 w-full px-8 py-4 border-2 border-[#ffd700] text-[#ffd700] bg-black/50 hover:bg-[#ffd700] hover:text-black font-orbitron font-bold text-lg transition-all duration-300 uppercase tracking-widest"
        >
          Shop: {isNaN(stars) ? 0 : stars}★
        </button>

        <div className="flex flex-col items-center text-center gap-4 px-2">
          <p className="text-gray-400 text-[10px] md:text-sm uppercase tracking-widest font-medium">
            Matter is variable. <br />
            Avoid solid collision.
          </p>
          {highScore > 0 && (
            <div className="text-white font-orbitron tracking-[0.3em] text-[10px] md:text-sm">
              SECTOR MAX: <span className="text-[#00f2ff]">{highScore}</span>
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-10 flex flex-col md:flex-row gap-4 md:gap-12 text-gray-600 font-mono text-[9px] md:text-xs uppercase tracking-[0.3em] items-center">
        <span>[Space] / [Tap] Toggle Phase</span>
        <span>[W] Key to Jump</span>
        <span className="opacity-50 hidden md:inline">Difficulty: Dynamic</span>
      </div>
    </div>
  );
};

export default MainMenu;
