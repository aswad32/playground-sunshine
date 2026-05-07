export function useClipboard() {
  const copied = ref(false)
  let timeout: ReturnType<typeof setTimeout>

  async function copy(text: string) {
    if (!text) return
    await navigator.clipboard.writeText(text)
    copied.value = true
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      copied.value = false
    }, 2000)
  }

  return { copy, copied }
}
