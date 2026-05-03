import { POST } from '@/app/api/translate/route';
import { TranslationServiceClient } from '@google-cloud/translate';

// Mock Translation SDK
jest.mock('@google-cloud/translate', () => {
  return {
    TranslationServiceClient: jest.fn().mockImplementation(() => ({
      translateText: jest.fn().mockResolvedValue([
        {
          translations: [{ translatedText: 'Translated Text' }],
        },
      ]),
    })),
  };
});

describe('POST /api/translate', () => {
  it('returns 400 if text is missing', async () => {
    const req = new Request('http://localhost:3000/api/translate', {
      method: 'POST',
      body: JSON.stringify({ targetLanguage: 'hi' }),
    });

    const response = await POST(req);
    expect(response.status).toBe(400);
  });

  it('returns original text if target language is English', async () => {
    const req = new Request('http://localhost:3000/api/translate', {
      method: 'POST',
      body: JSON.stringify({ text: 'Hello', targetLanguage: 'en' }),
    });

    const response = await POST(req);
    const data = await response.json();
    expect(data.translatedText).toBe('Hello');
  });

  it('returns translated text for other languages', async () => {
    const req = new Request('http://localhost:3000/api/translate', {
      method: 'POST',
      body: JSON.stringify({ text: 'Hello', targetLanguage: 'hi' }),
    });

    const response = await POST(req);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.translatedText).toBe('Translated Text');
  });
});
