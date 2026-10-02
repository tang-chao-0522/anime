import Taro from '@tarojs/taro'
import { Image, Text, View } from '@tarojs/components'
import type { AnimeCard as AnimeCardType } from '../types'
import { useAuthStore } from '../stores/auth'
import { useLibraryStore } from '../stores/library'
import './AnimeCard.scss'

interface Props { anime: AnimeCardType; compact?: boolean }

export default function AnimeCard({ anime, compact = false }: Props) {
  const user = useAuthStore((state) => state.user)
  const favorites = useLibraryStore((state) => state.favorites)
  const toggle = useLibraryStore((state) => state.toggle)
  const liked = favorites.some((item) => String(item.id) === String(anime.id))

  const open = () => Taro.navigateTo({ url: `/pages/detail/index?id=${encodeURIComponent(anime.id)}` })
  const favorite = async (event: { stopPropagation(): void }) => {
    event.stopPropagation()
    if (!user) return Taro.navigateTo({ url: '/pages/auth/index' })
    const ok = await toggle('favorites', anime)
    if (ok) Taro.showToast({ title: liked ? '已取消收藏' : '已收藏', icon: 'success' })
  }

  return (
    <View className={`anime-card ${compact ? 'anime-card--compact' : ''}`} onClick={open}>
      <View className='anime-card__poster-wrap'>
        <Image className='anime-card__poster' src={anime.poster} mode='aspectFill' lazyLoad />
        {anime.rating && <Text className='anime-card__rating'>{anime.rating}</Text>}
        <View className={`anime-card__heart ${liked ? 'is-liked' : ''}`} onClick={favorite}>{liked ? '♥' : '♡'}</View>
      </View>
      <Text className='anime-card__name'>{anime.name || anime.title}</Text>
      <View className='anime-card__meta'>
        <Text>{anime.type || 'ANIME'}</Text>
        {!!anime.episodes?.sub && <Text>{anime.episodes.sub} 集</Text>}
      </View>
    </View>
  )
}
