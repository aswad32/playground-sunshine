export type DataType =
  | 'name'
  | 'email'
  | 'phone'
  | 'address'
  | 'company'
  | 'uuid'
  | 'date'
  | 'lorem'
  | 'number'
  | 'url'

export type OutputFormat = 'json' | 'csv' | 'list'

export interface GenerateOptions {
  types: DataType[]
  rows: number
  format: OutputFormat
}

export interface GenerateResult {
  output: string
  error: string | null
}

// ── Static word lists ──────────────────────────────────────────────────────────

const FIRST_NAMES = [
  'Alice', 'Bob', 'Carol', 'David', 'Emma', 'Frank', 'Grace', 'Henry',
  'Iris', 'Jack', 'Karen', 'Leo', 'Mia', 'Nathan', 'Olivia', 'Paul',
  'Quinn', 'Rachel', 'Sam', 'Tina', 'Uma', 'Victor', 'Wendy', 'Xander',
  'Yara', 'Zoe', 'Liam', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason',
  'Isabella', 'Logan', 'Chloe', 'Lucas', 'Harper', 'Elijah', 'Amelia',
]

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
  'Davis', 'Martinez', 'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Moore',
  'Jackson', 'Martin', 'Lee', 'Thompson', 'White', 'Harris', 'Clark',
  'Lewis', 'Robinson', 'Walker', 'Hall', 'Allen', 'Young', 'King',
  'Scott', 'Green', 'Baker', 'Adams', 'Nelson', 'Hill', 'Carter',
]

const STREET_NAMES = [
  'Main St', 'Oak Ave', 'Maple Dr', 'Cedar Ln', 'Elm St', 'Pine Rd',
  'Washington Blvd', 'Park Ave', 'Lake St', 'River Rd', 'Hill Dr',
  'Forest Way', 'Sunset Blvd', 'Valley Rd', 'Spring St',
]

const CITIES = [
  'Springfield', 'Riverside', 'Madison', 'Georgetown', 'Franklin',
  'Clinton', 'Salem', 'Fairview', 'Greenville', 'Ashland',
  'Burlington', 'Centerville', 'Oxford', 'Hudson', 'Auburn',
]

const STATES = [
  'CA', 'TX', 'FL', 'NY', 'PA', 'OH', 'IL', 'GA', 'NC', 'MI',
  'WA', 'AZ', 'MA', 'TN', 'IN', 'MO', 'WI', 'CO', 'MN', 'OR',
]

const COMPANIES = [
  'Acme Corp', 'Globex', 'Umbrella Inc', 'Initech', 'Vandelay Industries',
  'Hooli', 'Pied Piper', 'Aperture Science', 'Oscorp', 'Wayne Enterprises',
  'Stark Industries', 'Cyberdyne Systems', 'Soylent Corp', 'Massive Dynamic',
  'Veridian Dynamics', 'Bluth Company', 'Dunder Mifflin', 'Prestige Worldwide',
]

const DOMAINS = [
  'example.com', 'mail.org', 'test.net', 'sample.io', 'demo.co',
  'fakemail.com', 'placeholder.net', 'mockdata.io',
]

const URL_PATHS = [
  '/about', '/contact', '/products', '/blog', '/services',
  '/faq', '/pricing', '/team', '/careers', '/news',
]

const LOREM_WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing',
  'elit', 'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore',
  'et', 'dolore', 'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam',
  'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip',
  'ex', 'ea', 'commodo', 'consequat', 'duis', 'aute', 'irure', 'reprehenderit',
  'voluptate', 'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur',
]

// ── Helpers ────────────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pad(n: number, width = 2): string {
  return String(n).padStart(width, '0')
}

// ── Individual generators ──────────────────────────────────────────────────────

function generateName(): string {
  return `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`
}

function generateEmail(): string {
  const first = pick(FIRST_NAMES).toLowerCase()
  const last = pick(LAST_NAMES).toLowerCase()
  const sep = pick(['.', '_', ''])
  return `${first}${sep}${last}${randInt(1, 99)}@${pick(DOMAINS)}`
}

function generatePhone(): string {
  const area = randInt(200, 999)
  const mid = randInt(200, 999)
  const end = randInt(1000, 9999)
  return `(${area}) ${mid}-${end}`
}

function generateAddress(): string {
  const num = randInt(1, 9999)
  return `${num} ${pick(STREET_NAMES)}, ${pick(CITIES)}, ${pick(STATES)} ${pad(randInt(10000, 99999), 5)}`
}

function generateCompany(): string {
  return pick(COMPANIES)
}

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback for environments without crypto.randomUUID (e.g. test runners)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.floor(Math.random() * 16)
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function generateDate(): string {
  const start = new Date(2000, 0, 1).getTime()
  const end = new Date(2030, 11, 31).getTime()
  const d = new Date(start + Math.random() * (end - start))
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function generateLorem(): string {
  const length = randInt(6, 12)
  const words: string[] = []
  for (let i = 0; i < length; i++) {
    words.push(pick(LOREM_WORDS))
  }
  const sentence = words.join(' ')
  return sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.'
}

function generateNumber(): string {
  return String(randInt(1, 100_000))
}

function generateUrl(): string {
  return `https://${pick(DOMAINS)}${pick(URL_PATHS)}`
}

// ── Type label map ─────────────────────────────────────────────────────────────

export const DATA_TYPE_LABELS: Record<DataType, string> = {
  name: 'Name',
  email: 'Email',
  phone: 'Phone',
  address: 'Address',
  company: 'Company',
  uuid: 'UUID',
  date: 'Date',
  lorem: 'Lorem Ipsum',
  number: 'Number',
  url: 'URL',
}

// ── Row generator ──────────────────────────────────────────────────────────────

function generateValue(type: DataType): string {
  switch (type) {
    case 'name': return generateName()
    case 'email': return generateEmail()
    case 'phone': return generatePhone()
    case 'address': return generateAddress()
    case 'company': return generateCompany()
    case 'uuid': return generateUUID()
    case 'date': return generateDate()
    case 'lorem': return generateLorem()
    case 'number': return generateNumber()
    case 'url': return generateUrl()
  }
}

// ── Main export ────────────────────────────────────────────────────────────────

export function generateFakeData(options: GenerateOptions): GenerateResult {
  const { types, format } = options
  const rows = Math.max(1, Math.min(100, options.rows))

  if (types.length === 0) {
    return { output: '', error: 'Please select at least one data type.' }
  }

  const data: Record<string, string>[] = []
  for (let i = 0; i < rows; i++) {
    const row: Record<string, string> = {}
    for (const type of types) {
      row[DATA_TYPE_LABELS[type]] = generateValue(type)
    }
    data.push(row)
  }

  if (format === 'json') {
    return { output: JSON.stringify(data, null, 2), error: null }
  }

  if (format === 'csv') {
    const headers = types.map((t) => DATA_TYPE_LABELS[t])
    const lines = [headers.join(',')]
    for (const row of data) {
      lines.push(headers.map((h) => `"${row[h].replace(/"/g, '""')}"`).join(','))
    }
    return { output: lines.join('\n'), error: null }
  }

  // plain list
  const lines: string[] = []
  for (const row of data) {
    const parts = types.map((t) => `${DATA_TYPE_LABELS[t]}: ${row[DATA_TYPE_LABELS[t]]}`)
    lines.push(parts.join(' | '))
  }
  return { output: lines.join('\n'), error: null }
}
