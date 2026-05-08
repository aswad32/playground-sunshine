import * as yaml from 'js-yaml'

export interface YamlResult {
  output: string
  error: string | null
  multiDocWarning: boolean
}

export function formatYaml(input: string): YamlResult {
  const trimmed = input.trim()

  if (!trimmed) {
    return { output: '', error: null, multiDocWarning: false }
  }

  try {
    // Use loadAll to detect multiple documents
    const docs: unknown[] = []
    yaml.loadAll(trimmed, (doc) => docs.push(doc))
    const multiDocWarning = docs.length > 1

    // Format only the first document
    const formatted = yaml.dump(docs[0], {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
    })
    return { output: formatted.trimEnd(), error: null, multiDocWarning }
  }
  catch {
    return {
      output: '',
      error:
        "This doesn't look like valid YAML. Check for incorrect indentation, tabs instead of spaces, or missing colons.",
      multiDocWarning: false,
    }
  }
}
