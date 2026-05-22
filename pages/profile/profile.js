const app = getApp()

Page({
  data: {
    statusBarHeight: 20
  },
  onLoad() {
    this.setData({ statusBarHeight: app.globalData.statusBarHeight || 20 })
  },
  onComing() {
    wx.showToast({ title: '敬请期待', icon: 'none' })
  }
})
