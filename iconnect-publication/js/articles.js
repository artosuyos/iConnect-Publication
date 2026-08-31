/* ==========================================================================
   iCONNECT PUBLICATION — JAVASCRIPT ARTICLE DATASTORE (articles/index.js)
   Official Publication of the BSCS Department
   ==========================================================================
   
   MANUAL JAVASCRIPT EDITING OPTION:
   You can add, edit, or remove articles directly in this file!
   
   HOW TO ADD A NEW ARTICLE:
   1. Place your cover image in: assets/images/articles/ (e.g. "my-photo.jpg").
  title: "Write Your Article Title Here",
  category: "Technology", // Options: "News", "Features", "Opinion", "Technology", "Campus", "Creatives"
  featured: false,       // Set true if main featured hero story
  author: "Art Jayson Osuyos",
  role: "Editor-in-Chief",
  date: "August 10, 2026",
  readTime: "5 min read",
  image: "assets/images/articles/my-photo.jpg",
  excerpt: "Short 2-sentence summary of the story...",
  content: `
    <p>Write your first paragraph here.</p>
    <h2>Section Subheading</h2>
    <p>Continue your story here...</p>
    <blockquote>"Quote callout..."</blockquote>
    <ul>
      <li>Bullet point item</li>
    </ul>
  `
},
=============================================================================
*/

const articlesData = [


];

/* ==========================================================================
   PUBLICATION METADATA: CATEGORIES, ANNOUNCEMENTS, TEAM & CREATIVES
   ========================================================================== */
const categoriesData = [
  { id: "All", label: "All Stories", count: 6 },
  { id: "News", label: "News", count: 1 },
  { id: "Features", label: "Features", count: 1 },
  { id: "Opinion", label: "Opinion", count: 1 },
  { id: "Technology", label: "Technology", count: 1 },
  { id: "Campus", label: "Campus", count: 1 },
  { id: "Creatives", label: "Creatives", count: 1 }
];

const announcementsData = [
  {
    id: 1,
    title: "Call for Student Writers & Web Developers: Join iConnect Vol. IV!",
    date: "August 10, 2026",
    body: "The official publication of the BSCS Department is hiring news reporters, tech columnists, photojournalists, and frontend developers. Applications open until August 25."
  },
  {
    id: 2,
    title: "Publication Launch: iConnect Digital Edition 2026 Live",
    date: "August 01, 2026",
    body: "We are thrilled to launch our new technology-inspired digital magazine platform, bringing interactive cybernetic design to CAPSU Mambusao campus."
  },
  {
    id: 3,
    title: "Publication Launch: iConnect Digital Edition 2026 Live",
    date: "August 01, 2026",
    body: "We are thrilled to launch our new technology-inspired digital magazine platform, bringing interactive cybernetic design to CAPSU Mambusao campus."
  },
  {
    id: 4,
    title: "MIDTERM EXAM",
    date: "July 28, 2026",
    body: "Study Well"
  }
];


const creativesGalleryData = [
  {
    id: 1,
    title: "Cybernetic Neural Mesh",
    category: "Digital Art",
    image: "./assets/images/articles/gallery-1.jpg"
  },
  {
    id: 2,
    title: "BSCS Code Fest 2026 Highlights",
    category: "Photography",
    image: "./assets/images/articles/gallery-2.jpg"
  },
  {
    id: 3,
    title: "Data Stream Architecture Blueprint",
    category: "Infographic",
    image: "./assets/images/articles/gallery-3.jpg"
  },
  {
    id: 4,
    title: "CAPSU Mambusao Campus Night Lights",
    category: "Campus Life",
    image: "./assets/images/articles/gallery-4.jpg"
  }
];

const networkNodesData = [
  {
    id: "students",
    label: "Students",
    description: "The core heartbeat of iConnect—empowering BSCS scholars to express ideas, publish research, and lead digital innovations.",
    stats: { connections: 142, activity: "High" },
    x: 0.25,
    y: 0.35
  },
  {
    id: "stories",
    label: "Stories",
    description: "Impactful journalism covering technological breakthroughs, campus events, and investigative editorial perspectives.",
    stats: { connections: 98, activity: "Active" },
    x: 0.5,
    y: 0.2
  },
  {
    id: "ideas",
    label: "Ideas",
    description: "Creative concepts, algorithmic art, open-source debates, and forward-looking computer science philosophies.",
    stats: { connections: 120, activity: "Emerging" },
    x: 0.75,
    y: 0.35
  },
  {
    id: "technology",
    label: "Technology",
    description: "Full-stack web engineering, artificial intelligence, cybersecurity, IoT campus systems, and quantum theory.",
    stats: { connections: 215, activity: "Peak" },
    x: 0.3,
    y: 0.7
  },
  {
    id: "campus",
    label: "Campus",
    description: "Capiz State University – Mambusao Satellite College community connecting faculty, administration, and students.",
    stats: { connections: 310, activity: "Steady" },
    x: 0.7,
    y: 0.7
  },
  {
    id: "community",
    label: "Community",
    description: "Extending student voice, technological solutions, and digital literacy to the broader Capiz community.",
    stats: { connections: 180, activity: "Growing" },
    x: 0.5,
    y: 0.85
  }
];
