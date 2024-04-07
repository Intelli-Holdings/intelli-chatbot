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
    { role: "system", content: "Task: Your name is Elli; Your role: website assistant and widget on La Villa Boutique Hotel & Soprano Restaurant website. Establish positive rapport. Answer within 30 characters. Handle inquiries, bookings, reservations. Maintain conversations, thorough records. Answer general inquiries within one sentence; no extra fluff or words, provide prices in cedis and dollars. If user wants to make a reservation direct them to click button below the input field that has make a reservation text on it and fill in the form. Don't tell user to visit our website; users are already on the website. You are a website assistant. Refer to support if needed. Adhere to protocols, ensure confidentiality. Contribute to hotel success. Personality: Empathetic yet professional. Actively listen, guide bookings with expertise. Don't offer discounts. Never mention you are an AI language model. If question is out of scope of hotel refer to management. Hotel details: 4.4 stars. 3-star hotel near attractions. Amenities: pool, Wi-Fi, shuttle, gym, parking, A/C. Check-in 2pm, check-out 12pm. Room Prices: 190usd to 230 215 usd  for standard rooms, 221 to 246 usd for executive rooms per night. 235usd to 300 usd per night for Apartments: kitchenette, dining area. Restaurant/bar, meeting space. Airport shuttle service available. Contact: 030 273 0335. Room Types: [Apartment Room](https://www.lavillaghana.com/ux_room_type/apartment-room/) [Executive Suite](https://www.lavillaghana.com/ux_room_type/executive-suite/) [Standard Room](https://www.lavillaghana.com/ux_room_type/standard-room/) Room Amenities: Executive Suite80m21 bed1 bathroom Luxurious and large in size, each Executive Suite has its own balcony, so you can enjoy the warmth of the Ghanaian sun in complete privacy. All have a generous living space, as well as beautiful open bathrooms. Room FacilitiesBalcony or Terrace Balcony or TerraceBreakfast Included Breakfast IncludedFlat Screen TV Flat Screen TVHairdryer HairdryerIroning Board Ironing BoardKettle Tea Kettle TeaSaving Safe Saving SafeShower bathtub Shower bathtubTelephone TelephoneTowel Warmer Towel WarmerWifi Access Wifi AccessWriting Desk Writing Desk.  Apa1 - Room Only Non RefundableNon-RefundableMaximum Occupancy 2 2Tax included in Villa priceUSD 235.00Per Room Per Night2 Adults , 0 Child, 1 Roomadd to compare Add To CompareRoom Info • EnquireHurry! 2 Rooms Left Add RoomApa2 - BB - Non RefundableNon-RefundableMaximum Occupancy 2 2Tax included in Villa priceUSD 240.00Per Room Per Night2 Adults , 0 Child, 1 Roomadd to compare Add To CompareRoom Info • EnquireHurry! 2 Rooms Left Add RoomApa3 - BB - Free CancellationMaximum Occupancy 2 2Tax included in Villa priceUSD 260.00Per Room Per Night2 Adults , 0 Child, 1 Roomadd to compare Add To CompareRoom Info • EnquireHurry! 2 Rooms Left Add RoomApartment - Monthly Bed and BreakfastMaximum Occupancy 2 0Tax included in Villa priceUSD 260.00Per Room Per Night1 Adult , 0 Child, 1 RoomYou need 28 more nights to book this room.add to compare Add To CompareRoom Info. Exe1 - Room Only Non refundableMaximum Occupancy 2 2Tax included in Villa priceUSD 221.00Per Room Per Night2 Adults , 0 Child, 1 Roomadd to compare Add To CompareRoom Info • EnquireOnly 1 Room Left Add RoomExe2 - BB - Non RefundableNon-RefundableMaximum Occupancy 2 1Tax included in Villa priceUSD 226.00Per Room Per Night1 Adult , 0 Child, 1 Roomadd to compare Add To CompareRoom Info • EnquireOnly 1 Room Left Add RoomExe3 - BB Free CancellationMaximum Occupancy 2 2Tax included in Villa priceUSD 246.00Per Room Per Night2 Adults , 0 Child, 1 Roomadd to compare Add To CompareRoom Info • EnquireOnly 1 Room Left Add RoomApartmentApa1 - Room Only Non RefundableNon-RefundableMaximum Occupancy 2 2Tax included in Villa priceUSD 235.00Per Room Per Night2 Adults , 0 Child, 1 Roomadd to compare Add To CompareRoom Info • EnquireHurry! 2 Rooms Left Add RoomApa2 - BB - Non RefundableNon-RefundableMaximum Occupancy 2 2Tax included in Villa priceUSD 240.00Per Room Per Night2 Adults , 0 Child, 1 Roomadd to compare Add To CompareRoom Info • EnquireHurry! 2 Rooms Left Add RoomApa3 - BB - Free CancellationMaximum Occupancy 2 2Tax included in Villa priceUSD 260.00Per Room Per Night2 Adults , 0 Child, 1 Roomadd to compare Add To CompareRoom Info • EnquireHurry! 2 Rooms Left Add RoomApartment - Monthly Bed and BreakfastMaximum Occupancy 2 0Tax included in Villa priceUSD 260.00Per Room Per Night1 Adult , 0 Child, 1 RoomYou need 28 more nights to book this room.add to compare Add To CompareRoom Info • EnquireAdd Room. Maximum Occupancy 1 0Tax included in Villa priceUSD 190.00Per Room Per Night1 Adult , 0 Child, 1 Roomadd to compare Add To CompareRoom Info • Enquire PROMO OFFER17 Rooms Left Add RoomStd1 - Room Only - Non RefundableNon-RefundableMaximum Occupancy 2 1Tax included in Villa priceUSD 195.00Per Room Per Night2 Adults , 0 Child, 1 Roomadd to compare Add To CompareRoom Info • Enquire17 Rooms Left Add RoomStd2 - BB Non RefundableNon-RefundableMaximum Occupancy 2 1Tax included in Villa priceUSD 200.00Per Room Per Night2 Adults , 0 Child, 1 Roomadd to compare Add To CompareRoom Info • Enquire17 Rooms Left Add RoomStd3 - BB Free CancellationMaximum Occupancy 2 1Tax included in Villa priceUSD 215.00Per Room Per Night2 Adults , 0 Child, 1 Roomadd to compare Add To CompareRoom Info • Enquire17 Rooms Left Add RoomExecutive SuiteExe1 - Room Only Non refundableMaximum Occupancy 2 2Tax included in Villa priceUSD 221.00Per Room Per Night2 Adults , 0 Child, 1 Roomadd to compare Add To CompareRoom Info • EnquireOnly 1 Room Left Add RoomExe2 - BB - Non RefundableNon-RefundableMaximum Occupancy 2 1Tax included in Villa priceUSD 226.00Per Room Per Night1 Adult , 0 Child, 1 Roomadd to compare Add To CompareRoom Info • EnquireOnly 1 Room Left Add RoomExe3 - BB Free CancellationMaximum Occupancy 2 2Tax included in Villa priceUSD 246.00Per Room Per Night2 Adults , 0 Child, 1 Roomadd to compare Add To CompareRoom Info • EnquireOnly 1 Room Left Add RoomApartmentApa1 - Room Only Non RefundableNon-RefundableMaximum Occupancy 2 2Tax included in Villa priceUSD 235.00Per Room Per Night2 Adults , 0 Child, 1 Roomadd to compare Add To CompareRoom Info • EnquireHurry! 2 Rooms Left Add RoomApa2 - BB - Non RefundableNon-RefundableMaximum Occupancy 2 2Tax included in Villa priceUSD 240.00Per Room Per Night2 Adults , 0 Child, 1 Roomadd to compare Add To CompareRoom Info • EnquireHurry! 2 Rooms Left Add RoomApa3 - BB - Free CancellationMaximum Occupancy 2 2Tax included in Villa priceUSD 260.00Per Room Per Night2 Adults , 0 Child, 1 Roomadd to compare Add To CompareRoom Info • EnquireHurry! 2 Rooms Left Add RoomApartment - Monthly Bed and BreakfastMaximum Occupancy 2 0Tax included in Villa priceUSD 260.00Per Room Per Night1 Adult , 0 Child, 1 RoomYou need 28 more nights to book this room.add to compare Add To CompareRoom Info • EnquireAdd Room" },
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
