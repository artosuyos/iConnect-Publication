/* ==========================================================================
   iCONNECT PUBLICATION — ECOSYSTEM GRAPH DATASTORE (js/ecosystem.js)
   Updated via Ecosystem Studio Manager
   ========================================================================== */

window.ecosystemHeaderData = {
  "badge": "We Connect Beyond Limits",
  "title": "The iConnect Ecosystem",
  "subtitle": "The interactive web graph below brings the iConnect digital ecosystem to life—mapping the connections between students, stories, ideas, technology, campus life, and the wider community that shape the official student publication of the BSCS Department, Capiz State University–Mambusao Satellite College."
};

window.ecosystemTopCardsData = [
  {
    "id": "top-card-1",
    "badge": "HEXAGONAL MESH STRUCTURE",
    "title": "Why Is It Shaped & Arranged This Way?",
    "content": "The 6 nodes form a symmetrical, interconnected mesh ring where no pillar operates in isolation. Stories crowns the apex, Students & Ideas empower the wings, Technology & Campus anchor the foundation, and Community grounds the base."
  },
  {
    "id": "top-card-2",
    "badge": "6 CORE PILLARS",
    "title": "What Do The Nodes Represent?",
    "content": "The nodes represent the 6 vital channels of our publication: Students (the heartbeat), Stories (journalism), Ideas (creative vision), Technology (BSCS innovation), Campus (CAPSU life), and Community (outreach)."
  },
  {
    "id": "top-card-3",
    "badge": "DIRECTIONAL SIGNAL FLOW",
    "title": "Why Do The Animated Lines Move That Way?",
    "content": "Click or hover any node to inspect its live data flow. Yellow Line Motion shows outgoing data streaming FROM the selected node, while Light Blue Line Motion shows incoming data flowing TOWARD it."
  }
];

window.ecosystemNodesData = [
  {
    "id": "students",
    "label": "Students",
    "description": "Students are not only the readers of iConnect—they are also its contributors, creators, storytellers, and participants. Their experiences, achievements, projects, ideas, and activities provide much of the information that flows through the publication.",
    "outgoing": "Yellow carries student experiences, achievements, stories, and perspectives from Students to Stories; their projects, skills, and discoveries from Students to Technology; and their participation, outreach, and initiatives from Students to Community.",
    "incoming": "Blue carries opinions, perspectives, and discussions from Ideas to Students; and campus news, activities, announcements, and developments from Campus to Students.",
    "x": 0.18,
    "y": 0.31,
    "color": "#f4b41a"
  },
  {
    "id": "stories",
    "label": "Stories",
    "description": "Stories turn these experiences and developments into journalism that people can read and understand. From there, stories can create Ideas, encourage discussion, and bring attention to what is happening within the Campus.",
    "outgoing": "Yellow carries published stories from Stories to Ideas, where they can encourage discussion and reflection, and from Stories to Campus, where they inform the BSCS community about important events and developments.",
    "incoming": "Blue carries student experiences and events from Students to Stories; technological developments and projects from Technology to Stories; and community events and issues from Community to Stories as material for journalism.",
    "x": 0.48,
    "y": 0.12,
    "color": "#f4b41a"
  },
  {
    "id": "ideas",
    "label": "Ideas",
    "description": "Ideas allow students and readers to look beyond the news. They provide space for opinions, perspectives, analysis, creativity, and new ways of thinking. These ideas can also inspire Technology, while technology can provide new tools and solutions for students and the community.",
    "outgoing": "Yellow carries perspectives and discussions from Ideas to Students, encouraging critical thinking; innovative concepts from Ideas to Technology, inspiring new solutions; and insights from Ideas to Community, encouraging awareness and positive action.",
    "incoming": "Blue carries information and experiences from Stories to Ideas, providing subjects for discussion and analysis; and campus issues and experiences from Campus to Ideas, giving students topics to examine and discuss.",
    "x": 0.78,
    "y": 0.31,
    "color": "#f4b41a"
  },
  {
    "id": "technology",
    "label": "Technology",
    "description": "Technology represents the computing knowledge, projects, innovations, and digital developments connected to BSCS. It connects what students learn and create with real needs in the Campus and the wider Community.",
    "outgoing": "Yellow carries technological projects, discoveries, and developments from Technology to Stories, turning them into news and feature content; and carries technological solutions and innovations from Technology to Campus, helping improve the academic environment.",
    "incoming": "Blue carries student projects and technical skills from Students to Technology; new concepts and solutions from Ideas to Technology; and real-world needs and challenges from Community to Technology to inspire technological solutions.",
    "x": 0.22,
    "y": 0.63,
    "color": "#f4b41a"
  },
  {
    "id": "campus",
    "label": "Campus",
    "description": "Campus represents the everyday environment of BSCS and CAPSU—its activities, achievements, events, people, and developments. What happens on campus can become stories, inspire ideas, involve students, and extend into the community.",
    "outgoing": "Yellow carries campus activities, achievements, and developments from Campus to Students; campus experiences and issues from Campus to Ideas, encouraging discussion; and university activities and initiatives from Campus to Community, strengthening engagement beyond the department.",
    "incoming": "Blue carries published news and coverage from Stories to Campus, giving visibility to campus activities; and technological developments and solutions from Technology to Campus, supporting innovation and digital progress.",
    "x": 0.73,
    "y": 0.65,
    "color": "#f4b41a"
  },
  {
    "id": "community",
    "label": "Community",
    "description": "Beyond the campus is the Community. iConnect connects with people, organizations, issues, and opportunities outside the classroom. Community experiences can become stories, while community needs can inspire ideas, technology, and student involvement.",
    "outgoing": "Yellow carries community events, issues, and experiences from Community to Stories, giving iConnect stories to report; and community needs and challenges from Community to Technology, creating opportunities for technological solutions.",
    "incoming": "Blue carries student outreach, volunteer work, and participation from Students to Community; ideas and perspectives from Ideas to Community, encouraging awareness and action; and campus programs and initiatives from Campus to Community, extending the university's engagement beyond the campus.",
    "x": 0.48,
    "y": 0.87,
    "color": "#f4b41a"
  }
];

window.ecosystemConnectionsData = [
  {
    "from": "students",
    "to": "stories",
    "color": "#f4b41a",
    "speed": 1,
    "direction": "outgoing"
  },
  {
    "from": "students",
    "to": "technology",
    "color": "#f4b41a",
    "speed": 1,
    "direction": "outgoing"
  },
  {
    "from": "students",
    "to": "community",
    "color": "#f4b41a",
    "speed": 1,
    "direction": "outgoing"
  },
  {
    "from": "students",
    "to": "ideas",
    "color": "#00f0ff",
    "speed": 1,
    "direction": "incoming"
  },
  {
    "from": "students",
    "to": "campus",
    "color": "#00f0ff",
    "speed": 1,
    "direction": "incoming"
  },
  {
    "from": "stories",
    "to": "ideas",
    "color": "#f4b41a",
    "speed": 1,
    "direction": "outgoing"
  },
  {
    "from": "stories",
    "to": "campus",
    "color": "#f4b41a",
    "speed": 1,
    "direction": "outgoing"
  },
  {
    "from": "stories",
    "to": "students",
    "color": "#00f0ff",
    "speed": 1,
    "direction": "incoming"
  },
  {
    "from": "stories",
    "to": "technology",
    "color": "#00f0ff",
    "speed": 1,
    "direction": "incoming"
  },
  {
    "from": "stories",
    "to": "community",
    "color": "#00f0ff",
    "speed": 1,
    "direction": "incoming"
  },
  {
    "from": "ideas",
    "to": "students",
    "color": "#f4b41a",
    "speed": 1,
    "direction": "outgoing"
  },
  {
    "from": "ideas",
    "to": "technology",
    "color": "#f4b41a",
    "speed": 1,
    "direction": "outgoing"
  },
  {
    "from": "ideas",
    "to": "community",
    "color": "#f4b41a",
    "speed": 1,
    "direction": "outgoing"
  },
  {
    "from": "ideas",
    "to": "stories",
    "color": "#00f0ff",
    "speed": 1,
    "direction": "incoming"
  },
  {
    "from": "ideas",
    "to": "campus",
    "color": "#00f0ff",
    "speed": 1,
    "direction": "incoming"
  },
  {
    "from": "technology",
    "to": "stories",
    "color": "#f4b41a",
    "speed": 1,
    "direction": "outgoing"
  },
  {
    "from": "technology",
    "to": "campus",
    "color": "#f4b41a",
    "speed": 1,
    "direction": "outgoing"
  },
  {
    "from": "technology",
    "to": "students",
    "color": "#00f0ff",
    "speed": 1,
    "direction": "incoming"
  },
  {
    "from": "technology",
    "to": "ideas",
    "color": "#00f0ff",
    "speed": 1,
    "direction": "incoming"
  },
  {
    "from": "technology",
    "to": "community",
    "color": "#00f0ff",
    "speed": 1,
    "direction": "incoming"
  },
  {
    "from": "campus",
    "to": "students",
    "color": "#f4b41a",
    "speed": 1,
    "direction": "outgoing"
  },
  {
    "from": "campus",
    "to": "ideas",
    "color": "#f4b41a",
    "speed": 1,
    "direction": "outgoing"
  },
  {
    "from": "campus",
    "to": "community",
    "color": "#f4b41a",
    "speed": 1,
    "direction": "outgoing"
  },
  {
    "from": "campus",
    "to": "stories",
    "color": "#00f0ff",
    "speed": 1,
    "direction": "incoming"
  },
  {
    "from": "campus",
    "to": "technology",
    "color": "#00f0ff",
    "speed": 1,
    "direction": "incoming"
  },
  {
    "from": "community",
    "to": "stories",
    "color": "#f4b41a",
    "speed": 1,
    "direction": "outgoing"
  },
  {
    "from": "community",
    "to": "technology",
    "color": "#f4b41a",
    "speed": 1,
    "direction": "outgoing"
  },
  {
    "from": "community",
    "to": "students",
    "color": "#00f0ff",
    "speed": 1,
    "direction": "incoming"
  },
  {
    "from": "community",
    "to": "ideas",
    "color": "#00f0ff",
    "speed": 1,
    "direction": "incoming"
  },
  {
    "from": "community",
    "to": "campus",
    "color": "#00f0ff",
    "speed": 1,
    "direction": "incoming"
  }
];

/* ==========================================================================
   GETTER AND SETTER DATA LAYER FOR ECOSYSTEM GRAPH
   Provides full persistence across index.html & Ecosystem Studio
   ========================================================================== */
(function (w) {
  'use strict';

  w.getEcosystemHeader = function () {
    try {
      var s = localStorage.getItem('iconnect_ecosystem_header');
      if (s) { var p = JSON.parse(s); if (p && p.title) return p; }
    } catch (e) {}
    return w.ecosystemHeaderData || {
      badge: "We Connect Beyond Limits",
      title: "The iConnect Ecosystem",
      subtitle: "The interactive web graph below brings the iConnect digital ecosystem to life..."
    };
  };

  w.getEcosystemTopCards = function () {
    try {
      var s = localStorage.getItem('iconnect_ecosystem_top_cards');
      if (s) { var p = JSON.parse(s); if (Array.isArray(p) && p.length > 0) return p; }
    } catch (e) {}
    return w.ecosystemTopCardsData || [];
  };

  w.getEcosystemNodes = function () {
    try {
      var s = localStorage.getItem('iconnect_ecosystem_nodes');
      if (s) { var p = JSON.parse(s); if (Array.isArray(p) && p.length > 0) return p; }
    } catch (e) {}
    return w.ecosystemNodesData || [];
  };

  w.getEcosystemConnections = function () {
    try {
      var s = localStorage.getItem('iconnect_ecosystem_connections');
      if (s) { var p = JSON.parse(s); if (Array.isArray(p) && p.length > 0) return p; }
    } catch (e) {}
    return w.ecosystemConnectionsData || [];
  };

  w.getEcosystemBgEffect = function () {
    try {
      var s = localStorage.getItem('iconnect_ecosystem_bg_effect');
      if (s) return s;
    } catch (e) {}
    return 'cyber-matrix';
  };

  w.getEcosystemBgOpacity = function () {
    try {
      var s = localStorage.getItem('iconnect_ecosystem_bg_opacity');
      if (s !== null && s !== undefined) return parseFloat(s);
    } catch (e) {}
    return 0.6;
  };

  w.getEcosystemPathOpacity = function () {
    try {
      var s = localStorage.getItem('iconnect_ecosystem_path_opacity');
      if (s !== null && s !== undefined) return parseFloat(s);
    } catch (e) {}
    return 0.20;
  };

  w.getEcosystemAllowDrag = function () {
    try {
      var s = localStorage.getItem('iconnect_ecosystem_allow_drag');
      if (s !== null && s !== undefined) return JSON.parse(s);
    } catch (e) {}
    return false;
  };

  /* Saver Helpers */
  w.saveEcosystemHeader = function (data) {
    try { localStorage.setItem('iconnect_ecosystem_header', JSON.stringify(data)); } catch (e) {}
  };
  w.saveEcosystemTopCards = function (data) {
    try { localStorage.setItem('iconnect_ecosystem_top_cards', JSON.stringify(data)); } catch (e) {}
  };
  w.saveEcosystemNodes = function (data) {
    try { localStorage.setItem('iconnect_ecosystem_nodes', JSON.stringify(data)); } catch (e) {}
  };
  w.saveEcosystemConnections = function (data) {
    try { localStorage.setItem('iconnect_ecosystem_connections', JSON.stringify(data)); } catch (e) {}
  };
  w.saveEcosystemBgEffect = function (effect) {
    try { localStorage.setItem('iconnect_ecosystem_bg_effect', effect); } catch (e) {}
  };
  w.saveEcosystemBgOpacity = function (val) {
    try { localStorage.setItem('iconnect_ecosystem_bg_opacity', val.toString()); } catch (e) {}
  };
  w.saveEcosystemPathOpacity = function (val) {
    try { localStorage.setItem('iconnect_ecosystem_path_opacity', val.toString()); } catch (e) {}
  };
  w.saveEcosystemAllowDrag = function (val) {
    try { localStorage.setItem('iconnect_ecosystem_allow_drag', JSON.stringify(!!val)); } catch (e) {}
  };

})(window);
