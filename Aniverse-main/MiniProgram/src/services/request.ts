import Taro from '@tarojs/taro'

const rawBaseUrl = process.env.TARO_APP_API_BASE_URL || 'http://127.0.0.1:6789'
export const API_BASE_URL = rawBaseUrl.replace(/\/$/, '')

interface RequestOptions<TBody> {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: TBody
  token?: string
}

export async function request<TResponse, TBody = Record<string, unknown>>(
  path: string,
  options: RequestOptions<TBody> = {},
): Promise<TResponse> {
  try {
    const response = await Taro.request<TResponse>({
      url: `${API_BASE_URL}${path}`,
      method: options.method || 'GET',
      data: options.data,
      timeout: 20000,
      header: {
        'content-type': 'application/json',
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
    })
    if (response.statusCode < 200 || response.statusCode >= 300) {
      const body = response.data as { message?: string }
      throw new Error(body?.message || `请求失败（${response.statusCode}）`)
    }
    return response.data
  } catch (error) {
    const message = error instanceof Error ? error.message : '网络连接失败'
    throw new Error(message.includes('request:fail') ? '无法连接服务器，请检查 API 地址和小程序域名配置' : message)
  }
}

export interface ApiEnvelope<T> { success: boolean; data: { data: T }; message?: string }
export const unwrap = <T>(payload: ApiEnvelope<T>): T => payload.data.data
