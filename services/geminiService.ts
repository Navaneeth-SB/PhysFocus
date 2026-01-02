import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message, Sender, Source } from '../types';

// Get API Key
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || '';

// Initialize the client
const ai = new GoogleGenAI({ apiKey: apiKey });

export const askPhysicsDoubt = async (
  question: string,
  history: Message[] = []
): Promise<{ text: string; sources: Source[] }> => {
  try {
    // SWITCHED TO HIGH-LIMIT MODEL
    // 'gemini-1.5-flash' allows 15 requests/minute for free. 
    // The previous one (2.0-exp) allowed much less.
    // We are changing 'gemini-1.5-flash' to the specific stable version 'gemini-1.5-flash-001'
    // This is the specific version that rarely gives a 404 error.
    const model = 'gemini-1.5-flash-001';
    
    let context = "";
    if (history.length > 0) {
      const recentHistory = history.slice(-5);
      context = "Previous conversation:\n" + recentHistory.map(m => `${m.sender}: ${m.text}`).join('\n') + "\n\n";
    }

    const fullPrompt = `${context}Student's Question: ${question}`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: fullPrompt,
      config: {
        // Simple instructions only. No 'thinking' or 'tools' to prevent crashes.
        systemInstruction: `
          You are an expert Physics Tutor. 
          Provide an EXTREMELY CONCISE answer (max 2-3 sentences).
          Do NOT use LaTeX. Use standard symbols (e.g. '×', '10^-34').
        `,
      }
    });

    const text = response.text || "I couldn't find an answer.";
    return { text, sources: [] };

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    // DEBUG MODE: This prints the specific technical error to the chat
    // So we can see if it's a 400, 403, 404, or 429.
    const errorMessage = error.message || String(error);
    
    return { 
      text: `(Debug Error): ${errorMessage}`, 
      sources: [] 
    };
  }
}
