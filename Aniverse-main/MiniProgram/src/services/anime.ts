import { request, unwrap, type ApiEnvelope } from './request'
import type { AnimeDetail, AnimePage, EpisodeData, EpisodeServers, HomeData, StreamData } from '../types'

const encoded = (value: string) => encodeURIComponent(value)

export const animeApi = {
  home: async () => unwrap(await request<ApiEnvelope<HomeData>>('/api/anime/getdata')),
  detail: async (id: string) => unwrap(await request<ApiEnvelope<AnimeDetail>>(`/api/anime/animedata/${encoded(id)}`)),
  category: async (name: string, page: number) => unwrap(await request<ApiEnvelope<AnimePage>>(`/api/anime/category/${encoded(name)}/${page}`)),
  genre: async (name: string, page: number) => unwrap(await request<ApiEnvelope<AnimePage>>(`/api/anime/genre/${encoded(name.replaceAll(' ', '-'))}/${page}`)),
  producer: async (name: string, page: number) => unwrap(await request<ApiEnvelope<AnimePage>>(`/api/anime/producer/${encoded(name)}/${page}`)),
  search: async (query: string) => unwrap(await request<ApiEnvelope<AnimePage>>(`/api/anime/search-result/q=${encoded(query)}`)),
  suggestions: async (query: string) => unwrap(await request<ApiEnvelope<unknown>>(`/api/anime/search-suggestions/q=${encoded(query)}`)),
  episodes: async (id: string) => unwrap(await request<ApiEnvelope<EpisodeData>>(`/api/anime/episodes/${encoded(id)}`)),
  servers: async (episodeId: string) => unwrap(await request<ApiEnvelope<EpisodeServers>>('/api/anime/episodes-server', { method: 'POST', data: { episodeId } })),
  stream: async (episodeId: string, server: string, category: string) => unwrap(await request<ApiEnvelope<StreamData>>('/api/anime/episodes-stream-links', { method: 'POST', data: { episodeId, server, category } })),
}
