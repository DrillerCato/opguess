
export interface Anime {
  id: number;
  name: string;
  spotifyId: string;
  op: string;
}

export type GameStatus = 'MENU' | 'PLAYING' | 'FINISHED';


export interface GameStats {
  score: number;
  correct: number;
  streak: number;
  bestStreak: number;
}

export interface LeaderboardEntry {
  name: string;
  score: number;
}