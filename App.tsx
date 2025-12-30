import React, { useState, useEffect, useCallback } from 'react';
import { GameStatus, Phase, GameState, UserProfile, Mission } from './types';
import { GAME_CONFIG, THEMES } from './constants';
import GameEngine from './components/GameEngine';
import HUD from './components/HUD';
import MainMenu from './components/MainMenu';
import GameOver from './components/GameOver';
import Shop from './components/Shop';
import Auth from './components/Auth';
import Leaderboard from './components/Leaderboard';
import Missions from './components/Missions';
import LoadingScreen from './components/LoadingScreen';
import OrientationWarning from './components/OrientationWarning';
import { auth, db } from './firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';

const generateDailyMissions = (): Mission[] => {
  const types = [
    { type: 'STARS', desc: 'Collect 50 Stars', target: 50, reward: 100 },
    { type: 'SCORE', desc: 'Score 500 Cumulative Points', target: 500, reward: 150 },
    { type: 'PHASE_SWITCH', desc: 'Phase Shift 30 Times', target: 30, reward: 80 },
    { type: 'DISTANCE', desc: 'Travel 2000m', target: 2000, reward: 120 }
  ];
  const shuffled = types.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3).map((t, i) => ({
    id: `mission-${Date.now()}-${i}`,
    description: t.desc,
    target: t.target,
    progress: 0,
    completed: false,
    reward: t.reward,
    type: t.type as any
  }));
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    status: GameStatus.START,
    score: 0,
    highScore: 0,
    stars: 0,
    lastRunStars: 0,
    currentPhase: Phase.BLUE,
    speed: GAME_CONFIG.INITIAL_SPEED,
    distance: 0,
    combo: 0,
    activePowerUp: null
  });

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showMissions, setShowMissions] = useState(false);
  const [jumpTrigger, setJumpTrigger] = useState(0);

  const activeTheme = THEMES.find(t => t.id === (userProfile?.activeThemeId || 'classic')) || THEMES[0];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        const unsubDoc = onSnapshot(doc(db, 'users', user.uid), (doc) => {
          if (doc.exists()) {
            const data = doc.data() as UserProfile;
            setUserProfile(data);
            setGameState(prev => ({ ...prev, highScore: data.highScore, stars: data.stars }));
          }
        });
        setShowAuth(false);
        // Artificial delay for beautiful loading screen
        setTimeout(() => setAuthLoading(false), 2000);
        return () => unsubDoc();
      } else {
        setUserProfile(null);
        setShowAuth(true);
        setAuthLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!userProfile) return;
    const today = new Date().toDateString();
    const lastLoginDate = new Date(userProfile.lastLogin).toDateString();
    if (today !== lastLoginDate) {
      const newMissions = generateDailyMissions();
      updateDoc(doc(db, 'users', userProfile.uid), {
        lastLogin: new Date().toISOString(),
        missions: newMissions
      });
    }
  }, [userProfile?.uid]);

  const persistProfile = async (updates: Partial<UserProfile>) => {
    if (!currentUser) return;
    await updateDoc(doc(db, 'users', currentUser.uid), updates);
  };

  const startGame = useCallback(() => {
    // Prevent starting if any modal is open
    if (showAuth || showLeaderboard || showMissions || gameState.status === GameStatus.SHOP) return;

    setGameState(prev => ({
      ...prev,
      status: GameStatus.PLAYING,
      score: 0,
      combo: 0,
      speed: GAME_CONFIG.INITIAL_SPEED,
      currentPhase: Phase.BLUE,
      distance: 0,
      activePowerUp: null,
      lastRunStars: 0
    }));
  }, [showAuth, showLeaderboard, showMissions, gameState.status]);

  const handleGameOver = useCallback((finalScore: number, collectedInRun: number) => {
    if (!userProfile) return;
    setGameState(prev => {
      const newHighScore = Math.max(prev.highScore, finalScore);
      const newTotalStars = userProfile.stars + collectedInRun;
      const updatedMissions = userProfile.missions.map(m => {
        if (m.completed) return m;
        let p = m.progress;
        if (m.type === 'SCORE') p += finalScore;
        if (m.type === 'STARS') p += collectedInRun;
        if (m.type === 'DISTANCE') p += finalScore;
        return { ...m, progress: p, completed: p >= m.target };
      });
      persistProfile({ highScore: newHighScore, stars: newTotalStars, missions: updatedMissions });
      return { ...prev, status: GameStatus.GAMEOVER, score: finalScore, highScore: newHighScore, stars: newTotalStars, lastRunStars: collectedInRun };
    });
  }, [userProfile]);

  const togglePhase = useCallback(() => {
    setGameState(prev => ({ ...prev, currentPhase: prev.currentPhase === Phase.BLUE ? Phase.ORANGE : Phase.BLUE }));
  }, []);

  const jump = useCallback(() => {
    setJumpTrigger(prev => prev + 1);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        if (gameState.status === GameStatus.PLAYING) togglePhase();
        else if (gameState.status !== GameStatus.SHOP && !showAuth && !showLeaderboard && !showMissions) startGame();
      } else if (e.code === 'KeyW' || e.code === 'ArrowUp') {
        if (gameState.status === GameStatus.PLAYING) jump();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.status, togglePhase, startGame, showAuth, showLeaderboard, showMissions, jump]);

  if (authLoading) return <LoadingScreen />;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#050505] cursor-pointer touch-none select-none">
      <OrientationWarning />

      <GameEngine
        status={gameState.status}
        currentPhase={gameState.currentPhase}
        theme={activeTheme}
        jumpTrigger={jumpTrigger}
        onGameOver={handleGameOver}
        onScoreUpdate={(s, combo, powerUp) => setGameState(prev => ({ ...prev, score: s, combo, activePowerUp: powerUp }))}
        onJump={jump}
        onTogglePhase={togglePhase}
      />

      {/* Game HUD (Only while playing) */}
      {gameState.status === GameStatus.PLAYING && (
        <HUD score={gameState.score} highScore={gameState.highScore} phase={gameState.currentPhase} stars={gameState.stars} combo={gameState.combo} activePowerUp={gameState.activePowerUp} />
      )}

      {/* Main Menu (Only if not playing/gameover/shop) */}
      {gameState.status === GameStatus.START && !showAuth && !showLeaderboard && !showMissions && (
        <MainMenu highScore={gameState.highScore} stars={gameState.stars} username={userProfile?.username} onStart={startGame} onOpenShop={() => setGameState(p => ({ ...p, status: GameStatus.SHOP }))} onOpenLeaderboard={() => setShowLeaderboard(true)} onOpenMissions={() => setShowMissions(true)} />
      )}

      {/* Overlays / Modals (Highest Z-Index) */}
      {showAuth && <Auth onLogin={() => setShowAuth(false)} />}
      {showLeaderboard && <Leaderboard onClose={() => setShowLeaderboard(false)} />}
      {showMissions && userProfile && (
        <Missions missions={userProfile.missions} onClose={() => setShowMissions(false)} onClaim={(id) => {
          const m = userProfile.missions.find(mi => mi.id === id);
          if (m) persistProfile({ stars: userProfile.stars + m.reward, missions: userProfile.missions.filter(mi => mi.id !== id) });
        }} />
      )}

      {gameState.status === GameStatus.SHOP && userProfile && (
        <Shop stars={gameState.stars} ownedThemes={userProfile.ownedThemes} activeThemeId={userProfile.activeThemeId} onClose={() => setGameState(p => ({ ...p, status: GameStatus.START }))} onPurchase={(theme) => persistProfile({ stars: userProfile.stars - theme.price, ownedThemes: [...userProfile.ownedThemes, theme.id] })} onSelect={(id) => persistProfile({ activeThemeId: id })} />
      )}

      {gameState.status === GameStatus.GAMEOVER && (
        <GameOver
          score={gameState.score}
          highScore={gameState.highScore}
          starsGained={gameState.lastRunStars}
          onRestart={startGame}
          onMenu={() => setGameState(prev => ({ ...prev, status: GameStatus.START }))}
        />
      )}
    </div>
  );
};

export default App;
