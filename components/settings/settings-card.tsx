"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";

interface SettingsCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color: string;
}

export default function SettingsCard({
  title,
  description,
  icon: Icon,
  href,
  color,
}: SettingsCardProps) {
  return (
    <Link href={href}>
      <div className="group relative overflow-hidden rounded-xl border border-border bg-card hover:border-primary transition-all duration-300 h-full">
        {/* Gradient background */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
        />

        {/* Content */}
        <div className="relative p-6 flex flex-col h-full">
          {/* Icon */}
          <div
            className={`inline-flex w-12 h-12 rounded-lg bg-gradient-to-br ${color} items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>

          {/* Text */}
          <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground flex-1">{description}</p>

          {/* Arrow */}
          <div className="mt-4 flex items-center text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-sm font-medium">Accéder</span>
            <svg
              className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
