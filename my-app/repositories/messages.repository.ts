import { Message, MessageModel } from '@/models/message.model';

export async function addMessage(userId: string, message: string, aiResponse: string): Promise<MessageModel> {
  const newMessage = new Message({ userId, message, aiResponse });
  return newMessage.save();
}

export async function getMessages(userId: string): Promise<MessageModel[]> {
  return Message.find({ userId }).sort({ createdAt: 1 }).exec();
}