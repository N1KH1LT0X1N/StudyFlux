'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  HomeIcon,
  FileTextIcon,
  BrainIcon,
  BookOpenIcon,
  TrophyIcon,
  SettingsIcon,
  BarChartIcon,
  StickyNoteIcon,
  MedalIcon
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Documents', href: '/dashboard/documents', icon: FileTextIcon },
  { name: 'Study Sessions', href: '/dashboard/study', icon: BookOpenIcon },
  { name: 'Notes', href: '/dashboard/notes', icon: StickyNoteIcon },
  { name: 'Progress', href: '/dashboard/progress', icon: BarChartIcon },
  { name: 'Flashcards', href: '/dashboard/flashcards', icon: BrainIcon },
  { name: 'Achievements', href: '/dashboard/achievements', icon: TrophyIcon },
  { name: 'Leaderboard', href: '/dashboard/leaderboard', icon: MedalIcon },
  { name: 'Settings', href: '/dashboard/settings', icon: SettingsIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [dueFlashcardsCount, setDueFlashcardsCount] = useState(0);

  useEffect(() => {
    const fetchDueFlashcards = async () => {
      try {
        const response = await fetch('/api/flashcards?dueOnly=true&limit=1');
        if (response.ok) {
          const data = await response.json();
          setDueFlashcardsCount(data.dueCount || 0);
        }
      } catch (error) {
        console.error('Error fetching due flashcards:', error);
      }
    };

    fetchDueFlashcards();
    // Refresh every 5 minutes
    const interval = setInterval(fetchDueFlashcards, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hidden lg:flex lg:flex-shrink-0">
      <div className="flex w-64 flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r border-gray-800 bg-gray-900">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center px-4">
              <h2 className="text-xl font-bold text-indigo-500">StudyFlux</h2>
            </div>
            <nav className="mt-8 flex-1 space-y-1 px-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                const showBadge = item.name === 'Flashcards' && dueFlashcardsCount > 0;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      group flex items-center justify-between px-2 py-2 text-sm font-medium rounded-md
                      ${
                        isActive
                          ? 'bg-indigo-800 text-white'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }
                    `}
                  >
                    <div className="flex items-center">
                      <item.icon
                        className={`
                          mr-3 h-5 w-5 flex-shrink-0
                          ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}
                        `}
                      />
                      {item.name}
                    </div>
                    {showBadge && (
                      <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-500 text-white">
                        {dueFlashcardsCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
