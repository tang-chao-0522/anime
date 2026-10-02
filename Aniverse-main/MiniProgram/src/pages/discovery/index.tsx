import Taro, { useLoad, useReachBottom } from '@tarojs/taro'
import { Text, View } from '@tarojs/components'
import { useState } from 'react'
import { useAnimeStore } from '../../stores/anime'
import AnimeGrid from '../../components/AnimeGrid'
import Loading from '../../components/Loading'
import ErrorState from '../../components/ErrorState'

type Kind = 'category' | 'genre' | 'producer'
export default function DiscoveryPage() {
  const [params, setParams] = useState<{ kind: Kind; name: string }>({ kind: 'category', name: 'most-popular' })
  const { listing, loading, loadingMore, error, loadListing } = useAnimeStore()
  useLoad((options) => {
    const next = { kind: (options.kind || 'category') as Kind, name: decodeURIComponent(options.name || 'most-popular') }
    setParams(next); Taro.setNavigationBarTitle({ title: next.name }); void loadListing(next.kind, next.name, 1)
  })
  useReachBottom(() => { if (listing?.hasNextPage && !loadingMore) void loadListing(params.kind, params.name, (listing.currentPage || 1) + 1) })
  return <View className='page'><Text className='section-title safe'>{params.name.replaceAll('-', ' ')}</Text><ErrorState message={error} />{loading ? <Loading /> : <AnimeGrid items={listing?.animes || []} />}{loadingMore && <Loading text='加载更多…' />}</View>
}
