'use client';

import { createContext, useContext } from 'react';
import { ValidationResult, ValidationError } from '../utils/flow-validation';

interface ValidationContextValue {
  validationResult: ValidationResult;
  hasErrorsForNode: (nodeId: string) => boolean;
  hasWarningsForNode: (nodeId: string) => boolean;
  getErrorsForNode: (nodeId: string) => ValidationError[];
}

const EMPTY_VALIDATION: ValidationResult = {
  isValid: true,
  errors: [],
  warnings: [],
};

const defaultContext: ValidationContextValue = {
  validationResult: EMPTY_VALIDATION,
  hasErrorsForNode: () => false,
  hasWarningsForNode: () => false,
  getErrorsForNode: () => [],
};

export const ValidationContext = createContext<ValidationContextValue>(defaultContext);

export function useValidation() {
  return useContext(ValidationContext);
}

interface ValidationProviderProps {
  children: React.ReactNode;
  value: ValidationContextValue;
}

export function ValidationProvider({ children, value }: ValidationProviderProps) {
  return (
    <ValidationContext.Provider value={value}>
      {children}
    </ValidationContext.Provider>
  );
}
