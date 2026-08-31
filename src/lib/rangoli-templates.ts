import type { DrawingTemplate } from "./templates";

const circle = (cx: number, cy: number, r: number) =>
  `M ${cx - r} ${cy} a ${r} ${r} 0 1 0 ${r * 2} 0 a ${r} ${r} 0 1 0 ${-r * 2} 0`;

const polygon = (points: Array<[number, number]>) =>
  `${points.map(([x, y], index) => `${index === 0 ? "M" : "L"} ${Math.round(x)} ${Math.round(y)}`).join(" ")} Z`;

const radialPolygon = (cx: number, cy: number, outer: number, inner: number, count: number, rotation = -Math.PI / 2) =>
  polygon(Array.from({ length: count * 2 }, (_, index) => {
    const radius = index % 2 === 0 ? outer : inner;
    const angle = rotation + (index * Math.PI) / count;
    return [cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius] as [number, number];
  }));

const petal = (cx: number, cy: number, radius: number, width: number, angle: number) => {
  const tipX = cx + Math.cos(angle) * radius;
  const tipY = cy + Math.sin(angle) * radius;
  const side = angle + Math.PI / 2;
  return `M ${cx} ${cy} Q ${cx + Math.cos(side) * width} ${cy + Math.sin(side) * width} ${tipX} ${tipY} Q ${cx - Math.cos(side) * width} ${cy - Math.sin(side) * width} ${cx} ${cy} Z`;
};

const petalRing = (cx: number, cy: number, radius: number, width: number, count: number, rotation = 0) =>
  Array.from({ length: count }, (_, index) => petal(cx, cy, radius, width, rotation + (index / count) * Math.PI * 2));

const dotRing = (cx: number, cy: number, radius: number, dotRadius: number, count: number, rotation = 0) =>
  Array.from({ length: count }, (_, index) => {
    const angle = rotation + (index / count) * Math.PI * 2;
    return circle(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius, dotRadius);
  });

const loopRing = (cx: number, cy: number, radius: number, count: number) =>
  Array.from({ length: count }, (_, index) => {
    const angle = (index / count) * Math.PI * 2;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    const next = angle + Math.PI / count;
    return `M ${x} ${y} Q ${cx + Math.cos(next) * (radius + 62)} ${cy + Math.sin(next) * (radius + 62)} ${cx + Math.cos(angle + (Math.PI * 2) / count) * radius} ${cy + Math.sin(angle + (Math.PI * 2) / count) * radius}`;
  });

const names = [
  "Diwali Lotus Mandala", "Peacock Feather Rangoli", "Sunburst Kolam", "Marigold Spiral", "Eight Petal Welcome",
  "Lakshmi Footprint Circle", "Mirror Star Rangoli", "Jasmine Dot Grid", "Turmeric Flower Wheel", "Royal Blue Chakra",
  "Rose Petal Chowk", "Sacred Geometry Floor Art", "Lotus Lantern", "Pookalam Garden", "Kite Diamond Rangoli",
  "Mango Leaf Mandana", "Twelve Petal Bloom", "Ganesha-Inspired Symmetry", "Diyas Around the Sun", "Indigo Kolam Loops",
  "Festival Peacock Wheel", "Floral Hexagon Chowk", "Coral Conch Pattern", "Spring Blossom Rangoli", "Nine Gem Mandala",
  "Lotus Pond Floor Art", "Ruby Star Kolam", "Green Parrot Motif", "Golden Paisley Circle", "Moonlit Diya Rangoli",
  "Rose Window Rangoli", "Temple Bell Mandala", "Kumkum Diamond Grid", "Butterfly Petal Wheel", "Harvest Grain Pattern",
  "Lotus and Leaf Border", "Emerald Sun Kolam", "Sixteen Point Diwali Art", "Pink Hibiscus Chowk", "Saffron Spiral Garden",
  "Rain Drop Mandala", "Silver Peacock Feathers", "Heritage Alpana Circle", "Blue Lotus Mosaic", "Coconut Leaf Star",
  "Festival Garland Rangoli", "Coral Mandala Garden", "White Rice Flour Kolam", "Rainbow Petal Chakra", "Brass Diya Rosette",
  "Grand Courtyard Rangoli",
];

export const rangoliTemplates: DrawingTemplate[] = names.map((title, index) => {
  const family = index % 5;
  const count = 6 + (index % 6);
  const rotation = (index % 4) * Math.PI / 12;
  const innerSides = 5 + (index % 8);
  const outerSides = 6 + ((index * 3) % 9);
  const innerRadius = 112 + (index % 5) * 13;
  const outerRadius = 325 + (index % 4) * 14;
  const paths: string[] = [circle(500, 500, 62 + (index % 4) * 8), circle(500, 500, innerRadius), circle(500, 500, outerRadius)];

  if (family === 0) {
    paths.push(...petalRing(500, 500, 235, 54, count, rotation));
    paths.push(...petalRing(500, 500, 330, 42, count * 2, rotation + Math.PI / count));
    paths.push(...dotRing(500, 500, 292, 15, count * 2, rotation));
  } else if (family === 1) {
    paths.push(radialPolygon(500, 500, 315, 205, count, rotation));
    paths.push(radialPolygon(500, 500, 250, 145, count + 2, rotation + Math.PI / count));
    paths.push(...dotRing(500, 500, 330, 18, count, rotation));
    paths.push(...petalRing(500, 500, 205, 32, count, rotation + Math.PI / count));
  } else if (family === 2) {
    paths.push(...petalRing(500, 500, 210, 70, count, rotation));
    paths.push(...petalRing(500, 500, 300, 52, count, rotation + Math.PI / count));
    paths.push(...dotRing(500, 500, 365, 12, count * 2, rotation));
  } else if (family === 3) {
    paths.push(radialPolygon(500, 500, 330, 250, 4, rotation));
    paths.push(radialPolygon(500, 500, 255, 175, 4, rotation + Math.PI / 4));
    paths.push(...loopRing(500, 500, 285, 8));
    paths.push(...dotRing(500, 500, 205, 14, 8, rotation));
    paths.push(...dotRing(500, 500, 350, 12, 16, rotation));
  } else {
    paths.push(...petalRing(500, 500, 205, 45, 8, rotation));
    paths.push(...petalRing(500, 500, 305, 38, 8, rotation + Math.PI / 8));
    paths.push(radialPolygon(500, 500, 370, 320, 8, rotation));
    paths.push(...dotRing(500, 500, 265, 16, 8, rotation));
  }

  // A unique signature ring keeps every generated floor design visually distinct.
  paths.push(radialPolygon(500, 500, outerRadius + 42, outerRadius - 12, outerSides, rotation / 2));
  paths.push(radialPolygon(500, 500, innerRadius - 18, Math.max(38, innerRadius - 58), innerSides, rotation + Math.PI / 10));
  if (index % 2 === 0) paths.push(...dotRing(500, 500, 405, 9 + (index % 4), 8 + (index % 5), rotation));
  else paths.push(...loopRing(500, 500, 390, 6 + (index % 7)));

  return {
    id: `rangoli-${String(index + 1).padStart(2, "0")}`,
    title,
    category: "Rangoli",
    level: index % 3 === 0 ? "Easy" : index % 3 === 1 ? "Medium" : "Detailed",
    paths,
  } satisfies DrawingTemplate;
});
