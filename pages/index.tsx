import { useState } from 'react';

export default function Home() {
  const [companyName, setCompanyName] = useState('');
  const [adText, setAdText] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);

    const response = await fetch('/api/save-diagnosis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company_name: companyName,
        ad_copy: adText,
      }),
    });

    const data = await response.json();
    setResult(data.result);
    setLoading(false);
  };

  return (
    <main style={{ maxWidth: 600, margin: '40px auto', padding: 20, fontFamily: 'sans-serif' }}>
      <h1>グリーンウオッシュ度診断</h1>
      <p>― EU指令・日本の環境表示ガイドライン準拠度 ―</p>

      <label>
        <strong>会社名</strong><br />
        <input
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="例: JERA株式会社"
          style={{ width: '100%', padding: 8, marginTop: 4 }}
        />
      </label>

      <br /><br />

      <label>
        <strong>広告文言</strong><br />
        <textarea
          value={adText}
          onChange={(e) => setAdText(e.target.value)}
          placeholder="例: この配送はカーボンニュートラルです。"
          rows={4}
          style={{ width: '100%', padding: 8, marginTop: 4 }}
        />
      </label>

      <br /><br />

      <button onClick={handleSubmit} disabled={loading} style={{ padding: '10px 20px' }}>
        {loading ? '診断中...' : '診断する'}
      </button>

      {result && (
        <div style={{ marginTop: 40, whiteSpace: 'pre-wrap', backgroundColor: '#f8f8f8', padding: 16, borderRadius: 8 }}>
          <h2>診断結果</h2>
          <p>{result}</p>
        </div>
      )}
    </main>
  );
}

