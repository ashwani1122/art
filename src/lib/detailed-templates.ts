import type { DrawingTemplate } from "./templates";

const circle = (cx: number, cy: number, r: number) =>
  `M ${cx - r} ${cy} a ${r} ${r} 0 1 0 ${r * 2} 0 a ${r} ${r} 0 1 0 ${-r * 2} 0`;

const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M ${cx - rx} ${cy} a ${rx} ${ry} 0 1 0 ${rx * 2} 0 a ${rx} ${ry} 0 1 0 ${-rx * 2} 0`;

const polygon = (points: Array<[number, number]>) =>
  `${points.map(([x, y], index) => `${index === 0 ? "M" : "L"} ${x} ${y}`).join(" ")} Z`;

const star = (cx: number, cy: number, outer: number, inner: number, points = 5) => {
  const vertices: Array<[number, number]> = [];
  for (let index = 0; index < points * 2; index += 1) {
    const radius = index % 2 === 0 ? outer : inner;
    const angle = -Math.PI / 2 + (index * Math.PI) / points;
    vertices.push([
      Math.round(cx + Math.cos(angle) * radius),
      Math.round(cy + Math.sin(angle) * radius),
    ]);
  }
  return polygon(vertices);
};

const rays = (cx: number, cy: number, inner: number, outer: number, count: number) =>
  Array.from({ length: count }, (_, index) => {
    const angle = (index / count) * Math.PI * 2;
    return `M ${Math.round(cx + Math.cos(angle) * inner)} ${Math.round(
      cy + Math.sin(angle) * inner,
    )} L ${Math.round(cx + Math.cos(angle) * outer)} ${Math.round(
      cy + Math.sin(angle) * outer,
    )}`;
  });

const rosette = (cx: number, cy: number, radius: number, count: number) =>
  Array.from({ length: count }, (_, index) => {
    const angle = (index / count) * Math.PI * 2;
    const nextAngle = ((index + 1) / count) * Math.PI * 2;
    const tipX = Math.round(cx + Math.cos(angle) * radius);
    const tipY = Math.round(cy + Math.sin(angle) * radius);
    const nextX = Math.round(cx + Math.cos(nextAngle) * radius);
    const nextY = Math.round(cy + Math.sin(nextAngle) * radius);
    return `M ${cx} ${cy} Q ${tipX} ${tipY} ${nextX} ${nextY} Q ${cx} ${cy} ${cx} ${cy}`;
  });

const ornateFrame = (seed: number) => [
  "M 82 82 H 918 V 918 H 82 Z",
  "M 108 108 H 892 V 892 H 108 Z",
  ...[150, 850].flatMap((x) => [
    circle(x, 150, 24 + (seed % 3) * 4),
    circle(x, 850, 24 + (seed % 3) * 4),
  ]),
  `M 108 220 Q ${180 + seed * 3} ${145 + seed * 2} 265 108`,
  `M 892 220 Q ${820 - seed * 3} ${145 + seed * 2} 735 108`,
  `M 108 780 Q ${180 + seed * 3} ${855 - seed * 2} 265 892`,
  `M 892 780 Q ${820 - seed * 3} ${855 - seed * 2} 735 892`,
];

const decorativeDots = (seed: number, y = 800) =>
  Array.from({ length: 8 }, (_, index) =>
    circle(185 + index * 90, y + ((index + seed) % 2) * 28, 10 + ((index + seed) % 3) * 4),
  );

const portrait = (seed: number) => {
  const turn = (seed % 3 - 1) * 18;
  const eyeY = 405 + (seed % 2) * 8;
  return [
    ...ornateFrame(seed),
    ellipse(500 + turn, 445, 185, 235),
    `M ${320 + turn} 425 C ${300 + turn} 215 ${405 + turn} 155 ${510 + turn} 190 C ${650 + turn} 145 ${715 + turn} 285 ${675 + turn} 470`,
    `M ${330 + turn} 375 Q ${390 + turn} 230 ${485 + turn} 225 Q ${595 + turn} 190 ${675 + turn} 365`,
    `M ${330 + turn} 405 C ${305 + turn} 305 ${345 + turn} 220 ${430 + turn} 188`,
    `M ${675 + turn} 405 C ${705 + turn} 305 ${650 + turn} 220 ${575 + turn} 190`,
    `M ${375 + turn} ${eyeY} Q ${420 + turn} ${eyeY - 28} ${462 + turn} ${eyeY} Q ${420 + turn} ${eyeY + 24} ${375 + turn} ${eyeY}`,
    `M ${535 + turn} ${eyeY} Q ${575 + turn} ${eyeY - 28} ${620 + turn} ${eyeY} Q ${575 + turn} ${eyeY + 24} ${535 + turn} ${eyeY}`,
    circle(421 + turn, eyeY, 10),
    circle(575 + turn, eyeY, 10),
    `M ${382 + turn} ${eyeY - 48} Q ${420 + turn} ${eyeY - 68} ${458 + turn} ${eyeY - 48}`,
    `M ${540 + turn} ${eyeY - 48} Q ${578 + turn} ${eyeY - 68} ${616 + turn} ${eyeY - 48}`,
    `M ${500 + turn} 420 Q ${470 + turn} 505 ${505 + turn} 525 Q ${530 + turn} 528 ${545 + turn} 510`,
    `M ${430 + turn} 575 Q ${500 + turn} ${610 + seed * 2} ${570 + turn} 575 Q ${500 + turn} 650 ${430 + turn} 575`,
    `M ${385 + turn} 625 Q ${390 + turn} 720 ${330 + turn} 760`,
    `M ${615 + turn} 625 Q ${610 + turn} 720 ${670 + turn} 760`,
    `M 230 855 C 265 710 380 690 ${385 + turn} 650 M 770 855 C 735 710 620 690 ${615 + turn} 650`,
    `M 230 855 Q 500 ${730 + seed * 6} 770 855`,
    ...rosette(500, 755, 62 + seed * 2, 7 + (seed % 4)),
    circle(500, 755, 20),
  ];
};

const figure = (seed: number) => {
  const lean = (seed % 5 - 2) * 14;
  return [
    ...ornateFrame(seed),
    circle(500 + lean, 240, 70),
    `M ${460 + lean} 305 Q ${500 + lean} 340 ${540 + lean} 305`,
    `M ${470 + lean} 318 C ${410 + lean} 420 ${405 + lean} 575 ${360 + lean} 720`,
    `M ${530 + lean} 318 C ${590 + lean} 420 ${595 + lean} 575 ${640 + lean} 720`,
    `M ${400 + lean} 420 Q ${500 + lean} ${365 + seed * 4} ${600 + lean} 420`,
    `M ${400 + lean} 420 C ${420 + lean} 590 ${400 + lean} 655 ${345 + lean} 770 L ${655 + lean} 770 C ${600 + lean} 655 ${580 + lean} 590 ${600 + lean} 420 Z`,
    `M ${440 + lean} 770 L ${410 + lean} 895 M ${560 + lean} 770 L ${600 + lean} 895`,
    `M ${375 + lean} 895 H ${455 + lean} M ${560 + lean} 895 H ${645 + lean}`,
    `M ${405 + lean} 430 C ${300 + lean} ${445 + seed * 5} ${270 + lean} 560 ${205 + lean} 610`,
    `M ${595 + lean} 430 C ${700 + lean} ${445 + seed * 5} ${730 + lean} 560 ${795 + lean} 610`,
    circle(198 + lean, 618, 24),
    circle(802 + lean, 618, 24),
    ...Array.from({ length: 6 }, (_, index) =>
      `M ${390 + lean + index * 44} ${470 + index * 45} Q ${500 + lean} ${510 + index * 26} ${610 + lean - index * 44} ${470 + index * 45}`,
    ),
    ...decorativeDots(seed, 835),
  ];
};

const architecture = (seed: number) => {
  const columns = 4 + (seed % 3);
  const columnWidth = 620 / columns;
  const windows = Array.from({ length: columns }, (_, column) =>
    [420, 555, 690].map((y) => {
      const x = 190 + column * columnWidth + columnWidth * 0.24;
      const width = columnWidth * 0.52;
      return `M ${Math.round(x)} ${y + 70} V ${y} Q ${Math.round(x + width / 2)} ${y - 48} ${Math.round(x + width)} ${y} V ${y + 70} Z`;
    }),
  ).flat();
  return [
    "M 120 820 H 880",
    "M 165 355 H 835 V 820 H 165 Z",
    polygon([[125, 355], [500, 115 + seed * 4], [875, 355]]),
    `M 500 ${115 + seed * 4} V 65 L 585 95 L 500 125`,
    ...windows,
    ...Array.from({ length: columns + 1 }, (_, index) => {
      const x = 165 + index * columnWidth;
      return `M ${Math.round(x)} 360 V 820`;
    }),
    "M 405 820 V 690 Q 500 590 595 690 V 820",
    ...[175, 825].flatMap((x) => [
      `M ${x} 820 V 520`,
      polygon([[x, 490], [x - 80, 650], [x + 80, 650]]),
      polygon([[x, 565], [x - 105, 745], [x + 105, 745]]),
    ]),
    ...rays(500, 185 + seed * 4, 55, 90, 12),
    circle(500, 185 + seed * 4, 45),
  ];
};

const interior = (seed: number) => [
  "M 80 90 H 920 V 900 H 80 Z",
  "M 80 680 H 920",
  "M 140 850 Q 500 760 860 850 L 800 930 H 200 Z",
  `M 250 ${470 - seed * 4} C 250 400 320 370 390 410 H 610 C 680 370 750 400 750 ${470 - seed * 4} V 680 H 250 Z`,
  "M 250 525 H 750 M 405 410 V 680 M 595 410 V 680",
  "M 195 680 H 805 M 235 680 L 215 760 M 765 680 L 785 760",
  "M 355 130 H 645 V 345 H 355 Z",
  "M 370 145 H 630 V 330 H 370 Z",
  ...rosette(500, 238, 80, 8 + (seed % 5)),
  circle(500, 238, 28),
  `M 500 90 V ${155 + seed * 3}`,
  ...rays(500, 145 + seed * 3, 25, 78, 10),
  "M 140 680 V 475 Q 185 425 230 475 V 680",
  "M 770 680 V 455 Q 820 395 870 455 V 680",
  ...[790, 835, 870].map((x, index) => ellipse(x, 420 - index * 36, 45 - index * 5, 76 - index * 6)),
  ...decorativeDots(seed, 820),
];

const animal = (seed: number) => {
  const ear = 95 + seed * 3;
  return [
    ...ornateFrame(seed),
    ellipse(500, 500, 235, 285),
    polygon([[335, 320], [315, ear], [455, 300]]),
    polygon([[665, 320], [685, ear], [545, 300]]),
    "M 300 365 C 350 220 650 220 700 365",
    `M 345 450 Q 405 ${415 - seed * 2} 465 450 Q 405 495 345 450`,
    `M 535 450 Q 595 ${415 - seed * 2} 655 450 Q 595 495 535 450`,
    circle(405, 450, 12),
    circle(595, 450, 12),
    ellipse(500, 555, 54 + seed * 2, 38),
    "M 500 590 Q 430 650 365 610 M 500 590 Q 570 650 635 610",
    ...[385, 455, 545, 615].map((y, index) => `M ${index < 2 ? 390 : 610} ${y + 170} L ${index < 2 ? 170 : 830} ${y + 145}`),
    ...Array.from({ length: 5 }, (_, index) => circle(360 + index * 70, 715 + ((index + seed) % 2) * 28, 22)),
    "M 330 755 Q 500 840 670 755",
    ...rosette(500, 235, 50, 6 + (seed % 4)),
  ];
};

const botanical = (seed: number) => {
  const bloomCount = 5 + (seed % 4);
  const blooms = Array.from({ length: bloomCount }, (_, index) => {
    const angle = (index / bloomCount) * Math.PI * 2 - Math.PI / 2;
    const x = Math.round(500 + Math.cos(angle) * (210 + seed * 3));
    const y = Math.round(430 + Math.sin(angle) * (190 + seed * 2));
    return [...rosette(x, y, 74 + ((index + seed) % 3) * 12, 6 + ((index + seed) % 5)), circle(x, y, 22)];
  }).flat();
  return [
    ...ornateFrame(seed),
    ...blooms,
    "M 500 830 C 430 660 445 560 500 430 C 555 560 570 660 500 830",
    ...Array.from({ length: 5 }, (_, index) => {
      const y = 520 + index * 62;
      const side = index % 2 === 0 ? -1 : 1;
      return `M 500 ${y} C ${500 + side * 90} ${y - 65} ${500 + side * 155} ${y - 15} ${500 + side * 170} ${y + 55} C ${500 + side * 85} ${y + 72} ${535 + side * 20} ${y + 38} 500 ${y} Z`;
    }),
    "M 335 850 Q 500 790 665 850",
    ...decorativeDots(seed, 860),
  ];
};

const landscape = (seed: number) => [
  ...ornateFrame(seed),
  circle(715 - seed * 15, 255 + seed * 4, 74 + seed * 2),
  `M 120 650 L ${330 + seed * 8} ${290 + seed * 4} L 485 565 L ${625 - seed * 5} ${350 + seed * 7} L 880 650`,
  `M ${285 + seed * 8} ${370 + seed * 4} L ${330 + seed * 8} ${290 + seed * 4} L ${385 + seed * 3} 390`,
  `M ${580 - seed * 5} ${430 + seed * 7} L ${625 - seed * 5} ${350 + seed * 7} L ${690 - seed * 2} 445`,
  "M 110 650 Q 250 590 390 650 T 670 650 T 950 650",
  "M 110 745 Q 260 680 410 745 T 710 745 T 1010 745",
  "M 110 835 Q 250 785 390 835 T 670 835 T 950 835",
  ...[175, 810].flatMap((x, index) => [
    `M ${x} ${780 + index * 18} V ${520 + index * 25}`,
    polygon([[x, 470 + index * 25], [x - 78, 650 + index * 18], [x + 78, 650 + index * 18]]),
    polygon([[x, 545 + index * 25], [x - 105, 735 + index * 18], [x + 105, 735 + index * 18]]),
  ]),
  `M 145 ${215 + seed * 4} Q 205 ${165 + seed * 3} 265 ${215 + seed * 4} Q 320 ${170 + seed * 3} 380 ${225 + seed * 4}`,
];

const stillLife = (seed: number) => [
  ...ornateFrame(seed),
  "M 145 760 H 855",
  "M 210 760 Q 500 690 790 760 L 830 855 H 170 Z",
  `M ${390 - seed * 5} 690 C ${350 - seed * 4} 550 ${370 - seed * 3} 430 410 380 H 590 C ${630 + seed * 3} 430 ${650 + seed * 4} 550 ${610 + seed * 5} 690 Z`,
  "M 410 380 Q 500 330 590 380",
  ...Array.from({ length: 7 }, (_, index) => {
    const angle = (index / 7) * Math.PI * 2;
    const x = Math.round(500 + Math.cos(angle) * (155 + seed * 3));
    const y = Math.round(315 + Math.sin(angle) * (120 + seed * 2));
    return [...rosette(x, y, 62 + (index % 3) * 8, 6 + ((seed + index) % 4)), circle(x, y, 18)];
  }).flat(),
  ...[270, 710].flatMap((x, index) => [
    circle(x, 650 - index * 20, 72 + index * 8),
    `M ${x} ${575 - index * 20} Q ${x + 25} ${525 - index * 18} ${x + 72} ${550 - index * 15}`,
  ]),
  ...decorativeDots(seed, 815),
];

const classicComposition = (seed: number) => {
  const figures = Array.from({ length: 3 + (seed % 3) }, (_, index) => {
    const x = 300 + index * (400 / (2 + (seed % 3)));
    const y = 510 + (index % 2) * 55;
    return [
      circle(Math.round(x), y - 115, 34),
      `M ${x} ${y - 80} Q ${x - 55} ${y + 15} ${x - 80} ${y + 145} H ${x + 80} Q ${x + 55} ${y + 15} ${x} ${y - 80} Z`,
      `M ${x - 38} ${y - 25} L ${x - 120} ${y + 55} M ${x + 38} ${y - 25} L ${x + 120} ${y + 55}`,
    ];
  }).flat();
  return [
    ...ornateFrame(seed),
    `M 120 ${700 + seed * 4} Q 280 ${610 + seed * 3} 440 ${700 + seed * 4} T 760 ${700 + seed * 4} T 1080 ${700 + seed * 4}`,
    `M 130 410 Q 300 ${245 + seed * 5} 470 410 T 810 410`,
    circle(735 - seed * 18, 235 + seed * 5, 70),
    ...figures,
    "M 150 835 Q 500 760 850 835",
    ...[205, 795].map((x) => `M ${x} 790 V 375 Q ${x} 315 ${x + (x < 500 ? 55 : -55)} 285`),
    ...rays(500, 500, 315, 355, 14 + seed),
  ];
};

const pattern = (seed: number) => {
  const count = 10 + seed;
  return [
    ...ornateFrame(seed),
    circle(500, 500, 92),
    circle(500, 500, 205),
    circle(500, 500, 325),
    ...rosette(500, 500, 205, count),
    ...rosette(500, 500, 325, count + 4),
    ...rays(500, 500, 335, 395, count * 2),
    ...Array.from({ length: count }, (_, index) => {
      const angle = (index / count) * Math.PI * 2;
      return circle(
        Math.round(500 + Math.cos(angle) * 365),
        Math.round(500 + Math.sin(angle) * 365),
        17 + (seed % 4) * 3,
      );
    }),
    star(500, 500, 68, 30, 6 + (seed % 5)),
  ];
};

type Builder = (seed: number) => string[];

const makeSeries = (
  prefix: string,
  names: string[],
  category: DrawingTemplate["category"],
  builder: Builder,
): DrawingTemplate[] =>
  names.map((title, index) => ({
    id: `${prefix}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`,
    title,
    category,
    level: "Detailed",
    paths: builder(index + 1),
  }));

export const detailedTemplates: DrawingTemplate[] = [
  ...makeSeries("portrait", [
    "Renaissance Muse", "Regal Profile", "Pearl Headdress", "Quiet Scholar", "Floral Crown",
    "Velvet Portrait", "Desert Queen", "Young Poet", "Moonlit Sitter", "Ceremonial Gaze",
  ], "Portraits", portrait),
  ...makeSeries("figure", [
    "Ballet Rehearsal", "Classical Dancer", "Cello Player", "Garden Reader", "Market Musician",
    "Figure in Motion", "Ceremonial Dancer", "Umbrella Walk", "Seated Dreamer", "The Storyteller",
  ], "Figures", figure),
  ...makeSeries("architecture", [
    "Mughal Courtyard", "Gothic Cathedral", "Venetian Palazzo", "Parisian Facade", "Kyoto Temple",
    "Rajasthani Haveli", "Art Deco Theatre", "Hilltop Monastery", "Royal Conservatory", "Old City Library",
  ], "Architecture", architecture),
  ...makeSeries("interior", [
    "Luxury Salon", "Collector's Study", "Sunlit Reading Room", "Modern Gallery", "Grand Piano Room",
    "Botanical Lounge", "Quiet Tea Room", "Velvet Drawing Room", "Sculptor's Loft", "Evening Library",
  ], "Interiors", interior),
  ...makeSeries("animal", [
    "Royal Bengal Tiger", "Snow Leopard", "Forest Lynx", "Decorated Elephant", "Arabian Horse",
    "Watchful Wolf", "Red Panda", "Sacred Cow", "Garden Rabbit", "Ornamental Peacock",
  ], "Animals", animal),
  ...makeSeries("botanical", [
    "Dutch Tulip Study", "Peony Symphony", "Wild Rose Garden", "Iris Collection", "Lotus Arrangement",
    "Tropical Bouquet", "Magnolia Branches", "Poppy Field Study", "Chrysanthemum Vase", "Botanical Herbarium",
  ], "Nature", botanical),
  ...makeSeries("landscape", [
    "Alpine Lake", "Himalayan Dawn", "Tuscan Evening", "Monsoon Valley", "Japanese Garden",
    "Coastal Cliffs", "Desert Sunrise", "Forest Waterfall", "Lavender Hills", "Moonlit River",
  ], "Places", landscape),
  ...makeSeries("still-life", [
    "Copper and Pears", "Flowers with Citrus", "Ceramic Blue Vase", "Harvest Table", "Pomegranates and Silk",
    "Tea and Camellias", "Apples by Candlelight", "Antique Books and Roses", "Glass and Figs", "Studio Objects",
  ], "Still Life", stillLife),
  ...makeSeries("classic", [
    "Golden Age Gathering", "Impressionist Garden", "Romantic Shore", "Baroque Procession", "Pastoral Musicians",
    "Neoclassical Figures", "Dutch Window Study", "Japanese Wave Study", "Renaissance Courtyard", "Symbolist Dream",
  ], "Classics", classicComposition),
  ...makeSeries("pattern", [
    "Cathedral Rose", "Mughal Jali", "Celestial Compass", "Persian Star", "Lotus Mandala",
    "Art Nouveau Bloom", "Geometric Sun", "Moroccan Mosaic", "Sacred Geometry", "Kaleidoscope Garden",
  ], "Patterns", pattern),
];
