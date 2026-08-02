// P2-10: local end-to-end encryption (AES-GCM via Web Crypto).
// Passphrase is NEVER persisted. Encryption only affects WebDAV sync payloads
// and local JSON export — the in-browser working data stays plain.

const enc = new TextEncoder();
const dec = new TextDecoder();

function toBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function fromBase64(b64: string): Uint8Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw', enc.encode(passphrase), 'PBKDF2', false, ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptJSON(data: unknown, passphrase: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);
  const plaintext = enc.encode(JSON.stringify(data));
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext);
  return `${toBase64(salt.buffer)}:${toBase64(iv.buffer)}:${toBase64(cipher)}`;
}

export async function decryptJSON<T = any>(payload: string, passphrase: string): Promise<T> {
  const [saltB64, ivB64, cipherB64] = payload.split(':');
  if (!saltB64 || !ivB64 || !cipherB64) throw new Error('加密数据格式无效');
  const salt = fromBase64(saltB64);
  const iv = fromBase64(ivB64);
  const cipher = fromBase64(cipherB64);
  const key = await deriveKey(passphrase, salt);
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipher);
  return JSON.parse(dec.decode(plain)) as T;
}
