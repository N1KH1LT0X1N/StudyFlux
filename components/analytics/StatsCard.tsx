"use client";

import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  change?: {
    value: number;
    isPositive: boolean;
  };
  iconColor?: string;
  iconBgColor?: string;
}

export default function StatsCard({
  icon: Icon,
  label,
  value,
  change,
  iconColor = "text-indigo-600",
  iconBgColor = "bg-indigo-100",
}: StatsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${iconBgColor} rounded-lg flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        {change && (
          <span
            className={`text-sm font-medium ${
              change.isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {change.isPositive ? "+" : ""}
            {change.value}%
          </span>
        )}
      </div>
      <div>
        <p className="text-sm text-gray-600 mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
