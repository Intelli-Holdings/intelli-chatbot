export type StepId = "create-assistant" | "train-assistant" | "connect-channel" | "go-live";

export type StepStatus = "completed" | "active" | "locked";

export interface ChannelOption {
  name: string;
  emoji: string;
  route: string;
  comingSoon?: boolean;
}

export interface OnboardingStep {
  id: StepId;
  number: number;
  title: string;
  description: string;
  cta: string;
  ctaRoute: string;
  status: StepStatus;
  channels?: ChannelOption[];
}

export interface OnboardingState {
  steps: OnboardingStep[];
  completedCount: number;
  totalSteps: number;
  isAllComplete: boolean;
  isDismissed: boolean;
  isLoading: boolean;
  error: string | null;
  dismiss: () => void;
  undismiss: () => void;
  refetch: () => Promise<void>;
}
