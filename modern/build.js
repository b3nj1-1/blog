import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { readdir } from 'fs/promises';
import { marked } from 'marked';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const postsDir = join(__dirname, '..', '_posts');
const outputDir = join(__dirname, 'posts');
const aboutDir = join(__dirname, 'about');

const siteTitle = 'b3nj1';
const siteDesc = 'Cybersecurity & networking research, CTF walkthroughs, and mobile pentesting';
const siteUrl = 'https://blog.b3nj1.net';
const author = 'B3nj1';
const year = new Date().getFullYear();

if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });

function parseFrontMatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { metadata: {}, body: content };
  const meta = {};
  const front = match[1];
  front.split('\n').forEach(line => {
    const eqIdx = line.indexOf(':');
    if (eqIdx === -1) return;
    const key = line.slice(0, eqIdx).trim();
    let val = line.slice(eqIdx + 1).trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
    if (key === 'tags' || key === 'categories') {
      if (val.startsWith('[')) {
        val = val.slice(1, -1).split(',').map(s => s.trim().replace(/^['"](.*)['"]$/, '$1'));
      } else {
        val = [val];
      }
    }
    meta[key] = val;
  });
  return { metadata: meta, body: match[2].trim() };
}

function getExcerpt(body) {
  const text = body.replace(/---[\s\S]*?---/, '').replace(/^---\n/, '');
  const lines = text.split('\n').filter(l => l.trim() && !l.startsWith('!') && !l.startsWith('<'));
  for (const line of lines) {
    const clean = line.replace(/[#*`\[\]]/g, '').trim();
    if (clean.length > 30) return clean.slice(0, 180) + (clean.length > 180 ? '...' : '');
  }
  return 'Read more...';
}

async function renderMarkdown(text) {
  try {
    return await marked.parse(text, { breaks: true, gfm: true });
  } catch (e) {
    return `<p>render error: ${e.message}</p>`;
  }
}

function layout(title, content, extra = '', root = '', depth = '') {
  const cssPath = root ? `${root}/css/style.css` : 'css/style.css';
  const rootPath = root ? `${root}/` : '';
  const up = depth || '';
  const switchToMin = `${up}minimal/index.html`;
  const isHome = title === 'Home';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | ${siteTitle}</title>
  <link rel="stylesheet" href="${cssPath}">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💀</text></svg>">
  <meta name="description" content="${siteDesc}">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark-dimmed.min.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
  <script>hljs.highlightAll();</script>
  ${extra}
</head>
<body>
  <div class="container">
    <nav>
      <span class="logo">~&gt; <a href="${rootPath}index.html">${siteTitle}</a></span>
      <ul class="nav-links">
        <li><a href="${rootPath}index.html">Posts</a></li>
        <li><a href="${rootPath}about/index.html">About</a></li>
        <li><a href="${rootPath}research/index.html">Research</a></li>
        <li><a href="https://github.com/b3nj1-1" target="_blank">GitHub</a></li>
        <li><button class="theme-btn" id="dmBtn" onclick="toggleDM()">light</button></li>
        <li><button class="theme-btn" onclick="switchTheme()">layout</button></li>
      </ul>
    </nav>
    ${content}
    <footer>
      &copy; ${year} <a href="https://github.com/b3nj1-1">${author}</a>. All rights reserved.
    </footer>
  </div>
  ${isHome ? `
  <div class="landing-modal" id="landingModal">
    <div class="landing-box">
      <h2>choose your view</h2>
      <p>pick a theme for browsing this site</p>
      <div class="landing-choices">
        <button class="landing-card" onclick="pickTheme('modern')">
          <span class="lc-icon">~&gt;</span>
          <span class="lc-title">modern</span>
          <span class="lc-desc">dark · cards · search · filters</span>
        </button>
        <button class="landing-card" onclick="pickTheme('minimal')">
          <span class="lc-icon">>></span>
          <span class="lc-title">minimal</span>
          <span class="lc-desc">dark · list · no js · lightweight</span>
        </button>
      </div>
    </div>
  </div>
  <script>
    var lt = localStorage.getItem('layout');
    if (lt === 'minimal') { window.location.href = '${switchToMin}'; }
    else if (!lt) { document.getElementById('landingModal').classList.add('show'); }
    function pickTheme(v) { localStorage.setItem('layout', v); document.getElementById('landingModal').classList.remove('show'); }
    function switchTheme() { localStorage.setItem('layout','minimal'); window.location.href = '${switchToMin}'; }
    function toggleDM() { var d = document.documentElement; var c = d.getAttribute('data-theme'); var n = (c === 'light') ? 'dark' : 'light'; d.setAttribute('data-theme', n); document.getElementById('dmBtn').textContent = n === 'light' ? 'dark' : 'light'; localStorage.setItem('dm', n); }
    (function(){ var s = localStorage.getItem('dm') || 'dark'; if (s === 'light') { document.documentElement.setAttribute('data-theme','light'); document.getElementById('dmBtn').textContent = 'dark'; } })();
  </script>` : `<script>
    function switchTheme() { localStorage.setItem('layout','minimal'); window.location.href = '${switchToMin}'; }
    function toggleDM() { var d = document.documentElement; var c = d.getAttribute('data-theme'); var n = (c === 'light') ? 'dark' : 'light'; d.setAttribute('data-theme', n); document.getElementById('dmBtn').textContent = n === 'light' ? 'dark' : 'light'; localStorage.setItem('dm', n); }
    (function(){ var s = localStorage.getItem('dm') || 'dark'; if (s === 'light') { document.documentElement.setAttribute('data-theme','light'); document.getElementById('dmBtn').textContent = 'dark'; } })();
  </script>`}
</body>
</html>`;
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function main() {
  const files = await readdir(postsDir);
  const mdFiles = files.filter(f => f.endsWith('.md')).sort().reverse();

  const posts = [];

  for (const file of mdFiles) {
    const content = readFileSync(join(postsDir, file), 'utf-8');
    const { metadata, body } = parseFrontMatter(content);
    const slug = slugify(metadata.title || file.replace('.md', ''));
    const tags = Array.isArray(metadata.tags) ? metadata.tags : (metadata.tags ? [metadata.tags] : []);
    const categories = Array.isArray(metadata.categories) ? metadata.categories : (metadata.categories ? [metadata.categories] : []);
    const category = categories[0] || 'Uncategorized';
    const excerpt = getExcerpt(body);
    const renderedBody = await renderMarkdown(body);

    let date = new Date(metadata.date);
    if (isNaN(date.getTime())) {
      const parsed = Date.parse(metadata.date.replace(/(\d{4})-(\d{1,2})-(\d{1,2})/, '$1-$2-$3'));
      date = new Date(parsed);
      if (isNaN(date.getTime())) date = new Date();
    }
    const dateStr = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    const isoDate = date.toISOString().split('T')[0];

    const plain = body
      .replace(/^---[\s\S]*?---\n/, '')
      .replace(/[#*`\[\]()>|]/g, ' ')
      .replace(/!\[.*?\]\(.*?\)/g, '')
      .replace(/\[([^\]]*)\]\(.*?\)/g, '$1')
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/\n{2,}/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    posts.push({
      title: metadata.title || 'Untitled',
      slug,
      date: dateStr,
      isoDate,
      tags,
      category,
      excerpt,
      content: renderedBody,
      text: plain,
      file
    });
  }

  // Write search index
  const searchIndex = posts.map(p => ({
    title: p.title,
    slug: p.slug,
    date: p.date,
    category: p.category,
    tags: p.tags,
    excerpt: p.excerpt,
    text: p.text.slice(0, 5000)
  }));
  writeFileSync(join(__dirname, 'search-index.json'), JSON.stringify(searchIndex));
  console.log('  Created: search-index.json');

  // Generate individual post pages
  for (const post of posts) {
    const tagsHtml = post.tags.map(t => `<span class="tag">${t}</span>`).join('\n        ');
    const content = `
    <article>
      <div class="post-header">
        <a href="../index.html" class="back-link">&larr; Back to all posts</a>
        <h1>${post.title}</h1>
        <div class="meta">
          <time datetime="${post.isoDate}">${post.date}</time>
          <span class="sep">&#x2022;</span>
          <span class="cat">${post.category}</span>
          <span class="sep">&#x2022;</span>
          <span>${post.tags.length} tags</span>
        </div>
      </div>
      <div class="post-content">
        ${post.content}
      </div>
      <div class="post-footer">
        <div class="tags">
          ${tagsHtml}
        </div>
      </div>
    </article>`;

    writeFileSync(join(outputDir, `${post.slug}.html`), layout(post.title, content, `<meta property="article:published_time" content="${post.isoDate}">`, '..', '../../'));
    console.log(`  Created: posts/${post.slug}.html`);
  }

  // Generate index page
  const postsHtml = posts.map(post => {
    const tagsHtml = post.tags.map(t => `<span class="tag">${t}</span>`).join('');
    return `
      <a href="posts/${post.slug}.html" class="post-card">
        <div class="post-meta">
          <span class="date">${post.date}</span>
          <span class="category">${post.category}</span>
        </div>
        <h2>${post.title}</h2>
        <p>${post.excerpt}</p>
        <div class="post-tags">
          ${tagsHtml}
        </div>
      </a>`;
  }).join('\n');

  const categories = [...new Set(posts.map(p => p.category))].sort().map(c => c.replace(/_/g, ' '));
  const categoryBtns = categories.map(c =>
    `<button class="filter-btn" data-filter="${c}">${c}</button>`
  ).join('\n          ');

  const indexContent = `
    <section class="hero">
      <p class="tagline">${siteDesc}</p>
    </section>

    <div class="search-box">
      <input type="text" id="search" placeholder="Search posts..." />
    </div>

    <div class="filters">
      <button class="filter-btn active" data-filter="all">All</button>
      ${categoryBtns}
    </div>

    <div class="posts-list" id="posts-list">
      ${postsHtml}
    </div>

    <script src="js/main.js"></script>`;

  writeFileSync(join(__dirname, 'index.html'), layout('Home', indexContent, '', '', '../'));
  console.log('  Created: index.html');

  // Generate about page
  const aboutContent = `
    <div class="about-content">
      <h1>About Me</h1>
      <p>I'm a cybersecurity and networking professional interested in offensive security. I have gained a strong understanding of cybersecurity best practices and technologies and expertise in network design, implementation, and maintenance. I'm always looking for ways to learn and grow, and I am particularly interested in exploring and mastering the tools and techniques used in offensive security.</p>
      <p>In my free time, I enjoy staying up-to-date on the latest trends and techniques in these fields through online courses and professional development opportunities.</p>

      <h2 style="color: var(--accent-dim); margin-top: 32px;">Certifications</h2>
      <ul>
        <li>CCNA R&S: Scaling Networks</li>
        <li>CompTIA Security+</li>
        <li>Certified Azure Red Team Professional (CARTP)</li>
        <li>Certified Red Team Operator (CRTO)</li>
        <li>Certified Mobile Pentester (CMPen)</li>
        <li>Mobile Application Penetration Testing</li>
        <li>Practical Malware Analysis & Triage</li>
      </ul>

      <h2 style="color: var(--accent-dim); margin-top: 32px;">Social Media</h2>
      <div class="social-links">
        <a href="https://github.com/b3nj1-1/" target="_blank">&#x1f5a5; GitHub</a>
        <a href="https://twitter.com/b3nj1_1" target="_blank">&#x1f426; Twitter</a>
        <a href="https://www.hackthebox.eu/home/users/profile/257310" target="_blank">&#x1f3e1; HackTheBox</a>
        <a href="https://bmc.link/0xb3nj1" target="_blank">&#x2615; Buy me a coffee</a>
        <a href="mailto:work@b3nj1.net" target="_blank">&#x2709; Email</a>
      </div>
    </div>`;

  // Generate research page
  const researchPosts = posts.filter(p => ['Research', 'Hardware', 'BCM'].includes(p.category));
  const researchHtml = researchPosts.map(post => {
    const tagsHtml = post.tags.map(t => `<span class="tag">${t}</span>`).join('');
    return `
      <a href="../posts/${post.slug}.html" class="post-card">
        <div class="post-meta">
          <span class="date">${post.date}</span>
          <span class="category">${post.category}</span>
        </div>
        <h2>${post.title}</h2>
        <p>${post.excerpt}</p>
        <div class="post-tags">${tagsHtml}</div>
      </a>`;
  }).join('\n');

  const researchContent = `
    <section class="hero">
      <p class="tagline">Original research — honeypots, IDS/IPS, hardware, and blue-team tools</p>
    </section>
    <div class="posts-list">${researchHtml}</div>`;

  const researchDir = join(__dirname, 'research');
  if (!existsSync(researchDir)) mkdirSync(researchDir, { recursive: true });
  writeFileSync(join(researchDir, 'index.html'), layout('Research', researchContent, '', '..', '../../'));
  console.log('  Created: research/index.html');

  writeFileSync(join(aboutDir, 'index.html'), layout('About', aboutContent, '', '..', '../../'));
  console.log('  Created: about/index.html');

  // Generate 404 page
  const notFoundContent = `
    <div class="error-page">
      <div class="glitch">404</div>
      <p>Page not found. The matrix glitched...</p>
      <a href="index.html">Back to Home</a>
    </div>`;

  writeFileSync(join(__dirname, '404.html'), layout('404', notFoundContent, '', '.', '../'));
  console.log('  Created: 404.html');

  console.log(`\nDone! Generated ${posts.length} posts + index + about + 404.`);
}

main().catch(console.error);
