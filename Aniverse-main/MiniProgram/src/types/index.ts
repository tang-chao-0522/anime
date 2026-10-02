export interface EpisodeCount { sub?: number | null; dub?: number | null }

export interface AnimeCard {
  id: string
  name: string
  title?: string
  poster: string
  banner?: string
  description?: string
  type?: string
  rating?: string | null
  episodes?: EpisodeCount
  status?: string
  season?: string
  year?: number | null
  genres?: string[]
}

export interface HomeData {
  spotlightAnimes?: AnimeCard[]
  trendingAnimes?: AnimeCard[]
  latestEpisodeAnimes?: AnimeCard[]
  topUpcomingAnimes?: AnimeCard[]
  topAiringAnimes?: AnimeCard[]
  mostPopularAnimes?: AnimeCard[]
  mostFavoriteAnimes?: AnimeCard[]
  latestCompletedAnimes?: AnimeCard[]
  genres?: string[]
}

export interface AnimeDetail {
  anime: {
    info: AnimeCard & { stats?: { rating?: string; episodes?: EpisodeCount; type?: string; duration?: string; quality?: string } }
    moreInfo?: { studios?: string[]; producers?: string[]; genres?: string[]; status?: string; source?: string; synonyms?: string[]; aired?: { year?: number; month?: number; day?: number } }
  }
  seasons?: AnimeCard[]
  relatedAnimes?: AnimeCard[]
  recommendedAnimes?: AnimeCard[]
}

export interface AnimePage {
  animes: AnimeCard[]
  currentPage?: number
  totalPages?: number
  hasNextPage?: boolean
  category?: string
  genreName?: string
  producerName?: string
}

export interface Episode {
  episodeId: string
  number: number
  title?: string
  isFiller?: boolean
}

export interface EpisodeData { episodes: Episode[]; totalEpisodes: number }
export interface EpisodeServer { serverName: string; serverId?: number }
export interface EpisodeServers { sub?: EpisodeServer[]; dub?: EpisodeServer[]; raw?: EpisodeServer[] }
export interface Track { file: string; label?: string; kind?: string; default?: boolean }
export interface StreamData { link?: { file?: string; type?: string }; sources?: Array<{ url?: string; file?: string; type?: string }>; tracks?: Track[]; intro?: unknown; outro?: unknown }

export interface User { userId?: string; _id?: string; username: string; email: string; avatar?: string; token: string }
export interface HistoryItem { episodeId: string; episodeNumber: number; animeName: string; animeId: string; EpisodeImage?: string; server?: string; category?: string; date?: string }
export interface ChatMessage { id?: string; _id?: string; role: 'user' | 'assistant'; content: string; timestamp?: string }
