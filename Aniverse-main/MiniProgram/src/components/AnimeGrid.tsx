import { View, Text } from '@tarojs/components'
import AnimeCard from './AnimeCard'
import type { AnimeCard as AnimeCardType } from '../types'
import './AnimeGrid.scss'

export default function AnimeGrid({ items, empty = '暂无内容' }: { items: AnimeCardType[]; empty?: string }) {
  if (!items.length) return <View className='empty'><Text>{empty}</Text></View>
  return <View className='anime-grid'>{items.map((item) => <AnimeCard anime={item} key={item.id} />)}</View>
}
