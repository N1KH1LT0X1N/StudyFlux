'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  FileTextIcon,
  BrainIcon,
  BookOpenIcon,
  TrophyIcon,
  SettingsIcon,
  BarChartIcon,
  StickyNoteIcon
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Documents', href: '/dashboard/documents', icon: FileTextIcon },
  { name: 'Study Sessions', href: '/dashboard/study', icon: BookOpenIcon },
  { name: 'Notes', href: '/dashboard/notes', icon: StickyNoteIcon },
  { name: 'Progress', href: '/dashboard/progress', icon: BarChartIcon },
  { name: 'Flashcards', href: '/dashboard/flashcards', icon: BrainIcon },
  { name: 'Achievements', href: '/dashboard/achievements', icon: TrophyIcon },
  { name: 'Settings', href: '/dashboard/settings', icon: SettingsIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

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
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      group flex items-center px-2 py-2 text-sm font-medium rounded-md
                      ${
                        isActive
                          ? 'bg-indigo-800 text-white'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }
                    `}
                  >
                    <item.icon
                      className={`
                        mr-3 h-5 w-5 flex-shrink-0
                        ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}
                      `}
                    />
                    {item.name}
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
