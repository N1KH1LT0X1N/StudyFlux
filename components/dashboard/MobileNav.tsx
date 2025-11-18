"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, FileText, Brain, Trophy, User } from "lucide-react";

export default function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/dashboard",
      icon: Home,
      label: "Home",
      isActive: pathname === "/dashboard",
    },
    {
      href: "/dashboard/documents",
      icon: FileText,
      label: "Documents",
      isActive: pathname?.startsWith("/dashboard/documents"),
    },
    {
      href: "/dashboard/flashcards",
      icon: Brain,
      label: "Flashcards",
      isActive: pathname?.startsWith("/dashboard/flashcards"),
    },
    {
      href: "/dashboard/achievements",
      icon: Trophy,
      label: "Achievements",
      isActive: pathname?.startsWith("/dashboard/achievements"),
    },
    {
      href: "/dashboard/settings",
      icon: User,
      label: "Profile",
      isActive: pathname?.startsWith("/dashboard/settings"),
    },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50 safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-colors ${
                item.isActive
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs font-medium">{item.label}</span>
              {item.isActive && (
                <div className="absolute bottom-0 w-12 h-1 bg-blue-600 dark:bg-blue-400 rounded-t-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
