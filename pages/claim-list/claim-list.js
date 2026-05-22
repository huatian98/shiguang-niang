const app = getApp()

const MOCK_CLAIMS = [
  {
    id: 1,
    code: 'BQ-0827',
    series: '屏南老酒',
    cellar: '四平村古窖藏',
    aging_days: 128,
    status: 'sleeping',
    status_text: '安心沉睡中',
    is_default: true
  },
  {
    id: 2,
    code: 'BQ-1102',
    series: '屏南老酒',
    cellar: '四平村古窖藏',
    aging_days: 45,
    status: 'active',
    status_text: '活跃发酵中',
    is_default: false
  },
  {
    id: 3,
    code: 'BQ-0315',
    series: '龙潭定制陈酿',
    cellar: '龙潭壹零号窖藏',
    aging_days: 365,
    status: 'ready',
    status_text: '待开启',
    is_default: false
  }
]

Page({
  data: {
    claims: [],
    totalCount: 0,
    showNoticeBar: true
  },

  onLoad() {
    this.loadMock()
  },

  onShow() {
    // 阶段 3 这里接 api.claimList()
  },

  loadMock() {
    this.setData({
      claims: MOCK_CLAIMS,
      totalCount: MOCK_CLAIMS.length
    })
  },

  onSetDefault(e) {
    const id = e.currentTarget.dataset.id
    const claims = this.data.claims.map(c => ({
      ...c,
      is_default: c.id === id
    }))
    this.setData({ claims })
    wx.showToast({ title: '已设为首页展示', icon: 'success' })
  },

  onViewDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.switchTab({ url: '/pages/home/home?demo=claimed' })
  },

  onClaimNew() {
    wx.navigateTo({ url: '/pages/jar-detail/jar-detail?id=1' })
  },

  onCloseNotice() {
    this.setData({ showNoticeBar: false })
  }
})
