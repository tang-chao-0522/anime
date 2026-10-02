import { View, Text } from '@tarojs/components'

export default function ErrorState({ message }: { message?: string | null }) {
  return message ? <View className='error'><Text>{message}</Text></View> : null
}
