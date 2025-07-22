import { google } from "googleapis";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const {
      company_name,
      ad_copy,
      eu_score,
      jp_score,
      risk_level,
      improvement_suggestions,
      source_url,
    } = req.body;

    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),
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

    res.status(200).json({ status: "success" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to save diagnosis" });
  }
}
