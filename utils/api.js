// 全部接口集中管理,改 URL 只改这一处
const { request } = require('./request')

module.exports = {
  // 认证
  wxLogin: (code) => request({ url: '/api/v1/auth/wx-login', method: 'POST', data: { code } }),

  // 首页
  homeCellarEnv: () => request({ url: '/api/v1/home/cellar-env' }),
  homeDashboard: () => request({ url: '/api/v1/home/dashboard' }),
  homeCraftSteps: () => request({ url: '/api/v1/home/craft-steps' }),

  // 系列 / 酒坛
  seriesList: () => request({ url: '/api/v1/series' }),
  jarMetricsLatest: (id) => request({ url: `/api/v1/jars/${id}/metrics/latest` }),
  jarTimeline: (id) => request({ url: `/api/v1/jars/${id}/timeline` }),
  jarLegacy: (id) => request({ url: `/api/claim/${id}` }),

  // 认领 / 支付
  claimCreate: (data) => request({ url: '/api/v1/claims', method: 'POST', data }),
  claimList: () => request({ url: '/api/v1/claims' }),
  claimDetail: (id) => request({ url: `/api/v1/claims/${id}` }),
  claimSetDefault: (id) => request({ url: `/api/v1/claims/${id}/set-default`, method: 'POST' }),
  mockPay: (claimId) => request({ url: '/api/v1/payments/mock-pay', method: 'POST', data: { claim_id: claimId } }),

  // 内容
  components: () => request({ url: '/api/v1/components' })
}
