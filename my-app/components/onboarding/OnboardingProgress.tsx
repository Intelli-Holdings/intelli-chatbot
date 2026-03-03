"use client"

import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OnboardingProgressProps {
  completedCount: number;
  totalSteps: number;
  isAllComplete: boolean;
  greeting: string;
  onDismiss: () => void;
}

export function OnboardingProgress({
  completedCount,
  totalSteps,
  isAllComplete,
  greeting,
  onDismiss,
}: OnboardingProgressProps) {
  const percentage = Math.round((completedCount / totalSteps) * 100);

  return (
    <div
      className={`relative px-5 py-5 sm:px-6 sm:py-6 transition-colors duration-500 border-b border-gray-100 ${
        isAllComplete
          ? "bg-gradient-to-br from-emerald-50 to-green-50"
          : "bg-gradient-to-br from-[#f8fafc] to-[#e8f4ff]"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p
              className={`text-xs font-semibold uppercase tracking-[0.05em] ${
                isAllComplete ? "text-emerald-600" : "text-[#007fff]"
              }`}
            >
              {isAllComplete ? "Setup Complete" : "Getting Started"}
            </p>
            {isAllComplete && (
              <span className="text-base animate-bounce">🎉</span>
            )}
          </div>
          <h2 className="text-lg font-bold text-gray-900 sm:text-xl tracking-tight">
            {isAllComplete
              ? "You\u2019re all set!"
              : greeting}
          </h2>
          <p className="mt-1 text-[13.5px] text-gray-500">
            {isAllComplete
              ? "Your AI assistant is live and ready to engage customers."
              : "Complete these steps to start engaging customers with AI."}
          </p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 rounded-md text-gray-400 hover:text-gray-600 hover:bg-white/60"
          onClick={onDismiss}
          aria-label="Dismiss onboarding checklist"
          title={isAllComplete ? "Close" : "Dismiss for now"}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Progress bar */}
      <div className="mt-4 flex items-center gap-3">
        <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200/50">
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-600 ease-out"
            style={{
              width: `${percentage}%`,
              background: isAllComplete
                ? "linear-gradient(90deg, #10b981, #059669)"
                : "linear-gradient(90deg, #007fff, #b8dcff)",
            }}
          >
            {/* Shimmer */}
            {!isAllComplete && completedCount > 0 && (
              <div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)",
                  animation: "onb-shimmer 2s infinite",
                }}
              />
            )}
          </div>
        </div>
        <span
          className={`shrink-0 text-xs font-semibold min-w-[32px] text-right ${
            isAllComplete ? "text-emerald-600" : "text-[#007fff]"
          }`}
        >
          {completedCount}/{totalSteps}
        </span>
      </div>
    </div>
  );
}

export default OnboardingProgress;
