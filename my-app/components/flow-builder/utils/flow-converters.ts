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
  generateId,
  BackendFlowNode,
  BackendFlowEdge,
} from '@/types/chatbot-automation';
import { TextNodeData } from '../nodes/TextNode';
import { ConditionNodeData } from '../nodes/ConditionNode';
import { MediaNodeData } from '../nodes/MediaNode';
import { UserInputFlowNodeData } from '../nodes/UserInputFlowNode';
import { QuestionInputNodeData } from '../nodes/QuestionInputNode';
import { CTAButtonNodeData } from '../nodes/CTAButtonNode';
import { HttpApiNodeData } from '../nodes/HttpApiNode';
import { SequenceNodeData } from '../nodes/SequenceNode';
import { ExtendedFlowNode, ExtendedFlowNodeData } from './node-factories';

import { logger } from "@/lib/logger";
const NODE_WIDTH = 280;
const NODE_HEIGHT = 150;

/**
 * Apply auto-layout using dagre
 */
function getLayoutedElements(
  nodes: ChatbotFlowNode[],
  edges: ChatbotFlowEdge[],
  direction: 'TB' | 'LR' = 'LR'
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
 * Handles both legacy menu-based format and new React Flow format
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

    // Use keywords directly in data (backend format)
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
      position: savedPos || { x: 50, y: 100 + index * 200 },
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
      position: savedPos || { x: 400, y: 100 + index * 250 },
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
 * Also handles conversion to backend format
 */
export function flowToChatbot(
  nodes: ChatbotFlowNode[],
  edges: ChatbotFlowEdge[],
  existingChatbot: ChatbotAutomation
): Partial<ChatbotAutomation> {
  // Validate inputs - return existing chatbot if inputs are invalid
  if (!nodes || !Array.isArray(nodes)) {
    logger.warn('flowToChatbot: nodes is not a valid array');
    return existingChatbot;
  }
  if (!edges || !Array.isArray(edges)) {
    logger.warn('flowToChatbot: edges is not a valid array');
    return existingChatbot;
  }

  const triggers: ChatbotTrigger[] = [];
  const menus: ChatbotMenu[] = [];

  // Convert nodes to backend format for storage in flowLayout
  const { nodes: backendNodes, edges: backendEdges } = flowNodesToBackend(
    nodes as ExtendedFlowNode[],
    edges
  );

  const flowLayout: FlowLayout = {
    nodes: nodes.map((n) => ({ id: n.id, position: n.position })),
    rawNodes: backendNodes,
    rawEdges: backendEdges,
  };

  // Extract triggers from start nodes
  nodes.forEach((node) => {
    if (node.data.type === 'start') {
      const startData = node.data as StartNodeData;
      const outgoingEdge = edges.find((e) => e.source === node.id);

      // Get target menu ID from edge
      let menuId = startData.trigger?.menuId || '';
      if (outgoingEdge) {
        const targetId = outgoingEdge.target;
        if (targetId.startsWith('question-')) {
          menuId = targetId.replace('question-', '');
        }
      }

      // Extract keywords - support both trigger.keywords and data.keywords
      const keywords = startData.trigger?.keywords ||
        (startData as unknown as { keywords?: string[] }).keywords ||
        [];

      triggers.push({
        id: startData.trigger?.id || node.id.replace('start-', ''),
        type: startData.trigger?.type || 'keyword',
        keywords,
        caseSensitive: startData.trigger?.caseSensitive || false,
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
            if (actionNode && actionNode.data && actionNode.data.type === 'action') {
              const actionData = actionNode.data as ActionNodeData;
              // Only update if actionType is valid
              if (actionData.actionType) {
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
 * Convert frontend React Flow nodes to backend format
 * This function converts the extended node types to the backend API format
 */
export function flowNodesToBackend(
  nodes: ExtendedFlowNode[],
  edges: ChatbotFlowEdge[]
): { nodes: BackendFlowNode[]; edges: BackendFlowEdge[] } {
  const backendNodes: BackendFlowNode[] = nodes.map((node) => {
    const data: Record<string, unknown> = { ...node.data };

    // Convert start node trigger to keywords format for backend
    if (node.type === 'start' && node.data.type === 'start') {
      const startData = node.data as StartNodeData;
      // Backend expects keywords at data.keywords, not data.trigger.keywords
      data.keywords = startData.trigger?.keywords || [];
      data.caseSensitive = startData.trigger?.caseSensitive || false;
      // Include tag for auto-tagging contacts
      if (startData.tagSlug) {
        data.tagSlug = startData.tagSlug;
        data.tagName = startData.tagName;
      }
      // Keep trigger for backward compatibility but primary is keywords
    }

    // Convert question node - backend expects data directly
    if (node.type === 'question' && node.data.type === 'question') {
      const questionData = node.data as QuestionNodeData;
      // Backend can use the menu structure directly
      // Map to backend expected format
      data.body = questionData.menu?.body || '';
      data.footer = questionData.menu?.footer || '';
      data.options = questionData.menu?.options?.map(opt => ({
        id: opt.id,
        title: opt.title,
        description: opt.description,
      })) || [];

      // Preserve the actual messageType - map frontend values to backend values
      const messageType = questionData.menu?.messageType || 'interactive_buttons';
      if (messageType === 'text') {
        data.type = 'text';
      } else if (messageType === 'interactive_list') {
        data.type = 'list';
        // Pass list button text to backend
        if (questionData.menu?.buttonText) {
          data.buttonText = questionData.menu.buttonText;
        }
      } else {
        data.type = 'buttons';
      }

      // Preserve header with type info for media headers
      if (questionData.menu?.header) {
        data.header = {
          type: questionData.menu.header.type,
          content: questionData.menu.header.content,
        };
      }

      data.saveAnswerTo = (questionData as unknown as { saveAnswerTo?: string }).saveAnswerTo;

      // Add delay if configured
      if (questionData.delaySeconds && questionData.delaySeconds > 0) {
        data.delaySeconds = questionData.delaySeconds;
      }
    }

    // Convert text node
    if (node.type === 'text' && node.data.type === 'text') {
      const textData = node.data as TextNodeData;
      data.text = textData.message || '';
      data.delaySeconds = textData.delaySeconds || 0;
      logger.debug('Converting text node to backend:', { text: data.text, delaySeconds: data.delaySeconds });
    }

    // Convert media node
    if (node.type === 'media' && node.data.type === 'media') {
      const mediaData = node.data as MediaNodeData;
      data.mediaType = mediaData.mediaType;
      data.mediaId = mediaData.mediaId || '';
      data.caption = mediaData.caption || '';
      data.filename = mediaData.fileName;
    }

    // Convert condition node
    if (node.type === 'condition' && node.data.type === 'condition') {
      const conditionData = node.data as ConditionNodeData;
      data.rules = conditionData.rules?.map(rule => ({
        field: rule.field,
        operator: rule.operator,
        value: rule.value,
      })) || [];
    }

    // Convert action node
    if (node.type === 'action' && node.data.type === 'action') {
      const actionData = node.data as ActionNodeData;
      data.actionType = actionData.actionType;
      data.message = actionData.message;
      data.assistantId = actionData.assistantId;
    }

    // Convert question_input node
    if (node.type === 'question_input' && node.data.type === 'question_input') {
      const qiData = node.data as QuestionInputNodeData;
      data.question = qiData.question;
      data.variableName = qiData.variableName;
      data.inputType = qiData.inputType;
      data.required = qiData.required;
      data.options = qiData.options;
    }

    // Convert user_input_flow node
    if (node.type === 'user_input_flow' && node.data.type === 'user_input_flow') {
      const uifData = node.data as UserInputFlowNodeData;
      data.flowName = uifData.flowName;
      data.description = uifData.description;
      if (uifData.webhook) {
        data.webhook = uifData.webhook;
      }
    }

    // Convert cta_button node
    if (node.type === 'cta_button' && node.data.type === 'cta_button') {
      const ctaData = node.data as CTAButtonNodeData;
      data.body = ctaData.body;
      data.buttonText = ctaData.buttonText;
      data.url = ctaData.url;
      data.header = ctaData.header;
      data.footer = ctaData.footer;
    }

    // Convert http_api node
    if (node.type === 'http_api' && node.data.type === 'http_api') {
      const httpData = node.data as HttpApiNodeData;
      data.method = httpData.method;
      data.url = httpData.url;
      data.headers = httpData.headers;
      data.body = httpData.body;
      data.bodyType = httpData.bodyType;
      data.responseVariable = httpData.responseVariable;
      data.timeout = httpData.timeout;
      data.auth = httpData.auth;
    }

    // Convert sequence node
    if (node.type === 'sequence' && node.data.type === 'sequence') {
      const seqData = node.data as SequenceNodeData;
      data.steps = seqData.steps?.map(step => ({
        id: step.id,
        delay: step.delay,
        delaySeconds: step.delaySeconds,
        messageType: step.messageType,
        textMessage: step.textMessage,
        templateName: step.templateName,
        templateId: step.templateId,
        templateLanguage: step.templateLanguage,
        templateComponents: step.templateComponents,
      })) || [];
    }

    return {
      id: node.id,
      type: node.type,
      position: node.position,
      data,
    };
  });

  // Edges can be used directly (same format)
  const backendEdges: BackendFlowEdge[] = edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle,
    targetHandle: edge.targetHandle,
    label: edge.label,
    animated: edge.animated,
  }));

  return { nodes: backendNodes, edges: backendEdges };
}

/**
 * Convert backend nodes to frontend React Flow format
 */
export function backendNodesToFlow(
  backendNodes: BackendFlowNode[],
  backendEdges: BackendFlowEdge[]
): { nodes: ExtendedFlowNode[]; edges: ChatbotFlowEdge[] } {
  const nodes: ExtendedFlowNode[] = backendNodes.map((node) => {
    let data: ExtendedFlowNodeData;
    const backendData = node.data;

    switch (node.type) {
      case 'start': {
        // Convert backend keywords format to frontend trigger format
        const keywords = (backendData.keywords as string[]) || [];
        data = {
          type: 'start',
          label: `Keywords: ${keywords.join(', ') || 'None'}`,
          trigger: {
            id: node.id.replace('start-', ''),
            type: 'keyword',
            keywords,
            caseSensitive: (backendData.caseSensitive as boolean) || false,
            menuId: '',
          },
          // Load tag for auto-tagging contacts
          tagSlug: backendData.tagSlug as string | undefined,
          tagName: backendData.tagName as string | undefined,
        } as StartNodeData;
        break;
      }
      case 'text': {
        logger.debug('Converting text node from backend:', { data: backendData });
        data = {
          type: 'text',
          label: 'Text Message',
          message: (backendData.text as string) || (backendData.message as string) || '',
          delaySeconds: (backendData.delaySeconds as number) || 0,
        } as TextNodeData;
        logger.debug('Converted text node data:', { data: data });
        break;
      }
      case 'question': {
        // Convert backend format to menu format
        // Map backend type to frontend messageType
        let messageType: 'text' | 'interactive_buttons' | 'interactive_list' = 'interactive_buttons';
        const backendType = backendData.type as string;
        if (backendType === 'text') {
          messageType = 'text';
        } else if (backendType === 'list') {
          messageType = 'interactive_list';
        } else {
          messageType = 'interactive_buttons';
        }

        // Handle header - can be string (old format) or object with type/content (new format)
        let header: { type: 'text' | 'image' | 'video' | 'document'; content: string } | undefined;
        if (backendData.header) {
          if (typeof backendData.header === 'string') {
            // Old format - just a string
            header = { type: 'text', content: backendData.header };
          } else if (typeof backendData.header === 'object') {
            // New format - object with type and content
            const headerObj = backendData.header as { type?: string; content?: string };
            header = {
              type: (headerObj.type as 'text' | 'image' | 'video' | 'document') || 'text',
              content: headerObj.content || '',
            };
          }
        }

        data = {
          type: 'question',
          label: (backendData.label as string) || 'Interactive Message',
          menu: {
            id: node.id.replace('question-', '') || generateId(),
            name: (backendData.label as string) || 'Interactive Message',
            messageType,
            body: (backendData.body as string) || '',
            header,
            footer: backendData.footer as string,
            buttonText: (backendData.buttonText as string) || undefined,
            options: ((backendData.options as Array<{ id: string; title: string; description?: string }>) || []).map(opt => ({
              id: opt.id,
              title: opt.title,
              description: opt.description,
              action: { type: 'end' as const },
            })),
          },
          delaySeconds: (backendData.delaySeconds as number) || 0,
        } as QuestionNodeData;
        break;
      }
      case 'media': {
        data = {
          type: 'media',
          label: (backendData.mediaType as string) || 'Media',
          mediaType: (backendData.mediaType as 'image' | 'video' | 'document' | 'audio') || 'image',
          mediaId: backendData.mediaId as string,
          caption: backendData.caption as string,
          fileName: backendData.filename as string,
        } as MediaNodeData;
        break;
      }
      case 'condition': {
        data = {
          type: 'condition',
          label: 'Condition',
          matchType: 'all',
          rules: ((backendData.rules as Array<{ field: string; operator: string; value: string }>) || []).map(r => ({
            field: r.field,
            operator: r.operator as 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'starts_with' | 'ends_with' | 'is_empty' | 'is_not_empty',
            value: r.value,
          })),
        } as ConditionNodeData;
        break;
      }
      case 'action': {
        data = {
          type: 'action',
          label: getActionLabel((backendData.actionType as string) || 'end'),
          actionType: (backendData.actionType as ActionNodeData['actionType']) || 'end',
          message: backendData.message as string,
          assistantId: backendData.assistantId as string,
        } as ActionNodeData;
        break;
      }
      case 'question_input': {
        data = {
          type: 'question_input',
          label: 'Question',
          question: (backendData.question as string) || '',
          variableName: (backendData.variableName as string) || `answer_${Date.now().toString(36)}`,
          inputType: (backendData.inputType as QuestionInputNodeData['inputType']) || 'free_text',
          required: (backendData.required as boolean) ?? true,
          options: backendData.options as string[],
        } as QuestionInputNodeData;
        break;
      }
      case 'user_input_flow': {
        data = {
          type: 'user_input_flow',
          label: 'User Input Flow',
          flowName: (backendData.flowName as string) || '',
          description: (backendData.description as string) || '',
          webhook: backendData.webhook as UserInputFlowNodeData['webhook'],
        } as UserInputFlowNodeData;
        break;
      }
      case 'cta_button': {
        data = {
          type: 'cta_button',
          label: 'CTA Button',
          body: (backendData.body as string) || '',
          buttonText: (backendData.buttonText as string) || '',
          url: (backendData.url as string) || '',
          header: backendData.header as string,
          footer: backendData.footer as string,
        } as CTAButtonNodeData;
        break;
      }
      case 'http_api': {
        data = {
          type: 'http_api',
          label: 'HTTP API',
          method: (backendData.method as HttpApiNodeData['method']) || 'GET',
          url: (backendData.url as string) || '',
          headers: (backendData.headers as HttpApiNodeData['headers']) || [],
          body: (backendData.body as string) || '',
          bodyType: (backendData.bodyType as HttpApiNodeData['bodyType']) || 'json',
          responseVariable: (backendData.responseVariable as string) || '',
          timeout: (backendData.timeout as number) || 30,
          auth: (backendData.auth as HttpApiNodeData['auth']) || { type: 'none' },
        } as HttpApiNodeData;
        break;
      }
      case 'sequence': {
        const steps = (backendData.steps as Array<{
          id: string;
          delay: string;
          delaySeconds: number;
          messageType: 'text' | 'template';
          textMessage?: string;
          templateName?: string;
          templateId?: string;
          templateLanguage?: string;
          templateComponents?: Record<string, unknown>[];
        }>) || [];
        data = {
          type: 'sequence',
          label: 'Sequence',
          steps: steps.map(s => ({
            id: s.id,
            delay: s.delay,
            delaySeconds: s.delaySeconds,
            messageType: s.messageType,
            textMessage: s.textMessage,
            templateName: s.templateName,
            templateId: s.templateId,
            templateLanguage: s.templateLanguage,
            templateComponents: s.templateComponents,
          })),
        } as SequenceNodeData;
        break;
      }
      default: {
        // Fallback for unknown types
        data = {
          type: node.type as 'start',
          label: (backendData.label as string) || node.type,
          trigger: {
            id: generateId(),
            type: 'keyword',
            keywords: [],
            caseSensitive: false,
            menuId: '',
          },
        } as StartNodeData;
      }
    }

    return {
      id: node.id,
      type: node.type as ExtendedFlowNode['type'],
      position: node.position,
      data,
    };
  });

  const edges: ChatbotFlowEdge[] = backendEdges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle,
    targetHandle: edge.targetHandle,
    label: edge.label,
    animated: edge.animated,
  }));

  return { nodes, edges };
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

/**
 * Extract trigger keywords from flow nodes (for backend)
 */
export function extractTriggerKeywords(nodes: ExtendedFlowNode[]): string[] {
  const keywords: string[] = [];

  nodes.forEach((node) => {
    if (node.type === 'start' && node.data.type === 'start') {
      const startData = node.data as StartNodeData;
      const nodeKeywords = startData.trigger?.keywords ||
        (startData as unknown as { keywords?: string[] }).keywords ||
        [];
      keywords.push(...nodeKeywords);
    }
  });

  return Array.from(new Set(keywords)); // Remove duplicates
}
