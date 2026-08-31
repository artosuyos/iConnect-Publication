/* ==========================================================================
   iCONNECT — EDITORIAL BOARD STUDIO MANAGER (js/editorial-studio.js)
   Full CRUD: Add, Edit, Delete, Reorder, Photo Upload, Level/Tier Assignments,
   Live Publishing & Standalone Codebase Exporter
   ========================================================================== */

(function () {
  'use strict';

  var STORAGE_KEY = 'iconnect_editorial_board';
  var CAT_STORAGE_KEY = 'iconnect_editorial_categories';
  var HEADER_STORAGE_KEY = 'iconnect_editorial_header';
  var LEVEL_STORAGE_KEY = 'iconnect_editorial_levels';

  function getPublishedHeader() {
    return (window.editorialHeaderData || {
      badge: "Leadership & Staff",
      title: "The Editorial Board",
      description: "Meet the student journalists, developers, and editors driving the iConnect publication network."
    });
  }

  function getStoredHeader() {
    try {
      var stored = JSON.parse(localStorage.getItem(HEADER_STORAGE_KEY));
      if (stored && typeof stored === 'object') return stored;
    } catch (e) {}
    return getPublishedHeader();
  }

  function saveStoredHeader(header) {
    try {
      localStorage.setItem(HEADER_STORAGE_KEY, JSON.stringify(header));
    } catch (e) {}
  }

  var defaultCategories = ['Adviser', 'Executive Board', 'Editorial Staff', 'Design & Media', 'Photojournalism Staff', 'Contributors'];

  var defaultLevels = [
    { id: 1, name: "Level 1" },
    { id: 2, name: "Level 2" },
    { id: 3, name: "Level 3" },
    { id: 4, name: "Level 4" },
    { id: 5, name: "Level 5" },
    { id: 6, name: "Level 6" }
  ];

  function getPublishedLevels() {
    if (window.editorialLevelsData && Array.isArray(window.editorialLevelsData) && window.editorialLevelsData.length > 0) {
      return window.editorialLevelsData;
    }
    return defaultLevels;
  }

  function getStoredLevels() {
    try {
      var data = localStorage.getItem(LEVEL_STORAGE_KEY);
      if (data) {
        var parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(function (item, idx) {
            if (typeof item === 'string') return { id: idx + 1, name: item };
            if (item && typeof item === 'object') return { id: item.id || (idx + 1), name: item.name || ("Level " + (idx + 1)) };
            return { id: idx + 1, name: "Level " + (idx + 1) };
          });
        }
      }
    } catch (e) {}

    return getPublishedLevels();
  }

  function saveStoredLevels(levels) {
    try {
      localStorage.setItem(LEVEL_STORAGE_KEY, JSON.stringify(levels));
      return true;
    } catch (e) {
      console.error('Levels storage error:', e);
      return false;
    }
  }

  function getPublishedMembers() {
    var published = [];
    if (typeof window.adviserData !== 'undefined' && window.adviserData) {
      published.push(Object.assign({}, window.adviserData, {
        id: window.adviserData.id || 'ed-adviser-0',
        _isAdviser: true,
        category: window.adviserData.category || 'Adviser',
        tier: window.adviserData.tier || 1,
        tierLabel: window.adviserData.tierLabel || ("Level " + (window.adviserData.tier || 1))
      }));
    }
    if (typeof window.editorialTeamData !== 'undefined' && Array.isArray(window.editorialTeamData)) {
      window.editorialTeamData.forEach(function (m, idx) {
        published.push(Object.assign({}, m, {
          id: m.id || ('ed-member-' + idx),
          category: m.category || 'Editorial Staff',
          tier: m.tier || 2,
          tierLabel: m.tierLabel || ("Level " + (m.tier || 2))
        }));
      });
    }
    return published;
  }

  function getStoredMembers() {
    try {
      var data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        var parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}

    return getPublishedMembers();
  }

  function saveStoredMembers(members) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
      return true;
    } catch (e) {
      console.error('Members storage error:', e);
      return false;
    }
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

  function computeInitials(name) {
    if (!name) return 'ED';
    var parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  var EditorialStudio = {
    members: [],
    editingId: null,
    currentPhotoBase64: '',
    currentHeaderThumbBase64: '',

    init: function () {
      this.members = getStoredMembers();
      this.cacheDOM();
      this.bindEvents();
      this.populateCategorySelect();
      this.populateLevelSelect();
      this.renderMembersGrid();
      this.loadHeaderSettingsForm();
    },

    saveHeaderSettings: function () {
      var badge = (document.getElementById('ed-header-badge') ? document.getElementById('ed-header-badge').value.trim() : '') || 'Leadership & Staff';
      var title = (document.getElementById('ed-header-title') ? document.getElementById('ed-header-title').value.trim() : '') || 'The Editorial Board';
      var desc  = (document.getElementById('ed-header-desc') ? document.getElementById('ed-header-desc').value.trim() : '') || '';
      var thumb = (this.currentHeaderThumbBase64 || (document.getElementById('ed-header-thumb-url') ? document.getElementById('ed-header-thumb-url').value.trim() : '') || './assets/logo/iconnect-share-thumbnail.jpg');

      var header = { badge: badge, title: title, description: desc, thumbnail: thumb };
      saveStoredHeader(header);
      alert('✅ Editorial Header & Thumbnail Settings Saved!\n\nBadge: "' + badge + '"\nTitle: "' + title + '"\nThumbnail: ' + (thumb.substring(0, 45) + '...'));
    },

    loadHeaderSettingsForm: function () {
      var h = getStoredHeader();
      var badgeInput = document.getElementById('ed-header-badge');
      var titleInput = document.getElementById('ed-header-title');
      var descInput  = document.getElementById('ed-header-desc');
      var thumbInput = document.getElementById('ed-header-thumb-url');

      if (badgeInput) badgeInput.value = h.badge || 'Leadership & Staff';
      if (titleInput) titleInput.value = h.title || 'The Editorial Board';
      if (descInput)  descInput.value  = h.description || '';
      if (thumbInput) thumbInput.value = h.thumbnail || '';

      this.updateHeaderThumbPreview(h.thumbnail || '');
    },

    updateHeaderThumbPreview: function (customSrc) {
      var preview = document.getElementById('ed-header-thumb-preview');
      var placeholder = document.getElementById('ed-header-thumb-placeholder');
      if (!preview) return;

      var src = customSrc || this.currentHeaderThumbBase64 || (document.getElementById('ed-header-thumb-url') ? document.getElementById('ed-header-thumb-url').value.trim() : '');
      if (src) {
        preview.src = src;
        preview.style.display = 'block';
        if (placeholder) placeholder.style.display = 'none';
      } else {
        preview.src = '';
        preview.style.display = 'none';
        if (placeholder) placeholder.style.display = 'block';
      }
    },

    cacheDOM: function () {
      this.form = document.getElementById('ed-member-form');
      this.idInput = document.getElementById('ed-member-id');
      this.nameInput = document.getElementById('ed-name');
      this.roleInput = document.getElementById('ed-role');
      this.yearInput = document.getElementById('ed-year');
      this.categoryInput = document.getElementById('ed-category');
      this.tierInput = document.getElementById('ed-tier');
      this.photoFileInput = document.getElementById('ed-photo-file');
      this.photoUrlInput = document.getElementById('ed-photo-url');
      this.photoPreview = document.getElementById('ed-photo-preview');
      this.bioInput = document.getElementById('ed-bio');
      this.formTitle = document.getElementById('ed-form-title');
      this.submitBtn = document.getElementById('ed-submit-btn');
      this.clearBtn = document.getElementById('ed-clear-btn');
      this.deleteBtn = document.getElementById('ed-delete-btn');
      this.gridContainer = document.getElementById('ed-members-grid');
      this.memberCountEl = document.getElementById('ed-member-count');
      this.searchInput = document.getElementById('ed-search-input');

      this.headerThumbFile = document.getElementById('ed-header-thumb-file');
      this.headerThumbUrl = document.getElementById('ed-header-thumb-url');
      this.headerThumbClear = document.getElementById('ed-header-thumb-clear');
    },

    bindEvents: function () {
      var self = this;

      if (this.headerThumbFile) {
        this.headerThumbFile.addEventListener('change', function (e) {
          var file = e.target.files[0];
          if (!file) return;
          var reader = new FileReader();
          reader.onload = function (evt) {
            var img = new Image();
            img.onload = function () {
              var canvas = document.createElement('canvas');
              var MAX_WIDTH = 1200;
              var width = img.width;
              var height = img.height;
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
              canvas.width = width;
              canvas.height = height;
              var ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0, width, height);
              self.currentHeaderThumbBase64 = canvas.toDataURL('image/jpeg', 0.85);
              if (self.headerThumbUrl) self.headerThumbUrl.value = '';
              self.updateHeaderThumbPreview();
            };
            img.src = evt.target.result;
          };
          reader.readAsDataURL(file);
        });
      }

      if (this.headerThumbUrl) {
        this.headerThumbUrl.addEventListener('input', function () {
          self.currentHeaderThumbBase64 = '';
          self.updateHeaderThumbPreview();
        });
      }

      if (this.headerThumbClear) {
        this.headerThumbClear.addEventListener('click', function () {
          self.currentHeaderThumbBase64 = '';
          if (self.headerThumbUrl) self.headerThumbUrl.value = '';
          if (self.headerThumbFile) self.headerThumbFile.value = '';
          self.updateHeaderThumbPreview();
        });
      }

      if (this.clearBtn) {
        this.clearBtn.addEventListener('click', function () {
          self.resetForm();
        });
      }

      if (this.deleteBtn) {
        this.deleteBtn.addEventListener('click', function () {
          if (self.editingId) self.deleteMember(self.editingId);
        });
      }

      if (this.photoFileInput) {
        this.photoFileInput.addEventListener('change', function (e) {
          var file = e.target.files[0];
          if (!file) return;

          var reader = new FileReader();
          reader.onload = function (evt) {
            var img = new Image();
            img.onload = function () {
              var canvas = document.createElement('canvas');
              var MAX_WIDTH = 500;
              var MAX_HEIGHT = 500;
              var width = img.width;
              var height = img.height;

              if (width > height) {
                if (width > MAX_WIDTH) {
                  height *= MAX_WIDTH / width;
                  width = MAX_WIDTH;
                }
              } else {
                if (height > MAX_HEIGHT) {
                  width *= MAX_HEIGHT / height;
                  height = MAX_HEIGHT;
                }
              }

              canvas.width = width;
              canvas.height = height;
              var ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0, width, height);

              self.currentPhotoBase64 = canvas.toDataURL('image/jpeg', 0.85);
              if (self.photoUrlInput) self.photoUrlInput.value = '';
              self.updatePhotoPreview();
            };
            img.src = evt.target.result;
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

      if (this.searchInput) {
        this.searchInput.addEventListener('input', function () {
          self.renderMembersGrid();
        });
      }
    },

    updatePhotoPreview: function () {
      if (!this.photoPreview) return;
      var src = this.currentPhotoBase64 || (this.photoUrlInput ? this.photoUrlInput.value.trim() : '');
      if (src) {
        this.photoPreview.src = src;
        this.photoPreview.style.display = 'block';
        if (this.photoPreview.nextElementSibling) {
          this.photoPreview.nextElementSibling.style.display = 'none';
        }
      } else {
        this.photoPreview.src = '';
        this.photoPreview.style.display = 'none';
        if (this.photoPreview.nextElementSibling) {
          this.photoPreview.nextElementSibling.style.display = 'flex';
        }
      }
    },

    resetForm: function () {
      this.editingId = null;
      this.currentPhotoBase64 = '';
      if (this.form) this.form.reset();
      if (this.idInput) this.idInput.value = '';
      if (this.formTitle) this.formTitle.textContent = '➕ Add Editorial Board Member';
      if (this.submitBtn) this.submitBtn.textContent = '➕ Save Member Card';
      if (this.deleteBtn) this.deleteBtn.style.display = 'none';
      if (this.categoryInput) this.categoryInput.selectedIndex = 0;
      if (this.tierInput) this.tierInput.selectedIndex = 0;
      this.updatePhotoPreview();
    },

    saveMember: function () {
      var self = this;
      var name = this.nameInput ? this.nameInput.value.trim() : '';
      var role = this.roleInput ? this.roleInput.value.trim() : '';
      var yearLevel = this.yearInput ? this.yearInput.value.trim() : '';
      var category = this.categoryInput ? this.categoryInput.value : 'Editorial Staff';
      var tierVal = this.tierInput ? parseInt(this.tierInput.value, 10) : 2;
      var tier = isNaN(tierVal) ? 2 : tierVal;
      var bio = this.bioInput ? this.bioInput.value.trim() : '';
      var photoUrl = this.photoUrlInput ? this.photoUrlInput.value.trim() : '';
      
      var existingImage = '';
      if (this.editingId) {
        var foundExisting = this.members.find(function (m) { return m.id === self.editingId; });
        if (foundExisting) existingImage = foundExisting.image || '';
      }
      var image = this.currentPhotoBase64 || photoUrl || existingImage || 'assets/images/team/art-jayson-osuyos.jpg';

      if (!name) {
        alert('Please enter member name.');
        if (this.nameInput) this.nameInput.focus();
        return;
      }
      if (!role) {
        alert('Please enter member position/role.');
        if (this.roleInput) this.roleInput.focus();
        return;
      }

      var levels = getStoredLevels();
      var matchedLevel = levels.find(function (l) { return Number(l.id) === tier; });
      var tierLabel = matchedLevel ? matchedLevel.name : ("Level " + tier);

      var memberObj = {
        id: this.editingId || ('ed-' + Date.now()),
        name: name,
        role: role,
        tier: tier,
        tierLabel: tierLabel,
        yearLevel: yearLevel || 'BSCS Department',
        category: category,
        initials: computeInitials(name),
        image: image,
        bio: bio || 'Editorial Board Member for the iConnect Publication.',
        _isAdviser: (category === 'Adviser' || role.toLowerCase().includes('adviser'))
      };

      if (this.editingId) {
        for (var i = 0; i < this.members.length; i++) {
          if (this.members[i].id === this.editingId) {
            this.members[i] = memberObj;
            break;
          }
        }
      } else {
        if (memberObj._isAdviser) {
          this.members.unshift(memberObj);
        } else {
          this.members.push(memberObj);
        }
      }

      saveStoredMembers(this.members);
      this.renderMembersGrid();
      this.resetForm();
      alert('✅ Member Card Saved Successfully!');
    },

    editMember: function (id) {
      var found = null;
      for (var i = 0; i < this.members.length; i++) {
        if (this.members[i].id === id) { found = this.members[i]; break; }
      }
      if (!found) return;

      this.editingId = found.id;
      if (this.idInput) this.idInput.value = found.id;
      if (this.nameInput) this.nameInput.value = found.name || '';
      if (this.roleInput) this.roleInput.value = found.role || '';
      if (this.yearInput) this.yearInput.value = found.yearLevel || '';
      if (this.categoryInput) this.categoryInput.value = found.category || (found._isAdviser ? 'Adviser' : 'Editorial Staff');
      if (this.tierInput) this.tierInput.value = found.tier || (found._isAdviser ? 1 : 2);
      if (this.bioInput) this.bioInput.value = found.bio || '';

      if (found.image && found.image.indexOf('data:image') === 0) {
        this.currentPhotoBase64 = found.image;
        if (this.photoUrlInput) this.photoUrlInput.value = '';
      } else {
        this.currentPhotoBase64 = '';
        if (this.photoUrlInput) this.photoUrlInput.value = found.image || '';
      }

      if (this.formTitle) this.formTitle.textContent = '✏️ Edit Member: ' + found.name;
      if (this.submitBtn) this.submitBtn.textContent = '💾 Update Member Card';
      if (this.deleteBtn) this.deleteBtn.style.display = 'inline-block';

      this.updatePhotoPreview();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    deleteMember: function (id) {
      if (!id) return;
      var member = null;
      for (var i = 0; i < this.members.length; i++) {
        if (this.members[i].id === id) { member = this.members[i]; break; }
      }
      var name = member ? member.name : 'this member';

      if (confirm('Are you sure you want to delete "' + name + '" from the Editorial Board?')) {
        this.members = this.members.filter(function (m) { return m.id !== id; });
        saveStoredMembers(this.members);
        this.renderMembersGrid();
        this.resetForm();
      }
    },

    moveMember: function (id, direction) {
      var idx = -1;
      for (var i = 0; i < this.members.length; i++) {
        if (this.members[i].id === id) { idx = i; break; }
      }
      if (idx === -1) return;

      var targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= this.members.length) return;

      var temp = this.members[idx];
      this.members[idx] = this.members[targetIdx];
      this.members[targetIdx] = temp;

      saveStoredMembers(this.members);
      this.renderMembersGrid();
    },

    renderMembersGrid: function () {
      if (!this.gridContainer) return;

      var query = this.searchInput ? this.searchInput.value.toLowerCase().trim() : '';
      var filtered = this.members.filter(function (m) {
        if (!query) return true;
        return (m.name && m.name.toLowerCase().indexOf(query) !== -1) ||
               (m.role && m.role.toLowerCase().indexOf(query) !== -1) ||
               (m.yearLevel && m.yearLevel.toLowerCase().indexOf(query) !== -1) ||
               (m.category && m.category.toLowerCase().indexOf(query) !== -1);
      });

      if (this.memberCountEl) this.memberCountEl.textContent = filtered.length;

      if (filtered.length === 0) {
        this.gridContainer.innerHTML =
          '<div style="text-align: center; padding: 3rem; background: rgba(255,255,255,0.02); border-radius: 16px; border: 1px dashed rgba(255,255,255,0.1); width: 100%;">' +
            '<p style="color: var(--text-muted); margin-bottom: 1rem;">No editorial members found matching your search.</p>' +
            '<button class="btn-export" onclick="EditorialStudio.resetForm()">➕ Add New Member</button>' +
          '</div>';
        return;
      }

      var levelsList = getStoredLevels();
      var levelMap = {};
      levelsList.forEach(function (lvl, idx) {
        levelMap[lvl.id] = lvl.name;
      });

      // Group members by level
      var grouped = {};
      filtered.forEach(function (m) {
        var t = m.tier || (m._isAdviser ? 1 : 2);
        if (!grouped[t]) grouped[t] = [];
        grouped[t].push(m);
      });

      var tierKeys = Object.keys(grouped).sort(function (a, b) {
        return parseInt(a, 10) - parseInt(b, 10);
      });

      var html = '';
      tierKeys.forEach(function (tierKey) {
        var group = grouped[tierKey];
        var tierNum = parseInt(tierKey, 10);
        var levelTitle = levelMap[tierNum] || ('Level ' + tierNum);

        html += '<div style="margin-bottom: 2rem; width: 100%;">';
        html += '<div style="display:flex; align-items:center; justify-content:space-between; padding: 0.6rem 1rem; background: rgba(244, 180, 26, 0.08); border-left: 3px solid var(--cheddar-yellow); border-radius: 8px; margin-bottom: 1rem;">' +
                  '<div style="display:flex; align-items:center; gap: 0.5rem;">' +
                    '<span style="font-family:var(--font-mono); font-size:0.75rem; color:var(--cheddar-yellow); background:rgba(244,180,26,0.15); padding:0.2rem 0.6rem; border-radius:999px; font-weight:700;">Level ' + tierNum + '</span>' +
                    '<strong style="color:#fff; font-size:0.95rem; font-family:var(--font-heading);">' + levelTitle + '</strong>' +
                  '</div>' +
                  '<span style="font-size:0.75rem; color:var(--text-subtle);">' + group.length + ' member' + (group.length > 1 ? 's' : '') + '</span>' +
                '</div>';

        html += '<div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.25rem;">';
        group.forEach(function (m, idx) {
          var isAdviser = m._isAdviser || m.category === 'Adviser';
          var badgeColor = isAdviser ? 'background:rgba(244,180,26,0.2); color:#f4b41a; border:1px solid rgba(244,180,26,0.4);'
                                     : 'background:rgba(0,240,255,0.15); color:#00f0ff; border:1px solid rgba(0,240,255,0.3);';

          var imgHTML = m.image
            ? '<img src="' + m.image + '" alt="' + m.name + '" class="ed-card-photo" onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'flex\';" />' +
              '<div class="ed-card-initials" style="display:none;">' + m.initials + '</div>'
            : '<div class="ed-card-initials">' + m.initials + '</div>';

          html += '<div class="ed-card-item ' + (isAdviser ? 'is-adviser-card' : '') + '" style="margin-bottom:0;">' +
            '<div class="ed-card-header">' +
              '<div class="ed-card-photo-wrapper">' + imgHTML + '</div>' +
              '<div class="ed-card-meta">' +
                '<div style="display:flex; align-items:center; gap:0.35rem; flex-wrap:wrap; margin-bottom:0.25rem;">' +
                  '<span class="ed-category-badge" style="' + badgeColor + ' margin-bottom:0;">' + (m.category || 'Editorial Board') + '</span>' +
                  '<span class="ed-category-badge" style="background:rgba(244,180,26,0.15); color:var(--cheddar-yellow); border:1px solid rgba(244,180,26,0.3); margin-bottom:0;">Level ' + tierNum + '</span>' +
                '</div>' +
                '<h4 class="ed-card-name">' + m.name + '</h4>' +
                '<p class="ed-card-role">' + m.role + '</p>' +
                '<span class="ed-card-year">' + (m.yearLevel || '') + '</span>' +
              '</div>' +
            '</div>' +
            '<p class="ed-card-bio">' + (m.bio || 'Editorial Board Member') + '</p>' +
            '<div class="ed-card-actions">' +
              '<button type="button" class="ed-btn ed-btn-edit" onclick="EditorialStudio.editMember(\'' + m.id + '\')">✏️ Edit</button>' +
              '<button type="button" class="ed-btn ed-btn-del" onclick="EditorialStudio.deleteMember(\'' + m.id + '\')">🗑 Delete</button>' +
              '<button type="button" class="ed-btn ed-btn-move" onclick="EditorialStudio.moveMember(\'' + m.id + '\', \'up\')" ' + (idx === 0 ? 'disabled' : '') + '>⬆</button>' +
              '<button type="button" class="ed-btn ed-btn-move" onclick="EditorialStudio.moveMember(\'' + m.id + '\', \'down\')" ' + (idx === group.length - 1 ? 'disabled' : '') + '>⬇</button>' +
            '</div>' +
          '</div>';
        });
        html += '</div></div>';
      });

      this.gridContainer.innerHTML = html;
    },

    publishLive: function () {
      saveStoredMembers(this.members);
      var levels = getStoredLevels();
      saveStoredLevels(levels);
      var header = getStoredHeader();
      saveStoredHeader(header);
      this.openExportModal();
    },

    resetToPublished: function () {
      if (confirm('🔄 Discard current Studio draft and reload the published Editorial Board from js/editorial.js?')) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(CAT_STORAGE_KEY);
        localStorage.removeItem(HEADER_STORAGE_KEY);
        localStorage.removeItem(LEVEL_STORAGE_KEY);
        this.members = getPublishedMembers();
        this.init();
        alert('✅ Studio workspace reset to published data in js/editorial.js.');
      }
    },

    /* --- Level Management System --- */
    populateLevelSelect: function () {
      this.tierInput = this.tierInput || document.getElementById('ed-tier');
      if (!this.tierInput) return;
      var levels = getStoredLevels();
      var currentVal = this.tierInput.value;
      var html = levels.map(function (lvl) {
        return '<option value="' + lvl.id + '">' + lvl.name + ' (Level ' + lvl.id + ')</option>';
      }).join('');
      this.tierInput.innerHTML = html;
      if (currentVal) {
        this.tierInput.value = currentVal;
      }
    },

    openLevelModal: function () {
      var modal = document.getElementById('ed-level-modal');
      if (!modal) return;
      this.renderLevelsList();
      modal.style.display = 'flex';
      modal.classList.add('open');
    },

    closeLevelModal: function () {
      var modal = document.getElementById('ed-level-modal');
      if (modal) {
        modal.classList.remove('open');
        modal.style.display = 'none';
      }
      this.populateLevelSelect();
      this.renderMembersGrid();
    },

    renderLevelsList: function () {
      var container = document.getElementById('ed-levels-list');
      if (!container) return;
      var levels = getStoredLevels();

      var html = levels.map(function (lvl, idx) {
        return '<div style="display:flex; align-items:center; justify-content:space-between; padding:0.6rem 0.85rem; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px;">' +
          '<div style="display:flex; align-items:center; gap:0.5rem;">' +
            '<span style="font-family:var(--font-mono); font-size:0.75rem; color:var(--cheddar-yellow); background:rgba(244,180,26,0.15); padding:0.15rem 0.5rem; border-radius:999px; font-weight:700;">Level ' + lvl.id + '</span>' +
            '<span style="font-family:var(--font-heading); font-size:0.9rem; color:#fff; font-weight:600;">' + lvl.name + '</span>' +
          '</div>' +
          '<div style="display:flex; gap:0.4rem;">' +
            '<button type="button" class="ed-btn ed-btn-edit" onclick="EditorialStudio.renameLevel(' + idx + ')">✏️ Rename</button>' +
            (levels.length > 1 ? '<button type="button" class="ed-btn ed-btn-del" onclick="EditorialStudio.deleteLevel(' + idx + ')">🗑 Delete</button>' : '') +
          '</div>' +
        '</div>';
      }).join('');

      container.innerHTML = html;
    },

    addLevel: function () {
      var input = document.getElementById('ed-new-level-input');
      if (!input) return;
      var title = input.value.trim();
      if (!title) { alert('Please enter a Level Name.'); return; }

      var levels = getStoredLevels();
      var maxId = 0;
      levels.forEach(function(l) { if (Number(l.id) > maxId) maxId = Number(l.id); });
      var newId = maxId + 1;

      levels.push({ id: newId, name: title });
      saveStoredLevels(levels);
      input.value = '';
      this.renderLevelsList();
      this.populateLevelSelect();
      this.renderMembersGrid();
    },

    renameLevel: function (idx) {
      var levels = getStoredLevels();
      var current = levels[idx];
      var currentName = typeof current === 'object' ? current.name : current;
      var newTitle = prompt('Rename Level title:', currentName);
      if (newTitle && newTitle.trim()) {
        if (typeof levels[idx] === 'object') {
          levels[idx].name = newTitle.trim();
        } else {
          levels[idx] = { id: idx + 1, name: newTitle.trim() };
        }
        saveStoredLevels(levels);
        this.renderLevelsList();
        this.populateLevelSelect();
        this.renderMembersGrid();
      }
    },

    deleteLevel: function (idx) {
      var levels = getStoredLevels();
      if (levels.length <= 1) {
        alert('You must have at least one level line.');
        return;
      }
      var targetLvl = levels[idx];
      var targetId = typeof targetLvl === 'object' ? targetLvl.id : (idx + 1);
      var targetName = typeof targetLvl === 'object' ? targetLvl.name : targetLvl;

      if (confirm('Delete level "' + targetName + '"? Member cards assigned to this level will move to Level 1.')) {
        levels.splice(idx, 1);
        saveStoredLevels(levels);

        // Update member assignments that had this deleted tier
        this.members.forEach(function (m) {
          if (Number(m.tier) === Number(targetId)) {
            m.tier = 1;
            m.tierLabel = "Level 1";
          }
        });
        saveStoredMembers(this.members);

        this.renderLevelsList();
        this.populateLevelSelect();
        this.renderMembersGrid();
      }
    },

    /* --- Category Management System --- */
    populateCategorySelect: function () {
      this.categoryInput = this.categoryInput || document.getElementById('ed-category');
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
      var modal = document.getElementById('ed-cat-modal');
      if (!modal) return;
      this.renderCategoryList();
      modal.style.display = 'flex';
      modal.classList.add('open');
    },

    closeCategoryModal: function () {
      var modal = document.getElementById('ed-cat-modal');
      if (modal) {
        modal.classList.remove('open');
        modal.style.display = 'none';
      }
      this.populateCategorySelect();
    },

    addCategory: function () {
      var input = document.getElementById('ed-new-cat-input');
      if (!input) return;
      var val = input.value.trim();
      if (!val) { alert('Please enter a Category name.'); return; }
      var cats = getStoredCategories();
      if (cats.indexOf(val) !== -1) { alert('This category already exists.'); return; }
      cats.push(val);
      saveStoredCategories(cats);
      input.value = '';
      this.renderCategoryList();
      this.populateCategorySelect();
    },

    editCategory: function (index) {
      var cats = getStoredCategories();
      if (index < 0 || index >= cats.length) return;
      var oldName = cats[index];
      var newName = prompt('Edit Board Category name:', oldName);
      if (newName && newName.trim() && newName.trim() !== oldName) {
        var trimmed = newName.trim();
        cats[index] = trimmed;
        this.members.forEach(function (m) {
          if (m.category === oldName) m.category = trimmed;
        });
        saveStoredMembers(this.members);
        saveStoredCategories(cats);
        this.renderCategoryList();
        this.populateCategorySelect();
        this.renderMembersGrid();
      }
    },

    deleteCategory: function (index) {
      var cats = getStoredCategories();
      if (index < 0 || index >= cats.length) return;
      var catName = cats[index];
      if (confirm('Delete category "' + catName + '"? Members assigned to this category will keep their label.')) {
        cats.splice(index, 1);
        saveStoredCategories(cats);
        this.renderCategoryList();
        this.populateCategorySelect();
      }
    },

    renderCategoryList: function () {
      var container = document.getElementById('ed-cat-list');
      if (!container) return;
      var cats = getStoredCategories();
      var html = cats.map(function (c, idx) {
        return '<div style="display:flex; align-items:center; justify-content:space-between; padding:0.6rem 0.85rem; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px;">' +
          '<span style="font-family:var(--font-mono); font-size:0.88rem; color:#fff; font-weight:600;">' + c + '</span>' +
          '<div style="display:flex; gap:0.4rem;">' +
            '<button type="button" class="ed-btn ed-btn-edit" onclick="EditorialStudio.editCategory(' + idx + ')">✏️ Edit</button>' +
            '<button type="button" class="ed-btn ed-btn-del" onclick="EditorialStudio.deleteCategory(' + idx + ')">🗑 Delete</button>' +
          '</div>' +
        '</div>';
      }).join('');
      container.innerHTML = html;
    },

    /* --- STANDALONE EDITORIAL BOARD CODE GENERATOR --- */
    generateEditorialJSCode: function () {
      // Identify primary top adviser (if any)
      var adviserIndex = -1;
      for (var i = 0; i < this.members.length; i++) {
        var m = this.members[i];
        if (m._isAdviser === true && Number(m.tier) === 1) {
          adviserIndex = i;
          break;
        }
      }
      if (adviserIndex === -1) {
        for (var i = 0; i < this.members.length; i++) {
          if (this.members[i]._isAdviser === true) {
            adviserIndex = i;
            break;
          }
        }
      }

      var adviserObj;
      var regular = [];

      if (adviserIndex !== -1) {
        adviserObj = Object.assign({}, this.members[adviserIndex], { _isAdviser: true });
        for (var i = 0; i < this.members.length; i++) {
          if (i !== adviserIndex) {
            regular.push(this.members[i]);
          }
        }
      } else {
        adviserObj = window.adviserData || {
          name: "Prof. [Adviser Name]",
          role: "Publication Adviser",
          initials: "PA",
          image: "assets/images/team/art-jayson-osuyos.jpg",
          yearLevel: "Faculty Adviser",
          category: "Adviser",
          tier: 1,
          tierLabel: "Level 1",
          bio: "Faculty adviser overseeing the iConnect Publication of the BSCS Department.",
          _isAdviser: true
        };
        regular = this.members.slice();
      }

      var headerObj = getStoredHeader();
      var levelsObj = getStoredLevels();

      return '/* ==========================================================================\n' +
        '   iCONNECT PUBLICATION — EDITORIAL BOARD DATASTORE (js/editorial.js)\n' +
        '   Controls the Editorial Board members, roles, bio details, and level assignments.\n' +
        '   ========================================================================== */\n\n' +
        'var editorialHeaderData = ' + JSON.stringify(headerObj, null, 2) + ';\n\n' +
        'var editorialLevelsData = ' + JSON.stringify(levelsObj, null, 2) + ';\n\n' +
        'var adviserData = ' + JSON.stringify(adviserObj, null, 2) + ';\n\n' +
        'var editorialTeamData = ' + JSON.stringify(regular, null, 2) + ';\n\n' +
        'if (typeof window !== "undefined") {\n' +
        '  window.editorialHeaderData = editorialHeaderData;\n' +
        '  window.editorialLevelsData = editorialLevelsData;\n' +
        '  window.editorialTeamData   = editorialTeamData;\n' +
        '  window.adviserData         = adviserData;\n\n' +
        '  window.getMergedEditorialHeader = function () {\n' +
        '    return window.editorialHeaderData;\n' +
        '  };\n\n' +
        '  window.getMergedEditorialLevels = function () {\n' +
        '    return window.editorialLevelsData || [];\n' +
        '  };\n\n' +
        '  window.getMergedEditorialTeam = function () {\n' +
        '    var allMembers = [];\n' +
        '    if (window.adviserData) {\n' +
        '      allMembers.push(\n' +
        '        Object.assign({}, window.adviserData, {\n' +
        '          _isAdviser: true\n' +
        '        })\n' +
        '      );\n' +
        '    }\n' +
        '    if (Array.isArray(window.editorialTeamData)) {\n' +
        '      window.editorialTeamData.forEach(function (member) {\n' +
        '        allMembers.push(member);\n' +
        '      });\n' +
        '    }\n' +
        '    return allMembers;\n' +
        '  };\n' +
        '}\n';
    },

    openExportModal: function () {
      var modal = document.getElementById('ed-export-modal');
      var codeBlock = document.getElementById('ed-export-code');
      var code = this.generateEditorialJSCode();

      if (codeBlock) codeBlock.textContent = code;
      if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('open');
      }
    },

    closeExportModal: function () {
      var modal = document.getElementById('ed-export-modal');
      if (modal) {
        modal.classList.remove('open');
        modal.style.display = 'none';
      }
    },

    copyExportCode: function () {
      var codeBlock = document.getElementById('ed-export-code');
      if (!codeBlock) return;
      var code = codeBlock.textContent;
      navigator.clipboard.writeText(code).then(function () {
        var btn = document.getElementById('ed-copy-code-btn');
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

    downloadUpdatedEditorialJS: function () {
      var code = this.generateEditorialJSCode();

      var blob = new Blob([code], { type: 'text/javascript' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'editorial.js';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      alert('💾 Downloaded updated editorial.js!\n\nReplace js/editorial.js in your project folder before deploying to Netlify/Vercel.');
    }
  };

  window.EditorialStudio = EditorialStudio;

  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () {
      EditorialStudio.init();
      if (window.StudioVisibility) {
        window.StudioVisibility.init('editorial');
      }
    });
  }

})();
