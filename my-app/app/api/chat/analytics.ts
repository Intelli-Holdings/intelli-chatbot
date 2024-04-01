import { OpenAIClient, AzureKeyCredential } from '@azure/openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import mongoose from 'mongoose';
import AnalyticsModel from '@/models/analytics.model';

export const runtime = 'edge';

// Create an OpenAI API client (that's edge friendly!)
const client = new OpenAIClient(
  'https://sqweya-subdomain.openai.azure.com/',
  new AzureKeyCredential(process.env.AZURE_OPENAI_API_KEY!),
);

export async function POST(req: Request) {
  const { analyticsData } = await req.json();

// Connect to the MongoDB database
const mongodbUri = process.env.MONGODB_URI as string;

if (mongodbUri === undefined) {
  throw new Error('MONGODB_URI environment variable is not defined');
}

await mongoose.connect(mongodbUri);


  // Save analytics data to MongoDB
const result = await AnalyticsModel.create({
    data: analyticsData,
  });

  // Close MongoDB connection
await mongoose.disconnect();

  // Return success response
return new Response('Analytics data saved', { status: 201 });
}

export async function GET(req: Request) {
  // Implement GET method if needed
}
