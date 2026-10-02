import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro'
import { Image, Swiper, SwiperItem, Text, View } from '@tarojs/components'
import { useAnimeStore } from '../../stores/anime'
import AnimeRail from '../../components/AnimeRail'
import Loading from '../../components/Loading'
import ErrorState from '../../components/ErrorState'
import './index.scss'

export default function HomePage() {
  const { home, loading, error, loadHome } = useAnimeStore()
  useDidShow(() => { if (!home) void loadHome() })
  usePullDownRefresh(async () => { await loadHome(); Taro.stopPullDownRefresh() })
  const spotlight = home?.spotlightAnimes || []

  if (loading && !home) return <View className='page'><Loading /></View>
  return (
    <View className='page home'>
      <ErrorState message={error} />
      {!!spotlight.length && (
        <Swiper className='hero' circular autoplay interval={5000} indicatorDots indicatorColor='rgba(255,255,255,.35)' indicatorActiveColor='#f47521'>
          {spotlight.slice(0, 7).map((anime) => (
            <SwiperItem key={anime.id} onClick={() => Taro.navigateTo({ url: `/pages/detail/index?id=${anime.id}` })}>
              <View className='hero__item'>
                <Image className='hero__image' src={anime.banner || anime.poster} mode='aspectFill' />
                <View className='hero__shade' />
                <View className='hero__content'>
                  <Text className='hero__eyebrow'>本季精选</Text>
                  <Text className='hero__title'>{anime.name}</Text>
                  <Text className='hero__meta'>{[anime.type, anime.year, anime.rating].filter(Boolean).join(' · ')}</Text>
                  <View className='hero__play'>▶ 查看详情</View>
                </View>
              </View>
            </SwiperItem>
          ))}
        </Swiper>
      )}
      <AnimeRail title='正在热播' items={home?.topAiringAnimes} />
      <AnimeRail title='趋势榜' items={home?.trendingAnimes} />
      <AnimeRail title='最近更新' items={home?.latestEpisodeAnimes} />
      <AnimeRail title='人气作品' items={home?.mostPopularAnimes} />
      <AnimeRail title='即将上线' items={home?.topUpcomingAnimes} />
      <View className='home__genres safe'>
        <Text className='section-title'>按类型发现</Text>
        <View className='genre-cloud'>
          {(home?.genres || []).map((genre) => <View className='genre-chip' key={genre} onClick={() => Taro.navigateTo({ url: `/pages/discovery/index?kind=genre&name=${encodeURIComponent(genre)}` })}>{genre}</View>)}
        </View>
      </View>
    </View>
  )
}
