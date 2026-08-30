export type MasterpieceReference = {
  id: string;
  title: string;
  artist: string;
  date: string;
  image: string;
  sourceUrl: string;
  linkedTemplateId: string;
  palette: string[];
  lesson: string;
};

export const masterpieceReferences: MasterpieceReference[] = [
  {
    id: "met-436530",
    title: "Oleanders",
    artist: "Vincent van Gogh",
    date: "1888",
    image: "/images/masters/436530.jpg",
    sourceUrl: "https://www.metmuseum.org/art/collection/search/436530",
    linkedTemplateId: "still-life-flowers-with-citrus",
    palette: ["#234a35", "#6d933f", "#e7d953", "#d86829", "#345c8c", "#e9d7bd"],
    lesson: "Build energy with directional strokes and warm–cool contrast.",
  },
  {
    id: "met-436293",
    title: "Still Life with Flowers and Fruit",
    artist: "Henri Fantin-Latour",
    date: "1866",
    image: "/images/masters/436293.jpg",
    sourceUrl: "https://www.metmuseum.org/art/collection/search/436293",
    linkedTemplateId: "still-life-antique-books-and-roses",
    palette: ["#2b2c24", "#6f7454", "#a8483d", "#d99c55", "#e6d8b9", "#514238"],
    lesson: "Group dark values first, then place small luminous accents.",
  },
  {
    id: "met-438518",
    title: "Dancer",
    artist: "Edgar Degas",
    date: "1880–85",
    image: "/images/masters/438518.jpg",
    sourceUrl: "https://www.metmuseum.org/art/collection/search/438518",
    linkedTemplateId: "figure-ballet-rehearsal",
    palette: ["#34362f", "#68765a", "#bb7c68", "#e0b0a1", "#c7b99b", "#f1e3c8"],
    lesson: "Let the gesture lead; details should support the pose, not stiffen it.",
  },
  {
    id: "met-437881",
    title: "Young Woman with a Water Pitcher",
    artist: "Johannes Vermeer",
    date: "ca. 1662",
    image: "/images/masters/437881.jpg",
    sourceUrl: "https://www.metmuseum.org/art/collection/search/437881",
    linkedTemplateId: "classic-dutch-window-study",
    palette: ["#405d78", "#d8be87", "#9e4d38", "#efe6cf", "#665d4c", "#262e31"],
    lesson: "Use a quiet value structure and reserve the lightest light for the focal area.",
  },
  {
    id: "met-56353",
    title: "The Great Wave",
    artist: "Katsushika Hokusai",
    date: "ca. 1830–32",
    image: "/images/masters/56353.jpg",
    sourceUrl: "https://www.metmuseum.org/art/collection/search/56353",
    linkedTemplateId: "classic-japanese-wave-study",
    palette: ["#183d61", "#2e6590", "#7cabc4", "#ede5cc", "#c8a66a", "#3d392f"],
    lesson: "Repeat curved rhythms at different scales to create movement.",
  },
  {
    id: "met-437397",
    title: "Self-Portrait",
    artist: "Rembrandt van Rijn",
    date: "1660",
    image: "/images/masters/437397.jpg",
    sourceUrl: "https://www.metmuseum.org/art/collection/search/437397",
    linkedTemplateId: "portrait-quiet-scholar",
    palette: ["#201c18", "#4f3c2c", "#80573d", "#b9825d", "#d6ac7d", "#cabd9d"],
    lesson: "Model the face with broad shadow masses before adding features.",
  },
];
