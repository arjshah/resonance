import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto'

const ALGORITHM = 'aes-256-cbc'

// Generate a 32-byte key from the provided encryption key
function getKey(encryptionKey: string) {
  return scryptSync(encryptionKey, 'salt', 32)
}

export async function encrypt(text: string) {
  if (!process.env.ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY environment variable is not set')
  }

  const key = getKey(process.env.ENCRYPTION_KEY)
  const iv = randomBytes(16)
  const cipher = createCipheriv(ALGORITHM, key, iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return `${iv.toString('hex')}:${encrypted}`
}

export async function decrypt(text: string) {
  if (!process.env.ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY environment variable is not set')
  }

  const [ivHex, encryptedText] = text.split(':')
  const iv = Buffer.from(ivHex, 'hex')
  const key = getKey(process.env.ENCRYPTION_KEY)
  const decipher = createDecipheriv(ALGORITHM, key, iv)
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}