import OpenAI from "openai";


const endPoint = "https://models.inference.ai.azure.com";

const openai = new OpenAI({
  baseURL: endPoint,
  apiKey: import.meta.env.VITE_OPENAI_API_KEY, // Store your API key in a .env file
  dangerouslyAllowBrowser: true
});


async function chatWithGPT(textContent, userQuery) {
    if (!textContent || !userQuery) {
        throw new Error("Invalid input: Both document content and user query are required.");
    }

    // Enhanced Prompt Engineering for better context
    const prompt = `
        Document Content: """${textContent}"""
        User Query: """${userQuery}"""
        
        You are a highly intelligent AI assistant specializing in extracting insights from documents.
        Your task is to analyze the provided content and respond professionally, ensuring clarity and accuracy.
        If the query is vague, ask for clarification. If the answer is not in the document, state that explicitly.
        Respond in a structured format where needed.
    `;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are an AI assistant trained to analyze documents and assist users in understanding the content with a professional and psychologically supportive approach give them response too their queries breifly eg:'very shortly not more than 2 to 3 lines' until they tells you to elaborate this or until you get keywords like 'Explain', 'in Details' 'elaborate' 'understand'." },
                { role: "user", content: prompt }
            ],
            temperature: 0.5, // Adjusted for balanced responses
            max_tokens: 1000, // Prevents unnecessary token usage
            // stream: true,
        });
        console.log("REsponnsE IS: "+ response)
        if (response.choices?.length > 0) {
            return response.choices[0].message.content.trim();
        } else {
            throw new Error("Unexpected API response format.");
        }
    } catch (error) {
        console.error("ChatGPT API Error:", error);
        return "An error occurred while processing your request. Please try again later.";
    }
}

export default chatWithGPT;
