'use client';

import { Lock, CheckCircle } from 'lucide-react';

interface AchievementCardProps {
  icon: string;
  name: string;
  description: string;
  points: number;
  tier: string;
  unlocked: boolean;
  unlockedAt?: Date | null;
  progress?: number;
  currentValue?: number;
  targetValue?: number;
  onClick?: () => void;
}

const tierColors = {
  bronze: 'from-amber-700 to-amber-900',
  silver: 'from-gray-400 to-gray-600',
  gold: 'from-yellow-400 to-yellow-600',
  platinum: 'from-purple-400 to-purple-600',
};

const tierBorderColors = {
  bronze: 'border-amber-700',
  silver: 'border-gray-400',
  gold: 'border-yellow-400',
  platinum: 'border-purple-400',
};

export default function AchievementCard({
  icon,
  name,
  description,
  points,
  tier,
  unlocked,
  unlockedAt,
  progress = 0,
  currentValue = 0,
  targetValue = 0,
  onClick,
}: AchievementCardProps) {
  const tierColor = tierColors[tier as keyof typeof tierColors] || tierColors.bronze;
  const tierBorder = tierBorderColors[tier as keyof typeof tierBorderColors] || tierBorderColors.bronze;

  return (
    <div
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-lg border-2 p-4 transition-all duration-300
        ${unlocked ? tierBorder + ' bg-gray-800 shadow-lg' : 'border-gray-700 bg-gray-900'}
        ${onClick ? 'cursor-pointer hover:scale-105' : ''}
        ${unlocked ? 'animate-pulse-slow' : 'opacity-70'}
      `}
    >
      {/* Background gradient for unlocked achievements */}
      {unlocked && (
        <div className={`absolute inset-0 bg-gradient-to-br ${tierColor} opacity-10`} />
      )}

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between">
          {/* Icon */}
          <div className="text-4xl mb-2">
            {unlocked ? icon : <span className="grayscale opacity-50">{icon}</span>}
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-1">
            {unlocked ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <Lock className="h-5 w-5 text-gray-500" />
            )}
          </div>
        </div>

        {/* Title and Description */}
        <h3 className={`text-lg font-bold mb-1 ${unlocked ? 'text-white' : 'text-gray-400'}`}>
          {name}
        </h3>
        <p className={`text-sm mb-3 ${unlocked ? 'text-gray-300' : 'text-gray-500'}`}>
          {description}
        </p>

        {/* Points */}
        <div className="flex items-center justify-between mb-2">
          <div className={`text-sm font-medium ${unlocked ? 'text-yellow-400' : 'text-gray-500'}`}>
            {points} points
          </div>
          <div className={`text-xs uppercase px-2 py-1 rounded bg-gradient-to-r ${tierColor} text-white font-bold`}>
            {tier}
          </div>
        </div>

        {/* Progress Bar (for locked achievements) */}
        {!unlocked && progress > 0 && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Progress</span>
              <span>{currentValue} / {targetValue}</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${tierColor} transition-all duration-500`}
                style={{ width: `${Math.min(100, progress)}%` }}
              />
            </div>
          </div>
        )}

        {/* Unlock Date (for unlocked achievements) */}
        {unlocked && unlockedAt && (
          <div className="mt-3 text-xs text-gray-400">
            Unlocked on {new Date(unlockedAt).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
}
