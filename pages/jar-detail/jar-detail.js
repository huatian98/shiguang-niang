const app = getApp()
const api = require('../../utils/api')

const FALLBACK = {
  code: 'BQ-0827',
  series: '十摊7春分系列',
  cellar: '四平村古窖藏',
  address: '福建省宁德市屏南县',
  applicant: '可乐',
  phone: '138 **** 5678',
  price: 1299,
  breathing_state: '风味沉淀中'
}

// 系列名 → 价格映射(后端老接口没返回价格,先按系列 id 推断)
const PRICE_BY_ID = { '1': 1299, '2': 1499, '3': 1899 }

Page({
  data: {
    statusBarHeight: 20,
    jarId: '1',
    code: '',
    series: '',
    cellar: '',
    address: '',
    applicant: '',
    phone: '',
    price: 1299,
    breathingState: '',
    loading: false
  },

  onLoad(options) {
    this.setData({ statusBarHeight: app.globalData.statusBarHeight || 20 })
    const id = (options && options.id) || '1'
    this.setData({ jarId: id })
    this.loadAll(id)
  },

  async loadAll(id) {
    this.setData({ loading: true })
    wx.showLoading({ title: '加载中', mask: true })

    try {
      const [legacy, metrics] = await Promise.all([
        api.jarLegacy(id).catch(() => null),
        api.jarMetricsLatest(id).catch(() => null)
      ])

      this.setData({
        code: (legacy && legacy.code) || FALLBACK.code,
        series: (legacy && legacy.series) || FALLBACK.series,
        cellar: (legacy && legacy.cellar) || FALLBACK.cellar,
        address: (legacy && legacy.address) || FALLBACK.address,
        applicant: (legacy && legacy.applicant) || FALLBACK.applicant,
        phone: (legacy && legacy.phone) || FALLBACK.phone,
        price: PRICE_BY_ID[id] || FALLBACK.price,
        breathingState: (metrics && metrics.breathing_state) || FALLBACK.breathing_state
      })
    } catch (e) {
      console.error('jar-detail loadAll fail', e)
      this.applyFallback()
    } finally {
      wx.hideLoading()
      this.setData({ loading: false })
    }
  },

  applyFallback() {
    this.setData({
      code: FALLBACK.code,
      series: FALLBACK.series,
      cellar: FALLBACK.cellar,
      address: FALLBACK.address,
      applicant: FALLBACK.applicant,
      phone: FALLBACK.phone,
      price: FALLBACK.price,
      breathingState: FALLBACK.breathing_state
    })
  },

  onClose() {
    wx.navigateBack({ delta: 1, fail: () => wx.switchTab({ url: '/pages/home/home' }) })
  },

  onConfirmClaim() {
    wx.navigateTo({
      url: `/pages/payment/payment?jarId=${this.data.jarId}&price=${this.data.price}&code=${this.data.code}&series=${encodeURIComponent(this.data.series)}`
    })
  },

  onBackHome() {
    wx.switchTab({ url: '/pages/home/home' })
  }
})
