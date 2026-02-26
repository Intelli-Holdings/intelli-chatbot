"use client"

import { useState, useEffect, useCallback, useRef } from 'react';
import { useOrganization } from '@clerk/nextjs';
import type { OnboardingStep, OnboardingState, StepStatus } from '@/types/onboarding';
import { logger } from "@/lib/logger";

const DISMISS_KEY = 'intelli_onboarding_dismissed';
const CACHE_KEY = 'intelli_onboarding_cache';
const THROTTLE_MS = 30_000; // Don't refetch more than once per 30s

const CHANNEL_OPTIONS = [
  { name: "Website", emoji: "\u{1F310}", route: "/dashboard/widgets" },
  { name: "WhatsApp", emoji: "\u{1F4AC}", route: "/dashboard/channels" },
  { name: "Instagram", emoji: "\u{1F4F7}", route: "/dashboard/channels" },
  { name: "Messenger", emoji: "\u{1F4AD}", route: "/dashboard/channels" },
  { name: "Email", emoji: "\u{1F4E7}", route: "/dashboard/channels", comingSoon: true },
];

function getStepStatus(stepIndex: number, completions: boolean[]): StepStatus {
  if (completions[stepIndex]) return "completed";
  const allPreviousComplete = completions.slice(0, stepIndex).every(Boolean);
  return allPreviousComplete ? "active" : "locked";
}

function buildSteps(completions: boolean[]): OnboardingStep[] {
  const definitions = [
    {
      id: "create-assistant" as const,
      number: 1,
      title: "Create your AI Assistant",
      description: "Give your assistant a name and description so it knows how to represent your business.",
      cta: "Create Assistant",
      ctaRoute: "/dashboard/assistants",
    },
    {
      id: "train-assistant" as const,
      number: 2,
      title: "Train your Assistant",
      description: "Upload documents, FAQs, or knowledge base files so your assistant can answer accurately.",
      cta: "Upload Files",
      ctaRoute: "/dashboard/assistants",
    },
    {
      id: "connect-channel" as const,
      number: 3,
      title: "Connect a Channel",
      description: "Deploy your assistant to WhatsApp, your website, Instagram, Messenger, or email.",
      cta: "Connect Channel",
      ctaRoute: "/dashboard/channels",
      channels: CHANNEL_OPTIONS,
    },
    {
      id: "go-live" as const,
      number: 4,
      title: "Go Live & Engage",
      description: "Your assistant is ready! Monitor conversations and insights from your dashboard.",
      cta: "View Dashboard",
      ctaRoute: "/dashboard",
    },
  ];

  return definitions.map((def, i) => ({
    ...def,
    status: getStepStatus(i, completions),
  }));
}

/**
 * Check if an assistant has files.
 * Uses the OpenAI assistant_id (e.g. "asst_xxx"), NOT the numeric database id.
 * Tries /api/files/statistics first (fast count), falls back to /api/files list.
 */
async function checkAssistantHasFiles(openaiAssistantId: string): Promise<boolean> {
  try {
    // Fast path: statistics endpoint returns a count
    const statsRes = await fetch(`/api/files/statistics?assistant_id=${openaiAssistantId}`);
    if (statsRes.ok) {
      const stats = await statsRes.json();
      if (typeof stats?.total_files === 'number' && stats.total_files > 0) return true;
      if (typeof stats?.count === 'number' && stats.count > 0) return true;
    }

    // Fallback: list files directly
    const res = await fetch(`/api/files?assistant_id=${openaiAssistantId}`);
    if (!res.ok) return false;
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) return true;
    if (data?.results && Array.isArray(data.results) && data.results.length > 0) return true;
    if (typeof data?.count === 'number' && data.count > 0) return true;
    return false;
  } catch {
    return false;
  }
}

/** Try to load cached completions from sessionStorage for instant render */
function loadCachedCompletions(): boolean[] | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length === 4) return parsed;
  } catch { /* ignore */ }
  return null;
}

function saveCachedCompletions(completions: boolean[]) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(completions));
  } catch { /* ignore */ }
}

export function useOnboardingStatus(): OnboardingState {
  const { organization } = useOrganization();
  const organizationId = organization?.id;

  const cached = useRef(loadCachedCompletions());
  const [isLoading, setIsLoading] = useState(!cached.current);
  const [error, setError] = useState<string | null>(null);
  const [isDismissed, setIsDismissed] = useState(() => {
    try {
      return localStorage.getItem(DISMISS_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [completions, setCompletions] = useState<boolean[]>(cached.current ?? [false, false, false, false]);
  const lastFetchTime = useRef(0);

  const fetchStatus = useCallback(async (force = false) => {
    if (!organizationId) return;

    // Throttle: don't refetch if we fetched recently (unless forced)
    const now = Date.now();
    if (!force && lastFetchTime.current && now - lastFetchTime.current < THROTTLE_MS) {
      return;
    }

    // Only show loading spinner if we have no cached data
    if (!cached.current) {
      setIsLoading(true);
    }
    setError(null);

    try {
      // Fetch assistants and app services in parallel
      const [assistantsRes, channelsRes] = await Promise.all([
        fetch(`/api/assistants/${organizationId}`),
        fetch(`/api/channels/whatsapp/org/${organizationId}`),
      ]);

      let hasAssistant = false;
      let hasTrained = false;
      let hasChannel = false;

      // Check assistants
      if (assistantsRes.ok) {
        const assistantsData = await assistantsRes.json();
        const assistants = Array.isArray(assistantsData)
          ? assistantsData
          : (assistantsData?.results ?? assistantsData?.data ?? []);
        hasAssistant = assistants.length > 0;

        // Check files using the OpenAI assistant_id (not the numeric db id).
        // Early exit on first match. Only check first 3 assistants to limit API calls.
        if (hasAssistant) {
          const toCheck = assistants.slice(0, 3);
          for (const assistant of toCheck) {
            const aiId = assistant.assistant_id;
            if (!aiId) continue; // skip if no OpenAI ID assigned yet
            const hasFiles = await checkAssistantHasFiles(aiId);
            if (hasFiles) {
              hasTrained = true;
              break;
            }
          }
        }
      }

      // Check channels/app services
      if (channelsRes.ok) {
        const channelsData = await channelsRes.json();
        const services = Array.isArray(channelsData)
          ? channelsData
          : (channelsData?.results ?? channelsData?.data ?? []);
        hasChannel = services.length > 0;
      }

      const isAllComplete = hasAssistant && hasTrained && hasChannel;
      const newCompletions = [hasAssistant, hasTrained, hasChannel, isAllComplete];
      setCompletions(newCompletions);
      saveCachedCompletions(newCompletions);
      lastFetchTime.current = Date.now();
    } catch (err) {
      logger.error('[Onboarding] Error fetching status', { error: err instanceof Error ? err.message : String(err) });
      setError('Unable to load onboarding status');
    } finally {
      setIsLoading(false);
    }
  }, [organizationId]);

  // Fetch on mount and when org changes
  useEffect(() => {
    fetchStatus(true);
  }, [fetchStatus]);

  // Throttled refetch on window focus
  useEffect(() => {
    const handleFocus = () => fetchStatus(false);
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchStatus]);

  const dismiss = useCallback(() => {
    setIsDismissed(true);
    try { localStorage.setItem(DISMISS_KEY, 'true'); } catch { /* ignore */ }
  }, []);

  const undismiss = useCallback(() => {
    setIsDismissed(false);
    try { localStorage.removeItem(DISMISS_KEY); } catch { /* ignore */ }
  }, []);

  const steps = buildSteps(completions);
  const completedCount = completions.filter(Boolean).length;

  return {
    steps,
    completedCount,
    totalSteps: 4,
    isAllComplete: completedCount === 4,
    isDismissed,
    isLoading,
    error,
    dismiss,
    undismiss,
    refetch: () => fetchStatus(true),
  };
}

export default useOnboardingStatus;
