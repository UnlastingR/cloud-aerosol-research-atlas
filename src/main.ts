import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { latLonToCartesian, cartesianToLatLon } from './geo';
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
} = { filter: 'all', level: 'all', query: '', selected: 'hebeu', tab: 'teams', links: false, spin: false };

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
      <span class="brand-symbol" aria-hidden="true">◉</span>
      <span class="brand-label"><strong>Cloud Atlas</strong><small>全球云与气溶胶研究地图</small></span>
    </a>
    <div class="header-right">
      <span class="topline">更新于 ${dateLabel}</span>
      <a class="source-button" href="https://github.com/UnlastingR/cloud-aerosol-research-atlas" target="_blank" rel="noopener noreferrer" aria-label="项目仓库">GitHub ↗</a>
    </div>
  </header>

  <main class="layout">
    <aside class="left-panel">
      <div class="left-intro"><div class="eyebrow">全球研究版图</div>
        <h1>谁在研究<br /><em>船迹云？</em></h1>
        <p>探索重要团队、代表论文与研究方向。</p>
      </div>

      <div class="metrics">
        <div><strong>${teams.length}</strong><span>团队</span></div>
        <div><strong>${papers.length}</strong><span>论文</span></div>
        <div><strong>${new Set(teams.map(t => t.country)).size}</strong><span>国家</span></div>
      </div>

      <div class="control-section">
        <div class="control-label">研究方向</div>
        <div class="filter-list" id="field-filters"></div>
      </div>
      <div class="control-section">
        <div class="control-label">团队阶段</div>
        <div class="level-row" id="level-filters"></div>
      </div>
    </aside>

    <section class="globe-stage" aria-label="可交互的全球研究团队三维地球">
      <div class="stage-head"><span>全球研究团队</span><span class="coordinates" id="coords">0°N 0°E</span></div>
      <div class="globe-canvas" id="globe-canvas"></div>
      <div class="globe-labels" id="globe-labels"></div>
      <div class="cluster-menu" id="cluster-menu" hidden></div>
      <div class="globe-instructions">拖动旋转 · 滚轮缩放 · 点击团队或聚合点</div>
      <div class="stage-footer">
        <div class="map-tip">点击聚合点可选择附近团队</div>
        <div class="map-controls">
          <button id="spin" title="切换自动旋转" aria-pressed="false">自动旋转</button>
          <button id="links" title="切换论文合作连线" aria-pressed="false">合作关系</button>
          <button id="reset-view" title="重置地图视角">重置视角</button>
        </div>
      </div>
    </section>

    <aside class="right-panel">
      <div class="right-head">
        <div class="tabs" role="tablist" aria-label="资料面板">
          <button data-tab="teams" class="active" role="tab">团队</button>
          <button data-tab="papers" role="tab">论文</button>
          <button data-tab="path" role="tab">研究路线</button>
        </div>
      </div>
      <div class="right-content" id="detail"></div>
    </aside>
  </main>
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
    <div class="paper-top"><span>${p.year} · ${safe(p.journal)}</span>${p.status === 'preprint' ? '<span class="status preprint">预印本</span>' : ''}</div>
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
      <div class="profile-marker"><span class="field-dot" style="--dot:${color}"></span>${fieldInfo[t.field].name}</div>
      <h2>${safe(t.name)}</h2>
      <div class="location">${safe(t.city)} · ${safe(t.country)}<br>${safe(t.institution)}</div>
      <div class="tags"><span>${labelFor(t.maturity)}</span><span>${refs.length} 篇代表文献</span></div>
    </div>
    <div class="detail-block"><h3>研究重点</h3>
      <p class="focus">${safe(t.focus)}</p>
      <p>${safe(t.position)}</p></div>
    <div class="detail-block"><h3>代表人物</h3>
      ${t.leaders.map(l => `<div class="leader"><strong>${safe(l.name)}</strong><span>${safe(l.role)}</span></div>`).join('')}
      <p>${safe(t.profile)}</p></div>
    <details class="detail-disclosure"><summary>团队评估与局限</summary>
      <div class="assessment"><div class="assessment-row"><span>阶段</span><strong>${labelFor(t.maturity)}</strong></div>
        <div class="assessment-row"><span>核心强项</span><p>${safe(t.strong)}</p></div>
        <div class="assessment-row"><span>评价限制</span><p>${safe(t.caveat)}</p></div>
        <div class="assessment-row"><span>对本课题</span><p>${safe(t.relevance)}</p></div>
      </div></details>
    <details class="detail-disclosure"><summary>代表论文（${refs.length}）</summary>
      <div class="paper-stack">${refs.map(p => paperCard(p, true)).join('')}</div></details>
    <div class="detail-block"><h3>来源</h3>
      <div class="source-list">${t.sources.map(s => link(s.url, s.label, 'source-link')).join('')}</div></div>
  `;
}

function renderDetail() {
  app!.querySelectorAll<HTMLButtonElement>('[data-tab]').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === state.tab);
    b.setAttribute('aria-selected', String(b.dataset.tab === state.tab));
  });
  if (state.tab === 'papers') {
    const ordered = [...papers].sort((a,b) => (b.published ?? String(b.year)).localeCompare(a.published ?? String(a.year)));
    detail.innerHTML = `<div class="panel-intro"><h2>文献前沿</h2>
       <p>${papers.filter(p => p.year === 2026).length} 篇 2026 年文献，按最新发表时间排列。</p></div>
       <div class="paper-stack">${ordered.map(p => paperCard(p)).join('')}</div>`;
  } else if (state.tab === 'path') {
    detail.innerHTML = `<div class="panel-intro"><h2>从识别到因果</h2>
      <p>船迹云研究的四步阅读路线。</p></div>
      <div class="path-stack">${readingPath.map((item, i) => `<div class="path-step"><div class="path-index">0${i+1}</div><div><h3>${safe(item.label)}</h3><p>${safe(item.description)}</p>
      ${item.refs.map(id => paperById.get(id)).filter((p): p is Paper => !!p).map(p => `<div class="path-ref">${p.doi ? link(paperUrl(p), p.title) : safe(p.title)}</div>`).join('')}</div></div>`).join('')}</div>
      <details class="detail-disclosure"><summary>关于资料与评价</summary><p>合作连线基于论文合著；团队画像仅反映公开研究方向，不评价个人品格。</p></details>`;
  } else {
    const visible = filtered();
    const sel = state.selected ? teamById.get(state.selected) : null;
    detail.innerHTML = `<div class="find-header"><span>${visible.length} 个团队</span><label class="search-box"><span aria-hidden="true">⌕</span>
      <input id="team-search" type="search" value="${safe(state.query)}" placeholder="搜索团队 / PI / 城市" autocomplete="off" aria-label="搜索研究团队"></label></div>
      <div class="team-list" id="team-list">${visible.map((t, i) => `<button data-team="${t.id}" class="team-row ${t.id === state.selected ? 'active' : ''}">
        <span class="team-row-content"><strong>${safe(t.name)}</strong><small>${safe(t.city)} · ${safe(t.leaders[0]?.name ?? '')}</small></span>
        <span class="team-arrow">↗</span></button>`).join('') || '<div class="empty">没有符合条件的团队。尝试清除搜索词或筛选。</div>'}</div>
      ${sel && visible.some(t => t.id === sel.id) ? teamDetail(sel) : `<div class="empty-info">选择一个研究节点，查看研究方向、人物画像、成熟度、证据和论文。</div>`}
      <div class="method-warning">基于公开论文与机构资料整理。成熟度仅作参考。</div>`;
  }
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(39, 1, 0.1, 120);
const homePosition = new THREE.Vector3(...latLonToCartesian(37, 67, 8.4));
camera.position.copy(homePosition);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setClearColor(0xf0f5f9, 0);
stage.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 2.8;
controls.maxDistance = 12.5;
controls.enablePan = false;
controls.rotateSpeed = 0.48;
controls.autoRotate = state.spin;
controls.autoRotateSpeed = 0.36;
scene.add(new THREE.AmbientLight(0xffffff, 2.0));
const sun = new THREE.DirectionalLight(0xffffff, 2.35);
sun.position.set(5, 3, 7);
scene.add(sun);
const backside = new THREE.DirectionalLight(0xc1daea, 1.0);
backside.position.set(-4, -1, -5);
scene.add(backside);

const radius = 2.28;
function fallbackTexture() {
  const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, '#c8e5ef'); grad.addColorStop(.52, '#b0d4e4'); grad.addColorStop(1, '#bcd8e7');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, 1024, 512);
  const shape = (points: [number, number][]) => {
    ctx.beginPath();
    points.forEach(([lon, lat], i) => { const x = ((lon+180)/360)*1024; const y=((90-lat)/180)*512; if (!i) ctx.moveTo(x,y); else ctx.lineTo(x,y); });
    ctx.closePath(); ctx.fill();
  };
  ctx.fillStyle = '#b6c9bd';
  shape([[-168,66],[-130,72],[-112,69],[-95,78],[-52,61],[-59,48],[-78,42],[-82,26],[-98,17],[-105,26],[-117,32],[-127,48],[-168,66]]);
  shape([[-80,13],[-61,11],[-49,-1],[-35,-7],[-49,-25],[-53,-38],[-71,-55],[-77,-36],[-82,-8],[-80,13]]);
  shape([[-13,36],[-17,19],[-9,0],[11,-35],[20,-35],[35,-12],[51,12],[38,29],[23,32],[10,37],[-13,36]]);
  shape([[-11,36],[-10,58],[3,60],[20,69],[35,71],[49,59],[72,55],[90,59],[120,55],[145,48],[158,58],[178,62],[180,40],[141,25],[120,12],[109,0],[100,13],[81,7],[70,18],[50,26],[37,39],[26,43],[13,45],[-11,36]]);
  shape([[112,-11],[132,-12],[153,-28],[146,-39],[116,-35],[112,-11]]);
  shape([[43,-12],[50,-12],[50,-25],[45,-26],[43,-12]]);
  ctx.globalAlpha = .22;
  ctx.fillStyle = '#b2ced9'; ctx.fillRect(0, 0, 1024, 8); ctx.globalAlpha = 1;
  return new THREE.CanvasTexture(canvas);
}
const globeMaterial = new THREE.MeshStandardMaterial({
  map: fallbackTexture(), roughness: 1, metalness: 0, color: 0xffffff,
});
const globe = new THREE.Mesh(new THREE.SphereGeometry(radius, 96, 64), globeMaterial);
scene.add(globe);
new THREE.TextureLoader().load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg',
  t => { t.colorSpace = THREE.SRGBColorSpace; globeMaterial.map?.dispose(); globeMaterial.map = t; globeMaterial.color.set('#e4f4f3'); globeMaterial.needsUpdate = true; }, undefined, () => {});
const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(radius * 1.07, 72, 48),
  new THREE.ShaderMaterial({
    uniforms: { glowColor: { value: new THREE.Color('#6ca3c0') } },
    vertexShader: `varying vec3 vN; varying vec3 vEye; void main(){vec4 worldPos=modelMatrix*vec4(position,1.); vN=normalize(mat3(modelMatrix)*normal); vEye=normalize(cameraPosition-worldPos.xyz); gl_Position=projectionMatrix*viewMatrix*worldPos;}`,
    fragmentShader: `uniform vec3 glowColor; varying vec3 vN; varying vec3 vEye; void main(){float rim=pow(1.0-max(0.,dot(normalize(vN),normalize(vEye))),3.5); gl_FragColor=vec4(glowColor, rim*.18);}`,
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
// White editorial background: no star field.

function coords(lat: number, lon: number, r: number) {
  return new THREE.Vector3(...latLonToCartesian(lat, lon, r));
}
const markerMeshes: THREE.Mesh[] = [];
const markers = new Map<string, { mesh: THREE.Mesh; halo: THREE.Mesh; hit: THREE.Mesh; position: THREE.Vector3; label: HTMLButtonElement }>();
for (const t of teams) {
  const position = coords(t.lat,t.lon,radius+.045);
  const material = new THREE.MeshBasicMaterial({color: fieldInfo[t.field].color});
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(.050, 16,16),material);
  mesh.position.copy(position); scene.add(mesh);
  const halo = new THREE.Mesh(new THREE.SphereGeometry(.096, 20, 20),
    new THREE.MeshBasicMaterial({color:fieldInfo[t.field].color, transparent:true,opacity:.14, depthWrite:false}));
  halo.position.copy(position); scene.add(halo);
  // A separate (larger) hit target keeps tiny close-up dots clickable.
  const hit = new THREE.Mesh(new THREE.SphereGeometry(.105, 12, 12),
    new THREE.MeshBasicMaterial({transparent:true, opacity:0, depthWrite:false}));
  hit.position.copy(position); hit.userData.teamId=t.id;
  scene.add(hit); markerMeshes.push(hit);
  const label = document.createElement('button');
  label.type='button'; label.className='map-node-label';
  label.dataset.team=t.id; label.textContent=t.city; labels.appendChild(label);
  markers.set(t.id,{mesh,halo,hit,position,label});
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
const clusterMenu = app.querySelector<HTMLDivElement>('#cluster-menu')!;
const clusterButtons = new Map<string,HTMLButtonElement>();
const clusterItems = new Map<string,string[]>();
const clusteredIds = new Set<string>();
function closeCluster() { clusterMenu.hidden=true; }
function showCluster(ids: string[]) {
  const group = ids.map(id=>teamById.get(id)!).filter(Boolean);
  if (!group.length) return;
  state.spin=false; controls.autoRotate=false; syncButtons();
  const direction = group.map(t=>coords(t.lat,t.lon,1)).reduce((a,b)=>a.add(b),new THREE.Vector3()).normalize();
  targetCamera=direction.multiplyScalar(3.3);
  clusterMenu.innerHTML=`<div class="cluster-menu-head"><strong>附近 ${group.length} 个团队</strong><button data-close-cluster aria-label="关闭">×</button></div>
    ${group.map(t=>`<button data-team="${t.id}" class="cluster-team">${safe(t.name)}<span>${safe(t.city)} ↗</span></button>`).join('')}`;
  clusterMenu.hidden=false;
}
function selectTeam(id: string, fly = true) {
  if (!teamById.has(id)) return;
  state.selected=id; state.tab='teams';
  // Revealing a filtered-out selection should not silently hide it.
  if (!filtered().some(t=>t.id===id)) {state.filter='all';state.level='all';state.query='';renderFilters();}
  closeCluster(); renderDetail(); updateNodes();
  if (fly) {
    const p=markers.get(id)!.position.clone().normalize();
    targetCamera=p.multiplyScalar(3.55);
    state.spin=false; controls.autoRotate=false;
    syncButtons();
  }
  const chosen=app!.querySelector<HTMLButtonElement>(`[data-team="${id}"]`);
  chosen?.scrollIntoView({block:'nearest',behavior:'smooth'});
}
function updateNodes() {
  const visible = new Set(filtered().map(t => t.id));
  for (const [id,m] of markers) {
    m.mesh.visible=visible.has(id); m.halo.visible=visible.has(id); m.hit.visible=visible.has(id);
    m.label.style.display=visible.has(id)?'':'none';
    const isSelected=id===state.selected;
    const zoom = THREE.MathUtils.clamp(camera.position.length()/8.4,.28,1.3);
    // Shrink world-space size as camera approaches the surface.
    m.mesh.scale.setScalar(zoom*(isSelected?1.4:1));
    m.halo.scale.setScalar(zoom*(isSelected?1.4:1));
    m.hit.scale.setScalar(Math.max(.65,zoom));
    (m.halo.material as THREE.MeshBasicMaterial).opacity=isSelected?.5:.2;
  }
  for (const arc of arcs) {
    arc.line.visible=state.links && visible.has(arc.from) && visible.has(arc.to);
    (arc.line.material as THREE.LineBasicMaterial).opacity=state.selected && (arc.from===state.selected||arc.to===state.selected)?.68:.2;
  }
}
function syncButtons() {
  const spin=app!.querySelector<HTMLButtonElement>('#spin')!, links=app!.querySelector<HTMLButtonElement>('#links')!;
  spin.setAttribute('aria-pressed',String(state.spin)); spin.textContent=state.spin?'暂停旋转':'自动旋转';
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
  const dotCamera=camera.position.clone().normalize();
  const horizon=radius/camera.position.length()+.015;
  const hit=raycaster.intersectObjects(markerMeshes).find(i=>{
    const id=i.object.userData.teamId as string;
    return i.object.visible && id && !clusteredIds.has(id) && (markers.get(id)!.position.clone().normalize().dot(dotCamera)>horizon);
  });
  if(hit) selectTeam(hit.object.userData.teamId as string);
});
controls.addEventListener('start',() => {targetCamera=null; if (state.spin){state.spin=false;controls.autoRotate=false;syncButtons();}});
let last=0;
let lastLayout=0;
function layoutMarkers() {
  const rect=stage.getBoundingClientRect(), forward=camera.position.clone().normalize();
  const horizon=radius/camera.position.length()+.02;
  const active: {id:string;x:number;y:number;depth:number}[]=[];
  for(const [id,m] of markers) {
    if(!filtered().some(t=>t.id===id)) continue;
    const depth=m.position.clone().normalize().dot(forward);
    if(depth<=horizon) continue;
    const clip=m.position.clone().project(camera);
    const x=(clip.x*.5+.5)*rect.width, y=(-clip.y*.5+.5)*rect.height;
    if(x<-30||y<-30||x>rect.width+30||y>rect.height+30) continue;
    active.push({id,x,y,depth});
  }
  // Form screen-space clusters while zoomed out. Use transitive proximity to
  // prevent two adjacent European universities sharing an unclickable dot.
  const parent=active.map((_,i)=>i);
  const root=(i:number):number=>parent[i]===i?i:(parent[i]=root(parent[i]));
  const threshold = camera.position.length()<3.6 ? 29 : 46;
  for(let i=0;i<active.length;i++)for(let j=i+1;j<active.length;j++){
    if(Math.hypot(active[i].x-active[j].x,active[i].y-active[j].y)<threshold)parent[root(j)]=root(i);
  }
  const groups = new Map<number,typeof active>();
  active.forEach((item,i)=>{const key=root(i); const group=groups.get(key)??[];group.push(item);groups.set(key,group);});
  clusteredIds.clear();
  const nextKeys=new Set<string>();
  for(const items of groups.values()) {
    if(items.length<2)continue;
    const ids=items.map(p=>p.id).sort();
    const key=ids.join(',');
    nextKeys.add(key);clusterItems.set(key,ids);
    ids.forEach(id=>clusteredIds.add(id));
    let button=clusterButtons.get(key);
    if(!button) {
      button=document.createElement('button');
      button.type='button';
      button.className='cluster-pin';
      button.dataset.cluster=key;
      button.setAttribute('aria-label',`展开附近 ${ids.length} 个研究团队`);
      button.textContent=String(ids.length);
      labels.appendChild(button);
      clusterButtons.set(key,button);
    }
    const x=items.reduce((sum,p)=>sum+p.x,0)/items.length;
    const y=items.reduce((sum,p)=>sum+p.y,0)/items.length;
    button.style.transform=`translate(-50%,-50%) translate(${x}px,${y}px)`;
  }
  for(const [key,button] of clusterButtons)if(!nextKeys.has(key)){button.remove();clusterButtons.delete(key);clusterItems.delete(key);}
  const occupied:{x:number;y:number;w:number;h:number}[]=[];
  // Reserve screen space around clusters so single labels never cover them.
  for(const items of groups.values())if(items.length>1) {
    const x=items.reduce((s,p)=>s+p.x,0)/items.length, y=items.reduce((s,p)=>s+p.y,0)/items.length;
    occupied.push({x:x-24,y:y-24,w:48,h:48});
  }
  const sorted=active.filter(p=>!clusteredIds.has(p.id)).sort((a,b)=>
    Number(b.id===state.selected)-Number(a.id===state.selected));
  for(const p of sorted) {
    const m=markers.get(p.id)!;
    const label=m.label;
    const width=Math.max(58,Math.min(128,label.textContent!.length*15+22)),height=31;
    // Try offsets above/below pins to avoid overlapping labels at high zoom.
    let best:{x:number;y:number}|null=null;
    for(const [dx,dy] of [[0,-13],[0,26],[35,0],[-35,0],[0,-43],[45,-25],[-45,-25],[0,55]]){
      const x=p.x+dx-width/2,y=p.y+dy-height;
      const collides=occupied.some(b=>x<b.x+b.w+7&&x+width+7>b.x&&y<b.y+b.h+5&&y+height+5>b.y);
      if(!collides && x>0&&x+width<rect.width&&y>48&&y+height<rect.height-35){best={x:p.x+dx,y:p.y+dy};occupied.push({x,y,w:width,h:height});break;}
    }
    label.hidden=!best;
    if(best)label.style.transform=`translate(-50%,-100%) translate(${best.x}px,${best.y}px)`;
  }
  for(const [id,m] of markers) {
    const clustered=clusteredIds.has(id);
    const visible=active.some(p=>p.id===id);
    m.mesh.visible=visible && !clustered;
    m.halo.visible=visible && !clustered;
    m.hit.visible=visible && !clustered;
    if(clustered||!visible)m.label.hidden=true;
    // The zoom-dependent sizing must update even while moving camera.
    const zoom=THREE.MathUtils.clamp(camera.position.length()/8.4,.28,1.3);
    const emph=id===state.selected?1.4:1;
    m.mesh.scale.setScalar(zoom*emph);m.halo.scale.setScalar(zoom*emph);
    m.hit.scale.setScalar(Math.max(.65,zoom));
  }
}
function animate(timestamp=0) {
  requestAnimationFrame(animate);
  if (timestamp-last < 15) return; last=timestamp;
  if(targetCamera) {camera.position.lerp(targetCamera,.055); if(camera.position.distanceTo(targetCamera)<.035) targetCamera=null;}
  controls.update();
  if(timestamp-lastLayout>65){layoutMarkers();lastLayout=timestamp;}
  const n=camera.position.clone().normalize();
  const [lat,lon]=cartesianToLatLon(n.x,n.y,n.z);
  app!.querySelector('#coords')!.textContent=`${Math.abs(lat).toFixed(0)}°${lat>=0?'N':'S'} · ${Math.abs(lon).toFixed(0)}°${lon>=0?'E':'W'}`;
  renderer.render(scene,camera);
}
requestAnimationFrame(animate);

app.addEventListener('click', e => {
  const target=e.target as HTMLElement;
  if(target.closest('[data-close-cluster]')){closeCluster();return;}
  const cluster=target.closest<HTMLButtonElement>('[data-cluster]');
  if(cluster){showCluster(clusterItems.get(cluster.dataset.cluster!)??[]);return;}
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
    state.filter='all';state.level='all';state.query='';state.selected='hebeu';
    state.spin=false;state.links=false;controls.autoRotate=false;targetCamera=homePosition.clone();
    closeCluster();renderFilters();renderDetail();updateNodes();syncButtons();
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
