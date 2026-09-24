// app.js — Cheong Zhi Teng · Home

// ===== CONFIG =====
const GITHUB_USERNAME = 'cheongzhiteng';
const API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`;

// ===== DOM REFS =====
const repoGrid = document.getElementById('repoGrid');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');

// ===== STATE =====
let allRepos = [];

// ===== LANGUAGE COLORS =====
const LANG_COLORS = {
  JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5',
  HTML: '#e34c26', CSS: '#563d7c', Java: '#b07219', 'C++': '#f34b7d',
  C: '#555555', 'C#': '#178600', Go: '#00ADD8', Rust: '#dea584',
  Ruby: '#701516', PHP: '#4F5D95', Swift: '#F05138', Kotlin: '#A97BFF',
  Dart: '#00B4AB', Shell: '#89e051', Vue: '#41b883', Svelte: '#ff3e00',
};

// ===== FETCH REPOS =====
async function fetchRepos() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
    allRepos = await res.json();
    loadingEl.style.display = 'none';
    renderRepos(allRepos);
  } catch (err) {
    loadingEl.style.display = 'none';
    errorEl.style.display = 'block';
    errorEl.textContent = `Failed to load repositories: ${err.message}`;
    console.error(err);
  }
}

// ===== RENDER =====
function renderRepos(repos) {
  repoGrid.innerHTML = '';

  if (!repos.length) {
    repoGrid.innerHTML =
      '<div class="no-results" style="grid-column:1/-1;text-align:center;color:var(--gray-400);padding:60px 20px;font-size:0.82rem;">' +
      '<strong style="display:block;font-size:0.9rem;color:var(--gray-500);margin-bottom:8px;">No repositories found</strong>' +
      'Try a different search term.</div>';
    return;
  }

  repos.forEach(function (repo, i) {
    const card = document.createElement('article');
    card.className = 'repo-card';
    card.style.animationDelay = `${i * 50}ms`;

    const lang = repo.language || 'Other';
    const langColor = LANG_COLORS[lang] || '#8b949e';

    const topicsHTML = (repo.topics || []).slice(0, 3)
      .map(function (t) {
        return '<span class="topic-tag">' + t + '</span>';
      }).join('');

    card.innerHTML =
      '<h3 class="repo-name"><a href="' + repo.html_url + '" target="_blank" rel="noopener">' + repo.name + '</a></h3>' +
      '<p class="repo-desc">' + (repo.description || 'No description provided.') + '</p>' +
      '<div class="repo-meta">' +
        (repo.language
          ? '<span><span class="lang-dot" style="background:' + langColor + '"></span>' + lang + '</span>'
          : '') +
        '<span>★ ' + repo.stargazers_count + '</span>' +
        '<span>⑂ ' + repo.forks_count + '</span>' +
      '</div>' +
      (topicsHTML ? '<div class="repo-topics">' + topicsHTML + '</div>' : '');

    repoGrid.appendChild(card);
  });
}

// ===== SEARCH & SORT =====
function applyFilters() {
  const query = searchInput.value.toLowerCase().trim();
  const sort = sortSelect.value;

  let filtered = allRepos.filter(function (repo) {
    return repo.name.toLowerCase().includes(query) ||
      (repo.description || '').toLowerCase().includes(query);
  });

  filtered.sort(function (a, b) {
    if (sort === 'stars') return b.stargazers_count - a.stargazers_count;
    if (sort === 'name') return a.name.localeCompare(b.name);
    return new Date(b.updated_at) - new Date(a.updated_at);
  });

  renderRepos(filtered);
}

searchInput.addEventListener('input', applyFilters);
sortSelect.addEventListener('change', applyFilters);

// ===== INIT =====
document.getElementById('year').textContent = new Date().getFullYear();
fetchRepos();

// =================================================================
// 背景粒子动画 — 与 Nanatsukaze 完全一致
// =================================================================
(function initBackgroundParticles() {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(max-width: 768px)').matches) return;

  const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
  let particles = [];
  let w = 0, h = 0, dpr = 1;
  let rafId = null;
  let running = false;
  let lastFrameTime = 0;
  let lastTimestamp = 0;

  const FRAME_INTERVAL = 1000 / 60;
  const MAX_DIST = 140;
  const MAX_DIST_SQ = MAX_DIST * MAX_DIST;
  const CELL = MAX_DIST;
  const ALPHA_BUCKETS = 6;
  const grid = new Map();
  const NEIGHBOR_OFFSETS = [];
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) NEIGHBOR_OFFSETS.push([dx, dy]);
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const target = Math.min(Math.max(20, Math.floor((w * h) / 22000)), 80);
    particles = [];
    for (let i = 0; i < target; i++) {
      particles.push({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.6 + 0.7,
        hue: [260, 220, 330][(Math.random() * 3) | 0]
      });
    }
  }

  function draw(timestamp) {
    if (!running) return;
    if (timestamp - lastFrameTime < FRAME_INTERVAL) {
      rafId = requestAnimationFrame(draw);
      return;
    }
    const dt = lastTimestamp ? Math.min((timestamp - lastTimestamp) / 16.667, 3) : 1;
    lastFrameTime = timestamp;
    lastTimestamp = timestamp;
    ctx.clearRect(0, 0, w, h);

    grid.clear();
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.x < 0) { p.x = 0; p.vx = -p.vx; }
      else if (p.x > w) { p.x = w; p.vx = -p.vx; }
      if (p.y < 0) { p.y = 0; p.vy = -p.vy; }
      else if (p.y > h) { p.y = h; p.vy = -p.vy; }
      const cx = (p.x / CELL) | 0;
      const cy = (p.y / CELL) | 0;
      const key = cx * 100000 + cy;
      let bucket = grid.get(key);
      if (!bucket) { bucket = []; grid.set(key, bucket); }
      bucket.push(i);
    }

    const buckets = [];
    for (let b = 0; b < ALPHA_BUCKETS; b++) buckets.push([]);
    for (let i = 0; i < particles.length; i++) {
      const a = particles[i];
      const acx = (a.x / CELL) | 0;
      const acy = (a.y / CELL) | 0;
      for (let o = 0; o < NEIGHBOR_OFFSETS.length; o++) {
        const ox = NEIGHBOR_OFFSETS[o][0];
        const oy = NEIGHBOR_OFFSETS[o][1];
        const key = (acx + ox) * 100000 + (acy + oy);
        const bucket = grid.get(key);
        if (!bucket) continue;
        for (let bi = 0; bi < bucket.length; bi++) {
          const j = bucket[bi];
          if (j <= i) continue;
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < MAX_DIST_SQ) {
            const t = 1 - Math.sqrt(d2) / MAX_DIST;
            const level = Math.min(ALPHA_BUCKETS - 1, (t * ALPHA_BUCKETS) | 0);
            buckets[level].push(a.x, a.y, b.x, b.y);
          }
        }
      }
    }

    for (let b = 0; b < ALPHA_BUCKETS; b++) {
      const arr = buckets[b];
      if (!arr.length) continue;
      const alpha = ((b + 1) / ALPHA_BUCKETS) * 0.15;
      ctx.strokeStyle = 'hsla(262, 85%, 62%, ' + alpha + ')';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      for (let k = 0; k < arr.length; k += 4) {
        ctx.moveTo(arr[k], arr[k + 1]);
        ctx.lineTo(arr[k + 2], arr[k + 3]);
      }
      ctx.stroke();
    }

    const hueBuckets = { 260: [], 220: [], 330: [] };
    for (let i = 0; i < particles.length; i++) {
      hueBuckets[particles[i].hue].push(particles[i]);
    }
    for (const hue in hueBuckets) {
      const list = hueBuckets[hue];
      if (!list.length) continue;
      ctx.beginPath();
      for (let i = 0; i < list.length; i++) {
        const p = list[i];
        ctx.moveTo(p.x + p.r, p.y);
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      }
      ctx.fillStyle = 'hsla(' + hue + ', 85%, 62%, 0.55)';
      ctx.fill();
    }
    rafId = requestAnimationFrame(draw);
  }

  function start() {
    if (running) return;
    running = true;
    lastFrameTime = 0;
    lastTimestamp = 0;
    rafId = requestAnimationFrame(draw);
  }

  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }

  window.bgParticles = { start: start, stop: stop };

  let resizeTimer = null;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 200);
  });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop();
    else start();
  });

  resize();
  start();
})();
