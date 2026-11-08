# China Guide — 俄语内容站 + 预约 + SEO（合规版）

面向俄罗斯/俄语用户的「中国支付 + 中国 AI」内容站：3 篇攻略、SEO 落地页、Cal.com 预约日历、咨询表单。
**这是合规版本：不含代充/代付下单、不收集银行卡/护照/短信验证码、不碰客户资金。**

## 新增内容

- `/guides/` — 攻略中心
- `/guides/nihao-china.html` — Nihao China 步骤、支持银行、费用、常见错误
- `/guides/tbank-limits.html` — T-Bank / MTS 转账限额、步骤、异常处理
- `/guides/deepseek-topup.html` — DeepSeek API 从俄罗斯付款的合法路径
- `/booking.html` — Cal.com 预约日历（iframe）+ Telegram 兜底
- 俄语 SEO：canonical、hreflang、Open Graph/Twitter、JSON-LD（Article / FAQ / Breadcrumb / Organization / WebSite）、`sitemap.xml`、`robots.txt`、`og-image.png`
- 首页新增「Гайды」区块、导航/页脚内链、所有 CTA 指向预约页

## 文件结构

```
china-ru-site/
├─ index.html
├─ booking.html                 # Cal.com 日历
├─ privacy.html
├─ guides/
│  ├─ index.html                # 攻略中心
│  ├─ nihao-china.html
│  ├─ tbank-limits.html
│  └─ deepseek-topup.html
├─ assets/{style.css,app.js,js-init.js}
├─ _headers                     # CSP（含 Cal.com frame-src）
├─ robots.txt
├─ sitemap.xml
├─ og-image.png                 # 1200×630 社交分享图
├─ functions/api/lead.js
├─ preview*.png                 # 评审截图
└─ README.md
```

## 上线前必须替换的占位符

1. **域名**：全站搜索 `https://china-guide.example`，替换成你的真实域名（index、guides、booking、privacy、sitemap.xml、robots.txt、JSON-LD、og:image）。
2. **Cal.com**：把 `booking.html` 里的 `https://cal.com/china-guide/consultation` 换成你的 Cal.com 用户名/事件类型（如 `https://cal.com/yourname/consultation`）。如果换成自定义域名，把该域名加进 `_headers` 的 `frame-src`。
3. **Turnstile**：`assets/app.js` 里的 `YOUR_TURNSTILE_SITE_KEY`；服务端环境变量 `TURNSTILE_SECRET`。
4. **Telegram**：`@china_guide` / `https://t.me/china_guide` 换成你的账号；环境变量 `TELEGRAM_BOT_TOKEN`、`TELEGRAM_CHAT_ID`。
5. **OG 图**：`og-image.png` 可直接用，也可以换成你的品牌图（1200×630）。

## SEO 清单

- [ ] 全站替换真实域名后，检查 canonical / og:url / sitemap 一致
- [ ] Google Search Console + Yandex Webmaster 添加站点，提交 `/sitemap.xml`
- [ ] 检查所有页面 `<html lang="ru">`、H1 唯一、description 不重复
- [ ] 文章事实每月复核（银行限额、Nihao China 支持银行、Kimi 支付方式变化很快）
- [ ] 内链：首页 → 攻略 → 预约页；文章底部「Читайте также」保持 2 条相关链接
- [ ] 图片：目前全部是内联 SVG，无需额外压缩；如果以后加图片，用 WebP + width/height
- [ ] 性能：静态站 + Cloudflare CDN；保持零第三方脚本（Turnstile/Cal.com iframe 除外）
- [ ] 结构化数据：用 Google Rich Results Test / Yandex 工具检查 Article 和 FAQ

## Cal.com 设置

1. 注册 Cal.com，创建两个事件类型：30 分钟（€29）和 60 分钟（€49）。
2. 复制事件链接，替换 `booking.html` 中的 iframe `src` 和兜底链接。链接还是占位符时，页面会自动显示「Онлайн-запись скоро появится」而不是 Cal.com 404。
3. 嵌入参数：`?embed=true&theme=dark&layout=month_view`。
4. 在 Cal.com 里设置可用时区、缓冲时间、取消政策；可选 Stripe 收款（注意目标用户支付方式）。
5. 测试 iframe 在桌面/移动端是否加载；如果被 CSP 拦截，检查 `_headers` 的 `frame-src`。

## 预览图

- `preview-guide.png` — статья Nihao China (desktop)
- `preview-guides.png` — центр гайдов
- `preview-guide-mobile.png` — статья на мобильном (390px)
- `preview-booking.png` — страница записи с Cal.com
- `preview.png` / `preview-full.png` — главная
- `preview-payments.png`, `preview-charts.png`, `preview-ai.png` — секции главной

## 部署（Cloudflare Pages，免费）

1. 推到 GitHub/GitLab，Cloudflare Pages 连仓库。
2. Build command 留空，Build output directory 填 `.`。
3. 绑定自定义域名 + DNSSEC。
4. 环境变量：`TURNSTILE_SECRET`、`TELEGRAM_BOT_TOKEN`、`TELEGRAM_CHAT_ID`。
5. 部署后从俄罗斯实测访问；如果 Cloudflare 不稳定，可换 Gcore 或俄罗斯本地 CDN（注意 152-ФЗ）。

## 安全基线（不变）

- 纯静态站：无数据库、无登录、无收款、无文件上传
- 表单：Turnstile + 蜜罐 + 服务端校验；只收姓名 + Telegram/email + 主题 + 留言
- 不存卡号、护照、验证码；隐私政策写明 30 天删除
- CSP / HSTS / X-Frame-Options / Referrer-Policy / Permissions-Policy 已配置
- 无内联 script/style；`js-init.js` 只加 `.js` class，禁用 JS 时页面仍完整可见
- Cloudflare / GitHub / Telegram / Cal.com 全部开 2FA；域名锁；SPF/DKIM/DMARC

## 成本

域名 ~$10/年；Cloudflare Pages / Turnstile / Cal.com 免费档 $0。

## 不包含什么（重要）

本模板**不包含**：代充/代付下单、收卢布境内付人民币、账户/验证码收集、支付通道、换汇、账号出租。
这类业务在中国属于刑事红线（非法经营、帮信、外汇/惩戒），网站和流水会成为证据；技术上也无法用“高防”解决。这个站只做内容、咨询与官方渠道导流。

## 内容与合规

- 文案只写官方渠道（Nihao China、Alipay/WeChat 外卡、T-Bank/MTS、Kimi 收 Mir、俄罗斯云平台），不写「包过」「绕过」。
- 不提供支付/换汇服务；咨询只做信息与操作指导。
- affiliate 链接需标注「партнёрская ссылка」。
- 涉及俄罗斯用户个人数据：只收联系方式、最小化处理；扩大收集前评估俄罗斯 152-ФЗ 与中国 PIPL。
- 本模板不构成法律意见；正式运营前请咨询律师与银行合规部门。
