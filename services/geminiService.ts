import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message, Sender, Source } from '../types';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || '';

const ai = new GoogleGenAI({ apiKey: apiKey });

export const askPhysicsDoubt = async (
  question: string,
  history: Message[] = []
): Promise<{ text: string; sources: Source[] }> => {
  try {
    // BACK TO THE ONLY MODEL THAT CONNECTED
    // We know this works because you got a 429 error (which means it found the server!)
    const model = 'gemini-2.0-flash-exp'; 
    
    let context = "";
    if (history.length > 0) {
      const recentHistory = history.slice(-3); // Only keep last 3 messages to save tokens
      context = "Previous conversation:\n" + recentHistory.map(m => `${m.sender}: ${m.text}`).join('\n') + "\n\n";
    }

    const fullPrompt = `${context}Student's Question: ${question}`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: fullPrompt,
      config: {
        // Absolutely minimal config to prevent crashes
        systemInstruction: "You are a concise Physics Tutor. No LaTeX. Use standard math symbols.",
      }
    });

    const text = response.text || "I couldn't find an answer.";
    return { text, sources: [] };

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    const errorMessage = error.message || String(error);
    
    // If we hit the speed limit (429), we tell you nicely.
    if (errorMessage.includes("429") || errorMessage.includes("quota")) {
      return { 
        text: "I am a bit busy! Please wait 1 minute and try again. (Free Tier Limit)", 
        sources: [] 
      };
    }

    return { 
      text: `(Debug Error): ${errorMessage}`, 
      sources: [] 
    };
  }
};
