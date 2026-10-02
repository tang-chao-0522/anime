import { create } from 'zustand'
import { request } from '../services/request'
import { useAuthStore } from './auth'
import type { AnimeCard, HistoryItem } from '../types'

interface LibraryState {
  favorites: AnimeCard[]
  watchlist: AnimeCard[]
  history: HistoryItem[]
  loading: boolean
  error: string | null
  load(): Promise<void>
  toggle(list: 'favorites' | 'watchlist', anime: AnimeCard): Promise<boolean>
  addHistory(item: Omit<HistoryItem, 'date'>): Promise<void>
  clear(): void
}

const token = () => useAuthStore.getState().user?.token
const messageOf = (error: unknown) => error instanceof Error ? error.message : '操作失败'

export const useLibraryStore = create<LibraryState>((set, get) => ({
  favorites: [], watchlist: [], history: [], loading: false, error: null,
  load: async () => {
    const authToken = token(); if (!authToken) return
    set({ loading: true, error: null })
    try {
      const [lists, historyResult] = await Promise.all([
        request<{ favorites: AnimeCard[]; watchlist: AnimeCard[] }>('/api/userAnime/anime-lists', { token: authToken }),
        request<{ history?: HistoryItem[] } | HistoryItem[]>('/api/userAnime/history', { token: authToken }),
      ])
      set({ favorites: lists.favorites || [], watchlist: lists.watchlist || [], history: Array.isArray(historyResult) ? historyResult : historyResult.history || [], loading: false })
    } catch (error) { set({ error: messageOf(error), loading: false }) }
  },
  toggle: async (list, anime) => {
    const authToken = token(); if (!authToken) return false
    const items = get()[list]
    const exists = items.some((item) => String(item.id) === String(anime.id))
    set({ loading: true, error: null })
    try {
      if (exists) {
        await request(`/api/userAnime/${list}/${encodeURIComponent(anime.id)}`, { method: 'DELETE', token: authToken })
        set({ [list]: items.filter((item) => String(item.id) !== String(anime.id)), loading: false })
      } else {
        const compact = { id: anime.id, name: anime.name, poster: anime.poster, episodes: anime.episodes }
        await request(`/api/userAnime/${list}`, { method: 'POST', token: authToken, data: { anime: compact } })
        set({ [list]: [...items, compact], loading: false })
      }
      return true
    } catch (error) { set({ error: messageOf(error), loading: false }); return false }
  },
  addHistory: async (item) => {
    const authToken = token(); if (!authToken) return
    try { await request('/api/userAnime/history', { method: 'POST', token: authToken, data: { ...item, date: new Date().toISOString() } }) } catch { /* history must not block playback */ }
  },
  clear: () => set({ favorites: [], watchlist: [], history: [], error: null }),
}))
