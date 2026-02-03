'use client';

import { AlertCircle, AlertTriangle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useValidation } from '../context/ValidationContext';
import { useSimulation } from '../context/SimulationContext';
import { cn } from '@/lib/utils';

interface NodeValidationIndicatorProps {
  nodeId: string;
  className?: string;
}

export default function NodeValidationIndicator({
  nodeId,
  className,
}: NodeValidationIndicatorProps) {
  const { hasErrorsForNode, hasWarningsForNode, getErrorsForNode } = useValidation();

  const hasErrors = hasErrorsForNode(nodeId);
  const hasWarnings = hasWarningsForNode(nodeId);

  if (!hasErrors && !hasWarnings) {
    return null;
  }

  const errors = getErrorsForNode(nodeId);
  const errorMessages = errors.filter((e) => e.severity === 'error').map((e) => e.message);
  const warningMessages = errors.filter((e) => e.severity === 'warning').map((e) => e.message);

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center z-10',
              hasErrors ? 'bg-red-500' : 'bg-yellow-500',
              className
            )}
          >
            {hasErrors ? (
              <AlertCircle className="h-3 w-3 text-white" />
            ) : (
              <AlertTriangle className="h-3 w-3 text-white" />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-[250px] z-50"
          sideOffset={5}
        >
          {errorMessages.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-red-500">Errors:</p>
              <ul className="text-xs space-y-0.5">
                {errorMessages.map((msg, i) => (
                  <li key={`error-${i}`}>• {msg}</li>
                ))}
              </ul>
            </div>
          )}
          {warningMessages.length > 0 && (
            <div className={cn('space-y-1', errorMessages.length > 0 && 'mt-2')}>
              <p className="text-xs font-medium text-yellow-500">Warnings:</p>
              <ul className="text-xs space-y-0.5">
                {warningMessages.map((msg, i) => (
                  <li key={`warning-${i}`}>• {msg}</li>
                ))}
              </ul>
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Hook to get validation border class for a node
 */
export function useNodeValidationClass(nodeId: string): string {
  const { hasErrorsForNode, hasWarningsForNode } = useValidation();
  const { currentNodeId, visitedNodes, isSimulating } = useSimulation();

  // Simulation highlighting takes priority
  if (isSimulating) {
    if (currentNodeId === nodeId) {
      return 'ring-2 ring-primary ring-offset-2 animate-pulse';
    }
    if (visitedNodes.includes(nodeId)) {
      return 'ring-2 ring-green-500/50 ring-offset-1';
    }
  }

  const hasErrors = hasErrorsForNode(nodeId);
  const hasWarnings = hasWarningsForNode(nodeId);

  if (hasErrors) {
    return 'ring-2 ring-red-500 ring-offset-1';
  }
  if (hasWarnings) {
    return 'ring-2 ring-yellow-500 ring-offset-1';
  }
  return '';
}
