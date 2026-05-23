const app = getApp()
const api = require('../../utils/api')

const STATUS_MAP = {
  pending:   { code: 'sleeping', text: '待支付' },
  cancelled: { code: 'sleeping', text: '已取消' },
  refunded:  { code: 'sleeping', text: '已退款' }
}

function deriveAgingStatus(days, rawStatus) {
  if (rawStatus === 'completed') return { code: 'ready', text: '待开启' }
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
    showNoticeBar: false,
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
      let defaultClaimId = 0
      let hasProcessing = false
      try {
        const dashboard = await api.homeDashboard()
        if (dashboard && dashboard.claim) defaultClaimId = dashboard.claim.id
        if (dashboard && dashboard.state === 'processing') hasProcessing = true
      } catch (_) {}

      const list = await api.claimList()
      const claims = (Array.isArray(list) ? list : []).map(c => {
        const days = this.calcDays(c.paid_at || c.created_at)
        const stm = STATUS_MAP[c.status] || deriveAgingStatus(days, c.status)
        return {
          id: c.id,
          jarId: this.jarIdThumb(c.jar_id),
          code: this.codeFromJar(c.jar_id),
          series: '十摊系列',
          aging_days: days,
          status: stm.code,
          status_text: stm.text,
          is_default: defaultClaimId === c.id
        }
      })

      this.setData({
        claims,
        totalCount: claims.length,
        defaultClaimId,
        showNoticeBar: hasProcessing
      })
    } catch (e) {
      console.error('loadClaims fail', e)
      this.setData({ claims: [], totalCount: 0 })
    } finally {
      this.setData({ loading: false })
    }
  },

  codeFromJar(jarId) {
    const map = { 1: 'BQ-0827', 2: 'BQ-0901', 3: 'BQ-1024' }
    return map[jarId] || `BQ-${String(jarId).padStart(4, '0')}`
  },

  // 酒坛缩略图 ID，映射到 1~3 循环
  jarIdThumb(jarId) {
    return ((Number(jarId) - 1) % 3) + 1
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

  onViewDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/jar-detail/jar-detail?id=${id}&mode=view` })
  },

  onBack() {
    wx.navigateBack({ delta: 1, fail: () => wx.switchTab({ url: '/pages/profile/profile' }) })
  },

  onOpenJar(e) {
    const code = e.currentTarget.dataset.code
    wx.showModal({
      title: '申请开坛',
      content: `确认申请开坛 ${code}？开坛后将安排师傅现场开封，不可撤回。`,
      confirmText: '确认申请',
      cancelText: '再等等',
      confirmColor: '#A02828',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({ title: '申请已提交', icon: 'success', duration: 1500 })
        }
      }
    })
  },

  async onClaimNew() {
    try {
      const list = await api.jarsAvailable(50)
      const jars = Array.isArray(list) ? list : (list && list.jars) || []
      if (!jars.length) {
        wx.showToast({ title: '暂无可认领酒坛', icon: 'none' })
        return
      }
      const picked = jars[Math.floor(Math.random() * jars.length)]
      wx.navigateTo({ url: `/pages/jar-detail/jar-detail?id=${picked.id}` })
    } catch (e) {
      wx.showToast({ title: '加载失败，请重试', icon: 'none' })
    }
  },

  onCloseNotice() {
    this.setData({ showNoticeBar: false })
  }
})
