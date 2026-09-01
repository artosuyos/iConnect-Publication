#!/usr/bin/env node
/**
 * iConnect Publication — Article Stub Page Generator
 * =====================================================
 * Reads articles/index.js and generates per-article HTML stubs at:
 *   article/[slug]/index.html
 *
 * Each stub contains:
 *   - Static OG/Twitter meta tags (title + cover image) — baked into HTML
 *     so social crawlers read them without executing JavaScript
 *   - An instant JS redirect to article.html?id=[slug]
 *   - A <noscript> meta refresh fallback
 *
 * Usage:
 *   node generate-article-pages.js
 *   node generate-article-pages.js https://your-domain.com
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const vm   = require('vm');

// ---------------------------------------------------------------------------
// 1. Determine base URL
// ---------------------------------------------------------------------------
let BASE_URL = (process.argv[2] || process.env.URL || process.env.DEPLOY_PRIME_URL || process.env.VERCEL_URL || '').replace(/\/$/, '');
if (BASE_URL && !/^https?:\/\//i.test(BASE_URL)) {
  BASE_URL = 'https://' + BASE_URL;
}

console.log('🌐  Base URL:', BASE_URL || '(Dynamic relative)', '\n');

// ---------------------------------------------------------------------------
// 2. Load articles safely using vm with correct context
// ---------------------------------------------------------------------------
const articlesFile = path.join(__dirname, 'articles', 'index.js');
if (!fs.existsSync(articlesFile)) {
  console.error('❌  articles/index.js not found at:', articlesFile);
  process.exit(1);
}

let src = fs.readFileSync(articlesFile, 'utf8');

// Create a vm context — 'window' is present so the window-assignment line works
const ctx = vm.createContext({ window: {} });

// Run the source; articlesData will be declared as a var in ctx scope
try {
  vm.runInContext(src, ctx);
} catch (e) {
  console.error('❌  Failed to evaluate articles/index.js:', e.message);
  process.exit(1);
}

// After running, retrieve articlesData from the context
const articles = ctx.articlesData;

if (!Array.isArray(articles) || articles.length === 0) {
  console.error('❌  No articles found in articles/index.js (articlesData is empty or not an array)');
  process.exit(1);
}

console.log(`📰  Found ${articles.length} articles.\n`);

// ---------------------------------------------------------------------------
// 3. Helpers
// ---------------------------------------------------------------------------
function resolveImageUrl(imageField) {
  if (!imageField) return (BASE_URL ? BASE_URL : '') + '/assets/images/articles/gallery-1.jpg';
  if (/^https?:\/\//.test(imageField)) return imageField;
  return (BASE_URL ? BASE_URL : '') + '/' + imageField.replace(/^\.\//, '');
}

function escAttr(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Tracks seen slugs so duplicate IDs get a numeric suffix
const seenSlugs = {};
function uniqueSlug(rawId) {
  if (!seenSlugs[rawId]) { seenSlugs[rawId] = 1; return rawId; }
  seenSlugs[rawId]++;
  return rawId + '-' + seenSlugs[rawId];
}

// ---------------------------------------------------------------------------
// 4. Full Article HTML template
// ---------------------------------------------------------------------------
function buildMetaBar(article) {
  const authorVal = (article.author || '').trim();
  const roleVal   = (article.role || '').trim();
  const dateVal   = (article.date || '').trim();
  const readVal   = (article.readingTime || article.readTime || '').trim();

  let authorHTML = '';
  if (authorVal) {
    authorHTML = `
      <div class="reader-meta-item reader-meta-author" style="display:inline-flex; align-items:center; gap:0.65rem;">
        <div class="author-avatar" style="width:42px; height:42px; min-width:42px; min-height:42px; border-radius:50%; background:var(--bg-navy-elevated, #0a1128); border:2px solid var(--cheddar-yellow, #f4b41a); color:var(--cheddar-yellow, #f4b41a); display:flex; align-items:center; justify-content:center; flex-shrink:0; box-shadow:0 0 10px rgba(244,180,26,0.2);">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
        </div>
        <div style="display:flex; flex-direction:column; justify-content:center;">
          <div style="font-weight:400; color:#ffffff; font-size:0.95rem; line-height:1.25;">${escAttr(authorVal)}</div>
          ${roleVal ? `<div style="font-size:0.8rem; color:var(--text-subtle); margin-top:0.15rem; font-weight:400;">${escAttr(roleVal)}</div>` : ''}
        </div>
      </div>`;
  }

  let infoParts = [];
  if (dateVal) {
    infoParts.push(`
      <div class="reader-meta-date" style="display:inline-flex; align-items:center; gap:0.4rem; color:var(--text-muted); font-size:0.88rem; line-height:1;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="opacity:0.75; display:block; flex-shrink:0;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        <span>${escAttr(dateVal)}</span>
      </div>`);
  }
  if (readVal) {
    infoParts.push(`
      <div class="reader-meta-readtime" style="display:inline-flex; align-items:center; gap:0.4rem; color:var(--cheddar-yellow); font-size:0.88rem; font-family:var(--font-mono); font-weight:600; line-height:1;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="opacity:0.9; display:block; flex-shrink:0;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <span>${escAttr(readVal)}</span>
      </div>`);
  }

  return `
    <div class="reader-meta ${authorVal ? 'reader-meta-has-authors' : ''}" style="display:flex; flex-direction:column; align-items:flex-start; gap:0.35rem; padding-bottom:1.5rem; border-bottom:1px solid var(--border-navy); margin-bottom:2rem; width:100%;">
      ${authorHTML ? `<div class="reader-meta-authors" style="display:flex; align-items:center; gap:0; row-gap:0.75rem; flex-wrap:wrap; width:100%;">${authorHTML}</div>` : ''}
      ${infoParts.length ? `<div class="reader-meta-sub" style="display:flex; align-items:center; gap:0.65rem; margin-top:0.15rem; flex-wrap:wrap; width:100%; ${authorVal ? 'padding-left:calc(42px + 0.65rem);' : ''}">${infoParts.join('<span class="reader-meta-dot" style="color:var(--text-subtle); opacity:0.4; font-size:0.9rem;">&bull;</span>')}</div>` : ''}
    </div>`;
}

function generateArticleHTML(article, slug, allArticles) {
  const title       = escAttr(article.title || 'iConnect Article');
  const rawExcerpt  = (article.excerpt || article.content || '')
                        .replace(/<[^>]*>/g, '').trim().slice(0, 160);
  const description = escAttr(rawExcerpt ? rawExcerpt + '...' : 'Read this article on iConnect Publication.');
  const imageUrl    = resolveImageUrl(article.image || article.featuredImage);
  const fullImgUrl  = /^https?:\/\//.test(imageUrl) ? imageUrl : (BASE_URL + imageUrl);
  const canonicalUrl = BASE_URL + '/article/' + slug + '/';
  const author      = escAttr(article.author || 'iConnect Publication');
  const category    = escAttr(article.category || 'News');
  const date        = escAttr(article.date || '');
  const metaHtml    = buildMetaBar(article);

  const relatedArticles = allArticles.filter(a => a.id !== article.id).slice(0, 2);
  const relatedHTML = relatedArticles.map(r => {
    const rImg = resolveImageUrl(r.image || r.featuredImage);
    return `
      <div class="article-card" onclick="window.location.href='/article/${r.id}/'">
        <div class="article-card-img-wrapper" style="height:160px;">
          <img src="${rImg}" alt="${escAttr(r.title)}" class="article-card-img" />
          <span class="article-card-badge">${escAttr(r.category || 'Story')}</span>
        </div>
        <div class="article-card-body" style="padding:1.25rem;">
          <h4 style="font-family:var(--font-heading);font-weight:700;color:#fff;font-size:1.05rem;margin-bottom:.5rem;">${escAttr(r.title)}</h4>
          <a href="/article/${r.id}/" class="article-read-btn">Read Related &rarr;</a>
        </div>
      </div>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#050b1a" />
  <link rel="canonical" href="${canonicalUrl}" />

  <title>${title} | iConnect Publication</title>
  <meta name="description" content="${description}" />

  <!-- Open Graph Meta Tags -->
  <meta property="og:type"              content="article" />
  <meta property="og:site_name"         content="iConnect Publication" />
  <meta property="og:title"             content="${title} | iConnect Publication" />
  <meta property="og:description"       content="${description}" />
  <meta property="og:url"               content="${canonicalUrl}" />
  <meta property="og:image"             content="${fullImgUrl}" />
  <meta property="og:image:secure_url"  content="${fullImgUrl}" />
  <meta property="og:image:width"       content="1200" />
  <meta property="og:image:height"      content="630" />
  <meta property="og:locale"            content="en_PH" />
  <meta property="article:published_time" content="${date}" />
  <meta property="article:author"       content="${author}" />
  <meta property="article:section"      content="${category}" />

  <!-- Twitter / X Card -->
  <meta name="twitter:card"             content="summary_large_image" />
  <meta name="twitter:url"              content="${canonicalUrl}" />
  <meta name="twitter:title"            content="${title} | iConnect Publication" />
  <meta name="twitter:description"      content="${description}" />
  <meta name="twitter:image"            content="${fullImgUrl}" />

  <!-- Favicon & Touch Icons -->
  <link rel="icon" type="image/png" href="/assets/logo/iconnect-logo-3d.png" />
  <link rel="apple-touch-icon"       href="/assets/logo/iconnect-share-thumbnail.jpg" />

  <!-- CSS Stylesheet -->
  <link rel="stylesheet" href="/css/style.css?v=33" />
</head>
<body class="article-page" style="background-color: var(--bg-deep);">

  <!-- Background Canvas -->
  <canvas id="bg-canvas"></canvas>

  <!-- Navigation Bar -->
  <header class="navbar scrolled" id="navbar">
    <div class="container nav-container">
      <a href="/" class="nav-brand">
        <img src="/assets/logo/iconnect-logo-3d.png" alt="iConnect Logo" class="nav-logo-img" />
        <div class="nav-brand-text">
          <span class="nav-brand-title"><span class="i-ripple-container">i</span><span>CONNECT</span></span>
          <span class="nav-brand-sub">BSCS Publication</span>
        </div>
      </a>

      <nav>
        <ul class="nav-menu" id="nav-menu">
          <li><a href="/" class="nav-link">Home</a></li>
          <li class="nav-item-has-dropdown">
            <a href="javascript:void(0)" class="nav-link">Explore</a>
            <ul class="nav-dropdown nav-dropdown-explore" id="explore-dropdown-menu">
              <li><a href="/#latest-stories" class="nav-dropdown-link"><span class="sub-title">All Stories</span></a></li>
            </ul>
          </li>
          <li><a href="/faculty.html" class="nav-link">Faculty Directory</a></li>
          <li><a href="/editorial-board.html" class="nav-link">Editorial Board</a></li>
          <li class="nav-item-has-dropdown">
            <a href="/about.html" class="nav-link">About</a>
            <ul class="nav-dropdown">
              <li><a href="/about.html" class="nav-dropdown-link"><span class="sub-title">About iConnect</span><span class="sub-desc">Publication Overview</span></a></li>
              <li><a href="/iconnect-mvg.html" class="nav-dropdown-link"><span class="sub-title">iConnect Mission &amp; Vision</span><span class="sub-desc">Goals &amp; Core Principles</span></a></li>
              <li><a href="/capsu-vmg.html" class="nav-dropdown-link"><span class="sub-title">CAPSU Vision &amp; Mission</span></a></li>
            </ul>
          </li>
        </ul>
      </nav>

      <div class="nav-actions">
        <a href="/" class="reader-back-btn desktop-only-btn" style="padding: 0.45rem 0.95rem; font-size: 0.82rem;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Home
        </a>
        <div class="nav-hamburger" id="nav-hamburger" aria-label="Toggle Menu">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  </header>

  <!-- Single Article Main Container -->
  <main class="container" style="padding-top: 7rem; padding-bottom: 6rem;">
    <div id="single-article-render">
      <div class="reader-container" style="margin-top:1rem;">
        <a href="/" class="reader-back-btn" style="margin-bottom:1.5rem; display:inline-flex; align-items:center; gap:0.5rem;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Back to Publication
        </a>
        <span class="reader-category">${category}</span>
        <h1 class="reader-title">${title}</h1>
        ${metaHtml}
        ${article.excerpt ? `<p class="reader-excerpt" style="font-style:italic; color:var(--text-muted, #94a3b8); font-size:1.05rem; line-height:1.65; margin:0 0 1.25rem 0;">${escAttr(article.excerpt.trim())}</p>` : ''}
        <div id="engagement-bar-placeholder" style="margin: 0.5rem 0 2rem 0;"></div>
        <div class="reader-hero-img-wrapper">
          <img src="${imageUrl}" alt="${title}" class="reader-hero-img" />
        </div>
        <div class="reader-body-content">${article.content || ''}</div>
        <div style="margin-top:4rem;padding-top:2.5rem;border-top:1px solid var(--border-navy);">
          <h3 style="font-family:var(--font-heading);font-size:1.5rem;color:#fff;margin-bottom:1.5rem;">Related Publication Stories</h3>
          <div class="articles-grid" id="related-articles-grid">
            ${relatedHTML}
          </div>
        </div>
      </div>
    </div>
  </main>

  <!-- Footer Section -->
  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div>
          <h3 class="footer-brand-title">i<span>CONNECT</span></h3>
          <p style="color:var(--cheddar-yellow); font-family:var(--font-mono); font-size:0.85rem; font-weight:600; margin-bottom:0.75rem;">
            The Official Publication of the BSCS Department
          </p>
          <p class="footer-brand-desc">
            Capiz State University – Mambusao Satellite College<br />
            Mambusao, Capiz, Philippines
          </p>
          <p style="font-style:italic; font-size:0.875rem; color:var(--text-subtle);">
            "Be the voice. Be the connection. Be the next link."
          </p>
        </div>

        <div>
          <h4 class="footer-heading">Navigation</h4>
          <ul class="footer-links">
            <li><a href="/#latest-stories">Latest Stories</a></li>
            <li><a href="/#about">About iConnect</a></li>
            <li><a href="/capsu-vmg.html">CAPSU Vision &amp; Mission</a></li>
            <li><a href="/#team">Editorial Board</a></li>
            <li><a href="/#network">Network Visualizer</a></li>
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
        <div>
          &copy; 2026 iConnect Publication. All Rights Reserved. BSCS Department, CAPSU Mambusao Satellite College.
        </div>
      </div>
    </div>
  </footer>

  <!-- JavaScript Modules -->
  <script src="/articles/index.js?v=20260831b"></script>
  <script src="/js/infocus.js?v=20260831b"></script>
  <script src="/js/slider.js?v=20260831b"></script>
  <script src="/js/about.js?v=20260831b"></script>
  <script src="/js/faculty.js?v=20260831b"></script>
  <script src="/js/editorial.js?v=20260831b"></script>
  <script src="/js/creatives.js?v=20260831b"></script>
  <script src="/js/announcements.js?v=20260831b"></script>
  <script src="/js/metadata.js?v=20260831b"></script>
  <script src="/js/ecosystem.js?v=20260831b"></script>
  <script src="/js/network.js?v=20260831b"></script>
  <script src="/js/render.js?v=20260831b"></script>
  <script src="/js/search.js?v=20260831b"></script>
  <script src="/js/engagement.js?v=20260831b"></script>
  <script src="/js/app.js?v=20260831b"></script>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// 5. Generate all article pages
// ---------------------------------------------------------------------------
const articleDir = path.join(__dirname, 'article');
if (!fs.existsSync(articleDir)) fs.mkdirSync(articleDir, { recursive: true });

let generated = 0;
let skipped   = 0;

articles.forEach(function (article) {
  if (!article || !article.id) {
    console.warn('  ⚠  Skipping article (no id):', article && article.title);
    skipped++;
    return;
  }

  const slug    = uniqueSlug(article.id);
  const slugDir = path.join(articleDir, slug);
  const outFile = path.join(slugDir, 'index.html');

  if (!fs.existsSync(slugDir)) fs.mkdirSync(slugDir, { recursive: true });

  fs.writeFileSync(outFile, generateArticleHTML(article, slug, articles), 'utf8');
  console.log(`  ✅  /article/${slug}/  →  "${article.title}"`);
  generated++;
});

console.log(`\n🎉  Done! Generated ${generated} full article pages. ${skipped ? `Skipped: ${skipped}.` : ''}`);

console.log('\n📋  Clean permalink URLs:\n');
articles.forEach(function (a) {
  if (a && a.id) console.log(`  ${BASE_URL}/article/${a.id}/`);
});
