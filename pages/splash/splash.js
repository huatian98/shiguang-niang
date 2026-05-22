const app = getApp()

Page({
  data: {
    statusBarHeight: 20,
    progress: 0
  },

  onLoad() {
    this.setData({ statusBarHeight: app.globalData.statusBarHeight || 20 })

    // 进度条:1.8 秒走满
    const total = 1800
    const step = 60
    let elapsed = 0
    this.timer = setInterval(() => {
      elapsed += step
      this.setData({ progress: Math.min(100, Math.round(elapsed / total * 100)) })
    }, step)

    // 2 秒后自动跳首页(给进度条 200ms 缓冲)
    this.jumpTimer = setTimeout(() => {
      this.goHome()
    }, 2000)
  },

  onUnload() {
    if (this.timer) clearInterval(this.timer)
    if (this.jumpTimer) clearTimeout(this.jumpTimer)
  },

  onSkip() {
    this.goHome()
  },

  goHome() {
    if (this.timer) clearInterval(this.timer)
    if (this.jumpTimer) clearTimeout(this.jumpTimer)
    wx.switchTab({ url: '/pages/home/home' })
  }
})
