export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/search/index',
    'pages/profile/index',
    'pages/detail/index',
    'pages/discovery/index',
    'pages/player/index',
    'pages/auth/index',
    'pages/chat/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#090a0c',
    navigationBarTitleText: 'Aniverse',
    navigationBarTextStyle: 'white',
    backgroundColor: '#090a0c',
  },
  tabBar: {
    color: '#8b8d93',
    selectedColor: '#f47521',
    backgroundColor: '#111216',
    borderStyle: 'black',
    list: [
      { pagePath: 'pages/home/index', text: '首页' },
      { pagePath: 'pages/search/index', text: '搜索' },
      { pagePath: 'pages/profile/index', text: '我的' },
    ],
  },
})
