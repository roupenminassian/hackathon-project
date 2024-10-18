import { NextResponse } from "next/server";
import clientPromise from "../../../utils/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("edtech_db");
    const conversations = db.collection("conversations");

    const cursor = conversations.find({});
    const conversationsArray = await cursor.toArray();

    return NextResponse.json({
      success: true,
      conversations: conversationsArray,
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
