const app = getApp()

// 假数据(阶段 3 会换成接口数据)
const MOCK_HOME_A = {
  sample_jar: { code: 'BQ-0827', name: '样坛·古法红曲', cellar_temp: 19.2, cellar_humidity: 74 },
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

const MOCK_HOME_B = {
  jar: { code: 'BQ-0827', alias: '红曲之灵', cellar_name: '龙潭壹零号窖藏', cellar_addr: '福建省屏南县' },
  aging_days: 128,
  metrics: {
    wine_ph: 4.52,
    ph_status: '稳定',
    in_cellar_temp: 18.5,
    in_cellar_humidity: 78,
    out_cellar_temp: 24,
    out_cellar_humidity: 65,
    breathing_state: '风味沉淀中',
    ai_narrative: '当前"红曲之灵"正处于舒适的慢呼吸状态,呼吸均匀,风味平稳积累中。'
  },
  timeline: [
    { date: '2025.10.12', title: '浸米与蒸煮', desc: '选用上等糯米,在山泉水中浸泡一昼夜,蒸煮至颗粒蓬松。', status: 'done' },
    { date: '2025.10.15', title: '落缸发酵', desc: '拌入古法红曲,让菌群在陶罐中焕发生机。', status: 'done' },
    { date: '当前阶段', title: '长年窖藏', desc: '避光、恒温、恒湿。时间是最好的酿酒师,酒体正在静化。', status: 'active' },
    { date: '预计 2026 秋季', title: '开坛品鉴', desc: '待酒香扑鼻,邀君共饮。', status: 'lock' }
  ],
  components: [
    { name: '必需氨基酸', desc: '黄酒含 18 种氨基酸,其中 8 种为人体必需', emoji: '🟢' },
    { name: '活性多酚', desc: '具有显著的抗氧化与心血管保护功效', emoji: '🟡' },
    { name: '低聚糖', desc: '促进肠道益生菌繁殖,改善消化', emoji: '🔵' },
    { name: '麦角甾醇', desc: '红曲特有,可调节胆固醇代谢', emoji: '🟣' }
  ]
}

Page({
  data: {
    state: 'not_claimed',  // 'not_claimed' | 'claimed'
    statusBarHeight: 20,
    // A 状态数据
    sampleJar: null,
    availableCount: 0,
    craftSteps: [],
    // B 状态数据
    jar: null,
    agingDays: 0,
    metrics: null,
    timeline: [],
    components: []
  },

  onLoad(options) {
    this.setData({ statusBarHeight: app.globalData.statusBarHeight || 20 })
    // url 带 ?demo=claimed 强制切 B 状态预览
    const isDemoClaimed = options && options.demo === 'claimed'
    this.loadMock(isDemoClaimed ? 'claimed' : 'not_claimed')
  },

  onShow() {
    // 阶段 3 这里接 dashboard 接口
  },

  loadMock(state) {
    if (state === 'claimed') {
      this.setData({
        state: 'claimed',
        jar: MOCK_HOME_B.jar,
        agingDays: MOCK_HOME_B.aging_days,
        metrics: MOCK_HOME_B.metrics,
        timeline: MOCK_HOME_B.timeline,
        components: MOCK_HOME_B.components
      })
    } else {
      this.setData({
        state: 'not_claimed',
        sampleJar: MOCK_HOME_A.sample_jar,
        availableCount: MOCK_HOME_A.available_count,
        craftSteps: MOCK_HOME_A.craft_steps
      })
    }
  },

  onClaimCTA() {
    wx.navigateTo({ url: '/pages/jar-detail/jar-detail?id=1' })
  },

  onAITap() {
    if (!this.data.metrics) return
    wx.showModal({
      title: 'AI 醒酒师',
      content: this.data.metrics.ai_narrative,
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

  // 切到已认领状态预览(开发期临时按钮)
  onTogglePreview() {
    const next = this.data.state === 'claimed' ? 'not_claimed' : 'claimed'
    this.loadMock(next)
  }
})
