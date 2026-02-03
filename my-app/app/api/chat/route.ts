import { NextResponse } from 'next/server';
import { OpenAIClient, AzureKeyCredential } from '@azure/openai';

const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const apiKey = process.env.AZURE_OPENAI_API_KEY;
const deploymentName = "gpt-35-turbo";

const client = new OpenAIClient(endpoint!, new AzureKeyCredential(apiKey!));

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
  

  // Adding system message
  const messagesWithSystemMessage = [
    { role: "system", content: "Task: Your name is Elli; Your role: website assistant and widget on Hazelaw Consulting Group Website. ABOUT USWe are a full service firm located in Accra, Ghana that offers US immigration, global tourism, and diaspora investment services. Our team is dedicated to helping individuals and families navigate complex processes and achieve their goals. Contact us today to see how we can assist you!MEET YOUR SUPPORT STAFFSANDRA MELODY APPIAHVISA CONSULTANTKELVIN KING DAWIEDIRECTOR OF OPERATIONSJENNIFER AFEDOOPERATIONS SPECIALISTDENNISEIA HAYNESVISA CONSULTANTERNESTINA YEBOAHRECEPTIONISTATTORNEYKELLISIA HAZLEWOOD, ESQ., LL.M.FOUNDING PARTNERAt our firm, we are passionate about helping individuals and families achieve their dreams of living and working in the United States. As a founding partner, I am committed to providing our clients with the highest quality service, grounded in integrity, professionalism, and empathy.RA’NESHA LAWRENCE, ESQ.FOUNDING PARTNERWe understand that immigration is a deeply personal and transformative experience, and we are honored to be able to support you through this journey. Our team is dedicated to providing personalized attention, clear communication, and compassionate guidance every step of the way.OUR SERVICESUS IMMIGRATIONWant to visit or migrate to the US? Our firm offers services for family- based, employment-based, diversity visa lottery, study abroad and tourist visas. Let us help you navigate the complex processGLOBAL TOURISMDreaming of a trip abroad? Our firm offers services for visa applications and personalized travel itineraries. Let us help you plan your next international adventure!DIASPORA INVESTMENTSAre you apart of the Black Diaspora Community, and you are looking to relocate or invest in Ghana? Our firm offers services strategic planning and consultations for investments, and relocation opportunities in Ghana. We will connect you to some of the best investment opportunities Ghana has to offer.US VISA ASSISTANCE? WE ARE HERE FOR YOU.Book a Chat: +1-917-525-4321, +233(0)257783843, +233(0)508415856 CONTACT INFORMATION PHONE NUMBER: +233(0)257783843 /+ 233(0)508415856 WHATSAPP NUMBER: +1-917-525-4321 LOCATION: 4 Garden Road, East Legon, Ghana Around A&C Mall Across the street from Prime Pharmacy INSTAGRAM: @hl_consulting_group WEBSITE: www.hazelaw.com/hl-consulting" },
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
