"use client"

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useUser, useOrganization, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ArrowRight, ArrowLeft, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useOnboardingStatus } from '@/hooks/use-onboarding-status';
import { OnboardingProgress } from './OnboardingProgress';
import { OnboardingStep } from './OnboardingStep';
import type { StepId } from '@/types/onboarding';

// Lazy-load heavy components for inline panels
const AssistantsUnified = dynamic(
  () => import('@/components/assistants-unified'),
  { ssr: false }
);
const Channels = dynamic(
  () => import('@/components/dashboard/channels'),
  { ssr: false }
);
const WhatsappOnboarding = dynamic(
  () => import('@/components/WhatsappOnboarding'),
  { ssr: false }
);
const UnifiedWidgets = dynamic(
  () => import('@/components/UnifiedWidgets'),
  { ssr: false }
);
const FacebookMessengerOnboarding = dynamic(
  () => import('@/components/FacebookMessengerOnboarding'),
  { ssr: false }
);
const InstagramOnboarding = dynamic(
  () => import('@/components/InstagramOnboarding'),
  { ssr: false }
);

function getGreeting(): string {
  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  return `${timeOfDay}, let\u2019s set up your assistant`;
}

/** Inline assistant creation form */
function CreateAssistantForm({ onCreated }: { onCreated: () => void }) {
  const { getToken } = useAuth();
  const { organization } = useOrganization();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [prompt, setPrompt] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization?.id) {
      toast.error('No organization selected');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await getToken();
      const res = await fetch(`/api/assistants/${organization.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          prompt,
          organization_id: organization.id,
        }),
      });

      if (!res.ok) throw new Error('Failed to create assistant');

      toast.success('Assistant created successfully!');
      setName('');
      setPrompt('');
      onCreated();
    } catch {
      toast.error('Failed to create assistant. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Assistant Name
        </label>
        <Input
          placeholder="e.g. Customer Support Bot"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Instructions / Prompt
        </label>
        <Textarea
          placeholder="Describe how your assistant should behave, what it knows, and how it should respond..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          required
          className="min-h-[120px]"
        />
        <p className="mt-1.5 text-xs text-gray-400">
          Tip: Include your business name, services offered, and preferred tone of voice.
        </p>
      </div>
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[#007fff] hover:bg-[#0066cc] text-white"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Creating...
          </>
        ) : (
          'Create Assistant'
        )}
      </Button>
    </form>
  );
}

/** Compact "Continue Setup" button shown when checklist is dismissed but incomplete */
function ContinueSetupButton({
  completedCount,
  totalSteps,
  onClick,
}: {
  completedCount: number;
  totalSteps: number;
  onClick: () => void;
}) {
  const progress = (completedCount / totalSteps) * 100;
  const circumference = 2 * Math.PI * 11;

  return (
    <motion.button
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      onClick={onClick}
      className="mx-auto flex w-full max-w-[520px] items-center justify-center gap-2.5 rounded-xl border border-[#b8dcff] bg-white px-5 py-3 text-sm font-semibold text-[#007fff] shadow-sm transition-all hover:border-[#007fff] hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007fff]/40"
    >
      <div className="relative h-7 w-7 shrink-0">
        <svg width="28" height="28" viewBox="0 0 28 28" className="-rotate-90">
          <circle cx="14" cy="14" r="11" fill="none" stroke="#e8f4ff" strokeWidth="3" />
          <circle
            cx="14" cy="14" r="11" fill="none"
            stroke="#007fff" strokeWidth="3" strokeLinecap="round"
            strokeDasharray={`${(progress / 100) * circumference} ${circumference}`}
            className="transition-all duration-400"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-[#007fff]">
          {completedCount}/{totalSteps}
        </span>
      </div>
      <span>Continue Setup</span>
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
    </motion.button>
  );
}

/** Panel header/title metadata for each step */
const PANEL_META: Record<StepId, { title: string; description: string }> = {
  "create-assistant": {
    title: "Create your AI Assistant",
    description: "Give your assistant a name and instructions so it knows how to represent your business.",
  },
  "train-assistant": {
    title: "Train your Assistant",
    description: "Manage your assistants and upload knowledge base files.",
  },
  "connect-channel": {
    title: "Connect a Channel",
    description: "Deploy your assistant to WhatsApp, your website, or social media.",
  },
  "go-live": {
    title: "View Dashboard",
    description: "Your assistant is ready!",
  },
};

type ChannelSubPanel = 'whatsapp' | 'website' | 'facebook' | 'instagram';

export function OnboardingChecklist() {
  const { user } = useUser();
  const router = useRouter();
  const state = useOnboardingStatus();
  const [expandedStep, setExpandedStep] = useState<StepId | null>(null);
  const hasTriggeredConfetti = useRef(false);
  const [isExiting, setIsExiting] = useState(false);
  const [vanished, setVanished] = useState(false);

  // Inline panel state (replaces Dialog)
  const [activePanel, setActivePanel] = useState<StepId | null>(null);
  const [channelSubPanel, setChannelSubPanel] = useState<ChannelSubPanel | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Auto-expand the first active step
  useEffect(() => {
    if (!state.isLoading && !activePanel) {
      const firstActive = state.steps.find((s) => s.status === "active");
      if (firstActive) {
        setExpandedStep(firstActive.id);
      }
    }
  }, [state.isLoading, state.steps, activePanel]);

  // Celebration confetti + auto-exit when all complete
  useEffect(() => {
    if (state.isAllComplete && !hasTriggeredConfetti.current) {
      hasTriggeredConfetti.current = true;
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#007fff', '#10b981', '#f59e0b', '#ec4899', '#b8dcff', '#8b5cf6'],
      });

      const exitTimer = setTimeout(() => setIsExiting(true), 2200);
      const vanishTimer = setTimeout(() => {
        setVanished(true);
        // Persist dismissal so the card stays gone on page refresh
        state.dismiss();
      }, 2900);
      return () => {
        clearTimeout(exitTimer);
        clearTimeout(vanishTimer);
      };
    }
  }, [state.isAllComplete, state.dismiss]);

  // Scroll the panel into view when it opens
  useEffect(() => {
    if (activePanel && panelRef.current) {
      setTimeout(() => {
        panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  }, [activePanel]);

  const handleToggle = useCallback((id: StepId) => {
    setExpandedStep((prev) => (prev === id ? null : id));
  }, []);

  // Open inline panel instead of navigating
  const handleCtaClick = useCallback((stepId: StepId) => {
    if (stepId === 'go-live') {
      router.push('/dashboard');
      return;
    }
    setActivePanel(stepId);
    setChannelSubPanel(null);
  }, [router]);

  // Close panel and refetch
  const closePanel = useCallback(() => {
    setActivePanel(null);
    setChannelSubPanel(null);
    state.refetch();
  }, [state]);

  // Channel callbacks
  const handleWhatsAppSetup = useCallback(() => setChannelSubPanel('whatsapp'), []);
  const handleWebsiteSetup = useCallback(() => setChannelSubPanel('website'), []);
  const handleFacebookSetup = useCallback(() => setChannelSubPanel('facebook'), []);
  const handleInstagramSetup = useCallback(() => setChannelSubPanel('instagram'), []);
  const handleBackToChannels = useCallback(() => setChannelSubPanel(null), []);

  // Fully vanished after completion animation
  if (vanished) return null;

  // Dismissed but incomplete
  if (state.isDismissed && !state.isAllComplete) {
    return (
      <ContinueSetupButton
        completedCount={state.completedCount}
        totalSteps={state.totalSteps}
        onClick={state.undismiss}
      />
    );
  }

  // Dismissed and complete
  if (state.isDismissed) return null;

  // Loading skeleton
  if (state.isLoading) {
    return (
      <div className="rounded-[20px] border border-gray-200/80 bg-white shadow-sm overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}>
        <div className="px-5 py-5 sm:px-6 sm:py-6 bg-gradient-to-br from-[#f8fafc] to-[#e8f4ff] border-b border-gray-100">
          <Skeleton className="h-3 w-28 mb-2" />
          <Skeleton className="h-6 w-64 mb-1" />
          <Skeleton className="h-4 w-80 mb-4" />
          <Skeleton className="h-1.5 w-full rounded-full" />
        </div>
        <div className="p-2 sm:p-3 space-y-1">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3.5">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <Skeleton className="h-4 w-44" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Get current panel header info
  const panelMeta = activePanel ? PANEL_META[activePanel] : null;
  const channelSubTitle: Record<ChannelSubPanel, string> = {
    whatsapp: 'WhatsApp Setup',
    website: 'Website Widget Setup',
    facebook: 'Facebook Messenger Setup',
    instagram: 'Instagram Setup',
  };

  return (
    <>
      {/* Keyframe animations */}
      <style jsx global>{`
        @keyframes onb-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes onb-celebration-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        @keyframes onb-card-exit {
          0% { opacity: 1; transform: translateY(0) scale(1); max-height: 600px; }
          100% { opacity: 0; transform: translateY(-12px) scale(0.98); max-height: 0; }
        }
      `}</style>

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="rounded-[20px] bg-white overflow-hidden"
        style={{
          border: state.isAllComplete
            ? "1.5px solid rgba(16,185,129,0.15)"
            : "1px solid rgba(226,232,240,0.8)",
          boxShadow: state.isAllComplete
            ? "0 4px 24px rgba(16,185,129,0.12)"
            : "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)",
          animation: isExiting
            ? "onb-card-exit 0.65s cubic-bezier(.4,0,.2,1) forwards"
            : state.isAllComplete
              ? "onb-celebration-pulse 0.5s ease 3"
              : "none",
        }}
      >
        <OnboardingProgress
          completedCount={state.completedCount}
          totalSteps={state.totalSteps}
          isAllComplete={state.isAllComplete}
          greeting={getGreeting()}
          onDismiss={state.dismiss}
        />

        {/* Steps list */}
        <div role="list" aria-label="Onboarding steps" className="py-2 sm:py-3">
          {state.steps.map((step, index) => (
            <OnboardingStep
              key={step.id}
              step={step}
              isExpanded={expandedStep === step.id}
              onToggle={() => handleToggle(step.id)}
              onCtaClick={handleCtaClick}
              index={index}
            />
          ))}
        </div>

        {/* Inline panel — slides down below steps, inside the card */}
        <AnimatePresence>
          {activePanel && panelMeta && (
            <motion.div
              ref={panelRef}
              key="inline-panel"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              {/* Panel divider */}
              <div className="mx-4 border-t border-gray-200/80" />

              {/* Panel header */}
              <div className="flex items-center justify-between px-5 pt-4 pb-2">
                <div className="flex items-center gap-3 min-w-0">
                  {channelSubPanel ? (
                    <button
                      onClick={handleBackToChannels}
                      className="inline-flex items-center gap-1 text-sm font-medium text-[#007fff] hover:text-[#0066cc] transition-colors shrink-0"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Back
                    </button>
                  ) : (
                    <button
                      onClick={closePanel}
                      className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors shrink-0"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <div className="min-w-0">
                    <h3 className="text-[15px] font-semibold text-gray-900 truncate">
                      {channelSubPanel
                        ? channelSubTitle[channelSubPanel]
                        : panelMeta.title}
                    </h3>
                    {!channelSubPanel && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">
                        {panelMeta.description}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={closePanel}
                  className="shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  aria-label="Close panel"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Panel content */}
              <div className="px-5 pb-5 max-h-[60vh] overflow-y-auto">
                {/* Step 1: Create Assistant */}
                {activePanel === 'create-assistant' && (
                  <CreateAssistantForm
                    onCreated={() => {
                      setActivePanel(null);
                      state.refetch();
                    }}
                  />
                )}

                {/* Step 2: Train Assistant — full AssistantsUnified */}
                {activePanel === 'train-assistant' && (
                  <AssistantsUnified />
                )}

                {/* Step 3: Connect Channel */}
                {activePanel === 'connect-channel' && !channelSubPanel && (
                  <Channels
                    onWhatsAppCreate={handleWhatsAppSetup}
                    onWebsiteCreate={handleWebsiteSetup}
                    onFacebookCreate={handleFacebookSetup}
                    onInstagramCreate={handleInstagramSetup}
                  />
                )}

                {/* Step 3 sub-panels: specific channel setup */}
                {activePanel === 'connect-channel' && channelSubPanel === 'whatsapp' && (
                  <WhatsappOnboarding />
                )}
                {activePanel === 'connect-channel' && channelSubPanel === 'website' && (
                  <UnifiedWidgets />
                )}
                {activePanel === 'connect-channel' && channelSubPanel === 'facebook' && (
                  <FacebookMessengerOnboarding />
                )}
                {activePanel === 'connect-channel' && channelSubPanel === 'instagram' && (
                  <InstagramOnboarding />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        {!state.isAllComplete && !activePanel && (
          <div className="border-t border-gray-100/50 px-6 py-3 text-center">
            <span className="text-[12.5px] text-gray-400">
              Need help?{" "}
              <a
                href="https://intelliconcierge.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#007fff] font-medium hover:underline"
              >
                View documentation
              </a>{" "}
              or contact support
            </span>
          </div>
        )}
      </motion.div>
    </>
  );
}

export default OnboardingChecklist;
