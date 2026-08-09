/**
 * LOOK Vila Prudente · recebe o lead do formulário da LP e grava na planilha
 * do cliente via Google Sheets API.
 *
 * Mesmo padrão usado no Paysage Lorena: autenticação por service account,
 * que precisa ser Editora da planilha. A chave JSON completa fica na env var
 * GOOGLE_SA_KEY (Vercel > Settings > Environment Variables). O ID da planilha
 * fica em SHEET_ID. Sem dependências externas.
 *
 * Colunas da planilha (não alterar a ordem):
 *   Data | Nome | E-mail | Telefone | Interesse | Mensagem | Origem
 */

const crypto = require('crypto');

const SPREADSHEET_ID = process.env.SHEET_ID || '';

function b64url(obj) {
  return Buffer.from(JSON.stringify(obj)).toString('base64url');
}

async function getAccessToken(key) {
  const now = Math.floor(Date.now() / 1000);
  const unsigned = b64url({ alg: 'RS256', typ: 'JWT' }) + '.' + b64url({
    iss: key.client_email,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600
  });
  const signature = crypto.sign('RSA-SHA256', Buffer.from(unsigned), key.private_key).toString('base64url');
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: unsigned + '.' + signature
    })
  });
  if (!res.ok) throw new Error('token: ' + res.status + ' ' + (await res.text()));
  return (await res.json()).access_token;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'method' });

  try {
    let data = req.body || {};
    if (typeof data === 'string') {
      try { data = JSON.parse(data); } catch (e) { data = {}; }
    }

    const dataHora = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    const row = [
      dataHora,
      String(data.nome || '').slice(0, 200),
      String(data.email || '').slice(0, 200),
      String(data.telefone || '').slice(0, 50),
      String(data.interesse || '').slice(0, 100),
      String(data.mensagem || '').slice(0, 1000),
      String(data.origem || '').slice(0, 300)
    ];
    if (!row[1] && !row[2] && !row[3]) return res.status(400).json({ ok: false, error: 'empty' });

    if (!SPREADSHEET_ID || !process.env.GOOGLE_SA_KEY) {
      console.error('lead recebido, mas SHEET_ID/GOOGLE_SA_KEY nao configurados:', row);
      return res.status(500).json({ ok: false, error: 'config' });
    }

    const key = JSON.parse(process.env.GOOGLE_SA_KEY);
    const token = await getAccessToken(key);
    const url = 'https://sheets.googleapis.com/v4/spreadsheets/' + SPREADSHEET_ID +
      '/values/A1:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS';
    const append = await fetch(url, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ values: [row] })
    });
    if (!append.ok) throw new Error('append: ' + append.status + ' ' + (await append.text()));

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err.message || err) });
  }
};
