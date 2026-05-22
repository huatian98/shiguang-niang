const app = getApp()
const api = require('../../utils/api')

// 兜底状态映射(只用在 pending/cancelled/refunded 等非陈酿态)
const STATUS_MAP = {
  pending:   { code: 'sleeping', text: '待支付' },
  cancelled: { code: 'sleeping', text: '已取消' },
  refunded:  { code: 'sleeping', text: '已退款' }
}

// 按陈酿天数推断业务状态:支付完进入"入窖准备中",再演进
function deriveAgingStatus(days, rawStatus) {
  if (rawStatus === 'completed') return { code: 'ready', text: '已开坛' }
  if (days < 7)   return { code: 'active',   text: '入窖准备中' }
  if (days < 30)  return { code: 'active',   text: '初醒发酵中' }
  if (days < 90)  return { code: 'active',   text: '活跃发酵中' }
  if (days < 180) return { code: 'sleeping', text: '风味沉淀中' }
  if (days < 365) return { code: 'sleeping', text: '安心沉睡中' }
  return { code: 'ready', text: '待开启' }
}

Page({
  data: {
    statusBarHeight: 20,
    claims: [],
    totalCount: 0,
    showNoticeBar: true,
    loading: false,
    defaultClaimId: 0
  },

  onLoad() {
    this.setData({ statusBarHeight: app.globalData.statusBarHeight || 20 })
    this.tryEnsureLogin()
  },

  onShow() {
    this.loadClaims()
  },

  async tryEnsureLogin() {
    if (app.globalData.token) return
    try {
      const res = await api.wxLogin('demo_001')
      if (res && res.token) {
        app.globalData.token = res.token
        app.globalData.userInfo = res.user
        wx.setStorageSync('token', res.token)
      }
    } catch (e) {
      console.error('login fail', e)
    }
  },

  async loadClaims() {
    if (this.data.loading) return
    this.setData({ loading: true })

    try {
      // 顺手获取一下当前用户默认 claim,用来打 "首页展示" 徽章
      let defaultClaimId = 0
      try {
        const dashboard = await api.homeDashboard()
        if (dashboard && dashboard.claim) defaultClaimId = dashboard.claim.id
      } catch (_) {}

      const list = await api.claimList()
      const claims = (Array.isArray(list) ? list : []).map(c => {
        const days = this.calcDays(c.paid_at || c.created_at)
        // pending/cancelled/refunded 走兜底,其他按陈酿天数推断
        const stm = STATUS_MAP[c.status] || deriveAgingStatus(days, c.status)
        return {
          id: c.id,
          code: this.codeFromJar(c.jar_id),
          series: '十摊系列',
          cellar: this.cellarFromId(c.cellar_id),
          aging_days: days,
          status: stm.code,
          status_text: stm.text,
          is_default: defaultClaimId === c.id
        }
      })
      this.setData({
        claims,
        totalCount: claims.length,
        defaultClaimId
      })
    } catch (e) {
      console.error('loadClaims fail', e)
      // 没认领单时显示空状态
      this.setData({ claims: [], totalCount: 0 })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 后端 claims 接口只返回 jar_id 数字,映射成酒坛编号
  codeFromJar(jarId) {
    const map = { 1: 'BQ-0827', 2: 'BQ-0901', 3: 'BQ-1024' }
    return map[jarId] || `BQ-${String(jarId).padStart(4, '0')}`
  },

  cellarFromId(cellarId) {
    const map = { 1: '四平村古窖藏', 2: '云岭古窖', 3: '终南山藏' }
    return map[cellarId] || '酒窖'
  },

  calcDays(isoStr) {
    if (!isoStr) return 0
    try {
      const t = new Date(isoStr).getTime()
      return Math.max(0, Math.floor((Date.now() - t) / (24 * 3600 * 1000)))
    } catch (e) { return 0 }
  },

  async onSetDefault(e) {
    const id = e.currentTarget.dataset.id
    try {
      await api.claimSetDefault(id)
      const claims = this.data.claims.map(c => ({ ...c, is_default: c.id === id }))
      this.setData({ claims, defaultClaimId: id })
      wx.showToast({ title: '已设为首页展示', icon: 'success' })
    } catch (err) {
      wx.showToast({ title: '设置失败', icon: 'none' })
    }
  },

  onViewDetail() {
    wx.switchTab({ url: '/pages/home/home' })
  },

  onClaimNew() {
    wx.navigateTo({ url: '/pages/jar-list/jar-list' })
  },

  onCloseNotice() {
    this.setData({ showNoticeBar: false })
  }
})
