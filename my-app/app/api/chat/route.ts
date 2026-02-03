import { NextResponse } from 'next/server';
import { OpenAIClient, AzureKeyCredential } from '@azure/openai';

const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const apiKey = process.env.AZURE_OPENAI_API_KEY;
const deploymentName = "gpt-35-turbo";

const client = new OpenAIClient(endpoint!, new AzureKeyCredential(apiKey!));

export async function POST(request: Request) {
  try {
    // Log the raw request body for debugging
    const rawBody = await request.text();
    console.log('Raw request body:', rawBody);

    // Parse the body
    const body = JSON.parse(rawBody);
    console.log('Parsed request body:', body);

    // Handle both formats: either { message: string } or { messages: array }
    const userMessage = body.message || (body.messages?.[0]?.content);

    if (!userMessage) {
      return NextResponse.json({ 
        error: 'Message is required in format { message: "your message" }' 
      }, { status: 400 });
    }

    const result = await client.getChatCompletions(
      deploymentName,
      [
        {
          role: "system",
          content: "You are Elli, a WhatsApp travel agent assistant for East Africa Wild Travels. Respond to inquiries concisely, keeping responses under 20 characters, and aim for a conversational tone that drives sales. ANY CONVERSATION OUTSIDE THE SCOPE OF EAST AFRICA WILD TRAVELS YOU ARE NOT PRIVY TO AND SHOULD NOT RESPOND. Services: Travel Insurance Visa Applications: Turkey, USA, China, UAE, Qatar, UK Domestic (Kenya) & International Flight Tickets Travel Consultancy Flight Booking Hotel Accommodation Travel Documentation Airport Transfers Booking trips across East Africa & Africa Booking Trips: Within Africa: Provide destination, travel dates, and preferences. We'll arrange everything. Outside Africa: Provide destination, dates, and any requirements. We handle visas, flights, and accommodations. Sample Q&A: Do you assist with Schengen visas? Yes, consultation is $400. We help with forms and booking an appointment, but don't guarantee visas. Dubai visa cost? $150. Need passport, photo, ticket, and booking. Takes 3 days. Package for Dubai, Zanzibar, Kenya, etc.? Fill out: Number of passengers, rooms, single/double occupancy, departure/arrival dates, and tour country. Contact us: +254 714 466 088 We look forward to helping with your travels!."
        },
        {
          role: "user",
          content: userMessage
        }
      ],
      {
        maxTokens: 800,
        temperature: 0.7,
        topP: 0.95,
        frequencyPenalty: 0,
        presencePenalty: 0
      }
    );

    const responseMessage = result.choices[0]?.message?.content || "No response generated.";
    return NextResponse.json({ response: responseMessage });

  } catch (error: any) {
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      body: error.body
    });
    
    return NextResponse.json({ 
      error: "Failed to generate response", 
      details: error.message 
    }, { status: 500 });
  }
}