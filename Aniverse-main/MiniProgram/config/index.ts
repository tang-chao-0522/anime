import { defineConfig, type UserConfigExport } from '@tarojs/cli'

export default defineConfig<'webpack5'>(async (merge, { command, mode }) => {
  const base: UserConfigExport<'webpack5'> = {
    projectName: 'aniverse-mini-program',
    date: '2026-10-03',
    designWidth: 750,
    deviceRatio: { 750: 1 },
    sourceRoot: 'src',
    outputRoot: 'dist',
    framework: 'react',
    compiler: 'webpack5',
    cache: { enable: true },
    alias: { '@': require('path').resolve(__dirname, '..', 'src') },
    mini: { postcss: { pxtransform: { enable: true }, url: { enable: true }, cssModules: { enable: false } } },
    h5: { publicPath: '/', staticDirectory: 'static' },
  }
  return merge({}, base, command === 'build' ? require('./prod').default : require('./dev').default)
})
