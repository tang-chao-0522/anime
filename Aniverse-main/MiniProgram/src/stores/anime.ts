import { create } from 'zustand'
import { animeApi } from '../services/anime'
import type { AnimeDetail, AnimePage, EpisodeData, EpisodeServers, HomeData, StreamData } from '../types'

interface AnimeState {
  home: HomeData | null
  detail: AnimeDetail | null
  listing: AnimePage | null
  episodes: EpisodeData | null
  servers: EpisodeServers | null
  stream: StreamData | null
  loading: boolean
  loadingMore: boolean
  error: string | null
  loadHome(): Promise<void>
  loadDetail(id: string): Promise<void>
  loadListing(kind: 'category' | 'genre' | 'producer', name: string, page?: number): Promise<void>
  search(query: string): Promise<void>
  loadEpisodes(id: string): Promise<void>
  loadServers(episodeId: string): Promise<void>
  loadStream(episodeId: string, server: string, category: string): Promise<void>
  clearDetail(): void
}

const fail = (error: unknown) => error instanceof Error ? error.message : '加载失败'

export const useAnimeStore = create<AnimeState>((set, get) => ({
  home: null, detail: null, listing: null, episodes: null, servers: null, stream: null,
  loading: false, loadingMore: false, error: null,
  loadHome: async () => {
    set({ loading: true, error: null })
    try { set({ home: await animeApi.home(), loading: false }) } catch (error) { set({ error: fail(error), loading: false }) }
  },
  loadDetail: async (id) => {
    set({ detail: null, loading: true, error: null })
    try { set({ detail: await animeApi.detail(id), loading: false }) } catch (error) { set({ error: fail(error), loading: false }) }
  },
  loadListing: async (kind, name, page = 1) => {
    set({ [page > 1 ? 'loadingMore' : 'loading']: true, error: null })
    try {
      const next = await animeApi[kind](name, page)
      const previous = get().listing
      set({
        listing: page > 1 && previous ? { ...next, animes: [...previous.animes, ...next.animes] } : next,
        loading: false, loadingMore: false,
      })
    } catch (error) { set({ error: fail(error), loading: false, loadingMore: false }) }
  },
  search: async (query) => {
    set({ listing: null, loading: true, error: null })
    try { set({ listing: await animeApi.search(query), loading: false }) } catch (error) { set({ error: fail(error), loading: false }) }
  },
  loadEpisodes: async (id) => {
    set({ episodes: null, servers: null, stream: null, loading: true, error: null })
    try { set({ episodes: await animeApi.episodes(id), loading: false }) } catch (error) { set({ error: fail(error), loading: false }) }
  },
  loadServers: async (episodeId) => {
    set({ servers: null, stream: null, loading: true, error: null })
    try { set({ servers: await animeApi.servers(episodeId), loading: false }) } catch (error) { set({ error: fail(error), loading: false }) }
  },
  loadStream: async (episodeId, server, category) => {
    set({ stream: null, loading: true, error: null })
    try { set({ stream: await animeApi.stream(episodeId, server, category), loading: false }) } catch (error) { set({ error: fail(error), loading: false }) }
  },
  clearDetail: () => set({ detail: null, episodes: null, servers: null, stream: null, error: null }),
}))
