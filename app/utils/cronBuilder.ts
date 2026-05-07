const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function isValidField(value: string, min: number, max: number): boolean {
  if (value === '*') return true
  if (/^\*\/\d+$/.test(value)) {
    const step = parseInt(value.split('/')[1])
    return step >= 1
  }
  if (value.includes(',')) {
    return value.split(',').every((v) => isValidField(v.trim(), min, max))
  }
  if (value.includes('-')) {
    const [a, b] = value.split('-').map(Number)
    return Number.isInteger(a) && Number.isInteger(b) && a >= min && b <= max && a <= b
  }
  const n = Number(value)
  return Number.isInteger(n) && n >= min && n <= max
}

export function validateCron(expression: string): boolean {
  const parts = expression.trim().split(/\s+/)
  if (parts.length !== 5) return false
  const [min, hour, dom, month, dow] = parts
  return (
    isValidField(min, 0, 59) &&
    isValidField(hour, 0, 23) &&
    isValidField(dom, 1, 31) &&
    isValidField(month, 1, 12) &&
    isValidField(dow, 0, 6)
  )
}

function describeTime(min: string, hour: string): string {
  if (min === '*' && hour === '*') return 'every minute'
  if (min === '*') return `every minute of hour ${hour}`

  const everyMin = min.match(/^\*\/(\d+)$/)
  if (everyMin) {
    const step = everyMin[1]
    if (hour === '*') return `every ${step} minutes`
    return `every ${step} minutes, during hour ${hour}`
  }

  const everyHour = hour.match(/^\*\/(\d+)$/)
  if (everyHour) return `at minute ${min} of every ${everyHour[1]} hours`

  if (
    hour !== '*' &&
    !hour.includes(',') &&
    !hour.includes('-') &&
    !min.includes(',') &&
    !min.includes('-')
  ) {
    const h = parseInt(hour).toString().padStart(2, '0')
    const m = parseInt(min).toString().padStart(2, '0')
    return `at ${h}:${m}`
  }

  return `at minute ${min} of hour ${hour}`
}

function describeDay(dom: string, month: string, dow: string): string {
  const parts: string[] = []

  if (dow !== '*') {
    const d = parseInt(dow)
    if (!isNaN(d) && WEEKDAYS[d]) parts.push(`every ${WEEKDAYS[d]}`)
    else parts.push(`on day of week ${dow}`)
  }

  if (dom !== '*') {
    parts.push(`on day ${dom} of the month`)
  }

  if (month !== '*') {
    const m = parseInt(month)
    if (!isNaN(m) && MONTHS[m - 1]) parts.push(`in ${MONTHS[m - 1]}`)
    else parts.push(`in month ${month}`)
  }

  return parts.length ? ', ' + parts.join(', ') : ''
}

export function explainCron(expression: string): { explanation: string; error: string | null } {
  const trimmed = expression.trim()
  if (!trimmed) return { explanation: '', error: null }

  if (!validateCron(trimmed)) {
    return {
      explanation: '',
      error:
        "This doesn't look like a valid cron expression. Check the number of fields and allowed values.",
    }
  }

  const [min, hour, dom, month, dow] = trimmed.split(/\s+/)
  const time = describeTime(min, hour)
  const day = describeDay(dom, month, dow)
  const full = time + day
  return { explanation: full.charAt(0).toUpperCase() + full.slice(1), error: null }
}

function fieldMatches(value: string, n: number): boolean {
  if (value === '*') return true
  const everyMatch = value.match(/^\*\/(\d+)$/)
  if (everyMatch) return n % parseInt(everyMatch[1]) === 0
  if (value.includes(',')) return value.split(',').some((v) => fieldMatches(v.trim(), n))
  if (value.includes('-')) {
    const [a, b] = value.split('-').map(Number)
    return n >= a && n <= b
  }
  return parseInt(value) === n
}

function cronMatches(
  date: Date,
  min: string,
  hour: string,
  dom: string,
  month: string,
  dow: string,
): boolean {
  return (
    fieldMatches(min, date.getMinutes()) &&
    fieldMatches(hour, date.getHours()) &&
    fieldMatches(dom, date.getDate()) &&
    fieldMatches(month, date.getMonth() + 1) &&
    fieldMatches(dow, date.getDay())
  )
}

export function getNextRuns(
  expression: string,
  count = 5,
): { runs: Date[]; error: string | null } {
  if (!validateCron(expression)) {
    return {
      runs: [],
      error:
        "This doesn't look like a valid cron expression. Check the number of fields and allowed values.",
    }
  }

  const [min, hour, dom, month, dow] = expression.trim().split(/\s+/)
  const runs: Date[] = []

  const current = new Date()
  current.setSeconds(0, 0)
  current.setMinutes(current.getMinutes() + 1)

  const maxIterations = 60 * 24 * 366 // up to ~1 year of minutes

  for (let i = 0; i < maxIterations && runs.length < count; i++) {
    if (cronMatches(current, min, hour, dom, month, dow)) {
      runs.push(new Date(current))
    }
    current.setMinutes(current.getMinutes() + 1)
  }

  return { runs, error: null }
}
