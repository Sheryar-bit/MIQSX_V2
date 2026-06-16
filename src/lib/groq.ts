import Groq from "groq-sdk";

if (!process.env.GROQ_API_KEY) {
  throw new Error("Missing GROQ_API_KEY in .env.local");
}

export const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const MODELS = {
  text: "llama-3.3-70b-versatile",
  vision: "meta-llama/llama-4-scout-17b-16e-instruct",
  fast: "llama-3.1-8b-instant",
} as const;
