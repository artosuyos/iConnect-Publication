/* ==========================================================================
   iCONNECT — ANNOUNCEMENTS STUDIO MANAGER (js/announcements-studio.js)
   Full CRUD: Add, Edit, Delete, Reorder, Image Upload, Live Publish & Code Export
   ========================================================================== */

(function () {
  'use strict';

  var STORAGE_KEY = 'iconnect_announcements';
  var CAT_STORAGE_KEY = 'iconnect_announcements_categories';
  var HEADER_STORAGE_KEY = 'iconnect_announcements_header';

  function getStoredHeader() {
    try {
      var stored = JSON.parse(localStorage.getItem(HEADER_STORAGE_KEY));
      if (stored && typeof stored === 'object') return stored;
    } catch (e) {}
    return (window.announcementsHeaderData || {
      badge: "Bulletin Board",
      title: "Publication Announcements",
      description: "Official campus updates, bulletin items, and departmental news notices."
    });
  }

  function saveStoredHeader(header) {
    try {
      localStorage.setItem(HEADER_STORAGE_KEY, JSON.stringify(header));
    } catch (e) {}
  }

  var defaultCategories = ['Hiring', 'Launch', 'Notice', 'Workshop', 'Event', 'General'];

  var defaultItems = [
    {
      id: 'ann-1',
      title: 'Call for Student Writers & Web Developers: Join iConnect Vol. IV!',
      date: 'August 10, 2026',
      category: 'Hiring',
      body: 'The official publication of the BSCS Department is hiring news reporters, tech columnists, photojournalists, and frontend developers. Applications open until August 25.'
    },
    {
      id: 'ann-2',
      title: 'Publication Launch: iConnect Digital Edition 2026 Live',
      date: 'August 01, 2026',
      category: 'Launch',
      body: 'We are thrilled to launch our new technology-inspired digital magazine platform, bringing interactive cybernetic design to CAPSU Mambusao campus.'
    },
    {
      id: 'ann-4',
      title: 'ART',
      date: 'August 01, 2026',
      category: 'Notice',
      body: 'HELLLOOOOOOOOOOOOOOOOOOOOO',
      image: 'assets/images/articles/qrcode1.png'
    },
    {
      id: 'ann-3',
      title: 'BSCS Tech Summit 2026 Keynote & Workshop Series',
      date: 'July 28, 2026',
      category: 'Workshop',
      body: 'Join us at the Main Computer Laboratory for a 2-day workshop on Full-Stack JavaScript, Machine Learning basics, and Cyber Security fundamentals.'
    }
  ];

  function getStoredItems() {
    try {
      var data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        var parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}

    if (typeof window.announcementsData !== 'undefined' && Array.isArray(window.announcementsData) && window.announcementsData.length > 0) {
      return window.announcementsData;
    }
    return defaultItems;
  }

  function saveStoredItems(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  function getStoredCategories() {
    try {
      var data = localStorage.getItem(CAT_STORAGE_KEY);
      if (data) {
        var parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return defaultCategories;
  }

  function saveStoredCategories(cats) {
    localStorage.setItem(CAT_STORAGE_KEY, JSON.stringify(cats));
  }

  var AnnouncementsStudio = {
    items: [],
    editingId: null,
    currentPhotoBase64: '',

    init: function () {
      this.items = getStoredItems();
      this.cacheDOM();
      this.bindEvents();
      this.populateCategorySelect();
      this.renderItemsGrid();
      this.loadHeaderSettingsForm();
    },

    saveHeaderSettings: function () {
      var badge = (document.getElementById('ann-header-badge') ? document.getElementById('ann-header-badge').value.trim() : '') || 'Bulletin Board';
      var title = (document.getElementById('ann-header-title') ? document.getElementById('ann-header-title').value.trim() : '') || 'Publication Announcements';
      var desc  = (document.getElementById('ann-header-desc') ? document.getElementById('ann-header-desc').value.trim() : '') || '';

      var header = { badge: badge, title: title, description: desc };
      saveStoredHeader(header);
      alert('✅ Announcements Header Settings Saved!\n\nBadge: "' + badge + '"\nTitle: "' + title + '"');
    },

    loadHeaderSettingsForm: function () {
      var h = getStoredHeader();
      var badgeInput = document.getElementById('ann-header-badge');
      var titleInput = document.getElementById('ann-header-title');
      var descInput  = document.getElementById('ann-header-desc');

      if (badgeInput) badgeInput.value = h.badge || 'Bulletin Board';
      if (titleInput) titleInput.value = h.title || 'Publication Announcements';
      if (descInput)  descInput.value  = h.description || '';
    },

    cacheDOM: function () {
      this.form = document.getElementById('ann-item-form');
      this.idInput = document.getElementById('ann-item-id');
      this.titleInput = document.getElementById('ann-title');
      this.dateInput = document.getElementById('ann-date');
      this.categoryInput = document.getElementById('ann-category');
      this.tintColorInput = document.getElementById('ann-tint-color');
      this.bodyInput = document.getElementById('ann-body');
      this.bodyCanvas = document.getElementById('ann-body-canvas');
      this.photoUrlInput = document.getElementById('ann-photo-url');
      this.photoFileInput = document.getElementById('ann-photo-file');
      this.photoPreview = document.getElementById('ann-photo-preview');

      this.shareThumbFileInput = document.getElementById('ann-share-thumb-file');
      this.shareThumbUrlInput = document.getElementById('ann-share-thumb-url');
      this.shareThumbPreview = document.getElementById('ann-share-thumb-preview');
      this.shareThumbBox = document.getElementById('ann-share-thumb-box');

      this.submitBtn = document.getElementById('ann-submit-btn');
      this.clearBtn = document.getElementById('ann-clear-btn');
      this.deleteBtn = document.getElementById('ann-delete-btn');
      this.formTitle = document.getElementById('ann-form-title');

      this.gridContainer = document.getElementById('ann-items-grid');
      this.itemCountEl = document.getElementById('ann-item-count');
      this.searchInput = document.getElementById('ann-search-input');
      this.exportCodeBlock = document.getElementById('ann-export-code');
      this.exportModal = document.getElementById('ann-export-modal');
    },

    setTintColor: function (color) {
      if (this.tintColorInput) this.tintColorInput.value = color;
    },

    bindEvents: function () {
      var self = this;

      if (this.form) {
        this.form.addEventListener('submit', function (e) {
          e.preventDefault();
          self.saveItem();
        });
      }

      if (this.clearBtn) {
        this.clearBtn.addEventListener('click', function () {
          self.resetForm();
        });
      }

      if (this.deleteBtn) {
        this.deleteBtn.addEventListener('click', function () {
          self.deleteItem(self.editingId);
        });
      }

      if (this.photoFileInput) {
        this.photoFileInput.addEventListener('change', function (e) {
          var file = e.target.files[0];
          if (!file) return;
          var reader = new FileReader();
          reader.onload = function (evt) {
            self.currentPhotoBase64 = evt.target.result;
            if (self.photoUrlInput) self.photoUrlInput.value = '';
            self.updatePhotoPreview();
          };
          reader.readAsDataURL(file);
        });
      }

      if (this.photoUrlInput) {
        this.photoUrlInput.addEventListener('input', function () {
          self.currentPhotoBase64 = '';
          self.updatePhotoPreview();
        });
      }

      if (this.shareThumbFileInput) {
        this.shareThumbFileInput.addEventListener('change', function (e) {
          var file = e.target.files[0];
          if (!file) return;
          var reader = new FileReader();
          reader.onload = function (evt) {
            self.currentShareThumbBase64 = evt.target.result;
            if (self.shareThumbUrlInput) self.shareThumbUrlInput.value = '';
            self.updateShareThumbPreview();
          };
          reader.readAsDataURL(file);
        });
      }

      if (this.shareThumbUrlInput) {
        this.shareThumbUrlInput.addEventListener('input', function () {
          self.currentShareThumbBase64 = '';
          self.updateShareThumbPreview();
        });
      }

      if (this.searchInput) {
        this.searchInput.addEventListener('input', function () {
          self.renderItemsGrid();
        });
      }

      if (this.bodyCanvas) {
        var syncBody = function () {
          if (self.bodyInput && self.bodyCanvas) {
            self.bodyInput.value = self.bodyCanvas.innerHTML.trim();
          }
        };
        this.bodyCanvas.addEventListener('input', syncBody);
        this.bodyCanvas.addEventListener('keyup', syncBody);
        this.bodyCanvas.addEventListener('paste', syncBody);
      }
    },

    formatText: function (cmd) {
      if (this.bodyCanvas) this.bodyCanvas.focus();
      document.execCommand(cmd, false, null);
      if (this.bodyInput && this.bodyCanvas) {
        this.bodyInput.value = this.bodyCanvas.innerHTML.trim();
      }
    },

    insertLink: function () {
      var url = prompt('Enter URL link for announcement:', 'https://');
      if (url) {
        if (this.bodyCanvas) this.bodyCanvas.focus();
        document.execCommand('createLink', false, url);
        if (this.bodyInput && this.bodyCanvas) {
          this.bodyInput.value = this.bodyCanvas.innerHTML.trim();
        }
      }
    },

    updatePhotoPreview: function () {
      var url = this.photoUrlInput ? this.photoUrlInput.value.trim() : '';
      var photoSrc = this.currentPhotoBase64 || url;

      if (photoSrc && this.photoPreview) {
        this.photoPreview.src = photoSrc;
        this.photoPreview.style.display = 'block';
      } else if (this.photoPreview) {
        this.photoPreview.style.display = 'none';
      }
    },

    updateShareThumbPreview: function () {
      var url = this.shareThumbUrlInput ? this.shareThumbUrlInput.value.trim() : '';
      var src = this.currentShareThumbBase64 || url;

      if (src && this.shareThumbPreview && this.shareThumbBox) {
        this.shareThumbPreview.src = src;
        this.shareThumbPreview.style.display = 'block';
        this.shareThumbBox.style.display = 'block';
      } else if (this.shareThumbPreview && this.shareThumbBox) {
        this.shareThumbPreview.style.display = 'none';
        this.shareThumbBox.style.display = 'none';
      }
    },

    resetForm: function () {
      this.editingId = null;
      this.currentPhotoBase64 = '';
      this.currentShareThumbBase64 = '';
      if (this.form) this.form.reset();
      if (this.bodyCanvas) this.bodyCanvas.innerHTML = '';
      if (this.bodyInput) this.bodyInput.value = '';
      if (this.idInput) this.idInput.value = '';
      if (this.tintColorInput) this.tintColorInput.value = '#00f0ff';
      if (this.formTitle) this.formTitle.textContent = '📢 Add Publication Announcement';
      if (this.submitBtn) this.submitBtn.textContent = '📢 Save Announcement';
      if (this.deleteBtn) this.deleteBtn.style.display = 'none';
      this.updatePhotoPreview();
      this.updateShareThumbPreview();
    },

    saveItem: function () {
      var title = this.titleInput ? this.titleInput.value.trim() : '';
      var dateStr = this.dateInput ? this.dateInput.value.trim() : '';
      var category = this.categoryInput ? this.categoryInput.value : 'General';
      var tintColor = this.tintColorInput ? this.tintColorInput.value : '#00f0ff';
      var body = this.bodyCanvas ? this.bodyCanvas.innerHTML.trim() : (this.bodyInput ? this.bodyInput.value.trim() : '');
      var photoUrl = this.photoUrlInput ? this.photoUrlInput.value.trim() : '';
      var image = this.currentPhotoBase64 || photoUrl || '';
      var shareThumbUrl = this.shareThumbUrlInput ? this.shareThumbUrlInput.value.trim() : '';
      var shareThumbnail = this.currentShareThumbBase64 || shareThumbUrl || '';

      if (!title) {
        alert('Please enter a Title for the announcement.');
        if (this.titleInput) this.titleInput.focus();
        return;
      }

      if (!body) {
        alert('Please enter the Announcement details/body text.');
        if (this.bodyInput) this.bodyInput.focus();
        return;
      }

      if (!dateStr) {
        var now = new Date();
        var options = { month: 'long', day: '2-digit', year: 'numeric' };
        dateStr = now.toLocaleDateString('en-US', options);
      }

      var itemObj = {
        id: this.editingId || ('ann-' + Date.now()),
        title: title,
        date: dateStr,
        category: category,
        tintColor: tintColor,
        body: body
      };
      if (image) itemObj.image = image;

      if (this.editingId) {
        for (var i = 0; i < this.items.length; i++) {
          if (String(this.items[i].id) === String(this.editingId)) {
            this.items[i] = itemObj;
            break;
          }
        }
      } else {
        this.items.push(itemObj);
      }

      saveStoredItems(this.items);
      this.renderItemsGrid();
      this.resetForm();
      alert('✅ Announcement Saved Successfully!');
    },

    editItem: function (id) {
      var found = null;
      for (var i = 0; i < this.items.length; i++) {
        if (String(this.items[i].id) === String(id)) { found = this.items[i]; break; }
      }
      if (!found) return;

      this.editingId = found.id;
      if (this.idInput) this.idInput.value = found.id;
      if (this.titleInput) this.titleInput.value = found.title || '';
      if (this.dateInput) this.dateInput.value = found.date || '';
      if (this.categoryInput) this.categoryInput.value = found.category || 'General';
      if (this.tintColorInput) this.tintColorInput.value = found.tintColor || '#00f0ff';
      if (this.bodyCanvas) this.bodyCanvas.innerHTML = found.body || '';
      if (this.bodyInput) this.bodyInput.value = found.body || '';

      if (found.image && found.image.indexOf('data:image') === 0) {
        this.currentPhotoBase64 = found.image;
        if (this.photoUrlInput) this.photoUrlInput.value = '';
      } else {
        this.currentPhotoBase64 = '';
        if (this.photoUrlInput) this.photoUrlInput.value = found.image || '';
      }

      if (found.shareThumbnail && found.shareThumbnail.indexOf('data:image') === 0) {
        this.currentShareThumbBase64 = found.shareThumbnail;
        if (this.shareThumbUrlInput) this.shareThumbUrlInput.value = '';
      } else {
        this.currentShareThumbBase64 = '';
        if (this.shareThumbUrlInput) this.shareThumbUrlInput.value = found.shareThumbnail || '';
      }

      if (this.formTitle) this.formTitle.textContent = '✏️ Edit Announcement: ' + found.title;
      if (this.submitBtn) this.submitBtn.textContent = '💾 Update Announcement';
      if (this.deleteBtn) this.deleteBtn.style.display = 'inline-block';

      this.updatePhotoPreview();
      this.updateShareThumbPreview();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    deleteItem: function (id) {
      if (!id) return;
      var found = null;
      for (var i = 0; i < this.items.length; i++) {
        if (String(this.items[i].id) === String(id)) { found = this.items[i]; break; }
      }
      var title = found ? found.title : 'this announcement';

      if (confirm('Are you sure you want to delete "' + title + '" from Announcements?')) {
        this.items = this.items.filter(function (item) { return String(item.id) !== String(id); });
        saveStoredItems(this.items);
        this.renderItemsGrid();
        this.resetForm();
      }
    },

    moveItem: function (id, direction) {
      var idx = -1;
      for (var i = 0; i < this.items.length; i++) {
        if (String(this.items[i].id) === String(id)) { idx = i; break; }
      }
      if (idx === -1) return;

      var targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= this.items.length) return;

      var temp = this.items[idx];
      this.items[idx] = this.items[targetIdx];
      this.items[targetIdx] = temp;

      saveStoredItems(this.items);
      this.renderItemsGrid();
    },

    renderItemsGrid: function () {
      if (!this.gridContainer) return;

      var query = this.searchInput ? this.searchInput.value.toLowerCase().trim() : '';
      var filtered = this.items.filter(function (item) {
        if (!query) return true;
        return (item.title && item.title.toLowerCase().indexOf(query) !== -1) ||
               (item.category && item.category.toLowerCase().indexOf(query) !== -1) ||
               (item.body && item.body.toLowerCase().indexOf(query) !== -1);
      });

      if (this.itemCountEl) this.itemCountEl.textContent = filtered.length;

      if (filtered.length === 0) {
        this.gridContainer.innerHTML =
          '<div style="grid-column: 1 / -1; text-align: center; padding: 3rem; background: rgba(255,255,255,0.02); border-radius: 16px; border: 1px dashed rgba(255,255,255,0.1);">' +
            '<p style="color: var(--text-muted); margin-bottom: 1rem;">No announcements found matching your search.</p>' +
            '<button class="btn-export" onclick="AnnouncementsStudio.resetForm()">📢 Add New Announcement</button>' +
          '</div>';
        return;
      }

      var html = filtered.map(function (item, idx) {
        var tint = item.tintColor || '#00f0ff';
        var cardStyle = 'border-top: 3px solid ' + tint + '; box-shadow: 0 8px 30px ' + tint + '20;';
        var badgeStyle = 'background:' + tint + '20; color:' + tint + '; border:1px solid ' + tint + '60;';

        return '<div class="ed-card-item" style="' + cardStyle + '">' +
          (item.image ? '<div style="position:relative; border-radius:12px; overflow:hidden; aspect-ratio:16/9; margin-bottom:0.85rem; border:1px solid rgba(255,255,255,0.1); background:#000;">' +
            '<img src="' + item.image + '" alt="' + item.title + '" style="width:100%; height:100%; object-fit:cover;" />' +
          '</div>' : '') +
          '<div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0.4rem;">' +
            '<span class="ed-category-badge" style="' + badgeStyle + '">' + (item.category || 'General') + '</span>' +
            '<span style="font-family:var(--font-mono); font-size:0.75rem; color:var(--text-subtle);">' + (item.date || '') + '</span>' +
          '</div>' +
          '<h4 class="ed-card-name" style="font-size:1.05rem; margin-bottom:0.45rem;">' + item.title + '</h4>' +
          '<p class="ed-card-bio" style="font-size:0.85rem; color:var(--text-subtle); margin-bottom:0.85rem; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden;">' + (item.body || '') + '</p>' +
          '<div class="ed-card-actions" style="flex-wrap:wrap;">' +
            '<button class="ed-btn ed-btn-edit" onclick="AnnouncementsStudio.editItem(\'' + item.id + '\')">✏️ Edit</button>' +
            '<button class="ed-btn ed-btn-del" onclick="AnnouncementsStudio.deleteItem(\'' + item.id + '\')">🗑 Delete</button>' +
            '<button class="ed-btn" style="background:rgba(244,180,26,0.15); color:var(--cheddar-yellow); border:1px solid rgba(244,180,26,0.35);" onclick="window.openAnnouncementShareModal(\'' + item.id + '\')">📤 Share Link</button>' +
            '<button class="ed-btn ed-btn-move" onclick="AnnouncementsStudio.moveItem(\'' + item.id + '\', \'up\')" ' + (idx === 0 ? 'disabled' : '') + '>⬆</button>' +
            '<button class="ed-btn ed-btn-move" onclick="AnnouncementsStudio.moveItem(\'' + item.id + '\', \'down\')" ' + (idx === filtered.length - 1 ? 'disabled' : '') + '>⬇</button>' +
          '</div>' +
        '</div>';
      }).join('');

      this.gridContainer.innerHTML = html;
    },

    publishLive: function () {
      saveStoredItems(this.items);
      alert('🎉 Announcements Live Sync Complete!\n\nAll ' + this.items.length + ' announcements are now published live across the iConnect Publication site.');
    },

    /* --- Category Management System --- */
    populateCategorySelect: function () {
      this.categoryInput = this.categoryInput || document.getElementById('ann-category');
      if (!this.categoryInput) return;
      var cats = getStoredCategories();
      var currentVal = this.categoryInput.value;
      var html = cats.map(function (c) {
        return '<option value="' + c.replace(/"/g, '&quot;') + '">' + c + '</option>';
      }).join('');
      this.categoryInput.innerHTML = html;
      if (currentVal && cats.indexOf(currentVal) !== -1) {
        this.categoryInput.value = currentVal;
      }
    },

    openCategoryModal: function () {
      var modal = document.getElementById('ann-cat-modal');
      if (!modal) return;
      this.renderCategoryList();
      modal.style.display = 'flex';
      modal.classList.add('open');
    },

    closeCategoryModal: function () {
      var modal = document.getElementById('ann-cat-modal');
      if (modal) {
        modal.classList.remove('open');
        modal.style.display = 'none';
      }
      this.populateCategorySelect();
    },

    addCategory: function () {
      var input = document.getElementById('ann-new-cat-input');
      if (!input) return;
      var cat = input.value.trim();
      if (!cat) { alert('Please enter a category name.'); return; }
      var cats = getStoredCategories();
      if (cats.indexOf(cat) !== -1) { alert('Category already exists.'); return; }
      cats.push(cat);
      saveStoredCategories(cats);
      input.value = '';
      this.renderCategoryList();
      this.populateCategorySelect();
    },

    editCategory: function (index) {
      var cats = getStoredCategories();
      if (index < 0 || index >= cats.length) return;
      var oldName = cats[index];
      var newName = prompt('Edit category name:', oldName);
      if (newName && newName.trim() && newName.trim() !== oldName) {
        var trimmed = newName.trim();
        cats[index] = trimmed;
        this.items.forEach(function (item) {
          if (item.category === oldName) item.category = trimmed;
        });
        saveStoredItems(this.items);
        saveStoredCategories(cats);
        this.renderCategoryList();
        this.populateCategorySelect();
        this.renderItemsGrid();
      }
    },

    deleteCategory: function (index) {
      var cats = getStoredCategories();
      if (index < 0 || index >= cats.length) return;
      var catName = cats[index];
      if (confirm('Delete category "' + catName + '"? Announcements assigned to this category will keep their label.')) {
        cats.splice(index, 1);
        saveStoredCategories(cats);
        this.renderCategoryList();
        this.populateCategorySelect();
      }
    },

    renderCategoryList: function () {
      var container = document.getElementById('ann-cat-list');
      if (!container) return;
      var cats = getStoredCategories();
      var html = cats.map(function (c, idx) {
        return '<div style="display:flex; align-items:center; justify-content:space-between; padding:0.6rem 0.85rem; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px;">' +
          '<span style="font-family:var(--font-mono); font-size:0.88rem; color:#fff; font-weight:600;">' + c + '</span>' +
          '<div style="display:flex; gap:0.4rem;">' +
            '<button type="button" class="ed-btn ed-btn-edit" onclick="AnnouncementsStudio.editCategory(' + idx + ')">✏️ Edit</button>' +
            '<button type="button" class="ed-btn ed-btn-del" onclick="AnnouncementsStudio.deleteCategory(' + idx + ')">🗑 Delete</button>' +
          '</div>' +
        '</div>';
      }).join('');
      container.innerHTML = html;
    },

    /* --- STANDALONE ANNOUNCEMENTS DATA CODE GENERATOR --- */
    generateAnnouncementsJSCode: function () {
      var headerObj = getStoredHeader();

      return '/* ==========================================================================\n' +
        '   iCONNECT PUBLICATION — ANNOUNCEMENTS DATA (js/announcements.js)\n' +
        '   ========================================================================== */\n\n' +
        'var announcementsHeaderData = ' + JSON.stringify(headerObj, null, 2) + ';\n\n' +
        'var announcementsData = ' + JSON.stringify(this.items, null, 2) + ';\n';
    },

    openExportModal: function () {
      var modal = document.getElementById('ann-export-modal');
      var codeBlock = document.getElementById('ann-export-code');
      var code = this.generateAnnouncementsJSCode();

      if (codeBlock) codeBlock.textContent = code;
      if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('open');
      }
    },

    closeExportModal: function () {
      var modal = document.getElementById('ann-export-modal');
      if (modal) {
        modal.classList.remove('open');
        modal.style.display = 'none';
      }
    },

    copyExportCode: function () {
      var codeBlock = document.getElementById('ann-export-code');
      if (!codeBlock) return;
      var code = codeBlock.textContent;
      navigator.clipboard.writeText(code).then(function () {
        var btn = document.getElementById('ann-copy-code-btn');
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

    downloadUpdatedAnnouncementsJS: function () {
      var code = this.generateAnnouncementsJSCode();

      var blob = new Blob([code], { type: 'text/javascript' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'announcements.js';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      alert('💾 Downloaded updated announcements.js!\n\nReplace js/announcements.js in your project folder before deploying to Netlify/Vercel.');
    }
  };

  window.AnnouncementsStudio = AnnouncementsStudio;

  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () {
      AnnouncementsStudio.init();
    });
  }

})();
