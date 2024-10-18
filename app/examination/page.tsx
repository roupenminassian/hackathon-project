"use client";

import { useState, useEffect } from "react";

interface Conversation {
  _id: string;
  messages: { role: string; content: string }[];
  evaluation?: string;
  isStudentResponse: boolean;
}

function extractEvaluationResult(evaluation: string): {
  result: string;
  fullEvaluation: string;
} {
  const match = evaluation.match(/\*([\s\S]*?)\*/);
  if (match) {
    const result = match[1].trim();
    const fullEvaluation = evaluation.replace(/\*[\s\S]*?\*/, "").trim();
    return { result, fullEvaluation };
  }
  return { result: "", fullEvaluation: evaluation };
}

export default function ExaminationPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await fetch("/api/fetch-conversations");
      if (!response.ok) {
        throw new Error("Failed to fetch conversations");
      }
      const data = await response.json();
      setConversations(data.conversations);
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to fetch conversations. Please try again.");
    }
  };

  const handleEvaluate = async () => {
    setIsEvaluating(true);
    setError(null);
    try {
      const response = await fetch("/api/evaluate-conversations", {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to evaluate conversations: ${errorData.error}. Details: ${errorData.details}`
        );
      }

      const data = await response.json();
      alert(
        `Evaluated ${data.evaluatedCount} conversations. Refreshing data...`
      );
      await fetchConversations();
    } catch (error) {
      console.error("Error:", error);
      setError(
        `Failed to evaluate conversations. ${
          error instanceof Error ? error.message : "Please try again."
        }`
      );
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-center text-green-700">
          Examination
        </h1>
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center mb-8">
          <button
            onClick={handleEvaluate}
            disabled={isEvaluating}
            className="bg-green-600 text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-green-300 transition-colors"
          >
            {isEvaluating ? "Evaluating..." : "Evaluate Conversations"}
          </button>
        </div>
        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-8"
            role="alert"
          >
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4 text-center text-green-700">
            Conversation Evaluations
          </h2>
          {conversations.map((conversation) => {
            const { result, fullEvaluation } = conversation.evaluation
              ? extractEvaluationResult(conversation.evaluation)
              : { result: "", fullEvaluation: "" };

            return (
              <div
                key={conversation._id}
                className="mb-6 p-4 border rounded-lg"
              >
                <h3 className="font-bold text-lg mb-2">
                  Conversation ID: {conversation._id}
                </h3>
                <p className="mb-2 text-gray-700">
                  Type:{" "}
                  <span className="font-semibold">
                    {conversation.isStudentResponse
                      ? "Student Response"
                      : "AI Generated"}
                  </span>
                </p>
                {conversation.evaluation ? (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 mb-2">
                      Evaluation:
                    </h4>
                    {result && (
                      <p className="bg-yellow-100 p-3 rounded mb-2 text-gray-800 font-medium">
                        {result}
                      </p>
                    )}
                    {fullEvaluation && (
                      <p className="p-3 bg-gray-100 rounded text-gray-700">
                        {fullEvaluation}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="mb-2 text-gray-700">
                    Evaluation:{" "}
                    <span className="font-medium">Not evaluated yet</span>
                  </p>
                )}
                <div className="bg-gray-100 p-3 rounded mt-4">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Conversation:
                  </h4>
                  {conversation.messages.map((msg, index) => (
                    <p key={index} className="mb-1 text-gray-700">
                      <strong className="text-gray-800">{msg.role}:</strong>{" "}
                      {msg.content}
                    </p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
