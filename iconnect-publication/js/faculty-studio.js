/* ==========================================================================
   iCONNECT FACULTY STUDIO MANAGER — CONTROLLER (js/faculty-studio.js)
   Full CRUD, Drag & Drop Across Tiers, Org-Chart Tier Lines, Customizable Tints,
   Image Compression, Live Website Publishing & Standalone Codebase Exporter
   ========================================================================== */

(function (window) {
  'use strict';

  var LOCAL_KEY = 'iconnect_faculty_members';
  var HEADER_KEY = 'iconnect_faculty_header';
  var LEVEL_KEY = 'iconnect_faculty_levels';

  // Drag-and-Drop state tracker
  var draggedCardId = null;

  // Safe fallback background functions
  window.getFacultyBgEffect = window.getFacultyBgEffect || function () {
    try {
      var stored = localStorage.getItem('iconnect_faculty_bg_effect');
      if (stored) return stored;
    } catch (e) {}
    return 'cyber-matrix';
  };

  window.getFacultyBgOpacity = window.getFacultyBgOpacity || function () {
    try {
      var stored = localStorage.getItem('iconnect_faculty_bg_opacity');
      if (stored) return parseFloat(stored);
    } catch (e) {}
    return 0.6;
  };

  var defaultLevels = [
    { id: 1, name: "Level 1" },
    { id: 2, name: "Level 2" },
    { id: 3, name: "Level 3" },
    { id: 4, name: "Level 4" },
    { id: 5, name: "Level 5" }
  ];

  function getStoredLevels() {
    try {
      var stored = JSON.parse(localStorage.getItem(LEVEL_KEY));
      if (Array.isArray(stored) && stored.length > 0) return stored;
    } catch (e) {}
    return (window.facultyLevelsData || defaultLevels);
  }

  function saveStoredLevels(levels) {
    try {
      localStorage.setItem(LEVEL_KEY, JSON.stringify(levels));
      return true;
    } catch (e) {
      console.error('Levels storage error:', e);
      return false;
    }
  }

  window.getMergedFacultyLevels = function () {
    return getStoredLevels();
  };

  /* --- Datastore Helpers --- */
  function getStoredHeader() {
    try {
      var stored = JSON.parse(localStorage.getItem(HEADER_KEY));
      if (stored && typeof stored === 'object') return stored;
    } catch (e) {}
    return window.facultyHeaderData || {
      badge: "Academic Leadership & Faculty",
      title: "Faculty & Department Directory",
      description: "Meet the distinguished faculty members, department chairs, and educators of the BSCS Department.",
      institution: "Capiz State University – Mambusao Satellite College",
      footerTag: "iConnect Publication"
    };
  }

  function saveStoredHeader(header) {
    try {
      localStorage.setItem(HEADER_KEY, JSON.stringify(header));
      return true;
    } catch (e) {
      console.error('Header storage error:', e);
      return false;
    }
  }

  function getStoredMembers() {
    try {
      var raw = localStorage.getItem(LOCAL_KEY);
      if (raw && !raw.includes("Maria Santos")) {
        var stored = JSON.parse(raw);
        if (Array.isArray(stored) && stored.length > 0) return stored;
      }
    } catch (e) {}

    var fallback = (window.facultyMembersData || []).slice();
    if (fallback.length > 0) {
      try {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(fallback));
      } catch (e) {}
    }
    return fallback;
  }

  function saveStoredMembers(members) {
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(members));
      return true;
    } catch (e) {
      console.error('LocalStorage error:', e);
      alert('⚠ Storage limit warning: Image size is large. The card was updated in workspace memory.');
      return false;
    }
  }

  window.getMergedFacultyHeader = function () {
    return getStoredHeader();
  };

  window.getMergedFacultyMembers = function () {
    return getStoredMembers();
  };

  function generateId(name) {
    var slug = (name || 'faculty')
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    return 'fac-' + (slug.slice(0, 30) || 'item') + '-' + Date.now().toString(36);
  }

  function compressImageFile(file, callback) {
    var reader = new FileReader();
    reader.onload = function (e) {
      var img = new Image();
      img.onload = function () {
        var canvas = document.createElement('canvas');
        var maxW = 1000;
        var maxH = 1000;
        var w = img.width;
        var h = img.height;

        if (w > maxW || h > maxH) {
          if (w > h) {
            h = Math.round((h * maxW) / w);
            w = maxW;
          } else {
            w = Math.round((w * maxH) / h);
            h = maxH;
          }
        }

        canvas.width = w;
        canvas.height = h;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        var base64 = canvas.toDataURL('image/jpeg', 0.82);
        callback(base64);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  var LINES_KEY_DESKTOP = 'iconnect_faculty_lines_desktop';
  var LINES_KEY_MOBILE  = 'iconnect_faculty_lines_mobile';

  var FacultyStudio = {
    members: [],
    editingId: null,
    currentPhotoBase64: '',

    /* --- Connector Lines Settings --- */
    getLinesSettings: function () {
      var desktop = false;
      var mobile  = false;
      try {
        desktop = localStorage.getItem(LINES_KEY_DESKTOP) === 'true';
        mobile  = localStorage.getItem(LINES_KEY_MOBILE)  === 'true';
      } catch (e) {}
      return { desktop: desktop, mobile: mobile };
    },

    /* Toggle a single view (desktop|mobile) — called by the button onclick */
    toggleLines: function (view) {
      var settings = this.getLinesSettings();
      if (view === 'desktop') {
        settings.desktop = !settings.desktop;
        try { localStorage.setItem(LINES_KEY_DESKTOP, settings.desktop ? 'true' : 'false'); } catch (e) {}
      } else {
        settings.mobile = !settings.mobile;
        try { localStorage.setItem(LINES_KEY_MOBILE, settings.mobile ? 'true' : 'false'); } catch (e) {}
      }
      this.syncToggleUI();
      this.renderList();
    },

    /* Update button visuals to match localStorage state */
    syncToggleUI: function () {
      var settings = this.getLinesSettings();

      function applyBtn(btnId, thumbId, isOn) {
        var btn   = document.getElementById(btnId);
        var thumb = document.getElementById(thumbId);
        if (!btn || !thumb) return;
        if (isOn) {
          btn.style.background   = 'rgba(244,180,26,0.30)';
          btn.style.borderColor  = 'var(--cheddar-yellow)';
          thumb.style.left       = '27px';
          thumb.style.background = 'var(--cheddar-yellow)';
        } else {
          btn.style.background   = 'rgba(255,255,255,0.10)';
          btn.style.borderColor  = 'rgba(255,255,255,0.20)';
          thumb.style.left       = '3px';
          thumb.style.background = 'rgba(255,255,255,0.45)';
        }
      }

      applyBtn('fac-toggle-desktop', 'fac-toggle-desktop-thumb', settings.desktop);
      applyBtn('fac-toggle-mobile',  'fac-toggle-mobile-thumb',  settings.mobile);
    },


    init: function () {
      this.members = getStoredMembers();
      this.cacheDOM();
      this.bindEvents();
      this.populateLevelSelect();
      this.loadHeaderSettingsForm();
      this.syncToggleUI();
      this.renderList();
    },

    populateLevelSelect: function () {
      var select = document.getElementById('fac-tier');
      if (!select) return;
      var levels = getStoredLevels();
      var currentVal = select.value || (levels.length > 0 ? levels[0].id : '1');
      var html = levels.map(function (lvl) {
        return '<option value="' + lvl.id + '">' + lvl.name + '</option>';
      }).join('');
      select.innerHTML = html;
      select.value = currentVal;
    },

    openLevelModal: function () {
      var modal = document.getElementById('fac-level-modal');
      if (modal) {
        this.renderLevelsModalList();
        modal.style.display = 'flex';
        modal.classList.add('open');
      }
    },

    closeLevelModal: function () {
      var modal = document.getElementById('fac-level-modal');
      if (modal) {
        modal.classList.remove('open');
        modal.style.display = 'none';
      }
    },

    renderLevelsModalList: function () {
      var container = document.getElementById('fac-levels-list');
      if (!container) return;
      var levels = getStoredLevels();
      var len = levels.length;
      var html = levels.map(function (lvl, idx) {
        return '<div style="display:flex; align-items:center; justify-content:space-between; padding:0.6rem 0.85rem; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px;">' +
          '<span style="font-family:var(--font-mono); font-size:0.88rem; color:#fff; font-weight:600;">' + lvl.name + '</span>' +
          '<div style="display:flex; gap:0.35rem; align-items:center;">' +
            '<button type="button" class="toolbar-btn" onclick="FacultyStudio.moveLevel(' + idx + ', -1)" ' + (idx === 0 ? 'disabled style="opacity:0.3; cursor:not-allowed;"' : '') + ' style="padding:0.25rem 0.5rem; font-size:0.75rem;">⬆️</button>' +
            '<button type="button" class="toolbar-btn" onclick="FacultyStudio.moveLevel(' + idx + ', 1)" ' + (idx === len - 1 ? 'disabled style="opacity:0.3; cursor:not-allowed;"' : '') + ' style="padding:0.25rem 0.5rem; font-size:0.75rem;">⬇️</button>' +
            '<button type="button" class="toolbar-btn" onclick="FacultyStudio.editLevel(' + idx + ')" style="padding:0.25rem 0.55rem; font-size:0.75rem;">✏️ Edit</button>' +
            '<button type="button" class="toolbar-btn" onclick="FacultyStudio.deleteLevel(' + idx + ')" style="padding:0.25rem 0.55rem; font-size:0.75rem; color:#ff6b8a; border-color:rgba(255,107,138,0.3);">🗑 Delete</button>' +
          '</div>' +
        '</div>';
      }).join('');
      container.innerHTML = html;
    },

    moveLevel: function (idx, direction) {
      var levels = getStoredLevels();
      var targetIdx = idx + direction;
      if (targetIdx < 0 || targetIdx >= levels.length) return;
      var temp = levels[idx];
      levels[idx] = levels[targetIdx];
      levels[targetIdx] = temp;
      saveStoredLevels(levels);
      this.populateLevelSelect();
      this.renderLevelsModalList();
      this.renderList();
    },

    addLevel: function () {
      var input = document.getElementById('fac-new-level-input');
      if (!input) return;
      var name = input.value.trim();
      if (!name) { alert('Please enter a level title.'); return; }

      var levels = getStoredLevels();
      var maxId = 0;
      levels.forEach(function (l) { if (Number(l.id) > maxId) maxId = Number(l.id); });
      var newLevel = { id: maxId + 1, name: name };
      levels.push(newLevel);
      saveStoredLevels(levels);
      input.value = '';
      this.populateLevelSelect();
      this.renderLevelsModalList();
      this.renderList();
    },

    editLevel: function (idx) {
      var levels = getStoredLevels();
      if (!levels[idx]) return;
      var current = levels[idx].name;
      var updated = prompt('Edit Org Chart Line / Level Title:', current);
      if (updated && updated.trim() && updated.trim() !== current) {
        levels[idx].name = updated.trim();
        saveStoredLevels(levels);
        this.populateLevelSelect();
        this.renderLevelsModalList();
        this.renderList();
      }
    },

    deleteLevel: function (idx) {
      var levels = getStoredLevels();
      if (!levels[idx]) return;
      if (levels.length <= 1) {
        alert('You must keep at least 1 Org Chart level.');
        return;
      }
      if (confirm('Delete level "' + levels[idx].name + '"?')) {
        levels.splice(idx, 1);
        saveStoredLevels(levels);
        this.populateLevelSelect();
        this.renderLevelsModalList();
        this.renderList();
      }
    },

    cacheDOM: function () {
      this.form = document.getElementById('fac-member-form');
      this.idInput = document.getElementById('fac-member-id');
      this.nameInput = document.getElementById('fac-name');
      this.roleInput = document.getElementById('fac-role');
      this.deptInput = document.getElementById('fac-dept');
      this.tierInput = document.getElementById('fac-tier');
      this.layoutStyleInput = document.getElementById('fac-layout-style');
      this.tintColorInput = document.getElementById('fac-tint-color');
      this.photoUrlInput = document.getElementById('fac-photo-url');
      this.photoFileInput = document.getElementById('fac-photo-file');
      this.photoPreview = document.getElementById('fac-photo-preview');
      this.emailInput = document.getElementById('fac-email');
      this.bioInput = document.getElementById('fac-bio');
      this.institutionInput = document.getElementById('fac-institution');
      this.footerTagInput = document.getElementById('fac-footer-tag');

      this.submitBtn = document.getElementById('fac-submit-btn');
      this.cancelBtn = document.getElementById('fac-cancel-btn');
      this.formTitle = document.getElementById('fac-form-title');
      this.listContainer = document.getElementById('fac-preview-list');
    },

    bindEvents: function () {
      var self = this;

      if (this.form) {
        this.form.addEventListener('submit', function (e) {
          e.preventDefault();
          self.saveMember();
        });
      }

      if (this.cancelBtn) {
        this.cancelBtn.addEventListener('click', function () {
          self.resetForm();
        });
      }

      if (this.photoFileInput) {
        this.photoFileInput.addEventListener('change', function (e) {
          var file = e.target.files[0];
          if (!file) return;
          compressImageFile(file, function (base64) {
            self.currentPhotoBase64 = base64;
            if (self.photoUrlInput) self.photoUrlInput.value = '';
            if (self.photoPreview) {
              self.photoPreview.src = base64;
              self.photoPreview.style.display = 'block';
            }
          });
        });
      }

      if (this.photoUrlInput) {
        this.photoUrlInput.addEventListener('input', function () {
          self.currentPhotoBase64 = '';
          var val = self.photoUrlInput.value.trim();
          if (self.photoPreview) {
            self.photoPreview.src = val || 'https://res.cloudinary.com/io18jc16/image/upload/f_auto,q_auto/1';
            self.photoPreview.style.display = 'block';
          }
        });
      }
    },

    setTintColor: function (color) {
      if (this.tintColorInput) this.tintColorInput.value = color;
    },

    updateBgEffect: function (val) {
      if (!val) return;
      localStorage.setItem('iconnect_faculty_bg_effect', val);
    },

    updateBgOpacity: function (val) {
      var pct = parseInt(val, 10);
      var opacity = pct / 100;
      var label = document.getElementById('fac-bg-opacity-val');
      if (label) label.textContent = pct + '%';
      localStorage.setItem('iconnect_faculty_bg_opacity', opacity.toString());
    },

    loadHeaderSettingsForm: function () {
      var h = getStoredHeader();
      var badgeInput = document.getElementById('fac-header-badge');
      var titleInput = document.getElementById('fac-header-title');
      var descInput  = document.getElementById('fac-header-desc');
      var instInput  = document.getElementById('fac-header-institution');
      var footInput  = document.getElementById('fac-header-footer-tag');
      var effInput   = document.getElementById('fac-bg-effect');
      var opInput    = document.getElementById('fac-bg-opacity');
      var opValText  = document.getElementById('fac-bg-opacity-val');

      if (badgeInput) badgeInput.value = h.badge || 'Academic Leadership & Faculty';
      if (titleInput) titleInput.value = h.title || 'Faculty & Department Directory';
      if (descInput)  descInput.value  = h.description || '';
      if (instInput)  instInput.value  = h.institution || 'Capiz State University – Mambusao Satellite College';
      if (footInput)  footInput.value  = h.footerTag || 'iConnect Publication';

      if (effInput)  effInput.value  = window.getFacultyBgEffect();
      var currentOp = window.getFacultyBgOpacity();
      var pct = Math.round(currentOp * 100);
      if (opInput)   opInput.value   = pct;
      if (opValText) opValText.textContent = pct + '%';
    },

    saveHeaderSettings: function () {
      var badge = (document.getElementById('fac-header-badge') ? document.getElementById('fac-header-badge').value.trim() : '') || 'Academic Leadership & Faculty';
      var title = (document.getElementById('fac-header-title') ? document.getElementById('fac-header-title').value.trim() : '') || 'Faculty & Department Directory';
      var desc  = (document.getElementById('fac-header-desc') ? document.getElementById('fac-header-desc').value.trim() : '') || '';
      var inst  = (document.getElementById('fac-header-institution') ? document.getElementById('fac-header-institution').value.trim() : '') || 'Capiz State University – Mambusao Satellite College';
      var foot  = (document.getElementById('fac-header-footer-tag') ? document.getElementById('fac-header-footer-tag').value.trim() : '') || 'iConnect Publication';
      var eff   = document.getElementById('fac-bg-effect') ? document.getElementById('fac-bg-effect').value : 'cyber-matrix';
      var opPct = document.getElementById('fac-bg-opacity') ? parseInt(document.getElementById('fac-bg-opacity').value, 10) : 60;
      var opVal = opPct / 100;

      var header = { badge: badge, title: title, description: desc, institution: inst, footerTag: foot };
      saveStoredHeader(header);
      window.facultyHeaderData = header;

      localStorage.setItem('iconnect_faculty_bg_effect', eff);
      localStorage.setItem('iconnect_faculty_bg_opacity', opVal.toString());

      if (typeof this.renderList === 'function') this.renderList();
      alert('✅ Faculty Directory Settings Saved!');
    },

    resetForm: function () {
      this.editingId = null;
      this.currentPhotoBase64 = '';
      if (this.form) this.form.reset();
      if (this.idInput) this.idInput.value = '';
      if (this.deptInput) this.deptInput.value = 'Computer Science Department';
      if (this.layoutStyleInput) this.layoutStyleInput.value = 'center';
      if (this.institutionInput) this.institutionInput.value = '';
      if (this.footerTagInput)   this.footerTagInput.value = '';
      if (this.formTitle) this.formTitle.textContent = '➕ Add Faculty Member';
      if (this.submitBtn) this.submitBtn.textContent = '➕ Save Faculty Card';
      if (this.cancelBtn) this.cancelBtn.style.display = 'none';
      if (this.photoPreview) {
        this.photoPreview.src = 'https://res.cloudinary.com/io18jc16/image/upload/f_auto,q_auto/1';
      }
    },

    saveMember: function () {
      var name = this.nameInput ? this.nameInput.value.trim() : '';
      var role = this.roleInput ? this.roleInput.value.trim() : '';
      var dept = (this.deptInput && this.deptInput.value.trim()) ? this.deptInput.value.trim() : 'Computer Science Department';
      var tier = parseInt(this.tierInput ? this.tierInput.value : '1', 10) || 1;
      var layoutStyle = (this.layoutStyleInput && this.layoutStyleInput.value) ? this.layoutStyleInput.value : 'center';
      var tint = (this.tintColorInput && this.tintColorInput.value) ? this.tintColorInput.value : '#00f0ff';
      var photoUrl = this.photoUrlInput ? this.photoUrlInput.value.trim() : '';
      var image = this.currentPhotoBase64 || photoUrl || 'https://res.cloudinary.com/io18jc16/image/upload/f_auto,q_auto/1';
      var email = this.emailInput ? this.emailInput.value.trim() : '';
      var bio = this.bioInput ? this.bioInput.value.trim() : '';
      var inst = this.institutionInput ? this.institutionInput.value.trim() : '';
      var foot = this.footerTagInput ? this.footerTagInput.value.trim() : '';

      if (!name || !role) {
        alert('Please provide at least a Full Name and Role/Designation.');
        return;
      }

      var levels = getStoredLevels();
      var matchedLevel = levels.find(function (l) { return Number(l.id) === tier; });
      var tierLabel = matchedLevel ? matchedLevel.name : ("Level " + tier);

      if (this.editingId) {
        var idx = -1;
        for (var i = 0; i < this.members.length; i++) {
          if (this.members[i].id === this.editingId) { idx = i; break; }
        }
        if (idx !== -1) {
          this.members[idx] = {
            id: this.editingId,
            name: name,
            role: role,
            department: dept,
            tier: tier,
            tierLabel: tierLabel,
            layoutStyle: layoutStyle,
            tintColor: tint,
            image: image,
            email: email,
            bio: bio,
            institution: inst,
            footerTag: foot
          };
        }
      } else {
        var newMember = {
          id: generateId(name),
          name: name,
          role: role,
          department: dept,
          tier: tier,
          tierLabel: tierLabel,
          layoutStyle: layoutStyle,
          tintColor: tint,
          image: image,
          email: email,
          bio: bio,
          institution: inst,
          footerTag: foot
        };
        this.members.push(newMember);
      }

      saveStoredMembers(this.members);
      this.renderList();
      this.resetForm();
      alert('🎉 Faculty Card Saved!\n\n"' + name + '" placed in ' + tierLabel + ' with ' + layoutStyle + ' alignment.');
    },

    editMember: function (id) {
      var member = null;
      for (var i = 0; i < this.members.length; i++) {
        if (this.members[i].id === id) { member = this.members[i]; break; }
      }
      if (!member) return;

      this.editingId = id;
      if (this.nameInput)        this.nameInput.value = member.name || '';
      if (this.roleInput)        this.roleInput.value = member.role || '';
      if (this.deptInput)        this.deptInput.value = member.department || 'Computer Science Department';
      if (this.tierInput)        this.tierInput.value = member.tier || 1;
      if (this.layoutStyleInput) this.layoutStyleInput.value = member.layoutStyle || 'center';
      if (this.tintColorInput)   this.tintColorInput.value = member.tintColor || '#00f0ff';
      if (this.photoUrlInput)    this.photoUrlInput.value = member.image || '';
      if (this.emailInput)       this.emailInput.value = member.email || '';
      if (this.bioInput)         this.bioInput.value = member.bio || '';
      if (this.institutionInput) this.institutionInput.value = member.institution || '';
      if (this.footerTagInput)   this.footerTagInput.value = member.footerTag || '';
      if (this.photoPreview)     this.photoPreview.src = member.image || 'https://res.cloudinary.com/io18jc16/image/upload/f_auto,q_auto/1';

      if (this.formTitle) this.formTitle.textContent = '✏️ Edit Faculty Member';
      if (this.submitBtn) this.submitBtn.textContent = '💾 Update Faculty Card';
      if (this.cancelBtn) this.cancelBtn.style.display = 'inline-flex';

      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    deleteMember: function (id) {
      if (confirm('Are you sure you want to delete this faculty member?')) {
        var updated = [];
        for (var i = 0; i < this.members.length; i++) {
          if (this.members[i].id !== id) updated.push(this.members[i]);
        }
        this.members = updated;
        saveStoredMembers(this.members);
        this.renderList();
        if (this.editingId === id) this.resetForm();
      }
    },

    moveMember: function (id, delta) {
      var levelsList = getStoredLevels();
      if (!levelsList || levelsList.length === 0) return;

      var grouped = {};
      levelsList.forEach(function (lvl) {
        grouped[Number(lvl.id)] = [];
      });

      for (var i = 0; i < this.members.length; i++) {
        var m = this.members[i];
        var t = Number(m.tier) || Number(levelsList[0].id);
        if (!grouped[t]) grouped[t] = [];
        grouped[t].push(m);
      }

      var member = null;
      var curTier = null;
      var curTierMembers = [];

      for (var k in grouped) {
        var foundIdx = grouped[k].findIndex(function (item) { return item.id === id; });
        if (foundIdx !== -1) {
          member = grouped[k][foundIdx];
          curTier = Number(k);
          curTierMembers = grouped[k];
          break;
        }
      }

      if (!member || curTier === null) return;

      var curPosInTier = curTierMembers.findIndex(function (item) { return item.id === id; });
      var curTierLevelIdx = levelsList.findIndex(function (lvl) { return Number(lvl.id) === curTier; });
      var totalInThisLevel = curTierMembers.length;

      if (delta === -1) {
        // --- MOVE UP (⬆️) ---
        if (totalInThisLevel > 1 && curPosInTier > 0) {
          var prevItem = curTierMembers[curPosInTier - 1];
          curTierMembers[curPosInTier - 1] = member;
          curTierMembers[curPosInTier] = prevItem;
        } else {
          var targetLevelIdx = curTierLevelIdx - 1;
          if (targetLevelIdx < 0) return;

          var targetLevelObj = levelsList[targetLevelIdx];
          var targetTierId = Number(targetLevelObj.id);

          curTierMembers.splice(curPosInTier, 1);
          member.tier = targetTierId;
          member.tierLabel = targetLevelObj.name;

          if (!grouped[targetTierId]) grouped[targetTierId] = [];
          grouped[targetTierId].push(member);
        }
      } else if (delta === 1) {
        // --- MOVE DOWN (⬇️) ---
        if (totalInThisLevel > 1 && curPosInTier < totalInThisLevel - 1) {
          var nextItem = curTierMembers[curPosInTier + 1];
          curTierMembers[curPosInTier + 1] = member;
          curTierMembers[curPosInTier] = nextItem;
        } else {
          var targetLevelIdx = curTierLevelIdx + 1;
          if (targetLevelIdx >= levelsList.length) return;

          var targetLevelObj = levelsList[targetLevelIdx];
          var targetTierId = Number(targetLevelObj.id);

          curTierMembers.splice(curPosInTier, 1);
          member.tier = targetTierId;
          member.tierLabel = targetLevelObj.name;

          if (!grouped[targetTierId]) grouped[targetTierId] = [];
          grouped[targetTierId].unshift(member);
        }
      }

      var newMemberList = [];
      levelsList.forEach(function (lvl) {
        var tId = Number(lvl.id);
        if (grouped[tId] && grouped[tId].length > 0) {
          newMemberList = newMemberList.concat(grouped[tId]);
        }
      });

      this.members = newMemberList;
      saveStoredMembers(this.members);
      this.renderList();
    },

    setCardAlignment: function (id, alignment) {
      for (var i = 0; i < this.members.length; i++) {
        if (this.members[i].id === id) {
          this.members[i].layoutStyle = alignment;
          break;
        }
      }
      saveStoredMembers(this.members);
      this.renderList();
    },

    /* ==========================================================================
       DRAG AND DROP HANDLERS (CARD-TO-CARD & LEVEL-TO-LEVEL)
       ========================================================================== */
    handleDragStart: function (e, id) {
      draggedCardId = id;
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', id);
      
      var cardElem = e.currentTarget;
      setTimeout(function () {
        cardElem.style.opacity = '0.35';
      }, 0);
    },

    handleDragEnd: function (e) {
      e.currentTarget.style.opacity = '1';
      draggedCardId = null;
      document.querySelectorAll('.faculty-draggable-card, .fac-level-dropzone').forEach(function (el) {
        el.style.transform = '';
        el.style.borderColor = '';
        el.style.boxShadow = '';
      });
    },

    handleDragOverCard: function (e) {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = 'move';
      e.currentTarget.style.transform = 'scale(1.02)';
      e.currentTarget.style.borderColor = 'var(--cheddar-yellow)';
      e.currentTarget.style.boxShadow = '0 0 20px rgba(244, 180, 26, 0.4)';
    },

    handleDragLeaveCard: function (e) {
      e.currentTarget.style.transform = '';
      e.currentTarget.style.borderColor = '';
      e.currentTarget.style.boxShadow = '';
    },

    handleDragOverLevel: function (e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      e.currentTarget.style.borderColor = 'rgba(244, 180, 26, 0.6)';
      e.currentTarget.style.backgroundColor = 'rgba(244, 180, 26, 0.04)';
    },

    handleDragLeaveLevel: function (e) {
      e.currentTarget.style.borderColor = '';
      e.currentTarget.style.backgroundColor = '';
    },

    handleDropOnCard: function (e, targetCardId, targetTierId) {
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.style.transform = '';
      e.currentTarget.style.borderColor = '';
      e.currentTarget.style.boxShadow = '';

      var sourceId = draggedCardId || e.dataTransfer.getData('text/plain');
      if (!sourceId || sourceId === targetCardId) return;

      var srcIdx = this.members.findIndex(function (m) { return m.id === sourceId; });
      if (srcIdx === -1) return;

      var movedItem = this.members.splice(srcIdx, 1)[0];

      var levels = getStoredLevels();
      var targetLevelObj = levels.find(function (l) { return Number(l.id) === Number(targetTierId); });
      movedItem.tier = Number(targetTierId);
      movedItem.tierLabel = targetLevelObj ? targetLevelObj.name : ("Level " + targetTierId);

      var tgtIdx = this.members.findIndex(function (m) { return m.id === targetCardId; });
      if (tgtIdx !== -1) {
        this.members.splice(tgtIdx, 0, movedItem);
      } else {
        this.members.push(movedItem);
      }

      saveStoredMembers(this.members);
      this.renderList();
    },

    handleDropOnLevel: function (e, targetTierId) {
      e.preventDefault();
      e.currentTarget.style.borderColor = '';
      e.currentTarget.style.backgroundColor = '';

      var sourceId = draggedCardId || e.dataTransfer.getData('text/plain');
      if (!sourceId) return;

      var srcIdx = this.members.findIndex(function (m) { return m.id === sourceId; });
      if (srcIdx === -1) return;

      var movedItem = this.members.splice(srcIdx, 1)[0];

      var levels = getStoredLevels();
      var targetLevelObj = levels.find(function (l) { return Number(l.id) === Number(targetTierId); });
      movedItem.tier = Number(targetTierId);
      movedItem.tierLabel = targetLevelObj ? targetLevelObj.name : ("Level " + targetTierId);

      var lastTierIdx = -1;
      for (var i = this.members.length - 1; i >= 0; i--) {
        if (Number(this.members[i].tier) === Number(targetTierId)) {
          lastTierIdx = i;
          break;
        }
      }

      if (lastTierIdx !== -1) {
        this.members.splice(lastTierIdx + 1, 0, movedItem);
      } else {
        this.members.push(movedItem);
      }

      saveStoredMembers(this.members);
      this.renderList();
    },

    publishLive: function () {
      saveStoredMembers(this.members);
      alert('🚀 Published Successfully! Faculty Org Chart is live.');
    },

    resetToDefaults: function () {
      if (confirm('Reset Faculty Directory back to the official roster from faculty.js?')) {
        localStorage.removeItem(LOCAL_KEY);
        localStorage.removeItem(HEADER_KEY);
        localStorage.removeItem(LEVEL_KEY);
        this.members = (window.facultyMembersData || []).slice();
        saveStoredMembers(this.members);
        this.renderList();
        this.resetForm();
        alert('🔄 Faculty directory reset.');
        location.reload();
      }
    },

    generateFacultyJSCode: function () {
      var headerObj  = getStoredHeader();
      var levelsObj  = getStoredLevels();
      var linesSettings = this.getLinesSettings();

      return '/* ==========================================================================\n' +
        '   iCONNECT PUBLICATION — FACULTY & ACADEMIC DIRECTORY DATA (js/faculty.js)\n' +
        '   ========================================================================== */\n\n' +
        'var facultyHeaderData = ' + JSON.stringify(headerObj, null, 2) + ';\n\n' +
        'var facultyLevelsData = ' + JSON.stringify(levelsObj, null, 2) + ';\n\n' +
        'var facultyMembersData = ' + JSON.stringify(this.members, null, 2) + ';\n\n' +
        'var facultyLinesDesktop = ' + (linesSettings.desktop ? 'true' : 'false') + ';\n' +
        'var facultyLinesMobile  = ' + (linesSettings.mobile  ? 'true' : 'false') + ';\n\n' +
        'if (typeof window !== "undefined") {\n' +
        '  window.facultyHeaderData = facultyHeaderData;\n' +
        '  window.facultyLevelsData = facultyLevelsData;\n' +
        '  window.facultyMembersData = facultyMembersData;\n' +
        '  // Persist line settings into localStorage so faculty.html picks them up\n' +
        '  try {\n' +
        '    localStorage.setItem("iconnect_faculty_lines_desktop", facultyLinesDesktop ? "true" : "false");\n' +
        '    localStorage.setItem("iconnect_faculty_lines_mobile",  facultyLinesMobile  ? "true" : "false");\n' +
        '  } catch (e) {}\n' +
        '  window.getMergedFacultyHeader = function () {\n' +
        '    try {\n' +
        '      var stored = localStorage.getItem("iconnect_faculty_header");\n' +
        '      if (stored) return JSON.parse(stored);\n' +
        '    } catch (e) {}\n' +
        '    return window.facultyHeaderData;\n' +
        '  };\n' +
        '  window.getMergedFacultyLevels = function () {\n' +
        '    try {\n' +
        '      var stored = localStorage.getItem("iconnect_faculty_levels");\n' +
        '      if (stored) return JSON.parse(stored);\n' +
        '    } catch (e) {}\n' +
        '    return window.facultyLevelsData || [];\n' +
        '  };\n' +
        '  window.getMergedFacultyMembers = function () {\n' +
        '    try {\n' +
        '      var stored = localStorage.getItem("iconnect_faculty_members");\n' +
        '      if (stored) return JSON.parse(stored);\n' +
        '    } catch (e) {}\n' +
        '    return window.facultyMembersData || [];\n' +
        '  };\n' +
        '  window.getFacultyBgEffect = function () {\n' +
        '    try {\n' +
        '      var stored = localStorage.getItem("iconnect_faculty_bg_effect");\n' +
        '      if (stored) return stored;\n' +
        '    } catch (e) {}\n' +
        '    return "cyber-matrix";\n' +
        '  };\n' +
        '  window.getFacultyBgOpacity = function () {\n' +
        '    try {\n' +
        '      var stored = localStorage.getItem("iconnect_faculty_bg_opacity");\n' +
        '      if (stored) return parseFloat(stored);\n' +
        '    } catch (e) {}\n' +
        '    return 0.6;\n' +
        '  };\n' +
        '}\n';
    },


    openExportModal: function () {
      var modal = document.getElementById('fac-export-modal');
      var codeBlock = document.getElementById('fac-export-code');
      var code = this.generateFacultyJSCode();

      if (codeBlock) codeBlock.textContent = code;
      if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('open');
      }
    },

    closeExportModal: function () {
      var modal = document.getElementById('fac-export-modal');
      if (modal) {
        modal.classList.remove('open');
        modal.style.display = 'none';
      }
    },

    copyExportCode: function () {
      var codeBlock = document.getElementById('fac-export-code');
      if (!codeBlock) return;
      var code = codeBlock.textContent;
      navigator.clipboard.writeText(code).then(function () {
        alert('📋 Code copied to clipboard!');
      }).catch(function () {
        var ta = document.createElement('textarea');
        ta.value = code; document.body.appendChild(ta); ta.select();
        document.execCommand('copy'); document.body.removeChild(ta);
        alert('📋 Code copied to clipboard!');
      });
    },

    downloadUpdatedFacultyJS: function () {
      var code = this.generateFacultyJSCode();
      var blob = new Blob([code], { type: 'text/javascript' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'faculty.js';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      alert('💾 Downloaded faculty.js!');
    },

    /* --- Render Live Preview Grouped by Org Chart Tiers --- */
    renderList: function () {
      if (!this.listContainer) return;

      var levelsList = getStoredLevels();
      var levelOrderMap = {};
      levelsList.forEach(function (lvl, idx) {
        levelOrderMap[Number(lvl.id)] = idx;
      });

      var grouped = {};
      levelsList.forEach(function (lvl) {
        grouped[Number(lvl.id)] = [];
      });

      for (var i = 0; i < this.members.length; i++) {
        var m = this.members[i];
        var t = Number(m.tier) || Number(levelsList[0].id);
        if (!grouped[t]) grouped[t] = [];
        grouped[t].push(m);
      }

      var sortedTiers = levelsList.slice().sort(function (a, b) {
        return levelOrderMap[Number(a.id)] - levelOrderMap[Number(b.id)];
      });

      var linesSettings = FacultyStudio.getLinesSettings();
      var linesDesktop = linesSettings.desktop;
      var linesMobile  = linesSettings.mobile;

      // Build CSS class string for the connector wrapper
      var connectorClass = 'fac-org-connector';
      if (linesDesktop && linesMobile) connectorClass += ' fac-lines-on';
      else if (linesDesktop)           connectorClass += ' fac-lines-on fac-lines-desktop-only';
      else if (linesMobile)            connectorClass += ' fac-lines-mobile-on';

      var html = '';
      html += '<div class="' + connectorClass + '">';

      sortedTiers.forEach(function (lvlObj, tierIdx) {
        var tierKey = Number(lvlObj.id);
        var group = grouped[tierKey] || [];
        var levelTitle = lvlObj.name;

        // Level Drop Zone Container
        html += '<div class="fac-level-dropzone" ' +
          'ondragover="FacultyStudio.handleDragOverLevel(event)" ' +
          'ondragleave="FacultyStudio.handleDragLeaveLevel(event)" ' +
          'ondrop="FacultyStudio.handleDropOnLevel(event, ' + tierKey + ')" ' +
          'style="margin-bottom: 2rem; position: relative; border: 1px dashed rgba(255,255,255,0.1); border-radius: 18px; padding: 1.25rem 1rem; background: rgba(5,11,26,0.3); transition: all 0.2s ease;">';

        html += '<div style="text-align:center; margin-bottom: 0.85rem;">' +
                  '<span style="font-family:var(--font-mono); font-size:0.75rem; font-weight:700; color:var(--cheddar-yellow); background:rgba(244,180,26,0.12); border:1px solid rgba(244,180,26,0.3); padding:0.2rem 0.75rem; border-radius:999px; text-transform:uppercase; letter-spacing:0.05em;">' +
                    levelTitle + ' (' + group.length + ')' +
                  '</span>' +
                '</div>';

        if (group.length === 0) {
          html += '<div style="color:var(--text-subtle); font-size:0.8rem; text-align:center; padding:1.25rem; border:1px dashed rgba(255,255,255,0.06); border-radius:12px;">' +
                    '📥 Drag and drop faculty cards here to assign to ' + levelTitle +
                  '</div>';
        } else {
          var leftMembers = [];
          var singleMembers = [];
          var gridMembers = [];
          var rightMembers = [];

          group.forEach(function (m) {
            var style = m.layoutStyle || 'center';
            if (style === 'left') leftMembers.push(m);
            else if (style === 'right' || style === 'side-branch') rightMembers.push(m);
            else if (style === 'center-single' || style === 'solo' || group.length === 1) singleMembers.push(m);
            else gridMembers.push(m);
          });

          // 1. Left Cards (Clean Left Alignment)
          if (leftMembers.length > 0) {
            leftMembers.forEach(function (member) {
              html += '<div class="faculty-side-branch-row" style="display:flex; justify-content:center; width:100%; max-width:850px; margin:0.5rem auto;">' +
                '<div style="margin-right:auto; width:100%; max-width:360px;">' +
                  FacultyStudio.buildCardHTML(member, 'left', tierKey) +
                '</div>' +
              '</div>';
            });
          }

          // 2. Right Cards (Clean Right Alignment)
          if (rightMembers.length > 0) {
            rightMembers.forEach(function (member) {
              html += '<div class="faculty-side-branch-row" style="display:flex; justify-content:center; width:100%; max-width:850px; margin:0.5rem auto;">' +
                '<div style="margin-left:auto; width:100%; max-width:360px;">' +
                  FacultyStudio.buildCardHTML(member, 'right', tierKey) +
                '</div>' +
              '</div>';
            });
          }

          // 3. 1 Card Solo Centered Rows (Editorial Adviser style)
          if (singleMembers.length > 0) {
            singleMembers.forEach(function (member) {
              html += '<div style="display:flex; justify-content:center; width:100%; margin:0.5rem auto;">' +
                '<div style="width:100%; max-width:380px;">' +
                  FacultyStudio.buildCardHTML(member, 'center-single', tierKey) +
                '</div>' +
              '</div>';
            });
          }

          // 4. Side-by-Side Grid Cards (Centered Flexbox Grid — perfectly centered for 1, 2, 3, 4+ cards)
          if (gridMembers.length > 0) {
            html += '<div style="display:flex; justify-content:center; width:100%; margin:0.5rem 0;">' +
              '<div class="faculty-tier-grid" style="display:flex; flex-wrap:wrap; justify-content:center; align-items:stretch; gap:1.25rem; width:100%; max-width:1400px; margin:0 auto;">';
            gridMembers.forEach(function (member) {
              html += '<div style="flex:0 1 310px; max-width:340px; min-width:270px; width:100%; display:flex;">' +
                FacultyStudio.buildCardHTML(member, 'center', tierKey) +
              '</div>';
            });
            html += '</div></div>';
          }
        }

        html += '</div>';

        // Add vertical trunk line between tiers (except after the last one)
        if (tierIdx < sortedTiers.length - 1) {
          html += '<div class="fac-connector-node"></div>';
          html += '<div class="fac-trunk-line" style="min-height:36px;"></div>';
        }
      });

      html += '</div>'; // close fac-org-connector

      this.listContainer.innerHTML = html;
    },

    /* --- Helper to generate card markup with Drag and Drop attributes --- */
    buildCardHTML: function (member, currentLayout, tierKey) {
      var tint = member.tintColor || '#00f0ff';
      var cardBorder = 'border-top: 3px solid ' + tint + '; border-color: ' + tint + '40;';
      var shadow = 'box-shadow: 0 8px 24px ' + tint + '18;';

      var badgeText = '👥 Side-by-Side';
      if (currentLayout === 'center-single') badgeText = '🎯 1 Card Solo';
      else if (currentLayout === 'left') badgeText = '⬅️ Left Branch';
      else if (currentLayout === 'right') badgeText = '➡️ Right Branch';

      return '<div class="slide-card faculty-draggable-card" draggable="true" ' +
        'ondragstart="FacultyStudio.handleDragStart(event, \'' + member.id + '\')" ' +
        'ondragend="FacultyStudio.handleDragEnd(event)" ' +
        'ondragover="FacultyStudio.handleDragOverCard(event)" ' +
        'ondragleave="FacultyStudio.handleDragLeaveCard(event)" ' +
        'ondrop="FacultyStudio.handleDropOnCard(event, \'' + member.id + '\', ' + tierKey + ')" ' +
        'style="background:rgba(10,18,40,0.92); border:1px solid rgba(255,255,255,0.1); border-radius:14px; padding:1rem; ' + cardBorder + ' ' + shadow + ' width:100%; display:flex; flex-direction:column; justify-content:space-between; position:relative; cursor:grab; transition:all 0.15s ease;">' +
        '<div style="position:absolute; top:-10px; right:10px; font-size:0.62rem; font-family:var(--font-mono); background:' + tint + '22; color:' + tint + '; padding:0.1rem 0.5rem; border-radius:999px; font-weight:700; border:1px solid ' + tint + '40;">' + badgeText + '</div>' +
        '<div style="display:flex; gap:0.85rem; align-items:center; margin-bottom:0.75rem;">' +
          '<div style="cursor:grab; font-size:1.1rem; opacity:0.4; padding:0 0.2rem;" title="Drag to move card">⠿</div>' +
          '<div style="width:60px; height:60px; flex-shrink:0; border-radius:14px; overflow:hidden; border:2.5px solid ' + tint + '; background:#050b1a; box-shadow:0 4px 16px ' + tint + '30;">' +
            '<img src="' + (member.image || 'https://res.cloudinary.com/io18jc16/image/upload/f_auto,q_auto/1') + '" alt="' + member.name + '" style="width:100%; height:100%; object-fit:cover;" onerror="this.src=\'https://res.cloudinary.com/io18jc16/image/upload/f_auto,q_auto/1\';" />' +
          '</div>' +
          '<div style="flex:1; min-width:0;">' +
            '<div style="font-size:0.68rem; font-family:var(--font-mono); color:' + tint + '; font-weight:700; text-transform:uppercase; margin-bottom:0.15rem;">' + (member.department || 'BSCS Department') + '</div>' +
            '<h4 style="font-family:var(--font-heading); font-size:0.95rem; font-weight:700; color:#fff; margin:0 0 0.15rem 0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">' + member.name + '</h4>' +
            '<div style="font-size:0.78rem; color:var(--text-subtle); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">' + member.role + '</div>' +
          '</div>' +
        '</div>' +
        '<div style="display:flex; align-items:center; justify-content:space-between; padding-top:0.6rem; border-top:1px solid rgba(255,255,255,0.08); margin-top:auto; flex-wrap:wrap; gap:0.25rem;">' +
          '<div style="display:flex; gap:0.2rem; flex-wrap:wrap; align-items:center;">' +
            '<button type="button" class="toolbar-btn ' + (currentLayout === 'left' ? 'active' : '') + '" onclick="FacultyStudio.setCardAlignment(\'' + member.id + '\', \'left\')" title="Left Branch" style="padding:0.2rem 0.4rem; font-size:0.7rem;">⬅️ Left</button>' +
            '<button type="button" class="toolbar-btn ' + (currentLayout === 'center-single' ? 'active' : '') + '" onclick="FacultyStudio.setCardAlignment(\'' + member.id + '\', \'center-single\')" title="1 Card Alone at Center" style="padding:0.2rem 0.4rem; font-size:0.7rem;">🎯 1 Card</button>' +
            '<button type="button" class="toolbar-btn ' + (currentLayout === 'center' ? 'active' : '') + '" onclick="FacultyStudio.setCardAlignment(\'' + member.id + '\', \'center\')" title="Side-by-Side Row" style="padding:0.2rem 0.4rem; font-size:0.7rem;">👥 Side-by-Side</button>' +
            '<button type="button" class="toolbar-btn ' + (currentLayout === 'right' ? 'active' : '') + '" onclick="FacultyStudio.setCardAlignment(\'' + member.id + '\', \'right\')" title="Right Branch" style="padding:0.2rem 0.4rem; font-size:0.7rem;">➡️ Right</button>' +
            '<button type="button" class="toolbar-btn" onclick="FacultyStudio.moveMember(\'' + member.id + '\', -1)" title="Move Up" style="padding:0.2rem 0.45rem; font-size:0.7rem;">⬆️ Up</button>' +
            '<button type="button" class="toolbar-btn" onclick="FacultyStudio.moveMember(\'' + member.id + '\', 1)" title="Move Down" style="padding:0.2rem 0.45rem; font-size:0.7rem;">⬇️ Down</button>' +
          '</div>' +
          '<div style="display:flex; gap:0.2rem;">' +
            '<button type="button" class="toolbar-btn" onclick="FacultyStudio.editMember(\'' + member.id + '\')" style="padding:0.2rem 0.4rem; font-size:0.7rem;" title="Edit">✏️</button>' +
            '<button type="button" class="toolbar-btn" onclick="FacultyStudio.deleteMember(\'' + member.id + '\')" style="padding:0.2rem 0.4rem; font-size:0.7rem; color:#ff6b8a; border-color:rgba(255,107,138,0.3);" title="Delete">🗑</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    }
  };

  window.FacultyStudio = FacultyStudio;

  document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('fac-member-form')) {
      FacultyStudio.init();
      if (window.StudioVisibility) {
        window.StudioVisibility.init('faculty');
      }
    }
  });

})(window);