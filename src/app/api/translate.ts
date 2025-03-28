import type { NextApiRequest, NextApiResponse } from 'next';
import { translateText } from '@/lib/translationService';

type Data = {
  translation: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === 'POST') {
    const { text, targetLanguage } = req.body;

    const result = await translateText(text, targetLanguage);
    res.status(200).json(result);
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
