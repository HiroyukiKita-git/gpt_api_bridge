const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

export default async function handler(req, res) {
  console.log("✅ API呼び出し検知: " + req.method);

  if (req.method !== "POST" && req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
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

    const credentialsPath = process.env.GOOGLE_SERVICE_ACCOUNT_JSON_PATH;
    const credentials = JSON.parse(fs.readFileSync(path.resolve(credentialsPath), 'utf8'));

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
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
          eu_score,
          jp_score,
          risk_level,
          improvement_suggestions,
          source_url
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
