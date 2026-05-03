import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// The Google Gen AI client will be initialized inside the request handler

const SYSTEM_PROMPT = `
You are the "AI Election Assistant," an expert, friendly, and neutral guide designed to help users understand election processes, timelines, voting rights, and civic duties.

Your guidelines:
1. Neutrality: Remain strictly non-partisan and unbiased. Do not endorse any political party, candidate, or specific political ideology.
2. Accuracy: Provide clear, accurate, and easy-to-understand information about voter registration, election dates, and how the electoral system works.
3. Structure: Use markdown formatting (bullet points, bold text, numbered lists) to make complex processes easy to read.
4. Focus: If a user asks a question entirely unrelated to elections, civics, or voting, politely redirect them back to the topic of elections.
5. Empathy & Accessibility: Ensure your tone is helpful and encourages civic participation.

Answer the user's latest query based on the conversation history.
`;

export async function POST(req: Request) {
  try {
    const ai = new GoogleGenAI({});
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
    }

    // Prepare history for Gemini
    const chatHistory = messages.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // Start a chat session with the system prompt
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
            { role: 'model', parts: [{ text: 'Understood. I will act as the neutral, helpful AI Election Assistant.' }] },
            ...chatHistory
        ],
        config: {
            temperature: 0.3,
            maxOutputTokens: 1024,
        }
    });

    const aiMessage = response.text;

    return NextResponse.json({ message: aiMessage });
  } catch (error: any) {
    console.error('Error generating AI response:', error);
    return NextResponse.json(
      { error: 'Failed to process your request.', details: error.message },
      { status: 500 }
    );
  }
}
