import { randomBytes, createCipheriv, createDecipheriv } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const ENCODING = "base64" as const;

function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error("ENCRYPTION_KEY environment variable is not set");
  }
  const buf = Buffer.from(key, "hex");
  if (buf.length !== 32) {
    throw new Error("ENCRYPTION_KEY must be a 64-character hex string (32 bytes)");
  }
  return buf;
}

/**
 * Encrypt a plaintext string using AES-256-GCM.
 * Returns a string in the format "iv:authTag:ciphertext" (all base64-encoded).
 */
export function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });

  let encrypted = cipher.update(plaintext, "utf8", ENCODING);
  encrypted += cipher.final(ENCODING);
  const authTag = cipher.getAuthTag();

  return `${iv.toString(ENCODING)}:${authTag.toString(ENCODING)}:${encrypted}`;
}

/**
 * Decrypt a string that was encrypted with the encrypt() function.
 * Expects input in the format "iv:authTag:ciphertext" (all base64-encoded).
 */
export function decrypt(encryptedStr: string): string {
  const key = getEncryptionKey();
  const parts = encryptedStr.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted string format");
  }

  const iv = Buffer.from(parts[0], ENCODING);
  const authTag = Buffer.from(parts[1], ENCODING);
  const ciphertext = parts[2];

  const decipher = createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertext, ENCODING, "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/**
 * Check if a string appears to be encrypted (matches our format).
 */
export function isEncrypted(value: string): boolean {
  const parts = value.split(":");
  if (parts.length !== 3) return false;
  try {
    Buffer.from(parts[0], "base64");
    Buffer.from(parts[1], "base64");
    Buffer.from(parts[2], "base64");
    return true;
  } catch {
    return false;
  }
}
