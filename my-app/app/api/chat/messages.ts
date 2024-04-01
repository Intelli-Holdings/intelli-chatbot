import { NextApiRequest, NextApiResponse } from 'next';
import { addMessage, getMessages } from '@/repositories/messages.repository';

interface MessagePayload {
  userId: string;
  message: string;
  aiResponse: string;
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method === "POST") {
      const { userId, message, aiResponse } = req.body as MessagePayload;
      const newMessage = await addMessage(userId, message, aiResponse);
      res.status(201).json({ message: "Message saved", data: newMessage });
    } else if (req.method === "GET") {
      const userId = req.query.userId as string | undefined;
      if (userId) {
        const messages = await getMessages(userId);
        res.json(messages);
      } else {
        res.status(400).json({ message: "userId is required" });
      }
    } else {
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end();
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Internal server error" });
  }
}