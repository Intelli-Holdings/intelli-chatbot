'use client';

import { useState, useCallback } from 'react';
import {
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  NodeChange,
  EdgeChange,
  useReactFlow,
} from 'reactflow';
import {
  ChatbotAutomation,
  ChatbotFlowNode,
  ChatbotFlowEdge,
  ActionNodeData,
} from '@/types/chatbot-automation';
import { chatbotToFlow, flowToChatbot, autoLayoutFlow } from '../utils/flow-converters';
import {
  createStartNode,
  createQuestionNode,
  createTextNode,
  createConditionNode,
  createActionNode,
  createNodeFromAction,
  cloneNode,
  ExtendedFlowNode,
} from '../utils/node-factories';
import { ContextMenuPosition } from '../ContextMenu';

interface UseFlowStateProps {
  chatbot: ChatbotAutomation;
  onUpdate: (updates: Partial<ChatbotAutomation>) => void;
}

interface UseFlowStateReturn {
  nodes: Node[];
  edges: Edge[];
  selectedNode: Node | null;
  contextMenu: { position: ContextMenuPosition; nodeId: string | null } | null;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  onNodeClick: (event: React.MouseEvent, node: Node) => void;
  onNodeDoubleClick: (event: React.MouseEvent, node: Node) => void;
  onPaneClick: () => void;
  onPaneContextMenu: (event: React.MouseEvent) => void;
  onNodeContextMenu: (event: React.MouseEvent, node: Node) => void;
  onDrop: (event: React.DragEvent) => void;
  onDragOver: (event: React.DragEvent) => void;
  onConnectEnd: (event: MouseEvent | TouchEvent) => void;
  handleContextMenuAction: (action: string, position: ContextMenuPosition) => void;
  closeContextMenu: () => void;
  deleteNode: (nodeId: string) => void;
  updateNodeData: (nodeId: string, data: Partial<ExtendedFlowNode['data']>) => void;
  autoLayout: () => void;
  syncToChatbot: () => void;
}

export function useFlowState({ chatbot, onUpdate }: UseFlowStateProps): UseFlowStateReturn {
  const { screenToFlowPosition } = useReactFlow();

  // Convert chatbot to flow format
  const initialFlow = chatbotToFlow(chatbot);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialFlow.nodes as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialFlow.edges as Edge[]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [contextMenu, setContextMenu] = useState<{ position: ContextMenuPosition; nodeId: string | null } | null>(null);

  // Sync to chatbot when nodes/edges change
  const syncToChatbot = useCallback(() => {
    const updates = flowToChatbot(
      nodes as ChatbotFlowNode[],
      edges as ChatbotFlowEdge[],
      chatbot
    );
    onUpdate(updates);
  }, [nodes, edges, chatbot, onUpdate]);

  // Handle new edge connection
  const onConnect = useCallback(
    (connection: Connection) => {
      if (connection.source === connection.target) return;

      const sourceNode = nodes.find((n) => n.id === connection.source);
      let label: string | undefined;

      if (sourceNode && connection.sourceHandle?.startsWith('option-')) {
        const optionId = connection.sourceHandle.replace('option-', '');
        const questionData = sourceNode.data as { menu?: { options?: Array<{ id: string; title: string }> } };
        const option = questionData.menu?.options?.find((o) => o.id === optionId);
        label = option?.title;
      }

      // Add label for condition nodes
      if (sourceNode?.type === 'condition') {
        label = connection.sourceHandle === 'true' ? 'Yes' : 'No';
      }

      const newEdge: Edge = {
        id: `edge-${connection.source}-${connection.sourceHandle || 'default'}-${connection.target}`,
        source: connection.source!,
        target: connection.target!,
        sourceHandle: connection.sourceHandle,
        targetHandle: connection.targetHandle,
        label,
      };

      setEdges((eds) => addEdge(newEdge, eds));
    },
    [nodes, setEdges]
  );

  // Handle node click for selection
  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setContextMenu(null);
  }, []);

  // Handle node double-click to open editor panel
  const onNodeDoubleClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  // Handle pane click to deselect
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setContextMenu(null);
  }, []);

  // Handle pane right-click for context menu
  const onPaneContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      const flowPosition = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      setContextMenu({
        position: {
          x: event.clientX,
          y: event.clientY,
          flowPosition,
        },
        nodeId: null,
      });
    },
    [screenToFlowPosition]
  );

  // Handle node right-click for context menu
  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      const flowPosition = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      setContextMenu({
        position: {
          x: event.clientX,
          y: event.clientY,
          flowPosition,
        },
        nodeId: node.id,
      });
      setSelectedNode(node);
    },
    [screenToFlowPosition]
  );

  // Handle connection end - show menu when dropping on empty canvas
  const onConnectEnd = useCallback(
    (event: MouseEvent | TouchEvent) => {
      // Get the target element
      const target = event.target as HTMLElement;

      // Only show context menu if dropped on the pane (empty canvas)
      if (target.classList.contains('react-flow__pane')) {
        const clientX = 'clientX' in event ? event.clientX : event.touches[0].clientX;
        const clientY = 'clientY' in event ? event.clientY : event.touches[0].clientY;

        const flowPosition = screenToFlowPosition({ x: clientX, y: clientY });
        setContextMenu({
          position: {
            x: clientX,
            y: clientY,
            flowPosition,
          },
          nodeId: null,
        });
      }
    },
    [screenToFlowPosition]
  );

  // Close context menu
  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  // Handle context menu actions
  const handleContextMenuAction = useCallback(
    (action: string, position: ContextMenuPosition) => {
      if (action === 'clone' && contextMenu?.nodeId) {
        const nodeToClone = nodes.find((n) => n.id === contextMenu.nodeId);
        if (nodeToClone) {
          const clonedNode = cloneNode(nodeToClone as ExtendedFlowNode);
          setNodes((nds) => [...nds, clonedNode as Node]);
        }
      } else if (action === 'delete' && contextMenu?.nodeId) {
        deleteNode(contextMenu.nodeId);
      } else if (action.startsWith('add-')) {
        const newNode = createNodeFromAction(action, position.flowPosition);
        if (newNode) {
          setNodes((nds) => [...nds, newNode as Node]);
        }
      }
      setContextMenu(null);
    },
    [contextMenu, nodes, setNodes]
  );

  // Handle drop for new nodes from toolbar
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const data = event.dataTransfer.getData('application/reactflow');
      if (!data) return;

      const { type, actionType } = JSON.parse(data) as {
        type: string;
        actionType?: ActionNodeData['actionType'];
      };

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      let newNode: ExtendedFlowNode | null = null;

      switch (type) {
        case 'start':
          newNode = createStartNode(position);
          break;
        case 'question':
          newNode = createQuestionNode(position);
          break;
        case 'text':
          newNode = createTextNode(position);
          break;
        case 'condition':
          newNode = createConditionNode(position);
          break;
        case 'action':
          if (actionType) {
            newNode = createActionNode(position, actionType);
          }
          break;
      }

      if (newNode) {
        setNodes((nds) => [...nds, newNode as Node]);
      }
    },
    [screenToFlowPosition, setNodes]
  );

  // Handle drag over
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Delete a node
  const deleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
      if (selectedNode?.id === nodeId) {
        setSelectedNode(null);
      }
    },
    [setNodes, setEdges, selectedNode]
  );

  // Update node data
  const updateNodeData = useCallback(
    (nodeId: string, data: Partial<ExtendedFlowNode['data']>) => {
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === nodeId) {
            return {
              ...n,
              data: { ...n.data, ...data },
            };
          }
          return n;
        })
      );

      if (selectedNode?.id === nodeId) {
        setSelectedNode((prev) =>
          prev ? { ...prev, data: { ...prev.data, ...data } } : null
        );
      }
    },
    [setNodes, selectedNode]
  );

  // Auto-layout nodes
  const autoLayout = useCallback(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = autoLayoutFlow(
      nodes as ChatbotFlowNode[],
      edges as ChatbotFlowEdge[]
    );
    setNodes(layoutedNodes as Node[]);
    setEdges(layoutedEdges as Edge[]);
  }, [nodes, edges, setNodes, setEdges]);

  return {
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
  };
}
