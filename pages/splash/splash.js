const app = getApp()

const FRAMES = [
  { image: '/images/splash/craft-1.png',  desc: '择吉日，取清泉，将糯米在清水中浸润，待颗粒饱满方可起锅。' },
  { image: '/images/splash/craft-2.png',  desc: '釜中生烟，饭粒晶莹，文火慢蒸，出甑后摊于竹篛自然冷却。' },
  { image: '/images/splash/craft-3.png',  desc: '蒸熟后的糯米饭摊在大竹篛上，降温到适合发酵生物繁育的温度。' },
  { image: '/images/splash/craft-4.png',  desc: '将糯米饭与酒曲按照比例搅拌均匀，放入安静的酒坛中。' },
  { image: '/images/splash/craft-5.png',  desc: '入缸发酵七至十日，糖化与产酒同步进行，坛中日夜欢腾。' },
  { image: '/images/splash/craft-6.png',  desc: '酒液与酒糟分离，初尝甘醇，澄清的酒液悄然流出。' },
  { image: '/images/splash/craft-7.png',  desc: '澄清酒液装入酒坛，以竹叶裹口，黄泥密封，锁住岁月之香。' },
  { image: '/images/splash/craft-8.png',  desc: '暗火堆房中排列的酒坛，谷壳缓慢燃烧，为黄酒杀菌消毒。' },
  { image: '/images/splash/craft-9.png',  desc: '古代操作在有温度不同的环境下进行，是品评工艺的关键。' },
  { image: '/images/splash/craft-10.png', desc: '暗处静养，微生物欢歌，酒香悄然孕育，属于你的陈酿正在生长。' }
]

Page({
  data: {
    frames: FRAMES,
    currentFrame: 0
  },

  onLoad() {
    this.setData({ statusBarHeight: app.globalData.statusBarHeight || 20 })
    // 最后一帧后自动跳转
    this.exitTimer = setTimeout(() => {
      this.goHome()
    }, FRAMES.length * 3000 + 400)
  },

  onUnload() {
    if (this.exitTimer) clearTimeout(this.exitTimer)
  },

  onSwiperChange(e) {
    this.setData({ currentFrame: e.detail.current })
  },

  onSkip() {
    if (this.exitTimer) clearTimeout(this.exitTimer)
    this.goHome()
  },

  goHome() {
    wx.switchTab({ url: '/pages/home/home' })
  }
})
