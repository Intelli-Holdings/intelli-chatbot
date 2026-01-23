import StartNode from './StartNode';
import QuestionNode from './QuestionNode';
import ActionNode from './ActionNode';
import TextNode from './TextNode';
import ConditionNode from './ConditionNode';
import MediaNode from './MediaNode';

export const nodeTypes = {
  start: StartNode,
  question: QuestionNode,
  action: ActionNode,
  text: TextNode,
  condition: ConditionNode,
  media: MediaNode,
};

export { StartNode, QuestionNode, ActionNode, TextNode, ConditionNode, MediaNode };
