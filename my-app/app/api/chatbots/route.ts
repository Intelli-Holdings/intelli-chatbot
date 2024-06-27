import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { name, description, websiteUrl, uploadedFiles, customText, organizationId } = req.body;

      // 1. Save chatbot information to database
      const chatbot = await prisma.chatbot.create({
        data: {
          name,
          description,
          websiteUrl,
          customText,
          organizationId,
        },
      });

      // 2. Create an OpenAI Assistant
      const assistant = await openai.beta.assistants.create({
        name: name,
        instructions: `You are a chatbot for ${name}. ${description}`,
        tools: [{ type: "retrieval" }],
        model: "gpt-4-1106-preview",
      });

      // 3. Generate a unique ID for embed code
      const uniqueId = 123; // Implement this function

      // 4. Store the assistant details in your database
      await prisma.chatbot.update({
        where: { id: chatbot.id },
        data: {
          assistantId: assistant.id,
          embedId: uniqueId,
        },
      });

      // 5. Generate embed code
      const embedCode = `<script src="https://widget.intelliconcierge.com/embed.min.js" chat-hash="${uniqueId}" defer></script>`;

      res.status(200).json({ success: true, chatbotId: chatbot.id, embedCode });
    } catch (error) {
      console.error('Error creating chatbot:', error);
      res.status(500).json({ success: false, error: 'Failed to create chatbot' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}