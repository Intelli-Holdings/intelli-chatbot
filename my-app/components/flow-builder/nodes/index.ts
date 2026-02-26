import StartNode from './StartNode';
import QuestionNode from './QuestionNode';
import ActionNode from './ActionNode';
import TextNode from './TextNode';
import ConditionNode from './ConditionNode';
import MediaNode from './MediaNode';
import UserInputFlowNode from './UserInputFlowNode';
import QuestionInputNode from './QuestionInputNode';
import CTAButtonNode from './CTAButtonNode';
import HttpApiNode from './HttpApiNode';
import SequenceNode from './SequenceNode';

export const nodeTypes = {
  start: StartNode,
  question: QuestionNode,
  action: ActionNode,
  text: TextNode,
  condition: ConditionNode,
  media: MediaNode,
  user_input_flow: UserInputFlowNode,
  question_input: QuestionInputNode,
  cta_button: CTAButtonNode,
  http_api: HttpApiNode,
  sequence: SequenceNode,
};

export { StartNode, QuestionNode, ActionNode, TextNode, ConditionNode, MediaNode, UserInputFlowNode, QuestionInputNode, CTAButtonNode, HttpApiNode, SequenceNode };
