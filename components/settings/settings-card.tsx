"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";

interface Sublink {
  pageId: string;
  title: string;
  href: string;
  authorized: string[];
}

interface SettingsCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color: string;
  sublinks?: Sublink[];
}

export default function SettingsCard({
  title,
  description,
  icon: Icon,
  href,
  color,
  sublinks,
}: SettingsCardProps) {
  if (sublinks && sublinks.length > 0) {
    return (
      <div className="group relative rounded-xl border border-border bg-card hover:border-primary transition-all duration-300 overflow-hidden flex flex-col">
        {/* Gradient background */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
        />

        <div className="relative p-4 flex flex-col flex-1">
          {/* Header */}
          <div className="flex gap-4">
            {/* Icon */}
            <div
              className={`inline-flex min-w-12 w-12 h-12 rounded-lg bg-gradient-to-br ${color} items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
            >
              <Icon className="w-6 h-6 text-white" />
            </div>

            {/* Text */}
            <div>
              <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                {title}
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                {description}
              </p>
            </div>
          </div>

          {/* Sublinks section */}
          <div className=" pt-3 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Pages rapides
            </p>
            <div className="space-y-2 flex flex-col">
              {sublinks.map((sublink) => (
                <Link
                  key={sublink.href}
                  href={sublink.href}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:text-primary hover:bg-muted border border-transparent hover:border-primary/30 transition-all duration-200"
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${color}`}
                  />
                  {sublink.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link href={href}>
      <div className="group relative overflow-hidden rounded-xl border border-border bg-card hover:border-primary transition-all duration-300 h-full">
        {/* Gradient background */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
        />

        {/* Content */}
        <div className="relative p-4 flex flex-col h-full">
          {/* Icon */}
          <div className="flex gap-2">
            <div
              className={`inline-flex min-w-12 w-12 h-12 rounded-lg bg-gradient-to-br ${color} items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
            >
              <Icon className="w-6 h-6 text-white" />
            </div>

            {/* Text */}
            <div>
              <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                {title}
              </h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>

          {/* Arrow */}
          {/* <div className="mt-4 flex items-center text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
          </div> */}
        </div>
      </div>
    </Link>
  );
}
