import dagre from 'dagre';
import {
  ChatbotAutomation,
  ChatbotMenu,
  ChatbotTrigger,
  ChatbotFlowNode,
  ChatbotFlowEdge,
  FlowLayout,
  StartNodeData,
  QuestionNodeData,
  ActionNodeData,
  MenuOption,
  generateId,
} from '@/types/chatbot-automation';

const NODE_WIDTH = 280;
const NODE_HEIGHT = 150;

/**
 * Apply auto-layout using dagre
 */
function getLayoutedElements(
  nodes: ChatbotFlowNode[],
  edges: ChatbotFlowEdge[],
  direction: 'TB' | 'LR' = 'TB'
): { nodes: ChatbotFlowNode[]; edges: ChatbotFlowEdge[] } {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction, nodesep: 80, ranksep: 100 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - NODE_WIDTH / 2,
        y: nodeWithPosition.y - NODE_HEIGHT / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}

/**
 * Convert a ChatbotAutomation to flow nodes and edges
 */
export function chatbotToFlow(chatbot: ChatbotAutomation): {
  nodes: ChatbotFlowNode[];
  edges: ChatbotFlowEdge[];
} {
  const nodes: ChatbotFlowNode[] = [];
  const edges: ChatbotFlowEdge[] = [];
  const savedPositions = chatbot.flowLayout?.nodes || [];

  // Helper to get saved position or null
  const getSavedPosition = (nodeId: string) => {
    const saved = savedPositions.find((n) => n.id === nodeId);
    return saved?.position || null;
  };

  // Create start nodes from triggers
  chatbot.triggers.forEach((trigger, index) => {
    const nodeId = `start-${trigger.id}`;
    const savedPos = getSavedPosition(nodeId);

    const nodeData: StartNodeData = {
      type: 'start',
      label: trigger.type === 'keyword'
        ? `Keywords: ${trigger.keywords?.join(', ') || 'None'}`
        : trigger.type === 'first_message'
        ? 'First Message'
        : 'Button Click',
      trigger,
    };

    nodes.push({
      id: nodeId,
      type: 'start',
      position: savedPos || { x: 50, y: 50 + index * 200 },
      data: nodeData,
    });

    // Connect start node to target menu
    if (trigger.menuId) {
      edges.push({
        id: `edge-${nodeId}-menu-${trigger.menuId}`,
        source: nodeId,
        target: `question-${trigger.menuId}`,
        animated: true,
      });
    }
  });

  // Track which action nodes we've created to avoid duplicates
  const createdActionNodes = new Map<string, string>();

  // Create question nodes from menus
  chatbot.menus.forEach((menu, index) => {
    const nodeId = `question-${menu.id}`;
    const savedPos = getSavedPosition(nodeId);

    const nodeData: QuestionNodeData = {
      type: 'question',
      label: menu.name,
      menu,
    };

    nodes.push({
      id: nodeId,
      type: 'question',
      position: savedPos || { x: 400, y: 50 + index * 250 },
      data: nodeData,
    });

    // Create edges for each option
    menu.options.forEach((option) => {
      if (option.action.type === 'show_menu' && option.action.targetMenuId) {
        // Connect to another menu
        edges.push({
          id: `edge-${nodeId}-${option.id}-menu-${option.action.targetMenuId}`,
          source: nodeId,
          sourceHandle: `option-${option.id}`,
          target: `question-${option.action.targetMenuId}`,
          label: option.title,
        });
      } else if (option.action.type !== 'show_menu') {
        // Create or reuse action node
        const actionKey = `${option.action.type}-${option.action.message || ''}`;
        let actionNodeId = createdActionNodes.get(actionKey);

        if (!actionNodeId) {
          actionNodeId = `action-${generateId()}`;
          createdActionNodes.set(actionKey, actionNodeId);

          const actionData: ActionNodeData = {
            type: 'action',
            label: getActionLabel(option.action.type),
            actionType: option.action.type as ActionNodeData['actionType'],
            message: option.action.message,
          };

          const actionSavedPos = getSavedPosition(actionNodeId);
          nodes.push({
            id: actionNodeId,
            type: 'action',
            position: actionSavedPos || { x: 800, y: nodes.length * 100 },
            data: actionData,
          });
        }

        edges.push({
          id: `edge-${nodeId}-${option.id}-action-${actionNodeId}`,
          source: nodeId,
          sourceHandle: `option-${option.id}`,
          target: actionNodeId,
          label: option.title,
        });
      }
    });
  });

  // Apply auto-layout if no saved positions
  if (savedPositions.length === 0 && nodes.length > 0) {
    return getLayoutedElements(nodes, edges);
  }

  return { nodes, edges };
}

/**
 * Convert flow nodes and edges back to ChatbotAutomation format
 */
export function flowToChatbot(
  nodes: ChatbotFlowNode[],
  edges: ChatbotFlowEdge[],
  existingChatbot: ChatbotAutomation
): Partial<ChatbotAutomation> {
  const triggers: ChatbotTrigger[] = [];
  const menus: ChatbotMenu[] = [];
  const flowLayout: FlowLayout = {
    nodes: nodes.map((n) => ({ id: n.id, position: n.position })),
  };

  // Extract triggers from start nodes
  nodes.forEach((node) => {
    if (node.data.type === 'start') {
      const startData = node.data as StartNodeData;
      const outgoingEdge = edges.find((e) => e.source === node.id);

      // Get target menu ID from edge
      let menuId = startData.trigger.menuId;
      if (outgoingEdge) {
        const targetId = outgoingEdge.target;
        if (targetId.startsWith('question-')) {
          menuId = targetId.replace('question-', '');
        }
      }

      triggers.push({
        ...startData.trigger,
        menuId,
      });
    }
  });

  // Extract menus from question nodes
  nodes.forEach((node) => {
    if (node.data.type === 'question') {
      const questionData = node.data as QuestionNodeData;
      const menu = { ...questionData.menu };

      // Update option actions based on edges
      menu.options = menu.options.map((option) => {
        const optionEdge = edges.find(
          (e) => e.source === node.id && e.sourceHandle === `option-${option.id}`
        );

        if (optionEdge) {
          const targetId = optionEdge.target;

          if (targetId.startsWith('question-')) {
            // Connect to another menu
            return {
              ...option,
              action: {
                type: 'show_menu' as const,
                targetMenuId: targetId.replace('question-', ''),
              },
            };
          } else if (targetId.startsWith('action-')) {
            // Connect to action node
            const actionNode = nodes.find((n) => n.id === targetId);
            if (actionNode && actionNode.data.type === 'action') {
              const actionData = actionNode.data as ActionNodeData;
              return {
                ...option,
                action: {
                  type: actionData.actionType,
                  message: actionData.message,
                },
              };
            }
          }
        }

        return option;
      });

      menus.push(menu);
    }
  });

  return {
    ...existingChatbot,
    triggers,
    menus,
    flowLayout,
  };
}

/**
 * Get human-readable label for action type
 */
function getActionLabel(actionType: string): string {
  switch (actionType) {
    case 'send_message':
      return 'Text';
    case 'fallback_ai':
      return 'Hand off to AI';
    case 'end':
      return 'End Conversation';
    default:
      return actionType;
  }
}

/**
 * Re-layout nodes using dagre algorithm
 */
export function autoLayoutFlow(
  nodes: ChatbotFlowNode[],
  edges: ChatbotFlowEdge[]
): { nodes: ChatbotFlowNode[]; edges: ChatbotFlowEdge[] } {
  return getLayoutedElements(nodes, edges);
}
