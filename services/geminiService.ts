import { Message, Sender, Source } from '../types';

// We get the Groq key (using standard Vite env access)
const apiKey = import.meta.env.VITE_GROQ_API_KEY;

export const askPhysicsDoubt = async (
  question: string,
  history: Message[] = []
): Promise<{ text: string; sources: Source[] }> => {
  try {
    if (!apiKey) {
      return { text: "Configuration Error: VITE_GROQ_API_KEY is missing in Vercel.", sources: [] };
    }

    // Prepare context from previous messages
    let messages = [
        {
            role: "system",
            content: `You are an expert Physics Tutor for competitive exams (JEE, NEET). 
            Provide concise, direct answers (max 2-3 sentences). 
            Do NOT use LaTeX. Use standard symbols (e.g. *, x^2, theta). 
            Focus strictly on physics concepts.`
        }
    ];

    // Add history (limit to last 4 to keep it fast)
    history.slice(-4).forEach(msg => {
        messages.push({
            role: msg.sender === 'user' ? "user" : "assistant",
            content: msg.text
        });
    });

    // Add the current question
    messages.push({ role: "user", content: question });

    // Send request to Groq (Llama 3 Model)
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: messages,
        model: "llama3-8b-8192", // Fast, free, and smart open-source model
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
