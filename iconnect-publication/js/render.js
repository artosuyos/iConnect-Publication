/* ==========================================================================
   iCONNECT PUBLICATION — RENDER ENGINE (js/render.js)
   Loads articles from articles/index.js (articlesData array) and merges
   with built-in defaults so the site NEVER loses its core stories.
   ========================================================================== */

(function (window) {
  'use strict';

  /* ------------------------------------------------------------------
     MASTER DEFAULT DATASET
     These 6 default stories are always protected — they cannot be lost
     even if articles/index.js is accidentally emptied.
     ------------------------------------------------------------------ */
  const defaultArticles = [
    /*
    {
      id: "ai-horizon-2026",
      title: "Quantum Neural Networks: Reshaping the Architecture of Next-Gen AI",
      category: "Technology",
      author: "Art Jayson Osuyos",
      role: "Editor-in-Chief",
      date: "August 8, 2026",
      readingTime: "6 min read",
      featuredImage: "assets/images/articles/gallery-1.jpg",
      excerpt: "Exploring how quantum computing and neural networks converge to create unprecedented computational paradigms for Computer Science students and researchers.",
      content: "<p>As Computer Science continues to rapidly evolve, the intersection between quantum mechanical principles and neural network architectures presents a monumental shift in computational capability. At Capiz State University – Mambusao Satellite College, BSCS researchers are diving deep into how quantum gate simulation impacts modern machine learning paradigms.</p><h2>The Quantum Advantage in Machine Learning</h2><p>Traditional computing algorithms operate on classical binary logic gates. However, Quantum Neural Networks (QNNs) harness qubits capable of superposition and entanglement. This allows complex multi-variable optimization problems—previously requiring days of cluster processing—to be solved in fractions of a second.</p><blockquote>\"Information is no longer static binary states; it is an interconnected spectrum of probabilistic pathways.\"</blockquote><h2>Key Technological Takeaways</h2><ul><li>Superposition enables simultaneous evaluation of exponential dataset states.</li><li>Quantum entanglement drastically reduces inter-layer communication latency in distributed neural networks.</li><li>Hybrid classical-quantum algorithms allow current hardware to simulate future quantum performance.</li></ul><h2>Bridging Theory and Innovation at CAPSU</h2><p>The iConnect editorial team spoke with senior BSCS thesis proponents working on distributed quantum circuit simulation. Their research underscores how upcoming graduates are prepared to lead software engineering frontiers, proving that regional satellite colleges remain hotbeds for cutting-edge technological inquiry.</p>",
      featured: true
    },
    {
      id: "bscs-hackathon-triumph",
      title: "CAPSU BSCS Team Secures Victory in Regional Inter-College Code Fest",
      category: "News",
      author: "Janine Marie Albaladejo",
      role: "News Editor",
      date: "August 5, 2026",
      readingTime: "4 min read",
      featuredImage: "assets/images/articles/gallery-2.jpg",
      excerpt: "Capiz State University BSCS developers engineered an automated emergency alert network system to claim top honors at the 2026 Western Visayas Hackathon.",
      content: "<p>Demonstrating technical excellence and quick problem-solving, a four-member developer team from the Bachelor of Science in Computer Science program at CAPSU Mambusao Satellite College emerged champion at the 2026 Western Visayas Regional Code Fest held in Iloilo City.</p><h2>Disaster Response Through Mesh Networking</h2><p>The winning entry, titled <strong>ResQ-Link Mesh</strong>, utilizes offline mesh networking protocols combined with web-based real-time telemetry dashboards. Designed specifically for agricultural communities during severe typhoon blackouts, the application facilitates casualty reporting without needing active cell towers.</p><blockquote>\"Our goal was to build software that directly serves rural communities when infrastructure fails,\" shared team lead Marcus Vance.</blockquote><h2>Academic Rigor and Mentorship</h2><p>Department Chairperson and faculty mentors praised the team's commitment to community-driven technology solutions. The victory highlights the BSCS department's ongoing mission to blend theoretical computer science principles with practical human-centric impact.</p>",
      featured: false
    },
    {
      id: "ethical-cybersecurity-opinion",
      title: "Opinion: Why Ethical Hacking Must Be Embedded in the Core CS Curriculum",
      category: "Opinion",
      author: "Renz Cyberion",
      role: "Opinion Columnist",
      date: "August 2, 2026",
      readingTime: "5 min read",
      featuredImage: "assets/images/articles/gallery-3.jpg",
      excerpt: "In an era of ubiquitous IoT devices and automated exploits, teaching cyber defense alone is insufficient without hands-on offensive security understanding.",
      content: "<p>Security is frequently treated as an afterthought in software engineering courses—a final chapter tacked onto a database or networking syllabus. Yet as daily life becomes deeply digitized, defensive software design demands an aggressive, preemptive posture.</p><h2>The Defensive Paradox</h2><p>To fortify a system, one must understand precisely how an adversary dismantles it. Integrating penetration testing, reverse engineering, and zero-day threat analysis into undergraduate coursework equips students with the mindset needed to build resilient architectures from line one.</p><p>Ethical hacking is not merely a toolset; it is a critical thinking discipline. When students learn how buffer overflows execute at memory addresses, they stop writing unsafe C/C++ code. When they inspect JWT token vulnerabilities, secure authentication becomes second nature.</p>",
      featured: false
    },
    {
      id: "campus-digital-transformation",
      title: "Campus Smart Network: BSCS Students Deploy IoT Environmental Sensors",
      category: "Campus",
      author: "Clarisse Joy Mendoza",
      role: "Campus Reporter",
      date: "July 29, 2026",
      readingTime: "4 min read",
      featuredImage: "assets/images/articles/gallery-4.jpg",
      excerpt: "Student developers install smart micro-controllers across the Mambusao campus to monitor micro-climate variables and solar energy grid efficiency.",
      content: "<p>Walk across the CAPSU Mambusao Satellite College campus today, and you will encounter small, weatherproof nodes mounted on solar lampposts. Designed by senior Computer Science students, these custom micro-controllers monitor temperature, humidity, and atmospheric pressure in real-time.</p><h2>Live Telemetry Dashboard</h2><p>Data gathered by the nodes streams over LoRaWAN to a centralized web server hosted in the BSCS computer laboratory. The public dashboard enables biology students, campus planners, and faculty to analyze micro-climate trends and optimize energy utilization across university facilities.</p>",
      featured: false
    },
    {
      id: "creatives-code-art",
      title: "Generative Algorithmic Art: When Code Becomes Canvas",
      category: "Creatives",
      author: "Aria Thorne",
      role: "Creative Director",
      date: "July 25, 2026",
      readingTime: "5 min read",
      featuredImage: "assets/images/articles/gallery-1.jpg",
      excerpt: "Synthesizing vector math, Perlin noise algorithms, and web canvas rendering to redefine visual aesthetics in digital journalism.",
      content: "<p>For centuries, journalism relied on ink and static photography. Today, student publication <em>iConnect</em> bridges digital artistry with code. Using procedural shaders, mathematical noise functions, and web-based canvas animation, computer science artists transform dynamic data into captivating visual experiences.</p><h2>Mathematical Elegance</h2><p>Generative art leverages mathematical algorithms—like trigonometric wave functions and recursion—to render infinite visual variations. By treating the DOM as a live canvas, publication layouts become responsive, breathing organisms that react to user interaction.</p>",
      featured: false
    },
    {
      id: "web3-decentralized-publishing",
      title: "Features: The Architecture Behind Decentralized Web Publications",
      category: "Features",
      author: "Dave Gabriel Ramos",
      role: "Technology Editor",
      date: "July 20, 2026",
      readingTime: "6 min read",
      featuredImage: "assets/images/articles/gallery-2.jpg",
      excerpt: "How peer-to-peer storage networks like IPFS and cryptographic hashing protect editorial integrity against censorship and server downtime.",
      content: "<p>Digital publications often face threats of link rot, server downtime, and unauthorized content tampering. In this feature, we examine how decentralized protocols ensure that published student journalism remains immutable and permanently accessible.</p><h2>Immutable Content Addressing</h2><p>Instead of relying on location-based URLs (which break when domain servers change), decentralized publishing utilizes cryptographic content hashes (CIDs). When an article is committed, its content hash guarantees that not a single byte can be altered without altering the address itself.</p>",
      featured: false
    }
      */
  ];

  window.defaultArticlesData = defaultArticles;
  window.iConnectArticles = defaultArticles;
  window.currentCategoryFilter = 'All';

  const DEFAULT_FALLBACK_IMG = 'assets/images/articles/gallery-1.jpg';

  /* ------------------------------------------------------------------
     MERGE ENGINE
     Combines defaultArticles + window.articlesData (from articles/index.js).
     Articles in index.js override defaults with the same id.
     New articles in index.js are added on top.
     ------------------------------------------------------------------ */
  /* ------------------------------------------------------------------
     MERGE ENGINE
     Combines defaultArticles + window.articlesData (from articles/index.js)
     + custom articles published via Publisher Workspace (localStorage).
     Articles published in Publisher Workspace appear at the top.
     ------------------------------------------------------------------ */
  window.loadArticlesData = function () {
    const list = [];

    // Source from window.articlesData if loaded from articles/index.js
    const source = (typeof window.articlesData !== 'undefined' && Array.isArray(window.articlesData))
      ? window.articlesData
      : [];

    // Merge custom articles published via Publisher Workspace (localStorage)
    var custom = [];
    try {
      custom = JSON.parse(localStorage.getItem('iconnect_published_articles')) || [];
    } catch (e) {}

    var deletedIds = [];
    try {
      deletedIds = JSON.parse(localStorage.getItem('iconnect_deleted_articles')) || [];
    } catch (e) {}

    var allSource = custom.concat(source);
    var seen = {};

    allSource.forEach(function (a) {
      if (!a || !a.id || seen[a.id] || deletedIds.indexOf(a.id) !== -1) return;
      seen[a.id] = true;
      list.push({
        id:           a.id,
        title:        a.title        || '',
        category:     (a.category && a.category.trim()) ? a.category.trim() : 'General',
        author:       a.author       || '',
        role:         a.role         || '',
        roles:        Array.isArray(a.roles) ? a.roles : (Array.isArray(a.contributors) ? a.contributors : []),
        showAuthor:   a.showAuthor !== false,
        showRole:     a.showRole !== false,
        showDate:     a.showDate !== false,
        showReadTime: a.showReadTime !== false,
        date:         a.date         || '',
        readingTime:  a.readingTime  || a.readTime  || '',
        readTime:     a.readTime     || a.readingTime || '',
        featuredImage:a.featuredImage|| a.image     || DEFAULT_FALLBACK_IMG,
        featurePhoto: a.featurePhoto || '',
        image:        a.image        || a.featuredImage || DEFAULT_FALLBACK_IMG,
        excerpt:      a.excerpt      || '',
        content:      a.content      || '',
        featured:     !!a.featured,
        publishedAt:  a.publishedAt  || ''
      });
    });

    // Also include defaultArticles if not already present
    defaultArticles.forEach(function (d) {
      if (!seen[d.id] && deletedIds.indexOf(d.id) === -1) {
        seen[d.id] = true;
        list.push(d);
      }
    });

    // Apply custom display order if saved via Publisher Studio
    var customOrder = [];
    try {
      customOrder = JSON.parse(localStorage.getItem('iconnect_articles_order')) || [];
    } catch (e) {}

    if (Array.isArray(customOrder) && customOrder.length > 0) {
      list.sort(function (a, b) {
        var idxA = customOrder.indexOf(a.id);
        var idxB = customOrder.indexOf(b.id);
        if (idxA === -1 && idxB === -1) return 0;
        if (idxA === -1) return 1;
        if (idxB === -1) return -1;
        return idxA - idxB;
      });
    }

    window.iConnectArticles = list;
    return list;
  };

  /* ------------------------------------------------------------------
     IMAGE RESOLVER — picks the best available image src
     ------------------------------------------------------------------ */
  window.getImageUrl = function (article) {
    if (!article) return DEFAULT_FALLBACK_IMG;
    if (article.featuredImage) return article.featuredImage;
    if (article.image)         return article.image;
    return DEFAULT_FALLBACK_IMG;
  };

  /* ------------------------------------------------------------------
     CINEMATIC HERO SHOWCASE SLIDER
     Independent showcase — strictly Photo, Title, Description only.
     ------------------------------------------------------------------ */
  window.renderHeroSlider = function () {
    const container = document.getElementById('showcase-slider-container') || document.getElementById('featured-slider-container');
    if (!container) return;

    // Sourced directly from standalone hero slides datastore (js/slider.js) or localStorage
    const pool = (typeof window.getMergedHeroSlides === 'function')
      ? window.getMergedHeroSlides()
      : (window.heroSlidesData || []);

    if (!pool || pool.length === 0) return;

    let currentIndex = 0;
    let isAnimating  = false;
    let autoTimer    = null;

    function getImg(slide) {
      if (!slide) return 'assets/images/articles/gallery-1.jpg';
      return slide.image || slide.featuredImage || 'assets/images/articles/gallery-1.jpg';
    }

    /* ── Build thumbnail HTML (strictly clean photos only) ── */
    function buildThumbs() {
      return pool.map(function (slide, idx) {
        const img = getImg(slide);
        return `<div class="hero-thumb-card${idx === 0 ? ' active' : ''}"
                     style="background-image:url('${img}');"
                     data-index="${idx}"></div>`;
      }).join('');
    }

    /* ── Build full slide panel HTML (Badge, Title & Excerpt ONLY — NO buttons or links) ── */
    function slideHTML(slide) {
      const badge = slide.badge ? `<span style="display:inline-block; font-size:0.75rem; font-family:var(--font-mono); color:var(--cheddar-yellow); background:rgba(244,180,26,0.15); padding:0.2rem 0.65rem; border-radius:999px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:0.6rem; border:1px solid rgba(244,180,26,0.3);">${slide.badge}</span>` : '';

      return `
        ${badge}
        <h2 class="hero-slide-title">${slide.title}</h2>
        <p class="hero-slide-excerpt">${slide.excerpt || ''}</p>`;
    }

    /* ── Build the initial full shell ── */
    function buildShell() {
      const first = pool[0];
      container.innerHTML = `
        <div class="hero-showcase-slider-box" id="hss-box">
          <!-- Background layer A (current) -->
          <div class="hero-slide-bg is-entering" id="hss-bg-a" style="background-image:url('${getImg(first)}');"></div>
          <!-- Background layer B (transitioning) -->
          <div class="hero-slide-bg" id="hss-bg-b" style="opacity:0;"></div>

          <div class="hero-slide-overlay"></div>

          <!-- Left content panel (Title & Excerpt only) -->
          <div class="hero-slide-content" id="hss-content">
            ${slideHTML(first)}
          </div>

          <!-- Thumbnail strip (bottom-right, clean photos only) -->
          <div class="hero-thumbs-strip" id="hss-thumbs">
            ${buildThumbs()}
          </div>

          <!-- Prev / Next arrows -->
          <div class="hero-slider-nav">
            <button class="hero-nav-arrow" id="slider-prev-btn" title="Previous" aria-label="Previous">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button class="hero-nav-arrow" id="slider-next-btn" title="Next" aria-label="Next">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>`;

      bindEvents();
      startAuto();
    }

    /* ── Cinematic crossfade transition ── */
    function goTo(nextIndex) {
      if (isAnimating || nextIndex === currentIndex) return;
      isAnimating = true;

      const slide  = pool[nextIndex];
      const bgA    = container.querySelector('#hss-bg-a');
      const bgB    = container.querySelector('#hss-bg-b');
      const strip  = container.querySelector('#hss-thumbs');

      // B = new photo (fade in on top)
      bgB.style.backgroundImage = `url('${getImg(slide)}')`;
      bgB.style.opacity = '';
      bgB.className = 'hero-slide-bg is-entering';
      bgB.style.zIndex = '2';

      // A = old photo (fade out beneath)
      bgA.style.zIndex = '1';
      bgA.classList.add('is-leaving');

      // After crossfade: swap roles
      setTimeout(function () {
        bgA.style.backgroundImage = `url('${getImg(slide)}')`;
        bgA.className = 'hero-slide-bg';
        bgA.style.zIndex = '1';
        bgB.className = 'hero-slide-bg';
        bgB.style.opacity = '0';
        bgB.style.zIndex = '1';
        isAnimating = false;
      }, 900);

      // Animate text — clone & replace to re-trigger CSS keyframes
      const oldContent = container.querySelector('#hss-content');
      const newContent = oldContent.cloneNode(false);
      newContent.innerHTML = slideHTML(slide);
      oldContent.replaceWith(newContent);

      // Update thumbnail active state
      if (strip) {
        strip.querySelectorAll('.hero-thumb-card').forEach(function (card, idx) {
          card.classList.toggle('active', idx === nextIndex);
        });
      }

      currentIndex = nextIndex;
    }

    /* ── Auto-advance every 6 seconds ── */
    function startAuto() {
      clearInterval(autoTimer);
      autoTimer = setInterval(function () {
        goTo((currentIndex + 1) % pool.length);
      }, 6000);
    }

    /* ── Attach all event listeners ── */
    function bindEvents() {
      const strip   = container.querySelector('#hss-thumbs');
      const prevBtn = container.querySelector('#slider-prev-btn');
      const nextBtn = container.querySelector('#slider-next-btn');

      if (strip) {
        strip.addEventListener('click', function (e) {
          const card = e.target.closest('.hero-thumb-card');
          if (!card) return;
          const idx = parseInt(card.getAttribute('data-index'), 10);
          if (!isNaN(idx)) { startAuto(); goTo(idx); }
        });
      }

      if (prevBtn) {
        prevBtn.addEventListener('click', function () {
          startAuto();
          goTo((currentIndex - 1 + pool.length) % pool.length);
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', function () {
          startAuto();
          goTo((currentIndex + 1) % pool.length);
        });
      }
    }

    buildShell();
  };



  /* ------------------------------------------------------------------
     FEATURED STORY  (Top Editorial Highlight)
     Renders the top featured article as a cinematic hero card.
     ------------------------------------------------------------------ */
  window.renderFeaturedStory = function (articles) {
    const container = document.getElementById('featured-story-container');
    if (!container || !articles || articles.length === 0) return;

    // Pick the first featured article, or fall back to the first article
    const article  = articles.find(a => a.featured) || articles[0];
    // Feature Photo = square image for the homepage hero card
    // Falls back to the regular cover image if no separate feature photo is set
    const heroImg  = (article.featurePhoto && article.featurePhoto.trim())
      ? article.featurePhoto.trim()
      : window.getImageUrl(article);
    const readTimeText = article.readingTime || article.readTime || '';
    const dateText = article.date || '';
    const metaTopHtml = (readTimeText || dateText) ? `
      <div class="featured-split-meta-top">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        ${readTimeText ? `<span>${readTimeText}</span>` : ''}
        ${(readTimeText && dateText) ? `<span class="meta-dot">•</span>` : ''}
        ${dateText ? `<span>${dateText}</span>` : ''}
      </div>` : '';

    const authorVal = article.author || '';
    const roleVal = article.role || '';
    const initials = authorVal ? authorVal.split(' ').map(n => n[0]).slice(0, 2).join('') : '';

    const authorHtml = (authorVal || roleVal) ? `
      <div class="featured-split-author">
        ${authorVal ? `<div class="author-avatar-badge">${initials}</div>` : ''}
        <div class="author-details">
          ${authorVal ? `<span class="author-name-text">${authorVal}</span>` : ''}
          ${roleVal ? `<span class="author-role-text">${roleVal}</span>` : ''}
        </div>
      </div>` : '';

    container.innerHTML = `
      <div class="featured-split-card">
        <div class="featured-split-media">
          <img src="${heroImg}" alt="${article.title}" class="featured-split-img" />
          <span class="featured-split-badge">${article.category}</span>
        </div>
        <div class="featured-split-body">
          ${metaTopHtml}
          <h3 class="featured-split-title">${article.title}</h3>
          <p class="featured-split-excerpt">${article.excerpt}</p>
          ${authorHtml}
          <button class="featured-split-btn" onclick="navigateToArticle('${article.id}')">
            Read Story
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>`;
  };


  /* ------------------------------------------------------------------
     ARTICLES GRID
     ------------------------------------------------------------------ */
  let articlesCurrentPage = 1;
  const ARTICLES_PER_PAGE = 6;

  window.renderArticlesGrid = function (articles, categoryFilter, searchQuery, page) {
    categoryFilter = categoryFilter || window.currentCategoryFilter || 'All';
    searchQuery    = searchQuery    || '';
    page           = page           || 1;
    articlesCurrentPage = page;

    const grid       = document.getElementById('articles-grid');
    const pagination = document.getElementById('articles-pagination');
    if (!grid || !articles) return;

    let list = articles;
    if (categoryFilter !== 'All') {
      const targetCat = categoryFilter.trim().toLowerCase();
      list = list.filter(a => (a.category || '').trim().toLowerCase() === targetCat);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(a =>
        a.title.toLowerCase().includes(q)    ||
        a.excerpt.toLowerCase().includes(q)  ||
        a.category.toLowerCase().includes(q) ||
        a.author.toLowerCase().includes(q)   ||
        (a.content && a.content.toLowerCase().includes(q))
      );
    }

    if (list.length === 0) {
      grid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:4rem 1rem;">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--cheddar-yellow)" stroke-width="1.5" style="margin-bottom:1rem;"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <h3 style="font-family:var(--font-heading);font-size:1.5rem;margin-bottom:.5rem;color:#fff;">No Stories Found</h3>
          <p style="color:var(--text-muted);max-width:400px;margin:0 auto 1.5rem;">No articles match your filter or search.</p>
          <button class="btn-secondary" onclick="resetFilters()">Reset Selection</button>
        </div>`;
      if (pagination) pagination.innerHTML = '';
      return;
    }

    const total      = list.length;
    const totalPages = Math.ceil(total / ARTICLES_PER_PAGE);
    const start      = (page - 1) * ARTICLES_PER_PAGE;
    const end        = Math.min(start + ARTICLES_PER_PAGE, total);
    const pageItems  = list.slice(start, end);

    // Render 6 page items (3 on top, 3 at the bottom)
    grid.innerHTML = pageItems.map(article => {
      const img = window.getImageUrl(article);
      const readTimeVal = article.readingTime || article.readTime || '';
      const dateVal = article.date || '';
      const metaHtml = (dateVal || readTimeVal) ? `
        <div class="article-card-meta">
          ${dateVal ? `<span>${dateVal}</span>` : ''}
          ${(dateVal && readTimeVal) ? `<span>•</span>` : ''}
          ${readTimeVal ? `<span>${readTimeVal}</span>` : ''}
        </div>` : '';

      return `
        <article class="article-card" onclick="navigateToArticle('${article.id}')">
          <div class="article-card-img-wrapper">
            <img src="${img}"
                 onerror="this.onerror=null;this.src='${DEFAULT_FALLBACK_IMG}';"
                 alt="${article.title}" class="article-card-img" loading="lazy" />
            <span class="article-card-badge">${article.category}</span>
          </div>
          <div class="article-card-body">
            ${metaHtml}
            <h3 class="article-card-title">${article.title}</h3>
            <p class="article-card-excerpt">${article.excerpt}</p>
            <div class="article-card-footer">
              <span style="font-size:.825rem;color:var(--text-muted);">${article.author || ''}</span>
              <a href="/article/${article.id}/" class="article-read-btn" onclick="event.preventDefault(); event.stopPropagation(); navigateToArticle('${article.id}');">
                Read <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              </a>
            </div>
          </div>
        </article>`;
    }).join('');

    // Render pagination controls (hide if only 1 page)
    if (!pagination) return;
    if (totalPages <= 1) {
      pagination.innerHTML = '';
      return;
    }

    let pagesHtml = '';
    for (let i = 1; i <= totalPages; i++) {
      pagesHtml += `<button class="ann-page-btn ${i === page ? 'active' : ''}"
                            onclick="goToArticlesPage(${i})">${i}</button>`;
    }

    pagination.innerHTML = `
      <button class="ann-nav-btn" onclick="goToArticlesPage(1)" ${page === 1 ? 'disabled' : ''} title="First">&#171;</button>
      <button class="ann-nav-btn" onclick="goToArticlesPage(${page - 1})" ${page === 1 ? 'disabled' : ''} title="Previous">&#8249;</button>
      <div class="ann-pages">${pagesHtml}</div>
      <button class="ann-nav-btn" onclick="goToArticlesPage(${page + 1})" ${page === totalPages ? 'disabled' : ''} title="Next">&#8250;</button>
      <button class="ann-nav-btn" onclick="goToArticlesPage(${totalPages})" ${page === totalPages ? 'disabled' : ''} title="Last">&#187;</button>
    `;
  };

  window.goToArticlesPage = function (page) {
    const articles = window.iConnectArticles || [];
    const cat = window.currentCategoryFilter || 'All';
    let filtered = articles;
    if (cat !== 'All') {
      const targetCat = cat.trim().toLowerCase();
      filtered = filtered.filter(a => (a.category || '').trim().toLowerCase() === targetCat);
    }
    const totalPages = Math.ceil(filtered.length / ARTICLES_PER_PAGE);
    if (page < 1 || page > totalPages) return;
    window.renderArticlesGrid(articles, cat, '', page);
    const target = document.getElementById('latest-stories');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  /* ------------------------------------------------------------------
     CATEGORY TABS — Fully Dynamic Auto-Discovery
     ------------------------------------------------------------------ */

  /**
   * getActiveCategories()
   * Discovers categories that currently have at least 1 active article.
   * If an article in a category is deleted, or no articles exist for a category,
   * that category automatically disappears from all dropdowns and navigation.
   */
  window.getActiveCategories = function () {
    const articles = (typeof window.loadArticlesData === 'function')
      ? window.loadArticlesData()
      : (window.iConnectArticles || window.articlesData || []);

    const categoryCounts = {};

    (articles || []).forEach(function (p) {
      if (!p) return;
      const cat = (p.category || '').trim();
      if (cat) {
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      }
    });

    return Object.keys(categoryCounts).filter(function (cat) {
      return categoryCounts[cat] > 0;
    });
  };

  /**
   * renderCategories(posts)
   * Builds the glassmorphic category dropdown using ONLY categories that have active articles.
   * - "All Stories" is always the first option.
   */
  window.renderCategories = function (posts) {
    const articles = (typeof window.loadArticlesData === 'function')
      ? window.loadArticlesData()
      : (window.iConnectArticles || window.articlesData || []);

    const activeCats = window.getActiveCategories();
    const bar = document.getElementById('category-filter-bar');

    if (bar) {
      const currentCat = window.currentCategoryFilter || 'All';

      // Calculate story count per category
      const counts = { 'All': articles.length };
      activeCats.forEach(function (cat) {
        counts[cat] = articles.filter(function (a) {
          return a && (a.category || '').trim().toLowerCase() === cat.trim().toLowerCase();
        }).length;
      });

      const currentCount = counts[currentCat] || counts['All'] || articles.length;
      const currentLabel = (currentCat === 'All') ? 'All Stories' : currentCat;

      var allOptionHtml = `
        <li class="category-glass-option ${currentCat === 'All' ? 'active' : ''}"
            role="option"
            aria-selected="${currentCat === 'All'}"
            onclick="selectCategoryFilterOption('All')">
          <div class="cat-opt-left">
            <span class="cat-opt-dot"></span>
            <span class="cat-opt-name">All Stories</span>
          </div>
          <div class="cat-opt-right">
            <span class="cat-opt-count">${counts['All'] || 0}</span>
            <span class="cat-opt-check">${currentCat === 'All' ? '✓' : ''}</span>
          </div>
        </li>`;

      var catOptionsHtml = activeCats.map(function (cat) {
        const isActive = currentCat.toLowerCase() === cat.toLowerCase();
        const cnt = counts[cat] || 0;
        return `
          <li class="category-glass-option ${isActive ? 'active' : ''}"
              role="option"
              aria-selected="${isActive}"
              onclick="selectCategoryFilterOption('${cat}')">
            <div class="cat-opt-left">
              <span class="cat-opt-dot"></span>
              <span class="cat-opt-name">${cat}</span>
            </div>
            <div class="cat-opt-right">
              <span class="cat-opt-count">${cnt}</span>
              <span class="cat-opt-check">${isActive ? '✓' : ''}</span>
            </div>
          </li>`;
      }).join('');

      bar.style.display = 'flex';
      bar.style.justifyContent = 'center';
      bar.style.alignItems = 'center';
      bar.style.width = '100%';
      bar.style.textAlign = 'center';
      bar.style.margin = '0 auto 2.5rem auto';

      bar.innerHTML = `
        <div class="category-glass-dropdown" id="category-glass-dropdown" style="display:inline-flex; justify-content:center; align-items:center; margin:0 auto; text-align:center;">
          <button class="category-glass-btn" id="category-dropdown-btn" type="button" aria-haspopup="listbox" aria-expanded="false" onclick="toggleCategoryDropdown(event)">
            <span class="cat-drop-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--cheddar-yellow)" stroke-width="2.2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            </span>
            <span class="cat-drop-label">Category: <strong id="cat-current-label">${currentLabel}</strong></span>
            <span class="cat-drop-count" id="cat-current-count">${currentCount} Stories</span>
            <svg class="cat-drop-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <ul class="category-glass-menu" id="category-dropdown-menu" role="listbox">
            ${allOptionHtml}
            ${catOptionsHtml}
          </ul>
        </div>`;
    }

    // Sync navbar explore dropdown and footer dynamic category links
    window.renderNavCategories(activeCats);
    window.renderFooterCategories(activeCats);
  };

  /* Dropdown event helpers */
  window.toggleCategoryDropdown = function (event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    const drop = document.getElementById('category-glass-dropdown');
    const btn = document.getElementById('category-dropdown-btn');
    if (!drop) return;
    const isOpen = drop.classList.contains('open');
    if (isOpen) {
      drop.classList.remove('open');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    } else {
      drop.classList.add('open');
      if (btn) btn.setAttribute('aria-expanded', 'true');
    }
  };

  window.closeCategoryDropdown = function () {
    const drop = document.getElementById('category-glass-dropdown');
    const btn = document.getElementById('category-dropdown-btn');
    if (drop) drop.classList.remove('open');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  };

  window.selectCategoryFilterOption = function (cat) {
    window.closeCategoryDropdown();
    window.setCategoryFilter(cat);
  };

  // Close dropdown on click outside or escape key
  document.addEventListener('click', function (e) {
    const drop = document.getElementById('category-glass-dropdown');
    if (drop && !drop.contains(e.target)) {
      window.closeCategoryDropdown();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      window.closeCategoryDropdown();
    }
  });

  // Keep old name as an alias so any existing call still works
  window.renderCategoryTabs = function () {
    window.renderCategories(window.iConnectArticles);
  };

  /* ------------------------------------------------------------------
     NAVBAR DYNAMIC CATEGORY LINKS (ONLY ACTIVE CATEGORIES WITH ARTICLES)
     ------------------------------------------------------------------ */
  window.onNavCategoryClick = function (cat) {
    const navMenu = document.getElementById('nav-menu');
    const navHamburger = document.getElementById('nav-hamburger');
    if (navMenu) navMenu.classList.remove('active');
    if (navHamburger) navHamburger.classList.remove('active');
    document.body.style.overflow = '';

    const articlesGrid = document.getElementById('articles-grid');
    if (!articlesGrid) {
      window.location.href = 'index.html?category=' + encodeURIComponent(cat) + '#latest-stories';
      return;
    }

    if (typeof window.setCategoryFilter === 'function') {
      window.setCategoryFilter(cat);
    }

    const target = document.getElementById('latest-stories');
    if (target) {
      setTimeout(function () {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    }
  };

  window.renderNavCategories = function (activeCats) {
    const exploreDropdowns = document.querySelectorAll('#explore-dropdown-menu, .nav-dropdown-explore');
    if (!exploreDropdowns || exploreDropdowns.length === 0) return;

    if (!activeCats || !Array.isArray(activeCats)) {
      activeCats = window.getActiveCategories();
    }

    let html = `
      <li>
        <a href="javascript:void(0)" class="nav-dropdown-link" onclick="onNavCategoryClick('All')">
          <span class="sub-title">All Stories</span>
        </a>
      </li>
    `;

    activeCats.forEach(function (cat) {
      html += `
        <li>
          <a href="javascript:void(0)" class="nav-dropdown-link" onclick="onNavCategoryClick('${cat}')">
            <span class="sub-title">${cat}</span>
          </a>
        </li>
      `;
    });

    exploreDropdowns.forEach(function (dropdown) {
      dropdown.innerHTML = html;
    });
  };

  // Run dynamic dropdown population immediately
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        window.renderNavCategories();
      });
    } else {
      window.renderNavCategories();
    }
  }

  /* ------------------------------------------------------------------
     FOOTER DYNAMIC CATEGORY LINKS
     ------------------------------------------------------------------ */
  window.renderFooterCategories = function (uniqueCats) {
    const footerList = document.getElementById('footer-category-list');
    if (!footerList) return;
    footerList.innerHTML = uniqueCats.map(function (cat) {
      return `<li><a href="#latest-stories"
        onclick="onNavCategoryClick('${cat}');">${cat}</a></li>`;
    }).join('');
  };

  window.setCategoryFilter = function (catId) {
    window.currentCategoryFilter = catId;
    window.renderCategories(window.iConnectArticles);
    window.renderArticlesGrid(window.iConnectArticles, catId);
  };

  window.resetFilters = function () {
    window.currentCategoryFilter = 'All';
    const s = document.getElementById('search-input');
    if (s) s.value = '';
    window.renderCategories(window.iConnectArticles);
    window.renderArticlesGrid(window.iConnectArticles, 'All');
  };

  /* ------------------------------------------------------------------
     NAVIGATION HELPER
     ------------------------------------------------------------------ */
  window.navigateToArticle = function (id) {
    if (document.getElementById('article-reader-modal')) {
      window.openArticleReaderModal(id, true);
    } else {
      window.location.href = '/article/' + encodeURIComponent(id) + '/';
    }
  };

  /* ------------------------------------------------------------------
     YOUTUBE VIDEO ID EXTRACTOR
     Supports watch?v=, youtu.be, shorts/, embed/, live/, v/, query params
     ------------------------------------------------------------------ */
  window.extractYouTubeId = function (url) {
    if (!url || typeof url !== 'string') return null;
    var str = url.trim();

    // If full iframe tag passed, extract src
    var srcMatch = str.match(/src=["']([^"']+)["']/i);
    if (srcMatch && srcMatch[1]) str = srcMatch[1].trim();

    // Remove quotes
    str = str.replace(/^["']|["']$/g, '');

    // 1. youtu.be/ID
    var shortMatch = str.match(/youtu\.be\/([\w-]{11})/i);
    if (shortMatch && shortMatch[1]) return shortMatch[1];

    // 2. youtube.com/shorts/ID
    var shortsMatch = str.match(/youtube\.com\/shorts\/([\w-]{11})/i);
    if (shortsMatch && shortsMatch[1]) return shortsMatch[1];

    // 3. youtube.com/embed/ID
    var embedMatch = str.match(/youtube\.com\/embed\/([\w-]{11})/i);
    if (embedMatch && embedMatch[1]) return embedMatch[1];

    // 4. youtube.com/live/ID
    var liveMatch = str.match(/youtube\.com\/live\/([\w-]{11})/i);
    if (liveMatch && liveMatch[1]) return liveMatch[1];

    // 5. youtube.com/watch?v=ID or /watch?...&v=ID
    var watchMatch = str.match(/youtube\.com\/watch\?(?:[^&]+&)*v=([\w-]{11})/i);
    if (watchMatch && watchMatch[1]) return watchMatch[1];

    // 6. youtube.com/v/ID
    var vMatch = str.match(/youtube\.com\/v\/([\w-]{11})/i);
    if (vMatch && vMatch[1]) return vMatch[1];

    // 7. Standalone 11-char ID
    if (/^[\w-]{11}$/.test(str)) {
      return str;
    }

    return null;
  };

  /* ------------------------------------------------------------------
     GLOBAL YOUTUBE EMBED NORMALIZER
     Ensures all YouTube video embeds use official https://www.youtube.com/embed/VIDEO_ID
     with full responsive 16:9 container, lazy loading, and sandbox security.
     ------------------------------------------------------------------ */
  window.normalizeYouTubeEmbeds = function (html) {
    if (!html || typeof html !== 'string') return html || '';

    // If in browser DOM environment, use DOM parsing for 100% accurate nested element handling
    if (typeof document !== 'undefined' && typeof document.createElement === 'function') {
      try {
        var tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        // 1. Handle any publisher editor video cards [data-video-id]
        var editorCards = tempDiv.querySelectorAll('.pub-editor-video-card, [data-video-id]');
        editorCards.forEach(function (card) {
          var videoId = card.getAttribute('data-video-id') || window.extractYouTubeId(card.innerHTML);
          var caption = card.getAttribute('data-video-caption') || '';
          if (caption && caption.indexOf('%') !== -1) {
            try { caption = decodeURIComponent(caption); } catch (e) {}
          }
          if (!caption) {
            var capEl = card.querySelector('.article-video-caption');
            if (capEl) caption = capEl.textContent || '';
          }
          var width = card.getAttribute('data-video-width') || '100%';

          if (videoId) {
            var replacement = document.createElement('div');
            replacement.className = 'article-video-container';
            replacement.style.maxWidth = width;
            replacement.style.margin = '2rem auto';
            replacement.style.textAlign = 'center';
            replacement.style.clear = 'both';

            var wrapper = document.createElement('div');
            wrapper.className = 'youtube-video-wrapper article-video-wrapper';
            wrapper.innerHTML = '<iframe src="https://www.youtube.com/embed/' + videoId + '" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>';

            replacement.appendChild(wrapper);

            if (caption && caption.trim()) {
              var capDiv = document.createElement('div');
              capDiv.className = 'article-video-caption';
              capDiv.textContent = caption.trim();
              replacement.appendChild(capDiv);
            }

            card.parentNode.replaceChild(replacement, card);
          }
        });

        // 2. Handle any raw YouTube iframes inside the document
        var iframes = tempDiv.querySelectorAll('iframe');
        iframes.forEach(function (iframe) {
          var src = iframe.getAttribute('src') || '';
          var videoId = window.extractYouTubeId(src);
          if (videoId) {
            var container = iframe.closest('.article-video-container');
            if (container) {
              // Ensure iframe attributes are standardized
              iframe.setAttribute('src', 'https://www.youtube.com/embed/' + videoId);
              iframe.removeAttribute('loading');
              iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
              iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
              iframe.setAttribute('allowfullscreen', '');
              var wrapper = iframe.closest('.article-video-wrapper, .youtube-video-wrapper');
              if (!wrapper) {
                var newWrapper = document.createElement('div');
                newWrapper.className = 'youtube-video-wrapper article-video-wrapper';
                iframe.parentNode.insertBefore(newWrapper, iframe);
                newWrapper.appendChild(iframe);
              }
            } else {
              // Standalone iframe: wrap in canonical container
              var newContainer = document.createElement('div');
              newContainer.className = 'article-video-container';
              newContainer.style.maxWidth = '100%';
              newContainer.style.margin = '2rem auto';
              newContainer.style.textAlign = 'center';
              newContainer.style.clear = 'both';

              var newWrapper = document.createElement('div');
              newWrapper.className = 'youtube-video-wrapper article-video-wrapper';
              newWrapper.innerHTML = '<iframe src="https://www.youtube.com/embed/' + videoId + '" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>';

              newContainer.appendChild(newWrapper);
              iframe.parentNode.replaceChild(newContainer, iframe);
            }
          }
        });

        return tempDiv.innerHTML;
      } catch (e) {
        console.warn('Error normalizing YouTube embeds:', e);
      }
    }

    return html;
  };

  /* ------------------------------------------------------------------
     AESTHETIC LINE ICON RESOLVER FOR AUTHOR & CONTRIBUTOR BADGES
     ------------------------------------------------------------------ */
  window.getAuthorRoleSvgIcon = function (iconType, roleText, nameText) {
    var type = (iconType || 'auto').toLowerCase().trim();
    var role = (roleText || '').toLowerCase().trim();
    var name = (nameText || '').toLowerCase().trim();

    if (type === 'auto' || !type) {
      if (role.indexOf('photo') !== -1 || role.indexOf('camera') !== -1 || name.indexOf('photo') !== -1) {
        type = 'camera';
      } else if (role.indexOf('video') !== -1 || role.indexOf('film') !== -1 || role.indexOf('production') !== -1) {
        type = 'video';
      } else if (role.indexOf('graphic') !== -1 || role.indexOf('layout') !== -1 || role.indexOf('art') !== -1 || role.indexOf('design') !== -1 || role.indexOf('illustrat') !== -1) {
        type = 'palette';
      } else if (role.indexOf('contribut') !== -1 || role.indexOf('team') !== -1 || role.indexOf('people') !== -1) {
        type = 'users';
      } else if (role.indexOf('audio') !== -1 || role.indexOf('mic') !== -1 || role.indexOf('voice') !== -1 || role.indexOf('podcast') !== -1 || role.indexOf('interview') !== -1) {
        type = 'mic';
      } else if (role.indexOf('code') !== -1 || role.indexOf('dev') !== -1 || role.indexOf('tech') !== -1) {
        type = 'code';
      } else if (role.indexOf('lead') !== -1 || role.indexOf('chief') !== -1 || role.indexOf('editor') !== -1 || role.indexOf('star') !== -1) {
        type = 'star';
      } else {
        type = 'quill';
      }
    }

    switch (type) {
      case 'camera':
      case 'photos':
      case 'photography':
        return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>';
      case 'palette':
      case 'art':
      case 'layout':
      case 'design':
      case 'graphics':
        return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.563-2.512 5.563-5.563C21.996 6.5 17.5 2 12 2z"/></svg>';
      case 'video':
      case 'film':
        return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>';
      case 'users':
      case 'people':
      case 'contributors':
      case 'team':
        return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>';
      case 'mic':
      case 'audio':
      case 'voice':
      case 'podcast':
        return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>';
      case 'code':
      case 'dev':
      case 'tech':
        return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>';
      case 'star':
      case 'award':
      case 'lead':
        return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
      case 'quill':
      case 'pen':
      case 'words':
      case 'write':
      default:
        return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><line x1="16" y1="8" x2="2" y2="22"/><line x1="17.5" y1="15" x2="9" y2="15"/></svg>';
    }
  };

  /* ------------------------------------------------------------------
     ARTICLE META BAR HELPER
     Renders Primary Author & Contributors with uniform gold aesthetic circles,
     attached separators (no orphaned '|' on wrap), and Date & Read Time placed
     below all authors, aligned flush with the first letter of the top name.
     ------------------------------------------------------------------ */
  window.buildArticleMetaBarHTML = function (article) {
    if (!article) return '';

    // Helper for author badge circle (uniform gold design for all)
    function buildAvatarCircle(iconSvg) {
      return '<div class="author-avatar" style="width:42px; height:42px; min-width:42px; min-height:42px; border-radius:50%; background:var(--bg-navy-elevated, #0a1128); border:2px solid var(--cheddar-yellow, #f4b41a); color:var(--cheddar-yellow, #f4b41a); display:flex; align-items:center; justify-content:center; flex-shrink:0; box-shadow:0 0 10px rgba(244,180,26,0.2);">' +
        iconSvg +
      '</div>';
    }

    var authorParts = [];

    // Primary Author
    var authorVal = (article.author || '').trim();
    var roleVal   = (article.role || '').trim();
    var showAuthor = article.showAuthor !== false;
    var showRole   = article.showRole !== false;

    var primaryName = showAuthor ? authorVal : '';
    var primaryRole = showRole ? roleVal : '';

    if (primaryName || primaryRole) {
      var iconSvg = window.getAuthorRoleSvgIcon(article.authorIcon, primaryRole, primaryName);
      authorParts.push(
        '<div class="reader-meta-item reader-meta-author" style="display:inline-flex; align-items:center; gap:0.65rem;">' +
          buildAvatarCircle(iconSvg) +
          '<div style="display:flex; flex-direction:column; justify-content:center;">' +
            (primaryName ? '<div style="font-weight:400; color:#ffffff; font-size:0.95rem; line-height:1.25;">' + primaryName + '</div>' : '') +
            (primaryRole ? '<div style="font-size:0.8rem; color:var(--text-subtle); margin-top:0.15rem; font-weight:400;">' + primaryRole + '</div>' : '') +
          '</div>' +
        '</div>'
      );
    }

    // Additional Roles / Contributors (Photojournalist, Layout Artist, Editor, etc.)
    var extraRoles = Array.isArray(article.roles) ? article.roles : (Array.isArray(article.contributors) ? article.contributors : []);
    extraRoles.forEach(function (r) {
      if (r && r.show !== false) {
        var rName = (r.name || '').trim();
        var rRole = (r.role || r.position || '').trim();
        if (rName || rRole) {
          var rIconSvg = window.getAuthorRoleSvgIcon(r.icon, rRole, rName);
          authorParts.push(
            '<div class="reader-meta-item reader-meta-role" style="display:inline-flex; align-items:center; gap:0.65rem;">' +
              buildAvatarCircle(rIconSvg) +
              '<div style="display:flex; flex-direction:column; justify-content:center;">' +
                (rName ? '<div style="font-weight:400; color:#ffffff; font-size:0.95rem; line-height:1.25;">' + rName + '</div>' : '') +
                (rRole ? '<div style="font-size:0.8rem; color:var(--text-subtle); margin-top:0.15rem; font-weight:400;">' + rRole + '</div>' : '') +
              '</div>' +
            '</div>'
          );
        }
      }
    });

    // Publish Date & Read Time parts (Positioned below ALL authors and roles)
    var showDate = article.showDate !== false;
    var showReadTime = article.showReadTime !== false;
    var dateVal = (showDate && article.date) ? article.date.trim() : '';
    var readTimeVal = (showReadTime && (article.readingTime || article.readTime)) ? (article.readingTime || article.readTime).trim() : '';

    var infoParts = [];
    if (dateVal) {
      infoParts.push(
        '<div class="reader-meta-date" style="display:inline-flex; align-items:center; gap:0.4rem; color:var(--text-muted); font-size:0.88rem; line-height:1;">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="opacity:0.75; display:block; flex-shrink:0;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' +
          '<span>' + dateVal + '</span>' +
        '</div>'
      );
    }
    if (readTimeVal) {
      infoParts.push(
        '<div class="reader-meta-readtime" style="display:inline-flex; align-items:center; gap:0.4rem; color:var(--cheddar-yellow); font-size:0.88rem; font-family:var(--font-mono); font-weight:600; line-height:1;">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="opacity:0.9; display:block; flex-shrink:0;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' +
          '<span>' + readTimeVal + '</span>' +
        '</div>'
      );
    }

    if (!authorParts.length && !infoParts.length) return '';

    var hasAuthors = authorParts.length > 0;
    var containerClass = 'reader-meta' + (hasAuthors ? ' reader-meta-has-authors' : '');

    var html = '<div class="' + containerClass + '" style="display:flex; flex-direction:column; align-items:flex-start; gap:0.35rem; padding-bottom:1.5rem; border-bottom:1px solid var(--border-navy); margin-bottom:2rem; width:100%;">';

    if (hasAuthors) {
      html += '<div class="reader-meta-authors" style="display:flex; align-items:center; gap:0; row-gap:0.75rem; flex-wrap:wrap; width:100%;">' +
        authorParts.join('') +
      '</div>';
    }

    if (infoParts.length > 0) {
      var subPadding = hasAuthors ? 'padding-left:calc(42px + 0.65rem);' : 'padding-left:0;';
      html += '<div class="reader-meta-sub" style="display:flex; align-items:center; gap:0.65rem; margin-top:0.15rem; flex-wrap:wrap; width:100%; ' + subPadding + '">' +
        infoParts.join('<span class="reader-meta-dot" style="color:var(--text-subtle); opacity:0.4; font-size:0.9rem;">&bull;</span>') +
      '</div>';
    }

    html += '</div>';
    return html;
  };

  /* ------------------------------------------------------------------
     SINGLE ARTICLE PAGE (article.html?id=slug or /article/slug/)
     ------------------------------------------------------------------ */
  window.renderSingleArticlePage = function () {
    var id = null;
    var pathMatch = window.location.pathname.match(/\/article\/([^\/]+)\/?$/i);
    if (pathMatch && pathMatch[1]) {
      id = decodeURIComponent(pathMatch[1]);
    } else {
      var params = new URLSearchParams(window.location.search);
      id = params.get('id') || params.get('article');
    }

    const articles = (typeof window.loadArticlesData === 'function') ? window.loadArticlesData() : (window.iConnectArticles || []);
    var article = null;
    if (id) {
      var cleanId = id.replace(/^[-_]+|[-_]+$/g, '');
      article = articles.find(function (a) {
        if (!a) return false;
        var aClean = (a.id || a.slug || '').replace(/^[-_]+|[-_]+$/g, '');
        return a.id === id || String(a.id) === String(id) || (a.slug && a.slug === id) || (cleanId && aClean === cleanId);
      });
    }
    if (!article && articles.length > 0) {
      article = articles[0];
    }
    if (!article) return;

    var pageTitle = article.title + ' | iConnect Publication';
    document.title = pageTitle;

    // Normalize browser address bar to clean permalink /article/{id}/
    var cleanUrl = '/article/' + encodeURIComponent(article.id) + '/';
    if (window.location.pathname !== cleanUrl) {
      try {
        history.replaceState({ articleId: article.id, isArticleReader: true }, pageTitle, cleanUrl);
      } catch (e) {}
    }

    // Dynamic Social Share Preview Meta Tags (Facebook, Messenger, Twitter, WhatsApp, iMessage)
    (function updateMeta(art) {
      if (!art) return;
      var pageUrl = window.location.origin + '/article/' + encodeURIComponent(art.id) + '/';
      var imgUrl = window.getImageUrl(art);
      var absImgUrl = imgUrl.indexOf('://') !== -1 ? imgUrl : (window.location.origin + '/' + imgUrl.replace(/^\.\//, ''));
      var excerpt = (art.excerpt || art.content.replace(/<[^>]*>/g, '')).slice(0, 160) + '...';

      var setMeta = function (prop, content) {
        var el = document.querySelector('meta[property="' + prop + '"]') || document.querySelector('meta[name="' + prop + '"]');
        if (!el) {
          el = document.createElement('meta');
          if (prop.startsWith('og:')) el.setAttribute('property', prop);
          else el.setAttribute('name', prop);
          document.head.appendChild(el);
        }
        el.setAttribute('content', content);
      };

      setMeta('og:title', art.title + ' | iConnect Publication');
      setMeta('og:description', excerpt);
      setMeta('og:image', absImgUrl);
      setMeta('og:url', pageUrl);

      setMeta('twitter:title', art.title + ' | iConnect Publication');
      setMeta('twitter:description', excerpt);
      setMeta('twitter:image', absImgUrl);

      var canEl = document.querySelector('link[rel="canonical"]');
      if (canEl) canEl.setAttribute('href', pageUrl);
    })(article);

    const wrap = document.getElementById('single-article-render');
    if (!wrap) return;

    const metaHtml = window.buildArticleMetaBarHTML(article);
    const img = window.getImageUrl(article);
    const contentHtml = window.normalizeYouTubeEmbeds(article.content);
    const excerptHtml = (article.excerpt && article.excerpt.trim())
      ? `<p class="reader-excerpt" style="font-style:italic; color:var(--text-muted, #94a3b8); font-size:1.05rem; line-height:1.65; margin:0 0 1.25rem 0;">${article.excerpt.trim()}</p>`
      : '';

    wrap.innerHTML = `
      <div class="reader-container" style="margin-top:1rem;">
        <a href="/" class="reader-back-btn" style="margin-bottom:1.5rem; display:inline-flex; align-items:center; gap:0.5rem;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Back to Publication
        </a>
        <span class="reader-category">${article.category}</span>
        <h1 class="reader-title">${article.title}</h1>
        ${metaHtml}
        ${excerptHtml}
        <div id="engagement-bar-placeholder" style="margin: 0.5rem 0 2rem 0;"></div>
        <div class="reader-hero-img-wrapper">
          <img src="${img}"
               onerror="this.onerror=null;this.src='${DEFAULT_FALLBACK_IMG}';"
               alt="${article.title}" class="reader-hero-img" />
        </div>
        <div class="reader-body-content">${contentHtml}</div>
        <div style="margin-top:4rem;padding-top:2.5rem;border-top:1px solid var(--border-navy);">
          <h3 style="font-family:var(--font-heading);font-size:1.5rem;color:#fff;margin-bottom:1.5rem;">Related Publication Stories</h3>
          <div class="articles-grid" id="related-articles-grid"></div>
        </div>
      </div>`;

    // Inject engagement bar below header line
    var engPlaceholder = document.getElementById('engagement-bar-placeholder');
    if (engPlaceholder && typeof window.buildEngagementBar === 'function') {
      engPlaceholder.outerHTML = window.buildEngagementBar(article);
    }
    if (typeof window.initEngagementBar === 'function') {
      window.initEngagementBar(article.id);
    }

    const related = articles.filter(a => a.id !== article.id).slice(0, 2);
    const relGrid = document.getElementById('related-articles-grid');
    if (relGrid) {
      relGrid.innerHTML = related.map(r => `
        <div class="article-card" onclick="window.location.href='/article/${r.id}/'">
          <div class="article-card-img-wrapper" style="height:160px;">
            <img src="${window.getImageUrl(r)}"
                 onerror="this.onerror=null;this.src='${DEFAULT_FALLBACK_IMG}';"
                 alt="${r.title}" class="article-card-img" />
            <span class="article-card-badge">${r.category}</span>
          </div>
          <div class="article-card-body" style="padding:1.25rem;">
            <h4 style="font-family:var(--font-heading);font-weight:700;color:#fff;font-size:1.05rem;margin-bottom:.5rem;">${r.title}</h4>
            <a href="/article/${r.id}/" class="article-read-btn">Read Related &rarr;</a>
          </div>
        </div>`).join('');
    }

    // Init lightbox for all images inside the article body
    if (typeof window.initArticleLightbox === 'function') {
      window.initArticleLightbox(wrap);
    }
  };

  /* ------------------------------------------------------------------
     READER MODAL (used on index.html with clean permalink routing)
     ------------------------------------------------------------------ */
  window.openArticleReaderModal = function (id, pushHistory) {
    const modal = document.getElementById('article-reader-modal');
    if (!modal) {
      window.location.href = '/article/' + encodeURIComponent(id) + '/';
      return;
    }

    const articles = (typeof window.loadArticlesData === 'function') ? window.loadArticlesData() : (window.iConnectArticles || []);
    if (!articles || articles.length === 0) return;

    var cleanId = id ? id.replace(/^[-_]+|[-_]+$/g, '') : '';
    const article = articles.find(function (a) {
      if (!a) return false;
      var aClean = (a.id || a.slug || '').replace(/^[-_]+|[-_]+$/g, '');
      return a.id === id || String(a.id) === String(id) || (a.slug && a.slug === id) || (cleanId && aClean === cleanId);
    });
    if (!article) return;

    // Save previous URL before first opening if not already an article URL
    if (!window.location.pathname.startsWith('/article/')) {
      window._preArticleUrl = window.location.pathname + window.location.search + window.location.hash;
    }

    const img = window.getImageUrl(article);
    document.getElementById('reader-category').textContent = article.category || 'Stories';
    document.getElementById('reader-title').textContent    = article.title || 'Article';
    document.getElementById('reader-meta').innerHTML = window.buildArticleMetaBarHTML(article);

    const modalExcerpt = document.getElementById('reader-modal-excerpt');
    if (modalExcerpt) {
      if (article.excerpt && article.excerpt.trim()) {
        modalExcerpt.textContent = article.excerpt.trim();
        modalExcerpt.style.display = 'block';
      } else {
        modalExcerpt.style.display = 'none';
      }
    }

    const heroImg = document.getElementById('reader-hero-img');
    heroImg.src = img;
    heroImg.onerror = function () { this.onerror=null; this.src=DEFAULT_FALLBACK_IMG; };
    heroImg.alt = article.title;
    document.getElementById('reader-body-content').innerHTML = window.normalizeYouTubeEmbeds(article.content);

    // Inject engagement bar below header line in modal
    const modalEngPlaceholder = document.getElementById('reader-modal-engagement-bar-placeholder');
    if (modalEngPlaceholder && typeof window.buildEngagementBar === 'function') {
      modalEngPlaceholder.innerHTML = window.buildEngagementBar(article);
    }
    if (typeof window.initEngagementBar === 'function') {
      window.initEngagementBar(article.id);
    }

    const relGrid = document.getElementById('reader-related-grid');
    if (relGrid) {
      relGrid.innerHTML = articles.filter(a => a.id !== article.id).slice(0, 2).map(r => `
        <div class="article-card" onclick="navigateToArticle('${r.id}')">
          <div class="article-card-img-wrapper" style="height:160px;">
            <img src="${window.getImageUrl(r)}"
                 onerror="this.onerror=null;this.src='${DEFAULT_FALLBACK_IMG}';"
                 alt="${r.title}" class="article-card-img" />
            <span class="article-card-badge">${r.category}</span>
          </div>
          <div class="article-card-body" style="padding:1.25rem;">
            <h4 style="font-family:var(--font-heading);font-weight:700;color:#fff;font-size:1.05rem;margin-bottom:.5rem;">${r.title}</h4>
            <a href="/article/${r.id}/" class="article-read-btn" onclick="event.preventDefault(); event.stopPropagation(); navigateToArticle('${r.id}');">Read Related &rarr;</a>
          </div>
        </div>`).join('');
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    modal.scrollTop = 0;

    // Update document title and clean permalink in browser address bar
    const pageTitle = article.title + ' | iConnect Publication';
    document.title = pageTitle;

    const targetUrl = '/article/' + encodeURIComponent(article.id) + '/';
    if (pushHistory !== false) {
      if (window.location.pathname !== targetUrl) {
        try {
          history.pushState({ articleId: article.id, isArticleReader: true }, pageTitle, targetUrl);
        } catch (e) {}
      }
    }

    // Init lightbox for images inside the modal body
    if (typeof window.initArticleLightbox === 'function') {
      window.initArticleLightbox(modal);
    }
  };

  window.closeArticleReaderModal = function (updateHistory) {
    const modal = document.getElementById('article-reader-modal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
    document.title = 'iConnect Publication | Official BSCS Department Student Publication';

    if (updateHistory !== false) {
      if (window.location.pathname.startsWith('/article/')) {
        const returnUrl = window._preArticleUrl || '/';
        try {
          history.pushState({ isArticleReader: false }, document.title, returnUrl);
        } catch (e) {}
      }
    }
  };

  // Alias — both names work
  window.closeArticleReader = window.closeArticleReaderModal;

  // Handle browser Back and Forward history buttons
  if (typeof window !== 'undefined') {
    window.addEventListener('popstate', function () {
      const path = window.location.pathname;
      const match = path.match(/\/article\/([^\/]+)\/?$/i);
      if (match && match[1]) {
        const slug = decodeURIComponent(match[1]);
        if (typeof window.openArticleReaderModal === 'function') {
          window.openArticleReaderModal(slug, false);
        }
      } else {
        if (typeof window.closeArticleReaderModal === 'function') {
          window.closeArticleReaderModal(false);
        }
      }
    });
  }

  /* ------------------------------------------------------------------
     SINGLE ANNOUNCEMENT PAGE (announcement.html?id=1)
     ------------------------------------------------------------------ */
  window.renderSingleAnnouncementPage = function () {
    const id = new URLSearchParams(window.location.search).get('id');
    const items = (typeof window.getMergedAnnouncements === 'function')
      ? window.getMergedAnnouncements()
      : (window.announcementsData || []);

    const item = items.find(a => String(a.id) === String(id)) || items[0];
    if (!item) return;

    document.title = (item.title || 'Announcement') + ' | iConnect Publication';

    // Dynamic Social Share Preview Meta Tags
    (function updateMeta(ann) {
      if (!ann) return;
      var pageUrl = window.location.href;
      var imgUrl = ann.image || './assets/logo/iconnect-share-thumbnail.jpg';
      var absImgUrl = imgUrl.indexOf('://') !== -1 ? imgUrl : (window.location.origin + window.location.pathname.replace(/[^\/]*$/, '') + imgUrl.replace(/^\.\//, ''));
      var excerpt = (ann.body || '').replace(/<[^>]*>/g, '').slice(0, 160) + '...';

      var setMeta = function (prop, content) {
        var el = document.querySelector('meta[property="' + prop + '"]') || document.querySelector('meta[name="' + prop + '"]');
        if (!el) {
          el = document.createElement('meta');
          if (prop.startsWith('og:')) el.setAttribute('property', prop);
          else el.setAttribute('name', prop);
          document.head.appendChild(el);
        }
        el.setAttribute('content', content);
      };

      setMeta('og:title', ann.title + ' | iConnect Announcement');
      setMeta('og:description', excerpt);
      setMeta('og:image', absImgUrl);
      setMeta('og:url', pageUrl);

      setMeta('twitter:title', ann.title + ' | iConnect Announcement');
      setMeta('twitter:description', excerpt);
      setMeta('twitter:image', absImgUrl);
    })(item);

    const wrap = document.getElementById('single-announcement-render');
    if (!wrap) return;

    const tint = item.tintColor || '#00f0ff';
    const imgHtml = item.image ? `
      <div class="ann-hero-img-box">
        <img src="${item.image}" alt="${item.title}" class="ann-hero-img" />
      </div>` : '';

    wrap.innerHTML = `
      <div class="ann-reader-card" style="border-top: 4px solid ${tint}; box-shadow: 0 20px 60px ${tint}25;">
        <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:1rem; flex-wrap:wrap;">
          <span style="background:${tint}20; color:${tint}; padding:0.25rem 0.85rem; border-radius:999px; font-family:var(--font-mono); font-size:0.8rem; font-weight:700; border:1px solid ${tint}40;">${item.category || 'Announcement'}</span>
          <span style="font-family:var(--font-mono); font-size:0.85rem; color:var(--text-subtle);">${item.date || ''}</span>
        </div>

        <h1 style="font-family:var(--font-heading); font-size:2.2rem; font-weight:800; color:#fff; line-height:1.3; margin-bottom:1.5rem;">${item.title}</h1>

        ${imgHtml}

        <div class="ann-body-styled">${item.body || ''}</div>

        <div style="margin-top:3rem; padding-top:1.5rem; border-top:1px solid var(--border-navy); display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:1rem;">
          <button type="button" class="btn-publish-live" onclick="window.openAnnouncementShareModal('${item.id}')" style="padding:0.65rem 1.35rem; font-size:0.92rem; background:linear-gradient(135deg, #f4b41a, #d49b10); color:#050b1a; border:none; border-radius:12px; font-weight:800; cursor:pointer; box-shadow:0 4px 16px rgba(244,180,26,0.35);">
            📤 Share Announcement Link
          </button>
          <a href="index.html#announcements" class="reader-back-btn">
            Back to All Bulletins
          </a>
        </div>
      </div>`;
  };

  /* ------------------------------------------------------------------
     ARTICLE IMAGE LIGHTBOX ENGINE
     Clicking any image inside .reader-body-content or .article-grid-img
     opens a full-screen lightbox with prev/next navigation and keyboard
     support. Call window.initArticleLightbox(container) after rendering
     any article body.
     ------------------------------------------------------------------ */
  (function () {
    var lb, lbImg, lbCaption, lbCounter, lbClose, lbPrev, lbNext;
    var pool = [];   // all images in current article
    var current = 0;

    function buildDOM() {
      if (document.getElementById('article-lightbox')) return;
      lb = document.createElement('div');
      lb.id = 'article-lightbox';
      lb.setAttribute('role', 'dialog');
      lb.setAttribute('aria-modal', 'true');
      lb.setAttribute('aria-label', 'Image viewer');

      lbClose = document.createElement('button');
      lbClose.id = 'article-lightbox-close';
      lbClose.setAttribute('aria-label', 'Close image viewer');
      lbClose.innerHTML = '✕';
      lbClose.addEventListener('click', function (e) { e.stopPropagation(); closeLightbox(); });

      lbCounter = document.createElement('div');
      lbCounter.id = 'article-lightbox-counter';

      lbPrev = document.createElement('button');
      lbPrev.id = 'article-lightbox-prev';
      lbPrev.setAttribute('aria-label', 'Previous image');
      lbPrev.innerHTML = '‹';
      lbPrev.addEventListener('click', function (e) { e.stopPropagation(); navigate(-1); });

      lbNext = document.createElement('button');
      lbNext.id = 'article-lightbox-next';
      lbNext.setAttribute('aria-label', 'Next image');
      lbNext.innerHTML = '›';
      lbNext.addEventListener('click', function (e) { e.stopPropagation(); navigate(1); });

      lbImg = document.createElement('img');
      lbImg.id = 'article-lightbox-img';
      lbImg.alt = '';

      lbCaption = document.createElement('div');
      lbCaption.id = 'article-lightbox-caption';

      lb.appendChild(lbClose);
      lb.appendChild(lbCounter);
      lb.appendChild(lbPrev);
      lb.appendChild(lbNext);
      lb.appendChild(lbImg);
      lb.appendChild(lbCaption);

      lb.addEventListener('click', function (e) {
        if (e.target === lb) closeLightbox();
      });

      document.body.appendChild(lb);
    }

    function openLightbox(index) {
      if (!lb) buildDOM();
      if (!pool || pool.length === 0) {
        // If pool is empty, initialize from document
        window.initArticleLightbox(document.body);
      }
      current = Math.max(0, Math.min(index || 0, Math.max(0, pool.length - 1)));
      showImage();
      requestAnimationFrame(function () {
        if (lb) {
          lb.classList.add('lb-active');
          document.body.style.overflow = 'hidden';
          if (lbClose) lbClose.focus();
        }
      });
    }

    function closeLightbox() {
      if (!lb) return;
      lb.classList.remove('lb-active');
      document.body.style.overflow = '';
    }

    function navigate(dir) {
      if (!pool || pool.length === 0) return;
      current = (current + dir + pool.length) % pool.length;
      showImage();
    }

    function showImage() {
      var entry = pool[current];
      if (!entry || !lbImg) return;
      lbImg.src = entry.src;
      lbImg.alt = entry.alt || '';
      if (lbCaption) {
        lbCaption.textContent = entry.caption || '';
        lbCaption.style.display = entry.caption ? 'block' : 'none';
      }
      if (lbCounter) {
        lbCounter.textContent = pool.length > 1 ? (current + 1) + ' / ' + pool.length : '';
      }
      if (lbPrev) lbPrev.style.display = pool.length > 1 ? 'flex' : 'none';
      if (lbNext) lbNext.style.display = pool.length > 1 ? 'flex' : 'none';
    }

    // Keyboard nav
    if (typeof document !== 'undefined') {
      document.addEventListener('keydown', function (e) {
        if (!lb || !lb.classList.contains('lb-active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft')  navigate(-1);
        if (e.key === 'ArrowRight') navigate(1);
      });
    }

    // Public API — call after rendering any article body
    window.initArticleLightbox = function (container) {
      var targetContainer = container || document.body;
      buildDOM();

      // Collect all clickable images (body content + photo grids + Vision Pro galleries)
      var imgs = Array.prototype.slice.call(
        targetContainer.querySelectorAll('.reader-body-content img, .article-grid-img, .vision-pro-card-img, .vision-pro-card img, .editor-canvas img')
      );

      // Deduplicate by src
      var seen = {};
      pool = [];
      imgs.forEach(function (img) {
        var src = img.src || img.getAttribute('src') || '';
        if (!src || seen[src]) return;
        seen[src] = true;

        // Find caption
        var caption = '';
        var fig = img.closest('figure');
        if (fig) {
          var fc = fig.querySelector('figcaption');
          if (fc) caption = fc.textContent.trim();
        }
        var vpCard = img.closest('.vision-pro-card');
        if (vpCard) {
          var vpCap = vpCard.querySelector('.vision-pro-caption-overlay');
          if (vpCap) caption = vpCap.textContent.trim();
        }
        if (!caption && img.alt && img.alt !== 'Photo' && img.alt !== 'Article image' && img.alt !== 'Gallery photo') {
          caption = img.alt;
        }

        pool.push({ src: src, alt: img.alt || '', caption: caption });
      });
    };

    window.openArticleLightbox = openLightbox;
    window.closeArticleLightbox = closeLightbox;

    window.openArticleLightboxByElement = function (el) {
      if (!el) return;
      var container = el.closest('.vision-pro-gallery-container') || el.closest('.reader-body-content') || el.closest('.article-page') || document.body;
      window.initArticleLightbox(container);
      
      var targetSrc = el.getAttribute('src') || (el.querySelector('img') ? el.querySelector('img').getAttribute('src') : '');
      var foundIdx = 0;
      if (targetSrc) {
        for (var i = 0; i < pool.length; i++) {
          if (pool[i].src === targetSrc || pool[i].src.indexOf(targetSrc) !== -1 || targetSrc.indexOf(pool[i].src) !== -1) {
            foundIdx = i;
            break;
          }
        }
      }
      openLightbox(foundIdx);
    };

    // Global Delegated Click Handler for all Photo Gallery Cards & Immersive View Buttons
    if (typeof document !== 'undefined') {
      document.addEventListener('click', function (e) {
        // 1. Click on Immersive View button
        var btn = e.target.closest('.vision-pro-capsule-btn');
        if (btn) {
          e.preventDefault();
          e.stopPropagation();
          var galleryContainer = btn.closest('.vision-pro-gallery-container') || document.body;
          window.initArticleLightbox(galleryContainer);
          openLightbox(0);
          return;
        }

        // 2. Click on any Vision Pro Gallery Card
        var card = e.target.closest('.vision-pro-card');
        if (card) {
          e.preventDefault();
          e.stopPropagation();
          var img = card.querySelector('img');
          if (img) {
            window.openArticleLightboxByElement(img);
          }
          return;
        }
      });
    }
  })();

})(window);
