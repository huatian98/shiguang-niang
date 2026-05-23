const app = getApp()

const ALL_EVENTS = [
  {
    id: 1,
    title: '古法红曲酿造深度体验',
    cover: '/images/activity/event-1.jpg',
    timeStr: '11月15日 - 11月17日',
    location: '屏南县·龙潭里',
    status: 'active',
    badgeType: 'hot',
    badge: '🔴 火热报名中',
    avatars: ['JD', 'ML'],
    extraCount: 12,
    category: '非遗体验'
  },
  {
    id: 2,
    title: '冬至·老酒开坛品鉴雅集',
    cover: '/images/activity/event-2.jpg',
    timeStr: '12月22日 14:00',
    location: '时光酿艺术馆',
    status: 'limited',
    badgeType: 'limit',
    badge: '名额有限',
    quote: '岁末温一壶暖冬，待君入席',
    leftCount: 3,
    category: '节庆聚会'
  },
  {
    id: 3,
    title: '春日限定：桃花里酿造节',
    cover: '/images/activity/event-3.jpg',
    timeStr: '2024年3月 - 4月',
    location: '双溪古镇',
    status: 'ended',
    badgeType: 'ended',
    badge: '已结束',
    endedDesc: '感谢 128 位酿友的参与',
    category: '田园采风'
  }
]

Page({
  data: {
    statusBarHeight: 20,
    tags: ['全部活动', '非遗体验', '田园采风', '节庆聚会'],
    activeTag: '全部活动',
    filteredEvents: ALL_EVENTS
  },

  onLoad() {
    this.setData({ statusBarHeight: app.globalData.statusBarHeight || 20 })
  },

  onTagTap(e) {
    const tag = e.currentTarget.dataset.tag
    const filtered = tag === '全部活动'
      ? ALL_EVENTS
      : ALL_EVENTS.filter(ev => ev.category === tag)
    this.setData({ activeTag: tag, filteredEvents: filtered })
  },

  onEventTap(e) {
    const id = e.currentTarget.dataset.id
    const event = ALL_EVENTS.find(ev => ev.id === id)
    if (!event) return
    if (event.status === 'ended') {
      wx.showToast({ title: '精彩回顾即将上线', icon: 'none' })
      return
    }
    wx.showModal({
      title: event.title,
      content: `📍 ${event.location}\n🕐 ${event.timeStr}\n\n点击确认进入报名页面`,
      confirmText: '立即报名',
      cancelText: '再看看',
      confirmColor: '#A02828'
    })
  },

  onCalendar() {
    wx.showToast({ title: '日历视图即将上线', icon: 'none' })
  },

  onFilter() {
    wx.showToast({ title: '筛选功能即将上线', icon: 'none' })
  },

  onMenu() {
    wx.showToast({ title: '菜单(敬请期待)', icon: 'none' })
  },

  onNotice() {
    wx.showToast({ title: '消息中心(敬请期待)', icon: 'none' })
  }
})
