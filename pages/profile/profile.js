const app = getApp()
const api = require('../../utils/api')

Page({
  data: {
    statusBarHeight: 20,
    avatarText: '酿',
    nickname: '酿酒人',
    signature: '始于闽东 归于自然',
    claimDays: 0,
    claimCount: 0,
    activityCount: 0
  },

  onLoad() {
    this.setData({ statusBarHeight: app.globalData.statusBarHeight || 20 })
  },

  onShow() {
    this.loadProfile()
  },

  async loadProfile() {
    // 更新用户信息
    const userInfo = app.globalData.userInfo
    if (userInfo && userInfo.nickname) {
      this.setData({
        avatarText: userInfo.nickname.slice(0, 1),
        nickname: userInfo.nickname
      })
    }

    // 拉认领数 + 认领天数
    try {
      const list = await api.claimList()
      const claims = Array.isArray(list) ? list : []
      const count = claims.length

      // 认领天数：取最早认领单的 paid_at 到今天
      let days = 0
      if (count > 0) {
        const dates = claims
          .map(c => c.paid_at || c.created_at)
          .filter(Boolean)
          .map(d => new Date(d).getTime())
        if (dates.length) {
          const earliest = Math.min(...dates)
          days = Math.max(0, Math.floor((Date.now() - earliest) / (24 * 3600 * 1000)))
        }
      }

      this.setData({ claimCount: count, claimDays: days })
    } catch (e) {
      console.error('profile loadClaims fail', e)
    }
  },

  onMyClaims() {
    wx.navigateTo({ url: '/pages/claim-list/claim-list' })
  },

  onMyActivities() {
    wx.switchTab({ url: '/pages/activity/activity' })
  },

  onSettings() {
    wx.showToast({ title: '设置功能即将上线', icon: 'none' })
  },

  onService() {
    wx.showToast({ title: '客服功能即将上线', icon: 'none' })
  }
})
