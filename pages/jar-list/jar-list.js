const app = getApp()

const STATIC_LIST = [
  { id: 1, code: 'SP-0001', series_name: '原酿', cellar_village: '四坪村', weight: '10斤', years: '5年', price: 298 },
  { id: 2, code: 'SP-0002', series_name: '酒酿酒', cellar_village: '四坪村', weight: '5斤', years: '5年', price: 198 },
  { id: 3, code: 'SP-0003', series_name: '原酿', cellar_village: '四坪村', weight: '10斤', years: '1年', price: 198 },
  { id: 4, code: 'SP-0004', series_name: '酒酿酒', cellar_village: '四坪村', weight: '5斤', years: '1年', price: 118 }
]

Page({
  data: {
    statusBarHeight: 20,
    list: STATIC_LIST.map(j => ({ ...j, imgSrc: '/images/jars/jar-main.png' }))
  },

  onLoad() {
    this.setData({ statusBarHeight: app.globalData.statusBarHeight || 20 })
  },

  onDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/jar-detail/jar-detail?id=${id}&mode=view` })
  },

  onClaim(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/jar-detail/jar-detail?id=${id}` })
  },

  onLocationTap() {
    wx.showToast({ title: '切换酒窖(敬请期待)', icon: 'none' })
  },

  onMenu() {
    wx.showToast({ title: '菜单(敬请期待)', icon: 'none' })
  },

  onNotice() {
    wx.showToast({ title: '消息中心(敬请期待)', icon: 'none' })
  }
})
