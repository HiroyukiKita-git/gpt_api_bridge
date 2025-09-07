// pages/api/save-diagnosis.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { company_name, ad_copy } = req.body;

  if (!company_name || !ad_copy) {
    return res.status(400).json({ message: '会社名と広告文が必要です。' });
  }

  const prompt = `
企業名: ${company_name}
広告文: ${ad_copy}

以下の観点から、グリーンウォッシュの可能性を評価してください：
- EU Greenwashing Directive の要件
- 日本の環境表示ガイドライン（消費者庁など）
- 曖昧表現の有無（例：「環境にやさしい」など）
- 数値や根拠の提示の有無
- 第三者認証の有無
- 全体として、広告文の信頼性と誤解の可能性を5段階で評価（A:問題なし〜E:典型的グリーンウォッシュ）

その評価と理由を出力してください。
`;

  try {
    const response = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
    });

    const diagnosis = response.data.choices[0].message?.content || '診断結果が取得できませんでした。';

    return res.status(200).json({ result: diagnosis });
  } catch (error: any) {
    console.error('GPT診断エラー:', error);
    return res.status(500).json({ message: '診断処理中にエラーが発生しました。' });
  }
}
