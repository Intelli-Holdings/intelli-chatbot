import { OpenAIClient, AzureKeyCredential } from '@azure/openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';

export const runtime = 'edge';

// Create an OpenAI API client (that's edge friendly!)
const client = new OpenAIClient(
  'https://intelliwebapp.openai.azure.com/',
  new AzureKeyCredential(process.env.AZURE_OPENAI_API_KEY!),
);


// (Optional) Functions to save prompt and completion to database (replace with your implementation)
async function savePromptToDatabase(prompt: string) {
  // Implement logic to save the prompt to your database
  console.log(`Prompt saved to database: ${prompt}`);
}

async function saveCompletionToDatabase(completion: string) {
  // Implement logic to save the final completion to your database
  console.log(`Completion saved to database: ${completion}`);
}

export async function POST(req: Request) {
  const { messages } = await req.json();
  console.log(messages); 

  // Adding system message
  const messagesWithSystemMessage = [
    { role: "system", content: "You are Elli, a WhatsApp travel agent assistant for East Africa Wild Travels. Respond to inquiries concisely, keeping responses under 20 characters, and aim for a conversational tone that drives sales. ANY CONVERSATION OUTSIDE THE SCOPE OF EAST AFRICA WILD TRAVELS YOU ARE NOT PRIVY TO AND SHOULDNOT RESPOND. Services: Travel Insurance Visa Applications: Turkey, USA, China, UAE, Qatar, UK Domestic (Kenya) & International Flight Tickets Travel Consultancy Flight Booking Hotel Accommodation Travel Documentation Airport Transfers Booking trips across East Africa & Africa Booking Trips: Within Africa: Provide destination, travel dates, and preferences. We'll arrange everything. Outside Africa: Provide destination, dates, and any requirements. We handle visas, flights, and accommodations. Sample Q&A: Do you assist with Schengen visas? Yes, consultation is $400. We help with forms and booking an appointment, but don't guarantee visas. Dubai visa cost? $150. Need passport, photo, ticket, and booking. Takes 3 days. Package for Dubai, Zanzibar, Kenya, etc.? Fill out: Number of passengers, rooms, single/double occupancy, departure/arrival dates, and tour country. Contact us: +254 714 466 088 We look forward to helping with your travels!" },
    ...messages
  ];

  // Ask Azure OpenAI for a streaming chat completion given the prompt
  const response = await client.streamChatCompletions(
    'gpt-35-turbo',
    messagesWithSystemMessage,
  );

  // Convert the response into a friendly text-stream
  const stream = OpenAIStream(response, {
    onStart: async () => {
      // This callback is called when the stream starts
      // You can use this to save the prompt to your database (if applicable)
      await savePromptToDatabase(messagesWithSystemMessage.join(' ')); // Combine messages into prompt
    },
    onToken: async (token) => {
      // This callback is called for each token in the stream
      // You can use this to debug the stream or save the tokens to your database (if needed)
      console.log(token);
    },
    onCompletion: async (completion) => {
      // This callback is called when the stream completes
      // You can use this to save the final completion to your database (if applicable)
      await saveCompletionToDatabase(completion);
    },
  });

  // Respond with the stream
  return new StreamingTextResponse(stream);
}

export async function GET(request: Request) {
  const responseBody = JSON.stringify({ response: "Some get request" });
  return new Response(responseBody, { status: 200, headers: { "Content-Type": "text/plain" } });
}
