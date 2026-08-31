/* ==========================================================================
   iCONNECT HERO SLIDER STUDIO — CONTROLLER (js/slider-studio.js)
   Full CRUD, Automatic Image Compression, Live Publish & Codebase Exporter
   ========================================================================== */

(function (window) {
  'use strict';

  var LOCAL_KEY = 'iconnect_hero_slides';

  /* Datastore Helpers */
  function getStoredSlides() {
    try {
      var stored = JSON.parse(localStorage.getItem(LOCAL_KEY));
      if (Array.isArray(stored) && stored.length > 0) return stored;
    } catch (e) {}
    return (window.heroSlidesData || []).slice();
  }

  function saveStoredSlides(slides) {
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(slides));
      return true;
    } catch (e) {
      console.error('LocalStorage error:', e);
      alert('⚠ Storage limit warning: Image file size is large. The slide was updated in workspace memory.');
      return false;
    }
  }

  window.getMergedHeroSlides = function () {
    return getStoredSlides();
  };

  /* Helper: generate unique id */
  function generateId(title) {
    var slug = (title || 'slide')
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    return 'slide-' + (slug.slice(0, 30) || 'item') + '-' + Date.now().toString(36);
  }

  /* Helper: Compress image file using canvas before setting base64 */
  function compressImageFile(file, callback) {
    var reader = new FileReader();
    reader.onload = function (e) {
      var img = new Image();
      img.onload = function () {
        var canvas = document.createElement('canvas');
        var maxDim = 1200;
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

        // Quality 0.82 JPEG for optimal compressed size
        var compressedBase64 = canvas.toDataURL('image/jpeg', 0.82);
        callback(compressedBase64);
      };
      img.onerror = function () {
        callback(e.target.result);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  /* Slider Studio App Controller */
  var SliderStudio = {
    slides: [],
    editingId: null,

    init: function () {
      this.cacheDOM();
      this.bindEvents();
      this.slides = getStoredSlides();
      this.renderList();
    },

    cacheDOM: function () {
      this.form           = document.getElementById('slide-form');
      this.titleInput     = document.getElementById('slide-title');
      this.badgeInput     = document.getElementById('slide-badge');
      this.excerptInput   = document.getElementById('slide-excerpt');
      this.imageUrlInput  = document.getElementById('slide-image-url');
      this.imageFileInput = document.getElementById('slide-image-file');
      this.imagePreview   = document.getElementById('slide-image-preview');

      this.submitBtn      = document.getElementById('slide-submit-btn');
      this.cancelBtn      = document.getElementById('slide-cancel-btn');
      this.listContainer  = document.getElementById('slides-list');

      this.publishBtn     = document.getElementById('publish-slides-btn');
      this.downloadJsBtn  = document.getElementById('download-slider-js-btn');
      this.resetDefaultBtn = document.getElementById('reset-slides-btn');
    },

    bindEvents: function () {
      var self = this;

      if (this.form) {
        this.form.addEventListener('submit', function (e) {
          e.preventDefault();
          self.saveSlide();
        });
      }

      if (this.cancelBtn) {
        this.cancelBtn.addEventListener('click', function () {
          self.resetForm();
        });
      }

      if (this.imageFileInput) {
        this.imageFileInput.addEventListener('change', function (e) {
          var file = e.target.files[0];
          if (file) {
            compressImageFile(file, function (compressedData) {
              if (self.imageUrlInput) self.imageUrlInput.value = compressedData;
              if (self.imagePreview) self.imagePreview.src = compressedData;
            });
          }
        });
      }

      if (this.imageUrlInput) {
        this.imageUrlInput.addEventListener('input', function () {
          var url = self.imageUrlInput.value.trim() || 'assets/images/articles/gallery-1.jpg';
          if (self.imagePreview) self.imagePreview.src = url;
        });
      }

      if (this.publishBtn) {
        this.publishBtn.addEventListener('click', function () {
          self.publishLive();
        });
      }

      if (this.downloadJsBtn) {
        this.downloadJsBtn.addEventListener('click', function () {
          self.downloadCodebase();
        });
      }

      if (this.resetDefaultBtn) {
        this.resetDefaultBtn.addEventListener('click', function () {
          self.resetToDefaults();
        });
      }
    },

    resetForm: function () {
      this.editingId = null;
      if (this.form) this.form.reset();
      if (this.imageUrlInput) this.imageUrlInput.value = 'assets/images/articles/gallery-1.jpg';
      if (this.imagePreview) this.imagePreview.src = 'assets/images/articles/gallery-1.jpg';
      if (this.submitBtn) this.submitBtn.innerHTML = '✨ Add Slide to Hero';
      if (this.cancelBtn) this.cancelBtn.style.display = 'none';
    },

    saveSlide: function () {
      var title   = (this.titleInput && this.titleInput.value.trim()) || '';
      var badge   = (this.badgeInput && this.badgeInput.value.trim()) || 'Featured Story';
      var excerpt = (this.excerptInput && this.excerptInput.value.trim()) || '';
      var image   = (this.imageUrlInput && this.imageUrlInput.value.trim()) || 'assets/images/articles/gallery-1.jpg';

      if (!title) {
        alert('Please enter a Slide Headline Title.');
        if (this.titleInput) this.titleInput.focus();
        return;
      }

      if (this.editingId) {
        var idx = -1;
        for (var i = 0; i < this.slides.length; i++) {
          if (this.slides[i].id === this.editingId) { idx = i; break; }
        }
        if (idx !== -1) {
          this.slides[idx] = {
            id: this.editingId,
            title: title,
            badge: badge,
            excerpt: excerpt,
            image: image
          };
        }
      } else {
        var newSlide = {
          id: generateId(title),
          title: title,
          badge: badge,
          excerpt: excerpt,
          image: image
        };
        this.slides.unshift(newSlide);
      }

      saveStoredSlides(this.slides);
      this.renderList();
      this.resetForm();
      alert('🎉 Slide Saved Successfully!\n\n"' + title + '" is now saved in your Hero Slider.');
    },

    editSlide: function (id) {
      var slide = null;
      for (var i = 0; i < this.slides.length; i++) {
        if (this.slides[i].id === id) { slide = this.slides[i]; break; }
      }
      if (!slide) return;

      this.editingId = id;
      if (this.titleInput)    this.titleInput.value = slide.title || '';
      if (this.badgeInput)    this.badgeInput.value = slide.badge || '';
      if (this.excerptInput)  this.excerptInput.value = slide.excerpt || '';
      if (this.imageUrlInput) this.imageUrlInput.value = slide.image || '';
      if (this.imagePreview)  this.imagePreview.src = slide.image || 'assets/images/articles/gallery-1.jpg';

      if (this.submitBtn) this.submitBtn.innerHTML = '💾 Update Slide';
      if (this.cancelBtn) this.cancelBtn.style.display = 'inline-flex';

      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    deleteSlide: function (id) {
      if (confirm('Are you sure you want to delete this slide from the Hero Slider?')) {
        var updated = [];
        for (var i = 0; i < this.slides.length; i++) {
          if (this.slides[i].id !== id) updated.push(this.slides[i]);
        }
        this.slides = updated;
        saveStoredSlides(this.slides);
        this.renderList();
        if (this.editingId === id) this.resetForm();
      }
    },

    moveSlide: function (id, direction) {
      var idx = -1;
      for (var i = 0; i < this.slides.length; i++) {
        if (this.slides[i].id === id) { idx = i; break; }
      }
      if (idx === -1) return;
      var targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= this.slides.length) return;

      var temp = this.slides[idx];
      this.slides[idx] = this.slides[targetIdx];
      this.slides[targetIdx] = temp;

      saveStoredSlides(this.slides);
      this.renderList();
    },

    publishLive: function () {
      saveStoredSlides(this.slides);
      alert('🚀 Published Successfully!\n\nYour Hero Slider slides are now live on the homepage.');
    },

    resetToDefaults: function () {
      if (confirm('Reset Hero Slider to original default slides? Any custom additions will be cleared.')) {
        localStorage.removeItem(LOCAL_KEY);
        this.slides = (window.heroSlidesData || []).slice();
        this.renderList();
        this.resetForm();
        alert('🔄 Hero Slider reset to defaults.');
      }
    },

    downloadCodebase: function () {
      var slidesToSave = this.slides;
      var code =
        '/* ==========================================================================\n' +
        '   iCONNECT PUBLICATION — HERO SLIDER DATASTORE (js/slider.js)\n' +
        '   Standalone Data Module for Front Page Hero Slider (Independent of Articles)\n' +
        '   ========================================================================== */\n\n' +
        'var heroSlidesData = [\n' +
        slidesToSave.map(function (s) {
          return '  {\n' +
            '    id: ' + JSON.stringify(s.id) + ',\n' +
            '    title: ' + JSON.stringify(s.title) + ',\n' +
            '    badge: ' + JSON.stringify(s.badge || 'Featured Story') + ',\n' +
            '    excerpt: ' + JSON.stringify(s.excerpt || '') + ',\n' +
            '    image: ' + JSON.stringify(s.image || '') + '\n' +
            '  }';
        }).join(',\n') +
        '\n];\n\nif (typeof window !== "undefined") {\n  window.heroSlidesData = heroSlidesData;\n  window.getMergedHeroSlides = function () {\n    try {\n      var stored = localStorage.getItem("iconnect_hero_slides");\n      if (stored) {\n        var parsed = JSON.parse(stored);\n        if (Array.isArray(parsed) && parsed.length > 0) return parsed;\n      }\n    } catch (e) {}\n    return window.heroSlidesData || [];\n  };\n}\n';

      var blob = new Blob([code], { type: 'text/javascript' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'slider.js';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      alert('💾 Downloaded slider.js!\n\nReplace js/slider.js in your project folder before deploying.');
    },

    renderList: function () {
      if (!this.listContainer) return;

      if (this.slides.length === 0) {
        this.listContainer.innerHTML =
          '<div style="color:var(--text-muted); text-align:center; padding:3rem 1rem;">No slides in the Hero Slider. Add your first slide using the form on the left!</div>';
        return;
      }

      var self = this;
      this.listContainer.innerHTML = this.slides.map(function (slide, idx) {
        var isFirst = idx === 0;
        var isLast  = idx === self.slides.length - 1;

        return '<div class="slide-card" style="display:flex; gap:1rem; align-items:flex-start; background:rgba(10,18,40,0.85); border:1px solid rgba(244,180,26,0.2); border-radius:14px; padding:1rem; margin-bottom:1rem;">' +
          '<div style="width:100px; height:75px; flex-shrink:0; border-radius:8px; overflow:hidden; background:#050b1a; border:1px solid rgba(255,255,255,0.1); margin-top:0.25rem;">' +
            '<img src="' + (slide.image || 'assets/images/articles/gallery-1.jpg') + '" alt="' + (slide.title || 'Slide') + '" style="width:100%; height:100%; object-fit:cover;" onerror="this.src=\'assets/images/articles/gallery-1.jpg\';" />' +
          '</div>' +
          '<div style="flex:1; min-width:0;">' +
            '<div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.25rem;">' +
              '<span style="font-size:0.7rem; font-family:var(--font-mono); color:var(--cheddar-yellow); background:rgba(244,180,26,0.15); padding:0.1rem 0.5rem; border-radius:999px; font-weight:600;">' + (slide.badge || 'Featured') + '</span>' +
              '<span style="font-size:0.7rem; color:var(--text-subtle); font-family:var(--font-mono);">Slide #' + (idx + 1) + '</span>' +
            '</div>' +
            '<h4 style="font-family:var(--font-heading); font-size:0.95rem; font-weight:700; color:#fff; margin:0 0 0.25rem 0; line-clamp:2; -webkit-line-clamp:2; display:-webkit-box; -webkit-box-orient:vertical; overflow:hidden; line-height:1.35;">' + (slide.title || 'Untitled') + '</h4>' +
            '<p style="font-size:0.8rem; color:var(--text-muted); margin:0; line-clamp:2; -webkit-line-clamp:2; display:-webkit-box; -webkit-box-orient:vertical; overflow:hidden; line-height:1.4;">' + (slide.excerpt || 'No description.') + '</p>' +
          '</div>' +
          '<div style="display:flex; flex-direction:column; gap:0.35rem; flex-shrink:0;">' +
            '<div style="display:flex; gap:0.25rem;">' +
              '<button class="toolbar-btn" onclick="SliderStudio.moveSlide(\'' + slide.id + '\', \'up\')" ' + (isFirst ? 'disabled style="opacity:0.3;"' : '') + ' style="padding:0.2rem 0.4rem; font-size:0.75rem;" title="Move Up">▲</button>' +
              '<button class="toolbar-btn" onclick="SliderStudio.moveSlide(\'' + slide.id + '\', \'down\')" ' + (isLast ? 'disabled style="opacity:0.3;"' : '') + ' style="padding:0.2rem 0.4rem; font-size:0.75rem;" title="Move Down">▼</button>' +
            '</div>' +
            '<button class="toolbar-btn" onclick="SliderStudio.editSlide(\'' + slide.id + '\')" style="padding:0.25rem 0.5rem; font-size:0.75rem;" title="Edit Slide">✏️ Edit</button>' +
            '<button class="toolbar-btn" onclick="SliderStudio.deleteSlide(\'' + slide.id + '\')" style="padding:0.25rem 0.5rem; font-size:0.75rem; color:#ff6b8a; border-color:rgba(255,107,138,0.3);" title="Delete Slide">🗑 Del</button>' +
          '</div>' +
        '</div>';
      }).join('');
    }
  };

  window.SliderStudio = SliderStudio;

  document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('slide-form')) {
      SliderStudio.init();
      if (window.StudioVisibility) {
        window.StudioVisibility.init('slider');
      }
    }
  });

})(window);
