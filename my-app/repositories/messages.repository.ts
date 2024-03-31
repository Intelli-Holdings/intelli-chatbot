import {MessageModel} from '@/models/message.model';
import { Model } from 'mongoose';



  export async function addMessage(userId: string, message: string, aiResponse: string): Promise<Model<Message>> {
    const newMessage = new Model({ userId, message, aiResponse });
    return newMessage.save();
  }
  
  export async function getMessages(userId: string): Promise<Model<Message>[]> {
    return Model.find({ userId }).sort({ createdAt: 1 }).exec();
  }
  