/* ==========================================================================
   iCONNECT PUBLICATION — IN FOCUS VIDEO DATASTORE (js/infocus.js)
   Controls the In Focus featured video section, video playlist, YouTube embeds,
   descriptions, and visibility state.
   ========================================================================== */

var infocusHeaderData = {
  "badge": "Video Showcase and Spotlight",
  "title": "In Focus",
  "description": "Beyond the headlines, see the moments unfold. In Focus captures the stories, events, and experiences that define the BSCS community.",
  "showSection": true
};

var infocusVideosData = [
  {
    "id": "infocus-1788177936299",
    "title": "2026 ASEAN Celebration Highlights - CAPSU MSC",
    "category": "One CapSU",
    "videoUrl": "https://youtu.be/aGBZg4W055o",
    "thumbnail": "https://res.cloudinary.com/io18jc16/image/upload/v1788177740/ASEAN2026.webp",
    "duration": "03:32",
    "date": "August 2026",
    "description": "Relive the vibrant moments of the 2026 ASEAN Celebration at Capiz State University – Mambusao Satellite College, where culture, unity, and diversity came together under one spirit—One CapSU, One ASEAN, One Community.",
    "featured": true
  }
];

if (typeof window !== "undefined") {
  window.infocusHeaderData = infocusHeaderData;
  window.infocusVideosData = infocusVideosData;

  window.getMergedInFocusHeader = function () {
    try {
      var stored = JSON.parse(localStorage.getItem("iconnect_infocus_header"));
      if (stored && typeof stored === "object") {
        return Object.assign({}, window.infocusHeaderData, stored);
      }
    } catch (e) {}
    return window.infocusHeaderData || {
      badge: "Video Showcase & Spotlight",
      title: "In Focus",
      description: "Experience the vibrant stories, student innovations, campus documentaries, and multimedia broadcasts of the BSCS community.",
      showSection: true
    };
  };

  window.getMergedInFocusVideos = function () {
    try {
      var stored = JSON.parse(localStorage.getItem("iconnect_infocus_videos"));
      if (Array.isArray(stored) && stored.length > 0) {
        return stored;
      }
    } catch (e) {}
    return window.infocusVideosData || [];
  };

  window.isInFocusVisible = function () {
    var h = window.getMergedInFocusHeader();
    var explicitHide = localStorage.getItem("iconnect_show_infocus");
    if (explicitHide !== null) {
      return explicitHide === "true";
    }
    return h ? (h.showSection !== false) : true;
  };
}
