import { format } from 'sql-formatter'
import type { SqlLanguage } from 'sql-formatter'

export type SqlDialect = 'sql' | 'mysql' | 'postgresql' | 'sqlite' | 'transactsql'

export const DIALECT_LABELS: Record<SqlDialect, string> = {
  sql: 'Standard SQL',
  mysql: 'MySQL',
  postgresql: 'PostgreSQL',
  sqlite: 'SQLite',
  transactsql: 'T-SQL',
}

export interface FormatResult {
  output: string
  error: string | null
}

export function formatSql(input: string, dialect: SqlDialect = 'sql'): FormatResult {
  if (!input.trim()) {
    return { output: '', error: null }
  }

  try {
    const output = format(input, {
      language: dialect as SqlLanguage,
      keywordCase: 'upper',
      indentStyle: 'standard',
      tabWidth: 2,
    })
    return { output, error: null }
  } catch {
    return {
      output: '',
      error: 'Could not format this SQL. Check for syntax errors and try again.',
    }
  }
}
