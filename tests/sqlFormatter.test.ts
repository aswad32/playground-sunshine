import { describe, it, expect } from 'vitest'
import { formatSql } from '../app/utils/sqlFormatter'

describe('formatSql', () => {
  it('returns empty output and no error for empty input', () => {
    const result = formatSql('')
    expect(result.output).toBe('')
    expect(result.error).toBeNull()
  })

  it('returns empty output and no error for whitespace-only input', () => {
    const result = formatSql('   ')
    expect(result.output).toBe('')
    expect(result.error).toBeNull()
  })

  it('formats a simple SELECT query', () => {
    const result = formatSql('select id,name from users where id=1')
    expect(result.error).toBeNull()
    expect(result.output).toContain('SELECT')
    expect(result.output).toContain('FROM')
    expect(result.output).toContain('WHERE')
  })

  it('uppercases SQL keywords', () => {
    const result = formatSql('select * from orders')
    expect(result.output).toContain('SELECT')
    expect(result.output).toContain('FROM')
    // lowercase keywords should not appear as-is
    expect(result.output).not.toMatch(/\bselect\b/)
    expect(result.output).not.toMatch(/\bfrom\b/)
  })

  it('formats a JOIN query with indentation', () => {
    const result = formatSql(
      'select u.id, u.name, o.total from users u inner join orders o on u.id = o.user_id where u.active = 1',
    )
    expect(result.error).toBeNull()
    expect(result.output).toContain('JOIN')
    expect(result.output).toContain('ON')
    // Should span multiple lines
    expect(result.output.split('\n').length).toBeGreaterThan(3)
  })

  it('formats an INSERT statement', () => {
    const result = formatSql("insert into users (name, email) values ('Alice', 'alice@example.com')")
    expect(result.error).toBeNull()
    expect(result.output).toContain('INSERT')
    expect(result.output).toContain('INTO')
    expect(result.output).toContain('VALUES')
  })

  it('formats a CREATE TABLE statement', () => {
    const result = formatSql('create table products (id int primary key, name varchar(255))')
    expect(result.error).toBeNull()
    expect(result.output).toContain('CREATE')
    expect(result.output).toContain('TABLE')
  })

  it('accepts mysql dialect without error', () => {
    const result = formatSql('select * from `users` limit 10', 'mysql')
    expect(result.error).toBeNull()
    expect(result.output).toContain('SELECT')
    expect(result.output).toContain('LIMIT')
  })

  it('accepts postgresql dialect without error', () => {
    const result = formatSql('select id, name from users order by name asc', 'postgresql')
    expect(result.error).toBeNull()
    expect(result.output).toContain('ORDER BY')
  })
})
