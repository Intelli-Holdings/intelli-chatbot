import { Node, Edge } from 'reactflow';
import {
  StartNodeData,
  QuestionNodeData,
  ActionNodeData,
} from '@/types/chatbot-automation';
import { TextNodeData } from '../nodes/TextNode';
import { ConditionNodeData } from '../nodes/ConditionNode';
import { MediaNodeData } from '../nodes/MediaNode';
import { QuestionInputNodeData } from '../nodes/QuestionInputNode';
import { UserInputFlowNodeData } from '../nodes/UserInputFlowNode';
import { SequenceNodeData } from '../nodes/SequenceNode';

// Message types in simulation
export type SimulationMessageType = 'bot' | 'user' | 'system';

export interface SimulationMessage {
  id: string;
  type: SimulationMessageType;
  content: string;
  timestamp: Date;
  nodeId?: string;
  // For interactive messages
  options?: Array<{
    id: string;
    title: string;
  }>;
  // For media messages
  mediaType?: 'image' | 'video' | 'document' | 'audio';
  // For question input
  inputType?: 'free_text' | 'multiple_choice';
  variableName?: string;
}

export interface SimulationState {
  isRunning: boolean;
  currentNodeId: string | null;
  messages: SimulationMessage[];
  variables: Record<string, string>;
  waitingForInput: boolean;
  pendingVariableName: string | null;
  visitedNodes: string[];
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

/**
 * Flow Simulator - handles the logic of traversing a flow
 */
export class FlowSimulator {
  private nodes: Node[];
  private edges: Edge[];
  private state: SimulationState;
  private onStateChange: (state: SimulationState) => void;

  constructor(
    nodes: Node[],
    edges: Edge[],
    onStateChange: (state: SimulationState) => void
  ) {
    this.nodes = nodes;
    this.edges = edges;
    this.state = { ...initialState };
    this.onStateChange = onStateChange;
  }

  /**
   * Get current state
   */
  getState(): SimulationState {
    return this.state;
  }

  /**
   * Update state and notify listeners
   */
  private updateState(updates: Partial<SimulationState>) {
    this.state = { ...this.state, ...updates };
    this.onStateChange(this.state);
  }

  /**
   * Add a message to the conversation
   */
  private addMessage(message: Omit<SimulationMessage, 'id' | 'timestamp'>) {
    const newMessage: SimulationMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };
    this.updateState({
      messages: [...this.state.messages, newMessage],
    });
  }

  /**
   * Start simulation with a keyword
   */
  start(keyword: string) {
    // Reset state
    this.state = { ...initialState, isRunning: true };

    // Add user message
    this.addMessage({
      type: 'user',
      content: keyword,
    });

    // Find matching start node
    const startNode = this.findMatchingStartNode(keyword);

    if (!startNode) {
      this.addMessage({
        type: 'system',
        content: `No trigger found for "${keyword}". Try a different keyword.`,
      });
      this.updateState({ waitingForInput: true });
      return;
    }

    // Process the start node
    this.processNode(startNode.id);
  }

  /**
   * Find a start node that matches the keyword
   */
  private findMatchingStartNode(keyword: string): Node | null {
    const startNodes = this.nodes.filter((n) => n.type === 'start');

    for (const node of startNodes) {
      const data = node.data as StartNodeData;
      if (!data.trigger?.keywords) continue;

      const matches = data.trigger.keywords.some((kw) => {
        if (data.trigger.caseSensitive) {
          return keyword === kw;
        }
        return keyword.toLowerCase().includes(kw.toLowerCase());
      });

      if (matches) {
        return node;
      }
    }

    return null;
  }

  /**
   * Process a node and move to next
   */
  private async processNode(nodeId: string) {
    const node = this.nodes.find((n) => n.id === nodeId);
    if (!node) return;

    this.updateState({
      currentNodeId: nodeId,
      visitedNodes: [...this.state.visitedNodes, nodeId],
    });

    // Small delay for visual effect
    await this.delay(300);

    switch (node.type) {
      case 'start':
        await this.handleStartNode(node);
        break;
      case 'question':
        await this.handleQuestionNode(node);
        break;
      case 'text':
        await this.handleTextNode(node);
        break;
      case 'action':
        await this.handleActionNode(node);
        break;
      case 'condition':
        await this.handleConditionNode(node);
        break;
      case 'media':
        await this.handleMediaNode(node);
        break;
      case 'question_input':
        await this.handleQuestionInputNode(node);
        break;
      case 'user_input_flow':
        await this.handleUserInputFlowNode(node);
        break;
      case 'sequence':
        await this.handleSequenceNode(node);
        break;
    }
  }

  /**
   * Handle start node - move to connected node
   */
  private async handleStartNode(node: Node) {
    const nextNodeId = this.getNextNodeId(node.id);
    if (nextNodeId) {
      await this.processNode(nextNodeId);
    } else {
      this.addMessage({
        type: 'system',
        content: 'Flow ends here (no connected node).',
      });
      this.endSimulation();
    }
  }

  /**
   * Handle question node - show message and options
   */
  private async handleQuestionNode(node: Node) {
    const data = node.data as QuestionNodeData;
    const { menu } = data;

    // Show the body message
    this.addMessage({
      type: 'bot',
      content: menu.body,
      nodeId: node.id,
      options: menu.options?.length > 0 ? menu.options.map((opt) => ({
        id: opt.id,
        title: opt.title,
      })) : undefined,
    });

    // If there are options, wait for user to select one
    // If no options, continue to next node (using default edge)
    if (menu.options && menu.options.length > 0) {
      this.updateState({ waitingForInput: true });
    } else {
      // No options - continue to next node
      const nextNodeId = this.getNextNodeId(node.id);
      if (nextNodeId) {
        await this.processNode(nextNodeId);
      } else {
        this.endSimulation();
      }
    }
  }

  /**
   * Handle text node - show message and move to next
   */
  private async handleTextNode(node: Node) {
    const data = node.data as TextNodeData;

    if (data.message) {
      this.addMessage({
        type: 'bot',
        content: data.message,
        nodeId: node.id,
      });
    }

    // Add delay if specified
    if (data.delaySeconds && data.delaySeconds > 0) {
      await this.delay(data.delaySeconds * 1000);
    }

    // Move to next node
    const nextNodeId = this.getNextNodeId(node.id);
    if (nextNodeId) {
      await this.processNode(nextNodeId);
    } else {
      this.endSimulation();
    }
  }

  /**
   * Handle action node
   */
  private async handleActionNode(node: Node) {
    const data = node.data as ActionNodeData;

    switch (data.actionType) {
      case 'send_message':
        if (data.message) {
          this.addMessage({
            type: 'bot',
            content: data.message,
            nodeId: node.id,
          });
        }
        break;

      case 'fallback_ai':
        this.addMessage({
          type: 'system',
          content: '🤖 Conversation handed off to AI Assistant',
          nodeId: node.id,
        });
        break;

      case 'end':
        this.addMessage({
          type: 'system',
          content: '✓ Conversation ended',
          nodeId: node.id,
        });
        break;
    }

    this.endSimulation();
  }

  /**
   * Handle condition node - evaluate rules and branch
   */
  private async handleConditionNode(node: Node) {
    const data = node.data as ConditionNodeData;
    const { matchType, rules } = data;

    // Evaluate rules
    const results = rules.map((rule) => this.evaluateRule(rule));
    const passes = matchType === 'all'
      ? results.every(Boolean)
      : results.some(Boolean);

    this.addMessage({
      type: 'system',
      content: `Condition evaluated: ${passes ? 'True' : 'False'}`,
      nodeId: node.id,
    });

    // Get the appropriate branch
    const handleId = passes ? 'true' : 'false';
    const edge = this.edges.find(
      (e) => e.source === node.id && e.sourceHandle === handleId
    );

    if (edge) {
      await this.processNode(edge.target);
    } else {
      this.addMessage({
        type: 'system',
        content: `No path connected for ${passes ? 'True' : 'False'} branch.`,
      });
      this.endSimulation();
    }
  }

  /**
   * Evaluate a single condition rule
   */
  private evaluateRule(rule: ConditionNodeData['rules'][0]): boolean {
    const fieldValue = this.state.variables[rule.field] || '';
    const compareValue = rule.value || '';

    switch (rule.operator) {
      case 'equals':
        return fieldValue === compareValue;
      case 'not_equals':
        return fieldValue !== compareValue;
      case 'contains':
        return fieldValue.includes(compareValue);
      case 'not_contains':
        return !fieldValue.includes(compareValue);
      case 'exists':
        return fieldValue !== '';
      case 'not_exists':
        return fieldValue === '';
      default:
        return false;
    }
  }

  /**
   * Handle media node - show media placeholder
   */
  private async handleMediaNode(node: Node) {
    const data = node.data as MediaNodeData;

    this.addMessage({
      type: 'bot',
      content: data.caption || `[${data.mediaType.toUpperCase()}]`,
      nodeId: node.id,
      mediaType: data.mediaType,
    });

    // Move to next node
    const nextNodeId = this.getNextNodeId(node.id);
    if (nextNodeId) {
      await this.processNode(nextNodeId);
    } else {
      this.endSimulation();
    }
  }

  /**
   * Handle question input node - ask question and wait for input
   */
  private async handleQuestionInputNode(node: Node) {
    const data = node.data as QuestionInputNodeData;

    this.addMessage({
      type: 'bot',
      content: data.question,
      nodeId: node.id,
      inputType: data.inputType,
      options: data.inputType === 'multiple_choice' && data.options
        ? data.options.map((opt, i) => ({ id: String(i), title: opt }))
        : undefined,
      variableName: data.variableName,
    });

    this.updateState({
      waitingForInput: true,
      pendingVariableName: data.variableName,
    });
  }

  /**
   * Handle user input flow node
   */
  private async handleUserInputFlowNode(node: Node) {
    const data = node.data as UserInputFlowNodeData;

    this.addMessage({
      type: 'system',
      content: `Starting input flow: ${data.flowName || 'Untitled'}`,
      nodeId: node.id,
    });

    // Move to first connected node (usually question_input)
    const nextNodeId = this.getNextNodeId(node.id, 'first-question');
    if (nextNodeId) {
      await this.processNode(nextNodeId);
    } else {
      this.endSimulation();
    }
  }

  /**
   * Handle sequence node - show scheduled steps and continue
   */
  private async handleSequenceNode(node: Node) {
    const data = node.data as SequenceNodeData;
    const stepCount = data.steps?.length || 0;

    this.addMessage({
      type: 'system',
      content: stepCount > 0
        ? `⏱ Sequence: ${stepCount} follow-up message${stepCount !== 1 ? 's' : ''} scheduled`
        : '⏱ Sequence: No steps configured',
      nodeId: node.id,
    });

    // Move to next node
    const nextNodeId = this.getNextNodeId(node.id);
    if (nextNodeId) {
      await this.processNode(nextNodeId);
    } else {
      this.endSimulation();
    }
  }

  /**
   * Handle user input (text or option selection)
   */
  async handleUserInput(input: string, optionId?: string) {
    if (!this.state.waitingForInput) return;

    // Add user message
    this.addMessage({
      type: 'user',
      content: input,
    });

    this.updateState({ waitingForInput: false });

    // If there's a pending variable, save the input
    if (this.state.pendingVariableName) {
      this.updateState({
        variables: {
          ...this.state.variables,
          [this.state.pendingVariableName]: input,
        },
        pendingVariableName: null,
      });

      // Move to next node from question_input
      const currentNode = this.nodes.find((n) => n.id === this.state.currentNodeId);
      if (currentNode?.type === 'question_input') {
        const nextNodeId = this.getNextNodeId(currentNode.id, 'next');
        if (nextNodeId) {
          await this.processNode(nextNodeId);
        } else {
          this.endSimulation();
        }
        return;
      }
    }

    // Handle question node option selection
    const currentNode = this.nodes.find((n) => n.id === this.state.currentNodeId);
    if (currentNode?.type === 'question') {
      const handleId = optionId ? `option-${optionId}` : undefined;
      const nextNodeId = handleId
        ? this.getNextNodeIdByHandle(currentNode.id, handleId)
        : this.getNextNodeId(currentNode.id);

      if (nextNodeId) {
        await this.processNode(nextNodeId);
      } else {
        this.addMessage({
          type: 'system',
          content: 'This option has no connected node.',
        });
        this.updateState({ waitingForInput: true });
      }
    }
  }

  /**
   * Get next node ID from current node
   */
  private getNextNodeId(nodeId: string, handleId?: string): string | null {
    const edge = this.edges.find((e) =>
      e.source === nodeId &&
      (handleId ? e.sourceHandle === handleId : true)
    );
    return edge?.target || null;
  }

  /**
   * Get next node ID by specific handle
   */
  private getNextNodeIdByHandle(nodeId: string, handleId: string): string | null {
    const edge = this.edges.find(
      (e) => e.source === nodeId && e.sourceHandle === handleId
    );
    return edge?.target || null;
  }

  /**
   * End the simulation
   */
  private endSimulation() {
    this.updateState({
      isRunning: false,
      waitingForInput: false,
      currentNodeId: null,
    });
  }

  /**
   * Reset the simulation
   */
  reset() {
    this.state = { ...initialState };
    this.onStateChange(this.state);
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Get available trigger keywords from start nodes
 */
export function getAvailableTriggers(nodes: Node[]): string[] {
  const triggers: string[] = [];

  nodes
    .filter((n) => n.type === 'start')
    .forEach((node) => {
      const data = node.data as StartNodeData;
      if (data.trigger?.keywords) {
        triggers.push(...data.trigger.keywords);
      }
    });

  return triggers;
}
