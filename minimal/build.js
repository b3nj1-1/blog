import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { readdir } from 'fs/promises';
import { marked } from 'marked';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const postsDir = join(__dirname, '..', '_posts');
const outputDir = join(__dirname, 'posts');

const siteTitle = 'b3nj1';
const siteDesc = 'cybersecurity & networking';
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
    if (clean.length > 30) return clean.slice(0, 200) + (clean.length > 200 ? '...' : '');
  }
  return '';
}

async function renderMarkdown(text) {
  try {
    return await marked.parse(text, { breaks: true, gfm: true });
  } catch (e) {
    return `<p>${e.message}</p>`;
  }
}

function layout(title, content, root, up = '') {
  const p = root || '';
  const cssLink = p ? `${p}style.css` : 'style.css';
  const home = p ? `${p}index.html` : 'index.html';
  const about = p ? `${p}about.html` : 'about.html';
  const toModern = up ? `${up}modern/index.html` : '../modern/index.html';
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} — ${siteTitle}</title>
<link rel="stylesheet" href="${cssLink}">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark-dimmed.min.css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
<script>hljs.highlightAll();</script>
</head>
<body>
<nav>
  <a href="${home}" class="logo">${siteTitle}</a>
  <div class="links">
    <a href="${home}">index</a>
    <a href="${about}">about</a>
    <a href="${p}research/index.html">research</a>
    <button class="switch-btn" id="dmBtn" onclick="toggleDM()">light</button>
    <button class="switch-btn" onclick="switchTheme()">layout</button>
  </div>
</nav>
${content}
<script>
function switchTheme() { localStorage.setItem('layout','modern'); window.location.href = '${toModern}'; }
function toggleDM() { var d = document.documentElement; var c = d.getAttribute('data-theme'); var n = (c === 'light') ? 'dark' : 'light'; d.setAttribute('data-theme', n); document.getElementById('dmBtn').textContent = n === 'light' ? 'dark' : 'light'; localStorage.setItem('dm', n); }
(function(){ var s = localStorage.getItem('dm') || 'dark'; if (s === 'light') { document.documentElement.setAttribute('data-theme','light'); document.getElementById('dmBtn').textContent = 'dark'; } })();
</script>
<footer>${author} / ${year}</footer>
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
    const category = (categories[0] || '').replace(/_/g, ' ');

    const plain = body
      .replace(/^---[\s\S]*?---\n/, '')
      .replace(/[#*`\[\]()>|]/g, ' ')
      .replace(/!\[.*?\]\(.*?\)/g, '')
      .replace(/\[([^\]]*)\]\(.*?\)/g, '$1')
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/\n{2,}/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    posts.push({ title: metadata.title || 'Untitled', slug, date: dateStr, isoDate, tags, category, excerpt, content: renderedBody, text: plain });
  }

  // Write search index
  const searchIndex = posts.map(p => ({
    title: p.title, slug: p.slug, date: p.date, category: p.category,
    tags: p.tags, excerpt: p.excerpt, text: p.text.slice(0, 5000)
  }));
  writeFileSync(join(__dirname, 'search-index.json'), JSON.stringify(searchIndex));
  console.log('  Created: search-index.json');

  // Generate posts
  for (const post of posts) {
    const tagsHtml = post.tags.map(t => `<span class="tag">${t}</span>`).join('\n');
    const html = `
<article>
  <h1>${post.title}</h1>
  <div class="meta">${post.date} / ${post.category}</div>
  <div class="body">
    ${post.content}
  </div>
  <div class="tags">${tagsHtml}</div>
</article>`;
    writeFileSync(join(outputDir, `${post.slug}.html`), layout(post.title, html, '../', '../../'));
  }

  // Generate index
  const postsHtml = posts.map(p => {
    const excerpt = p.excerpt || '&nbsp;';
    return `<a href="posts/${p.slug}.html" class="post">
  <span class="date">${p.date}</span>
  <span class="title">${p.title}</span>
  <span class="excerpt">${excerpt}</span>
</a>`;
  }).join('\n\n');

  const indexHtml = `
<h1>${siteTitle}</h1>
<p class="desc">${siteDesc}</p>
<input type="text" id="ms" placeholder="search posts..." style="max-width:640px;margin:0 auto 24px;display:block;width:100%;padding:8px 12px;background:var(--bg-alt);border:1px solid var(--border2);border-radius:4px;color:var(--text);font-family:inherit;font-size:0.88rem;outline:none" />
<div class="posts" id="mposts">
${postsHtml}
</div>
<script>
var si=[];fetch('search-index.json').then(function(r){return r.json()}).then(function(d){si=d})['catch'](function(){});
document.getElementById('ms').addEventListener('input',function(){
  var q=this.value.trim().toLowerCase(),list=document.getElementById('mposts'),items=list.querySelectorAll('.post');
  items.forEach(function(c){
    var t=c.querySelector('.title').textContent.toLowerCase(),e=c.querySelector('.excerpt').textContent.toLowerCase(),slug=c.getAttribute('href');
    var ok=!q||t.indexOf(q)!==-1||e.indexOf(q)!==-1;
    if(!ok&&q){var idx=si.find(function(x){return slug.indexOf(x.slug)!==-1});if(idx&&idx.text.toLowerCase().indexOf(q)!==-1)ok=true;}
    c.style.display=ok?'block':'none';
  });
});
</script>`;

  writeFileSync(join(__dirname, 'index.html'), layout('index', indexHtml, '', '../'));
  console.log('  Created: index.html');

  // Generate research page
  const researchPosts = posts.filter(p => ['Research', 'Hardware', 'BCM'].includes(p.category));
  const researchHtml2 = researchPosts.map(p => {
    const ex = p.excerpt || '&nbsp;';
    return `<a href="posts/${p.slug}.html" class="post">
  <span class="date">${p.date}</span>
  <span class="title">${p.title}</span>
  <span class="excerpt">${ex}</span>
</a>`;
  }).join('\n\n');
  const researchIdx = `
<h1>research</h1>
<p class="desc">Original research — honeypots, IDS/IPS, hardware, and blue-team tools</p>
<div class="posts">${researchHtml2}</div>`;
  const rsDir = join(__dirname, 'research');
  if (!existsSync(rsDir)) mkdirSync(rsDir, { recursive: true });
  writeFileSync(join(rsDir, 'index.html'), layout('research', researchIdx, '', '../../'));
  console.log('  Created: research/index.html');

  // About page
  const aboutHtml = `
<h1>about</h1>
<p>Cybersecurity and networking professional. Offensive security, CTF writeups, mobile pentesting.</p>
<h2>certifications</h2>
<ul>
  <li>CCNA R&S: Scaling Networks</li>
  <li>CompTIA Security+</li>
  <li>CARTP</li>
  <li>CRTO</li>
  <li>CMPen</li>
</ul>
<h2>links</h2>
<ul>
  <li><a href="https://github.com/b3nj1-1">github</a></li>
  <li><a href="https://twitter.com/b3nj1_1">twitter</a></li>
  <li><a href="https://www.hackthebox.eu/home/users/profile/257310">hackthebox</a></li>
</ul>`;
  writeFileSync(join(__dirname, 'about.html'), layout('about', aboutHtml, '', '../'));
  console.log('  Created: about.html');

  console.log(`\nDone. ${posts.length} posts generated.`);
}

main().catch(console.error);
