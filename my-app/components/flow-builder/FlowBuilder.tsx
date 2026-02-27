'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useReactFlow,
  BackgroundVariant,
  ConnectionLineType,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { ChatbotAutomation } from '@/types/chatbot-automation';
import { nodeTypes } from './nodes';
import CustomEdge from './edges/CustomEdge';
import FlowToolbar from './FlowToolbar';
import NodeEditorPanel from './panels/NodeEditorPanel';
import ContextMenu from './ContextMenu';
import ConnectionMenu from './ConnectionMenu';
import ValidationPanel from './panels/ValidationPanel';
import { useFlowState } from './hooks/useFlowState';
import { useFlowValidation } from './hooks/useFlowValidation';
import { useFlowSimulation } from './hooks/useFlowSimulation';
import { ValidationProvider } from './context/ValidationContext';
import { SimulationProvider } from './context/SimulationContext';
import SimulationPanel from './panels/SimulationPanel';
import { FlowAnalyticsModal } from './FlowAnalyticsModal';
import { ExtendedFlowNode } from './utils/node-factories';
import { getNodeErrors } from './utils/flow-validation';

const edgeTypes = {
  custom: CustomEdge,
};

interface FlowBuilderInnerProps {
  chatbot: ChatbotAutomation;
  onUpdate: (updates: Partial<ChatbotAutomation>) => void;
}

function FlowBuilderInner({ chatbot, onUpdate }: FlowBuilderInnerProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { fitView, setCenter } = useReactFlow();
  const [showValidationPanel, setShowValidationPanel] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);

  const {
    nodes,
    edges,
    selectedNode,
    contextMenu,
    connectionMenu,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodeClick,
    onNodeDoubleClick,
    onPaneClick,
    onPaneContextMenu,
    onNodeContextMenu,
    onEdgeContextMenu,
    onDrop,
    onDragOver,
    onConnectStart,
    onConnectEnd,
    handleContextMenuAction,
    handleConnectionMenuSelect,
    closeContextMenu,
    closeConnectionMenu,
    deleteNode,
    deleteEdge,
    updateNodeData,
    autoLayout,
    syncToChatbot,
  } = useFlowState({ chatbot, onUpdate });

  // Validation
  const {
    validationResult,
    validate,
    errorCount,
    warningCount,
    hasErrorsForNode,
    hasWarningsForNode,
    getErrorsForNode,
  } = useFlowValidation(nodes, edges);

  // Validation context value
  const validationContextValue = {
    validationResult,
    hasErrorsForNode,
    hasWarningsForNode,
    getErrorsForNode,
  };

  // Simulation
  const {
    state: simulationState,
    availableTriggers,
    isOpen: isSimulationOpen,
    openSimulation,
    closeSimulation,
    startSimulation,
    sendMessage: sendSimulationMessage,
    resetSimulation,
  } = useFlowSimulation(nodes, edges);

  // Handle simulation toggle
  const handleSimulationToggle = useCallback(() => {
    if (isSimulationOpen) {
      closeSimulation();
    } else {
      openSimulation();
    }
  }, [isSimulationOpen, openSimulation, closeSimulation]);

  // Navigate to node from simulation
  const handleSimulationNodeClick = useCallback(
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (node) {
        setCenter(node.position.x + 140, node.position.y + 75, { zoom: 1, duration: 500 });
      }
    },
    [nodes, setCenter]
  );

  // Simulation context value
  const simulationContextValue = {
    currentNodeId: simulationState.currentNodeId,
    visitedNodes: simulationState.visitedNodes,
    isSimulating: isSimulationOpen,
  };

  // Sync changes to chatbot after interactions
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    syncTimeoutRef.current = setTimeout(() => {
      syncToChatbot();
    }, 500);

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [nodes, edges, syncToChatbot]);

  // Fit view on initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      fitView({ padding: 0.2 });
    }, 100);
    return () => clearTimeout(timer);
  }, [fitView]);

  const handleAutoLayout = useCallback(() => {
    autoLayout();
    setTimeout(() => fitView({ padding: 0.2 }), 50);
  }, [autoLayout, fitView]);

  // Handle validation
  const handleValidate = useCallback(() => {
    validate();
    setShowValidationPanel(true);
  }, [validate]);

  // Handle analytics
  const handleOpenAnalytics = useCallback(() => {
    setShowAnalyticsModal(true);
  }, []);

  // Navigate to node from validation panel
  const handleValidationNodeClick = useCallback(
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (node) {
        // Center on the node
        setCenter(node.position.x + 140, node.position.y + 75, { zoom: 1, duration: 500 });
        // Select the node by triggering a click
        const syntheticEvent = { preventDefault: () => {} } as React.MouseEvent;
        onNodeClick(syntheticEvent, node);
      }
    },
    [nodes, setCenter, onNodeClick]
  );

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input, textarea, or contenteditable element
      const activeElement = document.activeElement;
      const isTyping =
        activeElement?.tagName === 'INPUT' ||
        activeElement?.tagName === 'TEXTAREA' ||
        activeElement?.getAttribute('contenteditable') === 'true';

      if (isTyping) return;

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNode) {
        e.preventDefault();
        deleteNode(selectedNode.id);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedNode, deleteNode]);

  return (
    <div ref={reactFlowWrapper} className="h-full w-full relative">
      <SimulationProvider value={simulationContextValue}>
        <ValidationProvider value={validationContextValue}>
          <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onNodeDoubleClick={onNodeDoubleClick}
        onPaneClick={onPaneClick}
        onPaneContextMenu={onPaneContextMenu}
        onNodeContextMenu={onNodeContextMenu}
        onEdgeContextMenu={onEdgeContextMenu}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={{
          type: 'custom',
          animated: false,
        }}
        connectionLineType={ConnectionLineType.SmoothStep}
        connectionLineStyle={{ stroke: '#94a3b8', strokeWidth: 2 }}
        fitView
        snapToGrid
        snapGrid={[16, 16]}
        minZoom={0.2}
        maxZoom={2}
        className="bg-muted/30"
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#d1d5db"
          className="opacity-50"
        />
        <Controls
          className="bg-background border rounded-lg shadow-sm"
          showInteractive={false}
        />
        <MiniMap
          nodeStrokeWidth={3}
          nodeColor={(node) => {
            switch (node.type) {
              case 'start':
                return '#22c55e';
              case 'question':
                return '#3b82f6';
              case 'text':
                return '#6366f1';
              case 'condition':
                return '#eab308';
              case 'user_input_flow':
                return '#14b8a6';
              case 'question_input':
                return '#06b6d4';
              case 'action':
                return '#a855f7';
              case 'media':
                return '#ec4899';
              case 'cta_button':
                return '#f97316';
              case 'http_api':
                return '#8b5cf6';
              case 'sequence':
                return '#10b981';
              default:
                return '#94a3b8';
            }
          }}
          className="bg-background/95 border rounded-lg shadow-sm"
          maskColor="rgba(0, 0, 0, 0.1)"
          pannable
          zoomable
        />
        <FlowToolbar
          onAutoLayout={handleAutoLayout}
          onValidate={handleValidate}
          onSimulate={handleSimulationToggle}
          onAnalytics={handleOpenAnalytics}
          errorCount={errorCount}
          warningCount={warningCount}
          isSimulating={isSimulationOpen}
        />
        </ReactFlow>
        </ValidationProvider>
      </SimulationProvider>

      {/* Context Menu */}
      <ContextMenu
        position={contextMenu?.position || null}
        nodeId={contextMenu?.nodeId}
        edgeId={contextMenu?.edgeId}
        onAction={handleContextMenuAction}
        onClose={closeContextMenu}
      />

      {/* Connection Menu - appears when dragging from output handle */}
      <ConnectionMenu
        position={connectionMenu}
        onSelect={(item) => handleConnectionMenuSelect(item.type, item.actionType, item.mediaType)}
        onClose={closeConnectionMenu}
      />

      {/* Node Editor Panel */}
      <NodeEditorPanel
        selectedNode={selectedNode as ExtendedFlowNode | null}
        onUpdate={updateNodeData}
        onDelete={deleteNode}
        onClose={() => onPaneClick()}
        menus={chatbot.menus}
      />

      {/* Validation Panel */}
      {showValidationPanel && (
        <ValidationPanel
          validationResult={validationResult}
          onNodeClick={handleValidationNodeClick}
          onValidate={handleValidate}
          onClose={() => setShowValidationPanel(false)}
        />
      )}

      {/* Simulation Panel */}
      {isSimulationOpen && (
        <SimulationPanel
          state={simulationState}
          availableTriggers={availableTriggers}
          onStart={startSimulation}
          onSendMessage={sendSimulationMessage}
          onReset={resetSimulation}
          onClose={closeSimulation}
          onNodeClick={handleSimulationNodeClick}
        />
      )}

      {/* Flow Analytics Modal */}
      <FlowAnalyticsModal
        open={showAnalyticsModal}
        onClose={() => setShowAnalyticsModal(false)}
        flowId={chatbot.id}
        flowName={chatbot.name}
      />
    </div>
  );
}

interface FlowBuilderProps {
  chatbot: ChatbotAutomation;
  onUpdate: (updates: Partial<ChatbotAutomation>) => void;
}

export default function FlowBuilder({ chatbot, onUpdate }: FlowBuilderProps) {
  return (
    <ReactFlowProvider>
      <FlowBuilderInner chatbot={chatbot} onUpdate={onUpdate} />
    </ReactFlowProvider>
  );
}
