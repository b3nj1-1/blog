document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('search');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const postsList = document.getElementById('posts-list');
  const postCards = postsList ? Array.from(postsList.querySelectorAll('.post-card')) : [];
  let searchIndex = [];

  fetch('search-index.json')
    .then(r => r.json())
    .then(data => { searchIndex = data; })
    .catch(() => {});

  if (searchInput) {
    searchInput.addEventListener('input', filterPosts);
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterPosts();
    });
  });

  function highlightText(text, query) {
    if (!query) return text;
    const re = new RegExp('(' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
    const parts = text.split(re);
    return parts.map((p, i) =>
      re.test(p) ? `<mark style="background:#22d3ee33;color:inherit;border-radius:2px;padding:0 2px">${p}</mark>` : p
    ).join('');
  }

  function filterPosts() {
    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const activeFilter = document.querySelector('.filter-btn.active');
    const category = activeFilter ? activeFilter.dataset.filter : 'all';
    const q = query;

    postCards.forEach(card => {
      const title = card.querySelector('h2').textContent.toLowerCase();
      const excerpt = card.querySelector('p').textContent.toLowerCase();
      const tags = Array.from(card.querySelectorAll('.tag')).map(t => t.textContent.toLowerCase());
      const cat = card.querySelector('.category').textContent.toLowerCase();
      const cardSlug = card.getAttribute('href');

      let matchesSearch = !q;
      if (q) {
        const visible = `${title} ${excerpt} ${tags.join(' ')} ${cat}`;
        if (visible.includes(q)) {
          matchesSearch = true;
        } else {
          const idx = searchIndex.find(e => e.slug && cardSlug && cardSlug.includes(e.slug));
          if (idx && idx.text.toLowerCase().includes(q)) {
            matchesSearch = true;
            const pos = idx.text.toLowerCase().indexOf(q);
            const start = Math.max(0, pos - 60);
            const end = Math.min(idx.text.length, pos + q.length + 120);
            let snippet = (start > 0 ? '...' : '') + idx.text.slice(start, end) + (end < idx.text.length ? '...' : '');
            snippet = highlightText(snippet, query);
            const p = card.querySelector('p');
            if (p) p.innerHTML = snippet;
          }
        }
      }

      const matchesCategory = category === 'all' || cat === category.toLowerCase();
      card.style.display = matchesSearch && matchesCategory ? 'block' : 'none';
    });
  }
});
