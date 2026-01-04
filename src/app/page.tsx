'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Music, Clock, Trophy, RotateCcw, Zap, Volume2, VolumeX, ListOrdered, Image, Timer } from 'lucide-react';
import { ANIME_DATABASE, Anime } from './animeData';

interface ScoreEntry { name: string; score: number; date: string; time?: number; }
type GameStatus = 'MENU' | 'MODE_SELECT' | 'PLAYING' | 'FINISHED' | 'LEADERBOARD';
type GameMode = 'TIMED' | 'SPRINT';

export default function AnimeOpQuest() {
  const [status, setStatus] = useState<GameStatus>('MENU');
  const [gameMode, setGameMode] = useState<GameMode>('TIMED');
  const [stats, setStats] = useState({ score: 0, correct: 0, streak: 0, bestStreak: 0, questionsAnswered: 0 });
  const [timeLeft, setTimeLeft] = useState(60);
  const [elapsedTime, setElapsedTime] = useState(0);
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
  const startTimeRef = useRef<number>(0);

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

  // Load leaderboard
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

  // Timer logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status === 'PLAYING') {
      if (gameMode === 'TIMED' && timeLeft > 0) {
        timer = setInterval(() => setTimeLeft(v => v - 1), 1000);
      } else if (gameMode === 'SPRINT') {
        timer = setInterval(() => setElapsedTime(v => v + 1), 1000);
      }
      
      if (gameMode === 'TIMED' && timeLeft === 0) setStatus('FINISHED');
      if (gameMode === 'SPRINT' && stats.questionsAnswered >= 10) setStatus('FINISHED');
    }
    return () => clearInterval(timer);
  }, [status, timeLeft, gameMode, stats.questionsAnswered]);

  const generateRound = (currentPool: Anime[]) => {
    if (currentPool.length === 0 || (gameMode === 'SPRINT' && stats.questionsAnswered >= 10)) {
      setStatus('FINISHED');
      return;
    }
    
    const newPool = [...currentPool];
    const correctIdx = Math.floor(Math.random() * newPool.length);
    const correct = newPool.splice(correctIdx, 1)[0];
    
    setSongPool(newPool);
    setImageError(false);

    const others = ANIME_DATABASE.filter(a => a.id !== correct.id).sort(() => 0.5 - Math.random()).slice(0, 3);
    const choices = [correct, ...others].sort(() => 0.5 - Math.random());
    
    setCurrentRound({ correct, choices });
    setSelectedId(null);
  };

  const startGame = (mode: GameMode) => {
    const shuffled = [...ANIME_DATABASE].sort(() => 0.5 - Math.random());
    setGameMode(mode);
    setStats({ score: 0, correct: 0, streak: 0, bestStreak: 0, questionsAnswered: 0 });
    setTimeLeft(60);
    setElapsedTime(0);
    startTimeRef.current = Date.now();
    setStatus('PLAYING');
    generateRound(shuffled);
  };

  const handleAnswer = (animeId: number) => {
    if (selectedId !== null || !currentRound) return;
    setSelectedId(animeId);

    const isCorrect = animeId === currentRound.correct.id;
    
    if (isCorrect) {
      correctSfxRef.current?.play().catch(() => {});
      const added = 10 + (stats.streak * 2);
      setPopScore({ id: Date.now(), val: added });
      setStats(prev => ({
        score: prev.score + added,
        correct: prev.correct + 1,
        streak: prev.streak + 1,
        bestStreak: Math.max(prev.bestStreak, prev.streak + 1),
        questionsAnswered: prev.questionsAnswered + 1
      }));
      setTimeout(() => {
        setPopScore(null);
        generateRound(songPool);
      }, 1200);
    } else {
      wrongSfxRef.current?.play().catch(() => {});
      setStats(prev => ({ 
        ...prev, 
        streak: 0,
        questionsAnswered: prev.questionsAnswered + 1 
      }));
      setTimeout(() => generateRound(songPool), 2000);
    }
  };

  const saveScore = () => {
    const name = prompt("Enter Name:") || "Anonymous";
    const newEntry: ScoreEntry = { 
      name, 
      score: stats.score, 
      date: new Date().toLocaleDateString(),
      time: gameMode === 'SPRINT' ? elapsedTime : undefined
    };
    const updated = [...leaderboard, newEntry].sort((a, b) => b.score - a.score).slice(0, 10);
    setLeaderboard(updated);
    localStorage.setItem('anime_leaderboard', JSON.stringify(updated));
    setStatus('LEADERBOARD');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-4">
      <style jsx global>{`
        @keyframes floatUp { 0% { transform: translateY(0); opacity: 1; scale: 0.8; } 100% { transform: translateY(-60px); opacity: 0; scale: 1.2; } }
        .animate-float { animation: floatUp 0.8s ease-out forwards; }
        input[type='range'] { accent-color: #06b6d4; }
      `}</style>

      <audio ref={audioRef} key={currentRound?.correct.audioUrl} autoPlay loop>
        <source src={currentRound?.correct.audioUrl} type="video/webm" />
      </audio>
      <audio ref={correctSfxRef}><source src="/sound/correct.mp3" type="audio/mpeg" /></audio>
      <audio ref={wrongSfxRef}><source src="/sound/wrong.mp3" type="audio/mpeg" /></audio>

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

        {/* MENU */}
        {status === 'MENU' && (
          <div className="bg-slate-900/80 border border-slate-800 p-10 rounded-[2.5rem] text-center backdrop-blur-md">
            <Trophy size={60} className="mx-auto text-yellow-500 mb-6" />
            <h2 className="text-2xl font-black mb-6 tracking-tight">ANIME OPENING QUIZ</h2>
            <button onClick={() => setStatus('MODE_SELECT')} className="w-full py-5 bg-cyan-500 text-black font-black rounded-2xl hover:bg-cyan-400 transition-all uppercase tracking-widest shadow-xl shadow-cyan-500/20">
              Start Game
            </button>
            <button onClick={() => setStatus('LEADERBOARD')} className="mt-6 text-slate-500 text-xs font-black uppercase hover:text-white transition-colors">Leaderboard</button>
          </div>
        )}

        {/* MODE SELECT */}
        {status === 'MODE_SELECT' && (
          <div className="bg-slate-900/80 border border-slate-800 p-8 rounded-[2.5rem] backdrop-blur-md">
            <h2 className="text-xl font-black mb-6 text-center uppercase">Choose Game Mode</h2>
            <div className="space-y-4">
              <button onClick={() => startGame('TIMED')} className="w-full p-6 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl hover:from-cyan-500 hover:to-blue-500 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <Clock size={24} />
                  <span className="font-black text-lg">TIME ATTACK</span>
                </div>
                <p className="text-sm text-cyan-100">Answer as many as possible in 60 seconds!</p>
              </button>
              <button onClick={() => startGame('SPRINT')} className="w-full p-6 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl hover:from-orange-500 hover:to-red-500 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <Timer size={24} />
                  <span className="font-black text-lg">SPEED RUN</span>
                </div>
                <p className="text-sm text-orange-100">Complete 10 questions as fast as possible!</p>
              </button>
            </div>
            <button onClick={() => setStatus('MENU')} className="mt-6 w-full text-slate-500 text-xs font-black uppercase hover:text-white transition-colors">Back</button>
          </div>
        )}

        {/* PLAYING */}
        {status === 'PLAYING' && currentRound && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex justify-between px-2 text-[11px] font-black uppercase">
              <div className="flex items-center gap-2 bg-slate-900/80 px-4 py-2 rounded-full border border-slate-800">
                {gameMode === 'TIMED' ? (
                  <>
                    <Clock size={14} className={timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-cyan-400'}/> 
                    <span className={timeLeft < 10 ? 'text-red-500' : ''}>{timeLeft}s</span>
                  </>
                ) : (
                  <>
                    <Timer size={14} className="text-orange-400"/> 
                    <span>{formatTime(elapsedTime)}</span>
                    <span className="text-slate-500">({stats.questionsAnswered}/10)</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 bg-orange-500/10 px-4 py-2 rounded-full border border-orange-500/20">
                <Zap size={14} className="text-orange-500 fill-orange-500"/> 
                <span className="text-orange-500">{stats.streak}x Combo</span>
              </div>
            </div>

            <div className={`relative bg-slate-950 aspect-video rounded-[2rem] border-2 overflow-hidden flex items-center justify-center transition-all duration-500 ${selectedId === currentRound.correct.id ? 'border-green-500 ring-4 ring-green-500/20' : 'border-slate-800'}`}>
              {selectedId === null ? (
                imageError ? (
                  <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                    <Image size={48} className="text-slate-600" />
                  </div>
                ) : (
                  <img src="/images/placeholder.png" className="w-full h-full object-cover" alt="Placeholder" onError={() => setImageError(true)} />
                )
              ) : (
                <img src={currentRound.correct.imageUrl} className="w-full h-full object-cover transition-all duration-700 animate-in fade-in" alt={currentRound.correct.name} onError={() => setImageError(true)} />
              )}
            </div>

            <div className="flex items-center gap-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-800/50">
              <button onClick={() => setIsMuted(!isMuted)} className="text-cyan-400">
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="flex-1 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer" />
            </div>

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

        {/* FINISHED */}
        {status === 'FINISHED' && (
          <div className="bg-slate-900 border border-slate-800 p-10 rounded-[2.5rem] text-center shadow-2xl">
            <p className="text-slate-500 font-black uppercase text-xs mb-2">Final Score</p>
            <h2 className="text-8xl font-black mb-4 text-cyan-400">{stats.score}</h2>
            {gameMode === 'SPRINT' && (
              <p className="text-slate-400 font-bold mb-6">Time: {formatTime(elapsedTime)}</p>
            )}
            <div className="flex gap-3">
              <button onClick={saveScore} className="flex-1 py-5 bg-white text-black font-black rounded-2xl hover:bg-slate-200 transition-all uppercase tracking-widest">Save Rank</button>
              <button onClick={() => setStatus('MODE_SELECT')} className="px-8 bg-slate-800 rounded-2xl border border-slate-700 hover:bg-slate-700"><RotateCcw size={24}/></button>
            </div>
          </div>
        )}

        {/* LEADERBOARD */}
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
                      <div className="text-right">
                        <span className="font-black text-cyan-400">{entry.score}</span>
                        {entry.time && <p className="text-xs text-slate-500">{formatTime(entry.time)}</p>}
                      </div>
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