/* =====================================================================
   EDIT ONLY THIS FILE. The whole site is built from it.
   Photos go in /images. Use paths like "images/hero.jpg".
   Leave any src as "" and a grey placeholder tile is shown instead.
   ===================================================================== */
window.SITE = {
  name: "Your Name",
  logo: "Your Name",                      // top-left text (or set logoImg: "images/logo.svg")
  titleLines: ["Photographer", "& Director"],   // stacked under the name on the home screen
  hero: "",                               // full-screen home image
  description: "One sentence about your work, used for search results and link previews.",

  info: {
    portrait: "",
    paragraphs: [
      "Write two or three short paragraphs about you, how you work and the kind of stories you tell.",
      "A second paragraph can cover your background, where you are based and who you work with."
    ],
    clients: ["Client one", "Client two", "Client three", "Client four"],
    awards:  ["Award or publication, 2026", "Award or publication, 2025"]
  },

  contact: {
    email: "hello@example.com",
    phone: "+00 000 000 000",
    location: "City, Country",
    rep: "Represented by Agency Name",     // set to "" to hide
    social: [
      { label: "Instagram", url: "https://www.instagram.com/" },
      { label: "LinkedIn",  url: "https://www.linkedin.com/" }
    ]
  },

  /* One entry per project. id must be lowercase letters, numbers, hyphens.
     cover = image on the home feed and Works grid. images = project page. */
  projects: [
    { id: "project-one",   title: "Project One",   client: "Client", year: 2026, cover: "", ratio: "3/2",
      text: "A short description of the brief, your role and the result.",
      images: ["", "", "", ""] },
    { id: "project-two",   title: "Project Two",   client: "Client", year: 2026, cover: "", ratio: "4/5",
      text: "A short description of the brief, your role and the result.",
      images: ["", "", ""] },
    { id: "project-three", title: "Project Three", client: "Client", year: 2025, cover: "", ratio: "3/2",
      text: "A short description of the brief, your role and the result.",
      images: ["", "", "", ""] },
    { id: "project-four",  title: "Project Four",  client: "Client", year: 2025, cover: "", ratio: "3/2",
      text: "A short description of the brief, your role and the result.",
      images: ["", ""] }
  ]
};
