import { OpenAIClient, AzureKeyCredential } from '@azure/openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import mongoose from 'mongoose';
import AnalyticsModel from '@/models/analytics.model';

// Note: Edge runtime doesn't support persistent MongoDB connections
// Using Node.js runtime for proper connection pooling
export const runtime = 'nodejs';

// Create an OpenAI API client
const client = new OpenAIClient(
  'https://sqweya-subdomain.openai.azure.com/',
  new AzureKeyCredential(process.env.AZURE_OPENAI_API_KEY!),
);

// Ensure mongoose connection is ready (reuses existing connection)
async function ensureMongoConnection() {
  const mongodbUri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!mongodbUri) {
    throw new Error('MONGODB_URI or MONGO_URI environment variable is not defined');
  }

  // Check if already connected
  if (mongoose.connection.readyState === 1) {
    return;
  }

  // Check if connecting
  if (mongoose.connection.readyState === 2) {
    // Wait for connection to complete
    await new Promise((resolve) => {
      mongoose.connection.once('connected', resolve);
    });
    return;
  }

  // Create new connection with proper pooling
  await mongoose.connect(mongodbUri, {
    maxPoolSize: 10,  // Maximum number of connections in the pool
    minPoolSize: 2,   // Minimum number of connections to maintain
    socketTimeoutMS: 45000,
    serverSelectionTimeoutMS: 5000,
  } as mongoose.ConnectOptions);
}

export async function POST(req: Request) {
  try {
    const { analyticsData } = await req.json();

    // Ensure connection is ready (reuses existing connection pool)
    await ensureMongoConnection();

    // Save analytics data to MongoDB using pooled connection
    const result = await AnalyticsModel.create({
      data: analyticsData,
    });

    // DO NOT disconnect - this would close the shared connection pool
    // Mongoose will handle connection lifecycle automatically

    // Return success response
    return new Response(JSON.stringify({ success: true, id: result._id }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error saving analytics:', error);
    return new Response(JSON.stringify({ error: 'Failed to save analytics' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function GET(req: Request) {
  // Implement GET method if needed
}
