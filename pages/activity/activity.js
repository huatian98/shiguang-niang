const app = getApp()

Page({
  data: {
    statusBarHeight: 20
  },
  onLoad() {
    this.setData({ statusBarHeight: app.globalData.statusBarHeight || 20 })
  }
})
