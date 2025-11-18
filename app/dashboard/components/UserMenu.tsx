'use client';

import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { LogOutIcon, SettingsIcon, TrophyIcon } from 'lucide-react';
import Link from 'next/link';

interface UserData {
  points: number;
  level: number;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export default function UserMenu() {
  const { data: session } = useSession();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // In a real app, fetch user data from API
    // For now, use mock data
    if (session?.user) {
      setUserData({
        points: 0,
        level: 1,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      });
    }
  }, [session]);

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
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <span className="flex items-center">
                <TrophyIcon className="mr-1 h-3 w-3" />
                {userData?.points || 0} pts
              </span>
              <span>•</span>
              <span>Level {userData?.level || 1}</span>
            </div>
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
