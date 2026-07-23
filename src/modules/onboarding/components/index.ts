export interface OnboardingStepCardProps {
  stepId: string;
  label: string;
  status: string;
  isActive: boolean;
  isRequired: boolean;
  error?: string | null;
}

export interface OnboardingProgressBarProps {
  completed: number;
  total: number;
  percent: number;
}

export interface OnboardingStepListProps {
  steps: Array<{
    stepId: string;
    label: string;
    status: string;
    isRequired: boolean;
  }>;
  currentStepId: string | null;
}

export interface OnboardingStepIndicatorProps {
  status: string;
  isActive: boolean;
}
