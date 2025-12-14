
import React, { useState, useEffect, useRef } from 'react';
import { GamePhase, PlayerState, GameLevel, NPCFeedback, LEVEL_THEMES, Choice, Hero } from './types';
import { generateLevelContent, generateNPCFeedback } from './services/geminiService';
import { EpicHUD, EpicButton, Icons, EpicAvatar, UstadzEpicAvatar, EpicCard } from './components/ui';
import { audioManager } from './services/audioService';

const INITIAL_STATE: PlayerState = {
  name: '',
  iman: 55, 
  amal: 0,
  lalai: 0,
  levelIndex: 0,
  history: [],
  heroId: 'warrior'
};

const HEROES: Hero[] = [
  {
    id: 'warrior',
    name: 'Al-Fatih',
    title: 'The Brave',
    description: 'Pejuang tangguh yang menyeimbangkan dunia dan akhirat. Cocok untuk pemula.',
    color: '#FF2E2E', // Red
    stats: { keteguhan: 70, ilmu: 60, amal: 80 }
  },
  {
    id: 'guardian',
    name: 'Ash-Shiddiq',
    title: 'The Truthful',
    description: 'Pelindung kebenaran dengan keteguhan iman yang tak tergoyahkan.',
    color: '#C9A050', // Gold
    stats: { keteguhan: 95, ilmu: 50, amal: 60 }
  },
  {
    id: 'scholar',
    name: 'Al-Hakim',
    title: 'The Wise',
    description: 'Pencari ilmu yang menggunakan kebijaksanaan untuk menyelesaikan masalah.',
    color: '#00C2FF', // Blue
    stats: { keteguhan: 60, ilmu: 95, amal: 70 }
  }
];

// --- BACKGROUND IMAGES FOR LEVELS (STATIC FOR PERFORMANCE) ---
const LEVEL_BG_IMAGES = [
  "https://images.unsplash.com/photo-1531844251246-9f10d99c663f?q=80&w=1920&auto=format&fit=crop", // Level 0: Bedroom/Subuh (Moody Dark)
  "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1920&auto=format&fit=crop", // Level 1: School/Daylight
  "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1920&auto=format&fit=crop", // Level 2: Digital/Cyber/Matrix
  "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=1920&auto=format&fit=crop", // Level 3: Social/Hangout
  "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=1920&auto=format&fit=crop", // Level 4: Family/Home
  "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=1920&auto=format&fit=crop"  // Level 5: Galaxy/Reflection
];

// --- TYPEWRITER COMPONENT ---
interface TypewriterProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  soundMode?: 'none' | 'classic'; // Controls the SFX style
}

const TypewriterText: React.FC<TypewriterProps> = ({ text, speed = 40, onComplete, soundMode = 'none' }) => {
  const [displayedText, setDisplayedText] = useState('');
  const indexRef = useRef(0);

  useEffect(() => {
    setDisplayedText('');
    indexRef.current = 0;

    const timer = setInterval(() => {
      if (indexRef.current < text.length) {
        const char = text.charAt(indexRef.current);
        setDisplayedText((prev) => prev + char);
        
        // Handle Typing Sound
        if (soundMode === 'classic') {
          // Play classic typewriter sound
          audioManager.playMechanicalClick();
        }
        
        indexRef.current++;
      } else {
        clearInterval(timer);
        if (onComplete) onComplete();
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed, onComplete, soundMode]);

  return <span>{displayedText}</span>;
};

// --- SUB-COMPONENTS ---

const LoadingView: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Start Audio Engine for Loading
    audioManager.startSummoningSFX();

    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100; 
        
        const remaining = 100 - prev;
        const increment = Math.max(0.8, remaining * 0.15 * Math.random() + 0.5); // Faster increment
        const nextVal = Math.min(prev + increment, 100);
        
        // Update Sound Pitch based on Progress
        audioManager.updateSummoningSFX(nextVal);

        return nextVal;
      });
    }, 50); // Faster update rate for smoother audio

    return () => {
        clearInterval(interval);
        audioManager.stopSummoningSFX(true); // Stop with a bang
    };
  }, []);

  return (
    <div className="h-[100dvh] w-full flex flex-col items-center justify-center bg-epicDark relative overflow-hidden">
        {/* Background Particles/Effects */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black via-slate-900 to-black opacity-80"></div>

        {/* Central Hexagon Pulse */}
        <div className="relative z-10 mb-12">
            <div className="w-32 h-32 border-4 border-epicBlue/30 rounded-full flex items-center justify-center animate-ping absolute inset-0"></div>
            <div className="w-32 h-32 border-4 border-epicBlue/50 rounded-full flex items-center justify-center animate-pulse absolute inset-0"></div>
            <div className="w-32 h-32 bg-slate-900 border-2 border-epicBlue hex-shape flex items-center justify-center relative shadow-[0_0_50px_rgba(0,194,255,0.4)]">
                 <Icons.Star className="w-16 h-16 text-epicBlue animate-spin-slow" />
            </div>
        </div>

        {/* Text */}
        <h2 className="relative z-10 text-2xl font-hero font-bold text-white tracking-[0.3em] mb-2 animate-pulse">
            SUMMONING
        </h2>
        
        {/* Progress Bar Container */}
        <div className="relative z-10 w-80 md:w-96 h-6 bg-slate-900 border border-slate-600 rounded-full overflow-hidden shadow-lg transform skew-x-[-15deg]">
            {/* Fill */}
            <div 
                className="h-full bg-gradient-to-r from-blue-600 via-epicBlue to-white transition-all duration-200 ease-out relative"
                style={{ width: `${progress}%` }}
            >
                {/* Shine effect */}
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-white/50 to-transparent w-10 skew-x-[15deg]"></div>
            </div>
        </div>

        {/* Percentage */}
        <p className="relative z-10 mt-2 text-epicBlue font-mono text-sm font-bold">
            {Math.floor(progress)}%
        </p>

        {/* Tip */}
        <p className="relative z-10 mt-8 text-slate-500 text-xs tracking-widest uppercase opacity-60">
            Tip: Maintain Iman to unlock Mythic Rank
        </p>
    </div>
  );
};

// Enemy/Target Component for Battle
const BattleTarget: React.FC<{ 
    choice: Choice, 
    index: number, 
    onAttack: (c: Choice) => void,
    isAttacked: boolean,
    disabled: boolean
}> = ({ choice, index, onAttack, isAttacked, disabled }) => {

    return (
        <div 
            onClick={() => !disabled && onAttack(choice)}
            className={`
                relative group cursor-pointer transition-all duration-300
                ${isAttacked ? 'animate-shatter pointer-events-none' : 'hover:scale-105'}
                ${disabled && !isAttacked ? 'opacity-50 grayscale' : ''}
            `}
        >
            {/* Health Bar (Fake) */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-slate-800 border border-slate-600 rounded-full overflow-hidden">
                 <div className="h-full bg-red-500 w-full"></div>
            </div>

            {/* Target Visual (Minion Icon) */}
            <div className={`
                w-24 h-24 md:w-32 md:h-32 mx-auto bg-slate-900 border-2 
                ${isAttacked ? 'border-red-500 bg-red-900/50' : 'border-epicRed/50 hover:border-epicRed'}
                hex-shape flex items-center justify-center relative shadow-lg
            `}>
                {/* Slash Overlay Animation */}
                {isAttacked && (
                    <div className="absolute inset-0 z-50 animate-slash">
                        <div className="w-[150%] h-2 bg-white blur-md absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
                    </div>
                )}
                
                {/* Icon Image */}
                <div className="text-center">
                    <div className="text-4xl md:text-5xl mb-1 filter drop-shadow-[0_0_10px_rgba(255,46,46,0.5)]">
                         {/* Using different emojis or icons to represent different types of minions/enemies */}
                         {index === 0 ? '🛡️' : index === 1 ? '⚔️' : '☠️'}
                    </div>
                </div>
            </div>

            {/* Text Box */}
            <div className={`
                mt-2 bg-black/80 border border-slate-600 p-2 rounded text-center backdrop-blur-sm
                group-hover:border-epicRed group-hover:bg-slate-900/90 transition-colors
            `}>
                <div className="text-[10px] text-epicRed font-bold uppercase tracking-widest mb-0.5">Target {index + 1}</div>
                <div className="text-xs md:text-sm font-bold text-slate-200 leading-tight">
                    {choice.text}
                </div>
            </div>
        </div>
    )
}

const App: React.FC = () => {
  const [phase, setPhase] = useState<GamePhase>(GamePhase.START_SCREEN);
  const [player, setPlayer] = useState<PlayerState>(INITIAL_STATE);
  const [gameHistory, setGameHistory] = useState<PlayerState[]>([]); // Store previous runs

  const [currentLevelData, setCurrentLevelData] = useState<GameLevel | null>(null);
  const [npcFeedback, setNpcFeedback] = useState<NPCFeedback | null>(null);
  const [lastChoice, setLastChoice] = useState<Choice | null>(null);
  const [playerNameInput, setPlayerNameInput] = useState('');
  const [selectedHeroId, setSelectedHeroId] = useState<string>('warrior');
  const [isMuted, setIsMuted] = useState(false);
  
  // Battle Animation State
  const [attackingId, setAttackingId] = useState<string | null>(null);

  // FX
  const [shake, setShake] = useState(false);

  // --- AUDIO UNLOCKER & BGM MANAGER ---
  // This effect listens to phase changes and plays the appropriate music
  useEffect(() => {
    const handleInteraction = () => {
        audioManager.init();
        
        switch (phase) {
            case GamePhase.START_SCREEN:
            case GamePhase.CHARACTER_SELECT:
            case GamePhase.INTRO_STORY:
            case GamePhase.MAP:
            case GamePhase.PROCESSING: // Added this to ensure sound plays
                audioManager.playBGM('lobby');
                break;
            case GamePhase.GAMEPLAY:
            case GamePhase.CONSEQUENCE:
                audioManager.playBGM('battle');
                break;
            case GamePhase.CUTSCENE:
                audioManager.playBGM('calm');
                break;
            case GamePhase.ENDING:
                if (player.iman >= 55) {
                    audioManager.playBGM('victory');
                } else {
                    audioManager.playBGM('defeat');
                }
                break;
            default:
                break;
        }
    };
    
    // Initial Trigger if already interacted
    if (audioManager.hasInteracted) {
        handleInteraction();
    }
    
    // Listeners to start audio on first click
    document.body.addEventListener('click', handleInteraction);
    document.body.addEventListener('keydown', handleInteraction);
    
    return () => {
        document.body.removeEventListener('click', handleInteraction);
        document.body.removeEventListener('keydown', handleInteraction);
    };
  }, [phase, player.iman]); 

  // --- ACTIONS ---

  const toggleMute = () => {
    const muted = audioManager.toggleMute();
    setIsMuted(muted);
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const startGame = () => {
    if (!playerNameInput.trim()) return;
    
    audioManager.init();
    audioManager.playConfirm();
    // BGM switched by useEffect
    
    setPlayer({ ...INITIAL_STATE, name: playerNameInput });
    setPhase(GamePhase.CHARACTER_SELECT);
  };

  const restartGame = () => {
    // Save current run stats to history
    setGameHistory(prev => [player, ...prev]);
    
    // Reset state for new game
    audioManager.playClick();
    setPlayer(INITIAL_STATE);
    setPlayerNameInput('');
    setSelectedHeroId('warrior');
    setCurrentLevelData(null);
    setNpcFeedback(null);
    setLastChoice(null);
    
    // Go to Start Screen
    setPhase(GamePhase.START_SCREEN);
  };

  const confirmCharacterSelection = () => {
    audioManager.playConfirm();
    audioManager.playAnnouncer("Welcome to Jejak Amal Legends.");
    setPlayer(prev => ({ ...prev, heroId: selectedHeroId }));
    setPhase(GamePhase.INTRO_STORY);
  };

  const startLevel = async () => {
    audioManager.playClick();
    setPhase(GamePhase.PROCESSING);
    setAttackingId(null); // Reset battle state
    
    try {
      const levelData = await generateLevelContent(player.levelIndex);
      setCurrentLevelData(levelData);
      setPhase(GamePhase.GAMEPLAY);
      
      // Removed AI Image generation for speed. Using Static Images from LEVEL_BG_IMAGES.
      
      // Play Battle Sound Effect (replacing the typing sounds)
      setTimeout(() => {
          audioManager.playBattleStart();
          audioManager.playAnnouncer("Launch Attack!");
      }, 500); 

    } catch (e) {
      console.error(e);
      audioManager.playError();
      alert("Network Error. Retry.");
      setPhase(GamePhase.START_SCREEN);
    }
  };

  const handleAttackChoice = (choice: Choice) => {
      // 1. Play Attack Sound
      // Use tone to simulate slash
      audioManager.playTone(150, 'sawtooth', 0.1, 0.5, 50); // Sharp slash noise
      
      // 2. Trigger Animation
      setAttackingId(choice.id);

      // 3. Delay actual logic to allow animation to play
      setTimeout(() => {
          handleChoice(choice);
      }, 600);
  };

  const handleChoice = async (choice: Choice) => {
    setLastChoice(choice);
    
    const newIman = Math.max(0, Math.min(100, player.iman + choice.impact.iman));
    const newAmal = player.amal + choice.impact.amal;
    const newLalai = player.lalai + choice.impact.lalai;
    
    if (choice.impact.iman < 0) {
        triggerShake(); 
        audioManager.playError();
        audioManager.playAnnouncer("An ally has been slain."); 
    } else {
        audioManager.playConfirm();
    }

    setPlayer(prev => ({
      ...prev,
      iman: newIman,
      amal: newAmal,
      lalai: newLalai,
      history: [...prev.history, choice.text]
    }));

    setPhase(GamePhase.CONSEQUENCE);
  };

  const proceedToNPC = async () => {
    audioManager.playClick();
    setPhase(GamePhase.PROCESSING);
    
    // BGM Switched by useEffect to 'calm'

    try {
      const feedback = await generateNPCFeedback(player, lastChoice!.text, LEVEL_THEMES[player.levelIndex]);
      setNpcFeedback(feedback);
      setPhase(GamePhase.CUTSCENE);
    } catch (e) {
      console.error(e);
      setNpcFeedback({ dialogue: "Lanjutkan misimu, Pahlawan.", wisdom: "Tetap fokus." });
      setPhase(GamePhase.CUTSCENE);
    }
  };

  const nextPhase = () => {
    audioManager.playClick();
    const nextIdx = player.levelIndex + 1;
    
    if (nextIdx >= 6) { 
      setPhase(GamePhase.ENDING);
      if (player.iman >= 55) {
          audioManager.playVictorySFX();
          audioManager.playAnnouncer("Victory!");
      } else {
          audioManager.playError();
          audioManager.playAnnouncer("Defeat.");
      }
    } else {
      setPlayer(prev => ({ ...prev, levelIndex: nextIdx }));
      // BGM Switched by useEffect to 'lobby'
      setPhase(GamePhase.MAP);
    }
  };

  // --- RENDER HELPERS ---

  const renderVisualStage = (content: React.ReactNode, type: 'hero' | 'battle' | 'calm' = 'hero', levelIndex: number = 0) => {
    let backgroundStyle: React.CSSProperties = {};
    let icon = null; 
    
    if (phase === GamePhase.GAMEPLAY) {
        // Use fallback static image directly
        const bgImage = LEVEL_BG_IMAGES[levelIndex] || LEVEL_BG_IMAGES[0];
        
        backgroundStyle = {
            backgroundImage: `url('${bgImage}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        };
    } else {
         backgroundStyle = { background: 'radial-gradient(ellipse at center, #1e293b 0%, #000000 100%)' };
         if (type === 'battle') {
             backgroundStyle = { background: 'radial-gradient(circle at center, #7f1d1d 0%, #000000 100%)' };
             icon = <Icons.Warning className="w-64 h-64 text-red-500/20 absolute animate-ping opacity-20" />;
         } else if (type === 'hero') {
             icon = <Icons.Star className="w-64 h-64 text-white/5 absolute opacity-20" />;
         }
    }

    return (
        <div 
            className={`w-full h-[50dvh] relative flex items-center justify-center overflow-hidden border-b-4 border-epicGold/50 shadow-[0_0_50px_rgba(0,0,0,0.8)] transition-all duration-1000`}
            style={backgroundStyle}
        >
            {icon}
            
            {/* Atmospheric Overlay */}
            <div className="absolute inset-0 bg-black/40 transition-opacity duration-500"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-80"></div>
            
            {/* Hex Pattern */}
            <div className="absolute inset-0 bg-hex-pattern opacity-20 mix-blend-overlay"></div>
            
            {/* Spotlights */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/80 to-transparent"></div>
            
            {/* Content */}
            <div className="relative z-10 w-full px-6 text-center">
                {content}
            </div>
        </div>
    );
  };

  // Helper for ranking
  const getRank = (iman: number) => {
      if (iman >= 80) return { title: "MYTHIC", color: "text-epicGold" };
      if (iman >= 55) return { title: "LEGEND", color: "text-blue-400" };
      return { title: "WARRIOR", color: "text-slate-400" };
  }

  // --- VIEWS ---

  // 1. START SCREEN (Compact Version Restored)
  if (phase === GamePhase.START_SCREEN) {
    const lastRun = gameHistory.length > 0 ? gameHistory[0] : null;
    const lastRank = lastRun ? getRank(lastRun.iman) : null;

    return (
      <div className="h-[100dvh] w-full flex flex-col items-center justify-center p-4 relative overflow-hidden">
         {/* Background elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800 via-epicDark to-black"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>

        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm mx-auto z-10">
            {/* Logo Section - Reduced Scale */}
            <div className="mb-4 transform scale-90">
               <EpicAvatar size="md" label="PAI" /> 
            </div>
            
            <div className="text-center mb-6">
                <h1 className="text-3xl md:text-4xl font-hero font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(0,194,255,0.5)]">
                    JEJAK AMAL
                </h1>
                <div className="flex items-center justify-center gap-2 mt-2">
                    <div className="h-[1px] w-6 bg-epicGold"></div>
                    <h2 className="text-[10px] font-bold text-epicGold tracking-[0.4em] uppercase">Legends</h2>
                    <div className="h-[1px] w-6 bg-epicGold"></div>
                </div>
            </div>

            {/* Login/Input Card - Compact */}
            <EpicCard className="w-full backdrop-blur-xl bg-slate-900/80 border-slate-700">
              <div className="space-y-4 p-2">
                <div className="space-y-1">
                    <label className="text-[9px] font-bold text-epicBlue uppercase tracking-widest ml-1">Nama Pahlawan</label>
                    <div className="relative group">
                        <div className="absolute inset-0 bg-epicBlue opacity-20 blur-sm group-focus-within:opacity-100 transition-opacity rounded"></div>
                        <input 
                            type="text" 
                            maxLength={12}
                            className="relative w-full bg-black/60 border border-slate-600 rounded px-3 py-2 text-white font-hero text-base focus:outline-none focus:border-epicBlue transition-all text-center uppercase tracking-wider placeholder:text-slate-700"
                            placeholder="KETIK NAMA"
                            value={playerNameInput}
                            onChange={(e) => setPlayerNameInput(e.target.value)}
                            onKeyDown={() => audioManager.playTyping()}
                        />
                    </div>
                </div>
                <EpicButton onClick={startGame} fullWidth size="md" variant="gold" className="animate-pulse shadow-[0_0_20px_rgba(201,160,80,0.3)] text-sm">
                    MULAI PETUALANGAN
                </EpicButton>
              </div>
            </EpicCard>
            
            {/* Previous Hero Stats (Leaderboard/History) */}
            {lastRun && lastRank && (
                <div className="mt-4 w-full animate-slide-in">
                    <div className="bg-slate-900/60 border border-slate-700 p-2 rounded flex items-center justify-between">
                        <div className="flex items-center gap-3">
                             <div className="w-8 h-8 bg-slate-800 border border-slate-600 hex-shape flex items-center justify-center">
                                 <Icons.Trophy className="w-4 h-4 text-epicGold" />
                             </div>
                             <div className="text-left">
                                 <div className="text-[9px] text-slate-400 uppercase font-bold">Previous Hero</div>
                                 <div className="text-xs text-white font-hero">{lastRun.name}</div>
                             </div>
                        </div>
                        <div className="text-right">
                             <div className={`text-xs font-black ${lastRank.color}`}>{lastRank.title}</div>
                             <div className="text-[9px] text-slate-500">Iman: {lastRun.iman}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Credits Footer - Compact */}
            <div className="mt-6 flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
               <div className="text-[8px] text-slate-400 uppercase tracking-widest">Didukung Oleh</div>
               <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full border border-white/5">
                  <img src="https://cdn.kemenag.go.id/storage/archives/logo-kemenag-png-1png.png" alt="Logo" className="w-6 h-auto" />
                  <div className="h-4 w-[1px] bg-slate-600"></div>
                  <div className="text-[8px] font-bold text-slate-300 leading-tight text-left">
                      <div className="text-white mb-0.5">Kementerian Agama</div>
                      <div className="text-white">Kab. Mojokerto</div>
                      <div className="text-slate-500 mt-1 pt-1 border-t border-slate-600">MGMP PAI SMP</div>
                  </div>
               </div>
            </div>
        </div>
      </div>
    );
  }

  // 1.5 CHARACTER SELECTION
  if (phase === GamePhase.CHARACTER_SELECT) {
    const selectedHero = HEROES.find(h => h.id === selectedHeroId) || HEROES[0];
    
    return (
      <div className="h-[100dvh] w-full flex flex-col bg-epicDark overflow-hidden relative">
         <div className="absolute inset-0 bg-radial-gradient from-slate-800 to-black opacity-50"></div>
         <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-black via-transparent to-transparent opacity-80"></div>
         <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full relative z-10 p-4 pt-10 overflow-y-auto">
            <div className="flex-1 flex flex-col items-center justify-center relative mb-8 md:mb-0">
               <div className="transform scale-125 md:scale-150 animate-glow-pulse transition-all duration-500">
                  <EpicAvatar size="xl" color={selectedHero.color} />
               </div>
               <div className="mt-12 text-center">
                  <h1 className="text-4xl md:text-6xl font-hero font-black text-white uppercase tracking-tighter drop-shadow-lg transition-all duration-300" style={{ textShadow: `0 0 20px ${selectedHero.color}80` }}>
                    {selectedHero.name}
                  </h1>
                  <p className="text-sm md:text-xl font-bold tracking-[0.5em] uppercase text-slate-400 mt-2">
                    {selectedHero.title}
                  </p>
               </div>
            </div>
            <div className="w-full md:w-96 flex flex-col justify-end pb-8">
               <EpicCard className="mb-6 space-y-4" title="Hero Attributes">
                  <div className="space-y-3">
                     <div className="flex items-center gap-3">
                        <span className="text-xs font-bold w-20 text-slate-400">KETEGUHAN</span>
                        <div className="flex-1 h-2 bg-slate-800 skew-x-[-15deg]">
                           <div className="h-full transition-all duration-500" style={{ width: `${selectedHero.stats.keteguhan}%`, backgroundColor: selectedHero.color }}></div>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <span className="text-xs font-bold w-20 text-slate-400">ILMU</span>
                        <div className="flex-1 h-2 bg-slate-800 skew-x-[-15deg]">
                           <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${selectedHero.stats.ilmu}%` }}></div>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <span className="text-xs font-bold w-20 text-slate-400">AMAL</span>
                        <div className="flex-1 h-2 bg-slate-800 skew-x-[-15deg]">
                           <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${selectedHero.stats.amal}%` }}></div>
                        </div>
                     </div>
                  </div>
                  <p className="text-sm text-slate-300 italic leading-relaxed border-t border-slate-700 pt-4 mt-2">
                    "{selectedHero.description}"
                  </p>
               </EpicCard>
               <div className="flex justify-center gap-4 mb-8">
                  {HEROES.map((hero) => (
                    <button
                      key={hero.id}
                      onClick={() => { setSelectedHeroId(hero.id); audioManager.playClick(); }}
                      className={`relative w-16 h-16 md:w-20 md:h-20 transition-all duration-300 ${selectedHeroId === hero.id ? 'transform scale-110 -translate-y-2 z-10' : 'opacity-50 hover:opacity-100'}`}
                    >
                       <div className={`w-full h-full border-2 hex-shape bg-slate-800 flex items-center justify-center overflow-hidden`} style={{ borderColor: selectedHeroId === hero.id ? hero.color : '#475569' }}>
                          <div className="w-3/4 h-3/4 bg-current" style={{ color: hero.color, clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}></div>
                       </div>
                    </button>
                  ))}
               </div>
               <EpicButton onClick={confirmCharacterSelection} fullWidth size="lg" variant="gold" className="animate-pulse shadow-[0_0_30px_rgba(201,160,80,0.5)]">
                 LOCK IN HERO
               </EpicButton>
            </div>
         </div>
      </div>
    );
  }

  // 1.8 MAP NAVIGATION (MOBA STYLE UPGRADE)
  if (phase === GamePhase.MAP) {
    const selectedHero = HEROES.find(h => h.id === player.heroId) || HEROES[0];
    
    // Position of nodes in percentage {left, top}
    const mapNodes = [
        { id: 1, x: 15, y: 75 },
        { id: 2, x: 25, y: 50 },
        { id: 3, x: 45, y: 35 },
        { id: 4, x: 65, y: 55 },
        { id: 5, x: 80, y: 30 },
        { id: 6, x: 85, y: 70 } 
    ];

    const currentLevelIdx = player.levelIndex;

    return (
      <div className="h-[100dvh] w-full flex flex-col overflow-hidden relative">
         <EpicHUD {...player} level={player.levelIndex + 1} onToggleMute={toggleMute} isMuted={isMuted} heroColor={selectedHero.color} />
         
         {/* Map Background - MOBA Style Abyss */}
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900 via-[#0b1121] to-black"></div>
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 animate-pulse"></div>
         
         {/* Floating Particles/Fog */}
         <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-purple-900/10 to-transparent"></div>

         <div className="flex-1 relative z-10 w-full max-w-6xl mx-auto flex items-center justify-center mt-12 p-4">
             {/* Map Board Container */}
             <div className="relative w-full aspect-[16/9] md:aspect-[21/9] bg-[#0f172a]/80 backdrop-blur-md border-y-2 border-yellow-500/30 shadow-[0_0_100px_rgba(0,0,0,0.9)] overflow-hidden rounded-3xl group">
                 
                 {/* Decorative Grid */}
                 <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [perspective:1000px] [transform:rotateX(60deg)_scale(2)] opacity-20"></div>

                 {/* Connecting Lines (Energy Beams) */}
                 <svg className="absolute inset-0 w-full h-full pointer-events-none filter drop-shadow-[0_0_8px_rgba(0,194,255,0.8)]">
                    <defs>
                        <linearGradient id="activePath" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#00C2FF" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#00C2FF" stopOpacity="0.2" />
                        </linearGradient>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                            <feMerge>
                                <feMergeNode in="coloredBlur"/>
                                <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                        </filter>
                    </defs>
                    {/* Drawing lines between nodes */}
                    {mapNodes.map((node, i) => {
                        if (i === mapNodes.length - 1) return null;
                        const next = mapNodes[i+1];
                        const isUnlocked = i < currentLevelIdx;
                        return (
                            <line 
                                key={i}
                                x1={`${node.x}%`} y1={`${node.y}%`}
                                x2={`${next.x}%`} y2={`${next.y}%`}
                                stroke={isUnlocked ? "#00C2FF" : "#334155"}
                                strokeWidth={isUnlocked ? "3" : "2"}
                                strokeDasharray={isUnlocked ? "none" : "4,4"}
                                strokeLinecap="round"
                                className="transition-all duration-1000 ease-in-out"
                                filter={isUnlocked ? "url(#glow)" : ""}
                            />
                        );
                    })}
                 </svg>

                 {/* Nodes */}
                 {mapNodes.map((node, i) => {
                     const isCompleted = i < currentLevelIdx;
                     const isCurrent = i === currentLevelIdx;
                     
                     return (
                         <div 
                            key={node.id}
                            className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500`}
                            style={{ left: `${node.x}%`, top: `${node.y}%` }}
                         >
                             {/* Active Node Ground Aura */}
                             {isCurrent && (
                                 <div className="absolute inset-0 w-full h-full rounded-full border border-cyan-400 animate-[ping_2s_linear_infinite] opacity-50 scale-150"></div>
                             )}
                             {isCurrent && (
                                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-cyan-500/20 blur-xl rounded-full"></div>
                             )}

                             <div 
                                onClick={() => {
                                    if(isCurrent) startLevel();
                                    else audioManager.playError();
                                }}
                                className={`
                                   relative w-14 h-14 md:w-20 md:h-20 flex items-center justify-center cursor-pointer z-10 transition-transform duration-300 hover:scale-110
                                `}
                             >
                                 {/* Visual representation of Nodes */}
                                 {isCompleted ? (
                                     // COMPLETED: Golden Crystal
                                     <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-yellow-300 to-yellow-600 rotate-45 border-2 border-white shadow-[0_0_15px_rgba(255,215,0,0.6)] flex items-center justify-center">
                                         <div className="-rotate-45">
                                             <Icons.Check className="w-6 h-6 text-white drop-shadow-md" />
                                         </div>
                                     </div>
                                 ) : isCurrent ? (
                                     // CURRENT: Hero Standing
                                     <div className="relative">
                                         {/* Base Ring */}
                                         <div className="w-16 h-16 md:w-20 md:h-20 border-2 border-cyan-400 rounded-full flex items-center justify-center bg-black/60 shadow-[0_0_20px_#00C2FF] animate-pulse">
                                             {/* Mini Hero Avatar */}
                                             <div className="w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden border-2 border-white relative bg-slate-800">
                                                 <div className="w-full h-full flex items-center justify-center bg-current" style={{ color: selectedHero.color }}>
                                                      <div className="w-3/4 h-3/4 bg-current" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}></div>
                                                 </div>
                                             </div>
                                         </div>
                                         {/* "ATTACK" text hint */}
                                         <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded border border-red-400 animate-bounce whitespace-nowrap">
                                             BATTLE!
                                         </div>
                                     </div>
                                 ) : (
                                     // LOCKED: Dark Stone Rune
                                     <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-800 rotate-45 border border-slate-600 shadow-inner flex items-center justify-center opacity-60 grayscale">
                                          <div className="-rotate-45 text-slate-500 font-bold text-xs">
                                              {node.id}
                                          </div>
                                     </div>
                                 )}

                                 {/* Stage Name/Label */}
                                 {!isCurrent && (
                                     <div className={`absolute -bottom-8 w-max text-center transition-opacity duration-300 ${isCompleted ? 'opacity-100' : 'opacity-0 hover:opacity-100'}`}>
                                         <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 border-x border-white/10 bg-black/80 backdrop-blur-sm ${isCompleted ? 'text-yellow-500' : 'text-slate-500'}`}>
                                             Stage {node.id}
                                         </span>
                                     </div>
                                 )}
                             </div>
                         </div>
                     )
                 })}
             </div>
         </div>
         
         <div className="p-8 text-center relative z-20">
             {/* Battle Button */}
             <div className="animate-slide-in" style={{ animationDelay: '0.5s' }}>
                <EpicButton 
                    onClick={startLevel} 
                    size="lg" 
                    variant="gold" 
                    className="mx-auto animate-pulse shadow-[0_0_40px_rgba(201,160,80,0.8)] border-yellow-200"
                >
                    <span className="flex items-center gap-2 text-lg">
                        <Icons.Sword className="w-5 h-5" /> ENTER BATTLE
                    </span>
                </EpicButton>
             </div>
         </div>
      </div>
    );
  }

  // 2. INTRO
  if (phase === GamePhase.INTRO_STORY) {
    const selectedHero = HEROES.find(h => h.id === player.heroId) || HEROES[0];

    return (
      <div className="h-[100dvh] w-full flex flex-col bg-epicDark">
        {renderVisualStage(
           <div className="animate-slide-in">
             <EpicAvatar size="lg" color={selectedHero.color} />
             <div className="mt-6">
                <h3 className="text-3xl font-hero text-white uppercase">{player.name}</h3>
                <span className="text-epicBlue text-sm tracking-widest uppercase border-t border-b border-epicBlue/30 py-1">{selectedHero.title}</span>
             </div>
           </div>
        )}
        
        <div className="flex-1 p-6 flex items-center justify-center relative">
          <EpicCard className="max-w-md w-full" title="Mission Brief">
            <p className="text-sm text-slate-300 leading-relaxed text-center mb-8 font-light">
              Welcome to the Arena of Life. Every choice you make impacts your <span className="text-green-400">Iman (HP)</span> and <span className="text-yellow-400">Amal (Gold)</span>. 
              <br/><br/>
              Beware of <span className="text-red-500">Lalai (Threats)</span>. 
              <br/>
              Survive until the end of the day.
            </p>
            {/* Direct to Map first now */}
            <EpicButton onClick={() => { audioManager.playClick(); setPhase(GamePhase.MAP); }} fullWidth variant="gold">
              OPEN MAP <Icons.ArrowRight className="w-4 h-4" />
            </EpicButton>
          </EpicCard>
        </div>
      </div>
    );
  }

  // 3. GAMEPLAY
  if (phase === GamePhase.GAMEPLAY && currentLevelData) {
    const selectedHero = HEROES.find(h => h.id === player.heroId) || HEROES[0];
    
    return (
      <div className="h-[100dvh] w-full flex flex-col bg-epicDark">
        <EpicHUD {...player} level={currentLevelData.id} onToggleMute={toggleMute} isMuted={isMuted} heroColor={selectedHero.color} />
        
        {/* Visual Stage now uses Background Image */}
        {renderVisualStage(
          <div className="flex flex-col items-center justify-end h-full pb-8">
             {/* Updated Location Label - Small and Elegant */}
             <div className="bg-black/60 border border-white/20 px-4 py-1 backdrop-blur-md rounded-full mb-2">
                 <p className="text-slate-300 font-bold text-xs md:text-sm uppercase tracking-[0.2em] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-epicGold animate-pulse"></span>
                    {currentLevelData.location}
                 </p>
             </div>
          </div>,
          "hero",
          player.levelIndex
        )}

        <div className="flex-1 relative z-20 px-4 -mt-10 pb-6 overflow-y-auto">
          <div className="max-w-3xl mx-auto flex flex-col gap-4">
            <div className="bg-gradient-to-r from-slate-900/95 to-slate-800/95 border-t border-b border-slate-600 p-6 text-center backdrop-blur-md shadow-2xl relative">
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-epicBlue shadow-[0_0_10px_#00C2FF]"></div>
               <p className="text-slate-100 font-medium text-lg leading-relaxed font-sans pt-4">
                 <TypewriterText text={currentLevelData.scenario} speed={35} soundMode="none" />
               </p>
            </div>

            {/* Battle Choices - Updated to "Minion/Monster" Cards */}
            <div className="grid grid-cols-3 gap-3 md:gap-6 mt-4 pb-20">
              {currentLevelData.choices.map((choice, idx) => (
                <BattleTarget
                    key={idx}
                    index={idx}
                    choice={choice}
                    onAttack={handleAttackChoice}
                    isAttacked={attackingId === choice.id}
                    disabled={attackingId !== null}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 4. CONSEQUENCE
  if (phase === GamePhase.CONSEQUENCE && lastChoice) {
    const isGood = lastChoice.impact.iman > 0;
    const isBad = lastChoice.impact.iman < 0;
    const selectedHero = HEROES.find(h => h.id === player.heroId) || HEROES[0];

    return (
      <div className="h-[100dvh] w-full flex flex-col bg-epicDark">
        <EpicHUD {...player} level={currentLevelData?.id || 0} onToggleMute={toggleMute} isMuted={isMuted} heroColor={selectedHero.color} />
        {renderVisualStage(
          <div className={`transform transition-all duration-300 ${shake ? 'translate-x-2' : ''}`}>
             <h1 className={`text-6xl font-hero font-black uppercase tracking-widest ${isGood ? 'text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]' : isBad ? 'text-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]' : 'text-slate-400'}`}>
                {isGood ? 'VICTORY' : isBad ? 'DAMAGE' : 'NEUTRAL'}
             </h1>
          </div>,
          isBad ? "battle" : "hero",
          player.levelIndex
        )}

        <div className="flex-1 -mt-16 relative z-20 px-6 flex items-start justify-center">
           <EpicCard className="w-full max-w-lg text-center space-y-6" title="Action Report">
              <h3 className="text-lg font-bold text-slate-200 font-sans italic">"{lastChoice.feedback}"</h3>
              
              <div className="flex justify-center gap-4">
                 {lastChoice.impact.iman !== 0 && (
                    <div className={`flex flex-col items-center p-2 border ${isGood ? 'border-green-500/50 bg-green-900/20' : 'border-red-500/50 bg-red-900/20'} min-w-[80px]`}>
                       <span className="text-[10px] uppercase font-bold text-slate-400">Iman</span>
                       <span className={`text-xl font-black ${isGood ? 'text-green-400' : 'text-red-400'}`}>
                         {lastChoice.impact.iman > 0 ? '+' : ''}{lastChoice.impact.iman}
                       </span>
                    </div>
                 )}
                 {lastChoice.impact.amal > 0 && (
                    <div className="flex flex-col items-center p-2 border border-yellow-500/50 bg-yellow-900/20 min-w-[80px]">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Gold</span>
                        <span className="text-xl font-black text-yellow-400">+{lastChoice.impact.amal}</span>
                    </div>
                 )}
              </div>

              <div className="pt-4">
                <EpicButton onClick={proceedToNPC} fullWidth variant="primary">
                    CONTINUE
                </EpicButton>
              </div>
           </EpicCard>
        </div>
      </div>
    );
  }

  // 5. CUTSCENE (USTADZ/MENTOR)
  if (phase === GamePhase.CUTSCENE && npcFeedback) {
    return (
      <div className="h-[100dvh] w-full flex flex-col bg-epicDark">
         <div className="h-[45vh] bg-gradient-to-b from-slate-900 to-black relative flex items-center justify-center border-b border-epicBlue/30">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
            <div className="animate-pulse">
               <UstadzEpicAvatar size="lg" />
            </div>
         </div>

         <div className="flex-1 -mt-12 relative z-20 px-4">
            <div className="max-w-2xl mx-auto bg-slate-900/95 border border-epicBlue shadow-[0_0_30px_rgba(0,194,255,0.2)] p-1">
               <div className="bg-black/50 p-6 relative">
                    <div className="absolute -top-3 left-6 bg-epicBlue text-black px-4 py-1 text-xs font-black uppercase skew-x-[-10deg]">
                        Mentor Advice
                    </div>
                    <div className="text-slate-200 font-medium text-base leading-relaxed mb-6 mt-2 font-sans min-h-[4rem]">
                         "<TypewriterText text={npcFeedback.dialogue} soundMode="classic" />"
                    </div>
                    <div className="bg-epicBlue/10 p-4 border-l-2 border-epicBlue mb-6 flex gap-4 items-center animate-fade-in" style={{ animationDelay: '2s', animationFillMode: 'both' }}>
                        <Icons.Star className="w-6 h-6 text-epicBlue flex-shrink-0 animate-spin-slow" />
                        <p className="text-epicBlue text-sm italic font-serif">
                        "{npcFeedback.wisdom}"
                        </p>
                    </div>
                    <div className="flex justify-end">
                        <EpicButton onClick={nextPhase} variant="outline" size="sm">
                        NEXT STAGE
                        </EpicButton>
                    </div>
               </div>
            </div>
         </div>
      </div>
    );
  }

  // 6. ENDING
  if (phase === GamePhase.ENDING) {
    let title = "DEFEAT";
    let color = "text-red-500";
    let rank = "Warrior";
    let mentorFeedback = "";
    let mentorWisdom = "";
    
    if (player.iman >= 80) { 
        title = "VICTORY"; 
        color = "text-epicGold"; 
        rank = "MYTHIC"; 
        mentorFeedback = "Masya Allah! Kamu adalah kesatria sejati. Imanmu kokoh, amalmu menggunung. Pertahankan istiqamah ini!";
        mentorWisdom = "Sebaik-baik manusia adalah yang paling bermanfaat bagi orang lain.";
    }
    else if (player.iman >= 55) { 
        title = "COMPLETED"; 
        color = "text-blue-400"; 
        rank = "LEGEND"; 
        mentorFeedback = "Perjuangan yang hebat! Meski ada sedikit kelalaian, kamu berhasil bertahan. Teruslah belajar dan perbaiki diri.";
        mentorWisdom = "Bertaqwalah kepada Allah di mana saja engkau berada.";
    } else {
        mentorFeedback = "Jangan putus asa. Kekalahan hari ini adalah pelajaran untuk esok. Perbanyak istighfar dan mulai lagi dengan niat yang kuat.";
        mentorWisdom = "Sesungguhnya Allah menyukai orang-orang yang bertaubat.";
    }

    return (
      <div className="h-[100dvh] w-full flex flex-col items-center justify-center p-6 bg-epicDark overflow-hidden overflow-y-auto">
        <div className={`absolute inset-0 opacity-20 ${player.iman >= 80 ? 'bg-yellow-500' : 'bg-blue-900'}`}></div>

        <div className="mb-4 md:mb-8 animate-victory-pop relative z-10 text-center mt-10 md:mt-0">
           <h1 className={`text-5xl md:text-8xl font-hero font-black tracking-tighter ${color} drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]`}>
             {title}
           </h1>
           <div className="mt-2 text-white font-bold tracking-[1em] text-sm uppercase">Rank: {rank}</div>
        </div>

        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10 pb-10">
            {/* Stats Card */}
            <EpicCard className="text-center space-y-6" title="Match Results">
               <div className="grid grid-cols-3 gap-4">
                  <div className="bg-slate-800/50 p-4 border border-slate-700">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Iman</div>
                    <div className="text-2xl font-black text-white">{player.iman}</div>
                  </div>
                  <div className="bg-slate-800/50 p-4 border border-slate-700">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Amal</div>
                    <div className="text-2xl font-black text-epicGold">{player.amal}</div>
                  </div>
                  <div className="bg-slate-800/50 p-4 border border-slate-700">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Lalai</div>
                    <div className="text-2xl font-black text-red-500">{player.lalai}</div>
                  </div>
               </div>
               <div className="pt-4">
                <EpicButton onClick={restartGame} fullWidth variant="gold">
                    PLAY AGAIN
                </EpicButton>
               </div>
            </EpicCard>

            {/* Mentor Evaluation Card */}
            <div className="relative bg-slate-900/90 border border-slate-700 p-1 flex flex-col">
                <div className="absolute -top-3 -right-3 z-20">
                    <div className="bg-epicBlue text-black font-black text-xs px-3 py-1 uppercase -rotate-6 shadow-lg border border-white">
                        Mentor Eval
                    </div>
                </div>
                
                <div className="bg-black/40 flex-1 p-6 flex flex-col items-center text-center">
                    <div className="mb-4 scale-75 transform -mt-4">
                        <UstadzEpicAvatar size="md" />
                    </div>
                    <h3 className="text-epicBlue font-hero text-lg mb-2 uppercase tracking-wider border-b border-epicBlue/30 pb-2 w-full">
                        Final Assessment
                    </h3>
                    <p className="text-slate-300 text-sm leading-relaxed mb-4 italic">
                        "{mentorFeedback}"
                    </p>
                    <div className="mt-auto w-full bg-epicBlue/5 border border-epicBlue/20 p-3 rounded">
                        <p className="text-epicGold text-xs font-serif font-bold">
                            "{mentorWisdom}"
                        </p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    );
  }

  // 7. LOADING
  if (phase === GamePhase.PROCESSING) {
    return <LoadingView />;
  }

  return null;
};

export default App;
