const app = getApp()

Page({
  data: {
    statusBarHeight: 20,
    jarId: 1,
    loading: true,

    // 酒坛基本信息
    code: '',
    series: '',
    cellar: '',

    // 实时指标(来自 jar_metrics)
    winePh: '--',
    phStatus: '',
    inCellarTemp: '--',
    inCellarHumidity: '--',
    outCellarTemp: '--',
    outCellarHumidity: '--',
    breathingState: '',
    aiNarrative: '',
    recordedAt: ''
  },

  onLoad(options) {
    const sysInfo = wx.getSystemInfoSync()
    this.setData({ statusBarHeight: sysInfo.statusBarHeight || 20 })

    const id = parseInt(options.id) || 1
    this.setData({ jarId: id })

    this.loadAll(id)
  },

  onPullDownRefresh() {
    this.loadAll(this.data.jarId)
  },

  loadAll(id) {
    wx.showLoading({ title: '加载中', mask: true })
    Promise.all([
      this.fetchClaim(id),
      this.fetchMetrics(id)
    ]).then(() => {
      this.setData({ loading: false })
    }).catch(() => {
      this.setData({ loading: false })
    }).finally(() => {
      wx.hideLoading()
      wx.stopPullDownRefresh()
    })
  },

  // 老接口:酒坛基础信息
  fetchClaim(id) {
    return new Promise((resolve) => {
      wx.request({
        url: `${app.globalData.apiBase}/api/claim/${id}`,
        method: 'GET',
        timeout: 8000,
        success: (res) => {
          if (res.data && res.data.code === 0) {
            const d = res.data.data
            this.setData({
              code: d.code,
              series: d.series,
              cellar: d.cellar
            })
          }
          resolve()
        },
        fail: (err) => {
          console.error('fetchClaim fail', err)
          resolve()
        }
      })
    })
  },

  // 新接口:酒坛实时指标
  fetchMetrics(id) {
    return new Promise((resolve) => {
      wx.request({
        url: `${app.globalData.apiBase}/api/v1/jars/${id}/metrics/latest`,
        method: 'GET',
        success: (res) => {
          if (res.data && res.data.code === 0) {
            const m = res.data.data
            this.setData({
              winePh: Number(m.wine_ph).toFixed(2),
              phStatus: m.ph_status || '稳定',
              inCellarTemp: Number(m.in_cellar_temp).toFixed(1),
              inCellarHumidity: Math.round(m.in_cellar_humidity),
              outCellarTemp: Number(m.out_cellar_temp).toFixed(1),
              outCellarHumidity: Math.round(m.out_cellar_humidity),
              breathingState: m.breathing_state || '风味沉淀中',
              aiNarrative: m.ai_narrative || '',
              recordedAt: this.formatTime(m.recorded_at)
            })
          }
          resolve()
        },
        fail: (err) => {
          console.error('fetchMetrics fail', err)
          wx.showToast({ title: '指标加载失败', icon: 'none' })
          resolve()
        }
      })
    })
  },

  formatTime(iso) {
    if (!iso) return ''
    try {
      const d = new Date(iso)
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      const h = String(d.getHours()).padStart(2, '0')
      const mi = String(d.getMinutes()).padStart(2, '0')
      return `${m}-${day} ${h}:${mi}`
    } catch (e) {
      return ''
    }
  },

  onSwitchJar(e) {
    const id = e.currentTarget.dataset.id
    this.setData({ jarId: id, loading: true })
    this.loadAll(id)
  },

  onConfirm() {
    wx.showModal({
      title: '认领成功',
      content: `编号 ${this.data.code} 已认领,稍后将收到电子证书。`,
      showCancel: false,
      confirmColor: '#A02828'
    })
  },

  onBack() {
    wx.showToast({ title: '返回首页', icon: 'none' })
  },

  onClose() {
    wx.showToast({ title: '关闭', icon: 'none' })
  }
})
