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
