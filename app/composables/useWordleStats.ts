import { ref, computed } from 'vue'

export interface WordleStats {
  played: number
  won: number
  currentStreak: number
  maxStreak: number
  distribution: Record<1 | 2 | 3 | 4 | 5 | 6, number>
}

const STATS_KEY = 'ps-wordle-stats'

function defaultStats(): WordleStats {
  return {
    played: 0,
    won: 0,
    currentStreak: 0,
    maxStreak: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
  }
}

function load(): WordleStats {
  try {
    const raw = localStorage.getItem(STATS_KEY)
    if (!raw) return defaultStats()
    return { ...defaultStats(), ...(JSON.parse(raw) as Partial<WordleStats>) }
  } catch {
    return defaultStats()
  }
}

function save(stats: WordleStats) {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats))
}

export function useWordleStats() {
  const stats = ref<WordleStats>(defaultStats())

  function refresh() {
    stats.value = load()
  }

  function recordResult(guessCount: number | null) {
    // guessCount = null means a loss
    const s = load()
    s.played++
    if (guessCount !== null && guessCount >= 1 && guessCount <= 6) {
      s.won++
      s.currentStreak++
      if (s.currentStreak > s.maxStreak) s.maxStreak = s.currentStreak
      const key = guessCount as 1 | 2 | 3 | 4 | 5 | 6
      s.distribution[key] = (s.distribution[key] ?? 0) + 1
    } else {
      s.currentStreak = 0
    }
    save(s)
    stats.value = s
  }

  const winPercent = computed(() =>
    stats.value.played === 0 ? 0 : Math.round((stats.value.won / stats.value.played) * 100),
  )

  const maxDistribution = computed(() =>
    Math.max(1, ...Object.values(stats.value.distribution)),
  )

  return { stats, refresh, recordResult, winPercent, maxDistribution }
}
