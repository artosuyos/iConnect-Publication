/* ==========================================================================
   iCONNECT PUBLICATION — WHY iCONNECT / ABOUT DATASTORE (js/about.js)
   Controls the "Why iConnect?" narrative, quotes, and feature cards on the Homepage.
   ========================================================================== */

(function (window) {
  'use strict';

  var LOCAL_KEY = 'iconnect_why_data';

  var defaultWhyIConnectData = {
  "sectionTag": "About The Publication",
  "titlePrefix": "Why",
  "titleHighlight": "iConnect",
  "titleSuffix": "?",
  "highlightColor": "#f4b41a",
  "paragraph1": "<strong>iConnect</strong> serves as the official student publication of the Bachelor of Science in Computer Science (BSCS) Department at <strong>Capiz State University – Mambusao Satellite College</strong>.",
  "quoteText": "iConnect represents the connection between people, ideas, information, technology, and the community. Through journalism and creativity, we bridge voices and stories within the Computer Science community.",
  "quoteAccentColor": "#f4b41a",
  "paragraph2": "Designed as a synthesis of digital journalism and computer science innovation, iConnect provides an empowered platform for student writers, software developers, multimedia artists, and researchers to share knowledge without boundaries.",
  "cards": [
    {
      "id": "card-1",
      "title": "The Connection",
      "description": "Bridging perspectives and bringing ideas together to foster meaningful dialogue, creative expression, and a more connected community.",
      "icon": "broadcast",
      "tintColor": "#f4b41a",
      "borderColor": "#f4b41a40",
      "bgColor": "rgba(10, 18, 40, 0.65)"
    },
    {
      "id": "card-2",
      "title": "The Network",
      "description": "Where computing connects people, ideas, and possibilities—exploring the innovations, experiences, and challenges shaping what comes next.",
      "icon": "monitor",
      "tintColor": "#f4b41a",
      "borderColor": "#f4b41a40",
      "bgColor": "rgba(10, 18, 40, 0.65)"
    },
    {
      "id": "card-3",
      "title": "The Voice",
      "description": "Giving ideas a voice and perspectives a platform—sparking meaningful conversations, challenging perspectives, inspiring creativity, and encouraging people to speak, engage, and make an impact.",
      "icon": "users",
      "tintColor": "#f4b41a",
      "borderColor": "#f4b41a40",
      "bgColor": "rgba(10, 18, 40, 0.65)"
    }
  ]
};

  var ICON_SVGS = {
  "broadcast": "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 11a9 9 0 0 1 9 9\"/><path d=\"M4 4a16 16 0 0 1 16 16\"/><circle cx=\"5\" cy=\"19\" r=\"1\"/></svg>",
  "monitor": "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"2\" y=\"3\" width=\"20\" height=\"14\" rx=\"2\" ry=\"2\"/><line x1=\"8\" y1=\"21\" x2=\"16\" y2=\"21\"/><line x1=\"12\" y1=\"17\" x2=\"12\" y2=\"21\"/></svg>",
  "users": "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2\"/><circle cx=\"9\" cy=\"7\" r=\"4\"/><path d=\"M23 21v-2a4 4 0 0 0-3-3.87\"/><path d=\"M16 3.13a4 4 0 0 1 0 7.75\"/></svg>",
  "terminal": "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polyline points=\"4 17 10 11 4 5\"/><line x1=\"12\" y1=\"19\" x2=\"20\" y2=\"19\"/></svg>",
  "cpu": "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"4\" y=\"4\" width=\"16\" height=\"16\" rx=\"2\"/><rect x=\"9\" y=\"9\" width=\"6\" height=\"6\"/><line x1=\"9\" y1=\"1\" x2=\"9\" y2=\"4\"/><line x1=\"15\" y1=\"1\" x2=\"15\" y2=\"4\"/><line x1=\"9\" y1=\"20\" x2=\"9\" y2=\"23\"/><line x1=\"15\" y1=\"20\" x2=\"15\" y2=\"23\"/><line x1=\"20\" y1=\"9\" x2=\"23\" y2=\"9\"/><line x1=\"20\" y1=\"14\" x2=\"23\" y2=\"14\"/><line x1=\"1\" y1=\"9\" x2=\"4\" y2=\"9\"/><line x1=\"1\" y1=\"14\" x2=\"4\" y2=\"14\"/></svg>",
  "shield": "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z\"/></svg>",
  "sparkles": "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z\"/></svg>",
  "book": "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 19.5A2.5 2.5 0 0 1 6.5 17H20\"/><path d=\"M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z\"/></svg>",
  "rocket": "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z\"/><path d=\"m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z\"/><path d=\"M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0\"/><path d=\"M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5\"/></svg>",
  "globe": "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><line x1=\"2\" y1=\"12\" x2=\"22\" y2=\"12\"/><path d=\"M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z\"/></svg>",
  "lightbulb": "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><line x1=\"9\" y1=\"18\" x2=\"15\" y2=\"18\"/><line x1=\"10\" y1=\"22\" x2=\"14\" y2=\"22\"/><path d=\"M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5.76.76 1.23 1.52 1.41 2.5\"/></svg>",
  "heart": "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z\"/></svg>"
};

  function getIconSVG(iconName) {
    if (!iconName) return ICON_SVGS.broadcast;
    if (iconName.indexOf('<svg') !== -1) return iconName;
    return ICON_SVGS[iconName.toLowerCase()] || ICON_SVGS.broadcast;
  }

  function getMergedWhyIConnectData() {
    try {
      var stored = localStorage.getItem(LOCAL_KEY);
      if (stored) {
        var parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          return Object.assign({}, defaultWhyIConnectData, parsed);
        }
      }
    } catch (e) {}
    return JSON.parse(JSON.stringify(defaultWhyIConnectData));
  }

  function saveWhyIConnectData(data) {
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
      if (typeof window !== 'undefined') window.whyIConnectData = data;
      return true;
    } catch (e) { return false; }
  }

  function formatParagraphHTML(text) {
    if (!text) return '';
    var trimmed = text.trim();
    if (trimmed.startsWith('<p>') || trimmed.startsWith('<div>')) return trimmed;
    return trimmed.split(/\n\s*\n/).map(function (p) {
      var pt = p.trim();
      return pt ? '<p>' + pt + '</p>' : '';
    }).join('');
  }

  function renderWhyIConnectSection(targetElOrId) {
    var container = typeof targetElOrId === 'string' ? document.getElementById(targetElOrId) : targetElOrId;
    if (!container) return;
    var data = getMergedWhyIConnectData();
    var highlightColor = data.highlightColor || '#f4b41a';
    var quoteAccentColor = data.quoteAccentColor || '#f4b41a';
    var titleHTML = (data.titlePrefix ? data.titlePrefix + ' ' : '') +
      '<span style="color:' + highlightColor + ';">' + (data.titleHighlight || 'iConnect') + '</span>' +
      (data.titleSuffix || '?');
    var cardsHTML = (data.cards || []).map(function (card) {
      var tint = card.tintColor || '#f4b41a';
      var border = card.borderColor || (tint + '40');
      var bg = card.bgColor || 'rgba(10, 18, 40, 0.65)';
      var iconSvg = getIconSVG(card.icon);
      return '<div class="about-feature-card" style="background:' + bg + '; border:1px solid ' + border + '; transition:all 0.3s ease;">' +
        '<div class="feature-icon" style="background:' + tint + '20; color:' + tint + '; border:1px solid ' + tint + '40;">' +
          iconSvg +
        '</div>' +
        '<div>' +
          '<h3 class="feature-title" style="color:#ffffff;">' + (card.title || '') + '</h3>' +
          '<p class="feature-desc" style="color:var(--text-muted); font-size:0.9rem;">' + (card.description || '') + '</p>' +
        '</div>' +
      '</div>';
    }).join('');
    container.innerHTML =
      '<div class="about-grid">' +
        '<div>' +
          '<span class="section-tag">' + (data.sectionTag || 'About The Publication') + '</span>' +
          '<h2 class="section-title">' + titleHTML + '</h2>' +
          '<div class="about-text">' +
            formatParagraphHTML(data.paragraph1) +
            (data.quoteText ? '<div class="about-highlight" style="border-left-color:' + quoteAccentColor + ';">"' + data.quoteText + '"</div>' : '') +
            formatParagraphHTML(data.paragraph2) +
          '</div>' +
        '</div>' +
        '<div class="about-cards-stack">' +
          cardsHTML +
        '</div>' +
      '</div>';
  }

  window.defaultWhyIConnectData = defaultWhyIConnectData;
  window.whyIConnectData = getMergedWhyIConnectData();
  window.getMergedWhyIConnectData = getMergedWhyIConnectData;
  window.saveWhyIConnectData = saveWhyIConnectData;
  window.renderWhyIConnectSection = renderWhyIConnectSection;
  window.getWhyIConnectIconSVG = getIconSVG;
  window.WHY_ICONNECT_ICONS = ICON_SVGS;

})(typeof window !== 'undefined' ? window : this);
