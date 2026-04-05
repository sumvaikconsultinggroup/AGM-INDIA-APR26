// import OpenAI from 'openai';

// // Fallback responses for when API key is not available
// const fallbackResponses = {
//   greeting: "Namaste! I'm your AI assistant for the AvdheshanandG website. How can I assist you today?",
//   default: "I'm currently operating in offline mode. For the best experience, please ensure the OpenAI API key is configured. In the meantime, here are some features of our website:\n- Explore spiritual teachings in the Articles section.\n- Listen to enlightening Podcasts.\n- Watch video series on spirituality and Vedanta.\n- Contribute via the Donation section.\n- Learn about Swami Avdheshanand Giri Ji Maharaj in the About section.",
//   home: "Welcome to the AvdheshanandG website. Explore spiritual teachings, video series, podcasts, articles, and more.",
//   podcasts: "You can listen to enlightening podcasts on spirituality and Vedanta in the Podcasts section.",
//   articles: "Our Articles section contains profound teachings on Hindu Dharma, Bhagavad Gita, and Sanskrit texts.",
//   books: "You can browse spiritual books written by Swami Avdheshanand Giri Ji Maharaj in the Books section.",
//   videos: "Explore inspirational video series on spirituality, Vedanta, and Hindu philosophy in the Video Series section.",
//   inMedia: "Check out interviews, appearances, and media features of Swami Avdheshanand Giri Ji Maharaj in the In Media section.",
//   donation: "You can contribute to noble causes by visiting the Donation section.",
//   about: "Swami Avdheshanand Giri Ji Maharaj is a revered spiritual leader who spreads the wisdom of Vedanta, Bhagavad Gita, and ancient Hindu philosophy. Learn more about him in the About section."
// }

// function getFallbackResponse(message) {
//   const lowerMessage = message.toLowerCase();

//   if (lowerMessage.includes('home')) {
//     return fallbackResponses.home;
//   }
//   if (lowerMessage.includes('podcast')) {
//     return fallbackResponses.podcasts;
//   }
//   if (lowerMessage.includes('article')) {
//     return fallbackResponses.articles;
//   }
//   if (lowerMessage.includes('book')) {
//     return fallbackResponses.books;
//   }
//   if (lowerMessage.includes('video') || lowerMessage.includes('series')) {
//     return fallbackResponses.videos;
//   }
//   if (lowerMessage.includes('media') || lowerMessage.includes('inmedia')) {
//     return fallbackResponses.inMedia;
//   }
//   if (lowerMessage.includes('donation') || lowerMessage.includes('donate')) {
//     return fallbackResponses.donation;
//   }
//   if (lowerMessage.includes('about') || lowerMessage.includes('swami')) {
//     return fallbackResponses.about;
//   }

//   return fallbackResponses.default;
// }
// let openai = null;
// try {
//   if (import.meta.env.VITE_OPENAI_API_KEY) {
//     openai = new OpenAI({
//       apiKey: import.meta.env.VITE_OPENAI_API_KEY,
//       organization: "org-JT9uBRJ90SROV3iu08qe2pKm",
//       project: "proj_FZnkQJh059tXyxW8C8ysQN5S",
//     });
//   }
// } catch (error) {
//   console.warn('OpenAI client initialization failed:', error);
// }

// const systemPrompt = `You are a helpful assistant for the AvdheshanandG website. Your main responsibilities are:

// 1. Help users navigate the website.
// 2. Provide information about Swami Avdheshanand Giri Ji Maharaj.
// 3. Assist with accessing resources like Podcasts, Articles, Books, Video Series, and the Donation section.
// 4. Explain website features like the Home page and In Media section.
// 5. Redirect users to specific sections of the website based on their queries.

// Key website features:
// - Home: Overview of spiritual teachings and resources.
// - Podcasts: Enlightening talks on spirituality and Vedanta.
// - Articles: In-depth teachings on Hindu Dharma, Bhagavad Gita, and Sanskrit texts.
// - Books: Spiritual books by Swami Avdheshanand Giri Ji Maharaj.
// - Video Series: Inspirational videos on spirituality and Vedanta.
// - In Media: Swamiji's appearances in media and interviews.
// - Donation: Contribute to noble causes.
// - About: Learn about Swami Avdheshanand Giri Ji Maharaj.

// Please provide concise and relevant responses related to the website. If asked about unrelated topics, politely redirect the conversation to website features or spiritual teachings.`;

// export async function getChatGPTResponse(messages) {
//   // If OpenAI client is not initialized, use fallback responses
//   if (!openai) {
//     const lastMessage = messages[messages.length - 1];
//     return getFallbackResponse(lastMessage.text);
//   }

//   try {
//     const response = await openai.chat.completions.create({
//       model: "gpt-3.5-turbo",
//       messages: [
//         { role: "system", content: systemPrompt },
//         ...messages.map(msg => ({
//           role: msg.type === 'user' ? 'user' : 'assistant',
//           content: msg.text
//         }))
//       ],
//       max_tokens: 150,
//       temperature: 0.7,
//     });

//     return response.choices[0].message.content;
//   } catch (error) {
//     console.error('OpenAI API Error:', error);
//     return getFallbackResponse(messages[messages.length - 1].text);
//   }
// }

import OpenAI from 'openai';
import { PineconeClient } from '@pinecone-database/pinecone';

// Load environment variables
const OPENAI_API_KEY = process.env.VITE_OPENAI_API_KEY || "";
const PINECONE_API_KEY = process.env.VITE_PINECONE_API_KEY || "";
const PINECONE_ENVIRONMENT = process.env.VITE_PINECONE_ENVIRONMENT || "us-west1-gcp";
const PINECONE_INDEX_NAME = process.env.VITE_PINECONE_INDEX_NAME || "chatbot-index";

// Initialize OpenAI client
let openai = null;
try {
  if (OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: OPENAI_API_KEY,
      organization: "org-JT9uBRJ90SROV3iu08qe2pKm",  // Optional: You can pass organization ID if needed
    });
  }
} catch (error) {
  console.warn('OpenAI client initialization failed:', error);
}

// Initialize Pinecone client
let pinecone = null;
try {
  if (PINECONE_API_KEY) {
    pinecone = new PineconeClient();
    pinecone.init({
      apiKey: PINECONE_API_KEY,
      environment: PINECONE_ENVIRONMENT,  // Example: 'us-west1-gcp'
    });
  }
} catch (error) {
  console.warn('Pinecone client initialization failed:', error);
}

// Create embeddings using OpenAI
export async function generateEmbeddings(text) {
  if (!openai) {
    throw new Error("OpenAI client is not initialized.");
  }

  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002', // Model for generating embeddings
      input: text,
    });

    return response.data[0].embedding; // Return the embedding
  } catch (error) {
    console.error('Error generating embeddings:', error);
    throw new Error('Failed to generate embeddings.');
  }
}

// Store embeddings in Pinecone vector database
export async function storeEmbeddingsInPinecone(vectors, ids) {
  if (!pinecone) {
    throw new Error("Pinecone client is not initialized.");
  }

  try {
    const index = pinecone.Index(PINECONE_INDEX_NAME);
    const upsertResponse = await index.upsert({
      vectors: vectors.map((embedding, index) => ({
        id: ids[index],
        values: embedding,
      })),
    });


    return upsertResponse;
  } catch (error) {
    console.error('Error storing embeddings in Pinecone:', error);
    throw new Error('Failed to store embeddings.');
  }
}

// Search Pinecone for similar content based on a query
export async function searchVectorDatabase(query, topK = 5) {
  if (!pinecone) {
    throw new Error("Pinecone client is not initialized.");
  }

  try {
    const index = pinecone.Index(PINECONE_INDEX_NAME);
    const queryEmbedding = await generateEmbeddings(query); // Get the embedding for the query

    const queryResponse = await index.query({
      vector: queryEmbedding,
      topK: topK,
      includeValues: true,
      includeMetadata: true,
    });


    return queryResponse.matches; // Return the most relevant matches
  } catch (error) {
    console.error('Error querying Pinecone:', error);
    throw new Error('Failed to query vector database.');
  }
}

// Fallback responses for when API key is not available
const fallbackResponses = {
  greeting: "Namaste! I'm your AI assistant for the AvdheshanandG website. How can I assist you today?",
  default: "I'm currently operating in offline mode. For the best experience, please ensure the OpenAI API key is configured. In the meantime, here are some features of our website:\n- Explore spiritual teachings in the Articles section.\n- Listen to enlightening Podcasts.\n- Watch video series on spirituality and Vedanta.\n- Contribute via the Donation section.\n- Learn about Swami Avdheshanand Giri Ji Maharaj in the About section.",
  home: "Welcome to the AvdheshanandG website. Explore spiritual teachings, video series, podcasts, articles, and more.",
  podcasts: "You can listen to enlightening podcasts on spirituality and Vedanta in the Podcasts section.",
  articles: "Our Articles section contains profound teachings on Hindu Dharma, Bhagavad Gita, and Sanskrit texts.",
  books: "You can browse spiritual books written by Swami Avdheshanand Giri Ji Maharaj in the Books section.",
  videos: "Explore inspirational video series on spirituality, Vedanta, and Hindu philosophy in the Video Series section.",
  inMedia: "Check out interviews, appearances, and media features of Swami Avdheshanand Giri Ji Maharaj in the In Media section.",
  donation: "You can contribute to noble causes by visiting the Donation section.",
  about: "Swami Avdheshanand Giri Ji Maharaj is a revered spiritual leader who spreads the wisdom of Vedanta, Bhagavad Gita, and ancient Hindu philosophy. Learn more about him in the About section.",
  contact: "If you would like to reach out to us, please visit the Contact Us section for more details.",
  joinLive: "You can join live sessions hosted by Swami Avdheshanand Giri Ji Maharaj. Visit the Home page for the live session schedule.",
  kumbh: "Kumbh 2025 is a spiritual gathering of immense significance. Visit our website for information on events, booking accommodations, and participating in the holy festivities.",
  accommodation: "To book your accommodation for Kumbh 2025, check the dedicated section on our website. You'll find details on stays, amenities, and how to make reservations."


};

function getFallbackResponse(message) {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('home')) {
    return fallbackResponses.home;
  }
  if (lowerMessage.includes('podcast')) {
    return fallbackResponses.podcasts;
  }
  if (lowerMessage.includes('article')) {
    return fallbackResponses.articles;
  }
  if (lowerMessage.includes('book')) {
    return fallbackResponses.books;
  }
  if (lowerMessage.includes('video') || lowerMessage.includes('series')) {
    return fallbackResponses.videos;
  }
  if (lowerMessage.includes('media') || lowerMessage.includes('inmedia')) {
    return fallbackResponses.inMedia;
  }
  if (lowerMessage.includes('donation') || lowerMessage.includes('donate')) {
    return fallbackResponses.donation;
  }
  if (lowerMessage.includes('about') || lowerMessage.includes('swami')) {
    return fallbackResponses.about;
  }
  if (lowerMessage.includes('contact')) {
    return fallbackResponses.contact;
  }
  if (lowerMessage.includes('join live') || lowerMessage.includes('live sessions')) {
    return fallbackResponses.joinLive;
  }
  if (lowerMessage.includes('kumbh')) {
    return fallbackResponses.kumbh;
  }
  if (lowerMessage.includes('accommodation') || lowerMessage.includes('stay')) {
    return fallbackResponses.accommodation;
  }

  return fallbackResponses.default;
}

// System prompt for OpenAI chatbot
const systemPrompt = `You are a helpful assistant for the AvdheshanandG website. Your main responsibilities are:

1. Help users navigate the website.
2. Provide information about Swami Avdheshanand Giri Ji Maharaj.
3. Assist with accessing resources like Podcasts, Articles, Books, Video Series, and the Donation section.
4. Explain website features like the Home page and In Media section.
5. Redirect users to specific sections of the website based on their queries.

Key website features:
- Home: Overview of spiritual teachings and resources.
- Podcasts: Enlightening talks on spirituality and Vedanta.
- Articles: In-depth teachings on Hindu Dharma, Bhagavad Gita, and Sanskrit texts.
- Books: Spiritual books by Swami Avdheshanand Giri Ji Maharaj.
- Video Series: Inspirational videos on spirituality and Vedanta.
- In Media: Swamiji's appearances in media and interviews.
- Donation: Contribute to noble causes.
- About: Learn about Swami Avdheshanand Giri Ji Maharaj.

Please provide concise and relevant responses related to the website. If asked about unrelated topics, politely redirect the conversation to website features or spiritual teachings.`;

export async function getChatGPTResponse(messages) {
  // If OpenAI client is not initialized, use fallback responses
  if (!openai) {
    const lastMessage = messages[messages.length - 1];
    return getFallbackResponse(lastMessage.text);
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map(msg => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.text
        }))
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return getFallbackResponse(messages[messages.length - 1].text);
  }
}
