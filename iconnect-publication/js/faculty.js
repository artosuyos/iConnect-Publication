/* ==========================================================================
   iCONNECT PUBLICATION — FACULTY & ACADEMIC DIRECTORY DATA (js/faculty.js)
   ========================================================================== */

var facultyHeaderData = {
  "badge": "Academic Leadership & Faculty",
  "title": "Faculty & Department Directory",
  "description": "Meet the Minds and Mentors behind the BSCS Department.\nDiscover the faculty, leaders, and dedicated educators who teach, guide, inspire, and shape the next generation of tech builders.",
  "institution": "Capiz State University – Mambusao Satellite College",
  "footerTag": "iConnect Publication"
};

var facultyLevelsData = [
  {
    "id": 1,
    "name": "Level 1"
  },
  {
    "id": 2,
    "name": "Level 2"
  },
  {
    "id": 3,
    "name": "Level 3"
  },
  {
    "id": 5,
    "name": "Level 4"
  },
  {
    "id": 4,
    "name": "Level 5"
  },
  {
    "id": 6,
    "name": "Level 6"
  },
  {
    "id": 7,
    "name": "Level 7"
  }
];

var facultyMembersData = [
  {
    "id": "fac-3",
    "name": "DR. JUDITH L. VISTA",
    "role": "Faculty | BSCS 1B Adviser",
    "department": "Computer Science Department",
    "tier": 3,
    "tierLabel": "Senior Faculty & Professors",
    "layoutStyle": "center",
    "tintColor": "#00f0ff",
    "image": "https://res.cloudinary.com/io18jc16/image/upload/f_jpg/q_auto:best/2.jpg",
    "email": "asjbdas@gmail.com",
    "bio": "",
    "institution": "",
    "footerTag": ""
  },
  {
    "id": "fac-1",
    "name": "DR. JELLY L. PAREDES",
    "role": "Program Chair",
    "department": "Computer Science Department",
    "tier": 1,
    "tierLabel": "Executive Leadership",
    "layoutStyle": "center",
    "tintColor": "#f4b41a",
    "image": "https://res.cloudinary.com/io18jc16/image/upload/f_auto,q_auto/1",
    "email": "",
    "bio": "",
    "institution": "",
    "footerTag": ""
  },
  {
    "id": "fac-2",
    "name": "MS. CHERILYN VILLASIS",
    "role": "Department Secretary",
    "department": "Computer Science Department",
    "tier": 2,
    "tierLabel": "Department Heads & Chairs",
    "layoutStyle": "center-single",
    "tintColor": "#f97316",
    "image": "https://res.cloudinary.com/io18jc16/image/upload/f_jpg/q_auto:best/11.jpg",
    "email": "",
    "bio": "",
    "institution": "",
    "footerTag": ""
  },
  {
    "id": "fac-4",
    "name": "PROF. OLGA L. LLANERA",
    "role": "Faculty | BSCS 2A & 4A Adviser",
    "department": "Computer Science Department",
    "tier": 3,
    "tierLabel": "Senior Faculty & Professors",
    "layoutStyle": "center",
    "tintColor": "#00f0ff",
    "image": "https://res.cloudinary.com/io18jc16/image/upload/f_jpg/q_auto:best/3.jpg",
    "email": "",
    "bio": "",
    "institution": "",
    "footerTag": ""
  },
  {
    "id": "fac-5",
    "name": "MR. JINO MYLES LINAN",
    "role": "Computer Laboratory Assistant",
    "department": "Computer Science Department",
    "tier": 4,
    "tierLabel": "Academic Instructors & Lecturers",
    "layoutStyle": "center",
    "tintColor": "#f97316",
    "image": "https://res.cloudinary.com/io18jc16/image/upload/f_jpg/q_auto:best/9.jpg",
    "email": "",
    "bio": "",
    "institution": "",
    "footerTag": ""
  },
  {
    "id": "fac-prof-cherry-joy-a-palomar-mssukl02",
    "name": "PROF. CHERRY JOY A. PALOMAR",
    "role": "Faculty | BSCS 1A & 2B Adviser",
    "department": "Computer Science Department",
    "tier": 3,
    "tierLabel": "Senior Faculty & Professors",
    "layoutStyle": "center",
    "tintColor": "#00f0ff",
    "image": "https://res.cloudinary.com/io18jc16/image/upload/f_jpg/q_auto:best/4.jpg",
    "email": "",
    "bio": "",
    "institution": "",
    "footerTag": ""
  },
  {
    "id": "fac-prof-leo-b-pula-mssun21b",
    "name": "PROF. LEO B. PULA",
    "role": "Faculty | BSCS 4B & 4C Adviser",
    "department": "Computer Science department",
    "tier": 3,
    "tierLabel": "Senior Faculty & Professors",
    "layoutStyle": "center",
    "tintColor": "#00f0ff",
    "image": "https://res.cloudinary.com/io18jc16/image/upload/f_jpg/q_auto:best/5.jpg",
    "email": "",
    "bio": "",
    "institution": "",
    "footerTag": ""
  },
  {
    "id": "fac-prof-art-jayson-l-osuyos-mssulmur",
    "name": "PROF. ART JAYSON L. OSUYOS",
    "role": "Faculty | BSCS 3A & 3B Adviser",
    "department": "Computer Science Department",
    "tier": 3,
    "tierLabel": "Level 3",
    "layoutStyle": "center",
    "tintColor": "#00f0ff",
    "image": "https://res.cloudinary.com/io18jc16/image/upload/v1788083085/Green_and_White_Modern_Graduation_Facebook_Post_6.webp",
    "email": "",
    "bio": "",
    "institution": "",
    "footerTag": ""
  },
  {
    "id": "fac-engr-precy-l-tigbawan-mssuog9p",
    "name": "ENGR. PRECY L. TIGBAWAN",
    "role": "Faculty | BSCS 1C & 1D Adviser",
    "department": "Computer Science Department",
    "tier": 3,
    "tierLabel": "Senior Faculty & Professors",
    "layoutStyle": "center",
    "tintColor": "#00f0ff",
    "image": "https://res.cloudinary.com/io18jc16/image/upload/f_jpg/q_auto:best/7.jpg",
    "email": "",
    "bio": "",
    "institution": "",
    "footerTag": ""
  },
  {
    "id": "fac-mr-nio-dela-cena-mssutzmb",
    "name": "MR. NIÑO DELA CENA",
    "role": "Faculty | BSCS 3C & 3D Adviser",
    "department": "Computer Science Department",
    "tier": 3,
    "tierLabel": "Senior Faculty & Professors",
    "layoutStyle": "center",
    "tintColor": "#00f0ff",
    "image": "https://res.cloudinary.com/io18jc16/image/upload/f_jpg/q_auto:best/8.jpg",
    "email": "",
    "bio": "",
    "institution": "",
    "footerTag": ""
  },
  {
    "id": "fac-mrnicolas-v-braa-mssuvgya",
    "name": "MR.NICOLAS V. BRAÑA",
    "role": "Faculty | BSCS 2C & 2D Adviser",
    "department": "Computer Science Department",
    "tier": 3,
    "tierLabel": "Senior Faculty & Professors",
    "layoutStyle": "center",
    "tintColor": "#00f0ff",
    "image": "https://res.cloudinary.com/io18jc16/image/upload/f_jpg/q_auto:best/10.jpg",
    "email": "",
    "bio": "",
    "institution": "",
    "footerTag": ""
  },
  {
    "id": "fac-mr-james-licanto-mtfxte4v",
    "name": "MR. JAMES LICANTO",
    "role": "Staff",
    "department": "Computer Science Department",
    "tier": 4,
    "tierLabel": "Level 5",
    "layoutStyle": "center",
    "tintColor": "#f97316",
    "image": "https://res.cloudinary.com/io18jc16/image/upload/v1788102013/Green_and_White_Modern_Graduation_Facebook_Post_7.webp",
    "email": "",
    "bio": "",
    "institution": "",
    "footerTag": ""
  }
];

var facultyLinesDesktop = true;
var facultyLinesMobile  = true;

if (typeof window !== "undefined") {
  window.facultyHeaderData = facultyHeaderData;
  window.facultyLevelsData = facultyLevelsData;
  window.facultyMembersData = facultyMembersData;
  // Persist line settings into localStorage so faculty.html picks them up
  try {
    localStorage.setItem("iconnect_faculty_lines_desktop", facultyLinesDesktop ? "true" : "false");
    localStorage.setItem("iconnect_faculty_lines_mobile",  facultyLinesMobile  ? "true" : "false");
  } catch (e) {}
  window.getMergedFacultyHeader = function () {
    try {
      var stored = localStorage.getItem("iconnect_faculty_header");
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return window.facultyHeaderData;
  };
  window.getMergedFacultyLevels = function () {
    try {
      var stored = localStorage.getItem("iconnect_faculty_levels");
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return window.facultyLevelsData || [];
  };
  window.getMergedFacultyMembers = function () {
    try {
      var stored = localStorage.getItem("iconnect_faculty_members");
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return window.facultyMembersData || [];
  };
  window.getFacultyBgEffect = function () {
    try {
      var stored = localStorage.getItem("iconnect_faculty_bg_effect");
      if (stored) return stored;
    } catch (e) {}
    return "cyber-matrix";
  };
  window.getFacultyBgOpacity = function () {
    try {
      var stored = localStorage.getItem("iconnect_faculty_bg_opacity");
      if (stored) return parseFloat(stored);
    } catch (e) {}
    return 0.6;
  };
}
