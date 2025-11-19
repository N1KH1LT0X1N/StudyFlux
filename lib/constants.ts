// File upload limits
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
];

// Points system
export const POINTS = {
  UPLOAD_DOCUMENT: 10,
  COMPLETE_SUMMARY: 5,
  ASK_QUESTION: 2,
  REVIEW_FLASHCARD_AGAIN: 1,
  REVIEW_FLASHCARD_HARD: 2,
  REVIEW_FLASHCARD_GOOD: 3,
  REVIEW_FLASHCARD_EASY: 5,
  COMPLETE_QUIZ: 10,
  DAILY_LOGIN: 5,
  STREAK_BONUS_7: 50,
  STREAK_BONUS_30: 200,
  STREAK_BONUS_100: 1000,
  STUDY_SESSION_PER_HOUR: 20,
};

// Level calculation
export const POINTS_PER_LEVEL = 100;

// Flashcard review qualities (SM-2 algorithm)
export const FLASHCARD_QUALITY = {
  AGAIN: 0,
  HARD: 3,
  GOOD: 4,
  EASY: 5,
};

// Spaced repetition intervals
export const SR_INTERVALS = {
  INITIAL: 1, // days
  SECOND: 6, // days
};

// Rate limits
export const RATE_LIMITS = {
  FREE_TIER: {
    AI_REQUESTS_PER_HOUR: 20,
    DOCUMENTS_PER_MONTH: 10,
    FLASHCARDS_PER_MONTH: 50,
  },
  PREMIUM_TIER: {
    AI_REQUESTS_PER_HOUR: 200,
    DOCUMENTS_PER_MONTH: Infinity,
    FLASHCARDS_PER_MONTH: Infinity,
  },
};

// Achievement tiers
export const ACHIEVEMENT_TIERS = {
  BRONZE: 'bronze',
  SILVER: 'silver',
  GOLD: 'gold',
  PLATINUM: 'platinum',
};

// Notification types
export const NOTIFICATION_TYPES = {
  FLASHCARD_DUE: 'flashcard_due',
  ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
  STREAK_RISK: 'streak_risk',
  LEVEL_UP: 'level_up',
  NEW_FOLLOWER: 'new_follower',
};

// Document difficulty levels
export const DIFFICULTY_LEVELS = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
};
