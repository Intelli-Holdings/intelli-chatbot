import mongoose, { Schema, Document } from 'mongoose';

export interface MessageModel extends Document {
  userId: string;
  message: string;
  aiResponse: string;
  date: Date;
}

const MessageSchema: Schema = new Schema({
  userId: { type: String, required: true },
  message: { type: String, required: true },
  aiResponse: { type: String, default: '' },
  date: { type: Date, default: Date.now },
});

export const Message = mongoose.model<MessageModel>('Message', MessageSchema);