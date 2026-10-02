# Aniverse 小程序端

基于 Taro 4、React 18、TypeScript 与 Zustand 的微信小程序前端。复用仓库中 `Backend` 的现有接口，不需要新增后端服务。

## 已覆盖业务

- 首页聚合、轮播、榜单和类型入口
- 动漫搜索、分类/类型/制作方分页列表
- 动漫详情、相关推荐
- 剧集、字幕/配音线路、原生视频播放
- 邮箱注册登录、收藏、追番、观看历史
- AI 动漫助手及聊天记录

## 本地启动

```bash
cd MiniProgram
npm install
npm run dev:weapp
```

然后用微信开发者工具导入 `MiniProgram` 目录（`miniprogramRoot` 已指向 `dist`）。

开发环境 API 地址由 `.env.development` 中的 `TARO_APP_API_BASE_URL` 控制。真机不能访问电脑的 `127.0.0.1`，请改为同一局域网 IP 或 HTTPS 测试域名。

生产环境复制 `.env.production.example` 为 `.env.production` 并填写正式 HTTPS API。微信公众平台还需要把 API 域名以及视频/图片涉及的域名加入合法域名白名单；正式发布时把 `project.config.json` 中的 `appid` 替换为真实小程序 AppID，并开启域名校验。

## 构建

```bash
npm run typecheck
npm run build:weapp
```

浏览器预览可使用 `npm run dev:h5`，但小程序原生视频和网络域名行为应以微信开发者工具及真机测试为准。
