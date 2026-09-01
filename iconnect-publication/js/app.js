/* ==========================================================================
   iCONNECT PUBLICATION — MAIN APPLICATION CONTROLLER (js/app.js)
   Initializes Navigation, Data Loading, Renders, Search, and Modals
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  /* --------------------------------------------------------------------------
     1. STICKY NAVBAR SCROLL TRANSITION & MOBILE MENU
     -------------------------------------------------------------------------- */
  const navbar = document.getElementById('navbar');
  const navHamburger = document.getElementById('nav-hamburger');
  const navMenu = document.getElementById('nav-menu');

  window.addEventListener('scroll', function () {
    if (navbar) {
      if (window.scrollY > 40) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
  });

  if (navHamburger && navMenu) {
    navHamburger.addEventListener('click', function (e) {
      e.stopPropagation();
      const isActive = navMenu.classList.toggle('active');
      navHamburger.classList.toggle('active', isActive);
      document.body.style.overflow = isActive ? 'hidden' : '';
      if (isActive) {
        document.querySelectorAll('.nav-item-has-dropdown').forEach(function (p) {
          p.classList.add('open');
        });
      }
    });

    navMenu.addEventListener('click', function (e) {
      // Top-level dropdown label toggles dropdown — do NOT close menu immediately
      if (e.target.closest('.nav-item-has-dropdown > .nav-link')) {
        return;
      }
      // For any real link (nav or dropdown subpage), handle smooth behavior and close menu
      const clickedLink = e.target.closest('a');
      if (clickedLink) {
        var href = clickedLink.getAttribute('href');

        // If clicking a link to the current page (e.g. capsu-vmg.html while on capsu-vmg.html)
        if (href && href !== '#' && href !== 'javascript:void(0)') {
          const currentPage = window.location.pathname.split('/').pop() || 'index.html';
          if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }

        setTimeout(function () {
          navMenu.classList.remove('active');
          if (navHamburger) navHamburger.classList.remove('active');
          document.body.style.overflow = '';
          document.querySelectorAll('.nav-item-has-dropdown').forEach(function (p) {
            p.classList.remove('open');
          });
        }, 80);
      }
    });

    document.addEventListener('click', function (e) {
      if (navMenu.classList.contains('active') && !navMenu.contains(e.target) && !navHamburger.contains(e.target)) {
        navMenu.classList.remove('active');
        navHamburger.classList.remove('active');
        document.body.style.overflow = '';
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 768 && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        navHamburger.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  /* --------------------------------------------------------------------------
     1B. ABOUT DROPDOWN CLICK TOGGLE & PERSISTENCE
     -------------------------------------------------------------------------- */
  const dropdownParents = document.querySelectorAll('.nav-item-has-dropdown');
  dropdownParents.forEach(function (parent) {
    const link = parent.querySelector(':scope > .nav-link');
    if (link) {
      link.addEventListener('click', function (e) {
        const href = link.getAttribute('href');
        if (window.innerWidth <= 768 || href === '#' || href === 'javascript:void(0)') {
          e.preventDefault();
        }
        e.stopPropagation();

        dropdownParents.forEach(function (other) {
          if (other !== parent) other.classList.remove('open');
        });
        parent.classList.toggle('open');
      });
    }
  });

  // Close dropdown on click outside
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.nav-item-has-dropdown')) {
      dropdownParents.forEach(function (p) { p.classList.remove('open'); });
    }
  });

  /* --------------------------------------------------------------------------
     1C. GLOBAL EXPLORE DROPDOWN CATEGORY NAVIGATION HANDLER
     -------------------------------------------------------------------------- */
  window.onNavCategoryClick = function (cat) {
    const navMenu = document.getElementById('nav-menu');
    const navHamburger = document.getElementById('nav-hamburger');
    if (navMenu) navMenu.classList.remove('active');
    if (navHamburger) navHamburger.classList.remove('active');
    document.body.style.overflow = '';

    document.querySelectorAll('.nav-item-has-dropdown').forEach(function (p) {
      p.classList.remove('open');
    });

    const articlesGrid = document.getElementById('articles-grid');
    if (!articlesGrid) {
      // On subpages (faculty.html, capsu-vmg.html, about.html, etc.) -> Navigate to index.html with category query
      window.location.href = 'index.html?category=' + encodeURIComponent(cat) + '#latest-stories';
      return;
    }

    // On index.html -> Filter articles grid & scroll smoothly
    if (typeof window.setCategoryFilter === 'function') {
      window.setCategoryFilter(cat);
    } else if (typeof window.renderArticlesGrid === 'function' && typeof window.loadArticlesData === 'function') {
      window.currentCategoryFilter = cat;
      window.renderArticlesGrid(window.loadArticlesData(), cat);
    }

    const target = document.getElementById('latest-stories') || document.getElementById('stories-section') || document.getElementById('articles-grid');
    if (target) {
      setTimeout(function () {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    }
  };

  /* --------------------------------------------------------------------------
     2. LOAD ARTICLES DATA & INITIALIZE RENDERS
     -------------------------------------------------------------------------- */
  if (typeof window.loadArticlesData === 'function') {
    const articles = window.loadArticlesData();

    if (document.getElementById('single-article-render') && typeof window.renderSingleArticlePage === 'function') {
      window.renderSingleArticlePage();
    }

    if ((document.getElementById('showcase-slider-container') || document.getElementById('featured-slider-container')) && typeof window.renderHeroSlider === 'function') {
      window.renderHeroSlider();
    }

    if (document.getElementById('featured-story-container') && typeof window.renderFeaturedStory === 'function') {
      window.renderFeaturedStory(articles);
    }

    if (document.getElementById('category-filter-bar')) {
      window.renderCategories(articles);
    } else if (typeof window.renderNavCategories === 'function') {
      window.renderNavCategories();
    }

    if (document.getElementById('articles-grid')) {
      const urlParams = new URLSearchParams(window.location.search);
      const urlCat = urlParams.get('category');
      const initialCat = urlCat ? decodeURIComponent(urlCat) : 'All';

      window.renderArticlesGrid(articles, initialCat);

      if (urlCat && typeof window.setCategoryFilter === 'function') {
        window.setCategoryFilter(initialCat);
      }

      if (urlCat) {
        const target = document.getElementById('latest-stories') || document.getElementById('stories-section') || document.getElementById('articles-grid');
        if (target) {
          setTimeout(function () {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 150);
        }
      }
    }

    if (typeof window.initSearchEngine === 'function') {
      window.initSearchEngine();
    }

    // Direct permalink deep-linking on index.html: /article/{id}/ or ?id={id}
    if (document.getElementById('article-reader-modal') && typeof window.openArticleReaderModal === 'function') {
      const pathMatch = window.location.pathname.match(/\/article\/([^\/]+)\/?$/i);
      if (pathMatch && pathMatch[1]) {
        const slug = decodeURIComponent(pathMatch[1]);
        window.openArticleReaderModal(slug, false);
      } else {
        const urlParams = new URLSearchParams(window.location.search);
        const queryId = urlParams.get('id') || urlParams.get('article');
        if (queryId) {
          window.openArticleReaderModal(queryId, true);
        }
      }
    }
  }

  /* --------------------------------------------------------------------------
     3. EDITORIAL TEAM, ANNOUNCEMENTS & CREATIVES RENDER
     -------------------------------------------------------------------------- */
  function formatEditorialCardName(name) {
    if (!name || typeof name !== 'string') return '';
    const trimmed = name.trim();

    // 1. Middle Initial Match (e.g., "Mhyrien Claire L. Faceronda", "Earl G. Lipardo", "Jonathan M. Irabon")
    const miMatch = trimmed.match(/^(.+?)\s+([A-Za-z]\.?)\s+([A-Za-z\s'-]+)$/);
    if (miMatch) {
      const firstName = miMatch[1].trim();
      const middleAndLast = (miMatch[2] + ' ' + miMatch[3]).trim();
      return `<span class="team-name-first">${firstName}</span><span class="team-name-sub">${middleAndLast}</span>`;
    }

    // 2. Compound Surname (e.g., "Gian Kevin Dela Torre", "Juan De La Cruz")
    const compoundMatch = trimmed.match(/^(.+?)\s+((?:de\s+la|dela|delos|de\s+los|san|santa|van|von)\s+\S+)$/i);
    if (compoundMatch) {
      const fn = compoundMatch[1].trim();
      const ln = compoundMatch[2].trim();
      return `<span class="team-name-first">${fn}</span><span class="team-name-sub">${ln}</span>`;
    }

    // 3. Multi-word name without middle initial (e.g., "Ann Lily Lerio", "Jefferson Sibug")
    const parts = trimmed.split(/\s+/);
    if (parts.length > 1) {
      const lastName = parts.pop();
      const firstNames = parts.join(' ');
      return `<span class="team-name-first">${firstNames}</span><span class="team-name-sub">${lastName}</span>`;
    }

    return `<span class="team-name-first">${trimmed}</span>`;
  }

  function teamCardHTML(member, index) {
    const hasImage = member.image;
    const avatarInner = hasImage
      ? `<img src="${member.image}" alt="${member.name}"
              onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
              class="team-avatar-img" />
         <span class="team-avatar-initials" style="display:none;">${member.initials}</span>`
      : `<span class="team-avatar-initials">${member.initials}</span>`;

    const formattedName = formatEditorialCardName(member.name);

    return `
      <div class="team-card team-card-compact" onclick="openTeamModal(${index})" title="View ${member.name}'s profile">
        <div class="team-card-click-hint">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          View Profile
        </div>
        <div class="team-avatar">${avatarInner}</div>
        <h4 class="team-name">${formattedName}</h4>
        <div class="team-role">${member.role}</div>
      </div>`;
  }

  window.getMergedEditorialTeam = function () {
    try {
      var stored = localStorage.getItem('iconnect_editorial_board');
      if (stored) {
        var parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {}

    var allMembers = [];
    if (typeof window.adviserData !== 'undefined' && window.adviserData) {
      allMembers.push(
        Object.assign({}, window.adviserData, {
          _isAdviser: true
        })
      );
    }
    if (typeof window.editorialTeamData !== 'undefined' && Array.isArray(window.editorialTeamData)) {
      window.editorialTeamData.forEach(function (member) {
        allMembers.push(member);
      });
    }
    return allMembers;
  };

  window.getMergedEditorialHeader = function () {
    try {
      var stored = JSON.parse(localStorage.getItem('iconnect_editorial_header'));
      if (stored && typeof stored === 'object') {
        return stored;
      }
    } catch (e) {}
    return window.editorialHeaderData || {
      badge: "Leadership & Staff",
      title: "The Editorial Board",
      description: "Meet the student journalists, developers, and editors driving the iConnect publication network."
    };
  };

  window.getMergedEditorialLevels = function () {
    try {
      var stored = localStorage.getItem('iconnect_editorial_levels');
      if (stored) {
        var parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return window.editorialLevelsData || [];
  };

  function renderEditorialTeam() {
    // Update Editorial Section Header (Badge, Title, Description)
    const headerData = (typeof window.getMergedEditorialHeader === 'function')
      ? window.getMergedEditorialHeader()
      : (window.editorialHeaderData || {
          badge: "Leadership & Staff",
          title: "The Editorial Board",
          description: "Meet the student journalists, developers, and editors driving the iConnect publication network."
        });

    const teamSection = document.getElementById('team');
    if (teamSection) {
      const tagEl   = teamSection.querySelector('.section-tag');
      const titleEl = teamSection.querySelector('.section-title');
      const descEl  = teamSection.querySelector('.section-desc');
      if (tagEl)   tagEl.textContent   = headerData.badge;
      if (titleEl) titleEl.textContent = headerData.title;
      if (descEl)  descEl.textContent  = headerData.description;

      if (headerData.thumbnail) {
        var ogImg = document.querySelector('meta[property="og:image"]');
        if (ogImg) ogImg.setAttribute('content', headerData.thumbnail);
        var twImg = document.querySelector('meta[name="twitter:image"]');
        if (twImg) twImg.setAttribute('content', headerData.thumbnail);
      }
    }

    const allMembers = (typeof window.getMergedEditorialTeam === 'function')
      ? window.getMergedEditorialTeam()
      : [];
    window._teamAllMembers = allMembers;

    const teamContainer = document.getElementById('editorial-team-grid');
    const adviserContainer = document.getElementById('editorial-adviser-card');
    const adviserRow = adviserContainer ? adviserContainer.closest('.team-adviser-row') : null;

    if (!teamContainer && !adviserContainer) return;

    if (!allMembers || allMembers.length === 0) {
      if (teamContainer) teamContainer.innerHTML = '<div style="text-align:center; color:var(--text-muted); padding:2rem;">No editorial board members listed.</div>';
      if (adviserContainer) adviserContainer.innerHTML = '';
      return;
    }

    // Retrieve configured levels
    const levelsList = (typeof window.getMergedEditorialLevels === 'function')
      ? window.getMergedEditorialLevels()
      : [
          { id: 1, name: "Level 1" },
          { id: 2, name: "Level 2" },
          { id: 3, name: "Level 3" },
          { id: 4, name: "Level 4" },
          { id: 5, name: "Level 5" }
        ];

    // Group members by tier (Level 1, 2, 3...)
    const grouped = {};
    allMembers.forEach(m => {
      let t = m.tier;
      if (t === undefined || t === null) {
        t = (m._isAdviser || (m.role && m.role.toLowerCase().includes('adviser'))) ? 1 : 2;
      }
      t = parseInt(t, 10) || 1;
      if (!grouped[t]) grouped[t] = [];
      grouped[t].push(m);
    });

    const levelOrderMap = {};
    levelsList.forEach((lvl, idx) => {
      const lid = typeof lvl === 'object' ? lvl.id : (idx + 1);
      levelOrderMap[lid] = idx;
    });

    const tierKeys = Object.keys(grouped).sort((a, b) => {
      const orderA = levelOrderMap[a] !== undefined ? levelOrderMap[a] : parseInt(a, 10);
      const orderB = levelOrderMap[b] !== undefined ? levelOrderMap[b] : parseInt(b, 10);
      return orderA - orderB;
    });

    // Hide old adviser-only wrapper so tiered layout flows naturally
    if (adviserRow) {
      adviserRow.style.display = 'none';
    }
    if (adviserContainer) {
      adviserContainer.innerHTML = '';
    }

    let tieredHTML = '';
    tierKeys.forEach((tierKey) => {
      const group = grouped[tierKey];
      if (!group || group.length === 0) return;

      if (group.length === 1 || group[0].layoutStyle === 'center-single') {
        const member = group[0];
        const globalIdx = allMembers.indexOf(member);
        tieredHTML += `
          <div class="team-tier-row team-tier-single">
            ${teamCardHTML(member, globalIdx !== -1 ? globalIdx : 0)}
          </div>`;
      } else {
        tieredHTML += `
          <div class="team-tier-row team-tier-grid">
            ${group.map(member => {
              const globalIdx = allMembers.indexOf(member);
              return teamCardHTML(member, globalIdx !== -1 ? globalIdx : 0);
            }).join('')}
          </div>`;
      }
    });

    if (teamContainer) {
      teamContainer.innerHTML = tieredHTML;
    }
  }

  // Team member detail modal opener
  window.openTeamModal = function (index) {
    const modal = document.getElementById('team-member-modal');
    const members = window._teamAllMembers;
    if (!modal || !members || !members[index]) return;

    const m = members[index];
    const hasImage = m.image;

    document.getElementById('tm-photo').innerHTML = hasImage
      ? `<img src="${m.image}" alt="${m.name}"
              onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
              class="tm-photo-img" />
         <div class="tm-photo-initials" style="display:none;">${m.initials}</div>`
      : `<div class="tm-photo-initials">${m.initials}</div>`;

    document.getElementById('tm-name').textContent     = m.name;
    document.getElementById('tm-role').textContent     = m.role;
    document.getElementById('tm-year').textContent     = m.yearLevel || '';
    document.getElementById('tm-bio').textContent      = m.bio || '';

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  window.closeTeamModal = function () {
    const modal = document.getElementById('team-member-modal');
    if (modal) { modal.classList.remove('active'); document.body.style.overflow = 'auto'; }
  };

  // Close modals on Escape key press
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' || e.keyCode === 27) {
      window.closeTeamModal();
      if (typeof window.closeFacultyModal === 'function') window.closeFacultyModal();
    }
  });

  /* --------------------------------------------------------------------------
     3. ANNOUNCEMENTS — PAGINATED (3 per page)
     -------------------------------------------------------------------------- */
  let announcementCurrentPage = 1;
  const ANNOUNCEMENTS_PER_PAGE = 3;

  window.getMergedAnnouncements = function () {
    try {
      var stored = localStorage.getItem('iconnect_announcements');
      if (stored) {
        var parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return (typeof announcementsData !== 'undefined') ? announcementsData : [];
  };

  window.getMergedAnnouncementsHeader = function () {
    var base = window.announcementsHeaderData || {
      badge: "Bulletin Board",
      title: "Publication Announcements",
      description: "Official campus updates, bulletin items, and departmental news notices."
    };
    try {
      var stored = JSON.parse(localStorage.getItem('iconnect_announcements_header'));
      if (stored && typeof stored === 'object') {
        return {
          badge: stored.badge || base.badge,
          title: stored.title || base.title,
          description: stored.description || base.description
        };
      }
    } catch (e) {}
    return base;
  };

  function renderAnnouncements(page) {
    // Update Announcements Section Header (Badge, Title, Description)
    const headerData = window.getMergedAnnouncementsHeader();
    const section = document.getElementById('announcements');
    if (section) {
      const tagEl   = section.querySelector('.section-tag');
      const titleEl = section.querySelector('.section-title');
      const descEl  = section.querySelector('.section-desc');
      if (tagEl)   tagEl.textContent   = headerData.badge;
      if (titleEl) titleEl.textContent = headerData.title;
      if (descEl)  descEl.textContent  = headerData.description;
    }

    const grid       = document.getElementById('announcements-grid');
    const pagination = document.getElementById('announcements-pagination');
    const annItems   = window.getMergedAnnouncements();
    if (!grid || annItems.length === 0) return;

    page = page || 1;
    announcementCurrentPage = page;

    const total      = annItems.length;
    const totalPages = Math.ceil(total / ANNOUNCEMENTS_PER_PAGE);
    const start      = (page - 1) * ANNOUNCEMENTS_PER_PAGE;
    const end        = Math.min(start + ANNOUNCEMENTS_PER_PAGE, total);
    const pageItems  = annItems.slice(start, end);

    // Render cards with click listener and rich HTML body
    grid.innerHTML = pageItems.map(item => {
      const tint = item.tintColor || '#00f0ff';
      const cardStyle = `border-top: 3px solid ${tint}; box-shadow: 0 10px 30px ${tint}20; cursor: pointer; position: relative; transition: transform 0.25s ease, box-shadow 0.25s ease;`;
      const dateStyle = `color: ${tint};`;

      return `
      <div class="announcement-card" style="${cardStyle}" onclick="window.openAnnouncementModal('${item.id}')" title="Click to view full bulletin modal">
        ${item.image ? `
        <div class="announcement-img-wrapper" style="border-radius:12px; overflow:hidden; aspect-ratio:16/9; margin-bottom:1rem; border:1px solid rgba(255,255,255,0.1); background:#000;">
          <img src="${item.image}"
               onerror="this.onerror=null; this.parentElement.style.display='none';"
               alt="${item.title}"
               class="announcement-img" style="width:100%; height:100%; object-fit:cover;" />
        </div>` : ''}
        <div class="announcement-date" style="${dateStyle}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          ${item.date} ${item.category ? `<span style="background:${tint}20; color:${tint}; padding:2px 8px; border-radius:6px; font-size:0.75rem; margin-left: auto; border:1px solid ${tint}40;">${item.category}</span>` : ''}
        </div>
        <h4 class="announcement-title">${item.title}</h4>
        <div class="announcement-body" style="line-height:1.6; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden;">${item.body}</div>
        <div style="display:flex; align-items:center; justify-content:space-between; margin-top:1rem; padding-top:0.75rem; border-top:1px solid rgba(255,255,255,0.08);">
          <span style="font-size:0.78rem; color:${tint}; font-weight:700; font-family:var(--font-mono);">Read Bulletin ›</span>
          <button class="toolbar-btn" onclick="event.stopPropagation(); window.openAnnouncementShareModal('${item.id}');" style="font-size:0.75rem; padding:0.3rem 0.75rem; color:var(--cheddar-yellow); border-color:rgba(244,180,26,0.35); background:rgba(244,180,26,0.08); border-radius:8px; font-weight:700; cursor:pointer;" title="Share Announcement to Social Media Apps">📤 Share Link</button>
        </div>
      </div>
    `}).join('');

    // Render pagination (hide if only 1 page)
    if (!pagination) return;
    if (totalPages <= 1) { pagination.innerHTML = ''; return; }

    let pagesHtml = '';
    for (let i = 1; i <= totalPages; i++) {
      pagesHtml += `<button class="ann-page-btn ${i === page ? 'active' : ''}"
                            onclick="goToAnnouncementPage(${i})">${i}</button>`;
    }

    pagination.innerHTML = `
      <button class="ann-nav-btn" onclick="goToAnnouncementPage(1)" ${page === 1 ? 'disabled' : ''} title="First">&#171;</button>
      <button class="ann-nav-btn" onclick="goToAnnouncementPage(${page - 1})" ${page === 1 ? 'disabled' : ''} title="Previous">&#8249;</button>
      <div class="ann-pages">${pagesHtml}</div>
      <button class="ann-nav-btn" onclick="goToAnnouncementPage(${page + 1})" ${page === totalPages ? 'disabled' : ''} title="Next">&#8250;</button>
      <button class="ann-nav-btn" onclick="goToAnnouncementPage(${totalPages})" ${page === totalPages ? 'disabled' : ''} title="Last">&#187;</button>
    `;
  }

  window.goToAnnouncementPage = function (page) {
    const annItems   = window.getMergedAnnouncements();
    const total      = annItems.length;
    const totalPages = Math.ceil(total / ANNOUNCEMENTS_PER_PAGE);
    if (page < 1 || page > totalPages) return;
    renderAnnouncements(page);
    document.getElementById('announcements').scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  /* --- ANNOUNCEMENT SHARE STUB GENERATOR --- */
  window.downloadAnnouncementShareStub = function (id) {
    var items = window.getMergedAnnouncements();
    var item = items.find(function (a) { return String(a.id) === String(id); });
    if (!item) { alert('Announcement not found.'); return; }

    var title = (item.title || 'Publication Announcement').replace(/"/g, '&quot;');
    var bodyText = (item.body || '').replace(/<[^>]*>/g, '').slice(0, 160) + '...';
    var image = item.shareThumbnail || item.image || './assets/logo/iconnect-share-thumbnail.jpg';
    var absImage = image.indexOf('://') !== -1 ? image : (window.location.origin + window.location.pathname.replace(/[^\/]*$/, '') + image.replace(/^\.\//, ''));
    var pageUrl = window.location.origin + window.location.pathname.replace(/[^\/]*$/, '') + 'announcement.html?id=' + encodeURIComponent(item.id);

    var htmlContent = '<!DOCTYPE html>\n<html lang="en">\n<head>\n' +
      '  <meta charset="UTF-8" />\n' +
      '  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n' +
      '  <title>' + title + ' | iConnect Announcement</title>\n' +
      '  <meta name="description" content="' + bodyText + '" />\n\n' +
      '  <meta property="og:type" content="article" />\n' +
      '  <meta property="og:site_name" content="iConnect Publication" />\n' +
      '  <meta property="og:title" content="' + title + '" />\n' +
      '  <meta property="og:description" content="' + bodyText + '" />\n' +
      '  <meta property="og:image" content="' + absImage + '" />\n' +
      '  <meta property="og:url" content="' + pageUrl + '" />\n\n' +
      '  <meta name="twitter:card" content="summary_large_image" />\n' +
      '  <meta name="twitter:title" content="' + title + '" />\n' +
      '  <meta name="twitter:description" content="' + bodyText + '" />\n' +
      '  <meta name="twitter:image" content="' + absImage + '" />\n\n' +
      '  <script>window.location.href = "' + pageUrl + '";</script>\n' +
      '</head>\n<body>\n' +
      '  <p>Redirecting to announcement <a href="' + pageUrl + '">' + title + '</a>...</p>\n' +
      '</body>\n</html>';

    var blob = new Blob([htmlContent], { type: 'text/html' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'announcement-' + (item.id || 'share') + '.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /* Open Full Announcement Content Reader Popup Modal */
  window.openAnnouncementModal = function (id) {
    var items = window.getMergedAnnouncements();
    var item = items.find(function (a) { return String(a.id) === String(id); });
    if (!item) return;

    var tint = item.tintColor || '#00f0ff';
    var modal = document.getElementById('announcement-reader-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'announcement-reader-modal';
      document.body.appendChild(modal);
    }

    modal.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(3,7,18,0.85); backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); z-index:100000; display:flex; align-items:center; justify-content:center; padding:1.5rem; overflow-y:auto;';

    var imgHtml = item.image ? '<div style="width:100%; border-radius:16px; overflow:hidden; margin:1.5rem 0; border:1px solid rgba(255,255,255,0.1); background:#000; box-shadow: 0 12px 40px rgba(0,0,0,0.5);"><img src="' + item.image + '" alt="' + item.title + '" style="width:100%; max-height:640px; object-fit:contain; display:block; margin:0 auto;" /></div>' : '';

    modal.innerHTML = '<div style="background:rgba(10,18,40,0.96); border:1px solid ' + tint + '60; border-radius:24px; padding:2.5rem; width:90vw; max-width:1200px; height:90vh; max-height:90vh; overflow-y:auto; box-shadow:0 24px 90px rgba(0,0,0,0.95); border-top: 5px solid ' + tint + ';">' +
        '<div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:1.25rem; gap:1rem; flex-wrap:wrap;">' +
          '<div style="display:flex; align-items:center; gap:0.6rem;">' +
            '<span style="background:' + tint + '20; color:' + tint + '; padding:0.3rem 0.85rem; border-radius:999px; font-family:var(--font-mono); font-size:0.82rem; font-weight:700; border:1px solid ' + tint + '40;">' + (item.category || 'Announcement') + '</span>' +
            '<span style="font-family:var(--font-mono); font-size:0.85rem; color:var(--text-subtle);">' + (item.date || '') + '</span>' +
          '</div>' +
          '<button type="button" onclick="closeAnnouncementModal()" style="background:none; border:none; color:#fff; font-size:1.75rem; cursor:pointer; line-height:1; padding:0.2rem 0.6rem;" title="Close Bulletin">✕</button>' +
        '</div>' +
        '<h2 style="font-family:var(--font-heading); font-size:2rem; font-weight:800; color:#fff; line-height:1.3; margin-bottom:1.25rem;">' + item.title + '</h2>' +
        imgHtml +
        '<div style="font-size:1.15rem; line-height:1.9; color:#cbd5e1; margin-bottom:2.5rem;" class="ann-modal-body">' + item.body + '</div>' +
        '<div style="display:flex; align-items:center; justify-content:space-between; padding-top:1.5rem; border-top:1px solid rgba(255,255,255,0.1); flex-wrap:wrap; gap:0.75rem;">' +
          '<button type="button" class="btn-publish-live" onclick="window.openAnnouncementShareModal(\'' + item.id + '\')" style="padding:0.65rem 1.35rem; font-size:0.92rem; background:linear-gradient(135deg, #f4b41a, #d49b10); color:#050b1a; border:none; border-radius:12px; font-weight:800; cursor:pointer; box-shadow:0 4px 16px rgba(244,180,26,0.35);">' +
            '📤 Share Announcement Link' +
          '</button>' +
          '<button type="button" class="toolbar-btn" onclick="closeAnnouncementModal()" style="padding:0.65rem 1.35rem; font-size:0.9rem;">' +
            'Close Bulletin' +
          '</button>' +
        '</div>' +
      '</div>';

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  };

  window.closeAnnouncementModal = function () {
    var modal = document.getElementById('announcement-reader-modal');
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }
  };

  /* --- FULL SOCIAL MEDIA SHARE MODAL FOR ANNOUNCEMENTS --- */
  window.openAnnouncementShareModal = function (id) {
    var items = window.getMergedAnnouncements();
    var item = items.find(function (a) { return String(a.id) === String(id); });
    if (!item) return;

    var shareUrl = window.location.origin + '/announcement.html?id=' + encodeURIComponent(item.id);
    var title = item.title || 'Publication Announcement';
    var safeTitle = title.replace(/'/g, "\\'");
    var thumbImg = item.shareThumbnail || item.image || '/assets/logo/iconnect-share-thumbnail.jpg';

    // Native Web Share on Mobile
    if (navigator.share && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      navigator.share({ title: title, text: title, url: shareUrl }).catch(function () {});
      return;
    }

    var modal = document.getElementById('announcement-share-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'announcement-share-modal';
      document.body.appendChild(modal);
    }

    modal.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(3,7,18,0.88); backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); z-index:100001; display:flex; align-items:center; justify-content:center; padding:1.5rem; overflow-y:auto;';

    modal.innerHTML = '<div style="background:rgba(10,18,40,0.98); border:1.5px solid rgba(244,180,26,0.35); border-radius:24px; padding:2.25rem; width:90vw; max-width:760px; max-height:90vh; overflow-y:auto; box-shadow:0 24px 90px rgba(0,0,0,0.95); animation:modalSlideUp 0.25s ease forwards;">' +
      '<div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:1.5rem;">' +
        '<h3 style="font-family:var(--font-heading); font-size:1.35rem; font-weight:800; color:var(--cheddar-yellow); margin:0; display:flex; align-items:center; gap:0.5rem;">' +
          '📤 Share Announcement to Social Media' +
        '</h3>' +
        '<button type="button" onclick="closeAnnouncementShareModal()" style="background:none; border:none; color:#fff; font-size:1.6rem; cursor:pointer; line-height:1; padding:0.2rem 0.5rem;">✕</button>' +
      '</div>' +

      '<!-- Preview Card -->' +
      '<div style="background:rgba(5,11,26,0.85); border:1px solid rgba(244,180,26,0.25); border-radius:16px; padding:1.25rem; margin-bottom:1.75rem;">' +
        '<div style="aspect-ratio:16/9; max-height:240px; width:100%; border-radius:12px; overflow:hidden; margin-bottom:0.85rem; border:1px solid rgba(255,255,255,0.1); background:#000;">' +
          '<img src="' + thumbImg + '" alt="Share Preview Thumbnail" style="width:100%; height:100%; object-fit:cover;" />' +
        '</div>' +
        '<div style="font-size:0.8rem; color:var(--cyber-cyan); font-family:var(--font-mono); font-weight:700; margin-bottom:0.35rem;">' + (item.category || 'ANNOUNCEMENT') + ' • ' + (item.date || '') + '</div>' +
        '<div style="font-family:var(--font-heading); font-size:1.15rem; font-weight:700; color:#fff; line-height:1.35;">' + title + '</div>' +
      '</div>' +

      '<!-- Social Apps Share Grid -->' +
      '<div style="font-size:0.82rem; font-family:var(--font-heading); font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.05em; margin-bottom:0.75rem;">Choose Platform</div>' +
      '<div class="share-panel-buttons" style="display:grid; grid-template-columns:1fr 1fr; gap:0.6rem; margin-bottom:1.5rem;">' +
        '<button class="share-opt-btn share-fb" onclick="shareToSocial(\'facebook\',\'' + shareUrl + '\',\'' + safeTitle + '\')"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>Facebook</button>' +
        '<button class="share-opt-btn share-msg" onclick="shareToSocial(\'messenger\',\'' + shareUrl + '\',\'' + safeTitle + '\')"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.145 2 11.259c0 2.913 1.45 5.518 3.715 7.202V22l3.355-1.843c.928.257 1.91.396 2.93.396 5.523 0 10-4.145 10-9.259C22 6.145 17.523 2 12 2zm1.042 12.433l-2.584-2.756-5.045 2.756 5.549-5.892 2.646 2.756 4.983-2.756-5.549 5.892z"/></svg>Messenger</button>' +
        '<button class="share-opt-btn share-wa" onclick="shareToSocial(\'whatsapp\',\'' + shareUrl + '\',\'' + safeTitle + '\')"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884"/></svg>WhatsApp</button>' +
        '<button class="share-opt-btn share-viber" onclick="shareToSocial(\'viber\',\'' + shareUrl + '\',\'' + safeTitle + '\')"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.78 14.54c-.6-.35-2.02-1.04-2.33-1.16-.31-.12-.54-.18-.77.17-.23.35-.89 1.15-1.09 1.38-.2.23-.4.26-.74.09-.34-.17-1.44-.53-2.74-1.69-1.01-.9-1.7-2.01-1.9-2.35-.2-.34-.02-.53.15-.7.15-.15.34-.4.51-.6.17-.2.23-.34.34-.57.11-.23.06-.43-.03-.6-.09-.17-.77-1.85-1.05-2.53-.28-.66-.56-.57-.77-.58l-.66-.01c-.23 0-.6.09-.91.43s-1.2 1.17-1.2 2.85c0 1.68 1.22 3.3 1.39 3.53.17.23 2.41 3.68 5.84 5.16.82.35 1.45.56 1.95.72.82.26 1.57.22 2.16.14.66-.1 2.02-.83 2.31-1.63.29-.8.29-1.48.2-1.63-.09-.15-.31-.23-.66-.4"/></svg>Viber</button>' +
        '<button class="share-opt-btn share-tw" onclick="shareToSocial(\'twitter\',\'' + shareUrl + '\',\'' + safeTitle + '\')"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>X (Twitter)</button>' +
        '<button class="share-opt-btn share-threads" onclick="shareToSocial(\'threads\',\'' + shareUrl + '\',\'' + safeTitle + '\')"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.186 24C5.457 24 0 18.543 0 11.814 0 5.086 5.457 0 12.186 0c3.272 0 6.242 1.25 8.448 3.456l-2.83 2.83c-1.503-1.503-3.532-2.355-5.618-2.355-4.516 0-8.255 3.739-8.255 8.255 0 4.516 3.739 8.255 8.255 8.255 3.013 0 5.645-1.626 7.078-4.047-1.189-.523-2.607-.813-4.078-.813-3.86 0-7 3.14-7 7s3.14 7 7 7c2.518 0 4.793-1.077 6.37-2.793l2.766 2.766C20.407 22.84 16.536 24 12.186 24z"/></svg>Threads</button>' +
        '<button class="share-opt-btn share-tg" onclick="shareToSocial(\'telegram\',\'' + shareUrl + '\',\'' + safeTitle + '\')"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.03-1.96 1.25-5.54 3.67-.52.36-1 .54-1.42.53-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.37-.49 1.02-.75 4.01-1.74 6.69-2.89 8.04-3.46 3.82-1.6 4.62-1.88 5.14-1.89.11 0 .37.03.54.17.14.12.18.28.2.45-.02.07-.02.13-.03.22z"/></svg>Telegram</button>' +
        '<button class="share-opt-btn share-email" onclick="shareToSocial(\'email\',\'' + shareUrl + '\',\'' + safeTitle + '\')"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>Gmail / Email</button>' +
      '</div>' +

      '<!-- Direct Link Input -->' +
      '<div style="display:flex; gap:0.5rem; flex-wrap:wrap;">' +
        '<input type="text" readonly value="' + shareUrl + '" id="ann-share-link-input" style="flex:1; min-width:200px; padding:0.65rem 0.85rem; background:rgba(5,11,26,0.9); border:1px solid rgba(244,180,26,0.3); border-radius:10px; color:#fff; font-family:var(--font-mono); font-size:0.85rem;" />' +
        '<button class="btn-publish-live" id="ann-copy-btn" onclick="shareToSocial(\'copy\',\'' + shareUrl + '\',\'' + safeTitle + '\'); var b=document.getElementById(\'ann-copy-btn\'); if(b){b.textContent=\'✓ Link Copied!\'; setTimeout(function(){b.textContent=\'📋 Copy Link\';},2000);}" style="padding:0.65rem 1.25rem; font-size:0.85rem; background:var(--cheddar-yellow); color:#050b1a; font-weight:800; border:none; border-radius:10px; cursor:pointer;">📋 Copy Link</button>' +
      '</div>' +
    '</div>';

    modal.style.display = 'flex';
  };

  window.closeAnnouncementShareModal = function () {
    var modal = document.getElementById('announcement-share-modal');
    if (modal) {
      modal.style.display = 'none';
    }
  };

  let creativesCurrentPage = 1;
  const CREATIVES_PER_PAGE = 6;

  window.getMergedCreativesGallery = function () {
    try {
      var stored = localStorage.getItem('iconnect_creatives_gallery');
      if (stored) {
        var parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return (typeof creativesGalleryData !== 'undefined') ? creativesGalleryData : [];
  };

  window.getMergedCreativesHeader = function () {
    var base = window.creativesHeaderData || {
      badge: "Visual & Media Showcase",
      title: "Creatives & Multimedia Gallery",
      description: "Generative art, photography, graphic design, and digital publication covers."
    };
    try {
      var stored = JSON.parse(localStorage.getItem('iconnect_creatives_header'));
      if (stored && typeof stored === 'object') {
        return {
          badge: stored.badge || base.badge,
          title: stored.title || base.title,
          description: stored.description || base.description
        };
      }
    } catch (e) {}
    return base;
  };

  function renderCreativesGallery(page) {
    // Update Creatives Section Header (Badge, Title, Description)
    const headerData = window.getMergedCreativesHeader();
    const section = document.getElementById('creatives');
    if (section) {
      const tagEl   = section.querySelector('.section-tag');
      const titleEl = section.querySelector('.section-title');
      const descEl  = section.querySelector('.section-desc');
      if (tagEl)   tagEl.textContent   = headerData.badge;
      if (titleEl) titleEl.textContent = headerData.title;
      if (descEl)  descEl.textContent  = headerData.description;
    }

    const grid       = document.getElementById('creatives-grid');
    const pagination = document.getElementById('creatives-pagination');
    const galleryItems = window.getMergedCreativesGallery();
    if (!grid || galleryItems.length === 0) return;

    page = page || 1;
    creativesCurrentPage = page;

    const total      = galleryItems.length;
    const totalPages = Math.ceil(total / CREATIVES_PER_PAGE);
    const start      = (page - 1) * CREATIVES_PER_PAGE;
    const end        = Math.min(start + CREATIVES_PER_PAGE, total);
    const pageItems  = galleryItems.slice(start, end);

    // Render gallery items
    grid.innerHTML = pageItems.map(item => `
      <div class="creative-item" onclick="openLightbox('${item.image}', '${item.title}', '${item.category}')">
        <img src="${item.image}" alt="${item.title}" class="creative-img" loading="lazy" />
        <div class="creative-overlay">
          <span class="creative-category">${item.category}</span>
          <h4 class="creative-title">${item.title}</h4>
        </div>
      </div>
    `).join('');

    // Render pagination (hide if only 1 page)
    if (!pagination) return;
    if (totalPages <= 1) { pagination.innerHTML = ''; return; }

    let pagesHtml = '';
    for (let i = 1; i <= totalPages; i++) {
      pagesHtml += `<button class="ann-page-btn ${i === page ? 'active' : ''}"
                            onclick="goToCreativesPage(${i})">${i}</button>`;
    }

    pagination.innerHTML = `
      <button class="ann-nav-btn" onclick="goToCreativesPage(1)" ${page === 1 ? 'disabled' : ''} title="First">&#171;</button>
      <button class="ann-nav-btn" onclick="goToCreativesPage(${page - 1})" ${page === 1 ? 'disabled' : ''} title="Previous">&#8249;</button>
      <div class="ann-pages">${pagesHtml}</div>
      <button class="ann-nav-btn" onclick="goToCreativesPage(${page + 1})" ${page === totalPages ? 'disabled' : ''} title="Next">&#8250;</button>
      <button class="ann-nav-btn" onclick="goToCreativesPage(${totalPages})" ${page === totalPages ? 'disabled' : ''} title="Last">&#187;</button>
    `;
  }

  window.goToCreativesPage = function (page) {
    const total      = (typeof creativesGalleryData !== 'undefined') ? creativesGalleryData.length : 0;
    const totalPages = Math.ceil(total / CREATIVES_PER_PAGE);
    if (page < 1 || page > totalPages) return;
    renderCreativesGallery(page);
    document.getElementById('creatives').scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  /* --------------------------------------------------------------------------
     4. LIGHTBOX MODAL FOR GALLERY
     -------------------------------------------------------------------------- */
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');

  window.openLightbox = function (imgSrc, title, category) {
    if (lightboxModal && lightboxImg && lightboxCaption) {
      lightboxImg.src = imgSrc;
      lightboxCaption.innerHTML = `<strong>${title}</strong> &bull; <span style="color:var(--cheddar-yellow);">${category}</span>`;
      lightboxModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  };

  window.closeLightbox = function () {
    if (lightboxModal) {
      lightboxModal.classList.remove('active');
      document.body.style.overflow = 'auto';
    }
  };

  window.getMergedFacultyHeader = function () {
    var base = window.facultyHeaderData || {
      badge: "Academic Leadership & Faculty",
      title: "Faculty & Department Directory",
      description: "Meet the distinguished faculty members, department chairs, and educators of the BSCS Department.",
      institution: "Capiz State University – Mambusao",
      footerTag: "iConnect Publication Faculty Directory"
    };
    try {
      var stored = JSON.parse(localStorage.getItem('iconnect_faculty_header'));
      if (stored && typeof stored === 'object') {
        return {
          badge: stored.badge || base.badge,
          title: stored.title || base.title,
          description: stored.description || base.description,
          institution: stored.institution || base.institution,
          footerTag: stored.footerTag || base.footerTag
        };
      }
    } catch (e) {}
    return base;
  };

  window.getMergedFacultyLevels = function () {
    try {
      var stored = localStorage.getItem('iconnect_faculty_levels');
      if (stored) {
        var parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return window.facultyLevelsData || [];
  };

  window.getMergedFacultyMembers = function () {
    try {
      var stored = localStorage.getItem('iconnect_faculty_members');
      if (stored) {
        var parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return window.facultyMembersData || [];
  };

  function renderFacultyOrgChart() {
    // Update Faculty Section Header
    const headerData = window.getMergedFacultyHeader();
    const section = document.getElementById('faculty');
    if (section) {
      const tagEl   = section.querySelector('.section-tag');
      const titleEl = section.querySelector('.section-title');
      const descEl  = section.querySelector('.section-desc');
      if (tagEl)   tagEl.textContent   = headerData.badge;
      if (titleEl) titleEl.textContent = headerData.title;
      if (descEl)  descEl.textContent  = headerData.description;
    }

    const container = document.getElementById('faculty-orgchart-container');
    if (!container) return;

    const members = window.getMergedFacultyMembers();
    if (!members || members.length === 0) {
      container.innerHTML = '<div style="text-align:center; color:var(--text-muted); padding:3rem;">No faculty members listed.</div>';
      return;
    }

    const levelsList = window.getMergedFacultyLevels();

    // Group members by tier (1..5)
    const grouped = {};
    members.forEach(m => {
      const t = m.tier || 3;
      if (!grouped[t]) grouped[t] = [];
      grouped[t].push(m);
    });

    const levelOrderMap = {};
    levelsList.forEach((lvl, idx) => { levelOrderMap[lvl.id] = idx; });

    const tierKeys = Object.keys(grouped).sort((a, b) => {
      const orderA = levelOrderMap[a] !== undefined ? levelOrderMap[a] : parseInt(a, 10);
      const orderB = levelOrderMap[b] !== undefined ? levelOrderMap[b] : parseInt(b, 10);
      return orderA - orderB;
    });

    // Read line toggle settings from localStorage
    let linesDesktop = false;
    let linesMobile  = false;
    try {
      linesDesktop = localStorage.getItem('iconnect_faculty_lines_desktop') === 'true';
      linesMobile  = localStorage.getItem('iconnect_faculty_lines_mobile')  === 'true';
    } catch (e) {}

    let connectorClass = 'fac-org-connector';
    if (linesDesktop && linesMobile) connectorClass += ' fac-lines-on';
    else if (linesDesktop)           connectorClass += ' fac-lines-on fac-lines-desktop-only';
    else if (linesMobile)            connectorClass += ' fac-lines-mobile-on';

    let html = `<div class="${connectorClass}">`;

    tierKeys.forEach((tierKey, tierIdx) => {
      const group = grouped[tierKey];
      const tierNum = parseInt(tierKey, 10);
      const first = group[0];
      const foundLvl = levelsList.find(l => l.id === tierNum);
      const rawLabel = foundLvl ? foundLvl.name : (first.tierLabel || `Level ${tierNum}`);

      const leftMembers = [];
      const singleMembers = [];
      const gridMembers = [];
      const rightMembers = [];

      group.forEach(m => {
        if (m.layoutStyle === 'left') leftMembers.push(m);
        else if (m.layoutStyle === 'right' || m.layoutStyle === 'side-branch') rightMembers.push(m);
        else if (m.layoutStyle === 'center-single' || m.layoutStyle === 'solo' || group.length === 1) singleMembers.push(m);
        else gridMembers.push(m);
      });

      html += `
        <div class="faculty-tier-block" style="margin-bottom: 1.5rem; width: 100%; max-width: 1400px; display: flex; flex-direction: column; align-items: center;">`;

      // 1. Left Branch Cards (Clean Left / Center Alignment)
      if (leftMembers.length > 0) {
        leftMembers.forEach(member => {
          const tint = member.tintColor || '#00f0ff';
          html += `
            <div class="faculty-side-branch-row" style="display:flex; justify-content:center; width:100%; max-width:850px; margin:0.5rem auto;">
              <div style="margin-right:auto; width:100%; max-width:360px;">
                <div class="faculty-card side-branch-card" onclick="openFacultyModal('${member.id}')" title="Click to view ${member.name}'s profile" style="border-top:3px solid ${tint}; box-shadow:0 10px 30px ${tint}22; width:100%; background:rgba(10,18,40,0.92); border-radius:16px; padding:1.1rem; border-right:2px solid ${tint}; border-left:1px solid ${tint}30; border-bottom:1px solid ${tint}30; position:relative; box-sizing:border-box;">
                  <div style="display:flex; gap:1rem; align-items:center;">
                    <div style="width:72px; height:72px; flex-shrink:0; border-radius:14px; overflow:hidden; border:2.5px solid ${tint}; background:#050b1a; box-shadow:0 6px 20px ${tint}30;">
                      <img src="${member.image || 'assets/images/team/art-jayson-osuyos.jpg'}" alt="${member.name}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='assets/images/team/art-jayson-osuyos.jpg';" />
                    </div>
                    <div style="flex:1; min-width:0;">
                      <span style="font-size:0.68rem; font-family:var(--font-mono); background:${tint}22; color:${tint}; padding:0.15rem 0.55rem; border-radius:6px; font-weight:700; display:inline-block; margin-bottom:0.25rem;">${member.department || 'BSCS'}</span>
                      <h3 style="font-family:var(--font-heading); font-size:1.02rem; font-weight:700; color:#fff; margin:0; line-height:1.25;">${member.name}</h3>
                      <div style="font-size:0.8rem; color:${tint}; font-weight:600; margin-top:0.2rem;">${member.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>`;
        });
      }

      // 2. Right Branch Cards (Clean Right / Center Alignment)
      if (rightMembers.length > 0) {
        rightMembers.forEach(member => {
          const tint = member.tintColor || '#00f0ff';
          html += `
            <div class="faculty-side-branch-row" style="display:flex; justify-content:center; width:100%; max-width:850px; margin:0.5rem auto;">
              <div style="margin-left:auto; width:100%; max-width:360px;">
                <div class="faculty-card side-branch-card" onclick="openFacultyModal('${member.id}')" title="Click to view ${member.name}'s profile" style="border-top:3px solid ${tint}; box-shadow:0 10px 30px ${tint}22; width:100%; background:rgba(10,18,40,0.92); border-radius:16px; padding:1.1rem; border-left:2px solid ${tint}; border-right:1px solid ${tint}30; border-bottom:1px solid ${tint}30; position:relative; box-sizing:border-box;">
                  <div style="display:flex; gap:1rem; align-items:center;">
                    <div style="width:72px; height:72px; flex-shrink:0; border-radius:14px; overflow:hidden; border:2.5px solid ${tint}; background:#050b1a; box-shadow:0 6px 20px ${tint}30;">
                      <img src="${member.image || 'assets/images/team/art-jayson-osuyos.jpg'}" alt="${member.name}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='assets/images/team/art-jayson-osuyos.jpg';" />
                    </div>
                    <div style="flex:1; min-width:0;">
                      <span style="font-size:0.68rem; font-family:var(--font-mono); background:${tint}22; color:${tint}; padding:0.15rem 0.55rem; border-radius:6px; font-weight:700; display:inline-block; margin-bottom:0.25rem;">${member.department || 'BSCS'}</span>
                      <h3 style="font-family:var(--font-heading); font-size:1.02rem; font-weight:700; color:#fff; margin:0; line-height:1.25;">${member.name}</h3>
                      <div style="font-size:0.8rem; color:${tint}; font-weight:600; margin-top:0.2rem;">${member.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>`;
        });
      }

      // 3. Render 1 Card Solo Centered Row (Clean Center Alignment like Editorial Adviser)
      if (singleMembers.length > 0) {
        singleMembers.forEach(member => {
          const tint = member.tintColor || '#00f0ff';
          html += `
            <div style="display:flex; justify-content:center; width:100%; margin: 0.5rem auto;">
              <div class="faculty-card single-center-card" onclick="openFacultyModal('${member.id}')" title="Click to view ${member.name}'s profile" style="border-top: 3px solid ${tint}; box-shadow: 0 10px 30px ${tint}22; width:100%; max-width:360px; background:rgba(10,18,40,0.92); border-radius:16px; padding:1.1rem; border-left:1px solid ${tint}30; border-right:1px solid ${tint}30; border-bottom:1px solid ${tint}30; position:relative; box-sizing:border-box;">
                <div style="display:flex; gap:1rem; align-items:center;">
                  <div style="width:72px; height:72px; flex-shrink:0; border-radius:14px; overflow:hidden; border:2.5px solid ${tint}; background:#050b1a; box-shadow:0 6px 20px ${tint}30;">
                    <img src="${member.image || 'assets/images/team/art-jayson-osuyos.jpg'}" alt="${member.name}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='assets/images/team/art-jayson-osuyos.jpg';" />
                  </div>
                  <div style="flex:1; min-width:0;">
                    <span style="font-size:0.68rem; font-family:var(--font-mono); background:${tint}22; color:${tint}; padding:0.15rem 0.55rem; border-radius:6px; font-weight:700; display:inline-block; margin-bottom:0.25rem;">${member.department || 'BSCS'}</span>
                    <h3 style="font-family:var(--font-heading); font-size:1.02rem; font-weight:700; color:#fff; margin:0; line-height:1.25;">${member.name}</h3>
                    <div style="font-size:0.8rem; color:${tint}; font-weight:600; margin-top:0.2rem;">${member.role}</div>
                  </div>
                </div>
              </div>
            </div>
          `;
        });
      }

      // 4. Render Side-by-Side Grid Cards (Centered Flexbox Grid — perfectly centered for 1, 2, 3, 4+ cards)
      if (gridMembers.length > 0) {
        html += `
          <div class="faculty-grid-branch-wrapper" style="display:flex; justify-content:center; width:100%; margin: 0.5rem 0;">
            <div class="faculty-tier-grid" style="display:flex; flex-wrap:wrap; justify-content:center; align-items:stretch; gap:1.25rem; width:100%; max-width:1400px; margin:0 auto;">
            ${gridMembers.map(member => {
              const tint = member.tintColor || '#00f0ff';
              return `
                <div style="flex:0 1 310px; max-width:340px; min-width:270px; width:100%; display:flex;">
                  <div class="faculty-card" onclick="openFacultyModal('${member.id}')" title="Click to view ${member.name}'s profile" style="border-top: 3px solid ${tint}; box-shadow: 0 10px 30px ${tint}18; width:100%; background:rgba(10,18,40,0.85); border-radius:16px; padding:1.1rem; border-left:1px solid ${tint}30; border-right:1px solid ${tint}30; border-bottom:1px solid ${tint}30; position:relative; box-sizing:border-box;">
                    <div style="display:flex; gap:1rem; align-items:center;">
                      <div style="width:72px; height:72px; flex-shrink:0; border-radius:14px; overflow:hidden; border:2.5px solid ${tint}; background:#050b1a; box-shadow:0 6px 20px ${tint}30;">
                        <img src="${member.image || 'assets/images/team/art-jayson-osuyos.jpg'}" alt="${member.name}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='assets/images/team/art-jayson-osuyos.jpg';" />
                      </div>
                      <div style="flex:1; min-width:0;">
                        <span style="font-size:0.68rem; font-family:var(--font-mono); background:${tint}22; color:${tint}; padding:0.15rem 0.55rem; border-radius:6px; font-weight:700; display:inline-block; margin-bottom:0.25rem;">${member.department || 'BSCS'}</span>
                        <h3 style="font-family:var(--font-heading); font-size:1.02rem; font-weight:700; color:#fff; margin:0; line-height:1.25;">${member.name}</h3>
                        <div style="font-size:0.8rem; color:${tint}; font-weight:600; margin-top:0.2rem;">${member.role}</div>
                      </div>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
            </div>
          </div>
        `;
      }

      html += `</div>`;

      // Insert trunk line + node between tiers (except after the last)
      if (tierIdx < tierKeys.length - 1) {
        html += `<div class="fac-connector-node"></div>`;
        html += `<div class="fac-trunk-line" style="min-height:36px;"></div>`;
      }
    });

    html += `</div>`; // close fac-org-connector

    container.innerHTML = html;
  }

  /* ==========================================================================
     IN FOCUS VIDEO SHOWCASE SECTION RENDERER
     ========================================================================== */
  window.currentInFocusActiveId = null;

  window.switchInFocusVideo = function (id) {
    window.currentInFocusActiveId = id;
    renderInFocusSection();
    const frame = document.getElementById('infocus-cinema-player');
    if (frame) {
      frame.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  function parseYouTubeId(url) {
    if (!url || typeof url !== 'string') return null;
    var str = url.trim();
    var srcMatch = str.match(/src=["']([^"']+)["']/i);
    if (srcMatch && srcMatch[1]) str = srcMatch[1].trim();
    str = str.replace(/^["']|["']$/g, '');

    var shortMatch = str.match(/youtu\.be\/([\w-]{11})/i);
    if (shortMatch && shortMatch[1]) return shortMatch[1];
    var shortsMatch = str.match(/youtube\.com\/shorts\/([\w-]{11})/i);
    if (shortsMatch && shortsMatch[1]) return shortsMatch[1];
    var embedMatch = str.match(/youtube\.com\/embed\/([\w-]{11})/i);
    if (embedMatch && embedMatch[1]) return embedMatch[1];
    var liveMatch = str.match(/youtube\.com\/live\/([\w-]{11})/i);
    if (liveMatch && liveMatch[1]) return liveMatch[1];
    var watchMatch = str.match(/youtube\.com\/watch\?(?:[^&]+&)*v=([\w-]{11})/i);
    if (watchMatch && watchMatch[1]) return watchMatch[1];
    var vMatch = str.match(/youtube\.com\/v\/([\w-]{11})/i);
    if (vMatch && vMatch[1]) return vMatch[1];
    return null;
  }

  function renderInFocusSection() {
    try {
      const section = document.getElementById('in-focus');
      if (!section) return;

      if (typeof window.isInFocusVisible === 'function' && !window.isInFocusVisible()) {
        section.style.display = 'none';
        return;
      } else {
        section.style.display = '';
      }

      const headerData = (typeof window.getMergedInFocusHeader === 'function')
        ? window.getMergedInFocusHeader()
        : (window.infocusHeaderData || {
            badge: "Video Showcase & Spotlight",
            title: "In Focus",
            description: "Beyond the headlines, see the moments unfold. In Focus captures the stories, events, and experiences that define the BSCS community."
          });

      const badgeEl = document.getElementById('infocus-badge');
      const titleEl = document.getElementById('infocus-title');
      const descEl  = document.getElementById('infocus-desc');
      if (badgeEl) badgeEl.textContent = headerData.badge || 'Video Showcase & Spotlight';
      if (titleEl) titleEl.textContent = headerData.title || 'In Focus';
      if (descEl)  descEl.textContent  = headerData.description || '';

      const container = document.getElementById('infocus-showcase-wrapper');
      if (!container) return;

      const allVideos = (typeof window.getMergedInFocusVideos === 'function')
        ? window.getMergedInFocusVideos()
        : (window.infocusVideosData || []);

      if (!Array.isArray(allVideos) || allVideos.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:3rem; color:var(--text-muted);">No videos currently featured.</div>';
        return;
      }

      // Determine active video
      let activeVideo = null;
      if (window.currentInFocusActiveId) {
        activeVideo = allVideos.find(function (v) { return v.id === window.currentInFocusActiveId; });
      }
      if (!activeVideo) {
        activeVideo = allVideos.find(function (v) { return v.featured; }) || allVideos[0];
      }
      window.currentInFocusActiveId = activeVideo.id;

      // Build Cinema Player HTML
      const ytid = parseYouTubeId(activeVideo.videoUrl) || (typeof window.extractYouTubeId === 'function' ? window.extractYouTubeId(activeVideo.videoUrl) : null);

      let mediaEmbed = '';
      if (ytid) {
        mediaEmbed = '<iframe src="https://www.youtube-nocookie.com/embed/' + ytid + '?rel=0&modestbranding=1" title="' + (activeVideo.title || 'In Focus Video') + '" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>';
      } else {
        mediaEmbed = '<video src="' + activeVideo.videoUrl + '" controls poster="' + (activeVideo.thumbnail || '') + '"></video>';
      }

    let html = '<div class="infocus-showcase-container">' +
      '<div class="infocus-cinema-card" id="infocus-cinema-player">' +
        '<div class="infocus-player-frame">' +
          mediaEmbed +
        '</div>' +
        '<div class="infocus-cinema-details">' +
          '<div class="infocus-meta-bar">' +
            '<span class="infocus-cat-badge">' + (activeVideo.category || 'Spotlight') + '</span>' +
            (activeVideo.featured ? '<span class="infocus-spotlight-tag">⭐ Featured Spotlight</span>' : '') +
            '<span style="font-family:var(--font-mono); font-size:0.8rem; color:var(--text-subtle); margin-left:auto;">' +
              '⏱️ ' + (activeVideo.duration || '00:00') + ' &bull; 📅 ' + (activeVideo.date || '') +
            '</span>' +
          '</div>' +
          '<h3 class="infocus-cinema-title">' + (activeVideo.title || 'In Focus Video') + '</h3>' +
          '<p class="infocus-cinema-desc">' + (activeVideo.description || '') + '</p>' +
        '</div>' +
      '</div>';

    // Multi-video playlist cards if more than 1 video
    if (allVideos.length > 1) {
      html += '<div class="infocus-playlist-header">' +
        '<h4 style="font-family:var(--font-heading); font-size:1.15rem; color:#fff; margin:0; display:flex; align-items:center; gap:0.5rem;">' +
          '🎬 More Stories In Focus <span style="font-family:var(--font-mono); font-size:0.75rem; color:var(--cheddar-yellow); background:rgba(244,180,26,0.15); padding:0.15rem 0.5rem; border-radius:999px;">' + allVideos.length + ' Videos</span>' +
        '</h4>' +
      '</div>' +
      '<div class="infocus-playlist-grid">';

      allVideos.forEach(function (v) {
        const vYtid = (typeof window.extractYouTubeId === 'function') ? window.extractYouTubeId(v.videoUrl) : null;
        const vThumb = v.thumbnail || (vYtid ? ('https://img.youtube.com/vi/' + vYtid + '/hqdefault.jpg') : 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600');
        const isActive = (v.id === activeVideo.id);

        html += '<div class="infocus-playlist-card ' + (isActive ? 'active' : '') + '" onclick="switchInFocusVideo(\'' + v.id + '\')">' +
          '<div class="infocus-card-thumb-wrap">' +
            '<img src="' + vThumb + '" alt="' + (v.title || 'Video Thumbnail') + '" class="infocus-card-thumb" onerror="this.src=\'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600\';" />' +
            '<div class="infocus-card-play-btn">' +
              '<div class="infocus-play-icon">▶</div>' +
            '</div>' +
            '<span class="infocus-card-duration">' + (v.duration || '00:00') + '</span>' +
          '</div>' +
          '<div class="infocus-card-body">' +
            '<div style="display:flex; align-items:center; gap:0.4rem; margin-bottom:0.35rem;">' +
              '<span style="font-family:var(--font-mono); font-size:0.68rem; font-weight:700; color:var(--cheddar-yellow); text-transform:uppercase;">' + (v.category || 'Spotlight') + '</span>' +
              (isActive ? '<span style="font-family:var(--font-mono); font-size:0.68rem; font-weight:800; color:var(--cheddar-yellow); margin-left:auto;">NOW PLAYING</span>' : '') +
            '</div>' +
            '<h5 class="infocus-card-title">' + (v.title || 'Untitled Video') + '</h5>' +
            '<p class="infocus-card-desc">' + (v.description || '') + '</p>' +
          '</div>' +
        '</div>';
      });

      html += '</div>';
    }

    html += '</div>'; // close infocus-showcase-container

    container.innerHTML = html;
    } catch (e) {
      console.error('In Focus render error:', e);
    }
  }

  window.renderInFocusSection = renderInFocusSection;

  // Run secondary section renders
  if (typeof window.renderWhyIConnectSection === 'function') {
    window.renderWhyIConnectSection('why-iconnect-container');
  }
  renderInFocusSection();
  renderFacultyOrgChart();
  renderEditorialTeam();
  renderAnnouncements();
  renderCreativesGallery();
});

/* ==========================================================================
   CAPSU VMG MODAL SYSTEM — open/close modal popups for each VMG section
   ========================================================================== */

function openVMGModal(tab) {
  // Show overlay
  const overlay = document.getElementById('vmg-modal-overlay');
  if (overlay) overlay.classList.add('active');

  // Close any open modal first
  document.querySelectorAll('.vmg-modal').forEach(function (m) {
    m.classList.remove('active');
  });

  // Open the target modal
  const modal = document.getElementById('vmg-modal-' + tab);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    const bodyEl = modal.querySelector('.vmg-modal-body');
    if (bodyEl) bodyEl.scrollTop = 0;
  }
}

function closeVMGModal() {
  const overlay = document.getElementById('vmg-modal-overlay');
  if (overlay) overlay.classList.remove('active');

  document.querySelectorAll('.vmg-modal').forEach(function (m) {
    m.classList.remove('active');
  });

  document.body.style.overflow = '';
}

// Close modal on Escape key
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') closeVMGModal();
});

// Legacy tab switcher (no-op, kept for compatibility)
function switchVMGTab(tab) {
  openVMGModal(tab);
}

/* ==========================================================================
   FACULTY DETAIL LIGHTBOX MODAL CONTROLLER
   ========================================================================== */
window.openFacultyModal = function (id) {
  const modal = document.getElementById('faculty-member-modal');
  if (!modal) return;
  const members = (typeof window.getMergedFacultyMembers === 'function') ? window.getMergedFacultyMembers() : (window.facultyMembersData || []);
  const member = members.find(m => m.id === id);
  if (!member) return;

  const tint = member.tintColor || '#00f0ff';
  const photoWrap = document.getElementById('fac-modal-photo-wrap');
  const photoImg = document.getElementById('fac-modal-photo');
  const deptTag = document.getElementById('fac-modal-dept');
  const tierTag = document.getElementById('fac-modal-tier');
  const nameEl = document.getElementById('fac-modal-name');
  const roleEl = document.getElementById('fac-modal-role');
  const bioEl = document.getElementById('fac-modal-bio');
  const bioSection = document.getElementById('fac-modal-bio-section');
  const emailBtn = document.getElementById('fac-modal-email-btn');
  const emailText = document.getElementById('fac-modal-email-text');

  if (photoWrap) {
    photoWrap.style.borderColor = tint;
    photoWrap.style.boxShadow = '0 12px 35px ' + tint + '40';
  }
  if (photoImg) {
    photoImg.src = member.image || 'assets/images/team/art-jayson-osuyos.jpg';
    photoImg.alt = member.name;
  }
  if (deptTag) {
    deptTag.textContent = member.department || 'BSCS Department';
    deptTag.style.color = tint;
    deptTag.style.background = tint + '18';
    deptTag.style.borderColor = tint + '40';
  }
  if (tierTag) {
    tierTag.textContent = 'Level ' + (member.tier || 1);
  }
  if (nameEl) nameEl.textContent = member.name;
  if (roleEl) {
    roleEl.textContent = member.role;
    roleEl.style.color = tint;
  }

  const headerData = (typeof window.getMergedFacultyHeader === 'function') ? window.getMergedFacultyHeader() : (window.facultyHeaderData || {});
  const instEl = document.getElementById('fac-modal-institution');
  const footerTagEl = document.getElementById('fac-modal-footer-tag');

  if (instEl) {
    instEl.textContent = (member.institution && member.institution.trim() !== '') ? member.institution.trim() : (headerData.institution || 'Capiz State University – Mambusao');
  }
  if (footerTagEl) {
    footerTagEl.textContent = (member.footerTag && member.footerTag.trim() !== '') ? member.footerTag.trim() : (headerData.footerTag || 'iConnect Publication Faculty Directory');
  }

  // Handle Bio presence: if empty, hide bioSection and expand photoWrap to 260px x 260px!
  const hasBio = Boolean(member.bio && member.bio.trim());
  if (hasBio) {
    if (bioEl) bioEl.textContent = member.bio.trim();
    if (bioSection) bioSection.style.display = 'block';
    if (photoWrap) {
      photoWrap.style.width = '190px';
      photoWrap.style.height = '190px';
    }
  } else {
    if (bioSection) bioSection.style.display = 'none';
    if (photoWrap) {
      photoWrap.style.width = '260px';
      photoWrap.style.height = '260px';
    }
  }

  if (emailBtn && emailText) {
    if (member.email) {
      emailBtn.href = 'mailto:' + member.email;
      emailText.textContent = member.email;
      emailBtn.style.display = 'inline-flex';
    } else {
      emailBtn.style.display = 'none';
    }
  }

  modal.style.display = 'flex';
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Start Background Canvas Animation loop inside the Big Modal Card Window!
  if (window._facModalAnimId) cancelAnimationFrame(window._facModalAnimId);
  var modalCanvas = document.getElementById('fac-modal-bg-canvas');
  if (modalCanvas) {
    var t = 0;
    function modalLoop() {
      t++;
      var bgEffect = (typeof window.getFacultyBgEffect === 'function') ? window.getFacultyBgEffect() : 'cyber-matrix';
      var bgOpacity = (typeof window.getFacultyBgOpacity === 'function') ? window.getFacultyBgOpacity() : 0.6;
      var parent = modalCanvas.parentElement;
      if (parent) {
        var w = parent.offsetWidth || 620;
        var h = parent.offsetHeight || 450;
        if (modalCanvas.width !== w || modalCanvas.height !== h) {
          modalCanvas.width = w;
          modalCanvas.height = h;
        }
        var ctx = modalCanvas.getContext('2d');
        if (ctx && typeof window.drawFacultyCardBgCanvas === 'function') {
          window.drawFacultyCardBgCanvas(ctx, w, h, t, bgEffect, bgOpacity);
        }
      }
      window._facModalAnimId = requestAnimationFrame(modalLoop);
    }
    window._facModalAnimId = requestAnimationFrame(modalLoop);
  }
};

window.closeFacultyModal = function () {
  if (window._facModalAnimId) {
    cancelAnimationFrame(window._facModalAnimId);
    window._facModalAnimId = null;
  }
  const modal = document.getElementById('faculty-member-modal');
  if (modal) {
    modal.classList.remove('active');
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
};

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    window.closeFacultyModal();
  }
});

/* --------------------------------------------------------------------------
   SECTION VISIBILITY APPLIER
   Applies Hide/Show states set in Editorial, Faculty, Creatives, & Slider Studios
   -------------------------------------------------------------------------- */
window.applySectionVisibility = function () {
  const isEditorialVisible = localStorage.getItem('iconnect_show_editorial') !== 'false';
  const isFacultyVisible   = localStorage.getItem('iconnect_show_faculty') !== 'false';
  const isCreativesVisible = localStorage.getItem('iconnect_show_creatives') !== 'false';
  const isSliderVisible    = localStorage.getItem('iconnect_show_slider') !== 'false';

  // 1. Editorial Board Section (#team)
  const teamSection = document.getElementById('team') || document.querySelector('.editorial-board-section');
  if (teamSection) {
    teamSection.style.display = isEditorialVisible ? '' : 'none';
  }

  // 2. Faculty Directory Section (#faculty-directory)
  const facultySection = document.getElementById('faculty-directory') || document.querySelector('.faculty-section');
  if (facultySection) {
    facultySection.style.display = isFacultyVisible ? '' : 'none';
  }
  
  // On faculty.html page
  const facultyPageContainer = document.getElementById('faculty-orgchart-container');
  const facultyHiddenNotice = document.getElementById('faculty-hidden-notice');
  if (facultyPageContainer) {
    if (!isFacultyVisible) {
      facultyPageContainer.style.display = 'none';
      if (facultyHiddenNotice) facultyHiddenNotice.style.display = 'block';
    } else {
      facultyPageContainer.style.display = '';
      if (facultyHiddenNotice) facultyHiddenNotice.style.display = 'none';
    }
  }

  // 3. Creatives Gallery Section (#creatives-gallery)
  const creativesSection = document.getElementById('creatives-gallery') || document.querySelector('.creatives-section');
  if (creativesSection) {
    creativesSection.style.display = isCreativesVisible ? '' : 'none';
  }

  // 4. Hero Slider Section (#hero-carousel)
  const heroSliderSection = document.getElementById('hero-carousel') || document.querySelector('.hero') || document.querySelector('.hero-slider');
  if (heroSliderSection) {
    heroSliderSection.style.display = isSliderVisible ? '' : 'none';
  }

  // 5. Ecosystem Graph Section (#network)
  const isEcosystemVisible = (typeof window.StudioVisibility !== 'undefined')
    ? window.StudioVisibility.isVisible('ecosystem')
    : (localStorage.getItem('iconnect_show_ecosystem') !== 'false');

  const ecosystemSection = document.getElementById('network') || document.querySelector('.network-section');
  if (ecosystemSection) {
    ecosystemSection.style.display = isEcosystemVisible ? '' : 'none';
  }

  // 6. In Focus Video Showcase Section (#in-focus)
  const isInFocusVisible = (typeof window.isInFocusVisible === 'function')
    ? window.isInFocusVisible()
    : (localStorage.getItem('iconnect_show_infocus') !== 'false');

  const infocusSection = document.getElementById('in-focus');
  if (infocusSection) {
    infocusSection.style.display = isInFocusVisible ? '' : 'none';
  }
};

document.addEventListener('DOMContentLoaded', function () {
  window.applySectionVisibility();
});

