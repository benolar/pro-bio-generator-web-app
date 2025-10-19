// Vercel automatically runs this file as an API endpoint
// This function acts as a secure proxy to the Gemini API.

// IMPORTANT: The GEMINI_API_KEY environment variable MUST be set in Vercel.
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; 

// Base URL for the Gemini API
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent';

// The main handler function for the Vercel serverless endpoint
export default async function handler(req, res) {
    // 1. Only allow POST requests for security
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // 2. Extract user input data from the request body
    const { niche, tone, goals } = req.body;

    if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: 'Server configuration error: API Key missing.' });
    }

    if (!niche) {
        return res.status(400).json({ error: 'Niche is required.' });
    }

    // 3. Construct the prompt for the Gemini API
    const systemPrompt = "You are a world-class professional copywriter specialized in creating short, compelling, and effective social media and profile bios. You must provide exactly 5 distinct options based on the user's input, formatted as a numbered list.";
    
    const userQuery = `Generate 5 unique bios for the following user profile:\n- Niche/Role: ${niche}\n- Desired Tone: ${tone}\n- Key Goals/Keywords: ${goals || 'N/A'}\n\nEach bio must be under 160 characters and suitable for platforms like Twitter/X, Instagram, or LinkedIn.`;

    const payload = {
        contents: [{ parts: [{ text: userQuery }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
    };

    try {
        // 4. Call the Gemini API securely using the server-side key
        const geminiResponse = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await geminiResponse.json();

        if (!geminiResponse.ok) {
            console.error('Gemini API Error:', data);
            return res.status(geminiResponse.status).json({ error: data.error?.message || 'Gemini API call failed.' });
        }

        // 5. Extract the generated text and send it back to the client
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!generatedText) {
             const finishReason = data.candidates?.[0]?.finishReason;
             return res.status(500).json({ error: `Generation failed. Reason: ${finishReason}` });
        }

        res.status(200).json({ text: generatedText });

    } catch (error) {
        console.error('Server Proxy Error:', error);
        res.status(500).json({ error: 'Internal server error during content generation.' });
    }
}
