/* ==========================================================================
   iCONNECT PUBLISHER — EDITORIAL WORKSPACE ENGINE (js/publisher.js)
   Full-featured Authoring, Rich-Text Editor, Live Preview, and Instant Publishing
   ========================================================================== */

(function (window) {
  'use strict';

  var LOCAL_KEY   = 'iconnect_published_articles';
  var STORAGE_KEY = 'iconnect_published_articles';
  var DRAFT_KEY   = 'iconnect_draft_article';
  var CAT_KEY     = 'iconnect_categories';
  var DELETED_KEY = 'iconnect_deleted_articles';
  var DEFAULT_CATEGORIES = ['Technology', 'News', 'Features', 'Opinion', 'Campus', 'Creatives'];

  /* --- Image Compression Utility --- */
  function compressImageFile(file, maxWidth, quality, callback) {
    if (!file || !file.type || !file.type.match(/image.*/)) {
      if (typeof callback === 'function') callback(null);
      return;
    }
    maxWidth = maxWidth || 1400;
    quality = quality || 0.82;

    var reader = new FileReader();
    reader.onload = function (e) {
      var img = new Image();
      img.onload = function () {
        var width = img.width;
        var height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        var canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        var mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        if (file.size > 200000) mimeType = 'image/jpeg'; // Compress large images as JPEG
        var compressed = canvas.toDataURL(mimeType, quality);
        if (typeof callback === 'function') callback(compressed);
      };
      img.onerror = function () {
        if (typeof callback === 'function') callback(e.target.result);
      };
      img.src = e.target.result;
    };
    reader.onerror = function () {
      if (typeof callback === 'function') callback(null);
    };
    reader.readAsDataURL(file);
  }

  /* --- Datastore Helpers & Safe Quota Recovery --- */
  function getCustomArticles() {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveCustomArticlesSafely(articles) {
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(articles));
      return true;
    } catch (e) {
      console.warn('LocalStorage quota warning. Performing storage cleanup and recovery...', e);

      // 1. Clean disposable draft caches
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch (err) {}

      try {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(articles));
        return true;
      } catch (e2) {
        // 2. Sanitize large images in older articles to free up quota
        try {
          var sanitized = articles.map(function (art, idx) {
            var item = Object.assign({}, art);
            // If image is huge base64 in older articles, use fallback
            if (idx > 1 && item.image && item.image.length > 350000) {
              item.image = './assets/images/articles/gallery-1.jpg';
            }
            if (idx > 1 && item.featurePhoto && item.featurePhoto.length > 350000) {
              item.featurePhoto = '';
            }
            return item;
          });
          localStorage.setItem(LOCAL_KEY, JSON.stringify(sanitized));
          return true;
        } catch (e3) {
          // 3. Keep the most recent 10 articles in localStorage
          try {
            localStorage.setItem(LOCAL_KEY, JSON.stringify(articles.slice(0, 10)));
            return true;
          } catch (e4) {
            try {
              localStorage.setItem(LOCAL_KEY, JSON.stringify(articles.slice(0, 3)));
              return true;
            } catch (e5) {
              console.error('All localStorage save attempts failed:', e5);
              return false;
            }
          }
        }
      }
    }
  }

  function saveCustomArticles(articles) {
    saveCustomArticlesSafely(articles);
  }

  function getStoredCategories() {
    try {
      var stored = JSON.parse(localStorage.getItem(CAT_KEY));
      if (Array.isArray(stored) && stored.length > 0) return stored;
    } catch (e) {}
    return DEFAULT_CATEGORIES.slice();
  }

  function saveStoredCategories(categories) {
    try {
      localStorage.setItem(CAT_KEY, JSON.stringify(categories));
    } catch (e) {}
  }

  /* Merge custom articles into global window.iConnectArticles */
  window.loadMergedArticles = function () {
    var baseArticles = (typeof window.articlesData !== 'undefined' && Array.isArray(window.articlesData)) ? window.articlesData : (window.iConnectArticles || []);
    var customArticles = getCustomArticles();
    var deletedIds = [];
    try {
      deletedIds = JSON.parse(localStorage.getItem('iconnect_deleted_articles')) || [];
    } catch (e) {}

    var merged = customArticles.concat(baseArticles);

    var seen = {};
    var unique = [];
    merged.forEach(function (art) {
      if (!art || !art.id) return;
      if (deletedIds.indexOf(art.id) !== -1) return;
      if (!seen[art.id]) {
        seen[art.id] = true;
        unique.push(art);
      }
    });

    // Apply custom display order if saved via Publisher Studio
    var customOrder = [];
    try {
      customOrder = JSON.parse(localStorage.getItem('iconnect_articles_order')) || [];
    } catch (e) {}

    if (Array.isArray(customOrder) && customOrder.length > 0) {
      unique.sort(function (a, b) {
        var idxA = customOrder.indexOf(a.id);
        var idxB = customOrder.indexOf(b.id);
        if (idxA === -1 && idxB === -1) return 0;
        if (idxA === -1) return 1;
        if (idxB === -1) return -1;
        return idxA - idxB;
      });
    }

    window.iConnectArticles = unique;
    return unique;
  };

  if (typeof window.articlesData !== 'undefined') {
    window.loadMergedArticles();
  }

  /* --- Slug generator --- */
  function generateSlug(text) {
    return text.toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  /* --- Calculate Reading Time --- */
  function calculateReadingTime(text) {
    var words = text.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
    var wpm = 200;
    var minutes = Math.ceil(words / wpm) || 1;
    return minutes + ' min read';
  }

  /* --- Publisher App Controller --- */
  var PublisherApp = {
    currentMode: 'visual', // 'visual' or 'html'

    init: function () {
      this.cacheDOM();
      this.bindEvents();
      this.renderCategoryDropdown();
      this.initDefaultValues();
      this.loadDraft();
      if (this.editorCanvas && this.editorCanvas.innerHTML) {
        this.editorCanvas.innerHTML = this.convertEmbedsForEditor(this.editorCanvas.innerHTML);
      }
      this.renderArticlesList();
    },

    cacheDOM: function () {
      this.titleInput = document.getElementById('pub-title');
      this.slugPreview = document.getElementById('pub-slug-preview');
      this.categoryInput = document.getElementById('pub-category');
      this.customCatGroup = document.getElementById('pub-custom-cat-group');
      this.customCatInput = document.getElementById('pub-custom-category');
      this.authorInput = document.getElementById('pub-author');
      this.authorIconInput = document.getElementById('pub-author-icon');
      this.roleInput = document.getElementById('pub-role');
      this.dateInput = document.getElementById('pub-date');
      this.readTimeInput = document.getElementById('pub-read-time');
      this.featuredCheck = document.getElementById('pub-featured');
      this.featurePhotoGroup = document.getElementById('pub-feature-photo-group');
      this.featurePhotoInput = document.getElementById('pub-feature-photo');
      this.featurePhotoPreview = document.getElementById('pub-feature-photo-preview');
      this.imageUrlInput = document.getElementById('pub-image-url');
      this.imagePreview = document.getElementById('pub-image-preview');
      this.excerptInput = document.getElementById('pub-excerpt');
      this.editorCanvas = document.getElementById('pub-editor-canvas');
      this.htmlEditor = document.getElementById('pub-html-editor');
      this.modeToggleBtn = document.getElementById('pub-toggle-mode-btn');

      // Toggles for metadata visibility
      this.showAuthorCheck = document.getElementById('pub-show-author');
      this.showRoleCheck = document.getElementById('pub-show-role');
      this.showDateCheck = document.getElementById('pub-show-date');
      this.showReadTimeCheck = document.getElementById('pub-show-readtime');

      // Custom Roles / Additional Contributors
      this.customRolesContainer = document.getElementById('pub-custom-roles-container');
      this.btnAddRole = document.getElementById('pub-btn-add-role');

      // Modals
      this.exportModal = document.getElementById('pub-export-modal');
      this.exportCodeBlock = document.getElementById('pub-export-code');
      this.previewModal = document.getElementById('pub-preview-modal');
      this.previewContainer = document.getElementById('pub-preview-content');

      this.catModal = document.getElementById('pub-cat-modal');
      this.catList = document.getElementById('pub-cat-list');

      this.imgGridModal = document.getElementById('pub-img-grid-modal');

      // Articles list
      this.articlesList = document.getElementById('pub-articles-list');
      this.wordCountEl = document.getElementById('pub-word-count');
    },

    /* --- Custom Additional Roles Management --- */
    addCustomRoleRow: function (name, role, icon, show) {
      if (!this.customRolesContainer) return;
      var self = this;
      var row = document.createElement('div');
      row.className = 'custom-role-row';
      row.style.cssText = 'background:rgba(5,11,26,0.65); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:0.55rem 0.65rem; display:flex; flex-direction:column; gap:0.45rem; margin-bottom:0.35rem;';

      var isChecked = show !== false;
      var selectedIcon = icon || 'auto';

      row.innerHTML =
        '<div style="display:flex; align-items:center; justify-content:space-between; gap:0.45rem;">' +
          '<select class="form-select custom-role-icon" style="padding:0.3rem 0.4rem; font-size:0.75rem; width:100px; flex-shrink:0;" title="Select Icon">' +
            '<option value="auto"' + (selectedIcon === 'auto' ? ' selected' : '') + '>⚙️ Auto</option>' +
            '<option value="quill"' + (selectedIcon === 'quill' ? ' selected' : '') + '>✍️ Words</option>' +
            '<option value="camera"' + (selectedIcon === 'camera' ? ' selected' : '') + '>📷 Photos</option>' +
            '<option value="palette"' + (selectedIcon === 'palette' ? ' selected' : '') + '>🎨 Art/Layout</option>' +
            '<option value="video"' + (selectedIcon === 'video' ? ' selected' : '') + '>🎬 Video</option>' +
            '<option value="users"' + (selectedIcon === 'users' ? ' selected' : '') + '>👥 People</option>' +
            '<option value="mic"' + (selectedIcon === 'mic' ? ' selected' : '') + '>🎙️ Voice</option>' +
            '<option value="code"' + (selectedIcon === 'code' ? ' selected' : '') + '>💻 Tech</option>' +
            '<option value="star"' + (selectedIcon === 'star' ? ' selected' : '') + '>⭐ Star</option>' +
          '</select>' +
          '<input type="text" class="form-input custom-role-title" placeholder="Role (e.g. Photos by)" value="' + (role || '').replace(/"/g, '&quot;') + '" style="flex:1; min-width:0; padding:0.3rem 0.45rem; font-size:0.75rem;" />' +
          '<label style="display:inline-flex; align-items:center; gap:0.25rem; font-size:0.7rem; color:var(--text-muted); cursor:pointer; flex-shrink:0;" title="Show or Hide on Article">' +
            '<input type="checkbox" class="custom-role-show" ' + (isChecked ? 'checked' : '') + ' style="accent-color:var(--cheddar-yellow); cursor:pointer;" />' +
            '<span>Show</span>' +
          '</label>' +
          '<button type="button" class="custom-role-del" style="background:none; border:none; color:rgba(239,68,68,0.85); cursor:pointer; padding:0.15rem; display:flex; align-items:center; justify-content:center; flex-shrink:0;" title="Remove this role">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>' +
          '</button>' +
        '</div>' +
        '<input type="text" class="form-input custom-role-name" placeholder="Contributor Name(s) (e.g. Ann Lily Lerio & Ann Estorninos)" value="' + (name || '').replace(/"/g, '&quot;') + '" style="width:100%; padding:0.35rem 0.5rem; font-size:0.78rem;" />';

      var iconSelect = row.querySelector('.custom-role-icon');
      var nameInput = row.querySelector('.custom-role-name');
      var roleInput = row.querySelector('.custom-role-title');
      var showCheck = row.querySelector('.custom-role-show');
      var delBtn    = row.querySelector('.custom-role-del');

      [nameInput, roleInput].forEach(function (inp) {
        inp.addEventListener('input', function () {
          self.autoSaveDraft();
          self.updateLiveCardPreview();
        });
      });

      [iconSelect, showCheck].forEach(function (el) {
        el.addEventListener('change', function () {
          self.autoSaveDraft();
          self.updateLiveCardPreview();
        });
      });

      delBtn.addEventListener('click', function () {
        row.remove();
        self.autoSaveDraft();
        self.updateLiveCardPreview();
      });

      this.customRolesContainer.appendChild(row);
    },

    getCustomRoles: function () {
      if (!this.customRolesContainer) return [];
      var rows = this.customRolesContainer.querySelectorAll('.custom-role-row');
      var roles = [];
      rows.forEach(function (r) {
        var iconSel = r.querySelector('.custom-role-icon');
        var nameInp = r.querySelector('.custom-role-name');
        var roleInp = r.querySelector('.custom-role-title');
        var showInp = r.querySelector('.custom-role-show');
        var icon = iconSel ? iconSel.value : 'auto';
        var name = nameInp ? nameInp.value.trim() : '';
        var role = roleInp ? roleInp.value.trim() : '';
        var show = showInp ? showInp.checked : true;
        if (name || role) {
          roles.push({ name: name, role: role, icon: icon, show: show });
        }
      });
      return roles;
    },

    setCustomRoles: function (roles) {
      if (!this.customRolesContainer) return;
      this.customRolesContainer.innerHTML = '';
      var self = this;
      if (Array.isArray(roles) && roles.length > 0) {
        roles.forEach(function (r) {
          if (r) self.addCustomRoleRow(r.name || '', r.role || r.position || '', r.icon || 'auto', r.show !== false);
        });
      }
    },

    initDefaultValues: function () {
      // All fields start blank — user fills everything manually
      this.updateSlug();
      this.updateWordCount();
      this.updateLiveCardPreview();
    },

    bindEvents: function () {
      var self = this;

      if (this.titleInput) {
        this.titleInput.addEventListener('input', function () {
          self.updateSlug();
          self.autoSaveDraft();
          self.updateLiveCardPreview();
        });
      }

      if (this.categoryInput) {
        this.categoryInput.addEventListener('change', function () {
          if (self.categoryInput.value === 'CUSTOM') {
            self.customCatGroup.style.display = 'flex';
          } else {
            self.customCatGroup.style.display = 'none';
          }
          self.autoSaveDraft();
          self.updateLiveCardPreview();
        });
      }

      if (this.imageUrlInput) {
        this.imageUrlInput.addEventListener('input', function () {
          var val = self.imageUrlInput.value.trim();
          if (self.imagePreview) {
            if (val) {
              self.imagePreview.src = val;
              self.imagePreview.style.display = 'block';
            } else {
              self.imagePreview.style.display = 'none';
            }
          }
          self.autoSaveDraft();
          self.updateLiveCardPreview();
        });
      }

      if (this.featurePhotoInput) {
        this.featurePhotoInput.addEventListener('input', function () {
          var val = self.featurePhotoInput.value.trim();
          if (self.featurePhotoPreview) {
            if (val) {
              self.featurePhotoPreview.src = val;
              self.featurePhotoPreview.style.display = 'block';
            } else {
              self.featurePhotoPreview.style.display = 'none';
            }
          }
          self.autoSaveDraft();
        });
      }

      if (this.editorCanvas) {
        this.editorCanvas.addEventListener('input', function () {
          self.updateWordCount();
          self.autoSaveDraft();
          self.updateLiveCardPreview();
        });
      }

      if (this.htmlEditor) {
        this.htmlEditor.addEventListener('input', function () {
          self.updateWordCount();
          self.autoSaveDraft();
          self.updateLiveCardPreview();
        });
      }

      // Wire metadata fields & toggles to also refresh the live preview
      ['pub-author', 'pub-role', 'pub-date', 'pub-read-time', 'pub-excerpt', 'pub-custom-category', 'pub-feature-photo', 'pub-show-author', 'pub-show-role', 'pub-show-date', 'pub-show-readtime'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) {
          var evt = (id.indexOf('show-') !== -1) ? 'change' : 'input';
          el.addEventListener(evt, function () {
            self.autoSaveDraft();
            self.updateLiveCardPreview();
          });
        }
      });
      if (this.btnAddRole) {
        this.btnAddRole.addEventListener('click', function () {
          self.addCustomRoleRow('', '', true);
          self.autoSaveDraft();
          self.updateLiveCardPreview();
        });
      }

      // Featured checkbox
      var featEl = document.getElementById('pub-featured');
      if (featEl) featEl.addEventListener('change', function () { self.autoSaveDraft(); self.updateLiveCardPreview(); });
    },

    /* --- Live Card & Byline Preview Updater --- */
    updateLiveCardPreview: function () {
      var showAuthor   = !this.showAuthorCheck   || this.showAuthorCheck.checked;
      var showRole     = !this.showRoleCheck     || this.showRoleCheck.checked;
      var showDate     = !this.showDateCheck     || this.showDateCheck.checked;
      var showReadTime = !this.showReadTimeCheck || this.showReadTimeCheck.checked;

      // Read raw values — respect toggles and empty fields
      var title    = this.titleInput    ? this.titleInput.value.trim()    : '';
      var author   = (showAuthor && this.authorInput)   ? this.authorInput.value.trim()   : '';
      var role     = (showRole && this.roleInput)     ? this.roleInput.value.trim()     : '';
      var date     = (showDate && this.dateInput)     ? this.dateInput.value.trim()     : '';
      var readTime = (showReadTime && this.readTimeInput) ? this.readTimeInput.value.trim() : '';
      var excerpt  = this.excerptInput  ? this.excerptInput.value.trim()  : '';
      var img      = (this.imageUrlInput && this.imageUrlInput.value.trim()) || './assets/images/articles/gallery-1.jpg';
      var category = this.getCategory ? this.getCategory() : 'Technology';

      // --- Card preview elements ---
      var lpImg     = document.getElementById('lp-card-img');
      var lpBadge   = document.getElementById('lp-card-badge');
      var lpMeta    = document.getElementById('lp-card-meta');
      var lpTitle   = document.getElementById('lp-card-title');
      var lpExcerpt = document.getElementById('lp-card-excerpt');
      var lpAuthor  = document.getElementById('lp-card-author');

      if (lpImg) {
        if (img && img !== './assets/images/articles/gallery-1.jpg') {
          lpImg.src = img;
          lpImg.style.display = 'block';
        } else if (img === './assets/images/articles/gallery-1.jpg' && this.imageUrlInput && this.imageUrlInput.value.trim()) {
          lpImg.src = img;
          lpImg.style.display = 'block';
        } else {
          lpImg.style.display = 'none';
        }
      }
      if (lpBadge) { lpBadge.textContent = category; }

      // Meta row — only show separator if both date and readTime are present
      if (lpMeta) {
        var metaParts = [date, readTime].filter(Boolean);
        lpMeta.textContent = metaParts.join(' · ');
        lpMeta.style.opacity = metaParts.length ? '1' : '0.3';
      }

      if (lpTitle) {
        lpTitle.textContent = title || 'Article title…';
        lpTitle.style.opacity = title ? '1' : '0.35';
        lpTitle.style.fontStyle = title ? 'normal' : 'italic';
      }
      if (lpExcerpt) {
        lpExcerpt.textContent = excerpt || 'Excerpt…';
        lpExcerpt.style.opacity = excerpt ? '1' : '0.35';
        lpExcerpt.style.fontStyle = excerpt ? 'normal' : 'italic';
      }
      if (lpAuthor) {
        lpAuthor.textContent = author || '—';
        lpAuthor.style.opacity = author ? '1' : '0.35';
      }

      // --- Dynamic Byline preview elements (Primary Author + Custom Roles + Date + Read Time) ---
      var bylineParts = [];

      // 1. Primary Author
      if (author || role) {
        var initials = author ? author.split(' ').filter(Boolean).map(function(n){ return n[0].toUpperCase(); }).slice(0,2).join('') : '??';
        bylineParts.push(
          '<div style="display:flex; align-items:center; gap:0.5rem;">' +
            (author ? '<div style="width:30px; height:30px; border-radius:50%; background:linear-gradient(135deg,var(--cheddar-yellow),#e89c00); display:flex; align-items:center; justify-content:center; font-weight:800; font-size:0.75rem; color:#050b1a; flex-shrink:0;">' + (initials || '??') + '</div>' : '') +
            '<div>' +
              (author ? '<div style="font-weight:700; color:#fff; font-size:0.82rem;">' + author + '</div>' : '') +
              (role ? '<div style="font-size:0.72rem; color:var(--text-subtle);">' + role + '</div>' : '') +
            '</div>' +
          '</div>'
        );
      }

      // 2. Custom Additional Roles (Photojournalist, Layout Artist, etc.)
      var customRoles = this.getCustomRoles ? this.getCustomRoles() : [];
      customRoles.forEach(function (cr) {
        if (cr && cr.show !== false && (cr.name || cr.role)) {
          var crInitials = cr.name ? cr.name.split(' ').filter(Boolean).map(function(n){ return n[0].toUpperCase(); }).slice(0,2).join('') : '??';
          bylineParts.push(
            '<div style="display:flex; align-items:center; gap:0.5rem;">' +
              (cr.name ? '<div style="width:30px; height:30px; border-radius:50%; background:linear-gradient(135deg,#00f0ff,#0077ff); display:flex; align-items:center; justify-content:center; font-weight:800; font-size:0.75rem; color:#050b1a; flex-shrink:0;">' + crInitials + '</div>' : '') +
              '<div>' +
                (cr.name ? '<div style="font-weight:700; color:#fff; font-size:0.82rem;">' + cr.name + '</div>' : '') +
                (cr.role ? '<div style="font-size:0.72rem; color:var(--text-subtle);">' + cr.role + '</div>' : '') +
              '</div>' +
            '</div>'
          );
        }
      });

      // 3. Publish Date & Read Time
      if (date) {
        bylineParts.push('<div style="color:var(--text-muted); font-size:0.75rem;">' + date + '</div>');
      }
      if (readTime) {
        bylineParts.push('<div style="color:var(--cheddar-yellow); font-size:0.75rem; font-family:var(--font-mono);">' + readTime + '</div>');
      }

      var bylineContainer = document.getElementById('lp-byline-container');
      if (bylineContainer) {
        if (bylineParts.length > 0) {
          bylineContainer.innerHTML = bylineParts.join('<div style="color:var(--text-subtle); opacity:0.6;">|</div>');
        } else {
          bylineContainer.innerHTML = '<span style="color:var(--text-muted); font-size:0.75rem; font-style:italic;">(No byline metadata enabled)</span>';
        }
      }
    },


    /* --- Category Management --- */
    renderCategoryDropdown: function (preferredVal) {
      if (!this.categoryInput) return;
      var categories = getStoredCategories();
      var targetVal = preferredVal || this.categoryInput.value;

      var html = categories.map(function (c) {
        return '<option value="' + c + '">' + c + '</option>';
      }).join('') + '<option value="CUSTOM">+ Create Custom Category</option>';

      this.categoryInput.innerHTML = html;
      if (targetVal && categories.indexOf(targetVal) !== -1) {
        this.categoryInput.value = targetVal;
      } else if (categories.length > 0) {
        this.categoryInput.value = categories[0];
      }
    },

    openCategoryManagerModal: function () {
      this.renderCategoryManagerList();
      if (this.catModal) this.catModal.classList.add('active');
    },

    closeCategoryManagerModal: function () {
      if (this.catModal) this.catModal.classList.remove('active');
    },

    renderCategoryManagerList: function () {
      if (!this.catList) return;
      var categories = getStoredCategories();
      var self = this;

      this.catList.innerHTML = categories.map(function (cat) {
        return '<div style="display:flex; align-items:center; justify-content:space-between; padding:0.6rem 0.85rem; background:rgba(5,11,26,0.6); border:1px solid var(--border-navy); border-radius:8px; margin-bottom:0.5rem;">' +
          '<span style="font-family:var(--font-heading); font-weight:700; color:#fff;">' + cat + '</span>' +
          '<div style="display:flex; gap:0.4rem;">' +
            '<button type="button" class="toolbar-btn" style="font-size:0.75rem; padding:0.25rem 0.5rem;" onclick="PublisherApp.editCategory(\'' + cat.replace(/'/g, "\\'") + '\')">✏️ Edit</button>' +
            '<button type="button" class="toolbar-btn" style="font-size:0.75rem; padding:0.25rem 0.5rem; color:#ff6b8a; border-color:rgba(255,107,138,0.3);" onclick="PublisherApp.deleteCategory(\'' + cat.replace(/'/g, "\\'") + '\')">🗑 Delete</button>' +
          '</div>' +
        '</div>';
      }).join('');
    },

    addCategory: function () {
      var input = document.getElementById('pub-new-cat-input');
      if (!input) return;
      var newCat = input.value.trim();
      if (!newCat) { alert('Please enter a category name.'); return; }

      var categories = getStoredCategories();
      if (categories.indexOf(newCat) !== -1) { alert('Category already exists.'); return; }

      categories.push(newCat);
      saveStoredCategories(categories);
      input.value = '';
      this.renderCategoryDropdown(newCat);
      this.renderCategoryManagerList();
      if (this.customCatGroup) this.customCatGroup.style.display = 'none';
    },

    editCategory: function (oldName) {
      var newName = prompt('Enter new category name:', oldName);
      if (!newName || newName.trim() === '' || newName === oldName) return;
      newName = newName.trim();

      var categories = getStoredCategories();
      var idx = categories.indexOf(oldName);
      if (idx !== -1) {
        categories[idx] = newName;
        saveStoredCategories(categories);

        // Update custom published articles using this category
        var customArticles = getCustomArticles();
        customArticles.forEach(function (a) {
          if (a.category === oldName) a.category = newName;
        });
        saveCustomArticles(customArticles);

        this.renderCategoryDropdown(newName);
        this.renderCategoryManagerList();
        this.renderArticlesList();

        if (typeof window.loadArticlesData === 'function') window.loadArticlesData();
        if (typeof window.renderCategories === 'function') window.renderCategories();
        if (typeof window.renderNavCategories === 'function') window.renderNavCategories();
      }
    },

    deleteCategory: function (name) {
      if (confirm('Are you sure you want to delete the category "' + name + '"?')) {
        var categories = getStoredCategories().filter(function (c) { return c !== name; });
        saveStoredCategories(categories);

        // Update any custom articles using this deleted category to 'News'
        var customArticles = getCustomArticles();
        var modified = false;
        customArticles.forEach(function (a) {
          if (a.category === name) {
            a.category = 'News';
            modified = true;
          }
        });
        if (modified) saveCustomArticles(customArticles);

        this.renderCategoryDropdown();
        this.renderCategoryManagerList();
        this.renderArticlesList();

        if (typeof window.loadArticlesData === 'function') window.loadArticlesData();
        if (typeof window.renderCategories === 'function') window.renderCategories();
        if (typeof window.renderNavCategories === 'function') window.renderNavCategories();
      }
    },

    savedRange: null,

    saveSelection: function () {
      try {
        var sel = window.getSelection();
        if (sel && sel.getRangeAt && sel.rangeCount > 0) {
          // Clone the range so it stays valid after the editor loses focus
          this.savedRange = sel.getRangeAt(0).cloneRange();
        }
      } catch (e) {}
    },

    restoreSelection: function () {
      if (this.savedRange) {
        try {
          var sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(this.savedRange);
        } catch (e) {}
      }
    },

    /* ------------------------------------------------------------------
       insertHTMLAtCursor
       Inserts an HTML string at the saved cursor position inside the
       editor canvas. Falls back to appending at the end if the saved
       range is unavailable or outside the canvas.
       ------------------------------------------------------------------ */
    insertHTMLAtCursor: function (html) {
      if (!this.editorCanvas) return;
      this.editorCanvas.focus();

      var inserted = false;

      // Primary: use saved cloned range for reliable cursor-position insert
      if (this.savedRange && this.editorCanvas.contains(this.savedRange.commonAncestorContainer)) {
        try {
          var sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(this.savedRange);
          document.execCommand('insertHTML', false, html);
          inserted = true;
        } catch (e) { inserted = false; }
      }

      // Secondary: live selection inside canvas
      if (!inserted) {
        try {
          var sel2 = window.getSelection();
          if (sel2 && sel2.rangeCount > 0) {
            var r = sel2.getRangeAt(0);
            if (this.editorCanvas.contains(r.commonAncestorContainer)) {
              document.execCommand('insertHTML', false, html);
              inserted = true;
            }
          }
        } catch (e2) { inserted = false; }
      }

      // Final fallback: use Range API to insert at end of canvas
      if (!inserted) {
        try {
          var frag = document.createElement('div');
          frag.innerHTML = html;
          var range = document.createRange();
          range.selectNodeContents(this.editorCanvas);
          range.collapse(false); // collapse to end
          while (frag.firstChild) {
            range.insertNode(frag.firstChild);
            range.collapse(false);
          }
        } catch (e3) {
          this.editorCanvas.innerHTML += html;
        }
      }

      this.savedRange = null;
    },

    /* --- Single Resizable Image & Photo Grid Modals --- */
    openSingleImageModal: function () {
      this.saveSelection();
      var modal = document.getElementById('pub-single-img-modal');
      if (modal) modal.classList.add('active');
    },

    closeSingleImageModal: function () {
      var modal = document.getElementById('pub-single-img-modal');
      if (modal) modal.classList.remove('active');
    },

    openPhotoGridModal: function () {
      this.saveSelection();
      var modal = document.getElementById('pub-photo-grid-modal');
      var list = document.getElementById('pub-grid-photos-list');
      if (list && list.children.length === 0) {
        this.addGridPhotoSlot('./assets/images/articles/gallery-1.jpg');
        this.addGridPhotoSlot('./assets/images/articles/gallery-2.jpg');
      }
      if (modal) modal.classList.add('active');
    },

    closePhotoGridModal: function () {
      var modal = document.getElementById('pub-photo-grid-modal');
      if (modal) modal.classList.remove('active');
    },

    addGridPhotoSlot: function (defaultUrl) {
      var list = document.getElementById('pub-grid-photos-list');
      if (!list) return;
      var slotId = 'grid-slot-' + Math.random().toString(36).substr(2, 9);
      var row = document.createElement('div');
      row.className = 'grid-photo-slot';
      row.id = slotId;
      row.style.cssText = 'display:flex; gap:0.75rem; align-items:center; background:rgba(5,11,26,0.6); padding:0.65rem 0.85rem; border-radius:10px; border:1px solid var(--border-navy);';

      var urlVal = typeof defaultUrl === 'string' ? defaultUrl : '';

      row.innerHTML =
        '<div style="width:52px; height:52px; min-width:52px; border-radius:8px; overflow:hidden; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); display:flex; align-items:center; justify-content:center;">' +
          '<img class="grid-slot-thumb" src="' + (urlVal || './assets/images/articles/gallery-1.jpg') + '" style="width:100%; height:100%; object-fit:cover; display:' + (urlVal ? 'block' : 'none') + ';" />' +
          '<span class="grid-slot-placeholder" style="font-size:1.2rem; color:var(--text-subtle); display:' + (urlVal ? 'none' : 'block') + ';">🖼️</span>' +
        '</div>' +
        '<div style="flex:1; display:flex; flex-direction:column; gap:0.35rem;">' +
          '<input type="text" class="form-input grid-slot-url" placeholder="Image URL (Cloudinary or web link)..." value="' + urlVal + '" style="padding:0.4rem 0.65rem; font-size:0.85rem;" />' +
          '<div style="display:flex; align-items:center; gap:0.5rem;">' +
            '<label class="toolbar-btn" style="font-size:0.75rem; padding:0.2rem 0.5rem; cursor:pointer; margin:0; display:inline-flex; align-items:center; gap:0.25rem;">' +
              '📁 Upload File <input type="file" accept="image/*" class="grid-slot-file" style="display:none;" />' +
            '</label>' +
            '<span style="font-size:0.72rem; color:var(--text-subtle);">Direct image file or paste link</span>' +
          '</div>' +
        '</div>' +
        '<button type="button" class="toolbar-btn" style="color:#ff6b8a; border-color:rgba(255,107,138,0.3); padding:0.4rem 0.6rem;" title="Remove this photo">🗑</button>';

      var urlInput = row.querySelector('.grid-slot-url');
      var fileInput = row.querySelector('.grid-slot-file');
      var thumbImg = row.querySelector('.grid-slot-thumb');
      var placeholder = row.querySelector('.grid-slot-placeholder');
      var delBtn = row.querySelector('button');

      urlInput.addEventListener('input', function () {
        var v = urlInput.value.trim();
        if (v) {
          thumbImg.src = v;
          thumbImg.style.display = 'block';
          placeholder.style.display = 'none';
        } else {
          thumbImg.style.display = 'none';
          placeholder.style.display = 'block';
        }
      });

      fileInput.addEventListener('change', function (e) {
        var file = e.target.files && e.target.files[0];
        if (!file) return;
        compressImageFile(file, 1400, 0.82, function (dataUrl) {
          if (!dataUrl) return;
          urlInput.value = dataUrl;
          thumbImg.src = dataUrl;
          thumbImg.style.display = 'block';
          placeholder.style.display = 'none';
        });
      });

      delBtn.addEventListener('click', function () {
        row.remove();
      });

      list.appendChild(row);
    },

    /* --- Apple Vision Pro AR Photo Gallery Engine --- */
    openVisionProGalleryModal: function () {
      this.saveSelection();
      var modal = document.getElementById('pub-vision-pro-gallery-modal');
      var list = document.getElementById('pub-vp-photos-list');

      // If empty on first open, seed sample slots for immediate preview
      if (list && list.children.length === 0) {
        var sampleUrls = [
          'https://res.cloudinary.com/io18jc16/image/upload/v1788338619/123.jpg',
          'https://res.cloudinary.com/io18jc16/image/upload/v1788099045/BSCS_CAPSU_iConnect_Pubmat_18.webp',
          'https://res.cloudinary.com/io18jc16/image/upload/v1788099045/BSCS_CAPSU_iConnect_Pubmat_19.webp',
          'https://res.cloudinary.com/io18jc16/image/upload/v1788099045/BSCS_CAPSU_iConnect_Pubmat_20.webp',
          'https://res.cloudinary.com/io18jc16/image/upload/v1788099045/BSCS_CAPSU_iConnect_Pubmat_21.webp'
        ];
        var sampleDates = ['12/2/23', '12/2/23', '12/3/23', '12/3/23', '12/4/23'];
        var self = this;
        sampleUrls.forEach(function (url, idx) {
          self.addVisionProSlot(url, sampleDates[idx] || '12/2/23', '');
        });
      }

      this.updateVisionProPreview();
      if (modal) modal.classList.add('active');
    },

    closeVisionProGalleryModal: function () {
      var modal = document.getElementById('pub-vision-pro-gallery-modal');
      if (modal) modal.classList.remove('active');
    },

    addVisionProSlot: function (defaultUrl, defaultTag, defaultCaption) {
      var list = document.getElementById('pub-vp-photos-list');
      if (!list) return;
      var self = this;
      var slotId = 'vp-slot-' + Math.random().toString(36).substr(2, 9);
      var row = document.createElement('div');
      row.className = 'vp-photo-slot';
      row.id = slotId;
      row.style.cssText = 'display:flex; gap:0.65rem; align-items:center; background:rgba(5,11,26,0.7); padding:0.55rem 0.75rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1);';

      var urlVal = typeof defaultUrl === 'string' ? defaultUrl : '';
      var tagVal = typeof defaultTag === 'string' ? defaultTag : ((document.getElementById('vp-default-tag') && document.getElementById('vp-default-tag').value.trim()) || '');
      var capVal = typeof defaultCaption === 'string' ? defaultCaption : '';

      row.innerHTML =
        '<div style="width:48px; height:48px; min-width:48px; border-radius:10px; overflow:hidden; background:rgba(0,0,0,0.5); border:1px solid rgba(255,255,255,0.15); display:flex; align-items:center; justify-content:center; flex-shrink:0;">' +
          '<img class="vp-slot-thumb" src="' + (urlVal || '/assets/images/articles/gallery-1.jpg') + '" style="width:100%; height:100%; object-fit:cover; display:' + (urlVal ? 'block' : 'none') + ';" />' +
          '<span class="vp-slot-placeholder" style="font-size:1.1rem; color:var(--text-subtle); display:' + (urlVal ? 'none' : 'block') + ';">🥽</span>' +
        '</div>' +
        '<div style="flex:2; min-width:140px;">' +
          '<input type="text" class="form-input vp-slot-url" placeholder="Photo URL (Cloudinary / Web URL)..." value="' + urlVal + '" style="padding:0.35rem 0.6rem; font-size:0.82rem;" />' +
        '</div>' +
        '<div style="width:100px; flex-shrink:0;">' +
          '<input type="text" class="form-input vp-slot-tag" placeholder="Date / Tag" value="' + tagVal + '" title="Tag / Date stamp (e.g. 12/2/23)" style="padding:0.35rem 0.5rem; font-size:0.8rem; font-family:var(--font-mono); text-align:center;" />' +
        '</div>' +
        '<div style="flex:1.5; min-width:110px;">' +
          '<input type="text" class="form-input vp-slot-caption" placeholder="Caption (optional)" value="' + capVal + '" style="padding:0.35rem 0.55rem; font-size:0.82rem;" />' +
        '</div>' +
        '<label class="toolbar-btn" style="font-size:0.75rem; padding:0.35rem 0.55rem; cursor:pointer; margin:0; flex-shrink:0;" title="Upload local photo file">' +
          '📁<input type="file" accept="image/*" class="vp-slot-file" style="display:none;" />' +
        '</label>' +
        '<button type="button" class="toolbar-btn vp-slot-del-btn" style="color:#ff6b8a; border-color:rgba(255,107,138,0.3); padding:0.35rem 0.55rem; flex-shrink:0;" title="Remove this photo">🗑</button>';

      var urlInput = row.querySelector('.vp-slot-url');
      var tagInput = row.querySelector('.vp-slot-tag');
      var capInput = row.querySelector('.vp-slot-caption');
      var fileInput = row.querySelector('.vp-slot-file');
      var thumbImg = row.querySelector('.vp-slot-thumb');
      var placeholder = row.querySelector('.vp-slot-placeholder');
      var delBtn = row.querySelector('.vp-slot-del-btn');

      var triggerUpdate = function () {
        var v = urlInput.value.trim();
        if (v) {
          thumbImg.src = v;
          thumbImg.style.display = 'block';
          placeholder.style.display = 'none';
        } else {
          thumbImg.style.display = 'none';
          placeholder.style.display = 'block';
        }
        self.updateVisionProPreview();
      };

      urlInput.addEventListener('input', triggerUpdate);
      tagInput.addEventListener('input', triggerUpdate);
      capInput.addEventListener('input', triggerUpdate);

      fileInput.addEventListener('change', function (e) {
        var file = e.target.files && e.target.files[0];
        if (!file) return;
        compressImageFile(file, 1600, 0.85, function (dataUrl) {
          if (!dataUrl) return;
          urlInput.value = dataUrl;
          thumbImg.src = dataUrl;
          thumbImg.style.display = 'block';
          placeholder.style.display = 'none';
          self.updateVisionProPreview();
        });
      });

      delBtn.addEventListener('click', function () {
        row.remove();
        self.updateVisionProPreview();
      });

      list.appendChild(row);
      this.updateVisionProPreview();
    },

    handleBatchVisionProFiles: function (files) {
      if (!files || files.length === 0) return;
      var self = this;
      var defaultTag = (document.getElementById('vp-default-tag') && document.getElementById('vp-default-tag').value.trim()) || '';
      var fileArray = Array.prototype.slice.call(files);

      fileArray.forEach(function (file, index) {
        compressImageFile(file, 1600, 0.85, function (dataUrl) {
          if (!dataUrl) return;
          var tag = defaultTag || (new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' }));
          self.addVisionProSlot(dataUrl, tag, '');
        });
      });
    },

    handleBatchVisionProUrls: function () {
      var textarea = document.getElementById('vp-batch-urls-input');
      if (!textarea) return;
      var raw = textarea.value.trim();
      if (!raw) return;

      var urls = raw.split(/[\n,]+/).map(function (u) { return u.trim(); }).filter(Boolean);
      var defaultTag = (document.getElementById('vp-default-tag') && document.getElementById('vp-default-tag').value.trim()) || '';
      var self = this;

      urls.forEach(function (url) {
        var tag = defaultTag || (new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' }));
        self.addVisionProSlot(url, tag, '');
      });

      textarea.value = '';
    },

    applyDefaultTagToAll: function (tag) {
      var list = document.getElementById('pub-vp-photos-list');
      if (!list) return;
      var tagInputs = list.querySelectorAll('.vp-slot-tag');
      tagInputs.forEach(function (inp) {
        inp.value = tag;
      });
      this.updateVisionProPreview();
    },

    clearAllVisionProSlots: function () {
      var list = document.getElementById('pub-vp-photos-list');
      if (list) list.innerHTML = '';
      this.updateVisionProPreview();
    },

    updateVisionProPreview: function () {
      var previewContainer = document.getElementById('vp-modal-live-preview');
      var counterEl = document.getElementById('vp-slot-counter');
      if (!previewContainer) return;

      var list = document.getElementById('pub-vp-photos-list');
      var slots = list ? list.querySelectorAll('.vp-photo-slot') : [];
      var photos = [];

      slots.forEach(function (slot) {
        var urlInp = slot.querySelector('.vp-slot-url');
        var tagInp = slot.querySelector('.vp-slot-tag');
        var capInp = slot.querySelector('.vp-slot-caption');
        var u = urlInp ? urlInp.value.trim() : '';
        if (u) {
          photos.push({
            url: u,
            tag: tagInp ? tagInp.value.trim() : '',
            caption: capInp ? capInp.value.trim() : ''
          });
        }
      });

      if (counterEl) {
        counterEl.textContent = '(' + photos.length + ' photo' + (photos.length === 1 ? '' : 's') + ')';
      }

      var title = (document.getElementById('vp-gallery-title') && document.getElementById('vp-gallery-title').value.trim()) || '';
      var subtitle = (document.getElementById('vp-gallery-subtitle') && document.getElementById('vp-gallery-subtitle').value.trim()) || '';
      var cols = (document.getElementById('vp-gallery-cols') && document.getElementById('vp-gallery-cols').value) || 'cols-5';

      if (photos.length === 0) {
        previewContainer.innerHTML = '<div style="text-align:center; padding:2rem; color:var(--text-subtle); font-family:var(--font-mono); font-size:0.85rem;">No photos added yet. Upload files or paste URLs above to preview spatial gallery.</div>';
        return;
      }

      var headerHTML = (title || subtitle) ? (
        '<div class="vision-pro-header">' +
          '<div class="vision-pro-title-wrap">' +
            (title ? '<h3 class="vision-pro-title">🥽 ' + title + '</h3>' : '') +
            (subtitle ? '<p class="vision-pro-subtitle">' + subtitle + '</p>' : '') +
          '</div>' +
          '<div class="vision-pro-count-badge">' + photos.length + ' Photos</div>' +
        '</div>'
      ) : '';

      var gridCardsHTML = photos.map(function (p) {
        var tagHTML = p.tag ? '<span class="vision-pro-date-pill">' + p.tag + '</span>' : '';
        var capHTML = p.caption ? '<div class="vision-pro-caption-overlay">' + p.caption + '</div>' : '';
        return (
          '<div class="vision-pro-card" title="Click to zoom photo">' +
            tagHTML +
            '<img src="' + p.url + '" alt="' + (p.caption || 'Gallery photo') + '" class="vision-pro-card-img" />' +
            capHTML +
          '</div>'
        );
      }).join('');

      previewContainer.innerHTML =
        '<div class="vision-pro-gallery-container" style="margin:0 auto;">' +
          '<div class="vision-pro-window">' +
            headerHTML +
            '<div class="vision-pro-grid ' + cols + '">' +
              gridCardsHTML +
            '</div>' +
            '<div class="vision-pro-bottom-capsule">' +
              '<button type="button" class="vision-pro-capsule-btn" title="Open Full-Screen Immersive Lightbox">' +
                '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>' +
                '<span>Immersive View</span> ↗' +
              '</button>' +
            '</div>' +
            '<div class="vision-pro-hint-text">' +
              '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="vision-pro-hint-icon"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>' +
              '<em>Click any photo to view in high resolution</em>' +
            '</div>' +
          '</div>' +
        '</div>';
    },

    insertVisionProGallery: function () {
      var list = document.getElementById('pub-vp-photos-list');
      var slots = list ? list.querySelectorAll('.vp-photo-slot') : [];
      var photos = [];

      slots.forEach(function (slot) {
        var urlInp = slot.querySelector('.vp-slot-url');
        var tagInp = slot.querySelector('.vp-slot-tag');
        var capInp = slot.querySelector('.vp-slot-caption');
        var u = urlInp ? urlInp.value.trim() : '';
        if (u) {
          photos.push({
            url: u,
            tag: tagInp ? tagInp.value.trim() : '',
            caption: capInp ? capInp.value.trim() : ''
          });
        }
      });

      if (photos.length === 0) {
        alert('Please add at least one photo before inserting the Gallery.');
        return;
      }

      var title = (document.getElementById('vp-gallery-title') && document.getElementById('vp-gallery-title').value.trim()) || '';
      var subtitle = (document.getElementById('vp-gallery-subtitle') && document.getElementById('vp-gallery-subtitle').value.trim()) || '';
      var cols = (document.getElementById('vp-gallery-cols') && document.getElementById('vp-gallery-cols').value) || 'cols-5';

      var headerHTML = (title || subtitle) ? (
        '<div class="vision-pro-header">' +
          '<div class="vision-pro-title-wrap">' +
            (title ? '<h3 class="vision-pro-title">🥽 ' + title + '</h3>' : '') +
            (subtitle ? '<p class="vision-pro-subtitle">' + subtitle + '</p>' : '') +
          '</div>' +
          '<div class="vision-pro-count-badge">' + photos.length + ' Photos</div>' +
        '</div>'
      ) : '';

      var gridCardsHTML = photos.map(function (p) {
        var tagHTML = p.tag ? '<span class="vision-pro-date-pill">' + p.tag + '</span>' : '';
        var capHTML = p.caption ? '<div class="vision-pro-caption-overlay">' + p.caption + '</div>' : '';
        return (
          '<div class="vision-pro-card" title="Click to zoom photo">' +
            tagHTML +
            '<img src="' + p.url + '" alt="' + (p.caption || 'Gallery photo') + '" class="vision-pro-card-img" />' +
            capHTML +
          '</div>'
        );
      }).join('');

      var galleryHTML =
        '<div class="vision-pro-gallery-container">' +
          '<div class="vision-pro-window" style="position:relative;">' +
            '<button type="button" class="pub-gallery-remove-btn" title="Remove this Gallery from story" onclick="this.closest(\'.vision-pro-gallery-container\').remove(); if(window.PublisherApp){PublisherApp.updateWordCount(); PublisherApp.autoSaveDraft();}">✕</button>' +
            headerHTML +
            '<div class="vision-pro-grid ' + cols + '">' +
              gridCardsHTML +
            '</div>' +
            '<div class="vision-pro-bottom-capsule">' +
              '<button type="button" class="vision-pro-capsule-btn" title="Open Full-Screen Immersive Lightbox">' +
                '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>' +
                '<span>Immersive View</span> ↗' +
              '</button>' +
            '</div>' +
            '<div class="vision-pro-hint-text">' +
              '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="vision-pro-hint-icon"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>' +
              '<em>Click any photo to view in high resolution</em>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<p><br></p>';

      this.closeVisionProGalleryModal();

      if (this.currentMode === 'visual') {
        this.insertHTMLAtCursor(galleryHTML);
      } else if (this.htmlEditor) {
        this.htmlEditor.value += '\n' + galleryHTML;
      }

      this.updateWordCount();
      this.autoSaveDraft();
    },

    /* --- Video Insertion Engine (Upload File & URL / YouTube) --- */
    /* --- Video Insertion Engine (YouTube, Vimeo, MP4 File Upload) --- */
    currentVideoTab: 'yt',

    switchVideoTab: function (tab) {
      this.currentVideoTab = tab;
      var ytBtn = document.getElementById('v-tab-yt-btn');
      var urlBtn = document.getElementById('v-tab-url-btn');
      var uploadBtn = document.getElementById('v-tab-upload-btn');
      var ytPanel = document.getElementById('v-panel-yt');
      var urlPanel = document.getElementById('v-panel-url');
      var uploadPanel = document.getElementById('v-panel-upload');

      if (ytBtn) ytBtn.classList.toggle('active', tab === 'yt');
      if (urlBtn) urlBtn.classList.toggle('active', tab === 'url');
      if (uploadBtn) uploadBtn.classList.toggle('active', tab === 'upload');

      if (ytPanel) ytPanel.style.display = tab === 'yt' ? 'block' : 'none';
      if (urlPanel) urlPanel.style.display = tab === 'url' ? 'block' : 'none';
      if (uploadPanel) uploadPanel.style.display = tab === 'upload' ? 'block' : 'none';
    },

    openVideoModal: function () {
      this.saveSelection();
      var modal = document.getElementById('pub-video-modal');
      if (modal) modal.classList.add('active');
    },

    closeVideoModal: function () {
      var modal = document.getElementById('pub-video-modal');
      if (modal) modal.classList.remove('active');
    },

    currentVideoId: null,

    onYouTubeUrlInput: function (val) {
      var statusEl = document.getElementById('yt-validation-status');
      var previewContainer = document.getElementById('yt-preview-container');
      var previewIframe = document.getElementById('yt-modal-iframe');
      var posterFacade = document.getElementById('yt-poster-facade');
      var posterImg = document.getElementById('yt-poster-img');
      var idBadge = document.getElementById('yt-preview-id-badge');
      var extLink = document.getElementById('yt-preview-external-link');

      var videoId = (typeof window.extractYouTubeId === 'function')
        ? window.extractYouTubeId(val)
        : (val.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|live\/))([\w-]{11})/i) ? val.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|live\/))([\w-]{11})/i)[1] : null);

      this.currentVideoId = videoId;

      if (videoId) {
        if (statusEl) {
          statusEl.style.display = 'block';
          statusEl.style.color = '#10b981';
          statusEl.innerHTML = '✓ Valid YouTube Video (ID: <strong>' + videoId + '</strong>)';
        }
        if (previewContainer) previewContainer.style.display = 'block';
        if (idBadge) idBadge.textContent = 'ID: ' + videoId;
        if (extLink) extLink.href = 'https://www.youtube.com/watch?v=' + videoId;

        // Show poster facade by default
        if (posterImg) posterImg.src = 'https://img.youtube.com/vi/' + videoId + '/hqdefault.jpg';
        if (posterFacade) posterFacade.style.display = 'block';
        if (previewIframe) {
          previewIframe.style.display = 'none';
          previewIframe.src = '';
        }
      } else if (val && val.trim().length > 3) {
        if (statusEl) {
          statusEl.style.display = 'block';
          statusEl.style.color = 'var(--cheddar-yellow, #f4b41a)';
          statusEl.innerHTML = '⚠️ Invalid YouTube URL. Please paste a valid YouTube video link (e.g. youtube.com/watch?v=... or youtu.be/...)';
        }
        if (previewContainer) previewContainer.style.display = 'none';
        if (previewIframe) { previewIframe.style.display = 'none'; previewIframe.src = ''; }
      } else {
        if (statusEl) statusEl.style.display = 'none';
        if (previewContainer) previewContainer.style.display = 'none';
        if (previewIframe) { previewIframe.style.display = 'none'; previewIframe.src = ''; }
      }
    },

    activatePreviewPlayer: function () {
      if (!this.currentVideoId) return;
      var posterFacade = document.getElementById('yt-poster-facade');
      var previewIframe = document.getElementById('yt-modal-iframe');

      if (posterFacade) posterFacade.style.display = 'none';
      if (previewIframe) {
        previewIframe.style.display = 'block';
        previewIframe.src = 'https://www.youtube-nocookie.com/embed/' + this.currentVideoId + '?autoplay=1&rel=0';
      }
    },

    buildEditorVideoCard: function (videoId, caption, width) {
      var w = width || '100%';
      var cap = caption || '';
      var encodedCap = encodeURIComponent(cap);
      var captionHTML = cap ? '<div class="article-video-caption" style="font-size:0.88rem; color:var(--text-muted, #94a3b8); margin-top:0.65rem; font-style:italic; text-align:center;">' + cap + '</div>' : '';

      return '<div class="article-video-container pub-editor-video-card" data-video-type="youtube" data-video-id="' + videoId + '" data-video-caption="' + encodedCap + '" data-video-width="' + w + '" contenteditable="false" style="max-width:' + w + '; margin:1.75rem auto; text-align:center; user-select:none; clear:both;">' +
        '<div class="article-video-wrapper" style="position:relative; width:100%; aspect-ratio:16/9; padding-bottom:56.25%; height:0; overflow:hidden; border-radius:16px; border:1px solid rgba(244,180,26,0.35); box-shadow:0 14px 45px rgba(0,0,0,0.6); background:#050b1a;">' +
          '<img src="https://img.youtube.com/vi/' + videoId + '/hqdefault.jpg" alt="YouTube Video Thumbnail" style="position:absolute; top:0; left:0; width:100%; height:100%; object-fit:cover; filter:brightness(0.85);" onerror="this.src=\'./assets/images/articles/gallery-1.jpg\';" />' +
          '<div style="position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; background:rgba(0,0,0,0.4); backdrop-filter:blur(2px);">' +
            '<div style="width:68px; height:48px; background:#ff0000; border-radius:14px; display:flex; align-items:center; justify-content:center; box-shadow:0 8px 25px rgba(255,0,0,0.6);">' +
              '<svg width="24" height="24" viewBox="0 0 24 24" fill="#ffffff"><path d="M8 5v14l11-7z"/></svg>' +
            '</div>' +
            '<span style="margin-top:0.75rem; color:#ffffff; font-family:var(--font-mono); font-size:0.8rem; font-weight:700; background:rgba(5,11,26,0.92); padding:0.3rem 0.85rem; border-radius:999px; border:1px solid rgba(244,180,26,0.4); box-shadow:0 4px 15px rgba(0,0,0,0.5);">' +
              '▶ YouTube Video: youtu.be/' + videoId +
            '</span>' +
            '<div style="margin-top:0.6rem; display:flex; gap:0.5rem;">' +
              '<a href="https://www.youtube.com/watch?v=' + videoId + '" target="_blank" rel="noopener noreferrer" style="color:#00f0ff; text-decoration:none; font-family:var(--font-mono); font-size:0.72rem; background:rgba(0,240,255,0.15); padding:0.25rem 0.65rem; border-radius:6px; border:1px solid rgba(0,240,255,0.3); font-weight:700;">' +
                'Test on YouTube ↗' +
              '</a>' +
              '<button type="button" onclick="this.closest(\'.pub-editor-video-card\').remove(); if(window.PublisherApp) PublisherApp.autoSaveDraft();" style="color:#ff6b8a; font-family:var(--font-mono); font-size:0.72rem; background:rgba(255,107,138,0.15); padding:0.25rem 0.65rem; border-radius:6px; border:1px solid rgba(255,107,138,0.3); font-weight:700; cursor:pointer;">' +
                '✕ Remove' +
              '</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
        captionHTML +
      '</div>';
    },

    insertYouTubeEmbed: function () {
      var urlInput = document.getElementById('yt-url-input');
      var rawUrl = urlInput ? urlInput.value.trim() : '';

      var videoId = (typeof window.extractYouTubeId === 'function')
        ? window.extractYouTubeId(rawUrl)
        : null;

      if (!videoId) {
        alert('Invalid YouTube URL. Please paste a valid YouTube video link (e.g. https://www.youtube.com/watch?v=... or https://youtu.be/...)');
        if (urlInput) urlInput.focus();
        return;
      }

      var width = (document.getElementById('yt-size-select') && document.getElementById('yt-size-select').value) || '100%';
      var caption = (document.getElementById('yt-caption-input') && document.getElementById('yt-caption-input').value.trim()) || '';
      var captionHTML = caption ? '<div class="article-video-caption" style="font-size:0.88rem; color:var(--text-muted, #94a3b8); margin-top:0.65rem; font-style:italic; text-align:center;">' + caption + '</div>' : '';

      this.closeVideoModal();

      if (this.currentMode === 'visual') {
        var visualCardHTML = this.buildEditorVideoCard(videoId, caption, width) + '<p><br></p>';
        if (this.editorCanvas) this.editorCanvas.focus();
        this.restoreSelection();
        try {
          document.execCommand('insertHTML', false, visualCardHTML);
        } catch (e) {
          if (this.editorCanvas) this.editorCanvas.innerHTML += visualCardHTML;
        }
      } else if (this.htmlEditor) {
        var exportEmbedHTML = '<div class="article-video-container" style="max-width:' + width + '; margin:2rem auto; text-align:center; clear:both;">\n' +
          '  <div class="youtube-video-wrapper article-video-wrapper" style="position:relative; width:100%; aspect-ratio:16/9; padding-bottom:56.25%; height:0; overflow:hidden; border-radius:16px; border:1px solid rgba(255,255,255,0.15); box-shadow:0 14px 45px rgba(0,0,0,0.6); background:#000000;">\n' +
          '    <iframe src="https://www.youtube.com/embed/' + videoId + '" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen style="position:absolute; top:0; left:0; width:100%; height:100%; border:none; border-radius:16px;"></iframe>\n' +
          '  </div>\n' +
          (caption ? '  <div class="article-video-caption" style="font-size:0.88rem; color:var(--text-muted, #94a3b8); margin-top:0.65rem; font-style:italic; text-align:center;">' + caption + '</div>\n' : '') +
          '</div>\n<p><br></p>';
        this.htmlEditor.value += '\n' + exportEmbedHTML;
      }

      this.updateWordCount();
      this.autoSaveDraft();
    },

    insertGenericVideoContent: function () {
      var urlInput = document.getElementById('vid-url-input');
      var rawUrl = urlInput ? urlInput.value.trim() : '';
      if (!rawUrl) {
        alert('Please enter a video URL or Vimeo embed link.');
        return;
      }

      var width = (document.getElementById('vid-size-select') && document.getElementById('vid-size-select').value) || '100%';
      var caption = (document.getElementById('vid-caption-input') && document.getElementById('vid-caption-input').value.trim()) || '';
      var controls = document.getElementById('vid-opt-controls') ? document.getElementById('vid-opt-controls').checked : true;
      var autoplay = document.getElementById('vid-opt-autoplay') ? document.getElementById('vid-opt-autoplay').checked : false;

      this.doInsertVideoHTML(rawUrl, 'url', width, controls, autoplay, false, caption);
    },

    insertUploadedVideo: function () {
      var self = this;
      var fileInput = document.getElementById('vid-file-input');
      if (!fileInput || !fileInput.files || !fileInput.files[0]) {
        alert('Please select a local video file (MP4, WebM) to upload.');
        return;
      }
      var caption = (document.getElementById('vid-file-caption-input') && document.getElementById('vid-file-caption-input').value.trim()) || '';

      var file = fileInput.files[0];
      var reader = new FileReader();
      reader.onload = function (e) {
        var videoDataUrl = e.target.result;
        self.doInsertVideoHTML(videoDataUrl, 'file', '100%', true, false, false, caption);
      };
      reader.readAsDataURL(file);
    },

    convertEmbedsForEditor: function (html) {
      if (!html) return '';
      var self = this;
      if (typeof document !== 'undefined' && typeof document.createElement === 'function') {
        try {
          var temp = document.createElement('div');
          temp.innerHTML = html;

          // 1. Replace any raw YouTube iframes with editor cards
          var iframes = temp.querySelectorAll('iframe');
          iframes.forEach(function (iframe) {
            var src = iframe.getAttribute('src') || '';
            var vid = (typeof window.extractYouTubeId === 'function') ? window.extractYouTubeId(src) : null;
            if (vid) {
              var container = iframe.closest('.article-video-container');
              var caption = '';
              var width = '100%';
              if (container) {
                var capEl = container.querySelector('.article-video-caption');
                if (capEl) caption = capEl.textContent.trim();
                width = container.style.maxWidth || '100%';
              }
              var cardHtml = self.buildEditorVideoCard(vid, caption, width);
              var cardWrapper = document.createElement('div');
              cardWrapper.innerHTML = cardHtml;
              var nodeToReplace = container || iframe;
              if (nodeToReplace && nodeToReplace.parentNode) {
                nodeToReplace.parentNode.replaceChild(cardWrapper.firstElementChild, nodeToReplace);
              }
            }
          });

          // 2. Also handle any existing containers that don't have .pub-editor-video-card
          var containers = temp.querySelectorAll('.article-video-container:not(.pub-editor-video-card)');
          containers.forEach(function (container) {
            var vid = (typeof window.extractYouTubeId === 'function') ? window.extractYouTubeId(container.innerHTML) : null;
            if (vid) {
              var caption = '';
              var capEl = container.querySelector('.article-video-caption');
              if (capEl) caption = capEl.textContent.trim();
              var width = container.style.maxWidth || '100%';
              var cardHtml = self.buildEditorVideoCard(vid, caption, width);
              var cardWrapper = document.createElement('div');
              cardWrapper.innerHTML = cardHtml;
              if (container.parentNode) {
                container.parentNode.replaceChild(cardWrapper.firstElementChild, container);
              }
            }
          });

          // 3. Ensure gallery containers in editor canvas have .pub-gallery-remove-btn
          var galContainers = temp.querySelectorAll('.vision-pro-gallery-container');
          galContainers.forEach(function (gc) {
            var win = gc.querySelector('.vision-pro-window') || gc;
            if (!win.querySelector('.pub-gallery-remove-btn')) {
              var remBtn = document.createElement('button');
              remBtn.type = 'button';
              remBtn.className = 'pub-gallery-remove-btn';
              remBtn.title = 'Remove this Gallery from story';
              remBtn.setAttribute('onclick', "this.closest('.vision-pro-gallery-container').remove(); if(window.PublisherApp){PublisherApp.updateWordCount(); PublisherApp.autoSaveDraft();}");
              remBtn.innerHTML = '✕';
              win.insertBefore(remBtn, win.firstChild);
            }
          });

          return temp.innerHTML;
        } catch (e) {
          console.warn('Error converting embeds for editor:', e);
        }
      }
      return html;
    },

    convertEmbedsForExport: function (html) {
      if (!html) return '';
      if (typeof document !== 'undefined' && typeof document.createElement === 'function') {
        try {
          var temp = document.createElement('div');
          temp.innerHTML = html;

          // Strip publisher-only gallery remove buttons
          var removeBtns = temp.querySelectorAll('.pub-gallery-remove-btn');
          removeBtns.forEach(function (btn) { btn.remove(); });

          var editorCards = temp.querySelectorAll('.pub-editor-video-card, [data-video-id]');
          editorCards.forEach(function (card) {
            var videoId = card.getAttribute('data-video-id') || ((typeof window.extractYouTubeId === 'function') ? window.extractYouTubeId(card.innerHTML) : null);
            var caption = card.getAttribute('data-video-caption') || '';
            if (caption && caption.indexOf('%') !== -1) {
              try { caption = decodeURIComponent(caption); } catch (e) {}
            }
            if (!caption) {
              var capEl = card.querySelector('.article-video-caption');
              if (capEl) caption = capEl.textContent.trim();
            }
            var width = card.getAttribute('data-video-width') || card.style.maxWidth || '100%';

            if (videoId) {
              var capHTML = caption ? '<div class="article-video-caption" style="font-size:0.88rem; color:var(--text-muted, #94a3b8); margin-top:0.65rem; font-style:italic; text-align:center;">' + caption + '</div>' : '';
              var embedDiv = document.createElement('div');
              embedDiv.className = 'article-video-container';
              embedDiv.style.maxWidth = width;
              embedDiv.style.margin = '2rem auto';
              embedDiv.style.textAlign = 'center';
              embedDiv.style.clear = 'both';
              embedDiv.innerHTML =
                '<div class="youtube-video-wrapper article-video-wrapper" style="position:relative; width:100%; aspect-ratio:16/9; padding-bottom:56.25%; height:0; overflow:hidden; border-radius:16px; border:1px solid rgba(255,255,255,0.15); box-shadow:0 14px 45px rgba(0,0,0,0.6); background:#000000;">' +
                  '<iframe src="https://www.youtube.com/embed/' + videoId + '" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen style="position:absolute; top:0; left:0; width:100%; height:100%; border:none; border-radius:16px;"></iframe>' +
                '</div>' +
                capHTML;

              card.parentNode.replaceChild(embedDiv, card);
            }
          });

          return temp.innerHTML;
        } catch (e) {
          console.warn('Error converting embeds for export:', e);
        }
      }
      return (typeof window.normalizeYouTubeEmbeds === 'function')
        ? window.normalizeYouTubeEmbeds(html)
        : html;
    },

    doInsertVideoHTML: function (src, type, width, controls, autoplay, loop, caption) {
      var cleanSrc = src.trim();
      var videoEmbedHTML = '';

      // Check if YouTube
      var ytId = (typeof window.extractYouTubeId === 'function') ? window.extractYouTubeId(cleanSrc) : null;
      if (ytId) {
        var captionHTML = caption ? '<div class="article-video-caption" style="font-size:0.88rem; color:var(--text-muted, #94a3b8); margin-top:0.65rem; font-style:italic; text-align:center;">' + caption + '</div>' : '';
        videoEmbedHTML = '<div class="article-video-container" style="max-width:' + width + '; margin:2rem auto; text-align:center; clear:both;">' +
          '<div class="youtube-video-wrapper article-video-wrapper" style="position:relative; width:100%; aspect-ratio:16/9; padding-bottom:56.25%; height:0; overflow:hidden; border-radius:16px; border:1px solid rgba(255,255,255,0.15); box-shadow:0 14px 45px rgba(0,0,0,0.6); background:#000000;">' +
            '<iframe src="https://www.youtube.com/embed/' + ytId + '" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen style="position:absolute; top:0; left:0; width:100%; height:100%; border:none; border-radius:16px;"></iframe>' +
          '</div>' +
          captionHTML +
        '</div>';
      } else {
        // Vimeo or HTML5 video
        var vimeoMatch = cleanSrc.match(/(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)(\d+)/i);
        if (vimeoMatch && vimeoMatch[1]) {
          var vimeoEmbedUrl = 'https://player.vimeo.com/video/' + vimeoMatch[1] + (autoplay ? '?autoplay=1' : '');
          videoEmbedHTML = '<div class="article-video-container" style="max-width:' + width + '; margin:2rem auto; text-align:center; clear:both;">' +
            '<div class="article-video-wrapper" style="position:relative; width:100%; aspect-ratio:16/9; padding-bottom:56.25%; height:0; overflow:hidden; border-radius:16px; border:1px solid rgba(255,255,255,0.15); box-shadow:0 14px 45px rgba(0,0,0,0.6); background:#000;">' +
              '<iframe src="' + vimeoEmbedUrl + '" frameborder="0" loading="lazy" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen style="position:absolute; top:0; left:0; width:100%; height:100%; border:none; border-radius:16px;"></iframe>' +
            '</div>' +
            (caption ? '<div class="article-video-caption" style="font-size:0.88rem; color:#94a3b8; margin-top:0.65rem; font-style:italic; text-align:center;">' + caption + '</div>' : '') +
          '</div>';
        } else {
          var ctrlAttr = controls ? ' controls' : '';
          var autoAttr = autoplay ? ' autoplay muted' : '';
          var loopAttr = loop ? ' loop' : '';
          videoEmbedHTML = '<div class="article-video-container" style="max-width:' + width + '; margin:2rem auto; text-align:center; clear:both;">' +
            '<video src="' + cleanSrc + '"' + ctrlAttr + autoAttr + loopAttr + ' style="width:100%; max-height:520px; border-radius:16px; background:#000; border:1px solid rgba(255,255,255,0.15); box-shadow:0 14px 45px rgba(0,0,0,0.6); display:block; margin:0 auto;"></video>' +
            (caption ? '<div class="article-video-caption" style="font-size:0.88rem; color:#94a3b8; margin-top:0.65rem; font-style:italic; text-align:center;">' + caption + '</div>' : '') +
          '</div>';
        }
      }

      var html = videoEmbedHTML + '<p><br></p>';

      this.closeVideoModal();

      if (this.currentMode === 'visual') {
        if (this.editorCanvas) this.editorCanvas.focus();
        this.restoreSelection();
        try {
          document.execCommand('insertHTML', false, html);
        } catch (e) {
          if (this.editorCanvas) this.editorCanvas.innerHTML += html;
        }
      } else if (this.htmlEditor) {
        this.htmlEditor.value += '\n' + html;
      }

      this.updateWordCount();
      this.autoSaveDraft();
    },

    insertSingleResizedImage: function () {
      var url = (document.getElementById('img-single-url') && document.getElementById('img-single-url').value.trim()) || './assets/images/articles/gallery-1.jpg';
      var size = (document.getElementById('img-single-size') && document.getElementById('img-single-size').value) || '100%';
      var customPx = document.getElementById('img-single-custom-px') ? document.getElementById('img-single-custom-px').value.trim() : '';
      var align = (document.getElementById('img-single-align') && document.getElementById('img-single-align').value) || 'center';
      var caption = (document.getElementById('img-single-caption') && document.getElementById('img-single-caption').value.trim()) || '';

      var widthStyle = customPx ? (customPx + 'px') : size;
      var figureStyle = '';

      if (align === 'left') {
        figureStyle = 'float: left; width:' + widthStyle + '; max-width: 100%; margin: 0.5rem 1.5rem 1.25rem 0; clear: left;';
      } else if (align === 'right') {
        figureStyle = 'float: right; width:' + widthStyle + '; max-width: 100%; margin: 0.5rem 0 1.25rem 1.5rem; clear: right;';
      } else {
        figureStyle = 'display: block; width:' + widthStyle + '; max-width: 100%; margin: 1.75rem auto; text-align: center; clear: both;';
      }

      var html = '<figure class="img-align-' + align + '" style="' + figureStyle + '">' +
        '<img src="' + url + '" alt="' + (caption || 'Article image') + '" style="width:100%; height:auto; display:block; object-fit:contain; border-radius:12px; border:1px solid rgba(255,255,255,0.1);" />' +
        (caption ? '<figcaption style="font-size:.88rem; color:#94a3b8; margin-top:.5rem; font-style:italic; text-align:center;">' + caption + '</figcaption>' : '') +
        '</figure>' + (align === 'center' ? '<div style="clear:both; width:100%; display:block;"></div>' : '') + '<p><br></p>';

      this.closeSingleImageModal();

      if (this.currentMode === 'visual') {
        this.insertHTMLAtCursor(html);
      } else if (this.htmlEditor) {
        this.htmlEditor.value += '\n' + html;
      }

      this.updateWordCount();
      this.autoSaveDraft();
    },

    insertPhotoGrid: function () {
      var gridType = (document.getElementById('img-grid-type') && document.getElementById('img-grid-type').value) || 'grid-cols-2';
      var gridSize = (document.getElementById('img-grid-size') && document.getElementById('img-grid-size').value) || '100%';
      var gridAlign = (document.getElementById('img-grid-align') && document.getElementById('img-grid-align').value) || 'center';
      var caption = (document.getElementById('img-grid-caption') && document.getElementById('img-grid-caption').value.trim()) || '';

      // Collect URLs from dynamic slot list (new system)
      var urls = [];
      var slotList = document.getElementById('pub-grid-photos-list');
      if (slotList) {
        var inputs = slotList.querySelectorAll('.grid-slot-url');
        inputs.forEach(function (inp) {
          var v = inp.value.trim();
          if (v) urls.push(v);
        });
      }

      // Fallback to old fixed-ID inputs if no dynamic slots
      if (urls.length === 0) {
        var u1 = document.getElementById('img-grid-url-1');
        var u2 = document.getElementById('img-grid-url-2');
        var u3 = document.getElementById('img-grid-url-3');
        var u4 = document.getElementById('img-grid-url-4');
        if (u1 && u1.value.trim()) urls.push(u1.value.trim());
        if (u2 && u2.value.trim()) urls.push(u2.value.trim());
        if ((gridType === 'grid-cols-3' || gridType === 'grid-hero-side') && u3 && u3.value.trim()) urls.push(u3.value.trim());
        if (gridType === 'grid-cols-4' && u3 && u3.value.trim()) urls.push(u3.value.trim());
        if (gridType === 'grid-cols-4' && u4 && u4.value.trim()) urls.push(u4.value.trim());
      }

      if (urls.length === 0) {
        alert('Please add at least one photo URL to the grid before inserting.');
        return;
      }

      var gridWrapperStyle = '';
      if (gridAlign === 'left') {
        gridWrapperStyle = 'float: left; width:' + gridSize + '; max-width: 100%; margin: 0.5rem 1.5rem 1.25rem 0; clear: left;';
      } else if (gridAlign === 'right') {
        gridWrapperStyle = 'float: right; width:' + gridSize + '; max-width: 100%; margin: 0.5rem 0 1.25rem 1.5rem; clear: right;';
      } else {
        gridWrapperStyle = 'width:' + gridSize + '; max-width: 100%; margin: 1.75rem auto; clear: both;';
      }

      var gridHTML =
        '<div class="article-photo-grid-wrapper" style="' + gridWrapperStyle + '">' +
          '<div class="article-photo-grid ' + gridType + '">' +
            urls.map(function (u) {
              return '<div style="overflow:hidden;border-radius:12px;"><img src="' + u + '" alt="Photo" class="article-grid-img" style="width:100%;height:100%;object-fit:cover;min-height:180px;max-height:480px;border-radius:12px;" /></div>';
            }).join('') +
          '</div>' +
          (caption ? '<p style="font-size:.88rem;color:#94a3b8;text-align:center;margin-top:.45rem;margin-bottom:0.5rem;font-style:italic;">' + caption + '</p>' : '') +
        '</div>' +
        (gridAlign === 'center' ? '<div style="clear:both; width:100%; display:block;"></div>' : '') +
        '<p><br></p>';

      this.closePhotoGridModal();

      // Clear the slot list so next open starts fresh
      var slotListEl = document.getElementById('pub-grid-photos-list');
      if (slotListEl) slotListEl.innerHTML = '';

      if (this.currentMode === 'visual') {
        this.insertHTMLAtCursor(gridHTML);
      } else if (this.htmlEditor) {
        this.htmlEditor.value += '\n' + gridHTML;
      }

      this.updateWordCount();
      this.autoSaveDraft();
    },

    updateSlug: function () {
      var title = (this.titleInput && this.titleInput.value) || '';
      var slug = generateSlug(title) || 'my-article-story';
      if (this.slugPreview) {
        this.slugPreview.textContent = 'ID / Slug: ' + slug;
      }
      return slug;
    },

    updateWordCount: function () {
      var html = this.getEditorHTML();
      var text = html.replace(/<[^>]*>/g, ' ').trim();
      var words = text.split(/\s+/).filter(Boolean).length;
      if (this.wordCountEl) {
        this.wordCountEl.textContent = words + ' words';
      }
    },

    getCategory: function () {
      if (!this.categoryInput) return 'Technology';
      var val = this.categoryInput.value;
      if (val === 'CUSTOM' || val === '__custom__') {
        return (this.customCatInput && this.customCatInput.value.trim()) || 'General';
      }
      return val || 'Technology';
    },

    getEditorHTML: function () {
      if (this.currentMode === 'html' && this.htmlEditor) {
        return this.htmlEditor.value;
      }
      var rawHtml = (this.editorCanvas && this.editorCanvas.innerHTML) || '';
      return this.convertEmbedsForExport(rawHtml);
    },

    setEditorHTML: function (html) {
      if (this.editorCanvas) this.editorCanvas.innerHTML = this.convertEmbedsForEditor(html);
      if (this.htmlEditor) this.htmlEditor.value = this.convertEmbedsForExport(html);
    },

    toggleMode: function () {
      if (this.currentMode === 'visual') {
        var rawHtml = (this.editorCanvas && this.editorCanvas.innerHTML) || '';
        var exportHtml = this.convertEmbedsForExport(rawHtml);
        if (this.htmlEditor) this.htmlEditor.value = exportHtml;
        if (this.editorCanvas) this.editorCanvas.style.display = 'none';
        if (this.htmlEditor) this.htmlEditor.style.display = 'block';
        if (this.modeToggleBtn) this.modeToggleBtn.textContent = '👁 Visual Mode';
        this.currentMode = 'html';
      } else {
        var code = (this.htmlEditor && this.htmlEditor.value) || '';
        var editorHtml = this.convertEmbedsForEditor(code);
        if (this.editorCanvas) this.editorCanvas.innerHTML = editorHtml;
        if (this.htmlEditor) this.htmlEditor.style.display = 'none';
        if (this.editorCanvas) this.editorCanvas.style.display = 'block';
        if (this.modeToggleBtn) this.modeToggleBtn.textContent = '</> HTML Code Mode';
        this.currentMode = 'visual';
      }
    },

    execCommand: function (cmd, value) {
      if (this.currentMode === 'html') return;
      document.execCommand(cmd, false, value || null);
      if (this.editorCanvas) this.editorCanvas.focus();
      this.updateWordCount();
      this.autoSaveDraft();
    },

    changeFontColor: function (color) {
      if (this.currentMode === 'html') return;
      document.execCommand('foreColor', false, color);
      if (this.editorCanvas) this.editorCanvas.focus();
      this.updateWordCount();
      this.autoSaveDraft();
    },

    clearFormatting: function () {
      if (this.currentMode === 'html') return;
      document.execCommand('removeFormat', false, null);
      document.execCommand('unlink', false, null);

      var sel = window.getSelection();
      if (sel && !sel.isCollapsed) {
        try {
          var range = sel.getRangeAt(0);
          var container = range.commonAncestorContainer;
          if (container.nodeType === 3) container = container.parentNode;
          if (container && container !== this.editorCanvas) {
            container.removeAttribute('style');
            container.removeAttribute('color');
            container.removeAttribute('align');
          }
        } catch (e) {}
      } else if (this.editorCanvas) {
        var styledElements = this.editorCanvas.querySelectorAll('[style], [color], [align]');
        styledElements.forEach(function (el) {
          if (!el.classList.contains('article-photo-grid') && !el.classList.contains('article-grid-img')) {
            el.removeAttribute('style');
            el.removeAttribute('color');
            el.removeAttribute('align');
          }
        });
      }

      if (this.editorCanvas) this.editorCanvas.focus();
      this.updateWordCount();
      this.autoSaveDraft();
    },

    insertHeading: function (tag) {
      if (this.currentMode === 'html') return;
      document.execCommand('formatBlock', false, '<' + tag + '>');
      if (this.editorCanvas) this.editorCanvas.focus();
    },

    insertQuote: function () {
      if (this.currentMode === 'html') return;
      var sel = window.getSelection().toString() || 'Enter callout quote here...';
      document.execCommand('insertHTML', false, '<blockquote>"' + sel + '"</blockquote>');
    },

    insertLink: function () {
      var url = prompt('Enter URL link:', 'https://');
      if (url) {
        document.execCommand('createLink', false, url);
      }
    },

    insertDivider: function () {
      document.execCommand('insertHTML', false, '<hr style="border:none; border-top:1px solid rgba(255,255,255,0.1); margin:2.5rem 0;" /><p></p>');
    },

    /* Build Article Object from Form */
    buildArticleObject: function () {
      var title    = (this.titleInput    && this.titleInput.value.trim())    || 'Untitled Article';
      var slug     = this.updateSlug();
      var category = this.getCategory();
      var featured = !!(this.featuredCheck && this.featuredCheck.checked);

      var showAuthor   = !this.showAuthorCheck   || this.showAuthorCheck.checked;
      var showRole     = !this.showRoleCheck     || this.showRoleCheck.checked;
      var showDate     = !this.showDateCheck     || this.showDateCheck.checked;
      var showReadTime = !this.showReadTimeCheck || this.showReadTimeCheck.checked;

      // Respect toggles & typed values
      var author   = (showAuthor && this.authorInput)   ? this.authorInput.value.trim()   : '';
      var authorIcon = (this.authorIconInput && this.authorIconInput.value) || 'quill';
      var role     = (showRole && this.roleInput)     ? this.roleInput.value.trim()     : '';
      var date     = (showDate && this.dateInput)     ? this.dateInput.value.trim()     : '';
      var readTime = (showReadTime && this.readTimeInput) ? this.readTimeInput.value.trim() : '';
      var image       = (this.imageUrlInput  && this.imageUrlInput.value.trim())  || './assets/images/articles/gallery-1.jpg';
      var featurePhoto= (this.featurePhotoInput && this.featurePhotoInput.value.trim()) || '';
      var excerpt     = (this.excerptInput  && this.excerptInput.value.trim())    || '';
      var content     = this.getEditorHTML() || '<p>Write your story here...</p>';
      var customRoles = this.getCustomRoles ? this.getCustomRoles() : [];

      var obj = {
        id: slug,
        title: title,
        category: category,
        featured: featured,
        author: author,
        authorIcon: authorIcon,
        role: role,
        roles: customRoles,
        date: date,
        readTime: readTime,
        showAuthor: showAuthor,
        showRole: showRole,
        showDate: showDate,
        showReadTime: showReadTime,
        image: image,
        excerpt: excerpt,
        content: content,
        publishedAt: new Date().toISOString()
      };
      // Only include featurePhoto if featured and a value was entered
      if (featured && featurePhoto) obj.featurePhoto = featurePhoto;
      return obj;
    },

    /* Show/hide feature photo group based on featured toggle */
    onFeaturedToggle: function (checked) {
      if (this.featurePhotoGroup) {
        this.featurePhotoGroup.style.display = checked ? 'block' : 'none';
      }
      this.autoSaveDraft();
    },

    /* --- Auto-Save & Load Draft --- */
    autoSaveDraft: function () {
      try {
        var article = this.buildArticleObject();
        localStorage.setItem(DRAFT_KEY, JSON.stringify(article));
      } catch (e) {}
    },

    loadDraft: function () {
      try {
        var draft = JSON.parse(localStorage.getItem(DRAFT_KEY));
        if (draft && (draft.title || draft.content)) {
          this.fillFormWithArticle(draft);
        }
      } catch (e) {}
    },

    clearForm: function () {
      if (confirm('Clear the current editor canvas and start a new story?')) {
        if (this.titleInput) this.titleInput.value = '';
        if (this.excerptInput) this.excerptInput.value = '';
        if (this.imageUrlInput) this.imageUrlInput.value = '';
        if (this.featurePhotoInput) this.featurePhotoInput.value = '';
        if (this.featurePhotoPreview) this.featurePhotoPreview.style.display = 'none';
        if (this.featurePhotoGroup) this.featurePhotoGroup.style.display = 'none';
        this.setEditorHTML('');
        if (this.featuredCheck) this.featuredCheck.checked = false;
        if (this.showAuthorCheck) this.showAuthorCheck.checked = true;
        if (this.showRoleCheck) this.showRoleCheck.checked = true;
        if (this.showDateCheck) this.showDateCheck.checked = true;
        if (this.showReadTimeCheck) this.showReadTimeCheck.checked = true;
        if (this.authorIconInput) this.authorIconInput.value = 'quill';
        this.setCustomRoles([]);
        this.initDefaultValues();
        localStorage.removeItem(DRAFT_KEY);
      }
    },

    fillFormWithArticle: function (article) {
      if (this.titleInput) this.titleInput.value = article.title || '';
      if (this.authorInput) this.authorInput.value = article.author || '';
      if (this.authorIconInput) this.authorIconInput.value = article.authorIcon || 'quill';
      if (this.roleInput) this.roleInput.value = article.role || '';
      if (this.dateInput) this.dateInput.value = article.date || '';
      if (this.readTimeInput) this.readTimeInput.value = article.readTime || '';

      if (this.showAuthorCheck) this.showAuthorCheck.checked = article.showAuthor !== false;
      if (this.showRoleCheck) this.showRoleCheck.checked = article.showRole !== false;
      if (this.showDateCheck) this.showDateCheck.checked = article.showDate !== false;
      if (this.showReadTimeCheck) this.showReadTimeCheck.checked = article.showReadTime !== false;
      if (this.imageUrlInput) this.imageUrlInput.value = article.image || '';
      if (this.imagePreview) this.imagePreview.src = article.image || './assets/images/articles/gallery-1.jpg';
      if (this.excerptInput) this.excerptInput.value = article.excerpt || '';
      if (this.featuredCheck) this.featuredCheck.checked = !!article.featured;

      // Load custom additional roles
      this.setCustomRoles(article.roles || article.contributors || []);

      // Feature Photo
      var fp = article.featurePhoto || '';
      if (this.featurePhotoInput) this.featurePhotoInput.value = fp;
      if (this.featurePhotoPreview) {
        if (fp) { this.featurePhotoPreview.src = fp; this.featurePhotoPreview.style.display = 'block'; }
        else { this.featurePhotoPreview.style.display = 'none'; }
      }
      // Show feature photo section if article is featured
      if (this.featurePhotoGroup) {
        this.featurePhotoGroup.style.display = !!article.featured ? 'block' : 'none';
      }

      if (this.categoryInput) {
        var targetCat = (article.category || '').trim();
        var options = Array.from(this.categoryInput.options).map(function (o) { return o.value.toLowerCase(); });
        var matchIdx = options.indexOf(targetCat.toLowerCase());
        if (matchIdx !== -1 && this.categoryInput.options[matchIdx].value !== 'CUSTOM' && this.categoryInput.options[matchIdx].value !== '__custom__') {
          this.categoryInput.selectedIndex = matchIdx;
          if (this.customCatGroup) this.customCatGroup.style.display = 'none';
        } else if (targetCat) {
          this.categoryInput.value = 'CUSTOM';
          if (this.customCatGroup) this.customCatGroup.style.display = 'block';
          if (this.customCatInput) this.customCatInput.value = targetCat;
        } else {
          this.categoryInput.selectedIndex = 0;
          if (this.customCatGroup) this.customCatGroup.style.display = 'none';
        }
      }

      this.setEditorHTML(article.content || '');
      this.updateSlug();
      this.updateWordCount();
      this.updateLiveCardPreview();
    },

    /* --- Publish Flow --- */
    publishLive: function () {
      var title = this.titleInput ? this.titleInput.value.trim() : '';
      if (!title) {
        alert('⚠️ Please provide an Article Title before publishing.');
        if (this.titleInput) this.titleInput.focus();
        return;
      }

      var article = this.buildArticleObject();

      // 1. Save to custom published articles list (localStorage)
      var customArticles = getCustomArticles();

      // Check if updating an existing article with same id
      var existingIndex = customArticles.findIndex(function (a) { return a.id === article.id; });
      if (existingIndex !== -1) {
        customArticles[existingIndex] = article;
      } else {
        // Add to top of list
        customArticles.unshift(article);
      }

      saveCustomArticlesSafely(customArticles);

      // 2. Remove from deleted articles tracking if present
      try {
        var deleted = JSON.parse(localStorage.getItem(DELETED_KEY)) || [];
        deleted = deleted.filter(function (id) { return id !== article.id; });
        localStorage.setItem(DELETED_KEY, JSON.stringify(deleted));
      } catch (e) {}

      // 3. Reload global memory stores across all modules
      if (typeof window.loadArticlesData === 'function') window.loadArticlesData();
      window.loadMergedArticles();

      if (typeof window.renderCategories === 'function') window.renderCategories();
      if (typeof window.renderNavCategories === 'function') window.renderNavCategories();

      // 4. Update the published list table in publisher studio (reset to page 1)
      this.currentPage = 1;
      this.renderArticlesList();
      localStorage.removeItem(DRAFT_KEY);

      // 5. Open live article prompt
      var viewUrl = '/article/' + encodeURIComponent(article.id) + '/';
      if (confirm('🎉 Article Published Successfully!\n\n"' + article.title + '" is now live on the iConnect Publication platform with view counting, heart likes, and social sharing.\n\nClick OK to view your live article now, or Cancel to keep editing.')) {
        window.open(viewUrl, '_blank');
      }
    },

    /* --- Generate Clean JS Code for articles/index.js --- */
    openExportModal: function () {
      var article = this.buildArticleObject();
      var featurePhotoLine = article.featurePhoto
        ? '    featurePhoto: ' + JSON.stringify(article.featurePhoto) + ',\n'
        : '';
      var authorIconLine = (article.authorIcon && article.authorIcon !== 'quill')
        ? '    authorIcon: ' + JSON.stringify(article.authorIcon) + ',\n'
        : '';
      var rolesLine = (article.roles && article.roles.length)
        ? '    roles: ' + JSON.stringify(article.roles) + ',\n'
        : '';
      var formattedJS =
        '  {\n' +
        '    id: ' + JSON.stringify(article.id) + ',\n' +
        '    title: ' + JSON.stringify(article.title) + ',\n' +
        '    category: ' + JSON.stringify(article.category) + ',\n' +
        '    featured: ' + article.featured + ',\n' +
        featurePhotoLine +
        '    author: ' + JSON.stringify(article.author) + ',\n' +
        authorIconLine +
        '    role: ' + JSON.stringify(article.role) + ',\n' +
        rolesLine +
        '    date: ' + JSON.stringify(article.date) + ',\n' +
        '    readTime: ' + JSON.stringify(article.readTime) + ',\n' +
        '    image: ' + JSON.stringify(article.image) + ',\n' +
        '    excerpt: ' + JSON.stringify(article.excerpt) + ',\n' +
        '    content: `' + article.content.replace(/`/g, '\\`') + '`\n' +
        '  },';

      if (this.exportCodeBlock) {
        this.exportCodeBlock.textContent = formattedJS;
      }
      if (this.exportModal) {
        this.exportModal.classList.add('active');
      }
    },

    closeExportModal: function () {
      if (this.exportModal) this.exportModal.classList.remove('active');
    },

    copyExportCode: function () {
      if (!this.exportCodeBlock) return;
      var code = this.exportCodeBlock.textContent;
      navigator.clipboard.writeText(code).then(function () {
        var btn = document.getElementById('pub-copy-code-btn');
        if (btn) {
          btn.textContent = '✓ Copied to Clipboard!';
          setTimeout(function () { btn.textContent = '📋 Copy JS Object'; }, 2200);
        }
      }).catch(function () {
        var ta = document.createElement('textarea');
        ta.value = code; document.body.appendChild(ta); ta.select();
        document.execCommand('copy'); document.body.removeChild(ta);
        alert('Code copied to clipboard!');
      });
    },

    downloadUpdatedIndexJS: function () {
      var allArticles = window.loadMergedArticles();
      var code = '/* ==========================================================================\n' +
        '   iCONNECT PUBLICATION — ARTICLES DATASTORE (articles/index.js)\n' +
        '   ========================================================================== */\n\n' +
        'var articlesData = [\n' +
        allArticles.map(function (art) {
          var featLine = art.featurePhoto ? '    featurePhoto: ' + JSON.stringify(art.featurePhoto) + ',\n' : '';
          var authorIconLine = (art.authorIcon && art.authorIcon !== 'quill') ? '    authorIcon: ' + JSON.stringify(art.authorIcon) + ',\n' : '';
          var rolesLine = (art.roles && art.roles.length) ? '    roles: ' + JSON.stringify(art.roles) + ',\n' : '';
          return '  {\n' +
            '    id: ' + JSON.stringify(art.id) + ',\n' +
            '    title: ' + JSON.stringify(art.title) + ',\n' +
            '    category: ' + JSON.stringify(art.category) + ',\n' +
            '    featured: ' + (art.featured ? 'true' : 'false') + ',\n' +
            featLine +
            '    author: ' + JSON.stringify(art.author) + ',\n' +
            authorIconLine +
            '    role: ' + JSON.stringify(art.role) + ',\n' +
            rolesLine +
            '    date: ' + JSON.stringify(art.date) + ',\n' +
            '    readTime: ' + JSON.stringify(art.readTime || art.readingTime || '') + ',\n' +
            '    image: ' + JSON.stringify(art.image) + ',\n' +
            '    excerpt: ' + JSON.stringify(art.excerpt) + ',\n' +
            '    content: `' + (art.content || '').replace(/`/g, '\\`') + '`\n' +
            '  }';
        }).join(',\n') +
        '\n];\n\nif (typeof window !== "undefined") {\n  window.articlesData = articlesData;\n}\n';

      var blob = new Blob([code], { type: 'text/javascript' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'index.js';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      alert('💾 Downloaded updated index.js!\n\nReplace articles/index.js in your project folder with this file before pushing to GitHub/Netlify/Vercel.');
    },

    /* --- Full Screen Article Preview Modal --- */
    openLivePreview: function () {
      var article = this.buildArticleObject();
      if (this.previewContainer) {
        var engHtml = typeof window.buildEngagementBar === 'function' ? window.buildEngagementBar(article) : '';
        var metaHtml = typeof window.buildArticleMetaBarHTML === 'function'
          ? window.buildArticleMetaBarHTML(article)
          : '';
        var excerptHtml = (article.excerpt && article.excerpt.trim())
          ? '<p class="reader-excerpt" style="font-style:italic; color:var(--text-muted, #94a3b8); font-size:1.05rem; line-height:1.65; margin:0 0 1.25rem 0;">' + article.excerpt.trim() + '</p>'
          : '';

        this.previewContainer.innerHTML =
          '<div class="reader-container" style="max-width:820px; margin:0 auto; padding:2rem 1rem;">' +
            '<span class="reader-category">' + article.category + '</span>' +
            '<h1 class="reader-title" style="font-size:2.2rem; margin:0.75rem 0 1rem; color:#fff;">' + article.title + '</h1>' +
            metaHtml +
            excerptHtml +
            '<div style="margin: 0.5rem 0 2rem 0;">' + engHtml + '</div>' +
            '<div class="reader-hero-img-wrapper" style="margin-bottom:2.5rem;">' +
              '<img src="' + article.image + '" alt="' + article.title + '" class="reader-hero-img" />' +
            '</div>' +
            '<div class="reader-body-content" style="line-height:1.85; font-size:1.1rem; color:#cbd5e1;">' + (typeof window.normalizeYouTubeEmbeds === 'function' ? window.normalizeYouTubeEmbeds(article.content) : article.content) + '</div>' +
          '</div>';

        if (typeof window.initArticleLightbox === 'function') {
          window.initArticleLightbox(this.previewContainer);
        }
      }
      if (this.previewModal) {
        this.previewModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    },

    closeLivePreview: function () {
      if (this.previewModal) {
        this.previewModal.classList.remove('active');
        document.body.style.overflow = '';
      }
    },

    /* --- Published Articles Management with 5-per-page Pagination --- */
    currentPage: 1,
    pageSize: 5,

    goToPage: function (page) {
      var allArticles = window.loadMergedArticles();
      var totalPages = Math.ceil(allArticles.length / this.pageSize) || 1;
      if (page < 1) page = 1;
      if (page > totalPages) page = totalPages;
      this.currentPage = page;
      this.renderArticlesList();
      var sec = document.querySelector('.my-articles-section');
      if (sec) {
        sec.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    },

    renderArticlesList: function () {
      if (!this.articlesList) return;
      var customArticles = getCustomArticles();
      var allArticles = window.loadMergedArticles();
      var totalArticles = allArticles.length;

      if (totalArticles === 0) {
        this.articlesList.innerHTML = '<div style="color:var(--text-muted); text-align:center; padding:2rem;">No published articles yet. Write your first story above!</div>';
        return;
      }

      var totalPages = Math.ceil(totalArticles / this.pageSize) || 1;
      if (this.currentPage < 1) this.currentPage = 1;
      if (this.currentPage > totalPages) this.currentPage = totalPages;

      var startIndex = (this.currentPage - 1) * this.pageSize;
      var endIndex = Math.min(startIndex + this.pageSize, totalArticles);
      var pageArticles = allArticles.slice(startIndex, endIndex);

      var cardsHTML = pageArticles.map(function (art) {
        var globalIdx = allArticles.findIndex(function (a) { return a.id === art.id; });
        if (globalIdx === -1) globalIdx = 0;
        var isCustom = customArticles.some(function (c) { return c.id === art.id; });
        return '<div class="draft-card">' +
          '<div style="flex:1; padding-right:1rem;">' +
            '<div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.35rem;">' +
              '<span class="arch-tag">' + art.category + '</span>' +
              '<span style="font-size:0.7rem; font-family:var(--font-mono); color:var(--text-subtle); background:rgba(255,255,255,0.06); padding:0.1rem 0.5rem; border-radius:999px;">#' + (globalIdx + 1) + '</span>' +
              (art.featured ? '<span style="font-size:0.7rem; font-family:var(--font-mono); color:var(--cheddar-yellow); background:rgba(244,180,26,0.15); padding:0.1rem 0.5rem; border-radius:999px;">★ Featured</span>' : '') +
              (isCustom ? '<span style="font-size:0.7rem; font-family:var(--font-mono); color:#4f9ef7; background:rgba(79,158,247,0.15); padding:0.1rem 0.5rem; border-radius:999px;">Live Custom</span>' : '') +
            '</div>' +
            '<h4 style="font-family:var(--font-heading); font-size:1.05rem; font-weight:700; color:#fff; margin:0 0 0.35rem 0;">' + art.title + '</h4>' +
            '<div style="font-size:0.8rem; color:var(--text-muted);">' + art.author + ' &middot; ' + art.date + ' &middot; ' + (art.readTime || '') + '</div>' +
          '</div>' +
          '<div style="display:flex; gap:0.4rem; align-items:center;">' +
            '<button type="button" class="toolbar-btn" onclick="PublisherApp.moveArticle(\'' + art.id + '\', \'up\')" ' + (globalIdx === 0 ? 'disabled style="opacity:0.35; cursor:not-allowed;"' : '') + ' title="Move Up (Display 1 step before on Homepage)">⬆</button>' +
            '<button type="button" class="toolbar-btn" onclick="PublisherApp.moveArticle(\'' + art.id + '\', \'down\')" ' + (globalIdx === allArticles.length - 1 ? 'disabled style="opacity:0.35; cursor:not-allowed;"' : '') + ' title="Move Down (Display 1 step after on Homepage)">⬇</button>' +
            '<button type="button" class="toolbar-btn" onclick="PublisherApp.editArticle(\'' + art.id + '\')" title="Edit Story">✏️ Edit</button>' +
            '<a class="toolbar-btn" href="/article/' + encodeURIComponent(art.id) + '/" target="_blank" title="View Published Story">👁 View</a>' +
            '<button type="button" class="toolbar-btn" onclick="PublisherApp.downloadShareStub(\'' + art.id + '\')" title="Download Share Link Stub" style="color:#a855f7; border-color:rgba(168,85,247,0.3);">📤 Share</button>' +
            '<button type="button" class="toolbar-btn" onclick="PublisherApp.deleteArticle(\'' + art.id + '\')" style="color:#ff6b8a; border-color:rgba(255,107,138,0.3);" title="Delete Story">🗑</button>' +
          '</div>' +
        '</div>';
      }).join('');

      var paginationHTML = '';
      if (totalPages > 1) {
        paginationHTML = '<div class="pub-pagination" style="display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:1rem; margin-top:1.5rem; padding:0.9rem 1.25rem; background:rgba(5,11,26,0.6); border:1px solid var(--border-navy); border-radius:12px;">' +
          '<div style="font-family:var(--font-mono); font-size:0.8rem; color:var(--text-muted);">' +
            'Showing <strong style="color:#fff;">' + (startIndex + 1) + '–' + endIndex + '</strong> of <strong style="color:var(--cheddar-yellow);">' + totalArticles + '</strong> articles &nbsp;&middot;&nbsp; Page <strong style="color:#fff;">' + this.currentPage + '</strong> of <strong style="color:#fff;">' + totalPages + '</strong>' +
          '</div>' +
          '<div style="display:flex; align-items:center; gap:0.35rem; flex-wrap:wrap;">';

        var isFirst = this.currentPage === 1;
        var isLast = this.currentPage === totalPages;

        // First <<
        paginationHTML += '<button type="button" class="pub-page-btn" onclick="PublisherApp.goToPage(1)" ' + (isFirst ? 'disabled' : '') + ' title="First Page">&laquo;&laquo;</button>';

        // Prev <
        paginationHTML += '<button type="button" class="pub-page-btn" onclick="PublisherApp.goToPage(' + (this.currentPage - 1) + ')" ' + (isFirst ? 'disabled' : '') + ' title="Previous Page">&lsaquo;</button>';

        // Numbered buttons with ellipsis
        var pageNumbers = [];
        if (totalPages <= 7) {
          for (var i = 1; i <= totalPages; i++) pageNumbers.push(i);
        } else {
          pageNumbers.push(1);
          if (this.currentPage > 3) pageNumbers.push('...');
          var startP = Math.max(2, this.currentPage - 1);
          var endP = Math.min(totalPages - 1, this.currentPage + 1);
          for (var p = startP; p <= endP; p++) {
            if (pageNumbers.indexOf(p) === -1) pageNumbers.push(p);
          }
          if (this.currentPage < totalPages - 2) pageNumbers.push('...');
          if (pageNumbers.indexOf(totalPages) === -1) pageNumbers.push(totalPages);
        }

        var curPage = this.currentPage;
        pageNumbers.forEach(function (p) {
          if (p === '...') {
            paginationHTML += '<span style="font-family:var(--font-mono); font-size:0.85rem; color:var(--text-subtle); padding:0 0.35rem;">...</span>';
          } else {
            var active = (p === curPage);
            paginationHTML += '<button type="button" class="pub-page-btn ' + (active ? 'active' : '') + '" onclick="PublisherApp.goToPage(' + p + ')">' + p + '</button>';
          }
        });

        // Next >
        paginationHTML += '<button type="button" class="pub-page-btn" onclick="PublisherApp.goToPage(' + (this.currentPage + 1) + ')" ' + (isLast ? 'disabled' : '') + ' title="Next Page">&rsaquo;</button>';

        // Last >>
        paginationHTML += '<button type="button" class="pub-page-btn" onclick="PublisherApp.goToPage(' + totalPages + ')" ' + (isLast ? 'disabled' : '') + ' title="Last Page">&raquo;&raquo;</button>';

        paginationHTML += '</div></div>';
      }

      this.articlesList.innerHTML = cardsHTML + paginationHTML;
    },

    moveArticle: function (articleId, direction) {
      var allArticles = window.loadMergedArticles();
      var idx = -1;
      for (var i = 0; i < allArticles.length; i++) {
        if (allArticles[i].id === articleId) { idx = i; break; }
      }
      if (idx === -1) return;

      var targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= allArticles.length) return;

      // Swap in allArticles array
      var temp = allArticles[idx];
      allArticles[idx] = allArticles[targetIdx];
      allArticles[targetIdx] = temp;

      // Save custom ordering list to localStorage
      var newOrder = allArticles.map(function (a) { return a.id; });
      try {
        localStorage.setItem('iconnect_articles_order', JSON.stringify(newOrder));
      } catch (e) {}

      // If custom articles are in localStorage, re-order them too
      var custom = getCustomArticles();
      if (custom && custom.length > 0) {
        var customMap = {};
        custom.forEach(function (c) { customMap[c.id] = c; });
        var reorderedCustom = [];
        newOrder.forEach(function (id) {
          if (customMap[id]) reorderedCustom.push(customMap[id]);
        });
        saveCustomArticles(reorderedCustom);
      }

      if (typeof window.loadArticlesData === 'function') window.loadArticlesData();
      window.loadMergedArticles();
      this.renderArticlesList();

      if (typeof window.renderCategories === 'function') window.renderCategories();
      if (typeof window.renderNavCategories === 'function') window.renderNavCategories();
      if (typeof window.renderArticlesGrid === 'function' && typeof window.loadArticlesData === 'function') {
        window.renderArticlesGrid(window.loadArticlesData());
      }
      if (typeof window.renderHeroSlider === 'function') {
        window.renderHeroSlider();
      }
    },

    editArticle: function (articleId) {
      var allArticles = window.loadMergedArticles();
      var found = allArticles.find(function (a) { return a.id === articleId; });
      if (found) {
        this.fillFormWithArticle(found);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },

    deleteArticle: function (articleId) {
      if (confirm('Are you sure you want to delete this article?')) {
        var customArticles = getCustomArticles().filter(function (a) { return a.id !== articleId; });
        saveCustomArticles(customArticles);

        var deletedIds = [];
        try {
          deletedIds = JSON.parse(localStorage.getItem('iconnect_deleted_articles')) || [];
        } catch (e) {}
        if (deletedIds.indexOf(articleId) === -1) {
          deletedIds.push(articleId);
          try {
            localStorage.setItem('iconnect_deleted_articles', JSON.stringify(deletedIds));
          } catch (e) {}
        }

        var allArticles = window.loadMergedArticles();
        var totalPages = Math.ceil(allArticles.length / this.pageSize) || 1;
        if (this.currentPage > totalPages) {
          this.currentPage = totalPages;
        }
        this.renderArticlesList();
      }
    },

    /* --- Download Article Share-Preview Stub HTML --- */
    downloadShareStub: function (articleId) {
      var allArticles = window.loadMergedArticles();
      var article = allArticles.find(function (a) { return a.id === articleId; });
      if (!article) { alert('Article not found.'); return; }

      // Detect the site base URL from current location or prompt
      var baseUrl = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? prompt(
            '📤 What is your production site URL?\n(This is baked into the OG meta tags for social sharing)\n\nExample: https://iconnect-publication.vercel.app',
            ''
          )
        : (window.location.origin);

      baseUrl = (baseUrl || '').replace(/\/$/, '');

      var slug    = article.id;
      var title   = (article.title || 'iConnect Article').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
      var rawEx   = (article.excerpt || article.content || '').replace(/<[^>]*>/g,'').trim().slice(0,160);
      var desc    = (rawEx ? rawEx + '...' : 'Read this article on iConnect Publication.').replace(/"/g,'&quot;');
      var imgSrc  = article.image || article.featuredImage || '';
      var imgUrl  = /^https?:\/\//.test(imgSrc) ? imgSrc : ((baseUrl || '') + '/' + imgSrc.replace(/^\.\//,''));
      var artUrl  = '/article.html?id=' + encodeURIComponent(slug);
      var canUrl  = baseUrl ? (baseUrl + '/article/' + slug + '/') : ('/article/' + slug + '/');
      var author  = (article.author || 'iConnect Publication').replace(/"/g,'&quot;');
      var cat     = (article.category || 'News').replace(/"/g,'&quot;');
      var date    = (article.date || '').replace(/"/g,'&quot;');

      var html = '<!DOCTYPE html>\n<html lang="en">\n<head>\n' +
        '  <meta charset="UTF-8" />\n' +
        '  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n' +
        '  <meta name="theme-color" content="#050b1a" />\n' +
        '  <link rel="canonical" href="' + canUrl + '" />\n' +
        '  <title>' + title + ' | iConnect Publication</title>\n' +
        '  <meta name="description" content="' + desc + '" />\n' +
        '  <!-- Open Graph — static, baked-in for social sharing crawlers -->\n' +
        '  <meta property="og:type"              content="article" />\n' +
        '  <meta property="og:site_name"         content="iConnect Publication" />\n' +
        '  <meta property="og:title"             content="' + title + ' | iConnect Publication" />\n' +
        '  <meta property="og:description"       content="' + desc + '" />\n' +
        '  <meta property="og:url"               content="' + canUrl + '" />\n' +
        '  <meta property="og:image"             content="' + imgUrl + '" />\n' +
        '  <meta property="og:image:secure_url"  content="' + imgUrl + '" />\n' +
        '  <meta property="og:image:width"       content="1200" />\n' +
        '  <meta property="og:image:height"      content="630" />\n' +
        '  <meta property="og:locale"            content="en_PH" />\n' +
        '  <meta property="article:published_time" content="' + date + '" />\n' +
        '  <meta property="article:author"       content="' + author + '" />\n' +
        '  <meta property="article:section"      content="' + cat + '" />\n' +
        '  <!-- Twitter / X Card -->\n' +
        '  <meta name="twitter:card"             content="summary_large_image" />\n' +
        '  <meta name="twitter:title"            content="' + title + ' | iConnect Publication" />\n' +
        '  <meta name="twitter:description"      content="' + desc + '" />\n' +
        '  <meta name="twitter:image"            content="' + imgUrl + '" />\n' +
        '  <link rel="icon" type="image/png" href="/assets/logo/iconnect-logo-3d.png" />\n' +
        '  <link rel="apple-touch-icon" href="/assets/logo/iconnect-share-thumbnail.jpg" />\n' +
        '  <script>(function(){var target=(window.location.origin||\'\')+\'/article.html?id=' + encodeURIComponent(slug) + '\';window.location.replace(target);})();<\/script>\n' +
        '  <noscript><meta http-equiv="refresh" content="0; url=' + artUrl + '" /></noscript>\n' +
        '  <style>*{margin:0;padding:0;box-sizing:border-box}body{background:#050b1a;color:#e0e6f0;font-family:-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;padding:2rem}.w{max-width:520px}.ic{font-size:2.5rem;margin-bottom:1rem}.t{font-size:1.3rem;font-weight:700;color:#00f0ff;line-height:1.4;margin-bottom:.5rem}.s{color:#94a3b8;font-size:.9rem}.btn{display:inline-block;margin-top:1.5rem;padding:.6rem 1.5rem;background:rgba(0,240,255,.1);border:1px solid #00f0ff;border-radius:8px;color:#00f0ff;text-decoration:none;font-size:.9rem}</style>\n' +
        '</head>\n<body>\n' +
        '  <div class="w"><div class="ic">📰</div><div class="t">' + title + '</div><div class="s">iConnect Publication — Loading article…</div><a href="' + artUrl + '" class="btn">Open Article →</a></div>\n' +
        '</body>\n</html>';

      var blob = new Blob([html], { type: 'text/html' });
      var url  = URL.createObjectURL(blob);
      var a    = document.createElement('a');
      a.href     = url;
      a.download = 'index.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert(
        '📤 Share-Link Stub Downloaded!\n\n' +
        'To make this article shareable on Facebook, WhatsApp, Telegram etc.:\n\n' +
        '1. In your project, create the folder:\n   article/' + slug + '/\n\n' +
        '2. Place the downloaded index.html inside that folder.\n\n' +
        '3. Push to GitHub and deploy to Vercel.\n\n' +
        '4. Share this URL:\n   ' + canUrl
      );
    }
  };

  window.PublisherApp = PublisherApp;

  document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('pub-title')) {
      PublisherApp.init();
    }
  });

})(window);
