import Taro from '@tarojs/taro'
import { Button, Input, Text, View } from '@tarojs/components'
import { useState } from 'react'
import { useAuthStore } from '../../stores/auth'
import './index.scss'

export default function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { loading, error, signIn, signUp, clearError } = useAuthStore()
  const submit = async () => {
    if (!email.trim() || !password || (mode === 'signup' && !username.trim())) return Taro.showToast({ title: '请填写完整信息', icon: 'none' })
    const ok = mode === 'signin' ? await signIn(email.trim(), password) : await signUp(username.trim(), email.trim(), password)
    if (ok) { Taro.showToast({ title: mode === 'signin' ? '登录成功' : '注册成功', icon: 'success' }); setTimeout(() => Taro.navigateBack(), 500) }
  }
  const switchMode = () => { clearError(); setMode(mode === 'signin' ? 'signup' : 'signin') }
  return (
    <View className='page auth-page'>
      <View className='auth-brand'><Text className='auth-brand__mark'>A</Text><Text className='auth-brand__name'>ANIVERSE</Text><Text className='auth-brand__sub'>连接你的动漫世界</Text></View>
      <View className='auth-card'>
        <Text className='auth-title'>{mode === 'signin' ? '欢迎回来' : '创建账号'}</Text>
        {mode === 'signup' && <Input className='auth-input' value={username} placeholder='用户名' placeholderClass='auth-placeholder' onInput={(e) => setUsername(e.detail.value)} />}
        <Input className='auth-input' value={email} type='text' placeholder='邮箱' placeholderClass='auth-placeholder' onInput={(e) => setEmail(e.detail.value)} />
        <Input className='auth-input' value={password} password placeholder='密码' placeholderClass='auth-placeholder' onInput={(e) => setPassword(e.detail.value)} />
        {!!error && <Text className='auth-error'>{error}</Text>}
        <Button className='auth-submit' loading={loading} disabled={loading} onClick={() => void submit()}>{mode === 'signin' ? '登录' : '注册'}</Button>
        <View className='auth-switch' onClick={switchMode}>{mode === 'signin' ? '没有账号？立即注册' : '已有账号？返回登录'}</View>
      </View>
    </View>
  )
}
