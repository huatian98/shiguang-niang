const app = getApp()
const api = require('../../utils/api')

Page({
  data: {
    statusBarHeight: 20,
    jarId: '1',
    code: '',
    series: '',
    price: 1299,
    channel: 'wechat',
    paying: false
  },

  onLoad(options) {
    this.setData({ statusBarHeight: app.globalData.statusBarHeight || 20 })
    const { jarId = '1', price = '1299', code = '', series = '' } = options || {}
    this.setData({
      jarId,
      price: Number(price) || 1299,
      code: code || 'BQ-0827',
      series: decodeURIComponent(series || '十摊7春分系列')
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
      wx.showToast({ title: '支付成功', icon: 'success', duration: 1200 })

      // 3. 1.2 秒后跳已认领首页(用户 default_claim_id 已被服务端设置,不用 demo 参数)
      setTimeout(() => {
        wx.reLaunch({ url: `/pages/home/home` })
      }, 1200)
    } catch (e) {
      wx.hideLoading()
      console.error('pay fail', e)
      const msg = (e && e.message) || '支付失败,请重试'
      wx.showModal({ title: '提示', content: msg, showCancel: false, confirmColor: '#A02828' })
      this.setData({ paying: false })
    }
  }
})
