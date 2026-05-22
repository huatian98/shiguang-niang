const app = getApp()
const api = require('../../utils/api')

Page({
  data: {
    statusBarHeight: 20,
    jarId: '1',
    code: '',
    series: '',
    cellar: '四坪窖藏',
    price: 1299,
    channel: 'wechat',
    paying: false
  },

  onLoad(options) {
    this.setData({ statusBarHeight: app.globalData.statusBarHeight || 20 })
    const { jarId = '1', price = '1299', code = '', series = '', cellar = '' } = options || {}
    this.setData({
      jarId,
      price: Number(price) || 1299,
      code: code || 'BQ-0827',
      series: decodeURIComponent(series || '十摊7春分系列'),
      cellar: decodeURIComponent(cellar || '四坪窖藏')
    })
  },

  onBack() {
    wx.navigateBack({ delta: 1 })
  },

  onSelectChannel(e) {
    this.setData({ channel: e.currentTarget.dataset.channel })
  },

  async onPay() {
    if (this.data.paying) return
    this.setData({ paying: true })

    wx.showLoading({ title: '创建订单', mask: true })

    try {
      // 1. 创建认领单
      const claim = await api.claimCreate({
        jar_id: Number(this.data.jarId),
        applicant_name: (app.globalData.userInfo && app.globalData.userInfo.nickname) || '酒友',
        contact_phone: '138 **** 5678'
      })

      wx.hideLoading()
      wx.showLoading({ title: '支付中', mask: true })

      // 2. 模拟支付
      await api.mockPay(claim.id)

      wx.hideLoading()

      // 标记给 home onShow,弹庆祝提示
      app.globalData.lastClaimSuccess = {
        code: this.data.code,
        at: Date.now()
      }

      // 3. 用 switchTab 切到首页 Tab(无白屏闪烁,home 自动 onShow 重拉)
      wx.switchTab({
        url: '/pages/home/home',
        success: () => {
          // 兜底:如果 home onShow 没接住,这里再 toast 一次
          setTimeout(() => {
            if (app.globalData.lastClaimSuccess) {
              wx.showToast({ title: '认领成功', icon: 'success', duration: 1200 })
              app.globalData.lastClaimSuccess = null
            }
          }, 300)
        },
        fail: () => {
          wx.reLaunch({ url: '/pages/home/home' })
        }
      })
    } catch (e) {
      wx.hideLoading()
      console.error('pay fail', e)
      const msg = (e && e.message) || '支付失败,请重试'
      wx.showModal({ title: '提示', content: msg, showCancel: false, confirmColor: '#A02828' })
      this.setData({ paying: false })
    }
  }
})
