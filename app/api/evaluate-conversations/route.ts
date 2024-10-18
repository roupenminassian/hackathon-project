import { NextResponse } from "next/server";
import clientPromise from "../../../utils/mongodb";
import { Groq } from "groq-sdk";

const GROQ_API_KEY = process.env.GROQ_API_KEY;

interface Message {
  role: string;
  content: string;
}

export async function POST() {
  try {
    const groq = new Groq({ apiKey: GROQ_API_KEY });
    const client = await clientPromise;
    const db = client.db("edtech_db");
    const conversations = db.collection("conversations");

    const totalCount = await conversations.countDocuments();
    console.log(`Total conversations in the database: ${totalCount}`);

    const cursor = conversations.find({
      $or: [{ evaluation: { $exists: false } }, { evaluation: null }],
    });
    const conversationsToEvaluate = await cursor.toArray();

    console.log(
      `Found ${conversationsToEvaluate.length} conversations to evaluate`
    );

    let evaluatedCount = 0;

    for (const conversation of conversationsToEvaluate) {
      console.log(`Processing conversation: ${conversation._id}`);

      const content = conversation.messages
        .map((msg: Message) => `${msg.role}: ${msg.content}`)
        .join("\n");

      console.log("Sending content to Groq API:", content);

      try {
        const chatCompletion = await groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content:
                '# AI Teacher Evaluation Prompt\nYou are an AI teacher tasked with evaluating students\' ability to explain concepts to individuals with no prior knowledge. Your role is to assess whether the student has effectively communicated their understanding in a way that the recipient can comprehend.\n## Evaluation Criteria:\n1. Clarity of explanation\n2. Use of appropriate language for the audience\n3. Logical flow of ideas\n4. Use of relevant examples or analogies\n5. Addressing potential misconceptions\n## Scoring:\nAfter reviewing the conversation, provide a "Pass" or "Fail" grade, followed by a brief justification (2-3 sentences) explaining your decision.\n',
            },
            {
              role: "user",
              content: content,
            },
          ],
          model: "llama-3.2-11b-text-preview",
          temperature: 0.5,
          max_tokens: 1024,
          top_p: 1,
          stream: false,
          stop: null,
        });

        const evaluation =
          chatCompletion.choices[0]?.message?.content ||
          "No evaluation available";
        console.log(`Evaluation for ${conversation._id}:`, evaluation);

        await conversations.updateOne(
          { _id: conversation._id },
          { $set: { evaluation: evaluation } }
        );

        evaluatedCount++;
      } catch (error) {
        console.error(
          `Error evaluating conversation ${conversation._id}:`,
          error
        );
      }
    }

    console.log(`Successfully evaluated ${evaluatedCount} conversations`);

    return NextResponse.json({ success: true, evaluatedCount });
  } catch (error) {
    console.error("Error evaluating conversations:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
