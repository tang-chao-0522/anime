import Taro, { useLoad } from '@tarojs/taro'
import { ScrollView, Text, Video, View } from '@tarojs/components'
import { useEffect, useMemo, useState } from 'react'
import { useAnimeStore } from '../../stores/anime'
import { useLibraryStore } from '../../stores/library'
import type { Episode, EpisodeServer } from '../../types'
import Loading from '../../components/Loading'
import ErrorState from '../../components/ErrorState'
import './index.scss'

interface PageParams { id: string; name: string; poster: string }
export default function PlayerPage() {
  const [params, setParams] = useState<PageParams>({ id: '', name: '', poster: '' })
  const [episode, setEpisode] = useState<Episode | null>(null)
  const [selection, setSelection] = useState<{ server: EpisodeServer; category: string } | null>(null)
  const { episodes, servers, stream, loading, error, loadEpisodes, loadServers, loadStream } = useAnimeStore()
  const addHistory = useLibraryStore((state) => state.addHistory)
  useLoad((options) => {
    const next = { id: options.id || '', name: decodeURIComponent(options.name || ''), poster: decodeURIComponent(options.poster || '') }
    setParams(next); Taro.setNavigationBarTitle({ title: next.name || '播放' }); void loadEpisodes(next.id)
  })
  useEffect(() => { if (episodes?.episodes.length && !episode) selectEpisode(episodes.episodes[0]) }, [episodes])
  useEffect(() => {
    if (!servers || selection) return
    const category = servers.sub?.length ? 'sub' : servers.dub?.length ? 'dub' : servers.raw?.length ? 'raw' : ''
    const first = category ? servers[category as keyof typeof servers]?.[0] : undefined
    if (first) selectServer(first, category)
  }, [servers])
  const videoUrl = useMemo(() => stream?.sources?.[0]?.url || stream?.sources?.[0]?.file || stream?.link?.file || '', [stream])
  const selectEpisode = (item: Episode) => { setEpisode(item); setSelection(null); void loadServers(item.episodeId) }
  const selectServer = (server: EpisodeServer, category: string) => { setSelection({ server, category }); if (episode) void loadStream(episode.episodeId, server.serverName, category) }
  const onPlay = () => {
    if (!episode || !selection) return
    void addHistory({ episodeId: episode.episodeId, server: selection.server.serverName, episodeNumber: episode.number, animeName: params.name, category: selection.category, EpisodeImage: params.poster, animeId: params.id })
  }
  const allServers: Array<{ category: string; server: EpisodeServer }> = [
    ...(servers?.sub || []).map((server) => ({ category: 'sub', server })),
    ...(servers?.dub || []).map((server) => ({ category: 'dub', server })),
    ...(servers?.raw || []).map((server) => ({ category: 'raw', server })),
  ]
  return (
    <View className='page player'>
      <View className='player__screen'>
        {videoUrl ? <Video className='player__video' src={videoUrl} controls autoplay enableProgressGesture showFullscreenBtn objectFit='contain' poster={params.poster} onPlay={onPlay} /> : <View className='player__placeholder'>{loading ? <Loading text='正在获取播放源…' /> : <Text>选择剧集和线路后播放</Text>}</View>}
      </View>
      <ErrorState message={error} />
      <View className='safe player__info'><Text className='player__title'>{params.name}</Text><Text className='muted'>{episode ? `第 ${episode.number} 集 · ${selection?.category?.toUpperCase() || ''} ${selection?.server.serverName || ''}` : '加载剧集…'}</Text></View>
      {!!allServers.length && <View className='safe player__section'><Text className='player__section-title'>播放线路</Text><View className='server-list'>{allServers.map(({ category, server }) => <View key={`${category}-${server.serverName}`} className={`server-chip ${selection?.category === category && selection?.server.serverName === server.serverName ? 'is-active' : ''}`} onClick={() => selectServer(server, category)}>{category.toUpperCase()} · {server.serverName}</View>)}</View></View>}
      <View className='player__section'><Text className='player__section-title safe'>剧集列表（{episodes?.totalEpisodes || 0}）</Text><ScrollView scrollY className='episode-scroll'><View className='episode-grid'>{(episodes?.episodes || []).map((item) => <View className={`episode-item ${episode?.episodeId === item.episodeId ? 'is-active' : ''}`} key={item.episodeId} onClick={() => selectEpisode(item)}>{item.number}</View>)}</View></ScrollView></View>
    </View>
  )
}
