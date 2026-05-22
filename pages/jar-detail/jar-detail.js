const app = getApp()

// 假数据(阶段 3 接口替换)
const MOCK = {
  '1': {
    code: 'BQ-0827',
    series: '十摊7春分系列',
    cellar: '四平村古窖藏',
    address: '福建省宁德市屏南县',
    applicant: '可乐',
    phone: '138 **** 5678',
    price: 1299,
    metrics: { breathing_state: '风味沉淀中' }
  },
  '2': {
    code: 'BQ-0901',
    series: '十摊9秋分系列',
    cellar: '云岭古窖',
    address: '云南省大理州云龙县',
    applicant: '小明',
    phone: '139 **** 1234',
    price: 1499,
    metrics: { breathing_state: '活跃发酵中' }
  },
  '3': {
    code: 'BQ-1024',
    series: '十摊10冬至系列',
    cellar: '终南山藏',
    address: '陕西省西安市长安区',
    applicant: '阿华',
    phone: '137 **** 9988',
    price: 1899,
    metrics: { breathing_state: '深度陈酿中' }
  }
}

Page({
  data: {
    statusBarHeight: 20,
    jarId: 1,
    code: '',
    series: '',
    cellar: '',
    address: '',
    applicant: '',
    phone: '',
    price: 0,
    breathingState: ''
  },

  onLoad(options) {
    this.setData({ statusBarHeight: app.globalData.statusBarHeight || 20 })
    const id = (options && options.id) || '1'
    this.setData({ jarId: id })
    this.loadMock(id)
  },

  loadMock(id) {
    const data = MOCK[id] || MOCK['1']
    this.setData({
      code: data.code,
      series: data.series,
      cellar: data.cellar,
      address: data.address,
      applicant: data.applicant,
      phone: data.phone,
      price: data.price,
      breathingState: data.metrics.breathing_state
    })
  },

  onClose() {
    wx.navigateBack({ delta: 1, fail: () => wx.switchTab({ url: '/pages/home/home' }) })
  },

  onConfirmClaim() {
    wx.navigateTo({
      url: `/pages/payment/payment?jarId=${this.data.jarId}&price=${this.data.price}&code=${this.data.code}&series=${encodeURIComponent(this.data.series)}`
    })
  },

  onBackHome() {
    wx.switchTab({ url: '/pages/home/home' })
  }
})
