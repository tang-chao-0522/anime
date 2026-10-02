import Taro from '@tarojs/taro'
import { create } from 'zustand'
import { request } from '../services/request'
import type { User } from '../types'

const STORAGE_KEY = 'aniverse-user'
interface AuthResponse { success: boolean; data: User; message?: string }
interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
  hydrate(): void
  signIn(email: string, password: string): Promise<boolean>
  signUp(username: string, email: string, password: string): Promise<boolean>
  updateUsername(username: string): Promise<boolean>
  deleteAccount(): Promise<boolean>
  logout(): void
  clearError(): void
}

const messageOf = (error: unknown) => error instanceof Error ? error.message : '操作失败'
const save = (user: User | null) => user ? Taro.setStorageSync(STORAGE_KEY, user) : Taro.removeStorageSync(STORAGE_KEY)

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null, loading: false, error: null,
  hydrate: () => {
    try { set({ user: Taro.getStorageSync<User>(STORAGE_KEY) || null }) } catch { save(null) }
  },
  signIn: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const result = await request<AuthResponse, { email: string; password: string }>('/api/auth/signin', { method: 'POST', data: { email, password } })
      save(result.data); set({ user: result.data, loading: false }); return true
    } catch (error) { set({ error: messageOf(error), loading: false }); return false }
  },
  signUp: async (username, email, password) => {
    set({ loading: true, error: null })
    try {
      const result = await request<AuthResponse, { username: string; email: string; password: string }>('/api/auth/signup', { method: 'POST', data: { username, email, password } })
      save(result.data); set({ user: result.data, loading: false }); return true
    } catch (error) { set({ error: messageOf(error), loading: false }); return false }
  },
  updateUsername: async (username) => {
    const user = get().user
    if (!user) return false
    set({ loading: true, error: null })
    try {
      const result = await request<{ data?: Partial<User> } | Partial<User>, { username: string; userId?: string }>('/api/auth/update', { method: 'PUT', token: user.token, data: { username, userId: user.userId || user._id } })
      const data = 'data' in result && result.data ? result.data : result
      const updated = { ...user, ...data, token: user.token } as User
      save(updated); set({ user: updated, loading: false }); return true
    } catch (error) { set({ error: messageOf(error), loading: false }); return false }
  },
  deleteAccount: async () => {
    const user = get().user
    if (!user) return false
    set({ loading: true, error: null })
    try { await request('/api/auth/delete', { method: 'DELETE', token: user.token }); save(null); set({ user: null, loading: false }); return true }
    catch (error) { set({ error: messageOf(error), loading: false }); return false }
  },
  logout: () => { save(null); set({ user: null, error: null }) },
  clearError: () => set({ error: null }),
}))
