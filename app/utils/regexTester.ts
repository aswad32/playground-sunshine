export interface RegexMatch {
  index: number
  length: number
  value: string
  namedGroups: Record<string, string>
  numberedGroups: string[]
}

export interface TextSegment {
  text: string
  matched: boolean
}

export interface RegexResult {
  matches: RegexMatch[]
  segments: TextSegment[]
  error: string | null
}

export function testRegex(pattern: string, flags: string, input: string): RegexResult {
  const empty: RegexResult = {
    matches: [],
    segments: input ? [{ text: input, matched: false }] : [],
    error: null,
  }

  if (!pattern) return empty

  let regex: RegExp
  try {
    regex = new RegExp(pattern, flags)
  } catch {
    return {
      matches: [],
      segments: input ? [{ text: input, matched: false }] : [],
      error:
        'This is not a valid regular expression. Check for unescaped characters or mismatched brackets.',
    }
  }

  const matches: RegexMatch[] = []

  if (flags.includes('g')) {
    regex.lastIndex = 0
    let m: RegExpExecArray | null
    while ((m = regex.exec(input)) !== null) {
      matches.push({
        index: m.index,
        length: m[0].length,
        value: m[0],
        namedGroups: m.groups ? { ...m.groups } : {},
        numberedGroups: m.slice(1),
      })
      if (m[0].length === 0) regex.lastIndex++ // prevent infinite loop on zero-length match
    }
  } else {
    const m = regex.exec(input)
    if (m) {
      matches.push({
        index: m.index,
        length: m[0].length,
        value: m[0],
        namedGroups: m.groups ? { ...m.groups } : {},
        numberedGroups: m.slice(1),
      })
    }
  }

  // Build highlighted segments
  const segments: TextSegment[] = []
  let lastIndex = 0

  for (const match of matches) {
    if (match.index > lastIndex) {
      segments.push({ text: input.slice(lastIndex, match.index), matched: false })
    }
    segments.push({ text: input.slice(match.index, match.index + match.length), matched: true })
    lastIndex = match.index + match.length
  }
  if (lastIndex < input.length) {
    segments.push({ text: input.slice(lastIndex), matched: false })
  }

  return { matches, segments, error: null }
}
