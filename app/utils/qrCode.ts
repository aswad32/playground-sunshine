import QRCode from 'qrcode'

export interface QRResult {
  dataUrl: string | null
  error: string | null
}

// QR code version 40 with error correction level L can hold ~4296 chars
const MAX_LENGTH = 4296

export async function generateQRCode(text: string): Promise<QRResult> {
  if (!text.trim()) {
    return { dataUrl: null, error: null }
  }

  if (text.length > MAX_LENGTH) {
    return { dataUrl: null, error: 'The input is too long to encode. Try shortening it.' }
  }

  try {
    const dataUrl = await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 300,
      color: {
        dark: '#111827',
        light: '#ffffff',
      },
    })
    return { dataUrl, error: null }
  } catch {
    return { dataUrl: null, error: 'Failed to generate QR code.' }
  }
}
