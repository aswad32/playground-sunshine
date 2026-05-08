import { describe, it, expect } from 'vitest'
import { countText } from '../app/utils/wordCounter'

describe('countText', () => {
  it('returns all zeros for empty string', () => {
    const result = countText('')
    expect(result.charsWithSpaces).toBe(0)
    expect(result.charsWithoutSpaces).toBe(0)
    expect(result.words).toBe(0)
    expect(result.sentences).toBe(0)
    expect(result.paragraphs).toBe(0)
    expect(result.readingTimeMin).toBe(0)
  })

  it('counts words and characters for "Hello world"', () => {
    const result = countText('Hello world')
    expect(result.words).toBe(2)
    expect(result.charsWithSpaces).toBe(11)
    expect(result.charsWithoutSpaces).toBe(10)
  })

  it('counts one sentence for "Hello world."', () => {
    expect(countText('Hello world.').sentences).toBe(1)
  })

  it('counts multiple sentences correctly', () => {
    expect(countText('Hello. World. Goodbye!').sentences).toBe(3)
  })

  it('counts consecutive punctuation as one sentence end', () => {
    // "..." is one sentence end
    expect(countText('Wait... then go.').sentences).toBe(2)
  })

  it('counts two paragraphs separated by blank line', () => {
    const text = 'First paragraph.\n\nSecond paragraph.'
    expect(countText(text).paragraphs).toBe(2)
  })

  it('counts one paragraph when no blank lines', () => {
    expect(countText('Line one\nLine two').paragraphs).toBe(1)
  })

  it('reading time: 200 words → 1 min', () => {
    const text = Array(200).fill('word').join(' ')
    expect(countText(text).readingTimeMin).toBe(1)
  })

  it('reading time: 201 words → 2 min', () => {
    const text = Array(201).fill('word').join(' ')
    expect(countText(text).readingTimeMin).toBe(2)
  })

  it('reading time: 0 words → 0 min', () => {
    expect(countText('').readingTimeMin).toBe(0)
  })

  it('counts characters without spaces correctly', () => {
    expect(countText('a b c').charsWithoutSpaces).toBe(3)
  })

  it('handles text with leading/trailing whitespace', () => {
    expect(countText('  hello world  ').words).toBe(2)
  })
})
