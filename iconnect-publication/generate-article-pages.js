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
let BASE_URL = (process.argv[2] || process.env.URL || process.env.DEPLOY_PRIME_URL || '').replace(/\/$/, '');

if (!BASE_URL) {
  // Try to auto-detect from README
  try {
    const readme = fs.readFileSync(path.join(__dirname, 'README.md'), 'utf8');
    const match  = readme.match(/https:\/\/[a-zA-Z0-9\-\.]+\.(vercel|netlify|app|com|ph|net|org)[^\s\)\"']*/i);
    if (match) BASE_URL = match[0].replace(/\/$/, '');
  } catch (e) {}
}

if (!BASE_URL) {
  BASE_URL = 'https://gleeful-granita-91fc93.netlify.app';
}

console.log('🌐  Base URL:', BASE_URL, '\n');

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
  if (!imageField) return BASE_URL + '/assets/images/articles/gallery-1.jpg';
  if (/^https?:\/\//.test(imageField)) return imageField;
  return BASE_URL + '/' + imageField.replace(/^\.\//, '');
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
// 4. Stub HTML template
// ---------------------------------------------------------------------------
function generateStubHTML(article, slug) {
  const title       = escAttr(article.title || 'iConnect Article');
  const rawExcerpt  = (article.excerpt || article.content || '')
                        .replace(/<[^>]*>/g, '').trim().slice(0, 160);
  const description = escAttr(rawExcerpt ? rawExcerpt + '...' : 'Read this article on iConnect Publication.');
  const imageUrl    = resolveImageUrl(article.image || article.featuredImage);
  const articleUrl  = BASE_URL + '/article.html?id=' + encodeURIComponent(slug);
  const canonicalUrl = BASE_URL + '/article/' + slug + '/';
  const author      = escAttr(article.author || 'iConnect Publication');
  const category    = escAttr(article.category || 'News');
  const date        = escAttr(article.date || '');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#050b1a" />
  <link rel="canonical" href="${canonicalUrl}" />

  <title>${title} | iConnect Publication</title>
  <meta name="description" content="${description}" />

  <!-- Open Graph — static, crawler-readable sharing metadata -->
  <meta property="og:type"              content="article" />
  <meta property="og:site_name"         content="iConnect Publication" />
  <meta property="og:title"             content="${title} | iConnect Publication" />
  <meta property="og:description"       content="${description}" />
  <meta property="og:url"               content="${canonicalUrl}" />
  <meta property="og:image"             content="${imageUrl}" />
  <meta property="og:image:secure_url"  content="${imageUrl}" />
  <meta property="og:image:width"       content="1200" />
  <meta property="og:image:height"      content="630" />
  <meta property="og:locale"            content="en_PH" />
  <meta property="article:published_time" content="${date}" />
  <meta property="article:author"       content="${author}" />
  <meta property="article:section"      content="${category}" />

  <!-- Twitter / X Card -->
  <meta name="twitter:card"             content="summary_large_image" />
  <meta name="twitter:title"            content="${title} | iConnect Publication" />
  <meta name="twitter:description"      content="${description}" />
  <meta name="twitter:image"            content="${imageUrl}" />

  <link rel="icon" type="image/png" href="${BASE_URL}/assets/logo/iconnect-logo-3d.png" />
  <link rel="apple-touch-icon"       href="${BASE_URL}/assets/logo/iconnect-share-thumbnail.jpg" />

  <!-- Instant redirect for browsers (crawlers don't execute JS) -->
  <script>window.location.replace('${articleUrl}');</script>
  <noscript><meta http-equiv="refresh" content="0; url=${articleUrl}" /></noscript>

  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{background:#050b1a;color:#e0e6f0;
      font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
      display:flex;align-items:center;justify-content:center;
      min-height:100vh;text-align:center;padding:2rem}
    .w{max-width:520px}
    .ic{font-size:2.5rem;margin-bottom:1rem}
    .t{font-size:1.3rem;font-weight:700;color:#00f0ff;margin-bottom:.5rem;line-height:1.4}
    .s{color:#94a3b8;font-size:.9rem}
    .btn{display:inline-block;margin-top:1.5rem;padding:.6rem 1.5rem;
      background:rgba(0,240,255,.1);border:1px solid #00f0ff;border-radius:8px;
      color:#00f0ff;text-decoration:none;font-size:.9rem}
  </style>
</head>
<body>
  <div class="w">
    <div class="ic">📰</div>
    <div class="t">${title}</div>
    <div class="s">iConnect Publication — Loading article…</div>
    <a href="${articleUrl}" class="btn">Open Article →</a>
  </div>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// 5. Generate all stub pages
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

  fs.writeFileSync(outFile, generateStubHTML(article, slug), 'utf8');
  console.log(`  ✅  /article/${slug}/  →  "${article.title}"`);
  generated++;
});

console.log(`\n🎉  Done! Generated ${generated} stub pages. ${skipped ? `Skipped: ${skipped}.` : ''}`);

console.log('\n📋  Share these article URLs:\n');
articles.forEach(function (a) {
  if (a && a.id) console.log(`  ${BASE_URL}/article/${a.id}/`);
});

console.log('\n💡  Next steps:');
console.log('   1. Commit the article/ folder to your Git repository.');
console.log('   2. Push and deploy to Netlify / Vercel.');
console.log('   3. Share links in the format:', BASE_URL + '/article/[slug]/');
console.log('   4. Re-run this script whenever you add new articles to articles/index.js.');
console.log('\n   For Publisher-created articles (localStorage), use the "📤 Get Share Link"');
console.log('   button in the Publisher Studio to download+deploy individual stub pages.\n');
