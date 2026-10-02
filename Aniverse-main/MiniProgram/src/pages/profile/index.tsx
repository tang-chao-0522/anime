import Taro, { useDidShow } from '@tarojs/taro'
import { Button, ScrollView, Text, View } from '@tarojs/components'
import { useState } from 'react'
import { useAuthStore } from '../../stores/auth'
import { useLibraryStore } from '../../stores/library'
import AnimeGrid from '../../components/AnimeGrid'
import Loading from '../../components/Loading'
import type { AnimeCard } from '../../types'
import './index.scss'

type Tab = 'favorites' | 'watchlist' | 'history'
export default function ProfilePage() {
  const [tab, setTab] = useState<Tab>('favorites')
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const { favorites, watchlist, history, loading, load, clear } = useLibraryStore()
  useDidShow(() => { if (user) void load() })
  if (!user) return <View className='page profile-login'><View className='profile-login__icon'>A</View><Text className='profile-login__title'>登录后建立你的动漫收藏</Text><Text className='muted profile-login__sub'>同步收藏、追番列表和观看历史</Text><Button className='primary-btn profile-login__btn' onClick={() => Taro.navigateTo({ url: '/pages/auth/index' })}>登录 / 注册</Button></View>
  const logoutNow = () => { logout(); clear(); Taro.showToast({ title: '已退出登录', icon: 'none' }) }
  const historyCards: AnimeCard[] = history.map((item) => ({ id: item.animeId, name: `${item.animeName} · 第 ${item.episodeNumber} 集`, poster: item.EpisodeImage || '', type: '观看历史' }))
  const items = tab === 'favorites' ? favorites : tab === 'watchlist' ? watchlist : historyCards
  return (
    <View className='page profile'>
      <View className='profile__banner'><View className='profile__avatar'>{user.username?.charAt(0).toUpperCase()}</View><View className='profile__identity'><Text className='profile__name'>{user.username}</Text><Text className='profile__email'>{user.email}</Text></View></View>
      <View className='profile__tools'><View onClick={() => Taro.navigateTo({ url: '/pages/chat/index' })}>AI 助手</View><View onClick={logoutNow}>退出登录</View></View>
      <ScrollView scrollX showScrollbar={false} className='profile__tabs'><View className='profile__tab-row'>{([['favorites', `收藏 ${favorites.length}`], ['watchlist', `追番 ${watchlist.length}`], ['history', `历史 ${history.length}`]] as const).map(([key, label]) => <View key={key} className={`profile__tab ${tab === key ? 'is-active' : ''}`} onClick={() => setTab(key)}>{label}</View>)}</View></ScrollView>
      {loading ? <Loading /> : <AnimeGrid items={items} empty={tab === 'history' ? '还没有观看记录' : '列表还是空的'} />}
    </View>
  )
}
