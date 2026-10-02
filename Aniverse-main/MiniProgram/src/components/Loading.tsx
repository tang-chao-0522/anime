import { View, Text } from '@tarojs/components'

export default function Loading({ text = '加载中…' }: { text?: string }) {
  return <View className='loading'><Text>{text}</Text></View>
}
