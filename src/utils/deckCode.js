// 牌組分享代碼：把「牌組名稱 + 卡片 id 陣列」雙向轉換成可複製/貼上的字串。
// 格式：'PKD1.' + Base64( JSON({ n: name, c: cardIds }) )，採 UTF-8 → Base64，支援中文名稱。
const PREFIX = 'PKD1.';

const toBase64 = (str) => {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  bytes.forEach((b) => { binary += String.fromCharCode(b); });
  return btoa(binary);
};

const fromBase64 = (b64) => {
  const binary = atob(b64);
  const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
  return new TextDecoder().decode(bytes);
};

export const encodeDeck = ({ name, cardIds }) =>
  PREFIX + toBase64(JSON.stringify({ n: name ?? '', c: cardIds ?? [] }));

// 還原；無法解析時回傳 null（容錯：可帶或不帶前綴）
export const decodeDeck = (code) => {
  if (typeof code !== 'string' || !code.trim()) return null;
  const trimmed = code.trim();
  const body = trimmed.startsWith(PREFIX) ? trimmed.slice(PREFIX.length) : trimmed;
  try {
    const obj = JSON.parse(fromBase64(body));
    if (!obj || !Array.isArray(obj.c)) return null;
    return {
      name: typeof obj.n === 'string' && obj.n.trim() ? obj.n : '匯入的牌組',
      cardIds: obj.c.filter((id) => typeof id === 'string'),
    };
  } catch {
    return null;
  }
};
