# Cloud Atlas · 全球船迹云科研地图

> Evidence-backed global research landscape · snapshot: **18 October 2026**.

一个静态、可旋转的交互式 3D 地球，探索船迹云、海洋云增亮、气溶胶—云相互作用与卫星云遥感领域的研究团队、代表人物和论文。使用 **Three.js + TypeScript + Vite**，在 **GitHub Actions** 上完成所有类型检查和构建，将云端构建产物交由 DevSpace 中已有的 **Wrangler OAuth** 发布至 **Cloudflare Workers**。

**线上域名：[tracks.fyzure.fyi](https://tracks.fyzure.fyi)**。部署逻辑见 `wrangler.jsonc`，使用 Workers Static Assets 和 Custom Domain；不是 GitHub Pages。

## 功能

- 全球团队标记与合作论文支持的连接线；拖动旋转、滚轮缩放、点击飞向团队。
- 浅色、大字号、去冗余的研究阅读界面。近景缩小球面标记，密集城市按屏幕距离聚合，点击聚合点展开团队并自动聚焦；分开后的城市名称自动避让。
- 地理坐标使用 Three.js SphereGeometry 对应的经纬映射；`src/geo.ts` 与云端 `tests/geo.test.mjs` 校验北京、邯郸、欧洲和美国经度，不再把经纬度错误地旋转 90°。
- 按研究方法、成熟度及全文搜索筛选；选择团队后查看 PI／学术带头人、研究风格、证据与建议阅读。
- 独立 2026 文献视图（区分正式发表与预印本）；外链 DOI 和机构官网。
- 一键突出“船迹识别→动态跟踪→机制归因→辐射效应”这一技术链条的相关团队。
- 保留每条判断的来源和主观评估说明；不公开私人 Zotero key、笔记、批注和附件。

## 数据与边界

公开资料截至 **2026-10-18**。筛选是人工选择的相关团队，不是完整学术普查。地球上的点是**机构所在城市的近似坐标**，不是实验室精确位置。所谓“团队”包括正式课题组和有明确合作论文的研究方向集合，不表示一个独立行政单位。“PI／带头人”只基于论文贡献和官方研究组介绍指定，不代表实际雇佣或行政汇报关系。

成熟度是为了判断**相关领域研究体系的积累度**，不是人物优劣或论文质量分数：

| 层级 | 含义 |
| --- | --- |
| 开拓型 | 多年方法、观测或理论贡献，公开长期研究组／平台证据 |
| 稳健型 | 跨年份连续输出、明确的学术方向或研究基础设施 |
| 成长型 | 近年多篇相关成果，形成可辨识的细分专长 |
| 新兴型 | 近期少量明确成果，长期稳定性尚不能推断 |

与课题直接相关的论文优先于宽泛领域影响力。数据以 `src/data.ts` 为可审计的手工研究快照，所有公开参考文献都附原始 DOI／机构来源。不要将成熟度理解为客观排行榜，也不要将合作连线理解为长期机构协议。

## 文献选择与 Zotero

2026-10-18 通过 **desktop-feng / AgentDock / ZoteroMCP** 对用户私人 Zotero **只读检索**：`ship track`、`aerosol cloud`，并以期刊论文页、作者所属单位页、机构页面公开交叉核验。其中有 2026 年新论文以及历史基础论文；仅把可以公开引用的书目信息整理进项目，**未上传任何私人条目 ID、批注、阅读进度或 PDF**。部分其他公开文献来自期刊与机构官网。论文的已发表／预印本状态需要看每条条目的状态。

## 本地开发（仅供贡献者参考）

```bash
npm install
npm run dev
```

**本项目的实际 CI 流程遵循：只在 GitHub Actions 运行项目测试、类型检查与构建，不在 DevSpace 或部署机器运行构建。** CI workflow 在 main push 上运行并上传 `cloud-atlas-dist`，不存取 Cloudflare Token。

## Cloudflare 发布流程（DevSpace，不在本机构建）

1. 在 GitHub Actions 中等候 `Cloud Atlas · cloud build` 成功。
2. 在 DevSpace 通过 `gh run download <run-id> -n cloud-atlas-dist -D dist` 获取已编译的 **dist**。
3. 在 DevSpace 使用现有 Wrangler OAuth 凭据执行 `wrangler deploy`。Wrangler 仅上传 GitHub Actions 的静态产物，不做本地测试、编译或构建。
4. 验证 `https://tracks.fyzure.fyi` HTTPS 和 HTTP 响应，确保 DNS/Workers Custom Domain 指向正确。

若未来要把发布完全迁移到 GitHub Actions，必须先另外设计安全的凭据授权方案；**不要将 DevSpace 的 Cloudflare API Token 导出到聊天、GitHub 或其他机器**。

## 资料扩展

修改 `src/data.ts`，给新增团队补充地点、可信机构链接、正式论文与评价证据，并明确是 PI、合作方还是研究方向联系人。优先保持新条目可追溯且审慎评价。对于学术争议、机构变动、2026-10-18 之后的论文，应该更新快照时间并重新核验。

## 许可

项目代码 MIT。论文标题、DOI 和作者为引用性质的公开元数据；第三方地球纹理及外部图像各遵循其原始权利声明。地图背景采用程序化星空；地球贴图由 Three.js 官方示例站点加载并由其托管，不能获取时会自动回退到程序化球体。
