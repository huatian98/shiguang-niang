App({
  globalData: {
    apiBase: 'http://47.116.139.125:8080',
    token: '',
    userInfo: null,
    currentClaimId: null,
    statusBarHeight: 20
  },

  onLaunch() {
    try {
      const sysInfo = wx.getSystemInfoSync()
      this.globalData.statusBarHeight = sysInfo.statusBarHeight || 20
    } catch (e) {}
    this.globalData.token = wx.getStorageSync('token') || ''
  }
})
