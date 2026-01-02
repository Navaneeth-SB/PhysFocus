import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message, Sender, Source } from '../types';

const apiKey = process.env.API_KEY;

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const askPhysicsDoubt = async (
  question: string,
  history: Message[] = []
): Promise<{ text: string; sources: Source[] }> => {
  try {
    const model = 'gemini-3-flash-preview';
    
    // Construct prompt with history if available
    let context = "";
    if (history.length > 0) {
      // Limit history to last 5 messages to keep context relevant
      const recentHistory = history.slice(-5);
      context = "Previous conversation:\n" + recentHistory.map(m => `${m.sender}: ${m.text}`).join('\n') + "\n\n";
    }

    // Direct prompt for single-shot answer
    const fullPrompt = `${context}Student's Question: ${question}`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: fullPrompt,
      config: {
        systemInstruction: `
          You are an expert Physics Tutor for competitive exams (JEE, NEET, AP). 
          Provide an EXTREMELY CONCISE, direct answer (max 2-3 sentences).
          Focus strictly on the formula, concept, or definition requested.
          Do not include conversational fillers.
          If the user asks for a derivation, outline the key steps briefly.
          If the question is unrelated to Physics/Math, decline politely.

          IMPORTANT FORMATTING RULES:
          1. Do NOT use LaTeX formatting or backslashes (e.g. avoid \\frac, \\times, ^).
          2. Use standard Unicode symbols for math (e.g., use '×' or '*' for multiplication, 'θ' for theta, 'π' for pi, 'Ω' for ohm, '≈' for approx).
          3. Use simple text representation for powers (e.g. '10^-34', 'x^2').
          4. Use '/' for division.
        `,
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    // Extract text
    const text = response.text || "I couldn't find a specific answer to that.";

    // Extract sources from grounding metadata if available
    const sources: Source[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web?.uri && chunk.web?.title) {
          sources.push({
            title: chunk.web.title,
            uri: chunk.web.uri
          });
        }
      });
    }

    return { text, sources };

  } catch (error) {
    console.error("Gemini API Error:", error);
    return { 
      text: "Connection error. Please check your internet.", 
      sources: [] 
    };
  }
};