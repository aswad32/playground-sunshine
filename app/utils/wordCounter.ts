export interface TextStats {
  charsWithSpaces: number
  charsWithoutSpaces: number
  words: number
  sentences: number
  paragraphs: number
  readingTimeMin: number
}

export function countText(input: string): TextStats {
  if (!input) {
    return { charsWithSpaces: 0, charsWithoutSpaces: 0, words: 0, sentences: 0, paragraphs: 0, readingTimeMin: 0 }
  }

  const charsWithSpaces = input.length
  const charsWithoutSpaces = input.replace(/\s/g, '').length

  // Words: non-whitespace runs separated by whitespace
  const wordMatches = input.trim().match(/\S+/g)
  const words = wordMatches ? wordMatches.length : 0

  // Sentences: ends with . ! ? — consecutive punctuation counts as one
  const sentenceMatches = input.match(/[.!?]+/g)
  const sentences = sentenceMatches ? sentenceMatches.length : 0

  // Paragraphs: one or more non-empty lines, separated by blank lines
  const paragraphMatches = input.split(/\n\s*\n/).filter(p => p.trim().length > 0)
  const paragraphs = paragraphMatches.length

  // Reading time at 200 wpm; 0 words → 0, otherwise ceil
  const readingTimeMin = words === 0 ? 0 : Math.ceil(words / 200)

  return { charsWithSpaces, charsWithoutSpaces, words, sentences, paragraphs, readingTimeMin }
}
