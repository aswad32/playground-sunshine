import { describe, it, expect } from 'vitest'
import {
  tokenise,
  toCamelCase,
  toPascalCase,
  toSnakeCase,
  toKebabCase,
  toScreamingSnakeCase,
  toTitleCase,
  convertAllCases,
} from '../app/utils/stringCaseConverter'

describe('tokenise', () => {
  it('splits whitespace-separated words', () => {
    expect(tokenise('hello world')).toEqual(['hello', 'world'])
  })

  it('splits camelCase boundaries', () => {
    expect(tokenise('getUserById')).toEqual(['get', 'user', 'by', 'id'])
  })

  it('splits PascalCase boundaries', () => {
    expect(tokenise('GetUserById')).toEqual(['get', 'user', 'by', 'id'])
  })

  it('splits snake_case', () => {
    expect(tokenise('snake_case_input')).toEqual(['snake', 'case', 'input'])
  })

  it('splits kebab-case', () => {
    expect(tokenise('kebab-case-input')).toEqual(['kebab', 'case', 'input'])
  })

  it('collapses consecutive separators', () => {
    expect(tokenise('user__name')).toEqual(['user', 'name'])
  })

  it('strips non-alphanumeric characters (no split boundary)', () => {
    // !@# are not word separators — they are stripped, merging adjacent tokens
    expect(tokenise('hello!@#world')).toEqual(['helloworld'])
  })

  it('preserves numbers in tokens', () => {
    expect(tokenise('base64Encoder')).toEqual(['base64', 'encoder'])
  })

  it('returns empty array for empty input', () => {
    expect(tokenise('')).toEqual([])
  })

  it('returns empty array for all non-alphanumeric input', () => {
    expect(tokenise('!@#$%^')).toEqual([])
  })

  it('handles SCREAMING_SNAKE_CASE input', () => {
    expect(tokenise('HELLO_WORLD')).toEqual(['hello', 'world'])
  })
})

describe('toCamelCase', () => {
  it('converts "hello world"', () => {
    expect(toCamelCase('hello world')).toBe('helloWorld')
  })

  it('converts "getUserById"', () => {
    expect(toCamelCase('getUserById')).toBe('getUserById')
  })

  it('converts "snake_case_input"', () => {
    expect(toCamelCase('snake_case_input')).toBe('snakeCaseInput')
  })

  it('converts "kebab-case-input"', () => {
    expect(toCamelCase('kebab-case-input')).toBe('kebabCaseInput')
  })

  it('preserves numbers: base64Encoder', () => {
    expect(toCamelCase('base64Encoder')).toBe('base64Encoder')
  })

  it('returns empty for empty input', () => {
    expect(toCamelCase('')).toBe('')
  })

  it('returns empty for all non-alphanumeric', () => {
    expect(toCamelCase('!@#')).toBe('')
  })
})

describe('toPascalCase', () => {
  it('converts "hello world"', () => {
    expect(toPascalCase('hello world')).toBe('HelloWorld')
  })

  it('converts "getUserById"', () => {
    expect(toPascalCase('getUserById')).toBe('GetUserById')
  })

  it('converts "snake_case_input"', () => {
    expect(toPascalCase('snake_case_input')).toBe('SnakeCaseInput')
  })
})

describe('toSnakeCase', () => {
  it('converts "hello world"', () => {
    expect(toSnakeCase('hello world')).toBe('hello_world')
  })

  it('converts "getUserById"', () => {
    expect(toSnakeCase('getUserById')).toBe('get_user_by_id')
  })

  it('converts "kebab-case-input"', () => {
    expect(toSnakeCase('kebab-case-input')).toBe('kebab_case_input')
  })

  it('preserves numbers: base64Encoder', () => {
    expect(toSnakeCase('base64Encoder')).toBe('base64_encoder')
  })
})

describe('toKebabCase', () => {
  it('converts "hello world"', () => {
    expect(toKebabCase('hello world')).toBe('hello-world')
  })

  it('converts "getUserById"', () => {
    expect(toKebabCase('getUserById')).toBe('get-user-by-id')
  })

  it('converts "snake_case_input"', () => {
    expect(toKebabCase('snake_case_input')).toBe('snake-case-input')
  })
})

describe('toScreamingSnakeCase', () => {
  it('converts "hello world"', () => {
    expect(toScreamingSnakeCase('hello world')).toBe('HELLO_WORLD')
  })

  it('converts "getUserById"', () => {
    expect(toScreamingSnakeCase('getUserById')).toBe('GET_USER_BY_ID')
  })

  it('converts "kebab-case-input"', () => {
    expect(toScreamingSnakeCase('kebab-case-input')).toBe('KEBAB_CASE_INPUT')
  })
})

describe('toTitleCase', () => {
  it('converts "hello world"', () => {
    expect(toTitleCase('hello world')).toBe('Hello World')
  })

  it('converts "getUserById"', () => {
    expect(toTitleCase('getUserById')).toBe('Get User By Id')
  })

  it('converts "snake_case_input"', () => {
    expect(toTitleCase('snake_case_input')).toBe('Snake Case Input')
  })
})

describe('convertAllCases', () => {
  it('converts "hello world" to all formats', () => {
    const result = convertAllCases('hello world')
    expect(result.camel).toBe('helloWorld')
    expect(result.pascal).toBe('HelloWorld')
    expect(result.snake).toBe('hello_world')
    expect(result.kebab).toBe('hello-world')
    expect(result.screaming).toBe('HELLO_WORLD')
    expect(result.title).toBe('Hello World')
  })

  it('converts "getUserById" correctly', () => {
    const result = convertAllCases('getUserById')
    expect(result.snake).toBe('get_user_by_id')
    expect(result.kebab).toBe('get-user-by-id')
    expect(result.pascal).toBe('GetUserById')
    expect(result.screaming).toBe('GET_USER_BY_ID')
  })

  it('returns all empty strings for empty input', () => {
    const result = convertAllCases('')
    expect(result.camel).toBe('')
    expect(result.pascal).toBe('')
    expect(result.snake).toBe('')
    expect(result.kebab).toBe('')
    expect(result.screaming).toBe('')
    expect(result.title).toBe('')
  })

  it('returns all empty strings for non-alphanumeric input', () => {
    const result = convertAllCases('!@#$%^')
    expect(result.camel).toBe('')
    expect(result.snake).toBe('')
  })
})
