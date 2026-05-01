import 'react-native-get-random-values';

const HEX = '0123456789abcdef';

const randomBytes = (size: number): Uint8Array => {
  const out = new Uint8Array(size);
  if (typeof globalThis.crypto !== 'undefined' && typeof globalThis.crypto.getRandomValues === 'function') {
    globalThis.crypto.getRandomValues(out);
  } else {
    for (let i = 0; i < size; i++) out[i] = Math.floor(Math.random() * 256);
  }
  return out;
};

const toHex = (bytes: Uint8Array): string => {
  let s = '';
  for (const byte of bytes) {
    s += HEX[(byte >> 4) & 0xf];
    s += HEX[byte & 0xf];
  }
  return s;
};

export const uuidv4 = (): string => {
  const bytes = randomBytes(16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = toHex(bytes);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
};
