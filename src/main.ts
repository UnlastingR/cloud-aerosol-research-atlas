import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {
  collaborations, fieldInfo, maturityInfo, papers, readingPath, teams,
  type Field, type Maturity, type Paper, type Team,
} from './data';
import './style.css';

type Tab = 'teams' | 'papers' | 'path';
type Filter = Field | 'all';
type Level = Maturity | 'all';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('App mount is missing');

const state: {
  filter: Filter; level: Level; query: string; selected: string | null;
  tab: Tab; links: boolean; spin: boolean;
} = { filter: 'all', level: 'all', query: '', selected: 'nasa', tab: 'teams', links: true, spin: true };

const dateLabel = '2026.10.18';
const paperById = new Map(papers.map(p => [p.id, p]));
const teamById = new Map(teams.map(t => [t.id, t]));
const safe = (s: string) => s.replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);
const link = (url: string, label: string, cls = '') =>
  `<a class="${cls}" href="${safe(url)}" target="_blank" rel="noopener noreferrer">${safe(label)}<span aria-hidden="true"> ↗</span></a>`;
const paperUrl = (p: Paper) => p.doi ? `https://doi.org/${encodeURIComponent(p.doi)}` : '';
const labelFor = (m: Maturity) => maturityInfo[m].label;
const filtered = () => teams.filter(t => {
  const f = state.filter === 'all' || t.field === state.filter;
  const l = state.level === 'all' || t.maturity === state.level;
  const q = state.query.toLocaleLowerCase().trim();
  const match = !q || [t.name, t.institution, t.city, t.country,
    t.focus, t.leaders.map(leader => leader.name).join(' ')].join(' ').toLocaleLowerCase().includes(q);
  return f && l && match;
});

app.innerHTML = `
  <header class="topbar">
    <a class="brand" href="/" aria-label="Cloud Atlas 首页">
      <span class="brand-symbol" aria-hidden="true"><span class="orb"></span></span>
      <span class="brand-label"><strong>CLOUD<span> / </span>ATLAS</strong><small>GLOBAL RESEARCH INTELLIGENCE</small></span>
    </a>
    <span class="topline"><span class="status-light"></span> RESEARCH SNAPSHOT <b>${dateLabel}</b></span>
    <div class="header-right">
      <span class="header-note">SHIP TRACKS <span>·</span> AEROSOL–CLOUD <span>·</span> SATELLITE AI</span>
      <a class="source-button" href="https://github.com/UnlastingR/cloud-aerosol-research-atlas" target="_blank" rel="noopener noreferrer" aria-label="项目仓库">SOURCE ↗</a>
    </div>
  </header>

  <main class="layout">
    <aside class="left-panel">
      <div class="left-intro"><div class="eyebrow"><span class="line"></span> THE FIELD / 研究版图</div>
        <h1>探索正在<br /><em>重新定义云科学</em><br />的研究团队<span class="period">.</span></h1>
        <p>从船迹检测，到云微物理，再到气候辐射强迫。旋转地球，查看全球团队如何推动这些问题。</p>
      </div>

      <div class="metrics">
        <div><strong>${teams.length.toString().padStart(2, '0')}</strong><span>SELECTED TEAMS</span></div>
        <div><strong>${papers.length.toString().padStart(2, '0')}</strong><span>KEY PAPERS</span></div>
        <div><strong>${new Set(teams.map(t => t.country)).size.toString().padStart(2, '0')}</strong><span>COUNTRIES</span></div>
      </div>

      <div class="control-section">
        <div class="control-label">研究方向 <span>01 / FOCUS AREA</span></div>
        <div class="filter-list" id="field-filters"></div>
      </div>
      <div class="control-section">
        <div class="control-label">团队阶段 <span>02 / MATURITY</span></div>
        <div class="level-row" id="level-filters"></div>
        <p class="level-note">阶段指研究体系与公开成果积累，不是 PI 排名或个人能力测量。</p>
      </div>
      <div class="left-bottom"><span>RESEARCH, NOT A RANKING.</span><span class="mono">01—04</span></div>
    </aside>

    <section class="globe-stage" aria-label="可交互的全球研究团队三维地球">
      <div class="stage-grid"></div>
      <div class="stage-head"><span>FIG 01 <span class="stage-dash">—</span> DISTRIBUTION OF RESEARCH GROUPS</span>
        <span class="coordinates" id="coords">LAT 00.0° / LON 00.0°</span></div>
      <div class="globe-canvas" id="globe-canvas"></div>
      <div class="globe-labels" id="globe-labels" aria-hidden="true"></div>
      <div class="stage-overlay-top"><span class="pulse-pin"></span> ${teams.length} RESEARCH NODES ONLINE</div>
      <div class="globe-instructions"><span>↔</span> 拖动旋转 <i>·</i> 滚轮缩放 <i>·</i> 点击定位</div>
      <div class="stage-footer">
        <div class="legend"><span class="legend-dot" style="--dot:#5ec7f8"></span>遥感
          <span class="legend-dot" style="--dot:#68e1ba"></span>物理
          <span class="legend-dot" style="--dot:#f8c983"></span>归因
          <span class="legend-dot" style="--dot:#bf9df9"></span>模拟
          <span class="legend-dot" style="--dot:#ff91b5"></span>AI</div>
        <div class="map-controls">
          <button id="spin" title="切换地球自动旋转" aria-pressed="true">Ⅱ AUTO</button>
          <button id="links" title="切换有论文依据的合作关系线" aria-pressed="true">◎ LINKS</button>
          <button id="reset-view" title="重置地图视角">⟳ RESET</button>
        </div>
      </div>
    </section>

    <aside class="right-panel">
      <div class="right-head"><span class="eyebrow">FIELD NOTES / 学术情报</span>
        <div class="tabs" role="tablist" aria-label="资料面板">
          <button data-tab="teams" class="active" role="tab">团队</button>
          <button data-tab="papers" role="tab">论文</button>
          <button data-tab="path" role="tab">研究路线</button>
        </div>
      </div>
      <div class="right-content" id="detail"></div>
      <div class="right-footer"><span>CURATED · EVIDENCE-LINKED</span><span>2026 / OCT</span></div>
    </aside>
  </main>
  <footer class="site-footer">
    <span>© 2026 CLOUD ATLAS <span class="footer-sep">/</span> A RESEARCH EXPLORATION PROJECT</span>
    <span>INSTITUTIONAL COORDINATES ARE APPROXIMATE <span class="footer-sep">·</span> ${dateLabel}</span>
  </footer>
`;

const filters = app.querySelector<HTMLDivElement>('#field-filters')!;
const levels = app.querySelector<HTMLDivElement>('#level-filters')!;
const detail = app.querySelector<HTMLDivElement>('#detail')!;
const labels = app.querySelector<HTMLDivElement>('#globe-labels')!;
const stage = app.querySelector<HTMLDivElement>('#globe-canvas')!;

function renderFilters() {
  filters.innerHTML = ([['all', { name: '全部研究方向', short: '全部', color: '#e8f4ff' }], ...Object.entries(fieldInfo)] as [Filter, {name: string; short: string; color: string}][])
    .map(([key, info]) => `<button class="filter-item ${state.filter === key ? 'active' : ''}" data-field="${key}">
      <span class="filter-left"><span class="field-dot" style="--dot:${info.color}"></span>${info.name}</span>
      <span class="filter-count">${key === 'all' ? teams.length : teams.filter(t => t.field === key).length}</span></button>`).join('');
  levels.innerHTML = ([['all', '全部'], ...Object.entries(maturityInfo).map(([k, v]) => [k, v.label])] as [Level, string][])
    .map(([key, label]) => `<button data-level="${key}" class="${state.level === key ? 'active' : ''}">${label}</button>`).join('');
}

function paperCard(p: Paper, compact = false) {
  return `<article class="paper-card ${compact ? 'paper-compact' : ''}">
    <div class="paper-top"><span>${p.year} <span class="slash">/</span> ${safe(p.journal)}</span><span class="status ${p.status === 'preprint' ? 'preprint' : ''}">${p.status === 'journal' ? 'PEER REVIEWED' : 'PREPRINT / VERIFY'}</span></div>
    <div class="paper-title">${p.doi ? link(paperUrl(p), p.title) : safe(p.title)}</div>
    <div class="paper-author">${safe(p.authors)}</div>
    ${compact ? '' : `<p>${safe(p.insight)}</p>`}
  </article>`;
}

function teamDetail(t: Team) {
  const color = fieldInfo[t.field].color;
  const refs = t.papers.map(id => paperById.get(id)).filter((p): p is Paper => !!p);
  return `
    <div class="detail-hero" style="--accent:${color}">
      <div class="detail-index">RESEARCH NODE <span>#${String(teams.indexOf(t) + 1).padStart(2, '0')}</span></div>
      <div class="profile-marker"><span class="field-dot" style="--dot:${color}"></span>${fieldInfo[t.field].name}</div>
      <h2>${safe(t.name)}</h2>
      <div class="location">⌖ ${safe(t.city)} · ${safe(t.country)}<span class="loc-sep">/</span>${safe(t.institution)}</div>
      <div class="tags"><span>${labelFor(t.maturity)}</span><span>${refs.length} 代表文献</span></div>
    </div>
    <div class="detail-block"><div class="block-label"><span>01</span> SCIENTIFIC POSITION</div>
      <h3>${safe(t.position)}</h3><p>${safe(t.focus)}</p></div>
    <div class="detail-block"><div class="block-label"><span>02</span> PUBLIC LEADERSHIP</div>
      ${t.leaders.map(l => `<div class="leader"><strong>${safe(l.name)}</strong><span>${safe(l.role)}</span><small>证据：${safe(l.verifiedAt)}</small></div>`).join('')}
      <p class="profile-text"><b>研究风格画像 /</b> ${safe(t.profile)}</p></div>
    <div class="detail-block"><div class="block-label"><span>03</span> EVIDENCE & ASSESSMENT</div>
      <div class="assessment"><div class="assessment-row"><span>阶段</span><strong>${labelFor(t.maturity)}</strong></div>
        <div class="assessment-row"><span>核心强项</span><p>${safe(t.strong)}</p></div>
        <div class="assessment-row"><span>评价限制</span><p>${safe(t.caveat)}</p></div>
        <div class="assessment-row"><span>对本课题</span><p>${safe(t.relevance)}</p></div>
      </div></div>
    <div class="detail-block"><div class="block-label"><span>04</span> PRIMARY SOURCES</div>
      <div class="source-list">${t.sources.map(s => link(s.url, s.label, 'source-link')).join('')}</div></div>
    <div class="detail-block"><div class="block-label"><span>05</span> SELECTED READING</div>
      <div class="paper-stack">${refs.map(p => paperCard(p, true)).join('')}</div></div>
  `;
}

function renderDetail() {
  app!.querySelectorAll<HTMLButtonElement>('[data-tab]').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === state.tab);
    b.setAttribute('aria-selected', String(b.dataset.tab === state.tab));
  });
  if (state.tab === 'papers') {
    const ordered = [...papers].sort((a,b) => (b.published ?? String(b.year)).localeCompare(a.published ?? String(a.year)));
    detail.innerHTML = `<div class="panel-intro"><div class="intro-ordinal">02 / READING ROOM</div><h2>文献前沿<span>.</span></h2>
       <p>优先标注 2026 年研究。预印本、尚待核实的条目与正式期刊论文严格分开。</p>
       <div class="small-metric">${papers.filter(p => p.year === 2026).length} 篇 / 2026 年收录</div></div>
       <div class="paper-stack">${ordered.map(p => paperCard(p)).join('')}</div>`;
  } else if (state.tab === 'path') {
    detail.innerHTML = `<div class="panel-intro"><div class="intro-ordinal">03 / RESEARCH ROADMAP</div><h2>从识别<br />到因果<span>.</span></h2>
      <p>给卫星船迹云博士课题的一条进阶读文献路线。每一步要解决新的科学问题，而不仅提高模型指标。</p></div>
      <div class="path-stack">${readingPath.map((item, i) => `<div class="path-step"><div class="path-index">0${i+1}</div><div><h3>${safe(item.label)}</h3><p>${safe(item.description)}</p>
      ${item.refs.map(id => paperById.get(id)).filter((p): p is Paper => !!p).map(p => `<div class="path-ref">${p.doi ? link(paperUrl(p), p.title) : safe(p.title)}</div>`).join('')}</div></div>`).join('')}</div>
      <div class="method-warning"><strong>读图提示</strong><p>同一篇合著论文只说明存在科研合作，不表示团队之间存在正式合作协议；“人物画像”仅来自公开学术行为，不推断性格和私人特征。</p></div>`;
  } else {
    const visible = filtered();
    const sel = state.selected ? teamById.get(state.selected) : null;
    detail.innerHTML = `<div class="find-header"><span>${visible.length} / ${teams.length} NODES</span><label class="search-box"><span aria-hidden="true">⌕</span>
      <input id="team-search" type="search" value="${safe(state.query)}" placeholder="搜索团队 / PI / 城市" autocomplete="off" aria-label="搜索研究团队"></label></div>
      <div class="team-list" id="team-list">${visible.map((t, i) => `<button data-team="${t.id}" class="team-row ${t.id === state.selected ? 'active' : ''}">
        <span class="team-number">${String(i+1).padStart(2, '0')}</span><span class="team-row-content"><strong>${safe(t.name)}</strong><small>${safe(t.city)} · ${safe(t.leaders[0]?.name ?? '')}</small></span>
        <span class="team-arrow">↗</span></button>`).join('') || '<div class="empty">没有符合条件的团队。尝试清除搜索词或筛选。</div>'}</div>
      ${sel && visible.some(t => t.id === sel.id) ? teamDetail(sel) : `<div class="empty-info">选择一个研究节点，查看研究方向、人物画像、成熟度、证据和论文。</div>`}
      <div class="method-warning"><strong>评价声明</strong><p>仅依据公开论文和机构资料，非全领域普查。论文数量和团队阶段不构成研究质量排名。</p></div>`;
  }
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(39, 1, 0.1, 120);
camera.position.set(0, 1.0, 8.4);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setClearColor(0x07111b, 0);
stage.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 3.7;
controls.maxDistance = 12.5;
controls.enablePan = false;
controls.rotateSpeed = 0.48;
controls.autoRotate = state.spin;
controls.autoRotateSpeed = 0.36;
scene.add(new THREE.AmbientLight(0xa2caff, 0.88));
const sun = new THREE.DirectionalLight(0xe9f6ff, 3.2);
sun.position.set(5, 3, 7);
scene.add(sun);
const backside = new THREE.DirectionalLight(0x275f9d, 0.8);
backside.position.set(-4, -1, -5);
scene.add(backside);

const radius = 2.28;
function fallbackTexture() {
  const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, '#153b5b'); grad.addColorStop(.52, '#0a2945'); grad.addColorStop(1, '#0c2438');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, 1024, 512);
  const shape = (points: [number, number][]) => {
    ctx.beginPath();
    points.forEach(([lon, lat], i) => { const x = ((lon+180)/360)*1024; const y=((90-lat)/180)*512; if (!i) ctx.moveTo(x,y); else ctx.lineTo(x,y); });
    ctx.closePath(); ctx.fill();
  };
  ctx.fillStyle = '#315a5d';
  shape([[-168,66],[-130,72],[-112,69],[-95,78],[-52,61],[-59,48],[-78,42],[-82,26],[-98,17],[-105,26],[-117,32],[-127,48],[-168,66]]);
  shape([[-80,13],[-61,11],[-49,-1],[-35,-7],[-49,-25],[-53,-38],[-71,-55],[-77,-36],[-82,-8],[-80,13]]);
  shape([[-13,36],[-17,19],[-9,0],[11,-35],[20,-35],[35,-12],[51,12],[38,29],[23,32],[10,37],[-13,36]]);
  shape([[-11,36],[-10,58],[3,60],[20,69],[35,71],[49,59],[72,55],[90,59],[120,55],[145,48],[158,58],[178,62],[180,40],[141,25],[120,12],[109,0],[100,13],[81,7],[70,18],[50,26],[37,39],[26,43],[13,45],[-11,36]]);
  shape([[112,-11],[132,-12],[153,-28],[146,-39],[116,-35],[112,-11]]);
  shape([[43,-12],[50,-12],[50,-25],[45,-26],[43,-12]]);
  ctx.globalAlpha = .22;
  ctx.fillStyle = '#97b9a0'; ctx.fillRect(0, 0, 1024, 8); ctx.globalAlpha = 1;
  return new THREE.CanvasTexture(canvas);
}
const globeMaterial = new THREE.MeshStandardMaterial({
  map: fallbackTexture(), roughness: 0.96, metalness: 0.0, color: 0xb1d2eb,
});
const globe = new THREE.Mesh(new THREE.SphereGeometry(radius, 96, 64), globeMaterial);
scene.add(globe);
new THREE.TextureLoader().load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg',
  t => { t.colorSpace = THREE.SRGBColorSpace; globeMaterial.map?.dispose(); globeMaterial.map = t; globeMaterial.color.set('#8cb9d8'); globeMaterial.needsUpdate = true; }, undefined, () => {});
const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(radius * 1.07, 72, 48),
  new THREE.ShaderMaterial({
    uniforms: { glowColor: { value: new THREE.Color('#4c9ddd') } },
    vertexShader: `varying vec3 vN; varying vec3 vEye; void main(){vec4 worldPos=modelMatrix*vec4(position,1.); vN=normalize(mat3(modelMatrix)*normal); vEye=normalize(cameraPosition-worldPos.xyz); gl_Position=projectionMatrix*viewMatrix*worldPos;}`,
    fragmentShader: `uniform vec3 glowColor; varying vec3 vN; varying vec3 vEye; void main(){float rim=pow(1.0-max(0.,dot(normalize(vN),normalize(vEye))),3.5); gl_FragColor=vec4(glowColor, rim*.25);}`,
    transparent: true, depthWrite: false, side: THREE.FrontSide,
  }));
scene.add(atmosphere);

const starsGeometry = new THREE.BufferGeometry();
const stars = new Float32Array(700 * 3);
for (let i=0; i<700; i++) {
  const theta = Math.random()*Math.PI*2, u=Math.random()*2-1, r=22+Math.random()*28;
  stars[i*3]=r*Math.sqrt(1-u*u)*Math.cos(theta);
  stars[i*3+1]=r*u;
  stars[i*3+2]=r*Math.sqrt(1-u*u)*Math.sin(theta);
}
starsGeometry.setAttribute('position', new THREE.BufferAttribute(stars,3));
scene.add(new THREE.Points(starsGeometry, new THREE.PointsMaterial({ color: 0x85a2b9, size: .045, transparent: true, opacity: .42 })));

function coords(lat: number, lon: number, r: number) {
  const a = THREE.MathUtils.degToRad(lat), b=THREE.MathUtils.degToRad(lon);
  return new THREE.Vector3(r*Math.cos(a)*Math.sin(b), r*Math.sin(a), r*Math.cos(a)*Math.cos(b));
}
const markerMeshes: THREE.Mesh[] = [];
const markers = new Map<string, { mesh: THREE.Mesh; halo: THREE.Mesh; position: THREE.Vector3; label: HTMLDivElement }>();
for (const t of teams) {
  const position = coords(t.lat,t.lon,radius+.045);
  const material = new THREE.MeshBasicMaterial({color: fieldInfo[t.field].color});
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(.044, 14,14),material);
  mesh.position.copy(position); mesh.userData.teamId=t.id; scene.add(mesh); markerMeshes.push(mesh);
  const halo = new THREE.Mesh(new THREE.SphereGeometry(.106, 20, 20),
    new THREE.MeshBasicMaterial({color:fieldInfo[t.field].color, transparent:true,opacity:.20, depthWrite:false}));
  halo.position.copy(position); scene.add(halo);
  const label = document.createElement('div'); label.className='map-node-label';
  label.textContent=t.city.toUpperCase(); labels.appendChild(label);
  markers.set(t.id,{mesh,halo,position,label});
}
const arcs = collaborations.map(c => {
  const a=teamById.get(c.from)!, b=teamById.get(c.to)!;
  const p=coords(a.lat,a.lon,1).normalize(), q=coords(b.lat,b.lon,1).normalize();
  const angle=p.angleTo(q);
  const points: THREE.Vector3[]=[];
  for(let i=0;i<=90;i++){const t=i/90; const loc=p.clone().multiplyScalar(1-t).add(q.clone().multiplyScalar(t)).normalize();
    loc.multiplyScalar(radius+.08+Math.sin(t*Math.PI)*Math.max(.11,angle*.46)); points.push(loc);}
  const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineBasicMaterial({ color: 0x70bbdd, transparent:true, opacity:.26, depthWrite:false }));
  scene.add(line); return { ...c, line };
});

let targetCamera: THREE.Vector3 | null = null;
function selectTeam(id: string, fly = true) {
  if (!teamById.has(id)) return;
  state.selected=id; state.tab='teams';
  // Revealing a filtered-out selection should not silently hide it.
  if (!filtered().some(t=>t.id===id)) {state.filter='all';state.level='all';state.query='';renderFilters();}
  renderDetail(); updateNodes();
  if (fly) {
    const p=markers.get(id)!.position.clone().normalize();
    targetCamera=p.multiplyScalar(6.0);
    state.spin=false; controls.autoRotate=false;
    syncButtons();
  }
  const chosen=app!.querySelector<HTMLButtonElement>(`[data-team="${id}"]`);
  chosen?.scrollIntoView({block:'nearest',behavior:'smooth'});
}
function updateNodes() {
  const visible = new Set(filtered().map(t => t.id));
  for (const [id,m] of markers) {
    m.mesh.visible=visible.has(id); m.halo.visible=visible.has(id);
    m.label.style.display=visible.has(id)?'':'none';
    const isSelected=id===state.selected;
    m.mesh.scale.setScalar(isSelected?1.7:1);
    m.halo.scale.setScalar(isSelected?1.65:1);
    (m.halo.material as THREE.MeshBasicMaterial).opacity=isSelected?.5:.2;
  }
  for (const arc of arcs) {
    arc.line.visible=state.links && visible.has(arc.from) && visible.has(arc.to);
    (arc.line.material as THREE.LineBasicMaterial).opacity=state.selected && (arc.from===state.selected||arc.to===state.selected)?.68:.2;
  }
}
function syncButtons() {
  const spin=app!.querySelector<HTMLButtonElement>('#spin')!, links=app!.querySelector<HTMLButtonElement>('#links')!;
  spin.setAttribute('aria-pressed',String(state.spin)); spin.textContent=state.spin?'Ⅱ AUTO':'▶ AUTO';
  links.setAttribute('aria-pressed',String(state.links));
}
function resize() {
  const {width,height} = stage.getBoundingClientRect();
  if (!width || !height) return;
  camera.aspect = width/height; camera.updateProjectionMatrix();
  renderer.setSize(width,height,false);
}
const observer = new ResizeObserver(resize); observer.observe(stage); resize();
const raycaster = new THREE.Raycaster(); const mouse = new THREE.Vector2();
let pointerStart = {x:0,y:0};
renderer.domElement.addEventListener('pointerdown', e => { pointerStart={x:e.clientX,y:e.clientY}; });
renderer.domElement.addEventListener('pointerup', e => {
  if (Math.hypot(e.clientX-pointerStart.x,e.clientY-pointerStart.y)>6) return;
  const rect=renderer.domElement.getBoundingClientRect();
  mouse.set(((e.clientX-rect.left)/rect.width)*2-1,-((e.clientY-rect.top)/rect.height)*2+1);
  raycaster.setFromCamera(mouse,camera);
  const hit=raycaster.intersectObjects(markerMeshes).find(i=>i.object.visible && i.object.userData.teamId);
  if(hit) selectTeam(hit.object.userData.teamId as string);
});
controls.addEventListener('start',() => {targetCamera=null; if (state.spin){state.spin=false;controls.autoRotate=false;syncButtons();}});
let last=0;
function animate(timestamp=0) {
  requestAnimationFrame(animate);
  if (timestamp-last < 15) return; last=timestamp;
  if(targetCamera) {camera.position.lerp(targetCamera,.055); if(camera.position.distanceTo(targetCamera)<.035) targetCamera=null;}
  controls.update();
  const rect=stage.getBoundingClientRect(), cameraN=camera.position.clone().normalize();
  for (const m of markers.values()) {
    if (!m.mesh.visible) continue;
    const front=m.position.clone().normalize().dot(cameraN)>.09;
    m.label.style.opacity=front?'1':'0';
    if (!front) continue;
    const screen=m.position.clone().multiplyScalar(1.055).project(camera);
    m.label.style.transform=`translate(-50%,-100%) translate(${(screen.x*.5+.5)*rect.width}px,${(-screen.y*.5+.5)*rect.height-7}px)`;
  }
  const n=camera.position.clone().normalize();
  const lat=THREE.MathUtils.radToDeg(Math.asin(n.y));
  const lon=THREE.MathUtils.radToDeg(Math.atan2(n.x,n.z));
  app!.querySelector('#coords')!.textContent=`LAT ${Math.abs(lat).toFixed(1)}°${lat>=0?'N':'S'} / LON ${Math.abs(lon).toFixed(1)}°${lon>=0?'E':'W'}`;
  renderer.render(scene,camera);
}
requestAnimationFrame(animate);

app.addEventListener('click', e => {
  const target=e.target as HTMLElement;
  const fieldBtn=target.closest<HTMLButtonElement>('[data-field]');
  if(fieldBtn){state.filter=fieldBtn.dataset.field as Filter;renderFilters();renderDetail();updateNodes();return;}
  const levelBtn=target.closest<HTMLButtonElement>('[data-level]');
  if(levelBtn){state.level=levelBtn.dataset.level as Level;renderFilters();renderDetail();updateNodes();return;}
  const teamBtn=target.closest<HTMLButtonElement>('[data-team]');
  if(teamBtn){selectTeam(teamBtn.dataset.team!,true);return;}
  const tabBtn=target.closest<HTMLButtonElement>('[data-tab]');
  if(tabBtn){state.tab=tabBtn.dataset.tab as Tab;renderDetail();return;}
  if(target.closest('#spin')) {state.spin=!state.spin;controls.autoRotate=state.spin;targetCamera=null;syncButtons();return;}
  if(target.closest('#links')) {state.links=!state.links;syncButtons();updateNodes();return;}
  if(target.closest('#reset-view')) {
    state.filter='all';state.level='all';state.query='';state.selected='nasa';
    state.spin=true;state.links=true;controls.autoRotate=true;targetCamera=new THREE.Vector3(0,1,8.4);
    renderFilters();renderDetail();updateNodes();syncButtons();
  }
});
app.addEventListener('input', e=>{
  const el=e.target as HTMLInputElement;
  if(el.id!=='team-search')return;
  state.query=el.value;
  const pos=el.selectionStart ?? el.value.length;
  renderDetail();updateNodes();
  const replacement=app!.querySelector<HTMLInputElement>('#team-search');
  replacement?.focus();replacement?.setSelectionRange(pos,pos);
});

renderFilters();
renderDetail();
updateNodes();
syncButtons();
