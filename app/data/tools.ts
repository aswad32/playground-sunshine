export interface Tool {
  name: string
  route: string
  description: string
  tags: string[]
}

const tools: Tool[] = [
  {
    name: 'JSON Formatter',
    route: '/tools/json-formatter',
    description: 'Format, validate, and minify JSON directly in your browser.',
    tags: ['json', 'formatter', 'validator'],
  },
  {
    name: 'JWT Decoder',
    route: '/tools/jwt-decoder',
    description: 'Decode a JWT token and inspect its header and payload without sending it anywhere.',
    tags: ['jwt', 'decoder', 'token', 'auth'],
  },
  {
    name: 'Base64 Encoder / Decoder',
    route: '/tools/base64',
    description: 'Encode text to Base64 or decode Base64 back to plain text directly in your browser.',
    tags: ['base64', 'encoder', 'decoder'],
  },
  {
    name: 'UUID / NanoID Generator',
    route: '/tools/uuid-nanoid-generator',
    description: 'Generate UUID v4 and NanoID values instantly in your browser.',
    tags: ['uuid', 'nanoid', 'generator', 'id'],
  },
  {
    name: 'Unix Timestamp Converter',
    route: '/tools/unix-timestamp-converter',
    description: 'Convert Unix timestamps to human-readable dates and vice versa.',
    tags: ['unix', 'timestamp', 'date', 'converter'],
  },
  {
    name: 'URL Encoder / Decoder',
    route: '/tools/url-encoder-decoder',
    description: 'Encode or decode percent-encoded URLs directly in your browser.',
    tags: ['url', 'encoder', 'decoder', 'percent-encoding'],
  },
  {
    name: 'Cron Expression Builder',
    route: '/tools/cron-builder',
    description: 'Build and validate cron expressions with a visual UI and live run preview.',
    tags: ['cron', 'scheduler', 'builder', 'expression'],
  },
  {
    name: 'Regex Tester',
    route: '/tools/regex-tester',
    description: 'Test regular expressions against sample text and visualise matches in your browser.',
    tags: ['regex', 'regular expression', 'tester', 'pattern'],
  },
  {
    name: 'Hash Generator',
    route: '/tools/hash-generator',
    description: 'Generate MD5, SHA-1, SHA-256, and SHA-512 hashes from text or files directly in your browser.',
    tags: ['hash', 'md5', 'sha256', 'sha512', 'crypto'],
  },
  {
    name: 'Fake Data Generator',
    route: '/tools/fake-data-generator',
    description: 'Generate realistic fake names, emails, addresses, and more for mocks and tests — directly in your browser.',
    tags: ['fake', 'mock', 'data', 'generator', 'test'],
  },
  {
    name: 'QR Code Generator',
    route: '/tools/qr-code-generator',
    description: 'Turn any text or URL into a scannable QR code. Download as PNG — runs entirely in your browser.',
    tags: ['qr', 'qrcode', 'generator', 'url'],
  },
  {
    name: 'Markdown Previewer',
    route: '/tools/markdown-previewer',
    description: 'Preview Markdown as formatted HTML in real time. Copy the rendered HTML or raw Markdown — runs entirely in your browser.',
    tags: ['markdown', 'previewer', 'html', 'renderer'],
  },
  {
    name: 'SQL Formatter',
    route: '/tools/sql-formatter',
    description: 'Beautify SQL queries with consistent indentation and keyword casing. Supports MySQL, PostgreSQL, SQLite, and T-SQL.',
    tags: ['sql', 'formatter', 'mysql', 'postgresql', 'sqlite'],
  },
  {
    name: 'Image Compressor / Resizer',
    route: '/tools/image-compressor',
    description: 'Compress and resize JPEG, PNG, and WebP images in your browser. See before/after file size — no server upload.',
    tags: ['image', 'compressor', 'resizer', 'jpeg', 'png', 'webp'],
  },
]

export default tools
