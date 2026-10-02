import { create } from 'zustand'
import { request } from '../services/request'
import { useAuthStore } from './auth'
import type { ChatMessage } from '../types'

interface ChatState {
  messages: ChatMessage[]
  loading: boolean
  error: string | null
  load(): Promise<void>
  send(content: string): Promise<void>
  clear(): Promise<void>
}

const token = () => useAuthStore.getState().user?.token
const messageOf = (error: unknown) => error instanceof Error ? error.message : '对话失败'

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [], loading: false, error: null,
  load: async () => {
    const authToken = token(); if (!authToken) return
    set({ loading: true, error: null })
    try { const result = await request<{ messages: ChatMessage[] }>('/api/ai/history', { token: authToken }); set({ messages: result.messages.filter((item) => item?.content?.trim()), loading: false }) }
    catch (error) { set({ error: messageOf(error), loading: false }) }
  },
  send: async (content) => {
    const authToken = token(); if (!authToken || !content.trim()) return
    const userMessage: ChatMessage = { id: `user-${Date.now()}`, role: 'user', content: content.trim(), timestamp: new Date().toISOString() }
    const history = get().messages
    set({ messages: [...history, userMessage], loading: true, error: null })
    try {
      const result = await request<{ reply?: string; messages?: { assistant?: ChatMessage } }, { message: string; history: ChatMessage[] }>('/api/ai/chat', { method: 'POST', token: authToken, data: { message: content.trim(), history } })
      const assistant = result.messages?.assistant || { id: `assistant-${Date.now()}`, role: 'assistant' as const, content: result.reply || '暂时没有生成回复。' }
      set((state) => ({ messages: [...state.messages, assistant], loading: false }))
    } catch (error) { set({ error: messageOf(error), loading: false }) }
  },
  clear: async () => {
    const authToken = token(); if (!authToken) return
    set({ loading: true, error: null })
    try { await request('/api/ai/history', { method: 'DELETE', token: authToken }); set({ messages: [], loading: false }) }
    catch (error) { set({ error: messageOf(error), loading: false }) }
  },
}))
