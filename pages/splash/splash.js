const app = getApp()

const FRAMES = [
  { image: '/images/splash/craft-1.png',  desc: '择吉日，取清泉，将糯米在清水中浸润，待颗粒饱满方可起锅。' },
  { image: '/images/splash/craft-2.png',  desc: '釜中生烟，饭粒晶莹，文火慢蒸，出甑后摊于竹篛自然冷却。' },
  { image: '/images/splash/craft-3.png',  desc: '蒸熟后的糯米饭摊在大竹篛上，降温到适合发酵生物繁育的温度。' },
  { image: '/images/splash/craft-4.png',  desc: '红曲麦曲均匀拌入米饭，菌群悄然苏醒，古法酿造正式开始。' },
  { image: '/images/splash/craft-5.png',  desc: '入缸发酵七至十日，糖化与产酒同步进行，坛中日夜欢腾。' },
  { image: '/images/splash/craft-6.png',  desc: '酒液与酒糟分离，初尝甘醇，澄清的酒液悄然流出。' },
  { image: '/images/splash/craft-7.png',  desc: '澄清酒液装入酒坛，以竹叶裹口，黄泥密封，锁住岁月之香。' },
  { image: '/images/splash/craft-8.png',  desc: '暗火堆房中排列的酒坛，谷壳缓慢燃烧，为黄酒杀菌消毒。' },
  { image: '/images/splash/craft-9.png',  desc: '酒坛移入古窖，温度恒定，湿气适宜，静候时光的魔法。' },
  { image: '/images/splash/craft-10.png', desc: '暗处静养，微生物欢歌，酒香悄然孕育，属于你的陈酿正在生长。' }
]

const FRAME_DURATION = 1000

Page({
  data: {
    frames: FRAMES,
    currentFrame: 0
  },

  onLoad() {
    this.setData({ statusBarHeight: app.globalData.statusBarHeight || 20 })
    this._start()
  },

  onUnload() {
    this._clear()
  },

  _start() {
    let frame = 0
    this.frameTimer = setInterval(() => {
      frame++
      if (frame >= FRAMES.length) {
        this._clear()
        this.goHome()
        return
      }
      this.setData({ currentFrame: frame })
    }, FRAME_DURATION)
  },

  _clear() {
    if (this.frameTimer) clearInterval(this.frameTimer)
  },

  onSkip() {
    this._clear()
    this.goHome()
  },

  goHome() {
    wx.switchTab({ url: '/pages/home/home' })
  }
})
