/* ==========================================================================
   iCONNECT PUBLICATION — STUDIO VISIBILITY TOGGLE CONTROLLER (js/studio-visibility.js)
   Manages Hide / Show toggle switches across Editorial, Faculty, Creatives, & Slider Studios
   ========================================================================== */

(function (window) {
  'use strict';

  window.StudioVisibility = {
    configs: {
      editorial: {
        key: 'iconnect_show_editorial',
        sectionName: 'Editorial Board',
        containerId: 'editorial-visibility-card'
      },
      faculty: {
        key: 'iconnect_show_faculty',
        sectionName: 'Faculty Directory',
        containerId: 'faculty-visibility-card'
      },
      creatives: {
        key: 'iconnect_show_creatives',
        sectionName: 'Creatives Gallery',
        containerId: 'creatives-visibility-card'
      },
      slider: {
        key: 'iconnect_show_slider',
        sectionName: 'Hero Slider',
        containerId: 'slider-visibility-card'
      },
      ecosystem: {
        key: 'iconnect_show_ecosystem',
        sectionName: 'Ecosystem Graph',
        containerId: 'ecosystem-visibility-card'
      }
    },

    isVisible: function (sectionType) {
      const config = this.configs[sectionType];
      if (!config) return true;
      return localStorage.getItem(config.key) !== 'false';
    },

    toggleSection: function (sectionType) {
      const config = this.configs[sectionType];
      if (!config) return;
      const currentState = this.isVisible(sectionType);
      const newState = !currentState;
      localStorage.setItem(config.key, newState ? 'true' : 'false');
      this.renderToggle(sectionType);

      const statusMsg = newState ? 'VISIBLE' : 'HIDDEN FROM WEBSITE';
      if (typeof window.showToast === 'function') {
        window.showToast(`${config.sectionName} section is now ${statusMsg}`, newState ? 'success' : 'info');
      } else {
        alert(`${config.sectionName} section is now ${statusMsg}`);
      }
    },

    renderToggle: function (sectionType) {
      const config = this.configs[sectionType];
      if (!config) return;
      const container = document.getElementById(config.containerId);
      if (!container) return;

      const visible = this.isVisible(sectionType);

      container.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.85rem; flex-wrap: wrap;">
          <div style="width: 40px; height: 40px; border-radius: 12px; background: ${visible ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)'}; border: 1px solid ${visible ? 'rgba(34, 197, 94, 0.35)' : 'rgba(239, 68, 68, 0.35)'}; display: flex; align-items: center; justify-content: center; font-size: 1.25rem;">
            ${visible ? '👁️' : '🙈'}
          </div>
          <div>
            <div style="font-family: var(--font-heading); font-size: 0.95rem; font-weight: 700; color: ${visible ? '#4ade80' : '#ff6b8a'};">
              ${config.sectionName} Section: ${visible ? 'VISIBLE ON WEBSITE' : 'HIDDEN FROM WEBSITE'}
            </div>
            <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">
              ${visible ? 'This section is live on the website.' : 'This section is currently hidden from public view.'}
            </div>
          </div>
        </div>
        <button type="button" onclick="StudioVisibility.toggleSection('${sectionType}')" style="padding: 0.55rem 1.1rem; border-radius: 10px; font-family: var(--font-heading); font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; gap: 0.5rem; ${visible ? 'background: rgba(239, 68, 68, 0.18); color: #ff6b8a; border: 1px solid rgba(255, 107, 138, 0.4);' : 'background: rgba(34, 197, 94, 0.2); color: #4ade80; border: 1px solid rgba(74, 222, 128, 0.4);'}">
          ${visible ? '🙈 Hide Section' : '👁️ Show Section'}
        </button>
      `;
    },

    init: function (sectionType) {
      this.renderToggle(sectionType);
    }
  };
})(window);
