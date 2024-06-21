// app/components/ConversationHeader.tsx
import {Button} from "@/components/ui/button";


interface ConversationHeaderProps {
    onTakeover: () => void;
  }
  
  const ConversationHeader: React.FC<ConversationHeaderProps> = ({ onTakeover }) => {
    return (
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Conversation #1</h3>
        <Button className="btn-secondary ghost" onClick={onTakeover}>Takeover conversation</Button>
      </div>
    );
  }
  
  export default ConversationHeader;
  