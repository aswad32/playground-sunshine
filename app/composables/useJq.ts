import { ref } from 'vue'

interface JqInstance {
  json: (obj: unknown, filter: string) => unknown
  raw: (jsonString: string, filter: string, flags?: string[]) => string
}

let jqInstance: JqInstance | null = null

export function useJq() {
  const loading = ref(false)

  async function run(jsonInput: string, expr: string): Promise<string> {
    loading.value = true
    try {
      if (!jqInstance) {
        const mod = await import('jq-web')
        const factory = (mod.default ?? mod) as () => Promise<JqInstance>
        jqInstance = await factory()
      }
      const parsed = JSON.parse(jsonInput)
      const result = jqInstance.json(parsed, expr)
      if (Array.isArray(result) && result.length > 1) {
        return result.map((v) => JSON.stringify(v, null, 2)).join('\n')
      }
      const val = Array.isArray(result) ? result[0] : result
      return JSON.stringify(val, null, 2)
    } catch (e) {
      throw e instanceof Error ? e : new Error(String(e))
    } finally {
      loading.value = false
    }
  }

  return { run, loading }
}
