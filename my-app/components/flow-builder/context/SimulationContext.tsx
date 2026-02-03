'use client';

import { createContext, useContext } from 'react';

interface SimulationContextValue {
  currentNodeId: string | null;
  visitedNodes: string[];
  isSimulating: boolean;
}

const defaultContext: SimulationContextValue = {
  currentNodeId: null,
  visitedNodes: [],
  isSimulating: false,
};

export const SimulationContext = createContext<SimulationContextValue>(defaultContext);

export function useSimulation() {
  return useContext(SimulationContext);
}

interface SimulationProviderProps {
  children: React.ReactNode;
  value: SimulationContextValue;
}

export function SimulationProvider({ children, value }: SimulationProviderProps) {
  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  );
}
