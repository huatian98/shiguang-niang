const app = getApp()
const api = require('../../utils/api')

const WEIGHT_MAP = { 1: '十斤', 2: '五斤', 3: '廿斤', 4: '十斤', 5: '五斤' }
const VILLAGE_MAP = {
  1: '四坪村', 2: '北墘村', 3: '山头村', 4: '双溪村', 5: '棠口村'
}

Page({
  data: {
    statusBarHeight: 20,
    list: [],
    loading: false
  },

  onLoad() {
    this.setData({ statusBarHeight: app.globalData.statusBarHeight || 20 })
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
      const formatted = (Array.isArray(list) ? list : []).map(j => {
        const thumbIdx = ((Number(j.id) - 1) % 3) + 1
        return {
          id: j.id,
          code: j.code,
          series_name: j.series_name || '惊蛰系列',
          cellar_village: j.cellar_village || VILLAGE_MAP[Number(j.id) % 5 + 1] || '屏南县',
          weight: WEIGHT_MAP[Number(j.id) % 5 + 1] || '十斤',
          price: Number(j.base_price) || 1299,
          imgSrc: `/images/jars/jar-${thumbIdx}.png`
        }
      })
      this.setData({ list: formatted })
    } catch (e) {
      console.error('load available fail', e)
      this.setData({ list: [] })
    } finally {
      this.setData({ loading: false })
      wx.stopPullDownRefresh()
    }
  },

  onDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/jar-detail/jar-detail?id=${id}&mode=view` })
  },

  onClaim(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/jar-detail/jar-detail?id=${id}` })
  },

  onLocationTap() {
    wx.showToast({ title: '切换酒窖(敬请期待)', icon: 'none' })
  },

  onMenu() {
    wx.showToast({ title: '菜单(敬请期待)', icon: 'none' })
  },

  onNotice() {
    wx.showToast({ title: '消息中心(敬请期待)', icon: 'none' })
  }
})
