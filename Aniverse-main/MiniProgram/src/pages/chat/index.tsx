import Taro, { useLoad } from '@tarojs/taro'
import { Button, ScrollView, Text, Textarea, View } from '@tarojs/components'
import { useState } from 'react'
import { useAuthStore } from '../../stores/auth'
import { useChatStore } from '../../stores/chat'
import './index.scss'

export default function ChatPage() {
  const [text, setText] = useState('')
  const user = useAuthStore((state) => state.user)
  const { messages, loading, error, load, send, clear } = useChatStore()
  useLoad(() => { if (!user) Taro.redirectTo({ url: '/pages/auth/index' }); else void load() })
  const submit = async () => { const content = text.trim(); if (!content || loading) return; setText(''); await send(content) }
  const clearAll = () => Taro.showModal({ title: '清空对话', content: '确定删除全部聊天记录吗？', success: (result) => { if (result.confirm) void clear() } })
  return (
    <View className='chat-page'>
      <View className='chat-head'><Text>可以问我推荐、剧情或角色问题</Text><Text className='chat-clear' onClick={clearAll}>清空</Text></View>
      <ScrollView scrollY scrollIntoView={`message-${messages.length - 1}`} className='chat-scroll'>
        <View className='chat-list'>
          {!messages.length && <View className='chat-welcome'><Text className='chat-welcome__mark'>AI</Text><Text>你好！告诉我你喜欢的作品，我来推荐下一部。</Text></View>}
          {messages.map((message, index) => <View id={`message-${index}`} key={message.id || message._id || index} className={`chat-message ${message.role === 'user' ? 'is-user' : 'is-ai'}`}><Text className='chat-message__role'>{message.role === 'user' ? '你' : 'ANIVERSE AI'}</Text><Text className='chat-message__content'>{message.content}</Text></View>)}
          {loading && <View className='chat-typing'>AI 正在思考…</View>}
          {!!error && <View className='chat-error'>{error}</View>}
        </View>
      </ScrollView>
      <View className='chat-composer'>
        <Textarea className='chat-input' value={text} maxlength={500} autoHeight placeholder='输入你的问题…' placeholderClass='chat-placeholder' onInput={(event) => setText(event.detail.value)} />
        <Button className='chat-send' disabled={!text.trim() || loading} onClick={() => void submit()}>发送</Button>
      </View>
    </View>
  )
}
