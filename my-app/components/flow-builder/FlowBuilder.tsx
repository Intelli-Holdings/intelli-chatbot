'use client';

import { useCallback, useEffect, useRef } from 'react';
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
import { useFlowState } from './hooks/useFlowState';
import { ExtendedFlowNode } from './utils/node-factories';

const edgeTypes = {
  custom: CustomEdge,
};

interface FlowBuilderInnerProps {
  chatbot: ChatbotAutomation;
  onUpdate: (updates: Partial<ChatbotAutomation>) => void;
}

function FlowBuilderInner({ chatbot, onUpdate }: FlowBuilderInnerProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { fitView } = useReactFlow();

  const {
    nodes,
    edges,
    selectedNode,
    contextMenu,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodeClick,
    onNodeDoubleClick,
    onPaneClick,
    onPaneContextMenu,
    onNodeContextMenu,
    onDrop,
    onDragOver,
    onConnectEnd,
    handleContextMenuAction,
    closeContextMenu,
    deleteNode,
    updateNodeData,
    autoLayout,
    syncToChatbot,
  } = useFlowState({ chatbot, onUpdate });

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
        onDrop={onDrop}
        onDragOver={onDragOver}
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
              case 'action':
                return '#a855f7';
              case 'media':
                return '#ec4899';
              default:
                return '#94a3b8';
            }
          }}
          className="bg-background/95 border rounded-lg shadow-sm"
          maskColor="rgba(0, 0, 0, 0.1)"
          pannable
          zoomable
        />
        <FlowToolbar onAutoLayout={handleAutoLayout} />
      </ReactFlow>

      {/* Context Menu */}
      <ContextMenu
        position={contextMenu?.position || null}
        nodeId={contextMenu?.nodeId}
        onAction={handleContextMenuAction}
        onClose={closeContextMenu}
      />

      {/* Node Editor Panel */}
      <NodeEditorPanel
        selectedNode={selectedNode as ExtendedFlowNode | null}
        onUpdate={updateNodeData}
        onDelete={deleteNode}
        onClose={() => onPaneClick()}
        menus={chatbot.menus}
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
