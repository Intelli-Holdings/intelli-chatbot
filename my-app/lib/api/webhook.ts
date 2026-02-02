import crypto from "crypto"

export type MetaWebhookValidationResult = {
  isValid: boolean
  signature?: string
}

const normalizeSignature = (signatureHeader: string) => {
  const [scheme, signature] = signatureHeader.split("=", 2)
  return scheme && signature ? { scheme, signature } : null
}

export const verifyMetaSignature = (
  rawBody: string,
  signatureHeader: string | null,
  appSecret: string,
): MetaWebhookValidationResult => {
  if (!signatureHeader) {
    return { isValid: false }
  }

  const normalized = normalizeSignature(signatureHeader)
  if (!normalized) {
    return { isValid: false }
  }

  const expected = crypto
    .createHmac("sha256", appSecret)
    .update(rawBody, "utf8")
    .digest("hex")

  const signatureBuffer = Buffer.from(normalized.signature)
  const expectedBuffer = Buffer.from(expected)
  const isValid =
    signatureBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(signatureBuffer, expectedBuffer)

  return { isValid, signature: normalized.signature }
}
