import { NextResponse } from 'next/server';
import { VertexAI } from '@google-cloud/vertexai';

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || 'election-h2s-495213';
const LOCATION = 'us-central1';
const MODEL = 'gemini-2.5-flash-preview-04-17';

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
    const vertexAI = new VertexAI({ project: PROJECT_ID, location: LOCATION });
    const generativeModel = vertexAI.getGenerativeModel({
      model: MODEL,
      systemInstruction: {
        role: 'system',
        parts: [{ text: SYSTEM_PROMPT }],
      },
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1024,
      },
    });

    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
    }

    // Map chat history — Vertex AI uses 'user' and 'model' roles
    const chatHistory = messages.slice(0, -1).map((msg: { role: string; content: string }) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    const latestMessage = messages[messages.length - 1];
    if (!latestMessage) {
      return NextResponse.json({ error: 'No message provided' }, { status: 400 });
    }

    const chat = generativeModel.startChat({ history: chatHistory });
    const result = await chat.sendMessage(latestMessage.content);
    const response = await result.response;
    const aiMessage = response.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    return NextResponse.json({ message: aiMessage });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error generating AI response:', errMsg);
    return NextResponse.json(
      { error: 'Failed to process your request.', details: errMsg },
      { status: 500 }
    );
  }
}
