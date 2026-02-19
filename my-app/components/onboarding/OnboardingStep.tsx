"use client"

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Lock, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChannelPills } from './ChannelPills';
import type { OnboardingStep as OnboardingStepType, StepId } from '@/types/onboarding';

/** Step-specific inline SVG icons matching the reference design */
const STEP_ICONS: Record<string, React.ReactNode> = {
  "create-assistant": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" />
    </svg>
  ),
  "train-assistant": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M12 18v-6" /><path d="m9 15 3-3 3 3" />
    </svg>
  ),
  "connect-channel": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 17H7A5 5 0 0 1 7 7h2" /><path d="M15 7h2a5 5 0 1 1 0 10h-2" /><line x1="8" x2="16" y1="12" y2="12" />
    </svg>
  ),
  "go-live": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
};

interface OnboardingStepProps {
  step: OnboardingStepType;
  isExpanded: boolean;
  onToggle: () => void;
  onCtaClick?: (stepId: StepId) => void;
  index: number;
}

export function OnboardingStep({ step, isExpanded, onToggle, onCtaClick, index }: OnboardingStepProps) {
  const isCompleted = step.status === "completed";
  const isLocked = step.status === "locked";
  const isActive = step.status === "active";

  const handleCtaClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCtaClick) {
      onCtaClick(step.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!isLocked) onToggle();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3, ease: "easeOut" }}
      role="listitem"
    >
      <div
        className={cn(
          "mx-2 sm:mx-3 my-1 rounded-xl transition-all duration-300",
          isLocked && "opacity-45",
          isActive && "bg-[rgba(0,127,255,0.06)] border border-[rgba(0,127,255,0.18)]",
          isCompleted && "bg-[rgba(16,185,129,0.04)] border border-[rgba(16,185,129,0.12)]",
          !isActive && !isCompleted && "border border-transparent",
        )}
      >
        {/* Step header — clickable to expand/collapse */}
        <button
          type="button"
          onClick={() => !isLocked && onToggle()}
          onKeyDown={handleKeyDown}
          disabled={isLocked}
          aria-expanded={isExpanded}
          aria-current={isActive ? "step" : undefined}
          className={cn(
            "flex w-full items-center gap-4 px-4 py-3.5 text-left transition-colors rounded-xl",
            !isLocked && "hover:bg-gray-50/60 cursor-pointer",
            isLocked && "cursor-not-allowed",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007fff]/40 focus-visible:ring-inset"
          )}
        >
          {/* Number circle or checkmark */}
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold transition-all duration-300",
              isCompleted && "text-white shadow-md",
              isActive && "text-[#007fff] bg-[rgba(0,127,255,0.08)]",
              isLocked && "bg-[rgba(148,163,184,0.08)] text-gray-400"
            )}
            style={isCompleted ? {
              background: "linear-gradient(135deg, #10b981, #059669)",
              boxShadow: "0 4px 12px rgba(16,185,129,0.3)",
            } : undefined}
          >
            {isCompleted ? (
              <Check className="h-[18px] w-[18px]" strokeWidth={3} />
            ) : isLocked ? (
              <Lock className="h-3.5 w-3.5" />
            ) : (
              step.number
            )}
          </div>

          {/* Title + optional badge */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "text-[15px] font-semibold",
                  isCompleted && "text-emerald-700 line-through decoration-emerald-400/40",
                  isActive && "text-gray-900",
                  isLocked && "text-gray-400"
                )}
              >
                {step.title}
              </span>
              {isCompleted && (
                <span className="shrink-0 text-[11px] font-semibold text-emerald-700 bg-[rgba(16,185,129,0.08)] px-2 py-0.5 rounded-md">
                  Done
                </span>
              )}
              {isLocked && (
                <Lock className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              )}
            </div>

            {/* Collapsed hint */}
            {!isExpanded && !isCompleted && !isLocked && (
              <p className="mt-0.5 text-[13px] text-gray-400 truncate">
                {step.description.slice(0, 60)}...
              </p>
            )}
          </div>
        </button>

        {/* Expandable content */}
        <AnimatePresence initial={false}>
          {isExpanded && !isLocked && (
            <motion.div
              key="content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 pl-[4.5rem]">
                <p className="text-[13.5px] text-gray-500 leading-relaxed">
                  {step.description}
                </p>

                {/* Channel pills for step 3 */}
                {step.channels && <ChannelPills channels={step.channels} />}

                {/* CTA Button */}
                {isActive && (
                  <button
                    onClick={handleCtaClick}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-[10px] px-[18px] py-[9px] text-[13px] font-semibold text-white transition-all hover:-translate-y-0.5"
                    style={{
                      background: "linear-gradient(135deg, #007fff 0%, #0066cc 100%)",
                      boxShadow: "0 2px 8px rgba(0,127,255,0.25)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 16px rgba(0,127,255,0.35)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 2px 8px rgba(0,127,255,0.25)";
                    }}
                  >
                    {STEP_ICONS[step.id]}
                    {step.cta}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default OnboardingStep;
