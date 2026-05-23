const app = getApp()

const FRAMES = [
  '/images/splash/craft-1.png',
  '/images/splash/craft-2.png',
  '/images/splash/craft-3.png',
  '/images/splash/craft-4.png',
  '/images/splash/craft-5.png',
  '/images/splash/craft-6.png',
  '/images/splash/craft-7.png',
  '/images/splash/craft-8.png',
  '/images/splash/craft-9.png',
  '/images/splash/craft-10.png'
]

const FRAME_DURATION = 800

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
