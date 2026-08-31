/* ==========================================================================
   iCONNECT PUBLICATION — HERO SLIDER DATASTORE (js/slider.js)
   Standalone Data Module for Front Page Hero Slider (Independent of Articles)
   ========================================================================== */

var heroSlidesData = [
  {
    id: "slide---mst1pcha",
    title: "𝗧𝗛𝗘 𝗠𝗜𝗡𝗗𝗦 𝗕𝗘𝗛𝗜𝗡𝗗 𝗧𝗛𝗘 𝗠𝗜𝗦𝗦𝗜𝗢𝗡",
    badge: "Faculty",
    excerpt: "Meet the faculty and staff behind the BS Computer Science Department — the educators, mentors, and professionals helping shape the next generation of technology leaders.",
    image: "https://res.cloudinary.com/io18jc16/image/upload/v1786718338/Green_and_White_Modern_Graduation_Facebook_Post_3_1.webp"
  },
  {
    id: "slide-1",
    title: "𝗔 𝗡𝗲𝘄 𝗬𝗲𝗮𝗿 𝗕𝗲𝗴𝗶𝗻𝘀: 𝗕𝗦𝗖𝗦 𝗝𝗼𝗶𝗻𝘀 𝘁𝗵𝗲 𝗙𝗶𝗿𝘀𝘁 𝗙𝗹𝗮𝗴 𝗖𝗲𝗿𝗲𝗺𝗼𝗻𝘆 𝗼𝗳 𝗔.𝗬. 𝟮𝟬𝟮𝟲–𝟮𝟬𝟮𝟳",
    badge: "Campus Life",
    excerpt: "BSCS students officially welcomed Academic Year 2026–2027 by joining the first flag ceremony of the school year, marking a meaningful start to a new chapter of learning, growth, and shared aspirations.",
    image: "https://res.cloudinary.com/io18jc16/image/upload/v1786707860/767362756_1680151339751972_1100553282105199881_n.jpg"
  },
  {
    id: "slide-2",
    title: "BSCS Department Welcomes New and Returning Students at “Pag-abi-abi”",
    badge: "Campus Life",
    excerpt: "BSCS students, including returning, transferee, and first-year students, joined the “Pag-abi-abi”, marking the beginning of a new academic year with the CapSU community.",
    image: "https://res.cloudinary.com/io18jc16/image/upload/v1786708622/a2d4a0a4-d4ab-42c3-b79e-342205f43ab8.jpg"
  }
];

if (typeof window !== "undefined") {
  window.heroSlidesData = heroSlidesData;
  window.getMergedHeroSlides = function () {
    try {
      var stored = localStorage.getItem("iconnect_hero_slides");
      if (stored) {
        var parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return window.heroSlidesData || [];
  };
}
