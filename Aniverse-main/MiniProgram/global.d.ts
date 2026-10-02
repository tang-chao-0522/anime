declare namespace NodeJS {
  interface ProcessEnv {
    TARO_ENV: 'weapp' | 'h5' | 'alipay' | 'tt' | 'swan' | 'qq' | 'jd'
    TARO_APP_API_BASE_URL?: string
  }
}
