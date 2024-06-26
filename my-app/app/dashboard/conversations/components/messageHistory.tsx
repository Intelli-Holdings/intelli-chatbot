import MessageBubble from "./messageBubble";


const MessageHistory = () => {
  const messages = [
    { id: 1, sender: 'Client', message: 'Hi, there! I would like to ask about my order #1920543. Your agent mentioned that it would be available on September 18. However, I haven\'t been notified yet by your company about my product availability. Could you provide me some news regarding it?', timestamp: '11:00', isClient: true, isHumanSupport: false },
    { id: 2, sender: 'AI Assistant', message: 'Hi Alexander, we\'re sorry to hear that. Could you give us some time to check on your order first? We will update you as soon as possible. Thanks!', timestamp: '11:00', isClient: false, isHumanSupport: false },
    { id: 3, sender: 'AI Assistant', message: 'Hi Alexander, sorry to make you wait. We\'ve checked your issue ticket numbered #0999 and forwarded your query to the Production Department. We will keep you updated as soon as possible. Sorry for the inconvenience!', timestamp: '11:20', isClient: false, isHumanSupport: false },
    { id: 4, sender: 'Client', message: 'Hello, thanks for the speed and expedient action. I will keep in touch to find out how things go from here. Thanks', timestamp: '12:00', isClient: true, isHumanSupport: false },
  ];

  return (
    <div className="flex flex-col space-y-2 p-4 overflow-y-auto">
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          sender={message.sender}
          message={message.message}
          isClient={message.isClient}
          isHumanSupport={message.isHumanSupport}
        />
      ))}
    </div>
  );
}

export default MessageHistory;
