import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

// 環境に応じて認証情報を取得
let credentials;

if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
  // ✅ Vercelや本番環境では、環境変数からJSONをパース
  credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
} else {
  // ✅ ローカル開発ではcredentials.jsonファイルを読み込む
const credentialsPath = path.resolve('./credentials.json');

let credentials;
try {
  const raw = fs.readFileSync(credentialsPath, 'utf8');
  credentials = JSON.parse(raw);
} catch (err) {
  console.error("❌ credentials.json の読み込みに失敗しました:", err);
  throw new Error("Google認証情報の読み込みに失敗しました。");
}

// Google Sheets API認証
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

// APIルートのハンドラー
export default async function handler(req, res) {
  console.log("✅ API呼び出し検知: " + req.method);

  if (req.method !== "POST" && req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // POST: req.body, GET: req.query
    const data = req.method === "POST" ? req.body : req.query;
    console.log("📝 受信データ:", JSON.stringify(data, null, 2));

    // 必須パラメータ
    const {
      company_name,
      ad_copy,
      eu_score,
      jp_score,
      risk_level,
      improvement_suggestions,
      source_url,
    } = data;

    if (!company_name || !ad_copy) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    // スプレッドシートID
    const spreadsheetId = process.env.SHEET_ID;

    // スプレッドシートに書き込み
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Sheet1!A1", // 必要に応じて変更
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          new Date().toISOString(),
          company_name,
          ad_copy,
          eu_score || '',
          jp_score || '',
          risk_level || '',
          improvement_suggestions || '',
          source_url || ''
        ]],
      },
    });

    console.log("✅ 書き込み成功");
    res.status(200).json({ status: "success" });

  } catch (error) {
    console.error("❌ 書き込みエラー:", error);
    res.status(500).json({ error: error.message });
  }
}
