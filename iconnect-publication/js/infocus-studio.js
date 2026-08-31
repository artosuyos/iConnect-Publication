/* ==========================================================================
   iCONNECT — IN FOCUS VIDEO STUDIO MANAGER (js/infocus-studio.js)
   Full CRUD: Add, Edit, Delete, Reorder, YouTube Extraction, Live Preview,
   Hide/Show Toggle & Standalone Codebase Exporter
   ========================================================================== */

(function () {
  'use strict';

  var STORAGE_KEY = 'iconnect_infocus_videos';
  var HEADER_STORAGE_KEY = 'iconnect_infocus_header';
  var VISIBILITY_KEY = 'iconnect_show_infocus';

  function extractYouTubeId(url) {
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

  function getPublishedHeader() {
    return (window.infocusHeaderData || {
      badge: "Video Showcase & Spotlight",
      title: "In Focus",
      description: "Experience the vibrant stories, student innovations, campus documentaries, and multimedia broadcasts of the BSCS community.",
      showSection: true
    });
  }

  function getStoredHeader() {
    try {
      var stored = JSON.parse(localStorage.getItem(HEADER_STORAGE_KEY));
      if (stored && typeof stored === 'object') return Object.assign({}, getPublishedHeader(), stored);
    } catch (e) {}
    return getPublishedHeader();
  }

  function saveStoredHeader(header) {
    try {
      localStorage.setItem(HEADER_STORAGE_KEY, JSON.stringify(header));
    } catch (e) {}
  }

  function getStoredVideos() {
    try {
      var data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        var parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return (window.infocusVideosData || []).slice();
  }

  function saveStoredVideos(videos) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(videos));
      return true;
    } catch (e) {
      console.error('Videos storage error:', e);
      return false;
    }
  }

  var InFocusStudio = {
    videos: [],
    editingId: null,
    currentThumbBase64: '',
    previewActiveVideo: null,

    init: function () {
      this.videos = getStoredVideos();
      this.cacheDOM();
      this.bindEvents();
      this.loadHeaderSettingsForm();
      this.renderVisibilityCard();
      this.renderVideosList();
      if (this.videos.length > 0) {
        this.setPlayerPreview(this.videos.find(function(v){ return v.featured; }) || this.videos[0]);
      }
    },

    cacheDOM: function () {
      this.form = document.getElementById('infocus-video-form');
      this.idInput = document.getElementById('vid-id');
      this.titleInput = document.getElementById('vid-title');
      this.urlInput = document.getElementById('vid-url');
      this.categoryInput = document.getElementById('vid-category');
      this.durationInput = document.getElementById('vid-duration');
      this.dateInput = document.getElementById('vid-date');
      this.descInput = document.getElementById('vid-desc');
      this.featuredCheckbox = document.getElementById('vid-featured');
      this.thumbFileInput = document.getElementById('vid-thumb-file');
      this.thumbUrlInput = document.getElementById('vid-thumb-url');
      this.thumbPreview = document.getElementById('vid-thumb-preview');
      this.formTitle = document.getElementById('infocus-form-title');
      this.submitBtn = document.getElementById('vid-submit-btn');
      this.clearBtn = document.getElementById('vid-clear-btn');
      this.deleteBtn = document.getElementById('vid-delete-btn');
      this.videosListContainer = document.getElementById('infocus-videos-list');
      this.videoCountEl = document.getElementById('infocus-video-count');
      this.searchInput = document.getElementById('infocus-search-input');
      this.playerContainer = document.getElementById('infocus-player-preview-box');
      this.visibilityCard = document.getElementById('infocus-visibility-card');
    },

    bindEvents: function () {
      var self = this;

      if (this.form) {
        this.form.addEventListener('submit', function (e) {
          e.preventDefault();
          self.saveVideo();
        });
      }

      if (this.clearBtn) {
        this.clearBtn.addEventListener('click', function () {
          self.resetForm();
        });
      }

      if (this.deleteBtn) {
        this.deleteBtn.addEventListener('click', function () {
          if (self.editingId) self.deleteVideo(self.editingId);
        });
      }

      if (this.urlInput) {
        this.urlInput.addEventListener('input', function () {
          var ytid = extractYouTubeId(self.urlInput.value);
          if (ytid && !self.thumbUrlInput.value && !self.currentThumbBase64) {
            self.thumbUrlInput.placeholder = 'Auto YouTube thumbnail detected';
            self.updateThumbPreview('https://img.youtube.com/vi/' + ytid + '/maxresdefault.jpg');
          }
        });
      }

      if (this.thumbFileInput) {
        this.thumbFileInput.addEventListener('change', function (e) {
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
              self.currentThumbBase64 = canvas.toDataURL('image/jpeg', 0.85);
              if (self.thumbUrlInput) self.thumbUrlInput.value = '';
              self.updateThumbPreview();
            };
            img.src = evt.target.result;
          };
          reader.readAsDataURL(file);
        });
      }

      if (this.thumbUrlInput) {
        this.thumbUrlInput.addEventListener('input', function () {
          self.currentThumbBase64 = '';
          self.updateThumbPreview();
        });
      }

      if (this.searchInput) {
        this.searchInput.addEventListener('input', function () {
          self.renderVideosList();
        });
      }
    },

    updateThumbPreview: function (customSrc) {
      if (!this.thumbPreview) return;
      var ytid = this.urlInput ? extractYouTubeId(this.urlInput.value) : null;
      var src = customSrc || this.currentThumbBase64 || (this.thumbUrlInput ? this.thumbUrlInput.value.trim() : '') || (ytid ? ('https://img.youtube.com/vi/' + ytid + '/hqdefault.jpg') : '');
      if (src) {
        this.thumbPreview.src = src;
        this.thumbPreview.style.display = 'block';
        if (this.thumbPreview.nextElementSibling) this.thumbPreview.nextElementSibling.style.display = 'none';
      } else {
        this.thumbPreview.src = '';
        this.thumbPreview.style.display = 'none';
        if (this.thumbPreview.nextElementSibling) this.thumbPreview.nextElementSibling.style.display = 'flex';
      }
    },

    renderVisibilityCard: function () {
      if (!this.visibilityCard) return;
      var isVisible = localStorage.getItem(VISIBILITY_KEY) !== 'false';
      var self = this;

      this.visibilityCard.innerHTML = 
        '<div style="display:flex; align-items:center; gap:0.85rem;">' +
          '<div style="width:42px; height:42px; border-radius:50%; background:' + (isVisible ? 'rgba(37,211,102,0.15)' : 'rgba(255,107,138,0.15)') + '; border:1.5px solid ' + (isVisible ? '#25d366' : '#ff6b8a') + '; display:flex; align-items:center; justify-content:center; font-size:1.2rem;">' +
            (isVisible ? '🟢' : '🔴') +
          '</div>' +
          '<div>' +
            '<div style="font-weight:700; color:#fff; font-size:1.05rem;">' +
              (isVisible ? 'In Focus Section is LIVE on Homepage' : 'In Focus Section is HIDDEN from Homepage') +
            '</div>' +
            '<div style="color:var(--text-subtle); font-size:0.82rem;">' +
              (isVisible ? 'Visitors can view the video showcase right above "Why iConnect?".' : 'The video showcase section is completely hidden from public visitors.') +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div>' +
          '<button type="button" id="toggle-visibility-btn" class="btn-studio ' + (isVisible ? 'btn-secondary-studio' : '') + '" style="padding:0.6rem 1.4rem; font-size:0.88rem; ' + (!isVisible ? 'background:linear-gradient(135deg, #25d366 0%, #1da851 100%); color:#fff;' : 'color:#ff6b8a; border-color:rgba(255,107,138,0.3);') + '">' +
            (isVisible ? '🙈 Hide Section from Live Site' : '👁️ Show Section on Live Site') +
          '</button>' +
        '</div>';

      var btn = document.getElementById('toggle-visibility-btn');
      if (btn) {
        btn.addEventListener('click', function () {
          var newState = !isVisible;
          localStorage.setItem(VISIBILITY_KEY, newState ? 'true' : 'false');
          var h = getStoredHeader();
          h.showSection = newState;
          saveStoredHeader(h);
          self.renderVisibilityCard();
        });
      }
    },

    loadHeaderSettingsForm: function () {
      var h = getStoredHeader();
      var badgeInput = document.getElementById('infocus-header-badge');
      var titleInput = document.getElementById('infocus-header-title');
      var descInput  = document.getElementById('infocus-header-desc');

      if (badgeInput) badgeInput.value = h.badge || 'Video Showcase & Spotlight';
      if (titleInput) titleInput.value = h.title || 'In Focus';
      if (descInput)  descInput.value  = h.description || '';
    },

    saveHeaderSettings: function () {
      var badge = (document.getElementById('infocus-header-badge') ? document.getElementById('infocus-header-badge').value.trim() : '') || 'Video Showcase & Spotlight';
      var title = (document.getElementById('infocus-header-title') ? document.getElementById('infocus-header-title').value.trim() : '') || 'In Focus';
      var desc  = (document.getElementById('infocus-header-desc') ? document.getElementById('infocus-header-desc').value.trim() : '') || '';

      var header = getStoredHeader();
      header.badge = badge;
      header.title = title;
      header.description = desc;
      saveStoredHeader(header);
      alert('✅ In Focus Section Header Saved!\n\nBadge: "' + badge + '"\nTitle: "' + title + '"');
    },

    saveVideo: function () {
      var title = this.titleInput ? this.titleInput.value.trim() : '';
      var url = this.urlInput ? this.urlInput.value.trim() : '';
      if (!title || !url) {
        alert('⚠️ Please fill in both the Video Title and Video URL.');
        return;
      }

      var ytid = extractYouTubeId(url);
      var thumb = this.currentThumbBase64 || (this.thumbUrlInput ? this.thumbUrlInput.value.trim() : '');
      if (!thumb && ytid) {
        thumb = 'https://img.youtube.com/vi/' + ytid + '/maxresdefault.jpg';
      }

      var isFeatured = this.featuredCheckbox ? this.featuredCheckbox.checked : false;

      // If marked as featured, unset other videos
      if (isFeatured) {
        this.videos.forEach(function (v) { v.featured = false; });
      }

      var videoObj = {
        id: this.editingId || ('infocus-' + Date.now()),
        title: title,
        category: (this.categoryInput ? this.categoryInput.value.trim() : '') || 'Spotlight',
        videoUrl: url,
        thumbnail: thumb || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&auto=format&fit=crop&q=80',
        duration: (this.durationInput ? this.durationInput.value.trim() : '') || '03:30',
        date: (this.dateInput ? this.dateInput.value.trim() : '') || 'August 2026',
        description: (this.descInput ? this.descInput.value.trim() : '') || '',
        featured: isFeatured
      };

      if (this.editingId) {
        var idx = this.videos.findIndex(function (v) { return v.id === videoObj.id; });
        if (idx !== -1) {
          this.videos[idx] = videoObj;
        } else {
          this.videos.unshift(videoObj);
        }
      } else {
        if (this.videos.length === 0 || isFeatured) {
          videoObj.featured = true;
        }
        this.videos.unshift(videoObj);
      }

      saveStoredVideos(this.videos);
      this.resetForm();
      this.renderVideosList();
      this.setPlayerPreview(videoObj);
      alert('✅ Video Saved Successfully!');
    },

    editVideo: function (id) {
      var found = this.videos.find(function (v) { return v.id === id; });
      if (!found) return;

      this.editingId = found.id;
      if (this.idInput) this.idInput.value = found.id;
      if (this.titleInput) this.titleInput.value = found.title || '';
      if (this.urlInput) this.urlInput.value = found.videoUrl || '';
      if (this.categoryInput) this.categoryInput.value = found.category || '';
      if (this.durationInput) this.durationInput.value = found.duration || '';
      if (this.dateInput) this.dateInput.value = found.date || '';
      if (this.descInput) this.descInput.value = found.description || '';
      if (this.featuredCheckbox) this.featuredCheckbox.checked = !!found.featured;

      this.currentThumbBase64 = '';
      if (this.thumbUrlInput) this.thumbUrlInput.value = found.thumbnail || '';
      this.updateThumbPreview(found.thumbnail);

      if (this.formTitle) this.formTitle.innerHTML = '✏️ Edit Video Entry';
      if (this.submitBtn) this.submitBtn.innerHTML = '💾 Update Video';
      if (this.deleteBtn) this.deleteBtn.style.display = 'inline-flex';

      this.setPlayerPreview(found);
      window.scrollTo({ top: this.form.offsetTop - 80, behavior: 'smooth' });
    },

    deleteVideo: function (id) {
      if (!confirm('Are you sure you want to delete this video?')) return;
      this.videos = this.videos.filter(function (v) { return v.id !== id; });
      if (this.videos.length > 0 && !this.videos.some(function (v) { return v.featured; })) {
        this.videos[0].featured = true;
      }
      saveStoredVideos(this.videos);
      this.resetForm();
      this.renderVideosList();
      if (this.videos.length > 0) {
        this.setPlayerPreview(this.videos[0]);
      } else if (this.playerContainer) {
        this.playerContainer.innerHTML = '<div style="text-align:center; padding:3rem; color:var(--text-subtle);">No video loaded in preview player.</div>';
      }
    },

    setFeatured: function (id) {
      this.videos.forEach(function (v) {
        v.featured = (v.id === id);
      });
      saveStoredVideos(this.videos);
      this.renderVideosList();
      var found = this.videos.find(function(v){ return v.id === id; });
      if (found) this.setPlayerPreview(found);
    },

    moveVideo: function (index, direction) {
      var target = index + direction;
      if (target < 0 || target >= this.videos.length) return;
      var temp = this.videos[index];
      this.videos[index] = this.videos[target];
      this.videos[target] = temp;
      saveStoredVideos(this.videos);
      this.renderVideosList();
    },

    resetForm: function () {
      this.editingId = null;
      if (this.form) this.form.reset();
      if (this.idInput) this.idInput.value = '';
      this.currentThumbBase64 = '';
      this.updateThumbPreview('');
      if (this.formTitle) this.formTitle.innerHTML = '➕ Add New Video';
      if (this.submitBtn) this.submitBtn.innerHTML = '💾 Save Video Entry';
      if (this.deleteBtn) this.deleteBtn.style.display = 'none';
    },

    setPlayerPreview: function (video) {
      if (!this.playerContainer || !video) return;
      this.previewActiveVideo = video;
      var ytid = extractYouTubeId(video.videoUrl);
      var embedHtml = '';

      if (ytid) {
        embedHtml = '<iframe src="https://www.youtube-nocookie.com/embed/' + ytid + '?rel=0&modestbranding=1" title="' + (video.title || 'Video') + '" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen style="position:absolute; inset:0; width:100%; height:100%; border:none; border-radius:14px;"></iframe>';
      } else {
        embedHtml = '<video src="' + video.videoUrl + '" controls poster="' + (video.thumbnail || '') + '" style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover; border-radius:14px;"></video>';
      }

      this.playerContainer.innerHTML = 
        '<div style="position:relative; width:100%; padding-top:56.25%; background:#000; border-radius:14px; overflow:hidden; border:1px solid rgba(244,180,26,0.3); box-shadow:0 12px 40px rgba(0,0,0,0.7);">' +
          embedHtml +
        '</div>' +
        '<div style="margin-top:1rem;">' +
          '<div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.4rem;">' +
            '<span style="font-family:var(--font-mono); font-size:0.75rem; font-weight:700; color:var(--cheddar-yellow); background:rgba(244,180,26,0.15); padding:0.2rem 0.6rem; border-radius:999px; text-transform:uppercase;">' + (video.category || 'Spotlight') + '</span>' +
            (video.featured ? '<span style="font-family:var(--font-mono); font-size:0.75rem; font-weight:700; color:#050b1a; background:linear-gradient(135deg, #f4b41a 0%, #d99100 100%); padding:0.2rem 0.6rem; border-radius:999px;">⭐ Main Featured</span>' : '') +
            '<span style="font-size:0.8rem; color:var(--text-subtle); margin-left:auto;">⏱️ ' + (video.duration || '00:00') + ' &bull; 📅 ' + (video.date || '') + '</span>' +
          '</div>' +
          '<h3 style="font-family:var(--font-heading); color:#fff; font-size:1.15rem; font-weight:800; margin:0 0 0.35rem 0;">' + video.title + '</h3>' +
          '<p style="color:var(--text-muted); font-size:0.88rem; line-height:1.45; margin:0;">' + (video.description || 'No description provided.') + '</p>' +
        '</div>';
    },

    renderVideosList: function () {
      if (!this.videosListContainer) return;
      var q = this.searchInput ? this.searchInput.value.toLowerCase().trim() : '';
      var list = this.videos.filter(function (v) {
        return !q || v.title.toLowerCase().includes(q) || (v.category && v.category.toLowerCase().includes(q)) || (v.description && v.description.toLowerCase().includes(q));
      });

      if (this.videoCountEl) this.videoCountEl.textContent = this.videos.length;

      if (list.length === 0) {
        this.videosListContainer.innerHTML = '<div style="text-align:center; padding:3rem; color:var(--text-subtle); background:rgba(5,11,26,0.5); border-radius:14px;">No videos found. Use the form to add your first In Focus video!</div>';
        return;
      }

      var self = this;
      var html = list.map(function (v, idx) {
        var ytid = extractYouTubeId(v.videoUrl);
        var thumb = v.thumbnail || (ytid ? ('https://img.youtube.com/vi/' + ytid + '/hqdefault.jpg') : 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400');
        var isFeatured = !!v.featured;

        return '<div class="infocus-item-card ' + (isFeatured ? 'featured-active' : '') + '" style="background:rgba(10,18,40,0.85); border:1px solid ' + (isFeatured ? 'var(--cheddar-yellow)' : 'rgba(255,255,255,0.1)') + '; border-radius:14px; padding:1rem; margin-bottom:1rem; display:flex; gap:1rem; align-items:center; transition:all 0.2s ease; box-shadow:' + (isFeatured ? '0 0 20px rgba(244,180,26,0.2)' : 'none') + ';">' +
          '<div style="position:relative; width:130px; height:80px; border-radius:10px; overflow:hidden; flex-shrink:0; background:#000; cursor:pointer;" onclick="InFocusStudio.setPlayerPreview(InFocusStudio.videos[' + idx + '])">' +
            '<img src="' + thumb + '" alt="' + v.title + '" style="width:100%; height:100%; object-fit:cover;" onerror="this.src=\'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400\';" />' +
            '<div style="position:absolute; inset:0; background:rgba(0,0,0,0.35); display:flex; align-items:center; justify-content:center;">' +
              '<div style="width:28px; height:28px; border-radius:50%; background:rgba(244,180,26,0.9); display:flex; align-items:center; justify-content:center; color:#050b1a; font-size:0.8rem; padding-left:2px;">▶</div>' +
            '</div>' +
            '<span style="position:absolute; bottom:4px; right:4px; font-family:var(--font-mono); font-size:0.68rem; background:rgba(0,0,0,0.8); color:#fff; padding:1px 4px; border-radius:4px;">' + (v.duration || '00:00') + '</span>' +
          '</div>' +

          '<div style="flex:1; min-width:0;">' +
            '<div style="display:flex; align-items:center; gap:0.4rem; margin-bottom:0.25rem; flex-wrap:wrap;">' +
              '<span style="font-family:var(--font-mono); font-size:0.7rem; font-weight:700; color:var(--cheddar-yellow); background:rgba(244,180,26,0.15); padding:0.15rem 0.5rem; border-radius:999px;">' + (v.category || 'Spotlight') + '</span>' +
              (isFeatured ? '<span style="font-family:var(--font-mono); font-size:0.7rem; font-weight:800; background:var(--cheddar-yellow); color:#050b1a; padding:0.15rem 0.5rem; border-radius:999px;">⭐ PRIMARY</span>' : '') +
              '<span style="font-size:0.75rem; color:var(--text-subtle);">' + (v.date || '') + '</span>' +
            '</div>' +
            '<h4 style="font-family:var(--font-heading); color:#fff; font-size:0.98rem; font-weight:700; margin:0 0 0.25rem 0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="' + v.title + '">' + v.title + '</h4>' +
            '<p style="color:var(--text-muted); font-size:0.8rem; margin:0; line-height:1.35; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">' + (v.description || '') + '</p>' +
          '</div>' +

          '<div style="display:flex; flex-direction:column; gap:0.35rem; flex-shrink:0;">' +
            '<div style="display:flex; gap:0.25rem;">' +
              '<button type="button" onclick="InFocusStudio.moveVideo(' + idx + ', -1)" title="Move Up" style="background:rgba(255,255,255,0.08); border:none; color:#fff; padding:0.3rem 0.5rem; border-radius:6px; cursor:pointer;" ' + (idx === 0 ? 'disabled style="opacity:0.3;"' : '') + '>▲</button>' +
              '<button type="button" onclick="InFocusStudio.moveVideo(' + idx + ', 1)" title="Move Down" style="background:rgba(255,255,255,0.08); border:none; color:#fff; padding:0.3rem 0.5rem; border-radius:6px; cursor:pointer;" ' + (idx === list.length - 1 ? 'disabled style="opacity:0.3;"' : '') + '>▼</button>' +
            '</div>' +
            '<button type="button" onclick="InFocusStudio.setFeatured(\'' + v.id + '\')" class="btn-studio btn-secondary-studio" style="padding:0.3rem 0.6rem; font-size:0.72rem; ' + (isFeatured ? 'background:rgba(244,180,26,0.25); border-color:var(--cheddar-yellow); color:var(--cheddar-yellow);' : '') + '" title="Set as Main Featured Video">' + (isFeatured ? '★ Featured' : '☆ Set Main') + '</button>' +
            '<div style="display:flex; gap:0.25rem;">' +
              '<button type="button" onclick="InFocusStudio.editVideo(\'' + v.id + '\')" class="btn-studio btn-secondary-studio" style="padding:0.3rem 0.6rem; font-size:0.72rem;">✏️ Edit</button>' +
              '<button type="button" onclick="InFocusStudio.deleteVideo(\'' + v.id + '\')" class="btn-studio btn-secondary-studio" style="padding:0.3rem 0.5rem; font-size:0.72rem; color:#ff6b8a;">🗑️</button>' +
            '</div>' +
          '</div>' +
        '</div>';
      }).join('');

      this.videosListContainer.innerHTML = html;
    },

    publishLive: function () {
      saveStoredVideos(this.videos);
      saveStoredHeader(getStoredHeader());
      alert('🚀 Published Live!\n\n' + this.videos.length + ' video(s) are now saved and updated across all browsers.');
    },

    resetDefaults: function () {
      if (!confirm('Reset all In Focus videos and headers to factory defaults?')) return;
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(HEADER_STORAGE_KEY);
      localStorage.removeItem(VISIBILITY_KEY);
      this.videos = (window.infocusVideosData || []).slice();
      this.loadHeaderSettingsForm();
      this.renderVisibilityCard();
      this.renderVideosList();
      if (this.videos.length > 0) this.setPlayerPreview(this.videos[0]);
      alert('🔄 In Focus datastore has been reset to defaults.');
    },

    generateJSCode: function () {
      var header = getStoredHeader();
      var videos = this.videos;

      return '/* ==========================================================================\n' +
        '   iCONNECT PUBLICATION — IN FOCUS VIDEO DATASTORE (js/infocus.js)\n' +
        '   Controls the In Focus featured video section, video playlist, YouTube embeds,\n' +
        '   descriptions, and visibility state.\n' +
        '   ========================================================================== */\n\n' +
        'var infocusHeaderData = ' + JSON.stringify(header, null, 2) + ';\n\n' +
        'var infocusVideosData = ' + JSON.stringify(videos, null, 2) + ';\n\n' +
        'if (typeof window !== "undefined") {\n' +
        '  window.infocusHeaderData = infocusHeaderData;\n' +
        '  window.infocusVideosData = infocusVideosData;\n\n' +
        '  window.getMergedInFocusHeader = function () {\n' +
        '    try {\n' +
        '      var stored = JSON.parse(localStorage.getItem("iconnect_infocus_header"));\n' +
        '      if (stored && typeof stored === "object") {\n' +
        '        return Object.assign({}, window.infocusHeaderData, stored);\n' +
        '      }\n' +
        '    } catch (e) {}\n' +
        '    return window.infocusHeaderData || {\n' +
        '      badge: "Video Showcase & Spotlight",\n' +
        '      title: "In Focus",\n' +
        '      description: "Experience the vibrant stories, student innovations, campus documentaries, and multimedia broadcasts of the BSCS community.",\n' +
        '      showSection: true\n' +
        '    };\n' +
        '  };\n\n' +
        '  window.getMergedInFocusVideos = function () {\n' +
        '    try {\n' +
        '      var stored = JSON.parse(localStorage.getItem("iconnect_infocus_videos"));\n' +
        '      if (Array.isArray(stored) && stored.length > 0) {\n' +
        '        return stored;\n' +
        '      }\n' +
        '    } catch (e) {}\n' +
        '    return window.infocusVideosData || [];\n' +
        '  };\n\n' +
        '  window.isInFocusVisible = function () {\n' +
        '    var h = window.getMergedInFocusHeader();\n' +
        '    var explicitHide = localStorage.getItem("iconnect_show_infocus");\n' +
        '    if (explicitHide !== null) {\n' +
        '      return explicitHide === "true";\n' +
        '    }\n' +
        '    return h ? (h.showSection !== false) : true;\n' +
        '  };\n' +
        '}\n';
    },

    openExportModal: function () {
      var modal = document.getElementById('infocus-export-modal');
      var textarea = document.getElementById('infocus-export-code');
      if (textarea) textarea.value = this.generateJSCode();
      if (modal) modal.classList.add('open');
    },

    closeExportModal: function () {
      var modal = document.getElementById('infocus-export-modal');
      if (modal) modal.classList.remove('open');
    },

    copyExportCode: function () {
      var textarea = document.getElementById('infocus-export-code');
      var btn = document.getElementById('infocus-copy-btn');
      if (!textarea) return;
      textarea.select();
      document.execCommand('copy');
      if (btn) {
        btn.textContent = '✓ Copied Code!';
        setTimeout(function () { btn.textContent = '📋 Copy Code to Clipboard'; }, 2200);
      }
    },

    downloadJSFile: function () {
      var code = this.generateJSCode();
      var blob = new Blob([code], { type: 'text/javascript;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'infocus.js';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  window.InFocusStudio = InFocusStudio;

  document.addEventListener('DOMContentLoaded', function () {
    InFocusStudio.init();
  });
})();
