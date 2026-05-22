const app = getApp()

Page({
  data: {
    statusBarHeight: 20,
    jarId: 1,
    code: '',
    series: '',
    price: 1299,
    channel: 'wechat',  // wechat | alipay
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
    const ch = e.currentTarget.dataset.channel
    this.setData({ channel: ch })
  },

  onPay() {
    if (this.data.paying) return
    this.setData({ paying: true })

    wx.showLoading({ title: '支付中', mask: true })

    // 模拟支付:1.5 秒后成功
    setTimeout(() => {
      wx.hideLoading()
      this.setData({ paying: false })

      wx.showToast({ title: '支付成功', icon: 'success', duration: 1200 })

      setTimeout(() => {
        // 切到首页(已认领状态)
        wx.reLaunch({ url: `/pages/home/home?demo=claimed` })
      }, 1200)
    }, 1500)
  }
})
