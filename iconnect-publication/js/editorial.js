/* ==========================================================================
   iCONNECT PUBLICATION — EDITORIAL BOARD DATASTORE (js/editorial.js)
   Controls the Editorial Board members, roles, bio details, and level assignments.
   ========================================================================== */

var editorialHeaderData = {
  "badge": "Leadership & Staff",
  "title": "The Editorial Board",
  "description": "Meet the student journalists, developers, and editors driving the iConnect publication network.",
  "thumbnail": "https://res.cloudinary.com/io18jc16/image/upload/v1788159227/Green_and_White_Modern_Graduation_Facebook_Post_8.webp"
};

var editorialLevelsData = [
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
    "id": 4,
    "name": "Level 4"
  },
  {
    "id": 5,
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

var adviserData = {
  "id": "ed-1788063811526",
  "name": "Earl G. Lipardo",
  "role": "Graphics & Layout Artist",
  "tier": 6,
  "tierLabel": "Level 6",
  "yearLevel": "1st Year",
  "category": "Adviser",
  "initials": "EL",
  "image": "https://res.cloudinary.com/xlzx4db8/image/upload/v1788078656/Editorial_Board_14.webp",
  "bio": "Editorial Board Member for the iConnect Publication.",
  "_isAdviser": true
};

var editorialTeamData = [
  {
    "id": "ed-1788063638182",
    "name": "Nelmar Evaristo",
    "role": "Graphics & Layout Artist",
    "tier": 6,
    "tierLabel": "Level 6",
    "yearLevel": "1st Year",
    "category": "Adviser",
    "initials": "NE",
    "image": "https://res.cloudinary.com/xlzx4db8/image/upload/v1788078656/Editorial_Board_12.webp",
    "bio": "Editorial Board Member for the iConnect Publication.",
    "_isAdviser": true
  },
  {
    "id": "ed-1788064338260",
    "name": "Mike Jember Cabañas",
    "role": "Graphics & Layout Artist",
    "tier": 6,
    "tierLabel": "Level 6",
    "yearLevel": "1st Year",
    "category": "Adviser",
    "initials": "MC",
    "image": "https://res.cloudinary.com/xlzx4db8/image/upload/v1788078656/Editorial_Board_16.webp",
    "bio": "Editorial Board Member for the iConnect Publication.",
    "_isAdviser": true
  },
  {
    "id": "ed-1788063862278",
    "name": "John Mark Badiangon",
    "role": "Graphics & Layout Artist",
    "tier": 6,
    "tierLabel": "Level 6",
    "yearLevel": "1st Year",
    "category": "Adviser",
    "initials": "JB",
    "image": "https://res.cloudinary.com/xlzx4db8/image/upload/v1788078656/Editorial_Board_11.webp",
    "bio": "Editorial Board Member for the iConnect Publication.",
    "_isAdviser": true
  },
  {
    "id": "ed-1788063366487",
    "name": "Ellah Andalecio",
    "role": "Filipino Editor",
    "tier": 3,
    "tierLabel": "Level 3",
    "yearLevel": "4th Year",
    "category": "Adviser",
    "initials": "EA",
    "image": "https://res.cloudinary.com/xlzx4db8/image/upload/v1788078657/Editorial_Board_7.webp",
    "bio": "Editorial Board Member for the iConnect Publication.",
    "_isAdviser": true
  },
  {
    "id": "ed-1788063266784",
    "name": "Febe Ronile Alejandro",
    "role": "Literary & Feature Editor",
    "tier": 3,
    "tierLabel": "Level 3",
    "yearLevel": "4th Year",
    "category": "Adviser",
    "initials": "FA",
    "image": "https://res.cloudinary.com/xlzx4db8/image/upload/v1788078658/Editorial_Board_4.webp",
    "bio": "Editorial Board Member for the iConnect Publication.",
    "_isAdviser": true
  },
  {
    "id": "ed-1788063530177",
    "name": "Mariel Jeane Rodico",
    "role": "Cartoonist",
    "tier": 3,
    "tierLabel": "Level 3",
    "yearLevel": "2nd Year",
    "category": "Adviser",
    "initials": "MR",
    "image": "https://res.cloudinary.com/xlzx4db8/image/upload/v1788078657/Editorial_Board_9.webp",
    "bio": "Editorial Board Member for the iConnect Publication.",
    "_isAdviser": true
  },
  {
    "id": "ed-adviser-0",
    "name": "Prof. Art Jayson L. Osuyos",
    "role": "Adviser",
    "tier": 7,
    "tierLabel": "Level 7",
    "yearLevel": "Faculty",
    "category": "Adviser",
    "initials": "PO",
    "image": "https://res.cloudinary.com/xlzx4db8/image/upload/v1788082795/ChatGPT_Image_Ago_30_2026_d05_25_31_PM.webp",
    "bio": "Faculty adviser overseeing the iConnect Publication of the BSCS Department at Capiz State University – Mambusao Satellite College.",
    "_isAdviser": true
  },
  {
    "id": "ed-member-0",
    "name": "Mishca C. Alvarez",
    "role": "Editor-in-Chief",
    "tier": 2,
    "tierLabel": "Level 2",
    "yearLevel": "3rd Year",
    "category": "Editorial Staff",
    "initials": "MA",
    "image": "https://res.cloudinary.com/xlzx4db8/image/upload/v1788078658/Editorial_Board_3.webp",
    "bio": "Editorial Board Member for the iConnect Publication.",
    "_isAdviser": false
  },
  {
    "id": "ed-member-1",
    "name": "Mhyrien Claire L. Faceronda",
    "role": "Associate Editor &  Managing Editor",
    "tier": 2,
    "tierLabel": "Level 2",
    "yearLevel": "3rd Year",
    "category": "Editorial Staff",
    "initials": "MF",
    "image": "https://res.cloudinary.com/xlzx4db8/image/upload/v1788078657/Editorial_Board_5.webp",
    "bio": "Editorial Board Member for the iConnect Publication.",
    "_isAdviser": false
  },
  {
    "id": "ed-member-2",
    "name": "Jefferson Sibug",
    "role": "Circulation Manager &  Sports Editor",
    "tier": 2,
    "tierLabel": "Level 2",
    "yearLevel": "4th Year",
    "category": "Editorial Staff",
    "initials": "JS",
    "image": "https://res.cloudinary.com/xlzx4db8/image/upload/v1788078656/Editorial_Board_15.webp",
    "bio": "Editorial Board Member for the iConnect Publication.",
    "_isAdviser": false
  },
  {
    "id": "ed-member-3",
    "name": "Gian Kevin Dela Torre",
    "role": "Video Production Lead",
    "tier": 4,
    "tierLabel": "Level 4",
    "yearLevel": "4th Year",
    "category": "Editorial Staff",
    "initials": "GT",
    "image": "https://res.cloudinary.com/xlzx4db8/image/upload/v1788078657/Editorial_Board_8.webp",
    "bio": "Editorial Board Member for the iConnect Publication.",
    "_isAdviser": false
  },
  {
    "id": "ed-member-4",
    "name": "Jonathan M. Irabon",
    "role": "Videographer | Video Editor",
    "tier": 4,
    "tierLabel": "Level 4",
    "yearLevel": "3rd Year",
    "category": "Editorial Staff",
    "initials": "JI",
    "image": "https://res.cloudinary.com/xlzx4db8/image/upload/v1788078658/Editorial_Board_1.webp",
    "bio": "Editorial Board Member for the iConnect Publication.",
    "_isAdviser": false
  },
  {
    "id": "ed-member-6",
    "name": "Ann Lily Lerio",
    "role": "Lead Photojournalist",
    "tier": 5,
    "tierLabel": "Level 5",
    "yearLevel": "1st Year",
    "category": "Editorial Staff",
    "initials": "AL",
    "image": "https://res.cloudinary.com/xlzx4db8/image/upload/v1788078656/Editorial_Board_13.webp",
    "bio": "Editorial Board Member for the iConnect Publication.",
    "_isAdviser": false
  },
  {
    "id": "ed-member-5",
    "name": "Armond E. Villa",
    "role": "Videographer | Video Editor",
    "tier": 4,
    "tierLabel": "Level 4",
    "yearLevel": "4th Year",
    "category": "Editorial Staff",
    "initials": "AV",
    "image": "https://res.cloudinary.com/io18jc16/image/upload/v1788227261/ChatGPT_Image_Set_1_2026_09_44_53_AMr.jpg",
    "bio": "Editorial Board Member for the iConnect Publication.",
    "_isAdviser": false
  },
  {
    "id": "ed-1786549929098",
    "name": "Christine Polonan",
    "role": "Photojournalist",
    "tier": 5,
    "tierLabel": "Level 5",
    "yearLevel": "1st Year",
    "category": "Contributors",
    "initials": "CP",
    "image": "https://res.cloudinary.com/xlzx4db8/image/upload/v1788078657/Editorial_Board_6.webp",
    "bio": "Editorial Board Member for the iConnect Publication.",
    "_isAdviser": false
  },
  {
    "id": "ed-1786550888408",
    "name": "Ann Estorninos",
    "role": "Photojournalist",
    "tier": 5,
    "tierLabel": "Level 5",
    "yearLevel": "2nd Year",
    "category": "Contributors",
    "initials": "AE",
    "image": "https://res.cloudinary.com/xlzx4db8/image/upload/v1788078657/Editorial_Board_10.webp",
    "bio": "Editorial Board Member for the iConnect Publication.",
    "_isAdviser": false
  },
  {
    "id": "ed-1788062958429",
    "name": "Lorenz James Ferrer",
    "role": "Photojournalist",
    "tier": 5,
    "tierLabel": "Level 5",
    "yearLevel": "3rd Year",
    "category": "Adviser",
    "initials": "LF",
    "image": "https://res.cloudinary.com/xlzx4db8/image/upload/v1788078658/Editorial_Board_2.webp",
    "bio": "Editorial Board Member for the iConnect Publication.",
    "_isAdviser": true
  }
];

if (typeof window !== "undefined") {
  window.editorialHeaderData = editorialHeaderData;
  window.editorialLevelsData = editorialLevelsData;
  window.editorialTeamData   = editorialTeamData;
  window.adviserData         = adviserData;

  window.getMergedEditorialHeader = function () {
    return window.editorialHeaderData;
  };

  window.getMergedEditorialLevels = function () {
    return window.editorialLevelsData || [];
  };

  window.getMergedEditorialTeam = function () {
    var allMembers = [];
    if (window.adviserData) {
      allMembers.push(
        Object.assign({}, window.adviserData, {
          _isAdviser: true
        })
      );
    }
    if (Array.isArray(window.editorialTeamData)) {
      window.editorialTeamData.forEach(function (member) {
        allMembers.push(member);
      });
    }
    return allMembers;
  };
}
