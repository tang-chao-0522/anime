import { useState } from 'react'
import { Button, Input, Text, View } from '@tarojs/components'
import { useAnimeStore } from '../../stores/anime'
import AnimeGrid from '../../components/AnimeGrid'
import Loading from '../../components/Loading'
import ErrorState from '../../components/ErrorState'
import './index.scss'

const hot = ['One Piece', 'Naruto', 'Frieren', 'Demon Slayer', 'Attack on Titan', 'Jujutsu Kaisen']

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [searched, setSearched] = useState(false)
  const { listing, loading, error, search } = useAnimeStore()
  const submit = async (value = query) => {
    const keyword = value.trim(); if (!keyword) return
    setQuery(keyword); setSearched(true); await search(keyword)
  }
  return (
    <View className='page search-page'>
      <View className='search-box'>
        <Input className='search-input' value={query} placeholder='搜索动漫名称…' placeholderClass='search-placeholder' confirmType='search' onInput={(event) => setQuery(event.detail.value)} onConfirm={() => void submit()} />
        <Button className='search-btn' onClick={() => void submit()}>搜索</Button>
      </View>
      {!searched && <View className='hot'><Text className='section-title'>热门搜索</Text><View className='hot__list'>{hot.map((item) => <View className='hot__item' key={item} onClick={() => void submit(item)}>{item}</View>)}</View></View>}
      {searched && <Text className='result-title'>“{query}” 的搜索结果</Text>}
      <ErrorState message={error} />
      {loading ? <Loading text='正在搜索…' /> : searched && <AnimeGrid items={listing?.animes || []} empty='没有找到相关动漫' />}
    </View>
  )
}
