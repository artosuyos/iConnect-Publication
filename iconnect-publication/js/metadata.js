/* ==========================================================================
   iCONNECT PUBLICATION — GLOBAL PUBLICATION METADATA (js/metadata.js)
   Stores Cybernetic Interactive Graph Network Nodes
   ========================================================================== */

/* ------------------------------------------------------------------
   NETWORK NODES DATA (Cybernetic Interactive Graph)
   ------------------------------------------------------------------ */
var networkNodesData = [
  {
    id: "students",
    label: "Students",
    description: "The core heartbeat of iConnect—empowering BSCS scholars at CAPSU Mambusao to publish research, express student perspectives, and engineer digital media.",
    outgoing: "Yellow signals stream student articles, code proposals, and campus insights outward into the publication network.",
    incoming: "Blue signals deliver published news stories, editorial feedback, and technical updates back to the BSCS student body.",
    x: 0.25,
    y: 0.35
  },
  {
    id: "stories",
    label: "Stories",
    description: "Impactful journalism covering regional hackathons, computing breakthroughs, and investigative campus reporting.",
    outgoing: "Yellow signals broadcast published articles and featured stories out to readers, search feeds, and category pages.",
    incoming: "Blue signals gather story leads, interview notes, and research data from campus beats and department events.",
    x: 0.5,
    y: 0.2
  },
  {
    id: "ideas",
    label: "Ideas",
    description: "Creative tech philosophies, open-source debates, generative artwork, and student opinion columns.",
    outgoing: "Yellow signals project original creative concepts and opinion columns outward to inspire campus dialogue.",
    incoming: "Blue signals pull emerging technology trends, open-source debates, and community suggestions into the publication.",
    x: 0.75,
    y: 0.35
  },
  {
    id: "technology",
    label: "Technology",
    description: "Highlighting technological innovations, modern computing trends, and software engineering solutions driven by BSCS scholars at CAPSU through iConnect Publication.",
    outgoing: "Yellow signals deploy technical tutorials, interactive web tools, and student developer projects live onto iConnect.",
    incoming: "Blue signals integrate user feedback, system telemetry, and modern programming standards into the department.",
    x: 0.3,
    y: 0.7
  },
  {
    id: "campus",
    label: "Campus",
    description: "Capiz State University – Mambusao Satellite College community connecting faculty, administration, and BSCS scholars.",
    outgoing: "Yellow signals share official department announcements, event schedules, and academic milestones campus-wide.",
    incoming: "Blue signals compile campus news inquiries, administrative notices, and student activities into the editorial desk.",
    x: 0.7,
    y: 0.7
  },
  {
    id: "community",
    label: "Community",
    description: "Extending student voice, technological solutions, and digital literacy from CAPSU to the broader Capiz region.",
    outgoing: "Yellow signals deliver community outreach initiatives and accessible digital literacy resources outward to Capiz.",
    incoming: "Blue signals bring external reader engagement, public inquiries, and alumni connections back into iConnect.",
    x: 0.5,
    y: 0.85
  }
];
