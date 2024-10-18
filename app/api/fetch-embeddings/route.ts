// app/api/fetch-embeddings/route.ts

import { NextResponse } from "next/server";
import clientPromise from "../../../utils/mongodb";
import { PCA } from "ml-pca";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("edtech_db");
    const conversations = db.collection("conversations");

    // Fetch all conversations with embeddings
    const cursor = conversations.find({
      embeddings: { $exists: true, $ne: [] },
    });
    const conversationsArray = await cursor.toArray();

    console.log(
      `Total conversations with embeddings: ${conversationsArray.length}`
    );

    // Extract embeddings and filter out any that are not arrays or are empty
    const embeddings = conversationsArray
      .map((conv) => conv.embeddings)
      .filter((emb) => Array.isArray(emb) && emb.length > 0);

    console.log(`Valid embeddings: ${embeddings.length}`);

    if (embeddings.length === 0) {
      return NextResponse.json({
        success: false,
        error: "No valid embeddings found",
      });
    }

    // Ensure all embeddings have the same length
    const embeddingLength = embeddings[0].length;
    const validEmbeddings = embeddings.filter(
      (emb) => emb.length === embeddingLength
    );

    console.log(`Embeddings with consistent length: ${validEmbeddings.length}`);

    let plotData;
    let isPCA = false;

    if (validEmbeddings.length >= 2) {
      // Apply PCA
      const pca = new PCA(validEmbeddings);
      const reducedEmbeddings = pca
        .predict(validEmbeddings, { nComponents: 2 })
        .to2DArray();
      isPCA = true;

      // Prepare data for the frontend, only including conversations with valid embeddings
      plotData = conversationsArray
        .filter((_, index) => validEmbeddings.includes(embeddings[index]))
        .map((conv, index) => ({
          id: conv._id.toString(),
          x: reducedEmbeddings[index][0],
          y: reducedEmbeddings[index][1],
          content: conv.messages[0].content, // Just taking the first message for simplicity
          isStudentResponse: conv.isStudentResponse,
        }));
    } else {
      // If we can't do PCA, just return the raw embeddings
      plotData = conversationsArray
        .filter((_, index) => validEmbeddings.includes(embeddings[index]))
        .map((conv, index) => ({
          id: conv._id.toString(),
          x: validEmbeddings[index][0] || 0, // Use the first dimension if available, otherwise 0
          y: validEmbeddings[index][1] || 0, // Use the second dimension if available, otherwise 0
          content: conv.messages[0].content,
          isStudentResponse: conv.isStudentResponse,
        }));
    }

    console.log(`Final plot data points: ${plotData.length}`);

    return NextResponse.json({ success: true, data: plotData, isPCA });
  } catch (error) {
    console.error("Error fetching and processing embeddings:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
