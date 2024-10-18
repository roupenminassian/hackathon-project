import { NextRequest, NextResponse } from "next/server";
import clientPromise from "../../../utils/mongodb";

export async function POST(req: NextRequest) {
  try {
    const { messages, isStudentResponse } = await req.json();
    const client = await clientPromise;
    const db = client.db("edtech_db");

    const result = await db.collection("conversations").insertOne({
      messages,
      timestamp: new Date(),
      embeddings: [],
      isStudentResponse: isStudentResponse,
      evaluation: null,
    });

    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (error) {
    console.error("Error saving conversation:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
