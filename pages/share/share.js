const app = getApp()

const GIFT_POEMS = [
  '春水初生，春林初盛。愿此坛红曲黄酒陈酿，伴君共度岁月悠长。',
  '时光如酿，岁月生香。以此一坛，赠君千里。',
  '谷雨初霁，红曲入缸。愿这一份醇厚，陪伴你最美的时光。',
  '一坛相赠，万里情长。愿岁月如酒，越陈越香。'
]

Page({
  data: {
    statusBarHeight: 20,
    jar: { code: '', series: '', cellar_name: '', cellar_addr: '' },
    jarImg: '/images/jar-states/state-normal.png',
    senderName: '',
    avatarUrl: '/images/avatar-placeholder.png',
    giftPoem: GIFT_POEMS[0]
  },

  onLoad() {
    const home = app.globalData
    const jar = home.currentJar || {}
    const userInfo = home.userInfo || {}
    const jarId = home.currentJarId || 1
    const jarImg = `/images/jars/jar-${jarId}.png`

    this.setData({
      statusBarHeight: home.statusBarHeight || 20,
      jar: {
        code: jar.code || 'BQ-0827',
        series: jar.series || '原酿系列',
        cellar_name: jar.cellar_name || '四坪村窖藏',
        cellar_addr: jar.cellar_addr || ''
      },
      jarImg,
      senderName: userInfo.nickname || userInfo.name || '时光酿友',
      avatarUrl: userInfo.avatar_url || '/images/avatar-placeholder.png',
      giftPoem: GIFT_POEMS[Math.floor(Math.random() * GIFT_POEMS.length)]
    })
  },

  onSaveShare() {
    wx.showToast({ title: '长按图片即可保存分享', icon: 'none', duration: 2000 })
  },

  onBackHome() {
    wx.switchTab({ url: '/pages/home/home' })
  },

  onMenu() {
    wx.showToast({ title: '菜单(敬请期待)', icon: 'none' })
  },

  onProfile() {
    wx.switchTab({ url: '/pages/profile/profile' })
  }
})
