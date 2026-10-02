import { ScrollView, Text, View } from '@tarojs/components'
import AnimeCard from './AnimeCard'
import type { AnimeCard as AnimeCardType } from '../types'
import './AnimeRail.scss'

export default function AnimeRail({ title, items = [] }: { title: string; items?: AnimeCardType[] }) {
  if (!items.length) return null
  return (
    <View className='rail'>
      <Text className='rail__title'>{title}</Text>
      <ScrollView scrollX enhanced showScrollbar={false} className='rail__scroll'>
        <View className='rail__content'>{items.map((item) => <AnimeCard compact anime={item} key={item.id} />)}</View>
      </ScrollView>
    </View>
  )
}
