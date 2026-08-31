/* ==========================================================================
   iCONNECT — CREATIVES & MULTIMEDIA STUDIO MANAGER (js/creatives-studio.js)
   Full CRUD: Add, Edit, Delete, Reorder, Photo Upload, Live Publish & Code Export
   ========================================================================== */

(function () {
  'use strict';

  var STORAGE_KEY = 'iconnect_creatives_gallery';
  var CAT_STORAGE_KEY = 'iconnect_creatives_categories';
  var HEADER_STORAGE_KEY = 'iconnect_creatives_header';

  function getStoredHeader() {
    try {
      var stored = JSON.parse(localStorage.getItem(HEADER_STORAGE_KEY));
      if (stored && typeof stored === 'object') return stored;
    } catch (e) {}
    return (window.creativesHeaderData || {
      badge: "Visual & Media Showcase",
      title: "Creatives & Multimedia Gallery",
      description: "Generative art, photography, graphic design, and digital publication covers."
    });
  }

  function saveStoredHeader(header) {
    try {
      localStorage.setItem(HEADER_STORAGE_KEY, JSON.stringify(header));
    } catch (e) {}
  }

  function compressImageFile(file, callback) {
    var reader = new FileReader();
    reader.onload = function (e) {
      var img = new Image();
      img.onload = function () {
        var canvas = document.createElement('canvas');
        var maxDim = 1400;
        var width = img.width;
        var height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        var mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        if (file.size > 200000) mimeType = 'image/jpeg';
        var compressedBase64 = canvas.toDataURL(mimeType, 0.82);
        callback(compressedBase64);
      };
      img.onerror = function () {
        callback(e.target.result);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  var defaultCategories = ['Digital Art', 'Photography', 'Infographic', 'Campus Life', '3D Render', 'Video Visual'];

  var defaultItems = [
    {
      id: 'cr-1',
      title: 'Cybernetic Neural Mesh',
      category: 'Digital Art',
      image: 'assets/images/articles/gallery-1.jpg',
      description: 'Cybernetic generative mesh art crafted by BSCS multimedia scholars.'
    },
    {
      id: 'cr-2',
      title: 'BSCS Code Fest 2026 Highlights',
      category: 'Photography',
      image: 'assets/images/articles/gallery-2.jpg',
      description: 'Highlights from the 2-day hackathon and software engineering competition.'
    },
    {
      id: 'cr-3',
      title: 'Data Stream Architecture Blueprint',
      category: 'Infographic',
      image: 'assets/images/articles/gallery-3.jpg',
      description: 'Infographic blueprint explaining asynchronous full-stack data flow.'
    },
    {
      id: 'cr-4',
      title: 'CAPSU Mambusao Campus Night Lights',
      category: 'Campus Life',
      image: 'assets/images/articles/gallery-4.jpg',
      description: 'Night photography capturing the satellite college campus laboratory.'
    },
    {
      id: 'cr-5',
      title: 'Sample 1',
      category: 'Infographic',
      image: 'assets/images/articles/gallery-5.jpeg',
      description: 'Featured visual media asset.'
    },
    {
      id: 'cr-6',
      title: 'Sample 2',
      category: 'Infographic',
      image: 'assets/images/articles/gallery-6.jpeg',
      description: 'Featured visual media asset.'
    },
    {
      id: 'cr-7',
      title: 'Sample 3',
      category: 'Infographic',
      image: 'assets/images/articles/gallery-7.jpg',
      description: 'Featured visual media asset.'
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

    if (typeof window.creativesGalleryData !== 'undefined' && Array.isArray(window.creativesGalleryData) && window.creativesGalleryData.length > 0) {
      return window.creativesGalleryData;
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

  var CreativesStudio = {
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
      var badge = (document.getElementById('cr-header-badge') ? document.getElementById('cr-header-badge').value.trim() : '') || 'Visual & Media Showcase';
      var title = (document.getElementById('cr-header-title') ? document.getElementById('cr-header-title').value.trim() : '') || 'Creatives & Multimedia Gallery';
      var desc  = (document.getElementById('cr-header-desc') ? document.getElementById('cr-header-desc').value.trim() : '') || '';

      var header = { badge: badge, title: title, description: desc };
      saveStoredHeader(header);
      alert('✅ Creatives Header Settings Saved!\n\nBadge: "' + badge + '"\nTitle: "' + title + '"');
    },

    loadHeaderSettingsForm: function () {
      var h = getStoredHeader();
      var badgeInput = document.getElementById('cr-header-badge');
      var titleInput = document.getElementById('cr-header-title');
      var descInput  = document.getElementById('cr-header-desc');

      if (badgeInput) badgeInput.value = h.badge || 'Visual & Media Showcase';
      if (titleInput) titleInput.value = h.title || 'Creatives & Multimedia Gallery';
      if (descInput)  descInput.value  = h.description || '';
    },

    cacheDOM: function () {
      this.form = document.getElementById('cr-item-form');
      this.idInput = document.getElementById('cr-item-id');
      this.titleInput = document.getElementById('cr-title');
      this.categoryInput = document.getElementById('cr-category');
      this.descInput = document.getElementById('cr-desc');
      this.photoUrlInput = document.getElementById('cr-photo-url');
      this.photoFileInput = document.getElementById('cr-photo-file');
      this.photoPreview = document.getElementById('cr-photo-preview');

      this.submitBtn = document.getElementById('cr-submit-btn');
      this.clearBtn = document.getElementById('cr-clear-btn');
      this.deleteBtn = document.getElementById('cr-delete-btn');
      this.formTitle = document.getElementById('cr-form-title');

      this.gridContainer = document.getElementById('cr-items-grid');
      this.itemCountEl = document.getElementById('cr-item-count');
      this.searchInput = document.getElementById('cr-search-input');
      this.exportCodeBlock = document.getElementById('cr-export-code');
      this.exportModal = document.getElementById('cr-export-modal');
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
          compressImageFile(file, function (compressedData) {
            self.currentPhotoBase64 = compressedData;
            if (self.photoUrlInput) self.photoUrlInput.value = '';
            self.updatePhotoPreview();
          });
        });
      }

      if (this.photoUrlInput) {
        this.photoUrlInput.addEventListener('input', function () {
          self.currentPhotoBase64 = '';
          self.updatePhotoPreview();
        });
      }

      if (this.searchInput) {
        this.searchInput.addEventListener('input', function () {
          self.renderItemsGrid();
        });
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

    resetForm: function () {
      this.editingId = null;
      this.currentPhotoBase64 = '';
      if (this.form) this.form.reset();
      if (this.idInput) this.idInput.value = '';
      if (this.formTitle) this.formTitle.textContent = '➕ Add Creative Gallery Photo';
      if (this.submitBtn) this.submitBtn.textContent = '➕ Save Gallery Photo';
      if (this.deleteBtn) this.deleteBtn.style.display = 'none';
      this.updatePhotoPreview();
    },

    saveItem: function () {
      var title = this.titleInput ? this.titleInput.value.trim() : '';
      var category = this.categoryInput ? this.categoryInput.value : 'Digital Art';
      var desc = this.descInput ? this.descInput.value.trim() : '';
      var photoUrl = this.photoUrlInput ? this.photoUrlInput.value.trim() : '';
      var image = this.currentPhotoBase64 || photoUrl || 'assets/images/articles/gallery-1.jpg';

      if (!title) {
        alert('Please enter a Title for the photo/creative asset.');
        if (this.titleInput) this.titleInput.focus();
        return;
      }

      var itemObj = {
        id: this.editingId || ('cr-' + Date.now()),
        title: title,
        category: category,
        image: image,
        description: desc || 'Creative visual media asset for the iConnect Gallery.'
      };

      if (this.editingId) {
        for (var i = 0; i < this.items.length; i++) {
          if (String(this.items[i].id) === String(this.editingId)) {
            this.items[i] = itemObj;
            break;
          }
        }
      } else {
        // Last-In, First-Display: Add to top of the list so newest photo is displayed 1st
        this.items.unshift(itemObj);
      }

      saveStoredItems(this.items);
      this.renderItemsGrid();
      this.resetForm();
      alert('✅ Gallery Photo Saved Successfully!');
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
      if (this.categoryInput) this.categoryInput.value = found.category || 'Digital Art';
      if (this.descInput) this.descInput.value = found.description || '';

      if (found.image && found.image.indexOf('data:image') === 0) {
        this.currentPhotoBase64 = found.image;
        if (this.photoUrlInput) this.photoUrlInput.value = '';
      } else {
        this.currentPhotoBase64 = '';
        if (this.photoUrlInput) this.photoUrlInput.value = found.image || '';
      }

      if (this.formTitle) this.formTitle.textContent = '✏️ Edit Photo: ' + found.title;
      if (this.submitBtn) this.submitBtn.textContent = '💾 Update Gallery Photo';
      if (this.deleteBtn) this.deleteBtn.style.display = 'inline-block';

      this.updatePhotoPreview();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    deleteItem: function (id) {
      if (!id) return;
      var found = null;
      for (var i = 0; i < this.items.length; i++) {
        if (String(this.items[i].id) === String(id)) { found = this.items[i]; break; }
      }
      var title = found ? found.title : 'this photo';

      if (confirm('Are you sure you want to delete "' + title + '" from the Creatives Gallery?')) {
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
               (item.description && item.description.toLowerCase().indexOf(query) !== -1);
      });

      if (this.itemCountEl) this.itemCountEl.textContent = filtered.length;

      if (filtered.length === 0) {
        this.gridContainer.innerHTML =
          '<div style="grid-column: 1 / -1; text-align: center; padding: 3rem; background: rgba(255,255,255,0.02); border-radius: 16px; border: 1px dashed rgba(255,255,255,0.1);">' +
            '<p style="color: var(--text-muted); margin-bottom: 1rem;">No creative photos found matching your search.</p>' +
            '<button class="btn-export" onclick="CreativesStudio.resetForm()">➕ Add New Photo</button>' +
          '</div>';
        return;
      }

      var html = filtered.map(function (item, idx) {
        var badgeColor = 'background:rgba(244,180,26,0.2); color:#f4b41a; border:1px solid rgba(244,180,26,0.4);';

        return '<div class="ed-card-item">' +
          '<div style="position:relative; border-radius:12px; overflow:hidden; aspect-ratio:16/10; margin-bottom:0.85rem; border:1px solid rgba(255,255,255,0.1); background:#000;">' +
            '<img src="' + item.image + '" alt="' + item.title + '" style="width:100%; height:100%; object-fit:cover;" onerror="this.src=\'assets/images/articles/gallery-1.jpg\';" />' +
            '<span class="ed-category-badge" style="position:absolute; top:8px; right:8px; ' + badgeColor + '">' + (item.category || 'Digital Art') + '</span>' +
          '</div>' +
          '<h4 class="ed-card-name" style="font-size:1.05rem; margin-bottom:0.35rem;">' + item.title + '</h4>' +
          '<p class="ed-card-bio" style="font-size:0.85rem; color:var(--text-subtle); margin-bottom:0.85rem;">' + (item.description || 'Creative Gallery Asset') + '</p>' +
          '<div class="ed-card-actions">' +
            '<button class="ed-btn ed-btn-edit" onclick="CreativesStudio.editItem(\'' + item.id + '\')">✏️ Edit</button>' +
            '<button class="ed-btn ed-btn-del" onclick="CreativesStudio.deleteItem(\'' + item.id + '\')">🗑 Delete</button>' +
            '<button class="ed-btn ed-btn-move" onclick="CreativesStudio.moveItem(\'' + item.id + '\', \'up\')" ' + (idx === 0 ? 'disabled' : '') + '>⬆</button>' +
            '<button class="ed-btn ed-btn-move" onclick="CreativesStudio.moveItem(\'' + item.id + '\', \'down\')" ' + (idx === filtered.length - 1 ? 'disabled' : '') + '>⬇</button>' +
          '</div>' +
        '</div>';
      }).join('');

      this.gridContainer.innerHTML = html;
    },

    publishLive: function () {
      saveStoredItems(this.items);
      alert('🎉 Creatives & Multimedia Gallery Live Sync Complete!\n\nAll ' + this.items.length + ' photos are now published live across the iConnect Publication site.');
    },

    /* --- Category Management System --- */
    populateCategorySelect: function () {
      this.categoryInput = this.categoryInput || document.getElementById('cr-category');
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
      var modal = document.getElementById('cr-cat-modal');
      if (!modal) return;
      this.renderCategoryList();
      modal.style.display = 'flex';
      modal.classList.add('open');
    },

    closeCategoryModal: function () {
      var modal = document.getElementById('cr-cat-modal');
      if (modal) {
        modal.classList.remove('open');
        modal.style.display = 'none';
      }
      this.populateCategorySelect();
    },

    addCategory: function () {
      var input = document.getElementById('cr-new-cat-input');
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
      if (confirm('Delete category "' + catName + '"? Photos assigned to this category will keep their label.')) {
        cats.splice(index, 1);
        saveStoredCategories(cats);
        this.renderCategoryList();
        this.populateCategorySelect();
      }
    },

    renderCategoryList: function () {
      var container = document.getElementById('cr-cat-list');
      if (!container) return;
      var cats = getStoredCategories();
      var html = cats.map(function (c, idx) {
        return '<div style="display:flex; align-items:center; justify-content:space-between; padding:0.6rem 0.85rem; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px;">' +
          '<span style="font-family:var(--font-mono); font-size:0.88rem; color:#fff; font-weight:600;">' + c + '</span>' +
          '<div style="display:flex; gap:0.4rem;">' +
            '<button type="button" class="ed-btn ed-btn-edit" onclick="CreativesStudio.editCategory(' + idx + ')">✏️ Edit</button>' +
            '<button type="button" class="ed-btn ed-btn-del" onclick="CreativesStudio.deleteCategory(' + idx + ')">🗑 Delete</button>' +
          '</div>' +
        '</div>';
      }).join('');
      container.innerHTML = html;
    },

    /* --- STANDALONE CREATIVES GALLERY CODE GENERATOR --- */
    generateCreativesJSCode: function () {
      var headerObj = getStoredHeader();

      return '/* ==========================================================================\n' +
        '   iCONNECT PUBLICATION — CREATIVE & MULTIMEDIA GALLERY DATA (js/creatives.js)\n' +
        '   ========================================================================== */\n\n' +
        'var creativesHeaderData = ' + JSON.stringify(headerObj, null, 2) + ';\n\n' +
        'var creativesGalleryData = ' + JSON.stringify(this.items, null, 2) + ';\n';
    },

    openExportModal: function () {
      var modal = document.getElementById('cr-export-modal');
      var codeBlock = document.getElementById('cr-export-code');
      var code = this.generateCreativesJSCode();

      if (codeBlock) codeBlock.textContent = code;
      if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('open');
      }
    },

    closeExportModal: function () {
      var modal = document.getElementById('cr-export-modal');
      if (modal) {
        modal.classList.remove('open');
        modal.style.display = 'none';
      }
    },

    copyExportCode: function () {
      var codeBlock = document.getElementById('cr-export-code');
      if (!codeBlock) return;
      var code = codeBlock.textContent;
      navigator.clipboard.writeText(code).then(function () {
        var btn = document.getElementById('cr-copy-code-btn');
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

    downloadUpdatedCreativesJS: function () {
      var code = this.generateCreativesJSCode();

      var blob = new Blob([code], { type: 'text/javascript' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'creatives.js';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      alert('💾 Downloaded updated creatives.js!\n\nReplace js/creatives.js in your project folder before deploying to Netlify/Vercel.');
    }
  };

  window.CreativesStudio = CreativesStudio;

  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () {
      CreativesStudio.init();
      if (window.StudioVisibility) {
        window.StudioVisibility.init('creatives');
      }
    });
  }

})();
