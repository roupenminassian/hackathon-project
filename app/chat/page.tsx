"use client";

import { useState, FormEvent, useEffect } from "react";
import Switch from "react-switch";
import Link from "next/link";
import { useRouter } from "next/navigation";

const initialAssistantMessage = {
  role: "assistant",
  content:
    "Hello, I'm Ella! Looks like we're learning about condensation today. Can you tell me more about it?",
};

export default function ChatPage() {
  const [messages, setMessages] = useState<
    Array<{ role: string; content: string }>
  >([initialAssistantMessage]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isStudentResponse, setIsStudentResponse] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const chatContainer = document.getElementById("chat-container");
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch");
      }

      const data = await response.json();
      setMessages((prev) => [...prev, data]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConversation = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/save-conversation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages, isStudentResponse }),
      });

      if (!response.ok) {
        throw new Error("Failed to save conversation");
      }

      const result = await response.json();
      if (result.id) {
        alert(`Conversation saved successfully! ID: ${result.id}`);
      } else {
        alert("Conversation saved successfully!");
      }

      // Redirect to homepage after successful save
      router.push("/");
    } catch (error) {
      console.error("Error saving conversation:", error);
      alert("Failed to save conversation. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-50 py-8 relative">
      <Link
        href="/"
        className="absolute top-4 left-4 bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
      >
        Back
      </Link>
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-green-700">Chat</h1>
          <div className="flex items-center">
            <span className="mr-2 text-green-700">AI Generated</span>
            <Switch
              onChange={() => setIsStudentResponse(!isStudentResponse)}
              checked={isStudentResponse}
              onColor="#48bb78"
              offColor="#48bb78"
              uncheckedIcon={false}
              checkedIcon={false}
            />
            <span className="ml-2 text-green-700">Student Response</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div
            id="chat-container"
            className="p-6 h-[calc(100vh-300px)] overflow-y-auto"
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-4 ${
                  message.role === "user" ? "text-right" : "text-left"
                }`}
              >
                <span
                  className={`inline-block p-3 rounded-2xl max-w-[80%] ${
                    message.role === "user"
                      ? "bg-green-600 text-white"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {message.content}
                </span>
              </div>
            ))}
            {isLoading && (
              <div className="text-center">
                <span className="inline-block p-2 rounded-full bg-green-200 text-green-700 animate-pulse">
                  Thinking...
                </span>
              </div>
            )}
          </div>
          <div className="p-4 bg-green-100">
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-grow p-3 bg-white border-2 border-green-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-green-800 placeholder-green-400"
                placeholder="Type your message..."
                disabled={isLoading || isSaving}
              />
              <button
                type="submit"
                className="bg-green-600 text-white p-3 rounded-full hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-green-300 transition-colors"
                disabled={isLoading || isSaving}
              >
                Send
              </button>
              <button
                type="button"
                onClick={handleSaveConversation}
                className="bg-green-500 text-white p-3 rounded-full hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-green-300 transition-colors"
                disabled={isLoading || isSaving || messages.length <= 1}
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
