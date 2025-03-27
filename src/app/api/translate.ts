import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  translation: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === 'POST') {
    const { text, targetLanguage } = req.body;

    // Simulate a translation process
    const translatedText = `Translated (${targetLanguage}): ${text}`;

    res.status(200).json({ translation: translatedText });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
