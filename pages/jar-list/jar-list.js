const app = getApp()
const api = require('../../utils/api')

Page({
  data: {
    statusBarHeight: 20,
    list: [],
    loading: false
  },

  onLoad() {
    this.setData({ statusBarHeight: app.globalData.statusBarHeight || 20 })
    this.loadAvailable()
  },

  onShow() {
    this.loadAvailable()
  },

  onPullDownRefresh() {
    this.loadAvailable()
  },

  async loadAvailable() {
    if (this.data.loading) return
    this.setData({ loading: true })

    try {
      const list = await api.jarsAvailable(50)
      const formatted = (Array.isArray(list) ? list : []).map(j => ({
        id: j.id,
        code: j.code,
        year: j.year,
        series_name: j.series_name || '十摊系列',
        price: Number(j.base_price) || 1299,
        cellar_name: j.cellar_name || '古窖藏',
        address: j.address || ''
      }))
      this.setData({ list: formatted })
    } catch (e) {
      console.error('load available fail', e)
      this.setData({ list: [] })
    } finally {
      this.setData({ loading: false })
      wx.stopPullDownRefresh()
    }
  },

  onJarTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/jar-detail/jar-detail?id=${id}` })
  },

  onBack() {
    wx.navigateBack({ delta: 1, fail: () => wx.switchTab({ url: '/pages/home/home' }) })
  }
})
