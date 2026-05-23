const app = getApp()
const api = require('../../utils/api')

// 8 道古法工序(横滑卡片用)
const CRAFT_STEPS = [
  { label: '浸米淘米', image: '/images/craft/01-jinmi.png',     desc: '择吉日,取清泉,浸润糯米颗粒饱满。' },
  { label: '蒸饭摊凉', image: '/images/craft/02-zhengfan.png',  desc: '釜中生烟,饭粒晶莹,文火慢蒸出甑摊凉。' },
  { label: '拌曲下缸', image: '/images/craft/03-banqu.png',     desc: '红曲麦曲均匀拌入,菌群悄然苏醒。' },
  { label: '前发酵',   image: '/images/craft/04-fajiao.png',    desc: '入缸发酵 7 至 10 日,糖化产酒同步进行。' },
  { label: '压榨过滤', image: '/images/craft/05-yazha.png',     desc: '酒液与酒糟分离,初尝甘醇。' },
  { label: '装坛封口', image: '/images/craft/06-zhuangtan.png', desc: '澄清酒液装入酒坛,竹叶黄泥密封坛口。' },
  { label: '煴酒杀菌', image: '/images/craft/07-yunjiu.png',    desc: '暗火堆房,谷壳缓燃,为黄酒杀菌消毒。' },
  { label: '入窖陈酿', image: '/images/craft/08-jiaocang.png',  desc: '暗处静养,微生物欢歌,酒香悄然孕育。' }
]

// 兜底数据
const FALLBACK_A = {
  sample_jar: { code: 'BQ-0827', cellar_temp: 19.2, cellar_humidity: 74, cellar_ph: 6.7 },
  available_count: 365
}

const FALLBACK_TIMELINE = [
  { title: '谷壳煴酒', description: '暗火堆房，谷壳缓燃，为黄酒完成最后的杀菌定型。', happened_at: new Date(Date.now() - 3 * 86400000).toISOString() },
  { title: '陈年窖藏', description: '时间是最好的酿酒师，酒体正在醇化。', happened_at: new Date(Date.now()).toISOString() },
  { title: '开坛品鉴', description: '静候成熟。', happened_at: new Date(Date.now() + 365 * 86400000).toISOString() }
]

const FALLBACK_COMPONENTS = [
  { name: '氨基酸', description: '黄酒含有 18 种氨基酸，其中 8 种是人体必需氨基酸' },
  { name: '多酚类', description: '抗氧化活性物质，有助于延缓衰老' },
  { name: '低聚糖', description: '促进肠道益生菌繁殖，改善消化' },
  { name: '麦角甾醇', description: '红曲特有，可调节胆固醇代谢' }
]

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
    forceDemo: false,
    loading: false,

    // A 状态
    sampleJar: FALLBACK_A.sample_jar,
    availableCount: FALLBACK_A.available_count,
    craftSteps: CRAFT_STEPS,
    currentYear: new Date().getFullYear(),

    // 5 圆环指标(数值 + 进度百分比 0~100)
    tempPercent: 64,
    humidPercent: 74,
    luxPercent: 32,
    luxValue: 120,
    rotatePercent: 18,
    rotateValue: 5,
    alcPercent: 42,
    alcValue: 14,

    jar: null,
    agingDays: 0,
    metrics: null,
    jarStateImg: '/images/jar-states/state-normal.png',
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

    // 支付成功后跳过来,弹庆祝提示
    if (app.globalData.lastClaimSuccess) {
      const success = app.globalData.lastClaimSuccess
      app.globalData.lastClaimSuccess = null
      setTimeout(() => {
        wx.showModal({
          title: '认领成功 🎉',
          content: `编号 ${success.code} 已成功入窖,即将开启它的时光之旅。`,
          showCancel: false,
          confirmText: '查看',
          confirmColor: '#A02828'
        })
      }, 600)
    }
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

  // 强制 B 状态预览(?demo=claimed)
  async loadDashboardForceB() {
    try {
      const [legacy, metrics, timeline] = await Promise.all([
        api.jarLegacy(1).catch(() => null),
        api.jarMetricsLatest(1).catch(() => null),
        api.jarTimeline(1).catch(() => [])
      ])
      const components = await api.components().catch(() => [])
      const m = metrics || this.fallbackMetrics()
      const { img, jarState } = this.resolveJarState(m)

      this.setData({
        state: 'claimed',
        jar: {
          code: (legacy && legacy.code) || 'BQ-0827',
          series: (legacy && legacy.series) || '惊蛰系列',
          cellar_name: (legacy && legacy.cellar) || '四平村古窖藏',
          cellar_addr: (legacy && legacy.address) || '福建省宁德市屏南县'
        },
        agingDays: 128,
        metrics: m,
        jarStateImg: img,
        jarState,
        timeline: this.formatTimeline(timeline),
        components: this.formatComponents(components)
      })
    } catch (e) {
      console.error('loadDashboardForceB fail', e)
    }
  },

  // 根据指标推断酒坛状态,返回 {img, jarState}
  resolveJarState(metrics) {
    if (!metrics) return { img: '/images/jar-states/state-normal.png', jarState: 'normal' }
    if (metrics.ph_status === '偏高') return { img: '/images/jar-states/state-acid.png', jarState: 'acid' }
    const bs = metrics.breathing_state || ''
    if (bs.includes('沉睡') || bs.includes('休眠')) return { img: '/images/jar-states/state-sleep.png', jarState: 'sleep' }
    return { img: '/images/jar-states/state-normal.png', jarState: 'normal' }
  },

  // 兼容旧调用
  jarStateImg(metrics) {
    return this.resolveJarState(metrics).img
  },

  // 接 dashboard 返回的 claimed 数据
  applyClaimedState(d) {
    const jar = d.jar || {}
    const cellar = d.cellar || {}
    const series = d.series || {}
    const metrics = d.metrics || this.fallbackMetrics()
    const { img, jarState } = this.resolveJarState(metrics)

    this.setData({
      state: 'claimed',
      jar: {
        code: jar.code || 'BQ-0827',
        series: series.name || '惊蛰系列',
        cellar_name: cellar.name || '',
        cellar_addr: cellar.address || ''
      },
      agingDays: d.aging_days || 0,
      metrics,
      jarStateImg: img,
      jarState,
      timeline: this.formatTimeline(d.timelines || []),
      components: this.formatComponents(d.components || [])
    })
  },

  async loadCellarEnv() {
    try {
      const env = await api.homeCellarEnv()
      const inTemp = this.round1(env.in_cellar_temp)
      const inHum = this.round1(env.in_cellar_humidity)
      const winePh = this.round1(env.wine_ph)
      this.setData({
        sampleJar: {
          code: 'BQ-0827',
          cellar_temp: inTemp,
          cellar_humidity: inHum,
          cellar_ph: winePh
        },
        // 圆环进度按合理区间换算成 0~100 百分比
        tempPercent: Math.min(100, Math.max(0, Math.round((inTemp - 10) * 5))),  // 10~30°C 映射 0~100
        humidPercent: Math.min(100, Math.max(0, Math.round(inHum)))               // 0~100% 直接用
        // luxPercent / rotatePercent / alcPercent 保持初始假数据,后端没数据
      })
    } catch (e) {
      this.setData({
        sampleJar: FALLBACK_A.sample_jar,
        availableCount: FALLBACK_A.available_count
      })
    }
  },

  formatTimeline(list) {
    const src = (Array.isArray(list) && list.length) ? list : FALLBACK_TIMELINE
    const now = Date.now()

    // 先按时间排序
    const sorted = [...src].sort((a, b) => new Date(a.happened_at) - new Date(b.happened_at))

    // 分出"过去/未来"
    const past = sorted.filter(t => new Date(t.happened_at).getTime() <= now)
    const future = sorted.filter(t => new Date(t.happened_at).getTime() > now)

    const items = [
      ...past.map((t, i) => ({
        title: t.title,
        desc: t.description || '',
        date: this.formatDate(t.happened_at),
        // 最后一条过去项为 active，其余 done
        status: i === past.length - 1 ? 'active' : 'done'
      })),
      ...future.map(t => ({
        title: t.title,
        desc: t.description || '',
        date: this.formatDate(t.happened_at),
        status: 'lock'
      }))
    ]

    // 始终确保最后一项"开坛品鉴"存在
    const hasJianjian = items.some(i => i.title.includes('开坛'))
    if (!hasJianjian) {
      items.push({ title: '开坛品鉴', desc: '静候成熟。', date: '', status: 'lock' })
    }
    return items
  },

  timelineStatus(t) {
    const happened = new Date(t.happened_at).getTime()
    const now = Date.now()
    if (happened < now - 12 * 3600 * 1000) return 'done'
    if (happened > now + 12 * 3600 * 1000) return 'lock'
    return 'active'
  },

  formatComponents(list) {
    const src = (Array.isArray(list) && list.length) ? list : FALLBACK_COMPONENTS
    return src.map(c => ({
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
      ai_narrative: '窖内温湿均衡，PH 值维持在 4.52 的绝佳状态。适宜的气候正加速红曲与精米的美妙融合，酒液正在静溢中酝酿深邃香气。'
    }
  },

  async onClaimCTA() {
    wx.showLoading({ title: '寻坛中', mask: true })
    try {
      const list = await api.jarsAvailable(50)
      const available = Array.isArray(list) ? list : []
      if (!available.length) {
        wx.hideLoading()
        wx.showModal({
          title: '暂无可认领的酒坛',
          content: '所有酒坛都已被守护,期待下一批入窖',
          showCancel: false,
          confirmColor: '#A02828'
        })
        return
      }
      const picked = available[Math.floor(Math.random() * available.length)]
      wx.hideLoading()
      wx.navigateTo({ url: `/pages/jar-detail/jar-detail?id=${picked.id}` })
    } catch (e) {
      wx.hideLoading()
      console.error('onClaimCTA fail', e)
      // 兜底:网络异常时直接跳 id=1,详情页自己处理
      wx.navigateTo({ url: '/pages/jar-detail/jar-detail?id=1' })
    }
  },

  onInvite() {
    wx.showToast({ title: '邀请功能即将上线', icon: 'none' })
  },

  onBack() {
    wx.showToast({ title: '当前是首页', icon: 'none' })
  },

  onMenu() {
    wx.showToast({ title: '菜单(敬请期待)', icon: 'none' })
  },

  onNotice() {
    wx.showToast({ title: '消息中心(敬请期待)', icon: 'none' })
  },

  onCraftMore() {
    wx.showToast({ title: '工艺详情(敬请期待)', icon: 'none' })
  },

  onShareMood() {
    wx.showToast({ title: '分享心情(敬请期待)', icon: 'none' })
  },

  onDiary() {
    wx.showToast({ title: '养情手账(敬请期待)', icon: 'none' })
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
