const app = getApp()

const FRAMES = [
  {
    label: '蒸饭\n摊凉',
    image: '/images/craft/02-zhengfan.png',
    desc: '蒸熟后的糯米饭摊在大竹篛上，降温到适合发酵生物繁育的温度。'
  },
  {
    label: '拌曲\n下缸',
    image: '/images/craft/03-banqu.png',
    desc: '红曲麦曲均匀拌入，菌群悄然苏醒，古法酿造正式开始。'
  },
  {
    label: '入窖\n陈酿',
    image: '/images/craft/08-jiaocang.png',
    desc: '暗处静养，微生物欢歌，属于你的时光陈酿悄然孕育。'
  }
]

const FRAME_DURATION = 1200  // 每帧停留毫秒

Page({
  data: {
    statusBarHeight: 20,
    frames: FRAMES,
    currentFrame: 0
  },

  onLoad() {
    this.setData({ statusBarHeight: app.globalData.statusBarHeight || 20 })
    this._startFrames()
  },

  onUnload() {
    this._clearTimers()
  },

  _startFrames() {
    let frame = 0
    this.frameTimer = setInterval(() => {
      frame++
      if (frame >= FRAMES.length) {
        this._clearTimers()
        this.goHome()
        return
      }
      this.setData({ currentFrame: frame })
    }, FRAME_DURATION)
  },

  _clearTimers() {
    if (this.frameTimer) clearInterval(this.frameTimer)
  },

  onSkip() {
    this._clearTimers()
    this.goHome()
  },

  goHome() {
    wx.switchTab({ url: '/pages/home/home' })
  }
})
