'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Node, Edge } from 'reactflow';
import {
  FlowSimulator,
  SimulationState,
  getAvailableTriggers,
} from '../simulation/flow-simulator';

interface UseFlowSimulationReturn {
  state: SimulationState;
  availableTriggers: string[];
  isOpen: boolean;
  openSimulation: () => void;
  closeSimulation: () => void;
  startSimulation: (keyword: string) => void;
  sendMessage: (message: string, optionId?: string) => void;
  resetSimulation: () => void;
}

const initialState: SimulationState = {
  isRunning: false,
  currentNodeId: null,
  messages: [],
  variables: {},
  waitingForInput: false,
  pendingVariableName: null,
  visitedNodes: [],
};

export function useFlowSimulation(
  nodes: Node[],
  edges: Edge[]
): UseFlowSimulationReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState<SimulationState>(initialState);
  const simulatorRef = useRef<FlowSimulator | null>(null);

  // Get available triggers from start nodes
  const availableTriggers = getAvailableTriggers(nodes);

  // Create or update simulator when nodes/edges change
  useEffect(() => {
    if (isOpen) {
      simulatorRef.current = new FlowSimulator(nodes, edges, setState);
    }
  }, [nodes, edges, isOpen]);

  // Open simulation panel
  const openSimulation = useCallback(() => {
    setIsOpen(true);
    setState(initialState);
    simulatorRef.current = new FlowSimulator(nodes, edges, setState);
  }, [nodes, edges]);

  // Close simulation panel
  const closeSimulation = useCallback(() => {
    setIsOpen(false);
    setState(initialState);
    simulatorRef.current = null;
  }, []);

  // Start simulation with a keyword
  const startSimulation = useCallback((keyword: string) => {
    if (simulatorRef.current) {
      simulatorRef.current.start(keyword);
    }
  }, []);

  // Send a message
  const sendMessage = useCallback((message: string, optionId?: string) => {
    if (simulatorRef.current) {
      simulatorRef.current.handleUserInput(message, optionId);
    }
  }, []);

  // Reset simulation
  const resetSimulation = useCallback(() => {
    if (simulatorRef.current) {
      simulatorRef.current.reset();
    }
    setState(initialState);
  }, []);

  return {
    state,
    availableTriggers,
    isOpen,
    openSimulation,
    closeSimulation,
    startSimulation,
    sendMessage,
    resetSimulation,
  };
}
