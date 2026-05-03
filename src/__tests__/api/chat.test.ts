import { POST } from '@/app/api/chat/route';
import { VertexAI } from '@google-cloud/vertexai';
import { NextResponse } from 'next/server';

// Mock Vertex AI
jest.mock('@google-cloud/vertexai', () => {
  return {
    VertexAI: jest.fn().mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockReturnValue({
        startChat: jest.fn().mockReturnValue({
          sendMessage: jest.fn().mockResolvedValue({
            response: {
              candidates: [
                {
                  content: {
                    parts: [{ text: 'Mocked AI Response' }],
                  },
                },
              ],
            },
          }),
        }),
      }),
    })),
  };
});

describe('POST /api/chat', () => {
  it('returns 400 if messages are missing', async () => {
    const req = new Request('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(req);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Invalid messages format');
  });

  it('returns 400 if messages is not an array', async () => {
    const req = new Request('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages: 'not an array' }),
    });

    const response = await POST(req);
    expect(response.status).toBe(400);
  });

  it('returns AI response for valid input', async () => {
    const req = new Request('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello' }],
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.message).toBe('Mocked AI Response');
  });

  it('returns 500 if Vertex AI fails', async () => {
    (VertexAI as unknown as jest.Mock).mockImplementationOnce(() => ({
      getGenerativeModel: jest.fn().mockImplementation(() => {
        throw new Error('Vertex AI Error');
      }),
    }));

    const req = new Request('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello' }],
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('Failed to process your request.');
  });
});
