export interface TimestampToDateResult {
  utc: string
  local: string
  error: string | null
}

export interface DateToTimestampResult {
  seconds: number
  milliseconds: number
  error: string | null
}

export function timestampToDate(
  value: string,
  unit: 'seconds' | 'milliseconds',
): TimestampToDateResult {
  if (!value.trim()) return { utc: '', local: '', error: null }

  const num = Number(value)
  if (!Number.isFinite(num)) {
    return { utc: '', local: '', error: 'Please enter a valid number.' }
  }

  const ms = unit === 'seconds' ? num * 1000 : num
  const date = new Date(ms)

  if (isNaN(date.getTime())) {
    return { utc: '', local: '', error: 'Please enter a valid number.' }
  }

  return {
    utc: date.toUTCString(),
    local: date.toLocaleString(),
    error: null,
  }
}

export function dateToTimestamp(value: string): DateToTimestampResult {
  if (!value.trim()) return { seconds: 0, milliseconds: 0, error: null }

  const date = new Date(value)

  if (isNaN(date.getTime())) {
    return { seconds: 0, milliseconds: 0, error: 'Please enter a valid date.' }
  }

  const ms = date.getTime()
  return {
    seconds: Math.floor(ms / 1000),
    milliseconds: ms,
    error: null,
  }
}
