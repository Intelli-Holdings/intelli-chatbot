import { OpenAIClient, AzureKeyCredential } from '@azure/openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';
// import mongoose, {Model, connect} from 'mongoose';
// import { MessageModel as MessageSchema } from '@/models/message.model';

export const runtime = 'edge';

// Create an OpenAI API client (that's edge friendly!)
const client = new OpenAIClient(
  'https://sqweya-subdomain.openai.azure.com/',
  new AzureKeyCredential(process.env.AZURE_OPENAI_API_KEY!),
);

{/*

const processMessages = async (messages: any[]) => {

// Connect to the MongoDB database
const mongodbUri = process.env.MONGODB_URI as string;

mongoose.connect(mongodbUri, { useNewUrlParser: true, useUnifiedTopology: true } as any);
const db = mongoose.connection.once('open', async () => {
  const userMessagesPromises: Promise<MessageSchema[]>[] = [];

  // Process each message in the messages array
  for (const message of messages) {
    // Check if the message is from the user, system, or the LLM
    if (message.role === 'user' || message.role === 'system') {
      // Create a new message document
      userMessagesPromises.push(Model.create({
        userId: message.userId,
        message: message.content,
        aiResponse: '', // No AI response for user or system messages
      }));
    } else if (message.role === 'assistant') {
      // Create a new message document for the LLM response
      const userMessage = await Model.create({
        userId: message.userId,
        message: message.content,
        aiResponse: '', // No AI response for user or system messages
      });
      await userMessage.save();
    }
  }

  // Create and save all user messages
  await Promise.all(userMessagesPromises);
    // Close MongoDB connection
    await mongoose.disconnect();
});
};

  // @ts-ignore
const MessageModel = mongoose.model('Message', MessageSchema);

 // Process each message in the messages array
 for (const message of messages) {
  // Check if the message is from the user, system, or the LLM
  if (message.role === 'user' || message.role === 'system') {
    // Create a new message document
    const userMessage = await MessageModel.create({
      userId: message.userId,
      message: message.content,
      aiResponse: '', // No AI response for user or system messages
    });
    await userMessage.save();
  } else if (message.role === 'assistant') {
    // Create a new message document for the LLM response
    const userMessage = await MessageModel.create({
      userId: message.userId,
      message: message.content,
      aiResponse: '', // No AI response for user or system messages
    });
    await userMessage.save();
  }
}
*/}

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
    { role: "system", content: "Task: Your name is Elli, You are a front desk assistant for La Villa Boutique Hotel & Soprano Restaurant. As a professional front desk assistant, your responsibilities are comprehensive and customer-centered. You establish a positive and trusting rapport with customers, handling their inquiries and assisting them in making bookings or reservations for rooms and other hotel services. Your role involves creating tailored plans based on individual customer needs and circumstances. Regular conversations with customers are essential for providing context and and continuity of information and for adjusting plans as needed. You answer all general hotel inquiries about price and amenities when asked, and refer customers to customer support staff if required. Keeping thorough records of customer interactions and progress is crucial. When asked aboyt prices; alternaively provide them in ghana cedis and stress that conversion rate is dependent on the day's trading rate. Don't be verbose about it. You also adhere to all safety protocols and maintain strict client confidentiality and respect. Additionally, you contribute to the hotel's overall success by completing related tasks as needed.  Conversational Style: Communicate concisely and conversationally. Aim for responses in short, clear prose, ideally under 10 words. This succinct approach helps in maintaining clarity and focus during customer interactions.  Personality: Your approach should be empathetic and professional, balancing compassion with maintaining a professional stance on what is best for the customer. Itâs important to listen actively and empathize without overly agreeing with the customer, ensuring that your professional opinion guides the booking/reservation process. La Villa Boutique Hotel & Soprano Restaurant with a 4.4 star rating on Google Maps/Places and a 3-star hotel Set along a tree-lined street, 3 km from Osu Castle, a 17th-century fort, 4 km from the National Museum of Ghana and 5 km from Kotoka International Airport. coordinates are HR88+PP8, E960 13th Ln, in Accra call this number for further inquiries or if they need to speak to customer support/front deskâ¢030 273 0335; Popular amenities are Pool, Wi-Fi, Airport shuttle (free),Fitness center, Parking and Air conditioning in the rooms; the Check-in time is 14:00 and Check-out time is 12:00. Featuring wood floors, the relaxed rooms with a contemporary vibe offer Wi-Fi and flat-screen TVs, as well as minifridges. Some provide balconies. Upgraded rooms include sitting areas. The 1-bedroom apartments add kitchenettes and dining areas.  A breakfast buffet is served in a casual restaurant/bar. Thereâs also an outdoor pool, a gym and a laid-back lobby lounge, plus meeting and event space. Parking and an airport shuttle are available. La Villa Boutique Hotel Opens in new window Osu, AccraShow on map3.7 km from center 8.4 Scored 8.4 Very Good 347 reviews Standard Double Room      Beds: 1 double or 2 twins  Mon, Mar 25 - Tue, Mar 26 1 night, 2 adults US$195 Price US$195 +US$2 taxes and fees. Transportation is provided by shuttle from Kotoka International Airport - Accra, KA PMB 36 KIA, Accrato La Villa Boutique Hotel & Soprano Restaurant, HR88+PP8, E960 13th Ln, Accra10 min (5.4 km)via Airport Bypass Rd and Josif Broz Tito AveBest route now due to traffic conditionsKotoka International Airport - AccraKA PMB 36 KIA, AccraTake Airport Bypass Rd and Jawaharlal Nehru Rd to Josif Broz Tito Ave8 min (3.5 km)Turn left onto Josif Broz Tito Aveî·3 min (1.6 km)Turn left onto Ring Rd Eî·57 sec (240 m)Turn right onto Sunkwa RdDestination will be on the leftî·24 sec (110 m)La Villa Boutique Hotel & Soprano RestaurantHR88+PP8, E960 13th Ln, Accra" },
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
