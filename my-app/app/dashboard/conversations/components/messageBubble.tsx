// app/components/MessageBubble.tsx
interface MessageBubbleProps {
    sender: string;
    message: string;
    isClient: boolean;
    isHumanSupport: boolean;
  }
  
  const MessageBubble: React.FC<MessageBubbleProps> = ({ sender, message, isClient, isHumanSupport }) => {
    return (
      <div className={`flex ${isClient ? 'justify-start' : 'justify-end'} mb-2`}>
        <div
          className={`rounded-lg p-3 ${
            isClient
              ? 'bg-gray-200 text-left'
              : isHumanSupport
              ? 'bg-blue-500 text-white text-right'
              : 'bg-green-500 text-white text-right'
          } max-w-xs`}
        >
          <p className="text-sm">{message}</p>
        </div>
      </div>
    );
  }
  
  export default MessageBubble;
  