'use client';

import { TrendingUp, Trophy } from 'lucide-react';
import { calculateLevel, getPointsForNextLevel, getLevelProgress } from '@/lib/gamification';

interface LevelBadgeProps {
  points: number;
  level: number;
  compact?: boolean;
  showProgress?: boolean;
}

export default function LevelBadge({
  points,
  level,
  compact = false,
  showProgress = true,
}: LevelBadgeProps) {
  const pointsForNext = getPointsForNextLevel(points);
  const progress = getLevelProgress(points);

  // Compact version (for header/menu)
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-indigo-600 px-2 py-1 rounded text-white text-xs font-bold">
          <Trophy className="h-3 w-3" />
          <span>Lvl {level}</span>
        </div>
        <div className="text-xs text-gray-300">
          {points.toLocaleString()} pts
        </div>
      </div>
    );
  }

  // Full version
  return (
    <div className="rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border-2 border-indigo-500/50 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-indigo-400" />
          <h3 className="text-lg font-bold text-white">Level & XP</h3>
        </div>
        <div className="flex items-center gap-1 bg-indigo-600 px-3 py-1 rounded text-white text-sm font-bold">
          <span>Level {level}</span>
        </div>
      </div>

      {/* Points */}
      <div className="mb-4">
        <div className="text-3xl font-bold text-white mb-1">
          {points.toLocaleString()} <span className="text-lg text-gray-400">XP</span>
        </div>
        <p className="text-sm text-gray-300">
          {pointsForNext.toLocaleString()} XP to level {level + 1}
        </p>
      </div>

      {/* Progress Bar */}
      {showProgress && (
        <div>
          <div className="flex justify-between text-xs text-gray-300 mb-2">
            <span>Level Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 relative"
              style={{ width: `${progress}%` }}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </div>
          </div>

          {/* Motivational message */}
          <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
            <TrendingUp className="h-3 w-3" />
            <span>
              {progress < 25
                ? 'Keep earning XP to level up!'
                : progress < 50
                ? 'You\'re making great progress!'
                : progress < 75
                ? 'Almost there! Keep going!'
                : 'So close to the next level!'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
