'use client';

import { useState, useCallback, useMemo } from 'react';
import { Node, Edge } from 'reactflow';
import {
  validateFlow,
  ValidationResult,
  ValidationError,
  getNodeErrors,
  nodeHasErrors,
  nodeHasWarnings,
} from '../utils/flow-validation';

interface UseFlowValidationReturn {
  validationResult: ValidationResult;
  validate: () => ValidationResult;
  isValid: boolean;
  errorCount: number;
  warningCount: number;
  getErrorsForNode: (nodeId: string) => ValidationError[];
  hasErrorsForNode: (nodeId: string) => boolean;
  hasWarningsForNode: (nodeId: string) => boolean;
  clearValidation: () => void;
}

const EMPTY_VALIDATION: ValidationResult = {
  isValid: true,
  errors: [],
  warnings: [],
};

export function useFlowValidation(
  nodes: Node[],
  edges: Edge[]
): UseFlowValidationReturn {
  const [validationResult, setValidationResult] = useState<ValidationResult>(EMPTY_VALIDATION);

  // Validate the flow
  const validate = useCallback(() => {
    const result = validateFlow(nodes, edges);
    setValidationResult(result);
    return result;
  }, [nodes, edges]);

  // Clear validation
  const clearValidation = useCallback(() => {
    setValidationResult(EMPTY_VALIDATION);
  }, []);

  // Get errors for a specific node
  const getErrorsForNode = useCallback(
    (nodeId: string) => getNodeErrors(nodeId, validationResult),
    [validationResult]
  );

  // Check if node has errors
  const hasErrorsForNode = useCallback(
    (nodeId: string) => nodeHasErrors(nodeId, validationResult),
    [validationResult]
  );

  // Check if node has warnings
  const hasWarningsForNode = useCallback(
    (nodeId: string) => nodeHasWarnings(nodeId, validationResult),
    [validationResult]
  );

  // Memoized counts
  const errorCount = useMemo(
    () => validationResult.errors.length,
    [validationResult.errors]
  );

  const warningCount = useMemo(
    () => validationResult.warnings.length,
    [validationResult.warnings]
  );

  return {
    validationResult,
    validate,
    isValid: validationResult.isValid,
    errorCount,
    warningCount,
    getErrorsForNode,
    hasErrorsForNode,
    hasWarningsForNode,
    clearValidation,
  };
}
