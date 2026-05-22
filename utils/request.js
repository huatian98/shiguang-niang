const app = getApp()

function request({ url, method = 'GET', data, timeout = 8000 }) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${app.globalData.apiBase}${url}`,
      method,
      data,
      timeout,
      header: {
        'Content-Type': 'application/json',
        'Authorization': app.globalData.token ? `Bearer ${app.globalData.token}` : ''
      },
      success: (res) => {
        const body = res.data
        if (body && body.code === 0) {
          resolve(body.data)
        } else {
          wx.showToast({ title: (body && body.message) || '请求失败', icon: 'none' })
          reject(body)
        }
      },
      fail: (err) => {
        wx.showToast({ title: '网络错误', icon: 'none' })
        reject(err)
      }
    })
  })
}

module.exports = { request }
