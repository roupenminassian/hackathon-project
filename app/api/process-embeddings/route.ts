import { NextResponse } from "next/server";
import clientPromise from "../../../utils/mongodb";
import { HfInference } from "@huggingface/inference";

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export async function POST() {
  try {
    const client = await clientPromise;
    const db = client.db("edtech_db");
    const conversations = db.collection("conversations");

    // Fetch all conversations without embeddings
    const cursor = conversations.find({ embeddings: { $size: 0 } });

    while (await cursor.hasNext()) {
      const conversation = await cursor.next();
      if (!conversation) continue;

      // Concatenate all messages into a single string
      const text = conversation.messages
        .map((msg: { role: string; content: string }) => msg.content)
        .join(" ");

      // Generate embeddings
      const embedding = await hf.featureExtraction({
        model: "sentence-transformers/all-MiniLM-L6-v2",
        inputs: text,
      });

      // Update the document with the new embeddings
      await conversations.updateOne(
        { _id: conversation._id },
        { $set: { embeddings: embedding } }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing embeddings:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
