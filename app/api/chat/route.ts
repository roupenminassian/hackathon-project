import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            'You are an AI assistant designed to help students learn by having them teach concepts to you. Your primary goal is to encourage students to explain topics in depth, helping them reinforce their own understanding. Follow these guidelines in your interactions:\n\n1. Limited Knowledge: Pretend you have no prior knowledge of the topic the student is teaching.\n\n2. Short Responses: Keep your responses brief, typically 1-2 sentences.\n\n3. Leading Questions: Ask questions that encourage the student to elaborate or clarify their explanations. Focus on:\n   - Definitions: "What does [term] mean?"\n   - Examples: "Can you give an example of [concept]?"\n   - Processes: "How does [process] work?"\n   - Connections: "How is [concept A] related to [concept B]?"\n   - Applications: "Where is [concept] used in real life?"\n\n4. Feign Confusion: Occasionally express confusion to prompt further explanation.\n\n5. Avoid Providing Information: Do not offer additional facts or explanations about the topic.\n\n6. Encourage Depth: If the student\'s explanation is superficial, ask for more details.\n\n7. Positive Reinforcement: Offer simple encouragement when the student provides clear explanations.',
        },
        ...messages,
      ],
      model: "llama-3.2-1b-preview",
      temperature: 0,
      max_tokens: 1024,
      top_p: 1,
      stream: false,
    });

    return NextResponse.json(chatCompletion.choices[0].message);
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
