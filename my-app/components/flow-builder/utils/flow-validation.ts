import { Node, Edge } from 'reactflow';
import {
  StartNodeData,
  QuestionNodeData,
  ActionNodeData,
  CUSTOM_FIELD_PREFIX,
} from '@/types/chatbot-automation';
import { TextNodeData } from '../nodes/TextNode';
import { ConditionNodeData } from '../nodes/ConditionNode';
import { MediaNodeData } from '../nodes/MediaNode';
import { UserInputFlowNodeData } from '../nodes/UserInputFlowNode';
import { QuestionInputNodeData } from '../nodes/QuestionInputNode';
import { CTAButtonNodeData } from '../nodes/CTAButtonNode';

// Validation error severity
export type ValidationSeverity = 'error' | 'warning';

// Validation error interface
export interface ValidationError {
  nodeId: string;
  nodeType: string;
  field?: string;
  message: string;
  severity: ValidationSeverity;
}

// Validation result
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

/**
 * Validate the entire flow
 */
export function validateFlow(nodes: Node[], edges: Edge[]): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!nodes || nodes.length === 0) {
    errors.push({
      nodeId: '',
      nodeType: '',
      message: 'Flow is empty. Add at least one trigger node to start.',
      severity: 'error',
    });
    return { isValid: false, errors, warnings };
  }

  // Check for at least one start node
  const startNodes = nodes.filter((n) => n.type === 'start');
  if (startNodes.length === 0) {
    errors.push({
      nodeId: '',
      nodeType: '',
      message: 'Flow needs at least one Trigger node as an entry point.',
      severity: 'error',
    });
  }

  // Validate each node
  nodes.forEach((node) => {
    const nodeErrors = validateNode(node, nodes, edges);
    nodeErrors.forEach((err) => {
      if (err.severity === 'error') {
        errors.push(err);
      } else {
        warnings.push(err);
      }
    });
  });

  // Check for orphaned nodes (nodes not connected to any start node)
  const orphanedNodes = findOrphanedNodes(nodes, edges);
  orphanedNodes.forEach((nodeId) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (node && node.type !== 'start') {
      warnings.push({
        nodeId,
        nodeType: node.type || 'unknown',
        message: 'This node is not connected to the flow and will not be executed.',
        severity: 'warning',
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate a single node
 */
export function validateNode(node: Node, allNodes: Node[], edges: Edge[]): ValidationError[] {
  const errors: ValidationError[] = [];

  switch (node.type) {
    case 'start':
      errors.push(...validateStartNode(node, edges));
      break;
    case 'question':
      errors.push(...validateQuestionNode(node, edges));
      break;
    case 'text':
      errors.push(...validateTextNode(node));
      break;
    case 'action':
      errors.push(...validateActionNode(node));
      break;
    case 'condition':
      errors.push(...validateConditionNode(node, edges));
      break;
    case 'media':
      errors.push(...validateMediaNode(node));
      break;
    case 'user_input_flow':
      errors.push(...validateUserInputFlowNode(node));
      break;
    case 'question_input':
      errors.push(...validateQuestionInputNode(node));
      break;
    case 'cta_button':
      errors.push(...validateCTAButtonNode(node));
      break;
  }

  return errors;
}

/**
 * Validate start node
 */
function validateStartNode(node: Node, edges: Edge[]): ValidationError[] {
  const errors: ValidationError[] = [];
  const data = node.data as StartNodeData;

  // Check for keywords
  if (!data.trigger?.keywords || data.trigger.keywords.length === 0) {
    errors.push({
      nodeId: node.id,
      nodeType: 'start',
      field: 'keywords',
      message: 'Trigger node needs at least one keyword.',
      severity: 'error',
    });
  }

  // Check for outgoing connection
  const hasOutgoingEdge = edges.some((e) => e.source === node.id);
  if (!hasOutgoingEdge) {
    errors.push({
      nodeId: node.id,
      nodeType: 'start',
      message: 'Trigger node must be connected to another node.',
      severity: 'error',
    });
  }

  return errors;
}

/**
 * Validate question node
 */
function validateQuestionNode(node: Node, edges: Edge[]): ValidationError[] {
  const errors: ValidationError[] = [];
  const data = node.data as QuestionNodeData;

  // Check for body text
  if (!data.menu?.body || data.menu.body.trim() === '') {
    errors.push({
      nodeId: node.id,
      nodeType: 'question',
      field: 'body',
      message: 'Interactive message needs body text.',
      severity: 'error',
    });
  }

  // Check for options if interactive type
  if (data.menu?.messageType !== 'text') {
    if (!data.menu?.options || data.menu.options.length === 0) {
      errors.push({
        nodeId: node.id,
        nodeType: 'question',
        field: 'options',
        message: 'Interactive message needs at least one option.',
        severity: 'error',
      });
    } else {
      // Check each option has a title
      data.menu.options.forEach((option, index) => {
        if (!option.title || option.title.trim() === '') {
          errors.push({
            nodeId: node.id,
            nodeType: 'question',
            field: `options[${index}].title`,
            message: `Option ${index + 1} needs a title.`,
            severity: 'error',
          });
        }
      });

      // Check if options are connected (warning, not error)
      data.menu.options.forEach((option) => {
        const handleId = `option-${option.id}`;
        const hasConnection = edges.some(
          (e) => e.source === node.id && e.sourceHandle === handleId
        );
        if (!hasConnection) {
          errors.push({
            nodeId: node.id,
            nodeType: 'question',
            field: `option-${option.id}`,
            message: `Option "${option.title}" is not connected to any node.`,
            severity: 'warning',
          });
        }
      });
    }
  }

  return errors;
}

/**
 * Validate text node
 */
function validateTextNode(node: Node): ValidationError[] {
  const errors: ValidationError[] = [];
  const data = node.data as TextNodeData;

  if (!data.message || data.message.trim() === '') {
    errors.push({
      nodeId: node.id,
      nodeType: 'text',
      field: 'message',
      message: 'Text message node needs a message.',
      severity: 'error',
    });
  }

  return errors;
}

/**
 * Validate action node
 */
function validateActionNode(node: Node): ValidationError[] {
  const errors: ValidationError[] = [];
  const data = node.data as ActionNodeData;

  if (data.actionType === 'send_message') {
    if (!data.message || data.message.trim() === '') {
      errors.push({
        nodeId: node.id,
        nodeType: 'action',
        field: 'message',
        message: 'Send message action needs a message.',
        severity: 'error',
      });
    }
  }

  if (data.actionType === 'fallback_ai') {
    if (!data.assistantId) {
      errors.push({
        nodeId: node.id,
        nodeType: 'action',
        field: 'assistantId',
        message: 'AI handoff needs an assistant selected.',
        severity: 'warning',
      });
    }
  }

  return errors;
}

/**
 * Validate condition node
 */
function validateConditionNode(node: Node, edges: Edge[]): ValidationError[] {
  const errors: ValidationError[] = [];
  const data = node.data as ConditionNodeData;

  // Check for at least one rule
  if (!data.rules || data.rules.length === 0) {
    errors.push({
      nodeId: node.id,
      nodeType: 'condition',
      field: 'rules',
      message: 'Condition node needs at least one rule.',
      severity: 'error',
    });
  } else {
    // Check each rule
    data.rules.forEach((rule, index) => {
      // Check for incomplete custom field
      if (rule.field === CUSTOM_FIELD_PREFIX) {
        errors.push({
          nodeId: node.id,
          nodeType: 'condition',
          field: `rules[${index}].field`,
          message: `Rule ${index + 1} has incomplete custom field selection.`,
          severity: 'error',
        });
      }

      // Check for value when needed
      const needsValue = !['exists', 'not_exists'].includes(rule.operator);
      if (needsValue && (!rule.value || rule.value.trim() === '')) {
        errors.push({
          nodeId: node.id,
          nodeType: 'condition',
          field: `rules[${index}].value`,
          message: `Rule ${index + 1} needs a comparison value.`,
          severity: 'error',
        });
      }
    });
  }

  // Check for true/false connections
  const hasTrueConnection = edges.some(
    (e) => e.source === node.id && e.sourceHandle === 'true'
  );
  const hasFalseConnection = edges.some(
    (e) => e.source === node.id && e.sourceHandle === 'false'
  );

  if (!hasTrueConnection) {
    errors.push({
      nodeId: node.id,
      nodeType: 'condition',
      field: 'true-output',
      message: 'Condition node needs a "Yes" path connected.',
      severity: 'warning',
    });
  }

  if (!hasFalseConnection) {
    errors.push({
      nodeId: node.id,
      nodeType: 'condition',
      field: 'false-output',
      message: 'Condition node needs a "No" path connected.',
      severity: 'warning',
    });
  }

  return errors;
}

/**
 * Validate media node
 */
function validateMediaNode(node: Node): ValidationError[] {
  const errors: ValidationError[] = [];
  const data = node.data as MediaNodeData;

  if (!data.mediaId) {
    errors.push({
      nodeId: node.id,
      nodeType: 'media',
      field: 'mediaId',
      message: `${data.mediaType.charAt(0).toUpperCase() + data.mediaType.slice(1)} node needs a file uploaded.`,
      severity: 'error',
    });
  }

  return errors;
}

/**
 * Validate user input flow node
 */
function validateUserInputFlowNode(node: Node): ValidationError[] {
  const errors: ValidationError[] = [];
  const data = node.data as UserInputFlowNodeData;

  if (!data.flowName || data.flowName.trim() === '') {
    errors.push({
      nodeId: node.id,
      nodeType: 'user_input_flow',
      field: 'flowName',
      message: 'User input flow needs a name.',
      severity: 'warning',
    });
  }

  return errors;
}

/**
 * Validate question input node
 */
function validateQuestionInputNode(node: Node): ValidationError[] {
  const errors: ValidationError[] = [];
  const data = node.data as QuestionInputNodeData;

  if (!data.question || data.question.trim() === '') {
    errors.push({
      nodeId: node.id,
      nodeType: 'question_input',
      field: 'question',
      message: 'Question node needs a question text.',
      severity: 'error',
    });
  }

  // Check for incomplete custom field
  if (data.variableName === CUSTOM_FIELD_PREFIX) {
    errors.push({
      nodeId: node.id,
      nodeType: 'question_input',
      field: 'variableName',
      message: 'Question node has incomplete custom field selection.',
      severity: 'error',
    });
  }

  // Check multiple choice options
  if (data.inputType === 'multiple_choice') {
    if (!data.options || data.options.length === 0) {
      errors.push({
        nodeId: node.id,
        nodeType: 'question_input',
        field: 'options',
        message: 'Multiple choice question needs at least one option.',
        severity: 'error',
      });
    } else {
      const emptyOptions = data.options.filter((opt) => !opt || opt.trim() === '');
      if (emptyOptions.length > 0) {
        errors.push({
          nodeId: node.id,
          nodeType: 'question_input',
          field: 'options',
          message: 'All multiple choice options must have text.',
          severity: 'error',
        });
      }
    }
  }

  return errors;
}

/**
 * Validate CTA button node
 */
function validateCTAButtonNode(node: Node): ValidationError[] {
  const errors: ValidationError[] = [];
  const data = node.data as CTAButtonNodeData;

  if (!data.body || data.body.trim() === '') {
    errors.push({
      nodeId: node.id,
      nodeType: 'cta_button',
      field: 'body',
      message: 'CTA button needs a message body.',
      severity: 'error',
    });
  }

  if (!data.buttonText || data.buttonText.trim() === '') {
    errors.push({
      nodeId: node.id,
      nodeType: 'cta_button',
      field: 'buttonText',
      message: 'CTA button needs button text.',
      severity: 'error',
    });
  }

  if (!data.url || data.url.trim() === '') {
    errors.push({
      nodeId: node.id,
      nodeType: 'cta_button',
      field: 'url',
      message: 'CTA button needs a URL.',
      severity: 'error',
    });
  } else {
    // Basic URL validation
    try {
      new URL(data.url);
    } catch {
      errors.push({
        nodeId: node.id,
        nodeType: 'cta_button',
        field: 'url',
        message: 'CTA button URL is not valid.',
        severity: 'error',
      });
    }
  }

  return errors;
}

/**
 * Find nodes that are not reachable from any start node
 */
function findOrphanedNodes(nodes: Node[], edges: Edge[]): string[] {
  const startNodes = nodes.filter((n) => n.type === 'start');
  const reachableNodes = new Set<string>();

  // BFS from each start node
  startNodes.forEach((startNode) => {
    const queue = [startNode.id];
    reachableNodes.add(startNode.id);

    while (queue.length > 0) {
      const currentId = queue.shift()!;

      // Find all edges from current node
      const outgoingEdges = edges.filter((e) => e.source === currentId);

      outgoingEdges.forEach((edge) => {
        if (!reachableNodes.has(edge.target)) {
          reachableNodes.add(edge.target);
          queue.push(edge.target);
        }
      });
    }
  });

  // Return nodes that are not reachable
  return nodes
    .filter((n) => !reachableNodes.has(n.id))
    .map((n) => n.id);
}

/**
 * Get errors for a specific node
 */
export function getNodeErrors(
  nodeId: string,
  validationResult: ValidationResult
): ValidationError[] {
  return [
    ...validationResult.errors.filter((e) => e.nodeId === nodeId),
    ...validationResult.warnings.filter((e) => e.nodeId === nodeId),
  ];
}

/**
 * Check if a node has errors
 */
export function nodeHasErrors(
  nodeId: string,
  validationResult: ValidationResult
): boolean {
  return validationResult.errors.some((e) => e.nodeId === nodeId);
}

/**
 * Check if a node has warnings
 */
export function nodeHasWarnings(
  nodeId: string,
  validationResult: ValidationResult
): boolean {
  return validationResult.warnings.some((e) => e.nodeId === nodeId);
}

/**
 * Get human-readable node type label
 */
export function getNodeTypeLabel(nodeType: string): string {
  const labels: Record<string, string> = {
    start: 'Trigger',
    question: 'Interactive Message',
    text: 'Text Message',
    action: 'Action',
    condition: 'Condition',
    media: 'Media',
    user_input_flow: 'User Input Flow',
    question_input: 'Question',
    cta_button: 'CTA Button',
  };
  return labels[nodeType] || nodeType;
}
