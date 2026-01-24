import {
  ChatbotFlowNode,
  StartNodeData,
  QuestionNodeData,
  ActionNodeData,
  ChatbotTrigger,
  ChatbotMenu,
  NodePosition,
  generateId,
  createDefaultMenu,
} from '@/types/chatbot-automation';
import { TextNodeData } from '../nodes/TextNode';
import { ConditionNodeData, ConditionRule } from '../nodes/ConditionNode';
import { MediaNodeData, MediaType } from '../nodes/MediaNode';
import { UserInputFlowNodeData } from '../nodes/UserInputFlowNode';
import { QuestionInputNodeData } from '../nodes/QuestionInputNode';

// Extended node data type
export type ExtendedFlowNodeData =
  | StartNodeData
  | QuestionNodeData
  | ActionNodeData
  | TextNodeData
  | ConditionNodeData
  | MediaNodeData
  | UserInputFlowNodeData
  | QuestionInputNodeData;

export interface ExtendedFlowNode {
  id: string;
  type: 'start' | 'question' | 'action' | 'text' | 'condition' | 'media' | 'user_input_flow' | 'question_input';
  position: NodePosition;
  data: ExtendedFlowNodeData;
}

/**
 * Create a new Start node with default trigger
 */
export function createStartNode(position: NodePosition): ExtendedFlowNode {
  const triggerId = generateId();
  const trigger: ChatbotTrigger = {
    id: triggerId,
    type: 'keyword',
    keywords: [],
    caseSensitive: false,
    menuId: '',
  };

  const data: StartNodeData = {
    type: 'start',
    label: 'Keywords: None',
    trigger,
  };

  return {
    id: `start-${triggerId}`,
    type: 'start',
    position,
    data,
  };
}

/**
 * Create a new Question node with default menu
 */
export function createQuestionNode(
  position: NodePosition,
  menuName?: string
): ExtendedFlowNode {
  const menuId = generateId();
  const menu: ChatbotMenu = createDefaultMenu(menuId, menuName || 'Interactive Message');

  const data: QuestionNodeData = {
    type: 'question',
    label: 'Interactive Message',
    menu,
  };

  return {
    id: `question-${menuId}`,
    type: 'question',
    position,
    data,
  };
}

/**
 * Create a new Text node
 */
export function createTextNode(
  position: NodePosition,
  message?: string
): ExtendedFlowNode {
  const nodeId = generateId();

  const data: TextNodeData = {
    type: 'text',
    label: 'Text Message',
    message: message || '',
    delaySeconds: 0,
  };

  return {
    id: `text-${nodeId}`,
    type: 'text',
    position,
    data,
  };
}

/**
 * Create a new Condition node
 */
export function createConditionNode(position: NodePosition): ExtendedFlowNode {
  const nodeId = generateId();

  const data: ConditionNodeData = {
    type: 'condition',
    label: 'Condition',
    matchType: 'all',
    rules: [],
  };

  return {
    id: `condition-${nodeId}`,
    type: 'condition',
    position,
    data,
  };
}

/**
 * Create a new Action node
 */
export function createActionNode(
  position: NodePosition,
  actionType: ActionNodeData['actionType'],
  message?: string
): ExtendedFlowNode {
  const nodeId = generateId();

  const labels: Record<ActionNodeData['actionType'], string> = {
    send_message: 'Text',
    fallback_ai: 'Hand off to AI',
    end: 'End Conversation',
  };

  const data: ActionNodeData = {
    type: 'action',
    label: labels[actionType],
    actionType,
    message,
  };

  return {
    id: `action-${nodeId}`,
    type: 'action',
    position,
    data,
  };
}

/**
 * Create a new Media node
 */
export function createMediaNode(
  position: NodePosition,
  mediaType: MediaType
): ExtendedFlowNode {
  const nodeId = generateId();

  const labels: Record<MediaType, string> = {
    image: 'Image',
    video: 'Video',
    document: 'Document',
    audio: 'Audio',
  };

  const data: MediaNodeData = {
    type: 'media',
    label: labels[mediaType],
    mediaType,
  };

  return {
    id: `media-${nodeId}`,
    type: 'media',
    position,
    data,
  };
}

/**
 * Create a new User Input Flow node
 */
export function createUserInputFlowNode(position: NodePosition): ExtendedFlowNode {
  const nodeId = generateId();

  const data: UserInputFlowNodeData = {
    type: 'user_input_flow',
    label: 'User Input Flow',
    flowName: '',
    description: '',
  };

  return {
    id: `user_input_flow-${nodeId}`,
    type: 'user_input_flow',
    position,
    data,
  };
}

/**
 * Create a new Question Input node
 */
export function createQuestionInputNode(position: NodePosition): ExtendedFlowNode {
  const nodeId = generateId();

  const data: QuestionInputNodeData = {
    type: 'question_input',
    label: 'Question',
    question: '',
    variableName: `answer_${Date.now().toString(36)}`,
    inputType: 'free_text',
    required: true,
  };

  return {
    id: `question_input-${nodeId}`,
    type: 'question_input',
    position,
    data,
  };
}

/**
 * Create node from context menu action
 */
export function createNodeFromAction(
  action: string,
  position: NodePosition
): ExtendedFlowNode | null {
  switch (action) {
    case 'add-start':
      return createStartNode(position);
    case 'add-question':
      return createQuestionNode(position);
    case 'add-text':
      return createTextNode(position);
    case 'add-condition':
      return createConditionNode(position);
    case 'add-user-input-flow':
      return createUserInputFlowNode(position);
    case 'add-question-input':
      return createQuestionInputNode(position);
    case 'add-action-message':
      return createActionNode(position, 'send_message');
    case 'add-action-ai':
      return createActionNode(position, 'fallback_ai');
    case 'add-action-end':
      return createActionNode(position, 'end');
    case 'add-media-image':
      return createMediaNode(position, 'image');
    case 'add-media-video':
      return createMediaNode(position, 'video');
    case 'add-media-document':
      return createMediaNode(position, 'document');
    case 'add-media-audio':
      return createMediaNode(position, 'audio');
    default:
      return null;
  }
}

/**
 * Clone an existing node
 */
export function cloneNode(
  node: ExtendedFlowNode,
  offset: { x: number; y: number } = { x: 50, y: 50 }
): ExtendedFlowNode {
  const newId = generateId();
  const newPosition = {
    x: node.position.x + offset.x,
    y: node.position.y + offset.y,
  };

  // Deep clone the data
  const clonedData = JSON.parse(JSON.stringify(node.data));

  // Update IDs in the cloned data
  if (clonedData.type === 'start' && clonedData.trigger) {
    clonedData.trigger.id = newId;
  } else if (clonedData.type === 'question' && clonedData.menu) {
    clonedData.menu.id = newId;
    clonedData.menu.name = `${clonedData.menu.name} (Copy)`;
    // Update option IDs
    clonedData.menu.options = clonedData.menu.options.map((opt: any) => ({
      ...opt,
      id: generateId(),
    }));
  }

  return {
    id: `${node.type}-${newId}`,
    type: node.type,
    position: newPosition,
    data: clonedData,
  };
}

/**
 * Get toolbar items for dragging
 */
export function getToolbarItems() {
  return [
    {
      type: 'start',
      label: 'Trigger',
      description: 'Entry point with keyword triggers',
      color: 'bg-green-500',
    },
    {
      type: 'question',
      label: 'Menu',
      description: 'Interactive message with options',
      color: 'bg-blue-500',
    },
    {
      type: 'text',
      label: 'Text',
      description: 'Simple text message',
      color: 'bg-indigo-500',
    },
    {
      type: 'condition',
      label: 'Condition',
      description: 'Branch based on conditions',
      color: 'bg-yellow-500',
    },
    {
      type: 'action-message',
      actionType: 'send_message',
      label: 'Message',
      description: 'Send a response message',
      color: 'bg-purple-500',
    },
    {
      type: 'action-ai',
      actionType: 'fallback_ai',
      label: 'AI',
      description: 'Hand off to AI assistant',
      color: 'bg-orange-500',
    },
    {
      type: 'action-end',
      actionType: 'end',
      label: 'End',
      description: 'End the conversation',
      color: 'bg-red-500',
    },
  ];
}
