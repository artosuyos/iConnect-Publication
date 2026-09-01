/* ==========================================================================
   iCONNECT PUBLICATION — ENGAGEMENT SYSTEM (js/engagement.js)
   Handles: Article View Count, Heart Reactions, Share Button, Visitor Counter
   All view counts + hearts are synced in real-time via Firebase Realtime DB.
   ========================================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------------------------
     FIREBASE REALTIME DATABASE CONFIG
     All article views and heart counts are stored here so every device
     sees the same numbers in real-time.
     ------------------------------------------------------------------ */
  var FIREBASE_DB = 'https://iconnnect-database-default-rtdb.asia-southeast1.firebasedatabase.app';

  /* Firebase REST API helpers (no SDK — pure fetch, no build step needed) */
  function fbGet(path) {
    return fetch(FIREBASE_DB + '/' + path + '.json')
      .then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; });
  }

  function fbSet(path, value) {
    return fetch(FIREBASE_DB + '/' + path + '.json', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(value)
    }).catch(function () {});
  }

  /* ------------------------------------------------------------------
     LOCAL STORAGE HELPERS (only used for per-device state:
     "has this browser viewed/hearted this article?")
     ------------------------------------------------------------------ */
  var STORE = {
    get: function (key) {
      try { return JSON.parse(localStorage.getItem(key)); } catch (e) { return null; }
    },
    set: function (key, val) {
      try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
    }
  };

  /* ------------------------------------------------------------------
     VISITOR COUNTER (per-device is intentional — stays in localStorage)
     ------------------------------------------------------------------ */
  window.initVisitorCounter = function () {
    var counterEl = document.getElementById('site-visitor-counter');
    if (!counterEl) return;

    var today = new Date().toDateString();
    var todayKey = today.replace(/\s+/g, '-');        // e.g. "Wed-Aug-13-2026"
    var sessionKey = 'iconnect_sess_' + todayKey;
    var isNewVisit = !STORE.get(sessionKey);

    /* Show a loading placeholder while Firebase responds */
    counterEl.innerHTML =
      '<span class="vc-icon">&#128065;</span>' +
      '<span class="vc-label">Total Visitors</span>' +
      '<span class="vc-count">—</span>' +
      '<span class="vc-sep">&middot;</span>' +
      '<span class="vc-today">Today: <strong>—</strong></span>';

    /* Read current totals from Firebase */
    fbGet('visitors').then(function (data) {
      data = data || { total: 0, todayCount: 0, lastDate: '' };

      /* Seed a realistic baseline if brand new */
      if (!data.total || data.total < 100) {
        data.total = Math.floor(Math.random() * 800) + 200;
      }

      /* Reset daily count if it's a new day */
      if (data.lastDate !== today) {
        data.todayCount = 0;
        data.lastDate = today;
      }

      /* Count this visit once per browser session */
      if (isNewVisit) {
        STORE.set(sessionKey, true);
        data.total     += 1;
        data.todayCount += 1;
        /* Write updated counts back to Firebase */
        fbSet('visitors', data);
      }

      /* Render the counter */
      if (counterEl) {
        counterEl.innerHTML =
          '<span class="vc-icon">&#128065;</span>' +
          '<span class="vc-label">Total Visitors</span>' +
          '<span class="vc-count">' + data.total.toLocaleString() + '</span>' +
          '<span class="vc-sep">&middot;</span>' +
          '<span class="vc-today">Today: <strong>' + data.todayCount + '</strong></span>';
      }
    });
  };

  /* ------------------------------------------------------------------
     ARTICLE VIEW COUNT — Firebase synced
     ------------------------------------------------------------------ */
  function recordAndGetViews(articleId) {
    var path = 'articles/' + articleId + '/views';
    var viewedKey = 'iconnect_viewed_' + articleId;
    var alreadyViewed = STORE.get(viewedKey);

    return fbGet(path).then(function (currentViews) {
      // Seed a realistic random count if this article is brand new in Firebase
      var count = (typeof currentViews === 'number' && currentViews > 0)
        ? currentViews
        : (Math.floor(Math.random() * 340) + 60);

      if (!alreadyViewed) {
        STORE.set(viewedKey, true);
        count = count + 1;
        fbSet(path, count);
      }

      return count;
    });
  }

  /* ------------------------------------------------------------------
     HEART REACTIONS — Firebase synced
     Hearted state (whether THIS USER liked it) stays in localStorage.
     The actual count is stored in Firebase so all devices see the same number.
     ------------------------------------------------------------------ */
  function isHearted(articleId) {
    return !!STORE.get('iconnect_hearted_' + articleId);
  }

  function getHeartsFromFirebase(articleId) {
    return fbGet('articles/' + articleId + '/hearts').then(function (val) {
      if (typeof val === 'number' && val > 0) return val;
      // Seed a starting count for new articles
      var seed = Math.floor(Math.random() * 80) + 10;
      fbSet('articles/' + articleId + '/hearts', seed);
      return seed;
    });
  }

  window.toggleHeart = function (articleId) {
    var hearted = isHearted(articleId);
    var btn      = document.getElementById('heart-btn-' + articleId);
    var countEl  = document.getElementById('heart-count-' + articleId);

    // Optimistic UI update instantly (don't wait for Firebase)
    var currentDisplay = parseInt((countEl ? countEl.textContent : '0').replace(/,/g, '')) || 0;
    var newCount = hearted ? Math.max(0, currentDisplay - 1) : currentDisplay + 1;

    if (hearted) {
      STORE.set('iconnect_hearted_' + articleId, false);
      if (btn) {
        btn.classList.remove('hearted');
        btn.setAttribute('aria-pressed', 'false');
        var svg = btn.querySelector('.heart-icon');
        if (svg) { svg.setAttribute('fill', 'none'); svg.setAttribute('stroke', 'currentColor'); }
      }
    } else {
      STORE.set('iconnect_hearted_' + articleId, true);
      if (btn) {
        btn.classList.add('hearted');
        btn.setAttribute('aria-pressed', 'true');
        var svg2 = btn.querySelector('.heart-icon');
        if (svg2) { svg2.setAttribute('fill', '#ff6b8a'); svg2.setAttribute('stroke', '#ff6b8a'); }
        btn.classList.add('heart-burst');
        setTimeout(function () { btn.classList.remove('heart-burst'); }, 500);
      }
    }

    if (countEl) countEl.textContent = newCount.toLocaleString();

    // Write new count to Firebase (syncs to all other devices)
    fbSet('articles/' + articleId + '/hearts', newCount);
  };

  /* --- Helper: Get Direct Article Share URL (uses /article/slug/ permalink) --- */
  function getDirectArticleUrl(articleId) {
    var origin = window.location.origin || 'https://www.iconnectpublication.org';
    return origin + '/article/' + encodeURIComponent(articleId) + '/';
  }

  /* ------------------------------------------------------------------
     SHARE FUNCTIONS
     ------------------------------------------------------------------ */
  window.openSharePanel = function (articleId) {
    var shareUrl = getDirectArticleUrl(articleId);
    var articles = window.iConnectArticles || [];
    var found = articles.find(function (a) { return a.id === articleId; });
    var title = found ? (found.title + ' | iConnect Publication') : (document.title || 'iConnect Article');

    if (navigator.share) {
      navigator.share({ title: title, url: shareUrl }).catch(function () {});
      return;
    }

    var panel = document.getElementById('share-panel-' + articleId);
    if (!panel) return;
    var isOpen = panel.classList.contains('open');
    document.querySelectorAll('.share-panel.open').forEach(function (p) { p.classList.remove('open'); });
    if (!isOpen) panel.classList.add('open');
  };

  /* --- Modern Multi-Platform Social Share Engine --- */
  window.shareToSocial = function (platform, url, title) {
    var encodedUrl = encodeURIComponent(url);
    var encodedTitle = encodeURIComponent(title);
    var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
    var shareUrl = '';

    switch (platform) {
      case 'facebook':
        shareUrl = 'https://www.facebook.com/sharer/sharer.php?u=' + encodedUrl;
        break;
      case 'messenger':
        if (isMobile) {
          window.location.href = 'fb-messenger://share/?link=' + encodedUrl;
          setTimeout(function () {
            window.open('https://www.facebook.com/dialog/send?link=' + encodedUrl + '&app_id=296896974127027&redirect_uri=' + encodedUrl, '_blank');
          }, 600);
          return;
        } else {
          shareUrl = 'https://www.facebook.com/dialog/send?link=' + encodedUrl + '&app_id=296896974127027&redirect_uri=' + encodedUrl;
        }
        break;
      case 'whatsapp':
        shareUrl = isMobile
          ? 'whatsapp://send?text=' + encodedTitle + '%20' + encodedUrl
          : 'https://api.whatsapp.com/send?text=' + encodedTitle + '%20' + encodedUrl;
        break;
      case 'viber':
        shareUrl = 'viber://forward?text=' + encodedTitle + '%20' + encodedUrl;
        break;
      case 'twitter':
        shareUrl = 'https://twitter.com/intent/tweet?url=' + encodedUrl + '&text=' + encodedTitle;
        break;
      case 'threads':
        shareUrl = 'https://www.threads.net/intent/post?text=' + encodedTitle + '%20' + encodedUrl;
        break;
      case 'telegram':
        shareUrl = 'https://t.me/share/url?url=' + encodedUrl + '&text=' + encodedTitle;
        break;
      case 'linkedin':
        shareUrl = 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodedUrl;
        break;
      case 'email':
        shareUrl = 'mailto:?subject=' + encodedTitle + '&body=' + encodedTitle + '%0A%0A' + encodedUrl;
        break;
      case 'copy':
        try {
          navigator.clipboard.writeText(url).then(function () {
            var btn = document.getElementById('copy-link-btn');
            if (btn) { btn.textContent = '✓ Copied Direct Link!'; setTimeout(function () { btn.textContent = '📋 Copy Direct Article Link'; }, 2200); }
          });
        } catch (e) {
          var ta = document.createElement('textarea');
          ta.value = url; document.body.appendChild(ta); ta.select();
          document.execCommand('copy'); document.body.removeChild(ta);
          alert('Link copied to clipboard!');
        }
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,width=640,height=580');
    }
  };

  /* ------------------------------------------------------------------
     INIT ENGAGEMENT BAR — reads from Firebase and updates displayed counts
     Called after the HTML is already in the DOM.
     ------------------------------------------------------------------ */
  /* ------------------------------------------------------------------
     INIT ENGAGEMENT BAR — No-op since views & hearts are removed
     ------------------------------------------------------------------ */
  window.initEngagementBar = function (articleId) {
    // Views and Hearts removed per request.
  };

  /* ------------------------------------------------------------------
     BUILD ENGAGEMENT BAR HTML (called by render.js — must be synchronous)
     Retains Share button and adds "Facebook @iConnect" pill link
     ------------------------------------------------------------------ */
  window.buildEngagementBar = function (article) {
    var aid = article.id;
    var pageUrl = getDirectArticleUrl(aid);
    var aTitle = (article.title || '').replace(/'/g, "\\'");

    return '<div class="engagement-bar" id="engagement-bar-' + aid + '">' +

      '<div class="eng-share-wrapper">' +
        '<button class="eng-share-btn" id="share-btn-' + aid + '" onclick="openSharePanel(\'' + aid + '\')" aria-label="Share">' +
          '<svg class="eng-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
            '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>' +
            '<line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>' +
          '</svg>' +
          '<span>Share</span>' +
        '</button>' +
        '<div class="share-panel" id="share-panel-' + aid + '">' +
          '<div class="share-panel-title">Share to Modern Apps</div>' +
          '<div class="share-panel-buttons">' +
            '<button class="share-opt-btn share-fb" onclick="shareToSocial(\'facebook\',\'' + pageUrl + '\',\'' + aTitle + '\')">' +
              '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>Facebook' +
            '</button>' +
            '<button class="share-opt-btn share-msg" onclick="shareToSocial(\'messenger\',\'' + pageUrl + '\',\'' + aTitle + '\')">' +
              '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.145 2 11.259c0 2.913 1.45 5.518 3.715 7.202V22l3.355-1.843c.928.257 1.91.396 2.93.396 5.523 0 10-4.145 10-9.259C22 6.145 17.523 2 12 2zm1.042 12.433l-2.584-2.756-5.045 2.756 5.549-5.892 2.646 2.756 4.983-2.756-5.549 5.892z"/></svg>Messenger' +
            '</button>' +
            '<button class="share-opt-btn share-wa" onclick="shareToSocial(\'whatsapp\',\'' + pageUrl + '\',\'' + aTitle + '\')">' +
              '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884"/></svg>WhatsApp' +
            '</button>' +
            '<button class="share-opt-btn share-viber" onclick="shareToSocial(\'viber\',\'' + pageUrl + '\',\'' + aTitle + '\')">' +
              '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.78 14.54c-.6-.35-2.02-1.04-2.33-1.16-.31-.12-.54-.18-.77.17-.23.35-.89 1.15-1.09 1.38-.2.23-.4.26-.74.09-.34-.17-1.44-.53-2.74-1.69-1.01-.9-1.7-2.01-1.9-2.35-.2-.34-.02-.53.15-.7.15-.15.34-.4.51-.6.17-.2.23-.34.34-.57.11-.23.06-.43-.03-.6-.09-.17-.77-1.85-1.05-2.53-.28-.66-.56-.57-.77-.58l-.66-.01c-.23 0-.6.09-.91.43s-1.2 1.17-1.2 2.85c0 1.68 1.22 3.3 1.39 3.53.17.23 2.41 3.68 5.84 5.16.82.35 1.45.56 1.95.72.82.26 1.57.22 2.16.14.66-.1 2.02-.83 2.31-1.63.29-.8.29-1.48.2-1.63-.09-.15-.31-.23-.66-.4"/></svg>Viber' +
            '</button>' +
            '<button class="share-opt-btn share-tw" onclick="shareToSocial(\'twitter\',\'' + pageUrl + '\',\'' + aTitle + '\')">' +
              '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>X (Twitter)' +
            '</button>' +
            '<button class="share-opt-btn share-threads" onclick="shareToSocial(\'threads\',\'' + pageUrl + '\',\'' + aTitle + '\')">' +
              '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.186 24C5.457 24 0 18.543 0 11.814 0 5.086 5.457 0 12.186 0c3.272 0 6.242 1.25 8.448 3.456l-2.83 2.83c-1.503-1.503-3.532-2.355-5.618-2.355-4.516 0-8.255 3.739-8.255 8.255 0 4.516 3.739 8.255 8.255 8.255 3.013 0 5.645-1.626 7.078-4.047-1.189-.523-2.607-.813-4.078-.813-3.86 0-7 3.14-7 7s3.14 7 7 7c2.518 0 4.793-1.077 6.37-2.793l2.766 2.766C20.407 22.84 16.536 24 12.186 24z"/></svg>Threads' +
            '</button>' +
            '<button class="share-opt-btn share-tg" onclick="shareToSocial(\'telegram\',\'' + pageUrl + '\',\'' + aTitle + '\')">' +
              '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.03-1.96 1.25-5.54 3.67-.52.36-1 .54-1.42.53-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.37-.49 1.02-.75 4.01-1.74 6.69-2.89 8.04-3.46 3.82-1.6 4.62-1.88 5.14-1.89.11 0 .37.03.54.17.14.12.18.28.2.45-.02.07-.02.13-.03.22z"/></svg>Telegram' +
            '</button>' +
            '<button class="share-opt-btn share-email" onclick="shareToSocial(\'email\',\'' + pageUrl + '\',\'' + aTitle + '\')">' +
              '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>Gmail / Email' +
            '</button>' +
            '<button class="share-opt-btn share-copy" id="copy-link-btn" onclick="shareToSocial(\'copy\',\'' + pageUrl + '\',\'' + aTitle + '\')">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>📋 Copy Direct Article Link' +
            '</button>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<a href="https://www.facebook.com/iconnect.bscs" target="_blank" rel="noopener noreferrer" class="eng-fb-pill-btn">' +
        '<span>Connect to us on Facebook @iConnect</span>' +
      '</a>' +

    '</div>';
  };

  /* Close share panel on outside click */
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.eng-share-wrapper')) {
      document.querySelectorAll('.share-panel.open').forEach(function (p) { p.classList.remove('open'); });
    }
  });

})();
