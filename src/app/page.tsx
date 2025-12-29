'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Music, Clock, Trophy, RotateCcw, Zap, Volume2, VolumeX, ListOrdered, Image } from 'lucide-react';

// --- TYPES ---
interface Anime { id: number; name: string; audioUrl: string; imageUrl: string; }
interface ScoreEntry { name: string; score: number; date: string; }
type GameStatus = 'MENU' | 'PLAYING' | 'FINISHED' | 'LEADERBOARD';

// --- DATABASE (FULL 50 SONGS) ---
const ANIME_DATABASE: Anime[] = [
  { id: 1, name: "Attack on Titan", audioUrl: "https://v.animethemes.moe/ShingekiNoKyojin-OP1.webm", imageUrl: "/images/anime-1.jpg" },
  { id: 2, name: "Demon Slayer", audioUrl: "https://v.animethemes.moe/KimetsuNoYaiba-OP1.webm", imageUrl: "/images/anime-2.jpg" },
  { id: 3, name: "Jujutsu Kaisen", audioUrl: "https://v.animethemes.moe/JujutsuKaisen-OP1.webm", imageUrl: "/images/anime-3.jpg" },
  { id: 4, name: "One Piece", audioUrl: "https://v.animethemes.moe/OnePiece-OP1.webm", imageUrl: "/images/anime-4.jpg" },
  { id: 5, name: "Naruto Shippuden", audioUrl: "https://v.animethemes.moe/NarutoShippuden-OP6.webm", imageUrl: "/images/anime-5.jpg" },
  { id: 6, name: "Tokyo Ghoul", audioUrl: "https://v.animethemes.moe/TokyoGhoul-OP1.webm", imageUrl: "/images/anime-6.jpg" },
  { id: 7, name: "Fullmetal Alchemist: B", audioUrl: "https://v.animethemes.moe/FullmetalAlchemistBrotherhood-OP1.webm", imageUrl: "/images/anime-7.jpg" },
  { id: 8, name: "Neon Genesis Evangelion", audioUrl: "https://v.animethemes.moe/NeonGenesisEvangelion-OP1.webm", imageUrl: "/images/anime-8.jpg" },
  { id: 9, name: "Oshi No Ko", audioUrl: "https://v.animethemes.moe/OshiNoKo-OP1.webm", imageUrl: "/images/anime-9.jpg" },
  { id: 10, name: "Chainsaw Man", audioUrl: "https://v.animethemes.moe/ChainsawMan-OP1.webm", imageUrl: "/images/anime-10.jpg" },
  { id: 11, name: "Blue Lock", audioUrl: "https://v.animethemes.moe/BlueLock-OP1.webm", imageUrl: "/images/anime-11.jpg" },
  { id: 12, name: "Spy x Family", audioUrl: "https://v.animethemes.moe/SpyXFamily-OP1.webm", imageUrl: "/images/anime-12.jpg" },
  { id: 13, name: "Cyberpunk Edgerunners", audioUrl: "https://v.animethemes.moe/CyberpunkEdgerunners-OP1.webm", imageUrl: "/images/anime-13.jpg" },
  { id: 14, name: "Death Note", audioUrl: "https://v.animethemes.moe/DeathNote-OP1.webm", imageUrl: "/images/anime-14.jpg" },
  { id: 15, name: "Hunter x Hunter (2011)", audioUrl: "https://v.animethemes.moe/HunterHunter2011-OP1.webm", imageUrl: "/images/anime-15.jpg" },
  { id: 16, name: "Bleach", audioUrl: "https://v.animethemes.moe/Bleach-OP1.webm", imageUrl: "/images/anime-16.jpg" },
  { id: 17, name: "My Hero Academia", audioUrl: "https://v.animethemes.moe/BokuNoHeroAcademia-OP1.webm", imageUrl: "/images/anime-17.jpg" },
  { id: 18, name: "Black Clover", audioUrl: "https://v.animethemes.moe/BlackClover-OP1.webm", imageUrl: "/images/anime-18.jpg" },
  { id: 19, name: "Vinland Saga", audioUrl: "https://v.animethemes.moe/VinlandSaga-OP1.webm", imageUrl: "/images/anime-19.jpg" },
  { id: 20, name: "Haikyuu!!", audioUrl: "https://v.animethemes.moe/Haikyuu-OP1.webm", imageUrl: "/images/anime-20.jpg" },
  { id: 21, name: "Solo Leveling", audioUrl: "https://v.animethemes.moe/SoloLeveling-OP1.webm", imageUrl: "/images/anime-21.jpg" },
  { id: 22, name: "Sword Art Online", audioUrl: "https://v.animethemes.moe/SwordArtOnline-OP1.webm", imageUrl: "/images/anime-22.jpg" },
  { id: 23, name: "One Punch Man", audioUrl: "https://v.animethemes.moe/OnePunchMan-OP1.webm", imageUrl: "/images/anime-23.jpg" },
  { id: 24, name: "Mob Psycho 100", audioUrl: "https://v.animethemes.moe/MobPsycho100-OP1.webm", imageUrl: "/images/anime-24.jpg" },
  { id: 25, name: "Steins;Gate", audioUrl: "https://v.animethemes.moe/SteinsGate-OP1.webm", imageUrl: "/images/anime-25.jpg" },
  { id: 26, name: "Code Geass", audioUrl: "https://v.animethemes.moe/CodeGeass-OP1.webm", imageUrl: "/images/anime-26.jpg" },
  { id: 27, name: "Cowboy Bebop", audioUrl: "https://v.animethemes.moe/CowboyBebop-OP1.webm", imageUrl: "/images/anime-27.jpg" },
  { id: 28, name: "Dr. Stone", audioUrl: "https://v.animethemes.moe/DrStone-OP1.webm", imageUrl: "/images/anime-28.jpg" },
  { id: 29, name: "Fire Force", audioUrl: "https://v.animethemes.moe/EnenNoShoubouitai-OP1.webm", imageUrl: "/images/anime-29.jpg" },
  { id: 30, name: "Fate/Zero", audioUrl: "https://v.animethemes.moe/FateZero-OP1.webm", imageUrl: "/images/anime-30.jpg" },
  { id: 31, name: "Frieren", audioUrl: "https://v.animethemes.moe/SousouNoFrieren-OP1.webm", imageUrl: "/images/anime-31.jpg" },
  { id: 32, name: "Mushoku Tensei", audioUrl: "https://v.animethemes.moe/MushokuTensei-OP1.webm", imageUrl: "/images/anime-32.jpg" },
  { id: 33, name: "Re:Zero", audioUrl: "https://v.animethemes.moe/ReZero-OP1.webm", imageUrl: "/images/anime-33.jpg" },
  { id: 34, name: "Kaguya-sama", audioUrl: "https://v.animethemes.moe/KaguyaSamaWaKokurasetai-OP1.webm", imageUrl: "/images/anime-34.jpg" },
  { id: 35, name: "Your Lie in April", audioUrl: "https://v.animethemes.moe/ShigatsuWaKimiNoUso-OP1.webm", imageUrl: "/images/anime-35.jpg" },
  { id: 36, name: "A Silent Voice", audioUrl: "https://v.animethemes.moe/KoeNoKatachi-OP1.webm", imageUrl: "/images/anime-36.jpg" },
  { id: 37, name: "No Game No Life", audioUrl: "https://v.animethemes.moe/NoGameNoLife-OP1.webm", imageUrl: "/images/anime-37.jpg" },
  { id: 38, name: "Parasyte", audioUrl: "https://v.animethemes.moe/Kiseijuu-OP1.webm", imageUrl: "/images/anime-38.jpg" },
  { id: 39, name: "Kill la Kill", audioUrl: "https://v.animethemes.moe/KillLaKill-OP1.webm", imageUrl: "/images/anime-39.jpg" },
  { id: 40, name: "Gurren Lagann", audioUrl: "https://v.animethemes.moe/TengenToppaGurrenLagann-OP1.webm", imageUrl: "/images/anime-40.jpg" },
  { id: 41, name: "Violet Evergarden", audioUrl: "https://v.animethemes.moe/VioletEvergarden-OP1.webm", imageUrl: "/images/anime-41.jpg" },
  { id: 42, name: "JoJo Part 1", audioUrl: "https://v.animethemes.moe/JojoNoKimyouNaBouken-OP1.webm", imageUrl: "/images/anime-42.jpg" },
  { id: 43, name: "Shield Hero", audioUrl: "https://v.animethemes.moe/TateNoYuushaNoNariagari-OP1.webm", imageUrl: "/images/anime-43.jpg" },
  { id: 44, name: "Dororo", audioUrl: "https://v.animethemes.moe/Dororo-OP1.webm", imageUrl: "/images/anime-44.jpg" },
  { id: 45, name: "Noragami", audioUrl: "https://v.animethemes.moe/Noragami-OP1.webm", imageUrl: "/images/anime-45.jpg" },
  { id: 46, name: "Hellsing Ultimate", audioUrl: "https://v.animethemes.moe/HellsingUltimate-OP1.webm", imageUrl: "/images/anime-46.jpg" },
  { id: 47, name: "Psycho-Pass", audioUrl: "https://v.animethemes.moe/PsychoPass-OP1.webm", imageUrl: "/images/anime-47.jpg" },
  { id: 48, name: "Samurai Champloo", audioUrl: "https://v.animethemes.moe/SamuraiChamploo-OP1.webm", imageUrl: "/images/anime-48.jpg" },
  { id: 49, name: "Gintama", audioUrl: "https://v.animethemes.moe/Gintama-OP1.webm", imageUrl: "/images/anime-49.jpg" },
  { id: 50, name: "Great Teacher Onizuka", audioUrl: "https://v.animethemes.moe/GTO-OP1.webm", imageUrl: "/images/anime-50.jpg" }
];

export default function AnimeOpQuest() {
  const [status, setStatus] = useState<GameStatus>('MENU');
  const [stats, setStats] = useState({ score: 0, correct: 0, streak: 0, bestStreak: 0 });
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentRound, setCurrentRound] = useState<{ correct: Anime; choices: Anime[] } | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [songPool, setSongPool] = useState<Anime[]>([]);
  const [leaderboard, setLeaderboard] = useState<ScoreEntry[]>([]);
  const [popScore, setPopScore] = useState<{ id: number; val: number } | null>(null);
  const [imageError, setImageError] = useState(false);

  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const correctSfxRef = useRef<HTMLAudioElement | null>(null);
  const wrongSfxRef = useRef<HTMLAudioElement | null>(null);

  // Volume control
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // Stop music when game finishes
  useEffect(() => {
    if (status === 'FINISHED' && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [status]);

  // Load leaderboard from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('anime_leaderboard');
    if (saved) {
      try {
        setLeaderboard(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load leaderboard:', e);
      }
    }
  }, []);

  // Timer countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status === 'PLAYING' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(v => v - 1), 1000);
    } else if (timeLeft === 0 && status === 'PLAYING') {
      setStatus('FINISHED');
    }
    return () => clearInterval(timer);
  }, [status, timeLeft]);

  const generateRound = useCallback((currentPool: Anime[]) => {
    if (currentPool.length === 0) {
      setStatus('FINISHED');
      return;
    }
    const newPool = [...currentPool];
    const correctIdx = Math.floor(Math.random() * newPool.length);
    const correct = newPool.splice(correctIdx, 1)[0];
    
    setSongPool(newPool);
    setImageError(false);

    const others = ANIME_DATABASE
      .filter(a => a.id !== correct.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    const choices = [correct, ...others].sort(() => 0.5 - Math.random());
    setCurrentRound({ correct, choices });
    setSelectedId(null);
  }, []);

  const startGame = () => {
    const shuffled = [...ANIME_DATABASE].sort(() => 0.5 - Math.random());
    setStats({ score: 0, correct: 0, streak: 0, bestStreak: 0 });
    setTimeLeft(60);
    setStatus('PLAYING');
    generateRound(shuffled);
  };

  const handleAnswer = (animeId: number) => {
    if (selectedId !== null || !currentRound) return;
    setSelectedId(animeId);

    if (animeId === currentRound.correct.id) {
      // Play correct sound effect
      if (correctSfxRef.current) {
        correctSfxRef.current.currentTime = 0;
        correctSfxRef.current.play().catch(() => {});
      }
      
      const added = 10 + (stats.streak * 2);
      setPopScore({ id: Date.now(), val: added });
      setStats(prev => ({
        ...prev,
        score: prev.score + added,
        correct: prev.correct + 1,
        streak: prev.streak + 1,
        bestStreak: Math.max(prev.bestStreak, prev.streak + 1)
      }));
      setTimeout(() => {
        setPopScore(null);
        generateRound(songPool);
      }, 1200);
    } else {
      // Play wrong sound effect
      if (wrongSfxRef.current) {
        wrongSfxRef.current.currentTime = 0;
        wrongSfxRef.current.play().catch(() => {});
      }
      
      setStats(prev => ({ ...prev, streak: 0 }));
      setTimeout(() => generateRound(songPool), 2000);
    }
  };

  const saveScore = () => {
    const name = prompt("Enter Name:") || "Anonymous";
    const newEntry = { name, score: stats.score, date: new Date().toLocaleDateString() };
    const updated = [...leaderboard, newEntry].sort((a, b) => b.score - a.score).slice(0, 10);
    setLeaderboard(updated);
    localStorage.setItem('anime_leaderboard', JSON.stringify(updated));
    setStatus('LEADERBOARD');
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-4">
      <style jsx global>{`
        @keyframes floatUp { 0% { transform: translateY(0); opacity: 1; scale: 0.8; } 100% { transform: translateY(-60px); opacity: 0; scale: 1.2; } }
        .animate-float { animation: floatUp 0.8s ease-out forwards; }
        input[type='range'] { accent-color: #06b6d4; }
      `}</style>

      {/* Main Audio (Opening Song) */}
      <audio ref={audioRef} key={currentRound?.correct.audioUrl} autoPlay loop>
        <source src={currentRound?.correct.audioUrl} type="video/webm" />
      </audio>

      {/* Sound Effects */}
      <audio ref={correctSfxRef}>
        <source src="/sound/correct.mp3" type="audio/mpeg" />
      </audio>
      <audio ref={wrongSfxRef}>
        <source src="/sound/wrong.mp3" type="audio/mpeg" />
      </audio>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 relative">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-cyan-600 rounded-xl shadow-lg">
              <Music size={20} className="text-white"/>
            </div>
            <h1 className="font-black italic text-xl tracking-tighter uppercase">OP Quest</h1>
          </div>
          <div className="text-right">
            {popScore && <span key={popScore.id} className="absolute -top-8 right-0 text-green-400 font-black text-2xl animate-float">+{popScore.val}</span>}
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Score</p>
            <p className="text-2xl font-black">{stats.score}</p>
          </div>
        </div>

        {/* MENU SCREEN */}
        {status === 'MENU' && (
          <div className="bg-slate-900/80 border border-slate-800 p-10 rounded-[2.5rem] text-center backdrop-blur-md">
            <Trophy size={60} className="mx-auto text-yellow-500 mb-6" />
            <h2 className="text-2xl font-black mb-6 tracking-tight">ANIME OPENING QUIZ</h2>
            <button onClick={startGame} className="w-full py-5 bg-cyan-500 text-black font-black rounded-2xl hover:bg-cyan-400 transition-all uppercase tracking-widest shadow-xl shadow-cyan-500/20">
              Start Game
            </button>
            <button onClick={() => setStatus('LEADERBOARD')} className="mt-6 text-slate-500 text-xs font-black uppercase hover:text-white transition-colors">Leaderboard</button>
          </div>
        )}

        {/* PLAYING SCREEN */}
        {status === 'PLAYING' && currentRound && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {/* Timer & Streak */}
            <div className="flex justify-between px-2 text-[11px] font-black uppercase">
              <div className="flex items-center gap-2 bg-slate-900/80 px-4 py-2 rounded-full border border-slate-800">
                <Clock size={14} className={timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-cyan-400'}/> 
                <span className={timeLeft < 10 ? 'text-red-500' : ''}>{timeLeft}s</span>
              </div>
              <div className="flex items-center gap-2 bg-orange-500/10 px-4 py-2 rounded-full border border-orange-500/20">
                <Zap size={14} className="text-orange-500 fill-orange-500"/> 
                <span className="text-orange-500">{stats.streak}x Combo</span>
              </div>
            </div>

            {/* Image Display Area */}
            <div
  className={`relative bg-slate-950 aspect-video rounded-[2rem] border-2 overflow-hidden flex items-center justify-center transition-all duration-500
  ${selectedId === currentRound.correct.id
    ? 'border-green-500 ring-4 ring-green-500/20'
    : 'border-slate-800'}`}
>
  {selectedId === null ? (
    imageError ? (
      // React fallback (SAFE)
      <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Image size={48} className="text-slate-600" />
      </div>
    ) : (
      <img
        src="/images/placeholder.png"
        className="w-full h-full object-cover"
        alt="Placeholder"
        onError={() => setImageError(true)}
      />
    )
  ) : (
    <img
      src={currentRound.correct.imageUrl}
      className="w-full h-full object-cover transition-all duration-700 animate-in fade-in"
      alt={currentRound.correct.name}
      onError={() => setImageError(true)}
    />
  )}
</div>


            {/* Volume Control */}
            <div className="flex items-center gap-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-800/50">
              <button onClick={() => setIsMuted(!isMuted)} className="text-cyan-400">
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="flex-1 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer" />
            </div>

            {/* Answer Choices */}
            <div className="grid gap-3">
              {currentRound.choices.map((choice) => (
                <button
                  key={choice.id}
                  onClick={() => handleAnswer(choice.id)}
                  disabled={selectedId !== null}
                  className={`w-full p-5 rounded-2xl border-2 font-black transition-all text-left ${
                    selectedId === choice.id 
                      ? (choice.id === currentRound.correct.id ? 'border-green-500 bg-green-500/20 text-green-400' : 'border-red-500 bg-red-500/20 text-red-400')
                      : (selectedId !== null && choice.id === currentRound.correct.id)
                        ? 'border-green-500/50 text-green-500/50'
                        : 'border-slate-800 bg-slate-900/40 hover:border-slate-600 hover:bg-slate-800'
                  }`}
                >
                  {choice.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* FINISHED SCREEN */}
        {status === 'FINISHED' && (
          <div className="bg-slate-900 border border-slate-800 p-10 rounded-[2.5rem] text-center shadow-2xl">
            <p className="text-slate-500 font-black uppercase text-xs mb-2">Final Score</p>
            <h2 className="text-8xl font-black mb-10 text-cyan-400">{stats.score}</h2>
            <div className="flex gap-3">
              <button onClick={saveScore} className="flex-1 py-5 bg-white text-black font-black rounded-2xl hover:bg-slate-200 transition-all uppercase tracking-widest">Save Rank</button>
              <button onClick={startGame} className="px-8 bg-slate-800 rounded-2xl border border-slate-700 hover:bg-slate-700"><RotateCcw size={24}/></button>
            </div>
          </div>
        )}

        {/* LEADERBOARD SCREEN */}
        {status === 'LEADERBOARD' && (
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem]">
             <div className="flex items-center gap-2 mb-6">
                <ListOrdered size={20} className="text-cyan-500" />
                <h2 className="text-xl font-black uppercase">Leaderboard</h2>
             </div>
             <div className="space-y-3 mb-8">
                {leaderboard.length === 0 ? (
                  <p className="text-center text-slate-500 py-8">No scores yet. Be the first!</p>
                ) : (
                  leaderboard.map((entry, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-slate-950/50 rounded-xl border border-slate-800/50">
                      <span className="font-bold text-slate-300">{i + 1}. {entry.name}</span>
                      <span className="font-black text-cyan-400">{entry.score}</span>
                    </div>
                  ))
                )}
             </div>
             <button onClick={() => setStatus('MENU')} className="w-full py-4 bg-slate-800 rounded-xl font-bold hover:bg-slate-700 transition-colors">Back to Menu</button>
          </div>
        )}
      </div>
    </div>
  );
}