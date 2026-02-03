'use client';

import { AlertCircle, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  ValidationResult,
  ValidationError,
  getNodeTypeLabel,
} from '../utils/flow-validation';

interface ValidationPanelProps {
  validationResult: ValidationResult;
  onNodeClick: (nodeId: string) => void;
  onValidate: () => void;
  onClose: () => void;
}

export default function ValidationPanel({
  validationResult,
  onNodeClick,
  onValidate,
  onClose,
}: ValidationPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { errors, warnings, isValid } = validationResult;

  const hasIssues = errors.length > 0 || warnings.length > 0;

  return (
    <div className="absolute bottom-4 left-4 z-40 w-80 bg-background border rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div
        className={cn(
          'flex items-center justify-between px-3 py-2 cursor-pointer',
          isValid && !hasIssues
            ? 'bg-green-50 dark:bg-green-950/30'
            : errors.length > 0
            ? 'bg-red-50 dark:bg-red-950/30'
            : 'bg-yellow-50 dark:bg-yellow-950/30'
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          {isValid && !hasIssues ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700 dark:text-green-400">
                Flow is valid
              </span>
            </>
          ) : errors.length > 0 ? (
            <>
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-700 dark:text-red-400">
                {errors.length} error{errors.length !== 1 ? 's' : ''}
                {warnings.length > 0 && `, ${warnings.length} warning${warnings.length !== 1 ? 's' : ''}`}
              </span>
            </>
          ) : (
            <>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
                {warnings.length} warning{warnings.length !== 1 ? 's' : ''}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="max-h-64 overflow-y-auto">
          {/* Errors */}
          {errors.length > 0 && (
            <div className="p-2 space-y-1">
              <p className="text-xs font-medium text-muted-foreground px-1">Errors</p>
              {errors.map((error, index) => (
                <ValidationItem
                  key={`error-${index}`}
                  error={error}
                  type="error"
                  onClick={() => error.nodeId && onNodeClick(error.nodeId)}
                />
              ))}
            </div>
          )}

          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="p-2 space-y-1 border-t">
              <p className="text-xs font-medium text-muted-foreground px-1">Warnings</p>
              {warnings.map((warning, index) => (
                <ValidationItem
                  key={`warning-${index}`}
                  error={warning}
                  type="warning"
                  onClick={() => warning.nodeId && onNodeClick(warning.nodeId)}
                />
              ))}
            </div>
          )}

          {/* No issues */}
          {!hasIssues && (
            <div className="p-4 text-center">
              <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Your flow looks good! No issues found.
              </p>
            </div>
          )}

          {/* Re-validate button */}
          <div className="p-2 border-t">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={onValidate}
            >
              Re-validate Flow
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

interface ValidationItemProps {
  error: ValidationError;
  type: 'error' | 'warning';
  onClick: () => void;
}

function ValidationItem({ error, type, onClick }: ValidationItemProps) {
  const isClickable = !!error.nodeId;

  return (
    <button
      onClick={isClickable ? onClick : undefined}
      className={cn(
        'w-full text-left px-2 py-1.5 rounded-md transition-colors',
        isClickable && 'hover:bg-muted cursor-pointer',
        !isClickable && 'cursor-default'
      )}
      disabled={!isClickable}
    >
      <div className="flex items-start gap-2">
        {type === 'error' ? (
          <AlertCircle className="h-3.5 w-3.5 text-red-500 mt-0.5 flex-shrink-0" />
        ) : (
          <AlertTriangle className="h-3.5 w-3.5 text-yellow-500 mt-0.5 flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs truncate">{error.message}</p>
          {error.nodeType && (
            <p className="text-[10px] text-muted-foreground">
              {getNodeTypeLabel(error.nodeType)}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}
