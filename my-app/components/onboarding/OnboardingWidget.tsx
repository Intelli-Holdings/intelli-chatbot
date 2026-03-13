"use client"

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Sparkles, X, Check, Lock, ArrowRight } from 'lucide-react';
import { useOnboardingStatus } from '@/hooks/use-onboarding-status';
import type { OnboardingStep } from '@/types/onboarding';

function CircularProgress({ completed, total, size = 28, strokeWidth = 3 }: {
  completed: number;
  total: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (completed / total) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="#e8f4ff" strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="#007fff" strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
          className="transition-all duration-500"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-[#007fff]">
        {completed}/{total}
      </span>
    </div>
  );
}

function StepIcon({ step, index }: { step: OnboardingStep; index: number }) {
  if (step.status === 'completed') {
    return (
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100">
        <Check className="h-3.5 w-3.5 text-emerald-600" strokeWidth={2.5} />
      </div>
    );
  }
  if (step.status === 'locked') {
    return (
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100">
        <Lock className="h-3.5 w-3.5 text-gray-400" />
      </div>
    );
  }
  // active
  return (
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#007fff] text-white text-xs font-semibold">
      {index + 1}
    </div>
  );
}

function StepRow({ step, index, onNavigate }: {
  step: OnboardingStep;
  index: number;
  onNavigate: (route: string) => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      <StepIcon step={step} index={index} />
      <span className={`flex-1 text-sm ${
        step.status === 'completed'
          ? 'text-gray-400 line-through'
          : step.status === 'locked'
            ? 'text-gray-400'
            : 'text-gray-800 font-medium'
      }`}>
        {step.title}
      </span>
      {step.status === 'completed' && (
        <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
          Done
        </span>
      )}
      {step.status === 'active' && (
        <button
          onClick={() => onNavigate(step.ctaRoute)}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#007fff]/10 text-[#007fff] hover:bg-[#007fff]/20 transition-colors"
          aria-label={step.cta}
        >
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

export function OnboardingWidget() {
  const state = useOnboardingStatus();
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(true);
  const hasTriggeredConfetti = useRef(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [autoHidden, setAutoHidden] = useState(false);

  // Celebration: confetti + auto-dismiss
  useEffect(() => {
    if (state.isAllComplete && !hasTriggeredConfetti.current) {
      hasTriggeredConfetti.current = true;
      setShowCelebration(true);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.7, x: 0.85 },
        colors: ['#007fff', '#10b981', '#f59e0b', '#ec4899', '#b8dcff', '#8b5cf6'],
      });

      const timer = setTimeout(() => {
        setAutoHidden(true);
        state.dismiss();
      }, 2500);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.isAllComplete]);

  const handleNavigate = useCallback((route: string) => {
    router.push(route);
  }, [router]);

  // Loading with no cache — render nothing
  if (state.isLoading && state.completedCount === 0) return null;

  // Dismissed + complete (or auto-hidden after celebration)
  if ((state.isDismissed && state.isAllComplete) || autoHidden) return null;

  // Dismissed pill — show compact "Continue Setup" pill
  if (state.isDismissed && !state.isAllComplete) {
    return (
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={state.undismiss}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 rounded-full bg-white px-4 py-2.5 shadow-lg border border-gray-200/80 hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer"
      >
        <CircularProgress completed={state.completedCount} total={state.totalSteps} size={28} strokeWidth={3} />
        <span className="text-sm font-semibold text-[#007fff]">Continue Setup</span>
      </motion.button>
    );
  }

  // Celebration state
  if (showCelebration) {
    return (
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-6 right-6 z-40 w-[calc(100vw-2rem)] sm:w-[320px] rounded-2xl bg-white shadow-lg border border-emerald-200/80 p-5 text-center"
      >
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
            <Check className="h-5 w-5 text-emerald-600" strokeWidth={2.5} />
          </div>
          <p className="text-base font-semibold text-gray-900">All set!</p>
          <p className="text-sm text-gray-500">Your assistant is live and ready.</p>
        </div>
      </motion.div>
    );
  }

  // Active widget
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      className="fixed bottom-6 right-6 z-40 w-[calc(100vw-2rem)] sm:w-[320px] rounded-2xl bg-white shadow-lg border border-gray-200/80 overflow-hidden"
    >
      {/* Header — always visible, clickable to toggle */}
      <button
        onClick={() => setIsExpanded(prev => !prev)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-50/50 transition-colors cursor-pointer"
      >
        <Sparkles className="h-4.5 w-4.5 text-[#007fff] shrink-0" />
        <span className="flex-1 text-sm font-semibold text-gray-900">Getting Started</span>
        <CircularProgress completed={state.completedCount} total={state.totalSteps} size={28} strokeWidth={3} />
        <button
          onClick={(e) => {
            e.stopPropagation();
            state.dismiss();
          }}
          className="shrink-0 p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Dismiss onboarding"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </button>

      {/* Expanded body */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <p className="px-4 pb-2 text-xs text-gray-500">
              Complete these steps to go live.
            </p>
            <div className="border-t border-gray-100 mx-3" />
            <div className="py-1">
              {state.steps.map((step, index) => (
                <StepRow
                  key={step.id}
                  step={step}
                  index={index}
                  onNavigate={handleNavigate}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default OnboardingWidget;
