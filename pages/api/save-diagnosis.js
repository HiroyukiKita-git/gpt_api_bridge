const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Google認証情報の取得
let credentials;

if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
  // ✅ 本番環境など：環境変数から
  credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
} else {
  // ✅ 開発環境：ファイルから
  const credentialsPath = path.resolve('./credentials.json');
  try {
    const raw = fs.readFileSync(credentialsPath, 'utf8');
    credentials = JSON.parse(raw);
  } catch (err) {
    console.error("❌ credentials.json の読み込みに失敗しました:", err);
    throw new Error("Google認証情報の読み込みに失敗しました。");
  }
}

// Google Sheets API認証
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

// APIルートのハンドラー
module.exports = async function handler(req, res) {
  console.log("✅ API呼び出し検知: " + req.method);

  if (req.method !== "POST" && req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // POST: req.body, GET: req.query
    const data = req.method === "POST" ? req.body : req.query;
    console.log("📝 受信データ:", JSON.stringify(data, null, 2));

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

    const spreadsheetId = process.env.SHEET_ID;

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Sheet1!A1",
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
};
