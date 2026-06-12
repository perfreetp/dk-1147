export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/create/index',
    'pages/square/index',
    'pages/record/index',
    'pages/result/index',
    'pages/reflection/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#6366f1',
    navigationBarTitleText: '选择困难中心',
    navigationBarTextStyle: 'white'
  },
  tabBar: {
    color: '#94a3b8',
    selectedColor: '#6366f1',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页'
      },
      {
        pagePath: 'pages/create/index',
        text: '创建选择'
      },
      {
        pagePath: 'pages/square/index',
        text: '投票广场'
      },
      {
        pagePath: 'pages/record/index',
        text: '个人记录'
      }
    ]
  }
})
