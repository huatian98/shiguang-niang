const app = getApp()
const api = require('../../utils/api')

// 兜底数据(接口失败时降级用,保证页面不空白)
const FALLBACK_A = {
  sample_jar: { code: 'BQ-0827', cellar_temp: 19.2, cellar_humidity: 74 },
  available_count: 365,
  craft_steps: [
    { name: '浸米淘米', desc: '糯米浸泡 24 小时,反复淘洗去杂质', emoji: '💧' },
    { name: '蒸饭摊凉', desc: '木甑蒸饭半小时,出甑摊凉至 30°C', emoji: '🍚' },
    { name: '拌曲下缸', desc: '红曲、麦曲混匀拌入,装坛封口', emoji: '🍶' },
    { name: '前发酵', desc: '发酵 7-10 天,菌群活跃产酒', emoji: '🌾' },
    { name: '入窖陈酿', desc: '搬入古窖,慢呼吸 180 天以上', emoji: '🏛' },
    { name: '过滤装坛', desc: '压榨过滤后入小坛密封,等候开坛', emoji: '🍷' }
  ]
}

// 工序 emoji 映射(后端返回 name,前端拼 emoji)
const STEP_EMOJI = ['💧', '🍚', '🍶', '🌾', '🏛', '🍷', '✨', '🌿']

// 成分 emoji 映射
const COMP_EMOJI_BY_NAME = {
  '氨基酸': '🟢',
  '多酚类': '🟡',
  '低聚糖': '🔵',
  '麦角甾醇': '🟣'
}

Page({
  data: {
    state: 'not_claimed',
    statusBarHeight: 20,
    forceDemo: false,        // url ?demo=claimed 强制 B 状态预览
    loading: false,

    sampleJar: FALLBACK_A.sample_jar,
    availableCount: 0,
    craftSteps: FALLBACK_A.craft_steps,

    jar: null,
    agingDays: 0,
    metrics: null,
    timeline: [],
    components: []
  },

  onLoad(options) {
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight || 20,
      forceDemo: options && options.demo === 'claimed'
    })
  },

  onShow() {
    this.ensureLoginThenLoad()
  },

  // 1. 确保已登录(没 token 就模拟登录),再拉数据
  async ensureLoginThenLoad() {
    if (this.data.loading) return
    this.setData({ loading: true })

    try {
      if (!app.globalData.token) {
        const res = await api.wxLogin('demo_001').catch(() => null)
        if (res && res.token) {
          app.globalData.token = res.token
          app.globalData.userInfo = res.user
          wx.setStorageSync('token', res.token)
        }
      }

      if (this.data.forceDemo) {
        await this.loadDashboardForceB()
      } else {
        await this.loadDashboard()
      }
    } finally {
      this.setData({ loading: false })
    }
  },

  // 拉首页核心数据(根据登录用户 default_claim_id 决定 A/B)
  async loadDashboard() {
    try {
      const data = await api.homeDashboard()
      if (data && data.state === 'claimed') {
        this.applyClaimedState(data)
      } else {
        await this.loadCellarEnv()
        this.setData({ state: 'not_claimed' })
      }
    } catch (e) {
      console.error('homeDashboard fail', e)
      await this.loadCellarEnv()
      this.setData({ state: 'not_claimed' })
    }
  },

  // 强制 B 状态预览(?demo=claimed):随便拉一坛 metrics 展示
  async loadDashboardForceB() {
    try {
      const [legacy, metrics, timeline] = await Promise.all([
        api.jarLegacy(1).catch(() => null),
        api.jarMetricsLatest(1).catch(() => null),
        api.jarTimeline(1).catch(() => [])
      ])
      const components = await api.components().catch(() => [])

      this.setData({
        state: 'claimed',
        jar: {
          code: (legacy && legacy.code) || 'BQ-0827',
          alias: '红曲之灵',
          cellar_name: (legacy && legacy.cellar) || '四平村古窖藏',
          cellar_addr: (legacy && legacy.address) || '福建省宁德市屏南县'
        },
        agingDays: 128,
        metrics: metrics || this.fallbackMetrics(),
        timeline: this.formatTimeline(timeline),
        components: this.formatComponents(components)
      })
    } catch (e) {
      console.error('loadDashboardForceB fail', e)
    }
  },

  // 接 dashboard 返回的 claimed 数据
  applyClaimedState(d) {
    const claim = d.claim || {}
    const jar = d.jar || {}
    const cellar = d.cellar || {}
    const series = d.series || {}

    this.setData({
      state: 'claimed',
      jar: {
        code: jar.code || 'BQ-0827',
        alias: series.name ? series.name.split('·')[0] : '红曲之灵',
        cellar_name: cellar.name || '',
        cellar_addr: cellar.address || ''
      },
      agingDays: d.aging_days || 0,
      metrics: d.metrics || this.fallbackMetrics(),
      timeline: this.formatTimeline(d.timelines || []),
      components: this.formatComponents(d.components || [])
    })
  },

  async loadCellarEnv() {
    try {
      const env = await api.homeCellarEnv()
      const sampleJar = {
        code: 'BQ-0827',
        cellar_temp: this.round1(env.in_cellar_temp),
        cellar_humidity: this.round1(env.in_cellar_humidity)
      }
      const craftSteps = (env.craft_steps || []).map((s, i) => ({
        name: s.name,
        desc: s.description || '',
        emoji: STEP_EMOJI[i] || '🍶'
      }))
      this.setData({
        sampleJar,
        availableCount: 365,
        craftSteps: craftSteps.length ? craftSteps : FALLBACK_A.craft_steps
      })
    } catch (e) {
      this.setData({
        sampleJar: FALLBACK_A.sample_jar,
        availableCount: FALLBACK_A.available_count,
        craftSteps: FALLBACK_A.craft_steps
      })
    }
  },

  formatTimeline(list) {
    if (!Array.isArray(list) || !list.length) return []
    return list.map(t => ({
      title: t.title,
      desc: t.description || '',
      date: this.formatDate(t.happened_at),
      status: this.timelineStatus(t)
    }))
  },

  timelineStatus(t) {
    const happened = new Date(t.happened_at).getTime()
    const now = Date.now()
    if (happened < now - 24 * 3600 * 1000) return 'done'
    if (happened > now + 24 * 3600 * 1000) return 'lock'
    return 'active'
  },

  formatComponents(list) {
    if (!Array.isArray(list)) return []
    return list.map(c => ({
      name: c.name,
      desc: c.description || '',
      emoji: COMP_EMOJI_BY_NAME[c.name] || '🟢'
    }))
  },

  formatDate(iso) {
    if (!iso) return ''
    try {
      const d = new Date(iso)
      return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
    } catch (e) { return '' }
  },

  round1(v) {
    if (v == null) return 0
    return Math.round(Number(v) * 10) / 10
  },

  fallbackMetrics() {
    return {
      wine_ph: 4.52,
      ph_status: '稳定',
      in_cellar_temp: 18.5,
      in_cellar_humidity: 78,
      out_cellar_temp: 24,
      out_cellar_humidity: 65,
      breathing_state: '风味沉淀中',
      ai_narrative: '当前"红曲之灵"正处于舒适的慢呼吸状态。'
    }
  },

  onClaimCTA() {
    wx.navigateTo({ url: '/pages/jar-detail/jar-detail?id=1' })
  },

  onAITap() {
    if (!this.data.metrics) return
    wx.showModal({
      title: 'AI 醒酒师',
      content: this.data.metrics.ai_narrative || '正在感受时光,稍后再来听它说话',
      showCancel: false,
      confirmColor: '#A02828'
    })
  },

  onTimelineTap(e) {
    const idx = e.currentTarget.dataset.idx
    const item = this.data.timeline[idx]
    if (!item) return
    wx.showModal({
      title: item.title,
      content: `${item.date}\n\n${item.desc}`,
      showCancel: false,
      confirmColor: '#A02828'
    })
  },

  onTogglePreview() {
    const next = this.data.state === 'claimed' ? 'not_claimed' : 'claimed'
    if (next === 'claimed') {
      this.setData({ forceDemo: true })
      this.loadDashboardForceB()
    } else {
      this.setData({ forceDemo: false })
      this.loadCellarEnv()
      this.setData({ state: 'not_claimed' })
    }
  }
})
