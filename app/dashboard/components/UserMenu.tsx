'use client';

import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { LogOutIcon, SettingsIcon } from 'lucide-react';
import Link from 'next/link';
import LevelBadge from '@/components/gamification/LevelBadge';

interface UserStats {
  points: number;
  level: number;
  streak: number;
  lastActiveAt: Date;
  pointsForNextLevel: number;
  levelProgress: number;
}

export default function UserMenu() {
  const { data: session } = useSession();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (session?.user) {
      fetchUserStats();
    }
  }, [session]);

  const fetchUserStats = async () => {
    try {
      const response = await fetch('/api/user/stats');
      if (response.ok) {
        const stats = await response.json();
        setUserStats(stats);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  if (!session?.user) {
    return null;
  }

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 rounded-lg bg-gray-800 px-3 py-2 hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center space-x-3">
          {session.user.image ? (
            <img
              src={session.user.image}
              alt={session.user.name || 'User'}
              className="h-8 w-8 rounded-full"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-medium text-white">
              {getInitials(session.user.name)}
            </div>
          )}
          <div className="hidden lg:block text-left">
            <p className="text-sm font-medium text-white">{session.user.name || 'User'}</p>
            {userStats && (
              <LevelBadge
                points={userStats.points}
                level={userStats.level}
                compact={true}
                showProgress={false}
              />
            )}
          </div>
        </div>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-2 w-48 origin-top-right rounded-md bg-gray-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5">
            <Link
              href="/dashboard/settings"
              className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
              onClick={() => setIsOpen(false)}
            >
              <SettingsIcon className="mr-3 h-4 w-4" />
              Settings
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex w-full items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
            >
              <LogOutIcon className="mr-3 h-4 w-4" />
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
