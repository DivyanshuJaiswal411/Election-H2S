import { NextResponse } from 'next/server';
import { TranslationServiceClient } from '@google-cloud/translate';

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || 'election-h2s-495213';
const LOCATION = 'global';

const translationClient = new TranslationServiceClient();

export async function POST(req: Request) {
  try {
    const { text, targetLanguage } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Invalid text input' }, { status: 400 });
    }

    if (!targetLanguage || typeof targetLanguage !== 'string') {
      return NextResponse.json({ error: 'Invalid target language' }, { status: 400 });
    }

    // If target is English, return original text — no need to call the API
    if (targetLanguage === 'en') {
      return NextResponse.json({ translatedText: text });
    }

    const request = {
      parent: `projects/${PROJECT_ID}/locations/${LOCATION}`,
      contents: [text],
      mimeType: 'text/plain',
      targetLanguageCode: targetLanguage,
    };

    const [response] = await translationClient.translateText(request);
    const translatedText = response.translations?.[0]?.translatedText ?? text;

    return NextResponse.json({ translatedText });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Translation error:', errMsg);
    return NextResponse.json(
      { error: 'Translation failed.', details: errMsg },
      { status: 500 }
    );
  }
}
