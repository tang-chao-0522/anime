import Taro, { useLoad, useUnload } from '@tarojs/taro'
import { Image, Text, View } from '@tarojs/components'
import { useState } from 'react'
import { useAnimeStore } from '../../stores/anime'
import { useAuthStore } from '../../stores/auth'
import { useLibraryStore } from '../../stores/library'
import AnimeRail from '../../components/AnimeRail'
import Loading from '../../components/Loading'
import ErrorState from '../../components/ErrorState'
import './index.scss'

export default function DetailPage() {
  const [id, setId] = useState('')
  const { detail, loading, error, loadDetail, clearDetail } = useAnimeStore()
  const user = useAuthStore((state) => state.user)
  const favorites = useLibraryStore((state) => state.favorites)
  const watchlist = useLibraryStore((state) => state.watchlist)
  const toggle = useLibraryStore((state) => state.toggle)
  useLoad((options) => { const animeId = options.id || ''; setId(animeId); void loadDetail(animeId) })
  useUnload(clearDetail)
  const info = detail?.anime?.info
  const more = detail?.anime?.moreInfo
  const isFavorite = !!info && favorites.some((item) => String(item.id) === String(info.id))
  const inWatchlist = !!info && watchlist.some((item) => String(item.id) === String(info.id))
  const handleList = async (list: 'favorites' | 'watchlist') => {
    if (!user) return Taro.navigateTo({ url: '/pages/auth/index' })
    if (info && await toggle(list, info)) Taro.showToast({ title: '操作成功', icon: 'success' })
  }
  if (loading && !info) return <View className='page'><Loading /></View>
  if (!info) return <View className='page'><ErrorState message={error || '未找到动漫信息'} /></View>
  return (
    <View className='page detail'>
      <View className='detail__hero'>
        <Image className='detail__banner' src={info.banner || info.poster} mode='aspectFill' />
        <View className='detail__shade' />
      </View>
      <View className='detail__main'>
        <Image className='detail__poster' src={info.poster} mode='aspectFill' />
        <View className='detail__heading'>
          <Text className='detail__title'>{info.name}</Text>
          <Text className='detail__meta'>{[info.stats?.type || info.type, info.year, info.stats?.duration, info.stats?.rating || info.rating].filter(Boolean).join(' · ')}</Text>
        </View>
      </View>
      <View className='detail__actions safe'>
        <View className='primary-btn detail__watch' onClick={() => Taro.navigateTo({ url: `/pages/player/index?id=${encodeURIComponent(id)}&name=${encodeURIComponent(info.name)}&poster=${encodeURIComponent(info.poster)}` })}>▶ 开始观看</View>
        <View className={`detail__round ${isFavorite ? 'is-active' : ''}`} onClick={() => void handleList('favorites')}>{isFavorite ? '♥' : '♡'}</View>
        <View className={`detail__round ${inWatchlist ? 'is-active' : ''}`} onClick={() => void handleList('watchlist')}>{inWatchlist ? '✓' : '+'}</View>
      </View>
      <View className='detail__body safe'>
        <Text className='detail__description'>{info.description || '暂无简介'}</Text>
        <View className='detail__facts'>
          <Text>状态：{more?.status || info.status || '-'}</Text>
          <Text>工作室：{more?.studios?.join('、') || '-'}</Text>
          <Text>类型：{(more?.genres || info.genres || []).join('、') || '-'}</Text>
          <Text>来源：{more?.source || '-'}</Text>
        </View>
      </View>
      <ErrorState message={error} />
      <AnimeRail title='相关作品' items={detail.relatedAnimes} />
      <AnimeRail title='猜你喜欢' items={detail.recommendedAnimes} />
    </View>
  )
}
