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
import { chatbotToFlow, flowToChatbot, autoLayoutFlow, flowNodesToBackend, backendNodesToFlow } from '../utils/flow-converters';
import { ChatbotAutomationService } from '@/services/chatbot-automation';
import {
  createStartNode,
  createQuestionNode,
  createTextNode,
  createConditionNode,
  createActionNode,
  createMediaNode,
  createUserInputFlowNode,
  createQuestionInputNode,
  createCTAButtonNode,
  createHttpApiNode,
  createNodeFromAction,
  cloneNode,
  ExtendedFlowNode,
} from '../utils/node-factories';
import { MediaType } from '../nodes/MediaNode';
import { ContextMenuPosition } from '../ContextMenu';
import { ConnectionMenuPosition } from '../ConnectionMenu';

interface UseFlowStateProps {
  chatbot: ChatbotAutomation;
  onUpdate: (updates: Partial<ChatbotAutomation>) => void;
}

interface ConnectionState {
  sourceNodeId: string;
  sourceHandleId: string | null;
}

interface UseFlowStateReturn {
  nodes: Node[];
  edges: Edge[];
  selectedNode: Node | null;
  contextMenu: { position: ContextMenuPosition; nodeId: string | null } | null;
  connectionMenu: ConnectionMenuPosition | null;
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
  onConnectStart: (event: React.MouseEvent | React.TouchEvent, params: { nodeId: string | null; handleId: string | null }) => void;
  onConnectEnd: (event: MouseEvent | TouchEvent) => void;
  handleContextMenuAction: (action: string, position: ContextMenuPosition) => void;
  handleConnectionMenuSelect: (nodeType: string, actionType?: string, mediaType?: string) => void;
  closeContextMenu: () => void;
  closeConnectionMenu: () => void;
  deleteNode: (nodeId: string) => void;
  updateNodeData: (nodeId: string, data: Partial<ExtendedFlowNode['data']>) => void;
  autoLayout: () => void;
  syncToChatbot: () => void;
}

export function useFlowState({ chatbot, onUpdate }: UseFlowStateProps): UseFlowStateReturn {
  const { screenToFlowPosition } = useReactFlow();

  // Convert chatbot to flow format
  // Use raw backend data if available, otherwise fall back to legacy conversion
  const initialFlow = (() => {
    const rawNodes = chatbot.flowLayout?.rawNodes;
    const rawEdges = chatbot.flowLayout?.rawEdges;

    console.log('=== useFlowState initialFlow ===');
    console.log('chatbot.flowLayout:', chatbot.flowLayout);
    console.log('rawNodes:', rawNodes?.length, rawNodes);
    console.log('rawEdges:', rawEdges?.length, rawEdges);

    if (rawNodes && rawNodes.length > 0) {
      // Use the direct backend format conversion
      console.log('Loading flow from raw backend data:', rawNodes.length, 'nodes,', rawEdges?.length || 0, 'edges');
      const result = backendNodesToFlow(rawNodes, rawEdges || []);
      console.log('Converted result - nodes:', result.nodes.length, 'edges:', result.edges.length);
      return result;
    }

    // Fall back to legacy menu-based format
    console.log('Loading flow from legacy format (no rawNodes)');
    return chatbotToFlow(chatbot);
  })();

  const [nodes, setNodes, onNodesChange] = useNodesState(initialFlow.nodes as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialFlow.edges as Edge[]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [contextMenu, setContextMenu] = useState<{ position: ContextMenuPosition; nodeId: string | null } | null>(null);
  const [connectionMenu, setConnectionMenu] = useState<ConnectionMenuPosition | null>(null);
  const [pendingConnection, setPendingConnection] = useState<ConnectionState | null>(null);

  // Sync to chatbot when nodes/edges change
  const syncToChatbot = useCallback(async () => {
    try {
      // Validate nodes and edges before conversion
      if (!nodes || !Array.isArray(nodes) || nodes.length === 0) {
        console.warn('syncToChatbot: Invalid or empty nodes array');
        return;
      }
      if (!edges || !Array.isArray(edges)) {
        console.warn('syncToChatbot: Invalid edges array');
        return;
      }

      // Convert to frontend format for local state
      const updates = flowToChatbot(
        nodes as ChatbotFlowNode[],
        edges as ChatbotFlowEdge[],
        chatbot
      );

      if (updates) {
        onUpdate(updates);
      }

      // Also sync to backend if chatbot has an ID
      if (chatbot.id) {
        try {
          // Convert to backend format
          const { nodes: backendNodes, edges: backendEdges } = flowNodesToBackend(
            nodes as ExtendedFlowNode[],
            edges as ChatbotFlowEdge[]
          );

          console.log('=== Syncing to backend ===');
          console.log('Backend nodes:', backendNodes);
          console.log('Backend edges:', backendEdges);

          // Update backend
          await ChatbotAutomationService.updateFlowNodes(
            chatbot.id,
            backendNodes,
            backendEdges
          );
          console.log('Flow synced to backend successfully');
        } catch (backendError) {
          console.warn('Failed to sync to backend (will retry on next save):', backendError);
          // Don't throw - local state is still updated
        }
      }
    } catch (error) {
      console.error('syncToChatbot: Error converting flow to chatbot:', error);
    }
  }, [nodes, edges, chatbot, onUpdate]);

  // Handle new edge connection
  const onConnect = useCallback(
    (connection: Connection) => {
      if (connection.source === connection.target) return;

      const sourceNode = nodes.find((n) => n.id === connection.source);
      let label: string | undefined;

      if (sourceNode && connection.sourceHandle?.startsWith('option-')) {
        const optionId = connection.sourceHandle.replace('option-', '');
        // Type guard for question node data
        if (sourceNode.data && 'menu' in sourceNode.data) {
          const questionData = sourceNode.data as { menu?: { options?: Array<{ id: string; title: string }> } };
          const option = questionData.menu?.options?.find((o) => o.id === optionId);
          label = option?.title;
        }
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

  // Handle connection start - track the source node and handle
  const onConnectStart = useCallback(
    (_event: React.MouseEvent | React.TouchEvent, params: { nodeId: string | null; handleId: string | null }) => {
      if (params.nodeId) {
        setPendingConnection({
          sourceNodeId: params.nodeId,
          sourceHandleId: params.handleId,
        });
      }
    },
    []
  );

  // Handle connection end - show connection menu when dropping on empty canvas
  const onConnectEnd = useCallback(
    (event: MouseEvent | TouchEvent) => {
      // Get the target element
      const target = event.target as HTMLElement;

      // Only show connection menu if dropped on the pane (empty canvas) and we have a pending connection
      if (target.classList.contains('react-flow__pane') && pendingConnection) {
        const clientX = 'clientX' in event ? event.clientX : event.touches[0].clientX;
        const clientY = 'clientY' in event ? event.clientY : event.touches[0].clientY;

        const flowPosition = screenToFlowPosition({ x: clientX, y: clientY });
        setConnectionMenu({
          x: clientX,
          y: clientY,
          flowPosition,
          sourceNodeId: pendingConnection.sourceNodeId,
          sourceHandleId: pendingConnection.sourceHandleId,
        });
      } else {
        setPendingConnection(null);
      }
    },
    [screenToFlowPosition, pendingConnection]
  );

  // Close connection menu
  const closeConnectionMenu = useCallback(() => {
    setConnectionMenu(null);
    setPendingConnection(null);
  }, []);

  // Handle connection menu selection - create node and connect
  const handleConnectionMenuSelect = useCallback(
    (nodeType: string, actionType?: string, mediaType?: string) => {
      if (!connectionMenu || !connectionMenu.flowPosition) {
        console.warn('handleConnectionMenuSelect: Invalid connection menu state');
        closeConnectionMenu();
        return;
      }

      const position = connectionMenu.flowPosition;
      let newNode: ExtendedFlowNode | null = null;

      switch (nodeType) {
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
        case 'user_input_flow':
          newNode = createUserInputFlowNode(position);
          break;
        case 'question_input':
          newNode = createQuestionInputNode(position);
          break;
        case 'action':
          // Only create action node if actionType is provided and valid
          if (actionType && ['send_message', 'fallback_ai', 'end'].includes(actionType)) {
            newNode = createActionNode(position, actionType as ActionNodeData['actionType']);
          }
          break;
        case 'media':
          // Only create media node if mediaType is provided and valid
          if (mediaType && ['image', 'video', 'document', 'audio'].includes(mediaType)) {
            newNode = createMediaNode(position, mediaType as MediaType);
          }
          break;
        case 'cta_button':
          newNode = createCTAButtonNode(position);
          break;
        case 'http_api':
          newNode = createHttpApiNode(position);
          break;
      }

      if (newNode && connectionMenu.sourceNodeId) {
        // Add the new node
        setNodes((nds) => [...nds, newNode as Node]);

        // Create edge from source to new node
        const newEdge: Edge = {
          id: `edge-${connectionMenu.sourceNodeId}-${connectionMenu.sourceHandleId || 'default'}-${newNode.id}`,
          source: connectionMenu.sourceNodeId,
          target: newNode.id,
          sourceHandle: connectionMenu.sourceHandleId,
        };

        setEdges((eds) => addEdge(newEdge, eds));
      }

      closeConnectionMenu();
    },
    [connectionMenu, setNodes, setEdges, closeConnectionMenu]
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [contextMenu, nodes, setNodes]
  );

  // Handle drop for new nodes from toolbar
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const data = event.dataTransfer.getData('application/reactflow');
      if (!data) return;

      const { type, actionType, mediaType } = JSON.parse(data) as {
        type: string;
        actionType?: ActionNodeData['actionType'];
        mediaType?: MediaType;
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
        case 'user_input_flow':
          newNode = createUserInputFlowNode(position);
          break;
        case 'question_input':
          newNode = createQuestionInputNode(position);
          break;
        case 'action':
          if (actionType) {
            newNode = createActionNode(position, actionType);
          }
          break;
        case 'media':
          if (mediaType) {
            newNode = createMediaNode(position, mediaType);
          }
          break;
        case 'cta_button':
          newNode = createCTAButtonNode(position);
          break;
        case 'http_api':
          newNode = createHttpApiNode(position);
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
    connectionMenu,
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
    onConnectStart,
    onConnectEnd,
    handleContextMenuAction,
    handleConnectionMenuSelect,
    closeContextMenu,
    closeConnectionMenu,
    deleteNode,
    updateNodeData,
    autoLayout,
    syncToChatbot,
  };
}
