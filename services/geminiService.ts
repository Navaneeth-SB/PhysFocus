import { Message, Sender, Source } from '../types';

const apiKey = import.meta.env.VITE_GROQ_API_KEY;

export const askPhysicsDoubt = async (
  question: string,
  history: Message[] = []
): Promise<{ text: string; sources: Source[] }> => {
  try {
    if (!apiKey) {
      return { text: "Configuration Error: VITE_GROQ_API_KEY is missing.", sources: [] };
    }

    let messages = [
        {
            role: "system",
            content: `You are an expert Physics Tutor for competitive exams. 
            Provide concise, direct answers (max 2-3 sentences). 
            Do NOT use LaTeX. Use standard symbols (e.g. *, x^2, theta).`
        }
    ];

    history.slice(-4).forEach(msg => {
        messages.push({
            role: msg.sender === 'user' ? "user" : "assistant",
            content: msg.text
        });
    });

    messages.push({ role: "user", content: question });

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: messages,
        // UPDATED MODEL NAME BELOW:
        model: "llama-3.1-8b-instant", 
        temperature: 0.5,
        max_tokens: 200
      })
    });

    if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error?.message || "Groq API Error");
    }

    const data = await response.json();
    const text = data.choices[0]?.message?.content || "No answer received.";

    return { text, sources: [] };

  } catch (error: any) {
    console.error("API Error:", error);
    return { 
      text: `Connection Error: ${error.message || "Failed to reach AI"}`, 
      sources: [] 
    };
  }
};
