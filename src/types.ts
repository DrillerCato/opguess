
export interface Anime {
  id: number;
  name: string;
  spotifyId: string;
  op: string;
}

/**
 * The possible states the game can be in
 */
export type GameStatus = 'MENU' | 'PLAYING' | 'FINISHED';

/**
 * Tracks the player's performance during a session
 */
export interface GameStats {
  score: number;
  correct: number;
  streak: number;
  bestStreak: number;
}

/**
 * Represents an entry in the leaderboard
 */
export interface LeaderboardEntry {
  name: string;
  score: number;
}