/**
 * Curated, citation-first scientific landscape; snapshot 2026-10-18.
 * Affiliations are approximate institutional locations, NOT personal whereabouts.
 * Assessments describe reproducible research practices, not personal character.
 */
export type Field = 'retrieval' | 'dynamics' | 'causality' | 'model' | 'ai';
export type Maturity = 'pioneer' | 'established' | 'rising' | 'emerging';
export type EvidenceStatus = 'journal' | 'preprint';

export interface Paper {
  id: string;
  title: string;
  year: number;
  published?: string;
  authors: string;
  journal: string;
  doi: string;
  status: EvidenceStatus;
  insight: string;
  fields: Field[];
}

export interface Team {
  id: string;
  name: string;
  institution: string;
  city: string;
  country: string;
  lat: number;
  lon: number;
  field: Field;
  maturity: Maturity;
  position: string;
  leaders: { name: string; role: string; verifiedAt: string }[];
  focus: string;
  profile: string;
  strong: string;
  caveat: string;
  relevance: string;
  sources: { label: string; url: string }[];
  papers: string[];
}

export interface Collaboration {
  from: string;
  to: string;
  paperId: string;
  description: string;
}

export const fieldInfo: Record<Field, { name: string; short: string; color: string }> = {
  retrieval: { name: '卫星遥感 / 识别', short: '遥感', color: '#5ec7f8' },
  dynamics: { name: '云物理 / 动态演化', short: '物理', color: '#68e1ba' },
  causality: { name: '因果归因 / 辐射效应', short: '归因', color: '#f8c983' },
  model: { name: '模式 / LES / 参数化', short: '模拟', color: '#bf9df9' },
  ai: { name: 'AI / 科学机器学习', short: 'AI', color: '#ff91b5' },
};

export const maturityInfo: Record<Maturity, { label: string; description: string }> = {
  pioneer: { label: '开拓型', description: '长期基础贡献与持续的研究平台或学派' },
  established: { label: '稳健型', description: '多年度连续研究、可辨识的方法与合作体系' },
  rising: { label: '成长型', description: '具有特色的持续成果、近期研究势头清晰' },
  emerging: { label: '新兴型', description: '已有明确成果，但该细分方向的长期积累仍待观察' },
};

export const papers: Paper[] = [
  { id: 'yuan2026diel', title: 'Substantial Diel Changes of Cloud Adjustments to Aerosols in Ship-Tracks', authors: 'T. Yuan, H. Song, R. Wood et al.', year: 2026, published: '2026-06-20', journal: 'Geophysical Research Letters', doi: '10.1029/2026GL121979', status: 'journal', fields: ['dynamics', 'causality'], insight: '船迹云的云水调整随昼夜时段显著改变；需要时间分辨率和环境控制。' },
  { id: 'wright2026', title: 'Invisible Ship Tracks Produce Mean-State Cloud Microphysics Perturbation in Tropical Trade Cumulus', authors: 'C. J. Wright, J. Liu, Y. Cao et al.', year: 2026, published: '2026-07-29', journal: 'Geophysical Research Letters', doi: '10.1029/2025GL121160', status: 'journal', fields: ['dynamics', 'causality'], insight: '不可见船舶污染也会改变贸易积云滴数分布；可见检测不是全部 ACI。' },
  { id: 'boyce2026', title: 'Sensitivity of bi-spectral retrievals to the fixed effective variance assumption in ship tracks', authors: 'I. Boyce, A. Cicirello, E. Gryspeerdt', year: 2026, published: '2026-08-26', journal: 'Atmospheric Measurement Techniques', doi: '10.5194/amt-19-5475-2026', status: 'journal', fields: ['retrieval', 'causality'], insight: '双光谱检索中的固定有效方差假设可能给污染区半径检索引入系统偏差。' },
  { id: 'hu2026', title: 'Automated detection and dynamic tracking of ship tracks from FY-4B geostationary satellite imagery using U-HRNet', authors: 'Z. Hu, P. Hao, T. Meng et al.', year: 2026, published: '2026-06-12', journal: 'Journal of Applied Remote Sensing', doi: '10.1117/1.JRS.20.026514', status: 'journal', fields: ['retrieval', 'ai'], insight: 'FY-4B 静止卫星船迹检测及动态跟踪，同研究路线直接竞争／可复现对照。' },
  { id: 'zhang2026arm', title: 'Investigating aerosol-cloud interactions by fusing DOE ARM observations with ship tracks: A methodology', authors: 'H. Zhang, T. Yuan, H. Song et al.', year: 2026, published: '2026-06-11', journal: 'EGUsphere (preprint)', doi: '10.5194/egusphere-2026-2430', status: 'preprint', fields: ['causality', 'dynamics'], insight: 'ARM 地基观测、CCN 峰值与后向轨迹融合；预印本，尚不等同正式审稿结论。' },
  { id: 'tippett2026', title: 'Evaluating simulations of ship tracks in a km-scale model', authors: 'A. Tippett, P. R. Field, E. Gryspeerdt', year: 2026, published: '2026-03-26', journal: 'Atmospheric Chemistry and Physics', doi: '10.5194/acp-26-4251-2026', status: 'journal', fields: ['model'], insight: '公里尺度模型在有降水与高污染条件下高估云滴和云水的响应；真实船迹是参数化的重要约束。' },
  { id: 'mcmichael2026', title: 'Estimating Twomey forcing sensitivity to aerosol plume spreading rates', authors: 'L. A. McMichael, E. Erfani, R. Wood, K. von Salzen', year: 2026, published: '2026-10-09', journal: 'Atmospheric Chemistry and Physics', doi: '10.5194/acp-26-14111-2026', status: 'journal', fields: ['dynamics', 'model'], insight: '2026 年 10 月最新：羽流空间扩散、气溶胶寿命与湍流对 Twomey 强迫的影响；从几何跟踪走向物理约束。' },
  { id: 'yuan2025five', title: 'Detectable ship tracks account for just 5% of aerosol indirect forcing from ship emissions', authors: 'T. Yuan, H. Song, L. F. Boss, M. S. Diamond', year: 2025, journal: 'Communications Earth & Environment', doi: '10.1038/s43247-025-02825-w', status: 'journal', fields: ['causality'], insight: '在研究区域可检测船迹仅代表很小一部分估计间接强迫；检测与完整因果归因之间仍有巨大鸿沟。' },
  { id: 'yuan2019', title: 'Automatically Finding Ship-Tracks to Enable Large-Scale Analysis of Aerosol-Cloud Interactions', authors: 'T. Yuan, C. Wang, H. Song et al.', year: 2019, journal: 'Geophysical Research Letters', doi: '10.1029/2019GL083441', status: 'journal', fields: ['retrieval'], insight: '自动化船迹发现的早期大样本标志性工作。' },
  { id: 'manshausen2022', title: 'Invisible ship tracks show large cloud sensitivity to aerosol', authors: 'P. Manshausen, D. Watson-Parris, M. W. Christensen et al.', year: 2022, journal: 'Nature', doi: '10.1038/s41586-022-05122-0', status: 'journal', fields: ['causality', 'retrieval'], insight: '利用不可见航线响应降低仅依赖显著亮纹的选择性偏差。' },
  { id: 'glassmeier2021', title: 'Aerosol-cloud-climate cooling overestimated by ship-track data', authors: 'F. Glassmeier, F. Hoffmann, J. S. Johnson et al.', year: 2021, journal: 'Science', doi: '10.1126/science.abd3980', status: 'journal', fields: ['model', 'dynamics'], insight: '由单条船迹推断长期云场调节存在时间尺度与选择偏差。' },
  { id: 'gryspeerdt2022', title: 'Observing short-timescale cloud development to constrain aerosol–cloud interactions', authors: 'E. Gryspeerdt, F. Glassmeier, G. Feingold et al.', year: 2022, journal: 'Atmospheric Chemistry and Physics', doi: '10.5194/acp-22-11727-2022', status: 'journal', fields: ['dynamics', 'causality'], insight: '对云的短时间演变建模与观测，用于减少时间平均造成的因果混淆。' },
  { id: 'watson2022', title: 'Shipping regulations lead to large reduction in cloud perturbations', authors: 'D. Watson-Parris, M. W. Christensen, A. Laurenson et al.', year: 2022, journal: 'PNAS', doi: '10.1073/pnas.2206885119', status: 'journal', fields: ['causality'], insight: '借助航运燃油标准变化研究云响应。' },
  { id: 'glassmeier2025', title: 'Capturing Aerosol–Cloud–Precipitation Interactions: A Physics-Informed Sparse Regression Approach', authors: 'M. Cheng, F. Glassmeier', year: 2025, journal: 'Journal of Geophysical Research: Atmospheres', doi: '10.1029/2024JD043226', status: 'journal', fields: ['ai', 'dynamics'], insight: '物理信息稀疏回归用于识别多尺度和时滞反馈结构。' },
  { id: 'zhang2026cold', title: 'Inferring processes governing cloud transition during mid-latitude marine cold-air outbreaks from satellite', authors: 'J. Zhang, D. Painemal, T. Dror et al.', year: 2026, published: '2026-05-05', journal: 'Atmospheric Chemistry and Physics', doi: '10.5194/acp-26-6015-2026', status: 'journal', fields: ['dynamics', 'retrieval'], insight: '从 GOES 卫星快照及气团轨迹重建云场转变的过程线索。' },
];

export const teams: Team[] = [
  {
    id: 'nasa', name: 'NASA Goddard · Ship-track / ACI', institution: 'NASA Goddard Space Flight Center · UMBC / collaborating scientists', city: 'Greenbelt', country: '美国', lat: 39.005, lon: -76.876, field: 'causality', maturity: 'pioneer', position: '领域核心交叉节点 · 自动检测 × 时变云调整 × 辐射强迫',
    leaders: [{ name: 'Tianle Yuan', role: '核心论文通讯作者；NASA Goddard / UMBC 研究科学家', verifiedAt: 'NASA 公开人员主页' }, { name: 'Hua Song', role: '核心合作研究者；NASA Goddard 研究体系', verifiedAt: 'NASA 公开人员主页' }],
    focus: '将船迹从卫星线状目标推进到气溶胶—云因果效应的统计约束；重视不可见船迹与昼夜变化。',
    profile: '问题驱动的观测型路线：建立自动化样本和异常天然实验，再询问云物理与辐射强迫是否可归因。此处“画像”仅描述公开研究产出。',
    strong: '2019 自动识别、2025 可见船迹代表性评估、2026 日变化；方法线持续演进。',
    caveat: 'NASA 不是单一 PI 实验室；本地图将相关合作研究作为“研究方向集群”。',
    relevance: '极高：与你的全生命周期和辐射效应目标最直接重合。',
    sources: [{ label: 'NASA · Tianle Yuan', url: 'https://science.gsfc.nasa.gov/sci/bio/tianle.yuan' }, { label: 'NASA · Hua Song', url: 'https://science.gsfc.nasa.gov/sci/bio/hua.song' }],
    papers: ['yuan2026diel', 'zhang2026arm', 'yuan2025five', 'yuan2019'],
  },
  {
    id: 'washington', name: 'UW · Marine low-cloud physics', institution: 'University of Washington · Atmospheric and Climate Science', city: 'Seattle', country: '美国', lat: 47.655, lon: -122.309, field: 'dynamics', maturity: 'pioneer', position: '云物理与海洋边界层观测的深厚基础',
    leaders: [{ name: 'Robert Wood', role: '教授；公开页面确认主持云物理与海洋云研究', verifiedAt: 'UW 官方 faculty page' }],
    focus: '边界层层积云微物理、湍流、降水、海洋低云及飞机／卫星观测约束。',
    profile: '以云物理机制和外场观测见长，把概念模型、飞机观测和卫星资料结合。',
    strong: '连续多年的海洋低云物理研究以及多机构实测合作。',
    caveat: '更多聚焦机制与过程理解，而非仅以遥感网络指标为核心。',
    relevance: '极高：构造物理合理的云寿命与夹卷解释时具有方法借鉴价值。',
    sources: [{ label: 'UW · Robert Wood', url: 'https://atmos.uw.edu/faculty-and-research/core-faculty/robert-wood/' }],
    papers: ['mcmichael2026', 'yuan2026diel', 'wright2026'],
  },
  {
    id: 'noaa', name: 'NOAA CSL · Clouds, Aerosols & Climate', institution: 'NOAA Chemical Sciences Laboratory', city: 'Boulder', country: '美国', lat: 40.015, lon: -105.27, field: 'model', maturity: 'pioneer', position: '云—气溶胶机制模拟与 LES 基准',
    leaders: [{ name: 'Graham Feingold', role: 'NOAA Clouds, Aerosols & Climate 研究计划负责人', verifiedAt: 'NOAA CSL 官方研究新闻' }],
    focus: '层积云微物理、云水调整、理想化 LES、云场结构与卫星反演连接。',
    profile: '机制验证型路线：用严格的模拟与过程约束检查卫星统计中的推断。',
    strong: '连续 LES 研究，连接 Delft、Imperial 与观测团队。',
    caveat: '模式结论和观测结论之间存在场景与尺度外推挑战。',
    relevance: '极高：帮助把影像追踪升级为可检验的物理归因。',
    sources: [{ label: 'NOAA CSL · 新闻/负责人', url: 'https://www.csl.noaa.gov/news/2025/423_0113.html' }, { label: 'DOE ASR · 项目 PI', url: 'https://asr.science.energy.gov/projects/18852' }],
    papers: ['glassmeier2021', 'gryspeerdt2022', 'zhang2026cold'],
  },
  {
    id: 'imperial', name: 'Imperial · Clouds and Climate', institution: 'Imperial College London · Department of Physics', city: 'London', country: '英国', lat: 51.498, lon: -0.174, field: 'retrieval', maturity: 'established', position: '卫星偏差识别 × 气溶胶归因 × 模式比较',
    leaders: [{ name: 'Edward Gryspeerdt', role: '副教授；官方介绍确认其独立研究组', verifiedAt: 'Imperial 公开人员资料' }],
    focus: '船舶／航空污染的云响应；检索假设与环境混淆；多源遥感和模型。',
    profile: '方法审辨型：不仅估计云响应，还明确追问反演产品以及观测设计可能制造的偏差。',
    strong: '2022 短时间演变约束、2026 船迹双光谱反演偏差检验。',
    caveat: '观测归因受隐含选择偏差与反演假设影响，对合作课题设计要求较高。',
    relevance: '极高：你的 COT、CER、LWP 反演偏差必须正面处理。',
    sources: [{ label: 'Imperial · Gryspeerdt', url: 'https://profiles.imperial.ac.uk/e.gryspeerdt' }],
    papers: ['boyce2026', 'tippett2026', 'gryspeerdt2022', 'watson2022'],
  },
  {
    id: 'oxford', name: 'Oxford · Climate Processes', institution: 'University of Oxford · Atmospheric, Oceanic and Planetary Physics', city: 'Oxford', country: '英国', lat: 51.76, lon: -1.255, field: 'model', maturity: 'pioneer', position: '跨尺度云—气溶胶模式 × AI 与观测协同',
    leaders: [{ name: 'Philip Stier', role: '教授；Climate Processes Group 官方负责人', verifiedAt: 'Oxford 研究组与成员主页' }],
    focus: '人类扰动气溶胶、云反馈、辐射效应；数值模式与 Earth observations／AI 联动。',
    profile: '体系化协同型路线：理论、模拟、观测、AI 多路并行，强调跨尺度物理框架。',
    strong: '正式研究组和项目体系、可验证的长期气候过程研究。',
    caveat: '题目跨度广，具体船迹算法并非该组唯一优先方向。',
    relevance: '高：从局地船迹向全球 ACI 参数化与气候意义延伸。',
    sources: [{ label: 'Oxford · Climate Processes Group', url: 'https://www.physics.ox.ac.uk/research/group/climate-processes' }, { label: 'Oxford · Stier', url: 'https://www.physics.ox.ac.uk/our-people/stier' }],
    papers: ['manshausen2022', 'watson2022'],
  },
  {
    id: 'ucsd', name: 'UCSD / Scripps · Climate & Data Science', institution: 'UC San Diego · Scripps Institution of Oceanography / HDSI', city: 'La Jolla', country: '美国', lat: 32.88, lon: -117.236, field: 'ai', maturity: 'established', position: '科学机器学习 × 因果估计 × 云变化',
    leaders: [{ name: 'Duncan Watson-Parris', role: '助理教授；Scripps 和 HDSI 联聘', verifiedAt: 'UCSD / Scripps 人员主页' }],
    focus: '卫星云特征跟踪、不可见船迹、数据科学与全球模式的跨尺度结合。',
    profile: '物理–AI 融合型：追求以数据科学改善机制解释而非只优化识别准确率。',
    strong: 'Nature 2022 不可见船迹、模型与 AI 的多学科交叉；官方资料明确卫星云跟踪。',
    caveat: '研究范围覆盖广泛机器学习与气候问题，不能简单等同于专职船迹检测实验室。',
    relevance: '极高：适合作为未来五年船迹云研究如何与 AI 共存的比较样本。',
    sources: [{ label: 'UCSD · 人员主页', url: 'https://datascience.ucsd.edu/people/duncan-watson-parris/' }, { label: 'Scripps · Research', url: 'https://dwatsonparris.scrippsprofiles.ucsd.edu/' }],
    papers: ['manshausen2022', 'watson2022'],
  },
  {
    id: 'delft', name: 'TU Delft · Multiscale Cloud Physics', institution: 'Delft University of Technology · Geoscience and Remote Sensing', city: 'Delft', country: '荷兰', lat: 52.0, lon: 4.368, field: 'dynamics', maturity: 'established', position: '云寿命尺度效应 × 复杂系统 × 物理信息模型',
    leaders: [{ name: 'Franziska Glassmeier', role: '副教授；官方确认自身研究组及 ERC Starting Grant', verifiedAt: 'TU Delft 官方人员页面' }],
    focus: '船迹统计外推的时间偏差、云场复杂系统、物理信息数据科学与云微物理。',
    profile: '批判性机理导向：追问实验的时间尺度及能否从单条船迹外推到整个云场。',
    strong: 'Science 2021 争议性重要贡献，2025 物理信息稀疏回归进一步延伸。',
    caveat: '其小组另有 MPI-M 联合研究安排，地图只标 TU Delft 行政机构近似位置。',
    relevance: '极高：提示船迹生命周期中“云水响应方向改变”的关键问题。',
    sources: [{ label: 'TU Delft · Glassmeier', url: 'https://www.tudelft.nl/en/ceg/about-faculty/departments/geoscience-remote-sensing/staff/scientific-staff/drsc-f-franziska-glassmeier' }],
    papers: ['glassmeier2021', 'glassmeier2025', 'gryspeerdt2022'],
  },
  {
    id: 'mpimet', name: 'MPI-M · Climate Physics', institution: 'Max Planck Institute for Meteorology', city: 'Hamburg', country: '德国', lat: 53.558, lon: 9.995, field: 'dynamics', maturity: 'pioneer', position: '云组织、湍流、尺度效应与气候反馈',
    leaders: [{ name: 'Bjorn Stevens', role: 'Climate Physics 部门主任', verifiedAt: 'MPI-M 官网' }],
    focus: '云量、湍流混合、对流组织和气候敏感性；大规模外场／模拟。',
    profile: '基础机制与科学组织型：围绕云组织和气候敏感性，推动观测与模拟大科学合作。',
    strong: '跨尺度云物理与 EUREC4A 外场科研组织积累。',
    caveat: '与船迹识别算法并非直接一一对应，是重要物理背景团队。',
    relevance: '高：船迹云的时空扩散与动力组织机制可借鉴。',
    sources: [{ label: 'MPI-M · Bjorn Stevens', url: 'https://mpimet.mpg.de/en/staff/bjorn-stevens' }, { label: 'MPI-M · EUREC4A', url: 'https://mpimet.mpg.de/en/communication/news/climate-factor-clouds-the-field-campaign-eurec4a-intends-to-answer-one-of-climate-sciences-great-mysteries' }],
    papers: ['glassmeier2021'],
  },
  {
    id: 'fsu', name: 'FSU · Aerosol–Cloud & MCB', institution: 'Florida State University · Earth, Ocean & Atmospheric Science', city: 'Tallahassee', country: '美国', lat: 30.438, lon: -84.298, field: 'causality', maturity: 'rising', position: '辐射归因与海洋云增亮科学问题',
    leaders: [{ name: 'Michael S. Diamond', role: '助理教授；官方确认云—气溶胶、MCB 方向', verifiedAt: 'FSU 官方教员介绍' }],
    focus: '船舶排放、辐射强迫的可观测性及海洋云增亮相关机理。',
    profile: '新生代问题驱动型：把天然航运排放扰动与辐射效应及气候干预评估联系起来。',
    strong: '2025 可检测船迹强迫占比研究的共同作者；独立教员科研方向明确。',
    caveat: '相对大型国家实验室，团队体量和基础设施不能只凭论文推断。',
    relevance: '极高：关注你的最终辐射强迫与反事实研究目标。',
    sources: [{ label: 'FSU · faculty', url: 'https://www.eoas.fsu.edu/people/academic-faculty/' }, { label: 'FSU · Profile', url: 'https://artsandsciences.fsu.edu/article/faculty-spotlight-michael-diamond' }],
    papers: ['yuan2025five'],
  },
  {
    id: 'cambridge', name: 'Cambridge · Climate Repair / Retrieval', institution: 'University of Cambridge · Centre for Climate Repair', city: 'Cambridge', country: '英国', lat: 52.205, lon: 0.119, field: 'retrieval', maturity: 'emerging', position: '船迹云反演假设与海洋云增亮证据质量',
    leaders: [{ name: 'Alice Cicirello', role: '2026 论文合作者；不据此推断中心负责人', verifiedAt: 'AMT 2026 论文' }, { name: 'Iarla Boyce', role: '2026 论文通讯作者；非已确认独立 PI', verifiedAt: 'AMT 2026 论文' }],
    focus: '利用理想化船迹测试双光谱反演有效方差假设。',
    profile: '精细化方法验证：侧重观测反演准确性和研究结论的测量前提。',
    strong: '2026 有正式同行评审成果，且与 Imperial 合作。',
    caveat: '这是特定论文研究方向聚类，不代表 Centre for Climate Repair 整体成熟度。',
    relevance: '高：云滴粒径和 LWP 诊断应加入反演系统误差检查。',
    sources: [{ label: 'AMT · 2026 论文与机构', url: 'https://amt.copernicus.org/articles/19/5475/2026/' }],
    papers: ['boyce2026'],
  },
  {
    id: 'hebeu', name: 'Hebei · FY-4B Ship-track Vision', institution: 'Hebei University of Engineering · School of Mathematical Sciences and Engineering', city: 'Handan', country: '中国', lat: 36.616, lon: 114.493, field: 'retrieval', maturity: 'rising', position: 'FY-4B 细线识别与时序分析的直接技术比较对象',
    leaders: [{ name: 'Qiaofen Zhu', role: '2026 论文通讯作者（学术角色）；独立 PI 身份未另行核实', verifiedAt: '2026 IJRS 作者单位及通讯地址' }, { name: 'Pinkui Hao', role: 'FY-4B 相关文章作者（非默认 PI）', verifiedAt: '2026 JARS / IJRS' }],
    focus: '静止卫星船迹与航迹云语义分割、线性结构感知和时序检测。',
    profile: '算法突破与场景应用型：以本土 FY-4B 时序遥感平台开发可执行识别框架。',
    strong: '2026 有同方向船迹和航迹云期刊工作，研究任务定义明确。',
    caveat: '领域积累度只评价 FY-4B 细分方向；不能据此推断实验室经费、规模或 PI 管理风格。',
    relevance: '极高：最接近你当前 FY-4B 船迹云识别算法的对标工作。',
    sources: [{ label: 'IJRS · 2026 作者单位', url: 'https://doi.org/10.1080/01431161.2026.2735049' }, { label: 'JARS · DOI', url: 'https://doi.org/10.1117/1.JRS.20.026514' }],
    papers: ['hu2026'],
  },
  {
    id: 'nsmc', name: 'NSMC · FY-4B satellite collaboration', institution: 'National Satellite Meteorological Centre · CMA', city: 'Beijing', country: '中国', lat: 39.905, lon: 116.395, field: 'retrieval', maturity: 'established', position: '业务卫星观测与科研成果的连接点',
    leaders: [{ name: 'Tao Wang', role: '上述 FY-4B 合作论文通讯作者；不是推定机构负责人', verifiedAt: '2026 IJRS 作者单位' }],
    focus: 'FY-4B AGRI 多时次观测与业务遥感能力支撑。',
    profile: '平台协作型：通过卫星观测能力与高校算法研究对接；并非以单篇论文代表全中心。',
    strong: '国家卫星资料基础设施带来的持续观测优势。',
    caveat: '“稳健型”指卫星业务体系，不表示其独立船迹云实验室研究梯队成熟度。',
    relevance: '极高：数据和仪器观测特征直接关系到 FY-4B 研究可行性。',
    sources: [{ label: 'IJRS · 2026 合作单位', url: 'https://doi.org/10.1080/01431161.2026.2735049' }],
    papers: ['hu2026'],
  },
  {
    id: 'leeds', name: 'Leeds · Aerosol–Cloud Climate Modelling', institution: 'University of Leeds · School of Earth and Environment', city: 'Leeds', country: '英国', lat: 53.806, lon: -1.555, field: 'model', maturity: 'established', position: '气溶胶–云–模式误差的量化',
    leaders: [{ name: 'Ken Carslaw', role: '长期 aerosol–cloud–climate 研究学者（具体当前管理任职须逐年核实）', verifiedAt: 'Leeds 项目介绍与 Science 2021' }],
    focus: '气溶胶与云气候效应跨尺度建模、模拟不确定性与自然实验。',
    profile: '全球模式及模型误差量化导向。',
    strong: '跨机构成果和模型–观测比较长期积累。',
    caveat: '本项目以公开论文代表研究流派，不断言当前独立团队组织结构。',
    relevance: '中高：辐射效应外推和气候模式约束值得跟进。',
    sources: [{ label: 'Leeds · 项目资料', url: 'https://see.leeds.ac.uk/fileadmin/Documents/Admissions/RPG/Projects/CarslawMarshamParker_Aerosol-cloud-climate_interactions_from_weather_to_climate_scales_WEB.pdf' }],
    papers: ['glassmeier2021'],
  },
];

/** The linked publication itself must contain representatives of both locations. */
export const collaborations: Collaboration[] = [
  { from: 'nasa', to: 'washington', paperId: 'yuan2026diel', description: '2026 船迹云日变化合作署名' },
  { from: 'nasa', to: 'fsu', paperId: 'yuan2025five', description: '2025 可检测船迹的辐射强迫代表性' },
  { from: 'imperial', to: 'cambridge', paperId: 'boyce2026', description: '2026 双光谱反演不确定性合作' },
  { from: 'imperial', to: 'delft', paperId: 'gryspeerdt2022', description: '短时标云发展与 ACI 约束合作' },
  { from: 'delft', to: 'noaa', paperId: 'glassmeier2021', description: 'Science 2021 船迹云外推分析' },
  { from: 'delft', to: 'leeds', paperId: 'glassmeier2021', description: 'Science 2021 多机构机理模拟' },
  { from: 'ucsd', to: 'oxford', paperId: 'manshausen2022', description: '2022 不可见船迹合作（作者论文时间所在团队不必同今）' },
  { from: 'ucsd', to: 'imperial', paperId: 'watson2022', description: '2022 排放法规影响合作（时间归属 caveat）' },
  { from: 'hebeu', to: 'nsmc', paperId: 'hu2026', description: '2026 FY-4B 研究的校–中心合作' },
];

export const readingPath = [
  { label: '看得见的船迹', description: '自动识别 → 漏检机制 → 完整生命周期', refs: ['yuan2019', 'hu2026'] },
  { label: '不只看得到的', description: '不可见船迹、选择偏差与反事实', refs: ['manshausen2022', 'wright2026', 'yuan2025five'] },
  { label: '物理因果', description: '日变化、云水调整、反演偏差', refs: ['yuan2026diel', 'boyce2026', 'gryspeerdt2022'] },
  { label: '辐射与机制外推', description: 'LES → 参数化 → 辐射强迫', refs: ['mcmichael2026', 'tippett2026', 'glassmeier2021', 'glassmeier2025', 'zhang2026arm'] },
];
