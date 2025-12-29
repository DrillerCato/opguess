'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Music, Clock, Trophy, Play, RotateCcw, Zap } from 'lucide-react';
import { Anime, GameStatus, GameStats } from './types';
import { ANIME_DATABASE } from './data/animeData';

const GAME_TIME = 180; // 3 minutes

const AnimeOpQuest: React.FC = () => {
  // --- State ---
  const [status, setStatus] = useState<GameStatus>('MENU');
  const [stats, setStats] = useState<GameStats>({ score: 0, correct: 0, streak: 0, bestStreak: 0 });
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [currentRound, setCurrentRound] = useState<{
    correct: Anime;
    choices: Anime[];
  } | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // --- Game Logic ---
  const generateRound = useCallback(() => {
    const correct = ANIME_DATABASE[Math.floor(Math.random() * ANIME_DATABASE.length)];
    const others = ANIME_DATABASE
      .filter(a => a.id !== correct.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    
    const choices = [correct, ...others].sort(() => 0.5 - Math.random());
    
    setCurrentRound({ correct, choices });
    setSelectedId(null);
    setIsCorrect(null);
  }, []);

  const startGame = () => {
    setStats({ score: 0, correct: 0, streak: 0, bestStreak: 0 });
    setTimeLeft(GAME_TIME);
    setStatus('PLAYING');
    generateRound();
  };

  const handleAnswer = (animeId: number) => {
    if (selectedId !== null || !currentRound) return;

    setSelectedId(animeId);
    const correct = animeId === currentRound.correct.id;
    setIsCorrect(correct);

    if (correct) {
      const streakBonus = Math.floor(stats.streak / 3) * 2; // Extra 2 points every 3-streak
      const pointsEarned = 5 + streakBonus;
      
      setStats(prev => ({
        ...prev,
        score: prev.score + pointsEarned,
        correct: prev.correct + 1,
        streak: prev.streak + 1,
        bestStreak: Math.max(prev.bestStreak, prev.streak + 1)
      }));

      setTimeout(() => generateRound(), 1200);
    } else {
      setStats(prev => ({
        ...prev,
        score: Math.max(0, prev.score - 3),
        streak: 0
      }));
      // Allow user to try again or show correct answer after a delay
      setTimeout(() => setSelectedId(null), 1000);
    }
  };

  // --- Timer ---
  useEffect(() => {
    let timer: number;
    if (status === 'PLAYING' && timeLeft > 0) {
      timer = window.setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setStatus('FINISHED');
    }
    return () => clearInterval(timer);
  }, [status, timeLeft]);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-cyan-500">
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-cyan-500 rounded-lg">
              <Music className="text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tighter uppercase">Animesh</h1>
          </div>
          
          {status === 'PLAYING' && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-full border border-slate-800">
                <Clock className={timeLeft < 30 ? 'text-red-500 animate-pulse' : 'text-cyan-400'} />
                <span className="font-mono text-xl">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 uppercase font-bold">Score</p>
                <p className="text-2xl font-black text-cyan-400">{stats.score}</p>
              </div>
            </div>
          )}
        </header>

        {/* Game Area */}
        <main>
          {status === 'MENU' && (
            <div className="text-center space-y-8 py-12">
              <h2 className="text-6xl font-black mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                OPENING QUEST
              </h2>
              <p className="text-slate-400 text-lg max-w-md mx-auto">
                Test your ears. Guess the anime opening from the Spotify snippet.
              </p>
              <button 
                onClick={startGame}
                className="group relative px-12 py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-full transition-all hover:scale-105 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  START GAME <Play size={20} fill="currentColor" />
                </span>
              </button>
            </div>
          )}

          {status === 'PLAYING' && currentRound && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Spotify Player */}
              <div className="bg-slate-900 p-1 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
                <iframe
                  title="Spotify Player"
                  src={`https://open.spotify.com/embed/track/${currentRound.correct.spotifyId}?utm_source=generator&theme=0`}
                  width="100%"
                  height="152"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  className="rounded-2xl"
                />
              </div>

              {/* Choices */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentRound.choices.map((choice) => (
                  <button
                    key={choice.id}
                    onClick={() => handleAnswer(choice.id)}
                    disabled={selectedId !== null && isCorrect === true}
                    className={`
                      p-6 text-left rounded-2xl border-2 transition-all duration-200 font-bold text-lg
                      ${selectedId === choice.id 
                        ? (choice.id === currentRound.correct.id ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10')
                        : 'border-slate-800 bg-slate-900 hover:border-cyan-500 hover:bg-slate-800'}
                    `}
                  >
                    {choice.name}
                  </button>
                ))}
              </div>

              {/* Streak Indicator */}
              {stats.streak > 1 && (
                <div className="flex justify-center">
                  <div className="flex items-center gap-2 bg-orange-500/20 text-orange-400 px-4 py-1 rounded-full border border-orange-500/30 animate-bounce">
                    <Zap size={16} fill="currentColor" />
                    <span className="text-sm font-black">{stats.streak}x STREAK!</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {status === 'FINISHED' && (
            <div className="bg-slate-900 rounded-3xl p-12 border border-slate-800 text-center space-y-6">
              <Trophy size={80} className="mx-auto text-yellow-500" />
              <h2 className="text-4xl font-black">QUEST COMPLETE</h2>
              <div className="grid grid-cols-2 gap-4 py-6">
                <div className="p-4 bg-slate-950 rounded-2xl">
                  <p className="text-slate-500 text-xs uppercase font-bold">Total Score</p>
                  <p className="text-4xl font-black text-cyan-400">{stats.score}</p>
                </div>
                <div className="p-4 bg-slate-950 rounded-2xl">
                  <p className="text-slate-500 text-xs uppercase font-bold">Best Streak</p>
                  <p className="text-4xl font-black text-orange-400">{stats.bestStreak}</p>
                </div>
              </div>
              <button 
                onClick={startGame}
                className="flex items-center gap-2 mx-auto px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-slate-200 transition-colors"
              >
                <RotateCcw size={20} /> PLAY AGAIN
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AnimeOpQuest;