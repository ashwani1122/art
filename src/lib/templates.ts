import { detailedTemplates } from "./detailed-templates";
import { rangoliTemplates } from "./rangoli-templates";

export type TemplateCategory =
  | "Nature"
  | "Animals"
  | "Places"
  | "Playful"
  | "Patterns"
  | "Portraits"
  | "Figures"
  | "Architecture"
  | "Interiors"
  | "Still Life"
  | "Classics"
  | "Rangoli";

export type DrawingTemplate = {
  id: string;
  title: string;
  category: TemplateCategory;
  level: "Easy" | "Medium" | "Detailed";
  paths: string[];
};

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

const petals = (cx: number, cy: number, radius: number, count: number) =>
  Array.from({ length: count }, (_, index) => {
    const angle = (index / count) * Math.PI * 2;
    const side = angle + Math.PI / 2;
    const tipX = cx + Math.cos(angle) * radius;
    const tipY = cy + Math.sin(angle) * radius;
    const width = radius * 0.32;
    return `M ${cx} ${cy} Q ${Math.round(cx + Math.cos(side) * width)} ${Math.round(
      cy + Math.sin(side) * width,
    )} ${Math.round(tipX)} ${Math.round(tipY)} Q ${Math.round(
      cx - Math.cos(side) * width,
    )} ${Math.round(cy - Math.sin(side) * width)} ${cx} ${cy}`;
  });

const pines = (starts: number[]) =>
  starts.flatMap((x, index) => {
    const base = 760 + (index % 2) * 45;
    return [
      `M ${x} ${base} L ${x} ${base - 230}`,
      polygon([
        [x, base - 245],
        [x - 90, base - 95],
        [x + 90, base - 95],
      ]),
      polygon([
        [x, base - 180],
        [x - 115, base - 25],
        [x + 115, base - 25],
      ]),
    ];
  });

const originalTemplates: DrawingTemplate[] = [
  {
    id: "botanical-bloom",
    title: "Botanical Bloom",
    category: "Nature",
    level: "Easy",
    paths: [
      ...petals(510, 390, 245, 10),
      circle(510, 390, 82),
      ...rays(510, 390, 36, 70, 14),
      "M 505 470 C 470 620 520 730 486 880",
      "M 490 650 C 390 575 315 615 290 705 C 380 725 455 700 490 650 Z",
      "M 498 745 C 585 675 680 700 714 785 C 620 815 545 795 498 745 Z",
    ],
  },
  {
    id: "butterfly-garden",
    title: "Butterfly Garden",
    category: "Animals",
    level: "Medium",
    paths: [
      ellipse(500, 520, 38, 245),
      "M 475 405 C 350 170 115 205 130 435 C 145 600 330 585 470 505 Z",
      "M 525 405 C 650 170 885 205 870 435 C 855 600 670 585 530 505 Z",
      "M 470 535 C 315 535 215 650 270 805 C 400 830 460 685 485 585 Z",
      "M 530 535 C 685 535 785 650 730 805 C 600 830 540 685 515 585 Z",
      "M 485 285 C 440 205 385 200 355 165",
      "M 515 285 C 560 205 615 200 645 165",
      circle(330, 385, 58),
      circle(670, 385, 58),
      ...petals(185, 785, 80, 6),
      circle(185, 785, 25),
      ...petals(820, 755, 72, 7),
      circle(820, 755, 24),
    ],
  },
  {
    id: "mountain-morning",
    title: "Mountain Morning",
    category: "Places",
    level: "Easy",
    paths: [
      circle(760, 230, 92),
      "M 75 720 L 330 340 L 475 555 L 585 410 L 900 720",
      "M 245 470 L 330 340 L 405 452 L 350 435 L 310 485 Z",
      "M 515 500 L 585 410 L 670 510 L 610 482 L 570 530 Z",
      "M 70 720 Q 250 650 430 720 T 790 720 T 970 720",
      "M 80 815 Q 260 745 440 815 T 800 815 T 980 815",
      "M 120 230 Q 190 170 260 230 Q 325 180 385 240",
      ...pines([155, 835]),
    ],
  },
  {
    id: "koi-circle",
    title: "Koi Circle",
    category: "Animals",
    level: "Detailed",
    paths: [
      circle(500, 500, 385),
      "M 250 555 C 270 360 430 270 570 350 C 470 360 390 430 375 555 C 355 680 445 720 545 735 C 365 790 230 710 250 555 Z",
      "M 750 445 C 730 640 570 730 430 650 C 530 640 610 570 625 445 C 645 320 555 280 455 265 C 635 210 770 290 750 445 Z",
      "M 260 570 L 145 490 L 165 640 Z",
      "M 740 430 L 855 510 L 835 360 Z",
      circle(322, 474, 13),
      circle(678, 526, 13),
      "M 420 380 Q 485 450 555 390",
      "M 580 620 Q 515 550 445 610",
      ...[190, 290, 710, 810].map((x, i) => circle(x, i % 2 ? 230 : 770, 32)),
    ],
  },
  {
    id: "city-dreams",
    title: "City Dreams",
    category: "Places",
    level: "Detailed",
    paths: [
      "M 70 820 L 70 470 L 235 470 L 235 820",
      "M 250 820 L 250 320 L 420 320 L 420 820",
      "M 435 820 L 435 410 L 610 410 L 610 820",
      "M 625 820 L 625 245 L 820 245 L 820 820",
      "M 835 820 L 835 535 L 940 535 L 940 820",
      ...[110, 170].flatMap((x) => [530, 620, 710].map((y) => `M ${x} ${y} h 55 v 48 h -55 Z`)),
      ...[285, 350].flatMap((x) => [380, 475, 570, 665].map((y) => `M ${x} ${y} h 42 v 52 h -42 Z`)),
      ...[475, 550].flatMap((x) => [475, 575, 675].map((y) => `M ${x} ${y} h 42 v 52 h -42 Z`)),
      ...[670, 745].flatMap((x) => [310, 405, 500, 595, 690].map((y) => `M ${x} ${y} h 46 v 50 h -46 Z`)),
      "M 50 820 H 960",
      circle(170, 210, 78),
      star(880, 155, 34, 14),
    ],
  },
  {
    id: "garden-snail",
    title: "Garden Snail",
    category: "Animals",
    level: "Easy",
    paths: [
      "M 165 720 C 270 650 330 675 430 720 C 555 775 720 765 850 695 C 800 820 650 850 475 820 C 330 795 205 815 120 790 Z",
      circle(480, 560, 205),
      "M 480 560 C 585 470 650 590 585 665 C 515 745 365 675 345 560 C 320 420 485 355 610 420",
      "M 700 700 C 690 565 735 440 825 390",
      "M 760 625 C 765 500 825 440 890 415",
      circle(828, 385, 18),
      circle(895, 410, 18),
      "M 775 655 Q 830 700 885 650",
      "M 80 855 Q 300 820 510 865 T 930 850",
      ...petals(185, 280, 80, 7),
      circle(185, 280, 25),
    ],
  },
  {
    id: "forest-fox",
    title: "Forest Fox",
    category: "Animals",
    level: "Medium",
    paths: [
      "M 285 300 L 390 115 L 475 330",
      "M 525 330 L 610 115 L 715 300",
      "M 290 295 C 325 735 400 835 500 855 C 600 835 675 735 710 295 C 610 245 390 245 290 295 Z",
      "M 310 410 C 390 415 450 460 500 555 C 550 460 610 415 690 410",
      "M 315 420 C 350 650 420 740 500 765 C 580 740 650 650 685 420",
      ellipse(405, 470, 28, 42),
      ellipse(595, 470, 28, 42),
      polygon([[500, 570], [458, 610], [542, 610]]),
      "M 500 610 Q 450 660 405 625 M 500 610 Q 550 660 595 625",
      ...[170, 835].flatMap((x) => pines([x])),
    ],
  },
  {
    id: "celestial-moon",
    title: "Celestial Moon",
    category: "Patterns",
    level: "Detailed",
    paths: [
      "M 650 190 C 400 205 280 420 350 630 C 420 845 700 865 850 665 C 680 765 475 675 450 490 C 425 320 520 225 650 190 Z",
      ...[
        [160, 205, 48],
        [785, 205, 34],
        [180, 700, 30],
        [810, 785, 50],
        [150, 470, 24],
        [720, 515, 24],
      ].map(([x, y, r]) => star(x, y, r, r * 0.42)),
      ...rays(500, 500, 350, 420, 24),
      circle(500, 500, 455),
      circle(500, 500, 420),
    ],
  },
  {
    id: "ocean-turtle",
    title: "Ocean Turtle",
    category: "Animals",
    level: "Detailed",
    paths: [
      ellipse(505, 505, 250, 300),
      circle(505, 505, 185),
      polygon([[505, 320], [625, 410], [600, 560], [505, 690], [410, 560], [385, 410]]),
      "M 385 410 L 625 410 M 410 560 L 600 560 M 505 320 L 505 690",
      "M 290 390 C 135 260 80 370 225 500 C 120 475 90 560 280 610",
      "M 720 390 C 875 260 930 370 785 500 C 890 475 920 560 730 610",
      "M 365 735 C 285 860 385 900 450 785",
      "M 645 735 C 725 860 625 900 560 785",
      ellipse(505, 165, 75, 95),
      circle(480, 145, 8),
      circle(530, 145, 8),
      "M 60 845 Q 180 790 300 845 T 540 845 T 780 845 T 1020 845",
    ],
  },
  {
    id: "mushroom-nook",
    title: "Mushroom Nook",
    category: "Nature",
    level: "Medium",
    paths: [
      "M 160 480 C 200 230 515 215 590 480 C 440 520 300 520 160 480 Z",
      "M 310 500 C 330 630 310 760 250 830 L 500 830 C 445 745 425 620 440 500",
      "M 555 620 C 590 430 815 440 850 620 C 760 650 650 650 555 620 Z",
      "M 650 640 C 660 725 650 790 615 835 L 800 835 C 765 775 755 710 760 640",
      ...[
        [280, 370, 42],
        [420, 330, 30],
        [510, 415, 35],
        [650, 545, 24],
        [760, 550, 33],
      ].map(([x, y, r]) => circle(x, y, r)),
      "M 80 850 Q 240 810 400 850 T 720 850 T 1040 850",
      ...petals(830, 300, 66, 6),
      circle(830, 300, 22),
    ],
  },
  {
    id: "wildflower-wreath",
    title: "Wildflower Wreath",
    category: "Nature",
    level: "Detailed",
    paths: [
      circle(500, 500, 315),
      ...Array.from({ length: 10 }, (_, index) => {
        const a = (index / 10) * Math.PI * 2;
        return petals(
          Math.round(500 + Math.cos(a) * 315),
          Math.round(500 + Math.sin(a) * 315),
          72,
          6 + (index % 3),
        );
      }).flat(),
      ...Array.from({ length: 10 }, (_, index) => {
        const a = (index / 10) * Math.PI * 2;
        return circle(Math.round(500 + Math.cos(a) * 315), Math.round(500 + Math.sin(a) * 315), 20);
      }),
      "M 330 500 Q 500 390 670 500 Q 500 610 330 500 Z",
    ],
  },
  {
    id: "birdhouse-song",
    title: "Birdhouse Song",
    category: "Nature",
    level: "Easy",
    paths: [
      polygon([[235, 430], [500, 190], [765, 430]]),
      "M 285 405 V 760 H 715 V 405",
      circle(500, 500, 92),
      "M 430 650 H 570 M 500 650 V 720",
      "M 500 760 V 910",
      "M 110 910 H 890",
      "M 705 255 Q 785 180 865 245",
      "M 710 260 Q 780 310 850 250",
      circle(780, 245, 8),
      ...petals(160, 720, 62, 6),
      circle(160, 720, 21),
    ],
  },
  {
    id: "balloon-parade",
    title: "Balloon Parade",
    category: "Places",
    level: "Medium",
    paths: [
      ...[
        [250, 350, 150, 190],
        [520, 260, 185, 225],
        [780, 390, 135, 170],
      ].flatMap(([x, y, rx, ry]) => [
        ellipse(x, y, rx, ry),
        `M ${x - rx * 0.78} ${y - ry * 0.32} Q ${x} ${y} ${x + rx * 0.78} ${y - ry * 0.32}`,
        `M ${x - rx * 0.92} ${y + ry * 0.2} Q ${x} ${y + ry * 0.05} ${x + rx * 0.92} ${y + ry * 0.2}`,
        `M ${x - 32} ${y + ry - 5} L ${x - 48} ${y + ry + 105} H ${x + 48} L ${x + 32} ${y + ry - 5}`,
      ]),
      "M 70 845 Q 180 765 290 845 Q 410 740 540 845 Q 675 760 800 845 Q 885 790 960 845",
    ],
  },
  {
    id: "cactus-garden",
    title: "Cactus Garden",
    category: "Nature",
    level: "Easy",
    paths: [
      "M 355 790 V 335 C 355 250 485 250 485 335 V 790",
      "M 355 510 H 260 C 205 510 205 455 205 400 C 205 340 285 340 285 400 V 445 H 355",
      "M 485 580 H 600 C 655 580 655 525 655 470 C 655 410 575 410 575 470 V 515 H 485",
      "M 285 790 H 555 L 610 900 H 235 Z",
      "M 690 790 V 505 C 690 430 805 430 805 505 V 790",
      "M 650 790 H 845 L 880 895 H 615 Z",
      ...petals(420, 270, 52, 7),
      circle(420, 270, 16),
      ...petals(747, 440, 45, 6),
      circle(747, 440, 14),
      "M 50 900 H 950",
    ],
  },
  {
    id: "cozy-teapot",
    title: "Cozy Teapot",
    category: "Playful",
    level: "Medium",
    paths: [
      "M 280 420 C 250 520 260 735 420 800 H 650 C 795 735 805 505 745 420 Z",
      "M 340 420 Q 500 325 680 420",
      "M 395 365 Q 500 280 610 365",
      ellipse(505, 305, 68, 28),
      "M 280 495 C 165 430 110 495 155 585 C 185 645 245 650 280 620",
      "M 745 500 C 860 480 910 540 870 615 C 835 680 790 670 755 630",
      ...petals(510, 585, 105, 8),
      circle(510, 585, 35),
      "M 210 840 H 820",
      "M 320 840 Q 500 900 700 840",
    ],
  },
  {
    id: "friendly-dino",
    title: "Friendly Dinosaur",
    category: "Animals",
    level: "Easy",
    paths: [
      "M 190 670 C 190 400 380 270 555 390 C 650 455 705 590 805 570 C 875 555 905 490 875 420 C 965 520 925 680 805 710 C 680 740 605 650 520 650 L 520 820 H 395 V 665 C 330 730 285 770 190 770 Z",
      ...[
        [285, 405],
        [370, 335],
        [465, 325],
      ].map(([x, y]) => polygon([[x - 42, y + 18], [x, y - 70], [x + 42, y + 18]])),
      circle(285, 520, 14),
      "M 245 585 Q 290 625 335 585",
      ...[420, 500, 580].map((x) => circle(x, 515 + ((x / 80) % 2) * 45, 32)),
      "M 395 820 H 520 M 180 770 H 300",
      "M 95 855 Q 260 815 425 855 T 755 855 T 1085 855",
    ],
  },
  {
    id: "rocket-journey",
    title: "Rocket Journey",
    category: "Playful",
    level: "Medium",
    paths: [
      "M 500 150 C 350 270 340 535 410 700 H 590 C 660 535 650 270 500 150 Z",
      circle(500, 390, 82),
      "M 410 560 C 285 610 250 700 265 790 L 420 690",
      "M 590 560 C 715 610 750 700 735 790 L 580 690",
      "M 445 700 L 400 900 L 500 815 L 600 900 L 555 700",
      ...[
        [170, 220, 34],
        [815, 260, 42],
        [175, 620, 24],
        [850, 700, 28],
        [720, 120, 20],
      ].map(([x, y, r]) => star(x, y, r, r * 0.42)),
      circle(165, 390, 62),
      "M 105 390 H 225 M 165 330 V 450",
    ],
  },
  {
    id: "sleepy-cat",
    title: "Sleepy Cat",
    category: "Animals",
    level: "Easy",
    paths: [
      "M 285 420 L 320 195 L 450 330",
      "M 550 330 L 680 195 L 715 420",
      "M 285 410 C 240 700 330 835 500 845 C 670 835 760 700 715 410 C 610 335 390 335 285 410 Z",
      "M 350 500 Q 400 540 450 500 M 550 500 Q 600 540 650 500",
      polygon([[500, 570], [465, 600], [535, 600]]),
      "M 500 600 Q 465 640 430 615 M 500 600 Q 535 640 570 615",
      "M 390 590 L 155 545 M 390 635 L 145 650 M 610 590 L 845 545 M 610 635 L 855 650",
      "M 360 730 Q 500 790 640 730",
      ...[350, 650].map((x) => circle(x, 425, 22)),
    ],
  },
  {
    id: "elephant-parade",
    title: "Elephant Parade",
    category: "Animals",
    level: "Medium",
    paths: [
      "M 255 355 C 355 220 665 220 760 370 C 820 465 800 680 700 745 H 345 C 235 680 190 455 255 355 Z",
      "M 310 385 C 110 315 85 535 240 650 C 290 685 330 625 315 540 Z",
      "M 695 385 C 895 315 920 535 765 650 C 715 685 675 625 690 540 Z",
      "M 455 430 C 420 560 420 805 500 870 C 585 805 580 555 545 430",
      "M 455 840 Q 500 910 570 850",
      circle(392, 430, 17),
      circle(610, 430, 17),
      "M 345 745 V 855 H 450 M 650 745 V 855 H 755",
      ...petals(500, 275, 62, 7),
      circle(500, 275, 19),
    ],
  },
  {
    id: "sailboat-bay",
    title: "Sailboat Bay",
    category: "Places",
    level: "Easy",
    paths: [
      "M 500 165 V 680",
      polygon([[485, 215], [205, 575], [485, 575]]),
      polygon([[515, 260], [775, 575], [515, 575]]),
      "M 165 655 H 835 L 735 790 H 275 Z",
      "M 75 820 Q 180 770 285 820 T 495 820 T 705 820 T 915 820",
      "M 80 890 Q 185 840 290 890 T 500 890 T 710 890 T 920 890",
      circle(800, 180, 70),
      "M 115 280 Q 175 225 235 280 Q 295 230 350 285",
      "M 690 335 Q 735 295 780 335 Q 825 300 870 340",
    ],
  },
  {
    id: "fruit-market",
    title: "Fruit Market",
    category: "Playful",
    level: "Detailed",
    paths: [
      "M 130 390 H 870 L 810 835 H 190 Z",
      ...[
        [270, 470, 92],
        [460, 455, 105],
        [680, 475, 88],
        [350, 640, 98],
        [565, 655, 112],
        [755, 655, 72],
      ].map(([x, y, r]) => circle(x, y, r)),
      "M 445 350 Q 480 285 530 355",
      "M 660 390 Q 695 320 745 370",
      "M 535 540 Q 570 470 630 525",
      "M 215 395 Q 260 315 325 390",
      "M 180 835 H 820",
      "M 130 390 L 210 300 H 790 L 870 390",
      ...[260, 390, 520, 650].map((x) => `M ${x} 300 V 390`),
    ],
  },
  {
    id: "storybook-castle",
    title: "Storybook Castle",
    category: "Places",
    level: "Detailed",
    paths: [
      "M 230 410 V 820 H 770 V 410",
      "M 125 410 H 340 V 820 H 125 Z",
      "M 660 410 H 875 V 820 H 660 Z",
      polygon([[110, 410], [232, 205], [355, 410]]),
      polygon([[645, 410], [768, 205], [890, 410]]),
      polygon([[310, 410], [500, 120], [690, 410]]),
      "M 415 820 V 650 Q 500 565 585 650 V 820",
      ...[
        [220, 505],
        [500, 350],
        [780, 505],
      ].map(([x, y]) => `M ${x - 30} ${y + 70} V ${y} Q ${x} ${y - 45} ${x + 30} ${y} V ${y + 70} Z`),
      "M 90 820 H 910",
      "M 500 120 V 55 L 590 90 L 500 125",
      ...[160, 840].map((x) => star(x, 150, 30, 13)),
    ],
  },
  {
    id: "mandala-sun",
    title: "Mandala Sun",
    category: "Patterns",
    level: "Detailed",
    paths: [
      circle(500, 500, 85),
      circle(500, 500, 180),
      circle(500, 500, 285),
      circle(500, 500, 390),
      ...petals(500, 500, 280, 16),
      ...rays(500, 500, 300, 390, 32),
      ...Array.from({ length: 16 }, (_, index) => {
        const angle = (index / 16) * Math.PI * 2;
        return circle(
          Math.round(500 + Math.cos(angle) * 340),
          Math.round(500 + Math.sin(angle) * 340),
          28,
        );
      }),
      ...rays(500, 500, 410, 455, 24),
    ],
  },
  {
    id: "abstract-waves",
    title: "Abstract Waves",
    category: "Patterns",
    level: "Medium",
    paths: [
      "M 40 180 C 210 45 340 315 510 180 S 815 315 975 170",
      "M 25 290 C 190 155 350 425 515 290 S 815 425 985 275",
      "M 25 405 C 205 265 350 555 530 405 S 820 550 990 395",
      "M 15 525 C 195 380 350 680 535 525 S 830 680 995 510",
      "M 20 650 C 195 505 365 800 540 650 S 825 800 990 635",
      "M 35 780 C 215 635 375 920 555 780 S 830 920 975 765",
      ...[
        [180, 180],
        [480, 290],
        [750, 405],
        [290, 525],
        [610, 650],
        [845, 780],
      ].map(([x, y]) => circle(x, y, 35)),
    ],
  },
];

export const drawingTemplates: DrawingTemplate[] = [...originalTemplates, ...detailedTemplates, ...rangoliTemplates];

export const blankTemplate: DrawingTemplate = {
  id: "blank-canvas",
  title: "Blank Canvas",
  category: "Playful",
  level: "Easy",
  paths: [],
};

export const templateCategories = [
  "All",
  "Portraits",
  "Figures",
  "Classics",
  "Architecture",
  "Interiors",
  "Animals",
  "Nature",
  "Places",
  "Still Life",
  "Patterns",
  "Playful",
  "Rangoli",
] as const;
