export const SUPPORTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export interface CompressOptions {
  file: File
  quality: number       // 0–1
  targetWidth?: number  // px, optional
  targetHeight?: number // px, optional
  maintainAspectRatio: boolean
}

export interface CompressResult {
  blob: Blob | null
  originalWidth: number
  originalHeight: number
  outputWidth: number
  outputHeight: number
  originalSize: number
  outputSize: number
  error: string | null
}

export function isSupported(file: File): boolean {
  return SUPPORTED_TYPES.includes(file.type)
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = src
  })
}

export async function compressImage(options: CompressOptions): Promise<CompressResult> {
  const { file, quality, maintainAspectRatio } = options

  if (!isSupported(file)) {
    return {
      blob: null,
      originalWidth: 0,
      originalHeight: 0,
      outputWidth: 0,
      outputHeight: 0,
      originalSize: file.size,
      outputSize: 0,
      error: 'Please upload a JPEG, PNG, or WebP image.',
    }
  }

  const targetW = options.targetWidth
  const targetH = options.targetHeight

  if (
    (targetW !== undefined && (targetW <= 0 || !Number.isFinite(targetW))) ||
    (targetH !== undefined && (targetH <= 0 || !Number.isFinite(targetH)))
  ) {
    return {
      blob: null,
      originalWidth: 0,
      originalHeight: 0,
      outputWidth: 0,
      outputHeight: 0,
      originalSize: file.size,
      outputSize: 0,
      error: 'Please enter valid dimensions.',
    }
  }

  const objectUrl = URL.createObjectURL(file)
  try {
    const img = await loadImage(objectUrl)
    const origW = img.naturalWidth
    const origH = img.naturalHeight

    let outW = origW
    let outH = origH

    if (targetW && targetH && !maintainAspectRatio) {
      outW = targetW
      outH = targetH
    } else if (targetW && maintainAspectRatio) {
      outW = targetW
      outH = Math.round((origH / origW) * targetW)
    } else if (targetH && maintainAspectRatio) {
      outH = targetH
      outW = Math.round((origW / origH) * targetH)
    } else if (targetW) {
      outW = targetW
    } else if (targetH) {
      outH = targetH
    }

    const canvas = document.createElement('canvas')
    canvas.width = outW
    canvas.height = outH
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, 0, 0, outW, outH)

    // Determine output MIME — PNG stays PNG, everything else becomes JPEG/WebP
    const outputType = file.type === 'image/png' ? 'image/png' : file.type

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Canvas toBlob failed'))),
        outputType,
        quality,
      )
    })

    return {
      blob,
      originalWidth: origW,
      originalHeight: origH,
      outputWidth: outW,
      outputHeight: outH,
      originalSize: file.size,
      outputSize: blob.size,
      error: null,
    }
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}
