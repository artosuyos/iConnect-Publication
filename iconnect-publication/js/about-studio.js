/* ==========================================================================
   iCONNECT PUBLICATION — WHY iCONNECT / ABOUT STUDIO ENGINE (js/about-studio.js)
   Full-featured Studio Manager for the Homepage "Why iConnect?" section.
   Supports Live Real-Time Previews, Narrative Customization, Card Management,
   Icon Selection, Color Customization, and Codebase Commit Exports.
   ========================================================================== */

(function (window) {
  'use strict';

  var PRESET_COLORS = [
    { name: 'Cheddar Gold', hex: '#f4b41a' },
    { name: 'Cyber Cyan', hex: '#00f0ff' },
    { name: 'Neon Purple', hex: '#a78bfa' },
    { name: 'Emerald Green', hex: '#10b981' },
    { name: 'Sunset Orange', hex: '#f97316' },
    { name: 'Rose Pink', hex: '#ff6b8a' },
    { name: 'Electric Blue', hex: '#3b82f6' },
    { name: 'Platinum White', hex: '#e2e8f0' }
  ];

  var AboutStudio = {
    data: null,
    editingCardId: null,

    init: function () {
      this.data = window.getMergedWhyIConnectData ? window.getMergedWhyIConnectData() : JSON.parse(JSON.stringify(window.defaultWhyIConnectData));
      this.populateFormFields();
      this.renderCardsList();
      this.updateLivePreview();
      this.bindEvents();
    },

    bindEvents: function () {
      var self = this;

      // Section info fields
      var narrativeInputs = [
        'why-section-tag', 'why-title-prefix', 'why-title-highlight', 'why-title-suffix',
        'why-highlight-color', 'why-paragraph-1', 'why-quote-text', 'why-quote-color', 'why-paragraph-2'
      ];

      narrativeInputs.forEach(function (id) {
        var el = document.getElementById(id);
        if (el) {
          el.addEventListener('input', function () {
            self.syncFromNarrativeForm();
            self.updateLivePreview();
          });
        }
      });

      // Quick color sync
      var quoteColorEl = document.getElementById('why-quote-color');
      if (quoteColorEl) {
        quoteColorEl.addEventListener('change', function () {
          self.syncFromNarrativeForm();
          self.updateLivePreview();
        });
      }

      var highlightColorEl = document.getElementById('why-highlight-color');
      if (highlightColorEl) {
        highlightColorEl.addEventListener('change', function () {
          self.syncFromNarrativeForm();
          self.updateLivePreview();
        });
      }
    },

    /* --- Sync narrative form to local data --- */
    syncFromNarrativeForm: function () {
      var getVal = function (id, fallback) {
        var el = document.getElementById(id);
        return el ? el.value : fallback;
      };

      this.data.sectionTag       = getVal('why-section-tag', 'About The Publication');
      this.data.titlePrefix      = getVal('why-title-prefix', 'Why');
      this.data.titleHighlight   = getVal('why-title-highlight', 'iConnect');
      this.data.titleSuffix      = getVal('why-title-suffix', '?');
      this.data.highlightColor   = getVal('why-highlight-color', '#f4b41a');
      this.data.paragraph1       = getVal('why-paragraph-1', '');
      this.data.quoteText        = getVal('why-quote-text', '');
      this.data.quoteAccentColor = getVal('why-quote-color', '#f4b41a');
      this.data.paragraph2       = getVal('why-paragraph-2', '');
    },

    /* --- Populate Narrative Form from Data --- */
    populateFormFields: function () {
      var setVal = function (id, val) {
        var el = document.getElementById(id);
        if (el && typeof val !== 'undefined') el.value = val;
      };

      setVal('why-section-tag',       this.data.sectionTag || 'About The Publication');
      setVal('why-title-prefix',      this.data.titlePrefix || 'Why');
      setVal('why-title-highlight',   this.data.titleHighlight || 'iConnect');
      setVal('why-title-suffix',      this.data.titleSuffix || '?');
      setVal('why-highlight-color',   this.data.highlightColor || '#f4b41a');
      setVal('why-paragraph-1',       this.data.paragraph1 || '');
      setVal('why-quote-text',        this.data.quoteText || '');
      setVal('why-quote-color',       this.data.quoteAccentColor || '#f4b41a');
      setVal('why-paragraph-2',       this.data.paragraph2 || '');
    },

    /* --- Switch Studio Tabs --- */
    switchTab: function (tabId) {
      document.querySelectorAll('.tab-btn').forEach(function (btn) {
        btn.classList.remove('active');
      });
      document.querySelectorAll('.tab-pane').forEach(function (pane) {
        pane.classList.remove('active');
      });

      var activeBtn = document.getElementById('tab-btn-' + tabId);
      var activePane = document.getElementById('tab-pane-' + tabId);
      if (activeBtn) activeBtn.classList.add('active');
      if (activePane) activePane.classList.add('active');

      if (tabId === 'code') {
        this.updateCodeExportTab();
      }
    },

    /* --- Render Cards List in Management Tab --- */
    renderCardsList: function () {
      var container = document.getElementById('why-cards-list');
      if (!container) return;

      var self = this;
      var cards = this.data.cards || [];

      if (cards.length === 0) {
        container.innerHTML = '<div style="color:var(--text-muted); text-align:center; padding:2rem;">No feature cards added yet. Click "+ Add New Card" below!</div>';
        return;
      }

      container.innerHTML = cards.map(function (card, index) {
        var tint = card.tintColor || '#f4b41a';
        var iconSvg = window.getWhyIConnectIconSVG ? window.getWhyIConnectIconSVG(card.icon) : '';

        return '<div class="draft-card" style="border-left: 4px solid ' + tint + '; align-items:center; gap:1rem;">' +
          '<div style="width:44px; height:44px; min-width:44px; border-radius:10px; background:' + tint + '20; color:' + tint + '; border:1px solid ' + tint + '40; display:flex; align-items:center; justify-content:center;">' +
            iconSvg +
          '</div>' +
          '<div style="flex:1; min-width:0;">' +
            '<div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.25rem;">' +
              '<span style="font-family:var(--font-mono); font-size:0.75rem; color:' + tint + '; font-weight:700;">Card #' + (index + 1) + '</span>' +
              '<span style="font-size:0.7rem; color:var(--text-subtle); background:rgba(255,255,255,0.06); padding:0.1rem 0.4rem; border-radius:4px;">Icon: ' + (card.icon || 'broadcast') + '</span>' +
            '</div>' +
            '<h4 style="font-family:var(--font-heading); font-size:1.05rem; font-weight:700; color:#fff; margin:0 0 0.25rem 0;">' + (card.title || 'Untitled Card') + '</h4>' +
            '<p style="font-size:0.85rem; color:var(--text-muted); margin:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">' + (card.description || '') + '</p>' +
          '</div>' +
          '<div style="display:flex; gap:0.35rem; align-items:center; flex-shrink:0;">' +
            '<button type="button" class="toolbar-btn" onclick="AboutStudio.moveCard(' + index + ', -1)" title="Move Up" ' + (index === 0 ? 'disabled style="opacity:0.4;"' : '') + '>▲</button>' +
            '<button type="button" class="toolbar-btn" onclick="AboutStudio.moveCard(' + index + ', 1)" title="Move Down" ' + (index === cards.length - 1 ? 'disabled style="opacity:0.4;"' : '') + '>▼</button>' +
            '<button type="button" class="toolbar-btn" onclick="AboutStudio.openCardModal(\'' + card.id + '\')" style="color:var(--cheddar-yellow); border-color:rgba(244,180,26,0.3);">✏️ Edit</button>' +
            '<button type="button" class="toolbar-btn" onclick="AboutStudio.deleteCard(\'' + card.id + '\')" style="color:#ff6b8a; border-color:rgba(255,107,138,0.3);">🗑</button>' +
          '</div>' +
        '</div>';
      }).join('');
    },

    /* --- Move Card Up / Down --- */
    moveCard: function (index, dir) {
      var target = index + dir;
      if (target < 0 || target >= this.data.cards.length) return;
      var temp = this.data.cards[index];
      this.data.cards[index] = this.data.cards[target];
      this.data.cards[target] = temp;
      this.renderCardsList();
      this.updateLivePreview();
    },

    /* --- Open Card Modal (Add or Edit) --- */
    openCardModal: function (cardId) {
      this.editingCardId = cardId || null;
      var modal = document.getElementById('why-card-modal');
      var titleEl = document.getElementById('why-modal-card-heading');
      var formTitle = document.getElementById('card-input-title');
      var formDesc = document.getElementById('card-input-desc');
      var formIcon = document.getElementById('card-input-icon');
      var formColor = document.getElementById('card-input-color');

      var card = null;
      if (cardId) {
        card = (this.data.cards || []).find(function (c) { return c.id === cardId; });
      }

      if (titleEl) titleEl.textContent = card ? 'Edit Feature Card' : 'Add New Feature Card';

      if (formTitle) formTitle.value = card ? card.title : '';
      if (formDesc)  formDesc.value  = card ? card.description : '';
      if (formIcon)  formIcon.value  = card ? card.icon : 'broadcast';
      if (formColor) formColor.value = card ? (card.tintColor || '#f4b41a') : '#f4b41a';

      this.renderColorPresets('card-color-presets', formColor ? formColor.value : '#f4b41a');
      this.updateCardModalIconPreview();

      if (modal) modal.classList.add('active');
    },

    closeCardModal: function () {
      var modal = document.getElementById('why-card-modal');
      if (modal) modal.classList.remove('active');
      this.editingCardId = null;
    },

    /* --- Render Preset Color Pills --- */
    renderColorPresets: function (containerId, selectedHex) {
      var container = document.getElementById(containerId);
      if (!container) return;

      var self = this;
      container.innerHTML = PRESET_COLORS.map(function (c) {
        var isSelected = c.hex.toLowerCase() === (selectedHex || '').toLowerCase();
        return '<button type="button" class="color-preset-pill" onclick="AboutStudio.selectPresetColor(\'' + c.hex + '\')" style="background:' + c.hex + '; width:26px; height:26px; border-radius:50%; border:' + (isSelected ? '2px solid #ffffff' : '2px solid transparent') + '; cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,0.4); transform:' + (isSelected ? 'scale(1.15)' : 'scale(1)') + '; transition:all 0.18s;"></button>';
      }).join('');
    },

    selectPresetColor: function (hex) {
      var input = document.getElementById('card-input-color');
      if (input) {
        input.value = hex;
        this.renderColorPresets('card-color-presets', hex);
        this.updateCardModalIconPreview();
      }
    },

    updateCardModalIconPreview: function () {
      var iconSelect = document.getElementById('card-input-icon');
      var colorInput = document.getElementById('card-input-color');
      var previewBox = document.getElementById('card-modal-icon-preview');
      if (!previewBox) return;

      var iconName = iconSelect ? iconSelect.value : 'broadcast';
      var tint = colorInput ? colorInput.value : '#f4b41a';
      var iconSvg = window.getWhyIConnectIconSVG ? window.getWhyIConnectIconSVG(iconName) : '';

      previewBox.style.background = tint + '20';
      previewBox.style.color = tint;
      previewBox.style.borderColor = tint + '45';
      previewBox.innerHTML = iconSvg;
    },

    /* --- Save Card from Modal --- */
    saveCardFromModal: function () {
      var titleInput = document.getElementById('card-input-title');
      var descInput  = document.getElementById('card-input-desc');
      var iconInput  = document.getElementById('card-input-icon');
      var colorInput = document.getElementById('card-input-color');

      var title = (titleInput && titleInput.value.trim()) || 'Feature Card';
      var desc  = (descInput && descInput.value.trim())   || '';
      var icon  = (iconInput && iconInput.value)          || 'broadcast';
      var tint  = (colorInput && colorInput.value)        || '#f4b41a';

      if (!this.data.cards) this.data.cards = [];

      if (this.editingCardId) {
        var idx = this.data.cards.findIndex(function (c) { return c.id === this.editingCardId; }.bind(this));
        if (idx !== -1) {
          this.data.cards[idx].title = title;
          this.data.cards[idx].description = desc;
          this.data.cards[idx].icon = icon;
          this.data.cards[idx].tintColor = tint;
          this.data.cards[idx].borderColor = tint + '40';
        }
      } else {
        var newCard = {
          id: 'card-' + Date.now(),
          title: title,
          description: desc,
          icon: icon,
          tintColor: tint,
          borderColor: tint + '40',
          bgColor: 'rgba(10, 18, 40, 0.65)'
        };
        this.data.cards.push(newCard);
      }

      this.closeCardModal();
      this.renderCardsList();
      this.updateLivePreview();
    },

    /* --- Delete Card --- */
    deleteCard: function (cardId) {
      if (confirm('Are you sure you want to delete this feature card?')) {
        this.data.cards = (this.data.cards || []).filter(function (c) { return c.id !== cardId; });
        this.renderCardsList();
        this.updateLivePreview();
      }
    },

    /* --- Update Real-Time Live Preview --- */
    updateLivePreview: function () {
      var previewContainer = document.getElementById('about-live-preview');
      if (!previewContainer) return;

      var highlightColor = this.data.highlightColor || '#f4b41a';
      var quoteAccentColor = this.data.quoteAccentColor || '#f4b41a';

      var titleHTML = (this.data.titlePrefix ? this.data.titlePrefix + ' ' : '') +
        '<span style="color:' + highlightColor + ';">' + (this.data.titleHighlight || 'iConnect') + '</span>' +
        (this.data.titleSuffix || '?');

      var cardsHTML = (this.data.cards || []).map(function (card) {
        var tint = card.tintColor || '#f4b41a';
        var border = card.borderColor || (tint + '40');
        var bg = card.bgColor || 'rgba(10, 18, 40, 0.65)';
        var iconSvg = window.getWhyIConnectIconSVG ? window.getWhyIConnectIconSVG(card.icon) : '';

        return '<div class="about-feature-card" style="background:' + bg + '; border:1px solid ' + border + '; transition:all 0.3s ease; box-shadow:0 8px 30px rgba(0,0,0,0.3);">' +
          '<div class="feature-icon" style="background:' + tint + '20; color:' + tint + '; border:1px solid ' + tint + '40;">' +
            iconSvg +
          '</div>' +
          '<div>' +
            '<h3 class="feature-title" style="color:#ffffff;">' + (card.title || '') + '</h3>' +
            '<p class="feature-desc" style="color:var(--text-muted);">' + (card.description || '') + '</p>' +
          '</div>' +
        '</div>';
      }).join('');

      previewContainer.innerHTML =
        '<div class="about-grid" style="margin:0;">' +
          '<div>' +
            '<span class="section-tag">' + (this.data.sectionTag || 'About The Publication') + '</span>' +
            '<h2 class="section-title">' + titleHTML + '</h2>' +
            '<div class="about-text">' +
              (this.data.paragraph1 ? '<p>' + this.data.paragraph1 + '</p>' : '') +
              (this.data.quoteText ? '<div class="about-highlight" style="border-left-color:' + quoteAccentColor + ';">"' + this.data.quoteText + '"</div>' : '') +
              (this.data.paragraph2 ? '<p>' + this.data.paragraph2 + '</p>' : '') +
            '</div>' +
          '</div>' +
          '<div class="about-cards-stack">' +
            cardsHTML +
          '</div>' +
        '</div>';
    },

    /* --- Publish Live to Homepage --- */
    publishLive: function () {
      this.syncFromNarrativeForm();
      var success = window.saveWhyIConnectData ? window.saveWhyIConnectData(this.data) : false;

      if (success) {
        this.showToast('🎉 "Why iConnect?" updated live on Homepage & About Page!');
        if (confirm('🎉 Why iConnect Published Successfully!\n\nAll changes to narrative and feature cards are now live on both the Homepage and About Page.\n\nClick OK to open the About Page now, or Cancel to stay in the Studio.')) {
          window.open('about.html', '_blank');
        }
      } else {
        alert('Could not save changes to browser storage.');
      }
    },

    /* --- Code Export Helper --- */
    getFormattedExportCode: function () {
      this.syncFromNarrativeForm();
      return '/* ==========================================================================\n' +
        '   iCONNECT PUBLICATION — WHY iCONNECT / ABOUT DATASTORE (js/about.js)\n' +
        '   ========================================================================== */\n\n' +
        'var whyIConnectData = ' + JSON.stringify(this.data, null, 2) + ';\n\n' +
        'if (typeof window !== "undefined") {\n' +
        '  window.whyIConnectData = whyIConnectData;\n' +
        '}\n';
    },

    updateCodeExportTab: function () {
      var codeBlock = document.getElementById('why-export-code');
      if (codeBlock) {
        codeBlock.textContent = this.getFormattedExportCode();
      }
    },

    /* --- Export Modal (JS Code Generator) --- */
    openExportModal: function () {
      this.syncFromNarrativeForm();
      var modal = document.getElementById('why-export-modal');
      var codeBlock = document.getElementById('why-modal-export-code');
      var tabCodeBlock = document.getElementById('why-export-code');

      var formattedCode = this.getFormattedExportCode();

      if (codeBlock) codeBlock.textContent = formattedCode;
      if (tabCodeBlock) tabCodeBlock.textContent = formattedCode;
      if (modal) modal.classList.add('active');
    },

    closeExportModal: function () {
      var modal = document.getElementById('why-export-modal');
      if (modal) modal.classList.remove('active');
    },

    copyExportCode: function (isModal) {
      var codeBlock = isModal
        ? (document.getElementById('why-modal-export-code') || document.getElementById('why-export-code'))
        : (document.getElementById('why-export-code') || document.getElementById('why-modal-export-code'));

      if (!codeBlock) return;

      var text = codeBlock.textContent;
      var btn = isModal
        ? document.getElementById('why-modal-btn-copy')
        : document.getElementById('why-btn-copy');

      navigator.clipboard.writeText(text).then(function () {
        if (btn) {
          btn.textContent = '✓ Copied to Clipboard!';
          setTimeout(function () {
            btn.textContent = '📋 Copy JS Object';
          }, 2000);
        }
      }).catch(function () {
        alert('Code copied to clipboard!');
      });
    },

    downloadUpdatedAboutJS: function () {
      this.syncFromNarrativeForm();
      var fullScript = '/* ==========================================================================\n' +
        '   iCONNECT PUBLICATION — WHY iCONNECT / ABOUT DATASTORE (js/about.js)\n' +
        '   Controls the "Why iConnect?" narrative, quotes, and feature cards on the Homepage.\n' +
        '   ========================================================================== */\n\n' +
        '(function (window) {\n' +
        '  \'use strict\';\n\n' +
        '  var LOCAL_KEY = \'iconnect_why_data\';\n\n' +
        '  var defaultWhyIConnectData = ' + JSON.stringify(this.data, null, 2) + ';\n\n' +
        '  var ICON_SVGS = ' + JSON.stringify(window.WHY_ICONNECT_ICONS || {}, null, 2) + ';\n\n' +
        '  function getIconSVG(iconName) {\n' +
        '    if (!iconName) return ICON_SVGS.broadcast;\n' +
        '    if (iconName.indexOf(\'<svg\') !== -1) return iconName;\n' +
        '    return ICON_SVGS[iconName.toLowerCase()] || ICON_SVGS.broadcast;\n' +
        '  }\n\n' +
        '  function getMergedWhyIConnectData() {\n' +
        '    try {\n' +
        '      var stored = localStorage.getItem(LOCAL_KEY);\n' +
        '      if (stored) {\n' +
        '        var parsed = JSON.parse(stored);\n' +
        '        if (parsed && typeof parsed === \'object\') {\n' +
        '          return Object.assign({}, defaultWhyIConnectData, parsed);\n' +
        '        }\n' +
        '      }\n' +
        '    } catch (e) {}\n' +
        '    return JSON.parse(JSON.stringify(defaultWhyIConnectData));\n' +
        '  }\n\n' +
        '  function saveWhyIConnectData(data) {\n' +
        '    try {\n' +
        '      localStorage.setItem(LOCAL_KEY, JSON.stringify(data));\n' +
        '      if (typeof window !== \'undefined\') window.whyIConnectData = data;\n' +
        '      return true;\n' +
        '    } catch (e) { return false; }\n' +
        '  }\n\n' +
        '  function formatParagraphHTML(text) {\n' +
        '    if (!text) return \'\';\n' +
        '    var trimmed = text.trim();\n' +
        '    if (trimmed.startsWith(\'<p>\') || trimmed.startsWith(\'<div>\')) return trimmed;\n' +
        '    return trimmed.split(/\\n\\s*\\n/).map(function (p) {\n' +
        '      var pt = p.trim();\n' +
        '      return pt ? \'<p>\' + pt + \'</p>\' : \'\';\n' +
        '    }).join(\'\');\n' +
        '  }\n\n' +
        '  function renderWhyIConnectSection(targetElOrId) {\n' +
        '    var container = typeof targetElOrId === \'string\' ? document.getElementById(targetElOrId) : targetElOrId;\n' +
        '    if (!container) return;\n' +
        '    var data = getMergedWhyIConnectData();\n' +
        '    var highlightColor = data.highlightColor || \'#f4b41a\';\n' +
        '    var quoteAccentColor = data.quoteAccentColor || \'#f4b41a\';\n' +
        '    var titleHTML = (data.titlePrefix ? data.titlePrefix + \' \' : \'\') +\n' +
        '      \'<span style="color:\' + highlightColor + \';">\' + (data.titleHighlight || \'iConnect\') + \'</span>\' +\n' +
        '      (data.titleSuffix || \'?\');\n' +
        '    var cardsHTML = (data.cards || []).map(function (card) {\n' +
        '      var tint = card.tintColor || \'#f4b41a\';\n' +
        '      var border = card.borderColor || (tint + \'40\');\n' +
        '      var bg = card.bgColor || \'rgba(10, 18, 40, 0.65)\';\n' +
        '      var iconSvg = getIconSVG(card.icon);\n' +
        '      return \'<div class="about-feature-card" style="background:\' + bg + \'; border:1px solid \' + border + \'; transition:all 0.3s ease;">\' +\n' +
        '        \'<div class="feature-icon" style="background:\' + tint + \'20; color:\' + tint + \'; border:1px solid \' + tint + \'40;">\' +\n' +
        '          iconSvg +\n' +
        '        \'</div>\' +\n' +
        '        \'<div>\' +\n' +
        '          \'<h3 class="feature-title" style="color:#ffffff;">\' + (card.title || \'\') + \'</h3>\' +\n' +
        '          \'<p class="feature-desc" style="color:var(--text-muted); font-size:0.9rem;">\' + (card.description || \'\') + \'</p>\' +\n' +
        '        \'</div>\' +\n' +
        '      \'</div>\';\n' +
        '    }).join(\'\');\n' +
        '    container.innerHTML =\n' +
        '      \'<div class="about-grid">\' +\n' +
        '        \'<div>\' +\n' +
        '          \'<span class="section-tag">\' + (data.sectionTag || \'About The Publication\') + \'</span>\' +\n' +
        '          \'<h2 class="section-title">\' + titleHTML + \'</h2>\' +\n' +
        '          \'<div class="about-text">\' +\n' +
        '            formatParagraphHTML(data.paragraph1) +\n' +
        '            (data.quoteText ? \'<div class="about-highlight" style="border-left-color:\' + quoteAccentColor + \';">"\' + data.quoteText + \'"</div>\' : \'\') +\n' +
        '            formatParagraphHTML(data.paragraph2) +\n' +
        '          \'</div>\' +\n' +
        '        \'</div>\' +\n' +
        '        \'<div class="about-cards-stack">\' +\n' +
        '          cardsHTML +\n' +
        '        \'</div>\' +\n' +
        '      \'</div>\';\n' +
        '  }\n\n' +
        '  window.defaultWhyIConnectData = defaultWhyIConnectData;\n' +
        '  window.whyIConnectData = getMergedWhyIConnectData();\n' +
        '  window.getMergedWhyIConnectData = getMergedWhyIConnectData;\n' +
        '  window.saveWhyIConnectData = saveWhyIConnectData;\n' +
        '  window.renderWhyIConnectSection = renderWhyIConnectSection;\n' +
        '  window.getWhyIConnectIconSVG = getIconSVG;\n' +
        '  window.WHY_ICONNECT_ICONS = ICON_SVGS;\n\n' +
        '})(typeof window !== \'undefined\' ? window : this);\n';

      var blob = new Blob([fullScript], { type: 'text/javascript' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'about.js';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },

    /* --- Reset to Defaults --- */
    resetToDefaults: function () {
      if (confirm('Are you sure you want to reset the "Why iConnect?" section to factory defaults? All custom text and cards will be restored.')) {
        try {
          localStorage.removeItem('iconnect_why_data');
        } catch (e) {}
        this.data = JSON.parse(JSON.stringify(window.defaultWhyIConnectData));
        this.populateFormFields();
        this.renderCardsList();
        this.updateLivePreview();
        this.showToast('↺ Restored Why iConnect section to default data!');
      }
    },

    /* --- Toast Notification Helper --- */
    showToast: function (msg) {
      var toast = document.createElement('div');
      toast.style.cssText = 'position:fixed; bottom:2rem; right:2rem; background:linear-gradient(135deg, #10b981, #059669); color:#fff; padding:0.85rem 1.5rem; border-radius:12px; font-weight:700; font-family:var(--font-heading); box-shadow:0 10px 30px rgba(0,0,0,0.5); z-index:99999; animation:fadeIn 0.25s ease;';
      toast.textContent = msg;
      document.body.appendChild(toast);
      setTimeout(function () {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(function () { toast.remove(); }, 300);
      }, 2600);
    }
  };

  window.AboutStudio = AboutStudio;

  document.addEventListener('DOMContentLoaded', function () {
    AboutStudio.init();
  });

})(typeof window !== 'undefined' ? window : this);
