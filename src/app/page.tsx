'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Music, Clock, Trophy, Play, RotateCcw, Zap, Volume2, Heart } from 'lucide-react';

// --- TYPES (Integrated) ---
interface Anime {
  id: number;
  name: string;
  spotifyId: string;
  op: string;
}

type GameStatus = 'MENU' | 'PLAYING' | 'FINISHED';

interface GameStats {
  score: number;
  correct: number;
  streak: number;
  bestStreak: number;
}

// --- DATABASE (Integrated to avoid import errors) ---
const ANIME_DATABASE: Anime[] = [
  { id: 1, name: "Attack on Titan", spotifyId: "6n7AFm3PmEFi1gAF51ahID", op: "Shinzou wo Sasageyo" },
  { id: 2, name: "Demon Slayer", spotifyId: "5LYLCApbx7fH7xHXWUpjqM", op: "Gurenge" },
  { id: 3, name: "My Hero Academia", spotifyId: "0v4f4JkNoACiWbvslNUHGO", op: "Peace Sign" },
  { id: 4, name: "Jujutsu Kaisen", spotifyId: "22VdIch4ekDGwkj6r6KKMn", op: "Kaikai Kitan" },
  { id: 5, name: "One Piece", spotifyId: "3FHPfwGfx3ykarXqJe8MxG", op: "We Are!" },
  { id: 6, name: "Naruto", spotifyId: "6RlHCseiYhdEYa7RNFDjY3", op: "Silhouette" },
  { id: 7, name: "Tokyo Ghoul", spotifyId: "3ee8Jmje8o58oTcuzt1mWH", op: "Unravel" },
  { id: 8, name: "Sword Art Online", spotifyId: "0WYWjJVdvWJxP5FNLYsEKD", op: "Crossing Field" },
  { id: 9, name: "Fullmetal Alchemist", spotifyId: "1OVwJTbrubnaCL5z5ZAFDO", op: "Again" },
  { id: 10, name: "One Punch Man", spotifyId: "6cZwYzfgCD42lHeOL65Iy0", op: "THE HERO!!" },
  { id: 11, name: "Bleach", spotifyId: "3rWZbuWNiG3lssqvr8wqDw", op: "Asterisk" },
  { id: 12, name: "Code Geass", spotifyId: "7mvw6D8Rj0T9R5gzTpNEzT", op: "COLORS" },
  { id: 13, name: "Mob Psycho 100", spotifyId: "2eo84tI1nvfJqCdLGrSk0m", op: "99" },
  { id: 14, name: "Hunter x Hunter", spotifyId: "6hjUDIdYjEYSNvn0T3eXYS", op: "Departure!" },
  { id: 15, name: "Death Note", spotifyId: "5GQCCNnhY1Lq1m33IVlqjO", op: "the WORLD" },
  { id: 16, name: "Steins Gate", spotifyId: "3RIAlhfSMoO9yUYEJMIL9I", op: "Hacking to the Gate" },
  { id: 17, name: "Cowboy Bebop", spotifyId: "5K7V0JYzxNxiBLly5JwlOe", op: "Tank!" },
  { id: 18, name: "Fairy Tail", spotifyId: "4jlbZUaEYkJfNrNtJyYRjh", op: "Snow Fairy" },
  { id: 19, name: "Black Clover", spotifyId: "0woNqGCgLjkEE5PdKxwwl0", op: "Black Rover" },
  { id: 20, name: "Vinland Saga", spotifyId: "0TbCEkaSWPnSSqj4Xm4v3i", op: "MUKANJYO" },
  { id: 21, name: "Chainsaw Man", spotifyId: "3mguEjIxJJpcKyfoZYoUvE", op: "KICK BACK" },
  { id: 22, name: "Spy x Family", spotifyId: "4e8MbLpscP6RAXGJcvqwGu", op: "Mixed Nuts" },
  { id: 23, name: "Dragon Ball Z", spotifyId: "0EmeFodog0BfCgMzAIvKQp", op: "Cha-La Head-Cha-La" },
  { id: 24, name: "Neon Genesis Evangelion", spotifyId: "3A5pXbpiLKAYVAGYpHAYvU", op: "A Cruel Angel's Thesis" },
  { id: 25, name: "Tokyo Revengers", spotifyId: "0I3q5fW5wMDCTMKv26bNXC", op: "Cry Baby" },
  { id: 26, name: "Fire Force", spotifyId: "2ILBm5rBXiSwVnaDQT2ZFJ", op: "Inferno" },
  { id: 27, name: "Blue Lock", spotifyId: "0kKLNsM8lW1J5gLDnlYCVt", op: "CHAOS" },
  { id: 28, name: "Haikyuu!!", spotifyId: "5ygDXis42ncn6kYG14lEVG", op: "Hikari Are" },
  { id: 29, name: "The Promised Neverland", spotifyId: "0t2yF64GEvkYQsMWHfLvWr", op: "Touch Off" },
  { id: 30, name: "Re:Zero", spotifyId: "6xGLBu6cZmb4I6aM3xzYqg", op: "Redo" },
  { id: 31, name: "Dr. Stone", spotifyId: "1qrpoO4qj7flP0jHhGdXPp", op: "Good Morning World!" },
  { id: 32, name: "Overlord", spotifyId: "7hR06CiPxBpDGIvJHqf8Ft", op: "Clattanoia" },
  { id: 33, name: "Noragami", spotifyId: "2LQSF3GKMZ5bYGIVqpFUhE", op: "Goya no Machiawase" },
  { id: 34, name: "Soul Eater", spotifyId: "4YdKGvn2txOAYCDJYTLBN1", op: "Resonance" },
  { id: 35, name: "Parasyte", spotifyId: "5nTtCOCds6I0PHMNtqelas", op: "Let Me Hear" },
  { id: 36, name: "Your Lie in April", spotifyId: "2dR5nwXT6NQI2Yd0EDJBsC", op: "Hikaru nara" },
  { id: 37, name: "Assassination Classroom", spotifyId: "1CdU1hGbqWqUAX7h8ZzYN6", op: "Seishun Satsubatsu-ron" },
  { id: 38, name: "Made in Abyss", spotifyId: "66FElZQxIKvXFLnuRWx8JA", op: "Deep in Abyss" },
  { id: 39, name: "Erased", spotifyId: "3aVoxCp9BNL9p8u8Zz1Bte", op: "Re:Re:" },
  { id: 40, name: "Violet Evergarden", spotifyId: "6EFYTVyiDXJoMnKEcI05e4", op: "Sincerely" },
  { id: 41, name: "Terror in Resonance", spotifyId: "1HJ2m7mDPJKTZZfePzQlpx", op: "Trigger" },
  { id: 42, name: "Durarara!!", spotifyId: "6jyGTqHANr0TbYwsRETaXg", op: "Uragiri no Yuuyake" },
  { id: 43, name: "Bungou Stray Dogs", spotifyId: "2uXq2btzD9VQDLQcSdXRr7", op: "Trash Candy" },
  { id: 44, name: "The Seven Deadly Sins", spotifyId: "60WWxz6a5qlJQAGlIbqNAX", op: "Netsujou no Spectrum" },
  { id: 45, name: "Dororo", spotifyId: "5YhFvgQvlcHlH9LnLMFDx4", op: "Kaen" },
  { id: 46, name: "Fruits Basket", spotifyId: "1ynPFGxYDfxGP9tDPaMR1I", op: "Again" },
  { id: 47, name: "Toradora!", spotifyId: "0GnNviKpzLrDsGdlWYLVzY", op: "Pre-Parade" },
  { id: 48, name: "March Comes in Like a Lion", spotifyId: "3P8fzDZfJQHBQfBMSBrJij", op: "Answer" },
  { id: 49, name: "Kaguya-sama: Love is War", spotifyId: "4qWYLE3M1YEZTJb0qvz4pr", op: "Love Dramatic" },
  { id: 50, name: "The Rising of the Shield Hero", spotifyId: "2T4YXcWSScWSMx2NSqxuAd", op: "RISE" }
];

const GAME_TIME = 180; // 3 minutes

export default function AnimeOpQuest() {
  const [status, setStatus] = useState<GameStatus>('MENU');
  const [stats, setStats] = useState<GameStats>({ score: 0, correct: 0, streak: 0, bestStreak: 0 });
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [currentRound, setCurrentRound] = useState<{
    correct: Anime;
    choices: Anime[];
  } | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

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
      const points = 5 + (Math.floor(stats.streak / 3) * 2);
      setStats(prev => ({
        ...prev,
        score: prev.score + points,
        correct: prev.correct + 1,
        streak: prev.streak + 1,
        bestStreak: Math.max(prev.bestStreak, prev.streak + 1)
      }));
      setTimeout(() => generateRound(), 1200);
    } else {
      setStats(prev => ({ ...prev, score: Math.max(0, prev.score - 3), streak: 0 }));
      setTimeout(() => setSelectedId(null), 1000);
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status === 'PLAYING' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setStatus('FINISHED');
    }
    return () => clearInterval(timer);
  }, [status, timeLeft]);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-cyan-500 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <Music className="text-cyan-400" />
            <h1 className="text-xl font-black uppercase tracking-widest">Anime OP Guess</h1>
          </div>
          {status === 'PLAYING' && (
            <div className="flex items-center gap-4 bg-slate-900 px-4 py-2 rounded-full border border-slate-800">
              <Clock className={timeLeft < 30 ? 'text-red-500 animate-pulse' : 'text-cyan-400'} />
              <span className="font-mono text-xl">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
            </div>
          )}
        </div>

        {/* Menu */}
        {status === 'MENU' && (
          <div className="text-center bg-slate-900 border border-slate-800 p-12 rounded-3xl shadow-2xl">
            <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
            <h2 className="text-4xl font-black mb-4">Are you a True Fans?</h2>
            <p className="text-slate-400 mb-8">Guess 50 iconic openings in 3 minutes.</p>
            <button 
              onClick={startGame}
              className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-black rounded-xl transition-transform hover:scale-105"
            >
              START QUEST
            </button>
          </div>
        )}

        {/* Game UI */}
        {status === 'PLAYING' && currentRound && (
          <div className="space-y-6">
            <div className="bg-slate-900 p-1 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
              <iframe
                title="Spotify"
                src={`https://open.spotify.com/embed/track/${currentRound.correct.spotifyId}?utm_source=generator&theme=0`}
                width="100%"
                height="152"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                className="rounded-xl"
              />
            </div>

            <div className="grid grid-cols-1 gap-3">
              {currentRound.choices.map((choice) => (
                <button
                  key={choice.id}
                  onClick={() => handleAnswer(choice.id)}
                  className={`p-4 text-left rounded-xl border-2 font-bold transition-all
                    ${selectedId === choice.id 
                      ? (choice.id === currentRound.correct.id ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10')
                      : 'border-slate-800 bg-slate-900 hover:border-cyan-500'}
                  `}
                >
                  {choice.name}
                </button>
              ))}
            </div>

            {stats.streak > 2 && (
              <div className="flex justify-center animate-bounce">
                <div className="bg-orange-500 text-black text-xs font-black px-3 py-1 rounded-full flex items-center gap-1">
                  <Zap size={14} fill="currentColor" /> {stats.streak} STREAK
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {status === 'FINISHED' && (
          <div className="bg-slate-900 p-10 rounded-3xl border border-slate-800 text-center">
            <h2 className="text-3xl font-black text-cyan-400 mb-2">TIME EXPIRED!</h2>
            <div className="text-7xl font-black mb-6">{stats.score}</div>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-950 p-4 rounded-xl">
                <p className="text-xs text-slate-500 uppercase">Correct</p>
                <p className="text-xl font-bold">{stats.correct}</p>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl">
                <p className="text-xs text-slate-500 uppercase">Best Streak</p>
                <p className="text-xl font-bold">{stats.bestStreak}</p>
              </div>
            </div>
            <button 
              onClick={startGame}
              className="flex items-center gap-2 mx-auto px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-slate-200"
            >
              <RotateCcw size={20} /> TRY AGAIN
            </button>
          </div>
        )}
      </div>
    </div>
  );
}