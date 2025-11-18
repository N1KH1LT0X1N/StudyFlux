'use client';

import { useEffect, useState } from 'react';
import { Trophy, X } from 'lucide-react';

interface AchievementUnlockProps {
  icon: string;
  name: string;
  description: string;
  points: number;
  onClose?: () => void;
}

export default function AchievementUnlock({
  icon,
  name,
  description,
  points,
  onClose,
}: AchievementUnlockProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 100);

    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  };

  if (!isVisible && !isExiting) return null;

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 w-96 max-w-[90vw]
        transform transition-all duration-300
        ${isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div className="relative overflow-hidden rounded-lg border-2 border-yellow-400 bg-gradient-to-br from-gray-800 to-gray-900 p-4 shadow-2xl">
        {/* Animated background effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-purple-500/20 animate-pulse" />

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 z-10 rounded-full bg-gray-700 p-1 hover:bg-gray-600 transition-colors"
        >
          <X className="h-4 w-4 text-gray-300" />
        </button>

        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="h-5 w-5 text-yellow-400 animate-bounce" />
            <h3 className="text-sm font-bold text-yellow-400 uppercase">
              Achievement Unlocked!
            </h3>
          </div>

          {/* Achievement details */}
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="text-5xl flex-shrink-0 animate-bounce">
              {icon}
            </div>

            {/* Text */}
            <div className="flex-grow">
              <h4 className="text-lg font-bold text-white mb-1">{name}</h4>
              <p className="text-sm text-gray-300 mb-2">{description}</p>
              <div className="inline-flex items-center gap-1 bg-yellow-500/20 px-2 py-1 rounded text-yellow-400 text-sm font-bold">
                <Trophy className="h-3 w-3" />
                +{points} points
              </div>
            </div>
          </div>
        </div>

        {/* Celebration confetti effect (CSS only) */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
          <div className="absolute top-0 right-1/4 w-2 h-2 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '0.2s' }} />
          <div className="absolute bottom-0 left-1/3 w-2 h-2 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    </div>
  );
}
