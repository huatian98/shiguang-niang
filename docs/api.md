# 时光酿 API 接口文档

**Base URL：** `http://47.116.139.125:8080`

**更新时间：** 2026-05-23

**统一响应格式：**
```json
{ "code": 0, "msg": "ok", "data": { ... } }
```

---

## 认证说明

鉴权接口需在 Header 携带：
```
Authorization: Bearer <token>
```
token 通过 `/api/v1/auth/wx-login` 获取，有效期 72 小时。

---

## 一、公开接口（无需 token）

### 1. 模拟登录

```
POST /api/v1/auth/wx-login
```

**Request Body：**
```json
{ "code": "demo_001" }
```

**Response：**
```json
{
  "token": "eyJhbGci...",
  "user": {
    "id": 1,
    "openid": "demo_001",
    "nickname": "酿酒人",
    "avatar": "",
    "default_claim_id": 0
  }
}
```

---

### 2. 首页酒窖环境

```
GET /api/v1/home/cellar-env
```

**Response：**
```json
{
  "in_cellar_temp": 18.5,
  "in_cellar_humidity": 72.3,
  "out_cellar_temp": 24.1,
  "out_cellar_humidity": 65.0,
  "wine_ph": 3.82,
  "craft_steps": [
    { "id": 1, "step_no": 1, "name": "精米", "description": "...", "image_url": "" }
  ]
}
```

---

### 3. 古法工艺步骤列表

```
GET /api/v1/home/craft-steps
```

**Response：**
```json
[
  { "id": 1, "step_no": 1, "name": "精米", "description": "精选优质糯米，去壳抛光至精白度90%以上", "image_url": "" },
  { "id": 2, "step_no": 2, "name": "蒸饭", "description": "...", "image_url": "" }
]
```

---

### 4. 黄酒成分科普

```
GET /api/v1/components
```

**Response：**
```json
[
  { "id": 1, "name": "氨基酸", "description": "...", "icon_url": "", "sort": 1 }
]
```

---

### 5. 酒品系列列表

```
GET /api/v1/series
```

**Response：**
```json
[
  {
    "id": 1, "name": "四坪南系列",
    "description": "...", "cover_url": "",
    "base_price": 1299, "sort": 1, "status": 1
  }
]
```

---

### 6. 可认领酒坛列表

```
GET /api/v1/jars/available?limit=50
```

| 参数 | 类型 | 默认 | 说明 |
|---|---|---|---|
| limit | int | 50 | 返回数量，最大 100 |

**Response：**
```json
[
  { "id": 3, "code": "BQ-1024", "series_id": 1 }
]
```

---

### 7. 酒坛最新指标

```
GET /api/v1/jars/:id/metrics/latest
```

**Response：**
```json
{
  "id": 12,
  "wine_jar_id": "BQ-0827",
  "wine_ph": 3.75,
  "ph_status": "正常",
  "in_cellar_temp": 18.2,
  "in_cellar_humidity": 71.5,
  "out_cellar_temp": 23.8,
  "out_cellar_humidity": 64.0,
  "breathing_state": "风味沉淀中",
  "ai_narrative": "今日酸度略有回升，整体风味稳定...",
  "recorded_at": "2024-11-13T08:00:00Z"
}
```

---

### 8. 酒坛历史指标

```
GET /api/v1/jars/:id/metrics/history?days=7
```

| 参数 | 类型 | 默认 | 说明 |
|---|---|---|---|
| days | int | 7 | 查询最近 N 天数据 |

**Response：** `JarMetrics[]`（按时间倒序）

---

### 9. 酒坛成长时间线

```
GET /api/v1/jars/:id/timeline
```

**Response：**
```json
[
  {
    "id": 1, "jar_id": 1,
    "event_type": "入窖",
    "title": "正式入窖",
    "description": "...",
    "image_url": "",
    "happened_at": "2024-03-01T00:00:00Z"
  }
]
```

---

### 10. 兼容旧接口：认领详情

```
GET /api/claim/:id
```

> `:id` 为 jar_id，用于小程序老版本兼容，新开发请勿使用。

**Response：**
```json
{
  "code": "BQ-0827",
  "series": "四坪南系列",
  "cellar": "四坪窖藏",
  "address": "福建省宁德市屏南县",
  "applicant": "可乐",
  "phone": "138 **** 5678"
}
```

---

## 二、鉴权接口（需 Bearer token）

### 11. 当前用户信息

```
GET /api/v1/user/me
```

**Response：** `User` 对象
```json
{
  "id": 1, "openid": "demo_001", "nickname": "酿酒人",
  "avatar": "", "phone": "", "default_claim_id": 1,
  "created_at": "2024-10-01T00:00:00Z"
}
```

---

### 12. 首页 Dashboard

```
GET /api/v1/home/dashboard
```

**Response（未认领）：**
```json
{ "state": "not_claimed" }
```

**Response（已认领）：**
```json
{
  "state": "claimed",
  "aging_days": 45,
  "claim": {
    "id": 1, "claim_no": "CLM-20241113-00001",
    "jar_id": 1, "cellar_id": 1,
    "applicant_name": "酿酒人", "contact_phone": "138 **** 5678",
    "price": 1299, "status": "paid",
    "paid_at": "2024-10-01T10:00:00Z"
  },
  "jar": {
    "id": 1, "code": "BQ-0827",
    "series_id": 1, "cellar_id": 1,
    "status": "claimed", "claimed_at": "2024-10-01T10:00:00Z"
  },
  "series": { "id": 1, "name": "四坪南系列", "base_price": 1299 },
  "cellar": { "id": 1, "name": "四坪窖藏", "address": "福建省宁德市屏南县" },
  "metrics": { "wine_ph": 3.75, "breathing_state": "风味沉淀中", "ai_narrative": "..." },
  "timelines": [ { "event_type": "入窖", "title": "正式入窖", "happened_at": "..." } ],
  "components": [ { "name": "氨基酸", "description": "..." } ]
}
```

---

### 13. 创建认领单

```
POST /api/v1/claims
```

**Request Body：**
```json
{
  "jar_id": 1,
  "applicant_name": "酿酒人",
  "contact_phone": "138 **** 5678"
}
```

**Response：**
```json
{
  "id": 1, "claim_no": "CLM-20241113-00001",
  "user_id": 1, "jar_id": 1, "cellar_id": 1,
  "applicant_name": "酿酒人", "contact_phone": "138 **** 5678",
  "price": 1299, "status": "pending",
  "created_at": "2024-11-13T10:00:00Z"
}
```

**错误：**

| HTTP | msg | 说明 |
|---|---|---|
| 400 | 已被认领 | 酒坛已有主人 |
| 400 | invalid request | 参数缺失 |

---

### 14. 我的认领列表

```
GET /api/v1/claims
```

**Response：** `Claim[]`
```json
[
  {
    "id": 1, "claim_no": "CLM-20241113-00001",
    "jar_id": 1, "cellar_id": 1,
    "price": 1299, "status": "paid",
    "paid_at": "2024-10-01T10:00:00Z",
    "created_at": "2024-10-01T09:00:00Z"
  }
]
```

**Claim status 枚举：**

| 值 | 说明 |
|---|---|
| pending | 待支付 |
| paid | 已支付 / 陈酿中 |
| completed | 已开坛 |
| cancelled | 已取消 |
| refunded | 已退款 |

---

### 15. 认领单详情

```
GET /api/v1/claims/:id
```

**Response：** `Claim` 对象（同上）

---

### 16. 设为首页展示

```
POST /api/v1/claims/:id/set-default
```

将指定认领单设为用户首页默认展示的酒坛。

**Response：**
```json
{ "ok": true }
```

---

### 17. 模拟支付

```
POST /api/v1/payments/mock-pay
```

**Request Body：**
```json
{ "claim_id": 1 }
```

**Response：**
```json
{ "paid": true, "claim_id": 1 }
```

支付成功后：
- 认领单 `status` → `paid`，`paid_at` 写入当前时间
- 酒坛 `status` → `claimed`，`claimed_at` 写入当前时间

---

## 附录：数据模型

### Claim
| 字段 | 类型 | 说明 |
|---|---|---|
| id | uint64 | 主键 |
| claim_no | string | 认领单号 CLM-yyyymmdd-nnnnn |
| user_id | uint64 | 用户 ID |
| jar_id | uint64 | 酒坛 ID |
| cellar_id | uint64 | 酒窖 ID |
| applicant_name | string | 申请人姓名 |
| contact_phone | string | 联系电话 |
| price | float64 | 认领金额 |
| status | string | pending / paid / completed / cancelled / refunded |
| paid_at | time? | 支付时间 |
| created_at | time | 创建时间 |

### JarMetrics
| 字段 | 类型 | 说明 |
|---|---|---|
| wine_jar_id | string | 酒坛编号（BQ-xxxx） |
| wine_ph | float64 | 酸度值 |
| ph_status | string | 偏低 / 正常 / 偏高 |
| in_cellar_temp | float64 | 窖内温度 ℃ |
| in_cellar_humidity | float64 | 窖内湿度 % |
| out_cellar_temp | float64 | 窖外温度 ℃ |
| out_cellar_humidity | float64 | 窖外湿度 % |
| breathing_state | string | 风味沉淀中 / 活跃发酵中 / 入窖准备中 等 |
| ai_narrative | string | AI 醒酒师今日点评 |
| recorded_at | time | 数据采集时间 |
