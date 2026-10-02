import type { PropsWithChildren } from 'react'
import { useLaunch } from '@tarojs/taro'
import { useAuthStore } from './stores/auth'
import './app.scss'

export default function App({ children }: PropsWithChildren) {
  useLaunch(() => useAuthStore.getState().hydrate())
  return children
}
