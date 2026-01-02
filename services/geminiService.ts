import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message, Sender, Source } from '../types';

// FIX 1: Use the correct way to get variables in Vite (import.meta.env)
// We check for both VITE_GEMINI_API_KEY and GEMINI_API_KEY to be safe.
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || '';

// Debugging: This will show in your browser console (F12) if the key is missing
if (!apiKey) {
  console.error("CRITICAL ERROR: API Key is missing from environment variables!");
}

// Initialize the client
const ai = new GoogleGenAI({ apiKey: apiKey });

export const askPhysicsDoubt = async (
  question: string,
  history: Message[] = []
): Promise<{ text: string; sources: Source[] }> => {
  try {
    // FIX 2: Use a valid, stable model name. 'gemini-3' is not public yet.
    // 'gemini-2.0-flash-exp' is the current fast/free standard.
   const model = 'gemini-1.5-flash'; 
    
    // Construct prompt with history if available
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
        systemInstruction: `
          You are an expert Physics Tutor for competitive exams (JEE, NEET, AP). 
          Provide an EXTREMELY CONCISE, direct answer (max 2-3 sentences).
          Focus strictly on the formula, concept, or definition requested.
          Do not include conversational fillers.
          
          IMPORTANT FORMATTING RULES:
          1. Do NOT use LaTeX formatting or backslashes.
          2. Use standard Unicode symbols for math (e.g., '×', 'θ', 'π', '≈').
          3. Use simple text representation for powers (e.g. '10^-34', 'x^2').
        `,
        // Note: 'thinkingConfig' is often restricted to specific models. 
        // If it crashes, remove the thinkingConfig block.
      }
    });

    // Extract text
    const text = response.text || "I couldn't find a specific answer to that.";

    // Extract sources
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
    // This logs the REAL error to your browser console so we can see it
    console.error("Gemini API Detailed Error:", error);
    
    return { 
      text: "Connection error. Please check your internet (or API Key).", 
      sources: [] 
    };
  }
};
