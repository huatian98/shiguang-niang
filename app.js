App({
  globalData: {
    apiBase: 'http://47.116.139.125:8080',
    token: '',
    userInfo: null,
    currentClaimId: null,
    statusBarHeight: 20,
    lastClaimSuccess: null  // payment → home 的支付成功消息载体
  },

  onLaunch() {
    try {
      const sysInfo = wx.getSystemInfoSync()
      this.globalData.statusBarHeight = sysInfo.statusBarHeight || 20
    } catch (e) {}
    this.globalData.token = wx.getStorageSync('token') || ''
  }
})
