"use client";

import {
  Brush,
  Check,
  ChevronDown,
  Circle,
  Cloud,
  Download,
  Droplets,
  Eraser,
  Eye,
  Grid2X2,
  Heart,
  Highlighter,
  Image as ImageIcon,
  Minus,
  PaintBucket,
  Palette,
  PanelLeft,
  PanelLeftClose,
  PanelRight,
  PanelRightClose,
  PenLine,
  Pipette,
  Printer,
  Redo2,
  RotateCcw,
  Search,
  Sparkles,
  SprayCan,
  Square,
  Star,
  Trash2,
  Triangle,
  Undo2,
  ZoomIn,
  ZoomOut,
  type LucideIcon,
} from "lucide-react";
import { Show, SignInButton, UserButton, useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MasterpieceGallery } from "@/components/masterpiece-gallery";
import { WallPreview } from "@/components/wall-preview";
import {
  canvasToPng,
  getLocalArtwork,
  listLocalArtworkIds,
  putLocalArtwork,
  type StoredArtwork,
} from "@/lib/artwork-store";
import {
  blankTemplate,
  drawingTemplates,
  templateCategories,
  type DrawingTemplate,
} from "@/lib/templates";
import type { MasterpieceReference } from "@/lib/masterpiece-references";

type ToolId =
  | "pencil"
  | "ink"
  | "marker"
  | "watercolor"
  | "crayon"
  | "spray"
  | "eraser"
  | "fill"
  | "picker"
  | "line"
  | "rectangle"
  | "circle"
  | "triangle"
  | "star"
  | "heart";

type Point = { x: number; y: number };

type CanvasSize = {
  id: string;
  label: string;
  width: number;
  height: number;
};

const CANVAS_SIZES: CanvasSize[] = [
  { id: "square", label: "Square · 1200", width: 1200, height: 1200 },
  { id: "portrait", label: "Portrait · 1200 × 1500", width: 1200, height: 1500 },
  { id: "a4", label: "A4 print · 1240 × 1754", width: 1240, height: 1754 },
  { id: "landscape", label: "Landscape · 1600 × 1000", width: 1600, height: 1000 },
  { id: "story", label: "Story · 1080 × 1920", width: 1080, height: 1920 },
];

const TOOLS: Array<{ id: ToolId; label: string; icon: LucideIcon; group: "paint" | "shape" }> = [
  { id: "pencil", label: "Pencil", icon: PenLine, group: "paint" },
  { id: "ink", label: "Ink pen", icon: Brush, group: "paint" },
  { id: "marker", label: "Marker", icon: Highlighter, group: "paint" },
  { id: "watercolor", label: "Watercolor", icon: Droplets, group: "paint" },
  { id: "crayon", label: "Crayon", icon: Sparkles, group: "paint" },
  { id: "spray", label: "Airbrush", icon: SprayCan, group: "paint" },
  { id: "eraser", label: "Eraser", icon: Eraser, group: "paint" },
  { id: "fill", label: "Bucket fill", icon: PaintBucket, group: "paint" },
  { id: "picker", label: "Color picker", icon: Pipette, group: "paint" },
  { id: "line", label: "Line", icon: Minus, group: "shape" },
  { id: "rectangle", label: "Rectangle", icon: Square, group: "shape" },
  { id: "circle", label: "Circle", icon: Circle, group: "shape" },
  { id: "triangle", label: "Triangle", icon: Triangle, group: "shape" },
  { id: "star", label: "Star", icon: Star, group: "shape" },
  { id: "heart", label: "Heart", icon: Heart, group: "shape" },
];

const PALETTE_COLORS = [
  "#141414",
  "#f8f3e8",
  "#ed5b45",
  "#f39a3c",
  "#f4cc48",
  "#88b85a",
  "#176b58",
  "#37a9a2",
  "#3b82b4",
  "#4d55a5",
  "#8664a9",
  "#c55a91",
  "#ad513b",
  "#8c673b",
  "#d7a78c",
  "#8092a1",
  "#ffffff",
  "#e8ddd0",
  "#c6b59b",
  "#9d8b73",
  "#6a5847",
  "#3d3028",
  "#ff7a6b",
  "#ffb04f",
  "#ffe26f",
  "#b9df72",
  "#62c17f",
  "#1d8e73",
  "#55d9d1",
  "#76c8ed",
  "#6e96dc",
  "#6f70c6",
  "#a27bd2",
  "#dc74b5",
  "#f4a4bd",
  "#f0bf9b",
  "#c78155",
  "#96543c",
  "#6b3543",
  "#492746",
  "#b9c2cb",
  "#687985",
  "#364b55",
  "#213b38",
  "#405d3d",
  "#78905b",
  "#b8a83c",
  "#d7d2c4",
];

const SETTINGS_KEY = "pigmenta:studio-settings:v2";

const RESEARCH_NOTES = [
  {
    title: "Trace slowly, then loosen up",
    body: "Fine motor control is strongly connected with developing drawing skill. Start with a smaller, steadier tool; move to expressive brushes once the contour feels familiar.",
    href: "https://pubmed.ncbi.nlm.nih.gov/28902393/",
    source: "Child Development, 2019",
  },
  {
    title: "Marks teach through feedback",
    body: "Seeing the mark appear while your hand moves strengthens the motor–sensory loop. Use undo freely, but finish a few strokes before judging them.",
    href: "https://pubmed.ncbi.nlm.nih.gov/25271440/",
    source: "Cognitive Neuroscience, 2014",
  },
  {
    title: "Screens are light, paint is pigment",
    body: "Physical paint mixing is subtractive and pigment-specific. The mixer here creates useful perceptual steps, but treats them as digital studies—not exact paint recipes.",
    href: "https://opg.optica.org/oe/fulltext.cfm?uri=oe-31-15-25191&id=534663",
    source: "Optics Express, 2023",
  },
  {
    title: "Give your painting a wall moment",
    body: "A small exploratory study found short-term mood and anxiety improvements after a brief interactive art experience. Open the room preview, step back, and notice how scale, contrast, and color change the feeling of the space.",
    href: "https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2022.782033/full",
    source: "Frontiers in Psychology, 2022",
  },
];

const isShapeTool = (tool: ToolId) =>
  ["line", "rectangle", "circle", "triangle", "star", "heart"].includes(tool);

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  const value = Number.parseInt(normalized, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b]
    .map((value) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, "0"))
    .join("")}`;
}

function mixHex(first: string, second: string, ratio: number) {
  const a = hexToRgb(first);
  const b = hexToRgb(second);
  // Mixing reflectance in linear-light space gives a smoother digital study than raw sRGB averaging.
  const toLinear = (value: number) => {
    const channel = value / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  };
  const toSrgb = (value: number) => {
    const channel = value <= 0.0031308 ? value * 12.92 : 1.055 * value ** (1 / 2.4) - 0.055;
    return channel * 255;
  };
  return rgbToHex(
    toSrgb(toLinear(a.r) * (1 - ratio) + toLinear(b.r) * ratio),
    toSrgb(toLinear(a.g) * (1 - ratio) + toLinear(b.g) * ratio),
    toSrgb(toLinear(a.b) * (1 - ratio) + toLinear(b.b) * ratio),
  );
}

function drawGuide(canvas: HTMLCanvasElement, template: DrawingTemplate) {
  const context = canvas.getContext("2d");
  if (!context) return;
  context.clearRect(0, 0, canvas.width, canvas.height);
  if (template.paths.length === 0) return;

  const scale = Math.min(canvas.width, canvas.height) / 1000;
  const offsetX = (canvas.width - 1000 * scale) / 2;
  const offsetY = (canvas.height - 1000 * scale) / 2;
  context.save();
  context.translate(offsetX, offsetY);
  context.scale(scale, scale);
  context.strokeStyle = "#20201d";
  context.lineWidth = 5;
  context.lineCap = "round";
  context.lineJoin = "round";
  template.paths.forEach((path) => context.stroke(new Path2D(path)));
  context.restore();
}

function TemplatePreview({ template }: { template: DrawingTemplate }) {
  return (
    <svg viewBox="0 0 1000 1000" role="img" aria-label={`${template.title} outline preview`}>
      <rect width="1000" height="1000" fill="#fffdf8" />
      <g fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round">
        {template.paths.map((path, index) => (
          <path d={path} key={`${template.id}-${index}`} />
        ))}
      </g>
    </svg>
  );
}

function ToolButton({
  tool,
  active,
  onClick,
  draggable,
  onDragStart,
}: {
  tool: (typeof TOOLS)[number];
  active: boolean;
  onClick: () => void;
  draggable?: boolean;
  onDragStart?: (event: React.DragEvent<HTMLButtonElement>) => void;
}) {
  const Icon = tool.icon;
  return (
    <button
      type="button"
      className={`tool-button ${active ? "is-active" : ""}`}
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
      aria-label={tool.label}
      aria-pressed={active}
      title={tool.label}
    >
      <Icon size={18} strokeWidth={1.8} />
      <span>{tool.label}</span>
    </button>
  );
}

export function PaintingStudio() {
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const paintCanvasRef = useRef<HTMLCanvasElement>(null);
  const guideCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<Point>({ x: 0, y: 0 });
  const startPointRef = useRef<Point>({ x: 0, y: 0 });
  const shapeBaseRef = useRef<ImageData | null>(null);
  const historyRef = useRef<ImageData[]>([]);
  const historyIndexRef = useRef(-1);
  const activeTemplateRef = useRef<DrawingTemplate>(drawingTemplates[0]);
  const canvasSizeRef = useRef<CanvasSize>(CANVAS_SIZES[0]);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const restoreTokenRef = useRef(0);
  const isRestoringRef = useRef(false);
  const hasInitializedRef = useRef(false);

  const [activeTemplate, setActiveTemplate] = useState<DrawingTemplate>(drawingTemplates[0]);
  const [activeTool, setActiveTool] = useState<ToolId>("watercolor");
  const [selectedColor, setSelectedColor] = useState("#ed5b45");
  const [brushSize, setBrushSize] = useState(28);
  const [opacity, setOpacity] = useState(82);
  const [shapeFill, setShapeFill] = useState(false);
  const [canvasSize, setCanvasSize] = useState<CanvasSize>(CANVAS_SIZES[0]);
  const [zoom, setZoom] = useState(0.72);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<(typeof templateCategories)[number]>("All");
  const [mixA, setMixA] = useState("#f4cc48");
  const [mixB, setMixB] = useState("#4d55a5");
  const [mixRatio, setMixRatio] = useState(50);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [notice, setNotice] = useState("Ready to paint");
  const [studioPalette, setStudioPalette] = useState(PALETTE_COLORS);
  const [savedTemplateIds, setSavedTemplateIds] = useState<Set<string>>(() => new Set());
  const [isRestored, setIsRestored] = useState(false);
  const [wallPreviewUrl, setWallPreviewUrl] = useState<string | null>(null);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [referencePainting, setReferencePainting] = useState<MasterpieceReference | null>(null);
  const [referenceZoom, setReferenceZoom] = useState(1);

  const announce = useCallback((message: string) => {
    setNotice(message);
  }, []);

  const saveBlobToCloud = useCallback(async (artwork: StoredArtwork, title: string) => {
    if (!isSignedIn) return false;
    const response = await fetch(`/api/artworks/${encodeURIComponent(artwork.templateId)}`, {
      method: "PUT",
      headers: {
        "Content-Type": "image/png",
        "X-Canvas-Width": String(artwork.width),
        "X-Canvas-Height": String(artwork.height),
        "X-Canvas-Title": title,
      },
      body: artwork.blob,
    });
    return response.ok;
  }, [isSignedIn]);

  const saveArtworkNow = useCallback(async (template = activeTemplateRef.current) => {
    const canvas = paintCanvasRef.current;
    if (!canvas || isRestoringRef.current) return;
    try {
      const artwork: StoredArtwork = {
        templateId: template.id,
        blob: await canvasToPng(canvas),
        width: canvas.width,
        height: canvas.height,
        updatedAt: Date.now(),
      };
      await putLocalArtwork(artwork);
      setSavedTemplateIds((current) => new Set(current).add(template.id));
      const cloudSaved = await saveBlobToCloud(artwork, template.title);
      announce(cloudSaved ? "Saved to your cloud studio" : "Saved on this device");
    } catch {
      announce("Autosave paused — your canvas remains open");
    }
  }, [announce, saveBlobToCloud]);

  const queueArtworkSave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    const template = activeTemplateRef.current;
    saveTimerRef.current = setTimeout(() => {
      void saveArtworkNow(template);
    }, 300);
  }, [saveArtworkNow]);

  const updateHistoryControls = useCallback(() => {
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
  }, []);

  const resetHistory = useCallback(() => {
    const canvas = paintCanvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    historyRef.current = [context.getImageData(0, 0, canvas.width, canvas.height)];
    historyIndexRef.current = 0;
    updateHistoryControls();
  }, [updateHistoryControls]);

  const commitSnapshot = useCallback(() => {
    const canvas = paintCanvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const nextHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
    nextHistory.push(context.getImageData(0, 0, canvas.width, canvas.height));
    if (nextHistory.length > 18) nextHistory.shift();
    historyRef.current = nextHistory;
    historyIndexRef.current = nextHistory.length - 1;
    updateHistoryControls();
    queueArtworkSave();
  }, [queueArtworkSave, updateHistoryControls]);

  const restoreArtwork = useCallback(async (template: DrawingTemplate, fallbackSize: CanvasSize) => {
    const paintCanvas = paintCanvasRef.current;
    const guideCanvas = guideCanvasRef.current;
    if (!paintCanvas || !guideCanvas) return;
    const token = restoreTokenRef.current + 1;
    restoreTokenRef.current = token;
    isRestoringRef.current = true;
    announce(`Restoring ${template.title}…`);

    try {
      const localArtwork = await getLocalArtwork(template.id).catch(() => undefined);
      let cloudArtwork: StoredArtwork | undefined;
      if (isSignedIn) {
        cloudArtwork = await fetch(`/api/artworks/${encodeURIComponent(template.id)}`, { cache: "no-store" })
          .then(async (response) => response.ok ? {
            templateId: template.id,
            blob: await response.blob(),
            width: Number(response.headers.get("X-Canvas-Width")) || fallbackSize.width,
            height: Number(response.headers.get("X-Canvas-Height")) || fallbackSize.height,
            updatedAt: Date.parse(response.headers.get("X-Saved-At") || "") || Date.now(),
          } : undefined)
          .catch(() => undefined);
      }
      if (token !== restoreTokenRef.current) return;

      const artwork = cloudArtwork && (!localArtwork || cloudArtwork.updatedAt > localArtwork.updatedAt)
        ? cloudArtwork
        : localArtwork;
      const restoredSize = artwork
        ? CANVAS_SIZES.find((size) => size.width === artwork.width && size.height === artwork.height) ?? {
            id: "restored",
            label: `Restored · ${artwork.width} × ${artwork.height}`,
            width: artwork.width,
            height: artwork.height,
          }
        : fallbackSize;

      paintCanvas.width = restoredSize.width;
      paintCanvas.height = restoredSize.height;
      guideCanvas.width = restoredSize.width;
      guideCanvas.height = restoredSize.height;
      const context = paintCanvas.getContext("2d");
      context?.clearRect(0, 0, paintCanvas.width, paintCanvas.height);
      if (artwork && context) {
        const bitmap = await createImageBitmap(artwork.blob);
        context.drawImage(bitmap, 0, 0, paintCanvas.width, paintCanvas.height);
        bitmap.close();
        await putLocalArtwork(artwork);
        setSavedTemplateIds((current) => new Set(current).add(template.id));
        if (localArtwork && (!cloudArtwork || localArtwork.updatedAt > cloudArtwork.updatedAt)) {
          void saveBlobToCloud(localArtwork, template.title);
        }
      }
      drawGuide(guideCanvas, template);
      canvasSizeRef.current = restoredSize;
      setCanvasSize(restoredSize);
      resetHistory();
      announce(artwork ? `${template.title} restored` : `${template.title} ready`);
    } catch {
      paintCanvas.width = fallbackSize.width;
      paintCanvas.height = fallbackSize.height;
      guideCanvas.width = fallbackSize.width;
      guideCanvas.height = fallbackSize.height;
      drawGuide(guideCanvas, template);
      canvasSizeRef.current = fallbackSize;
      setCanvasSize(fallbackSize);
      resetHistory();
      announce(`${template.title} ready — cloud sync unavailable`);
    } finally {
      isRestoringRef.current = false;
    }
  }, [announce, isSignedIn, resetHistory, saveBlobToCloud]);

  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;
    const initialize = async () => {
      let template = drawingTemplates[0];
      let size = CANVAS_SIZES[0];
      try {
        const savedSettings = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}") as {
          templateId?: string;
          tool?: ToolId;
          color?: string;
          brushSize?: number;
          opacity?: number;
          zoom?: number;
          canvasSizeId?: string;
        };
        template = savedSettings.templateId === blankTemplate.id
          ? blankTemplate
          : drawingTemplates.find((item) => item.id === savedSettings.templateId) ?? template;
        size = CANVAS_SIZES.find((item) => item.id === savedSettings.canvasSizeId) ?? size;
        if (savedSettings.tool && TOOLS.some((tool) => tool.id === savedSettings.tool)) setActiveTool(savedSettings.tool);
        if (savedSettings.color && /^#[0-9a-f]{6}$/i.test(savedSettings.color)) setSelectedColor(savedSettings.color);
        if (savedSettings.brushSize) setBrushSize(savedSettings.brushSize);
        if (savedSettings.opacity) setOpacity(savedSettings.opacity);
        if (savedSettings.zoom) setZoom(savedSettings.zoom);
      } catch {
        // Corrupt settings should never block access to the canvas.
      }
      activeTemplateRef.current = template;
      canvasSizeRef.current = size;
      setActiveTemplate(template);
      setCanvasSize(size);
      await restoreArtwork(template, size);
      const savedIds = await listLocalArtworkIds().catch(() => []);
      setSavedTemplateIds(new Set(savedIds));
      setIsRestored(true);
    };
    void initialize();
  }, [restoreArtwork]);

  useEffect(() => {
    if (!isRestored || !authLoaded || !isSignedIn) return;
    void restoreArtwork(activeTemplateRef.current, canvasSizeRef.current);
  }, [authLoaded, isRestored, isSignedIn, restoreArtwork]);

  useEffect(() => {
    if (!isRestored) return;
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({
      templateId: activeTemplate.id,
      tool: activeTool,
      color: selectedColor,
      brushSize,
      opacity,
      zoom,
      canvasSizeId: canvasSize.id,
    }));
  }, [activeTemplate.id, activeTool, brushSize, canvasSize.id, isRestored, opacity, selectedColor, zoom]);

  useEffect(() => {
    const guideCanvas = guideCanvasRef.current;
    if (guideCanvas) drawGuide(guideCanvas, activeTemplate);
  }, [activeTemplate]);

  const filteredTemplates = useMemo(() => {
    const term = search.trim().toLowerCase();
    return drawingTemplates.filter((template) => {
      const categoryMatches = category === "All" || template.category === category;
      const searchMatches = !term || `${template.title} ${template.category}`.toLowerCase().includes(term);
      return categoryMatches && searchMatches;
    });
  }, [category, search]);

  const mixedColor = useMemo(() => mixHex(mixA, mixB, mixRatio / 100), [mixA, mixB, mixRatio]);

  const pointFromEvent = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = paintCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const bounds = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - bounds.left) / bounds.width) * canvas.width,
      y: ((event.clientY - bounds.top) / bounds.height) * canvas.height,
    };
  }, []);

  const pointFromClient = useCallback((clientX: number, clientY: number) => {
    const canvas = paintCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const bounds = canvas.getBoundingClientRect();
    return { x: ((clientX - bounds.left) / bounds.width) * canvas.width, y: ((clientY - bounds.top) / bounds.height) * canvas.height };
  }, []);

  const drawShape = useCallback(
    (context: CanvasRenderingContext2D, start: Point, end: Point, tool = activeTool) => {
      const width = end.x - start.x;
      const height = end.y - start.y;
      context.save();
      context.strokeStyle = selectedColor;
      context.fillStyle = selectedColor;
      context.globalAlpha = opacity / 100;
      context.lineWidth = Math.max(2, brushSize * 0.34);
      context.lineCap = "round";
      context.lineJoin = "round";
      context.beginPath();

      if (tool === "line") {
        context.moveTo(start.x, start.y);
        context.lineTo(end.x, end.y);
      } else if (tool === "rectangle") {
        context.rect(start.x, start.y, width, height);
      } else if (tool === "circle") {
        const centerX = start.x + width / 2;
        const centerY = start.y + height / 2;
        context.ellipse(centerX, centerY, Math.abs(width / 2), Math.abs(height / 2), 0, 0, Math.PI * 2);
      } else if (tool === "triangle") {
        context.moveTo(start.x + width / 2, start.y);
        context.lineTo(end.x, end.y);
        context.lineTo(start.x, end.y);
        context.closePath();
      } else if (tool === "star") {
        const centerX = start.x + width / 2;
        const centerY = start.y + height / 2;
        const outer = Math.max(Math.abs(width), Math.abs(height)) / 2;
        const inner = outer * 0.44;
        for (let index = 0; index < 10; index += 1) {
          const radius = index % 2 === 0 ? outer : inner;
          const angle = -Math.PI / 2 + (index * Math.PI) / 5;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          if (index === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        }
        context.closePath();
      } else if (tool === "heart") {
        const left = Math.min(start.x, end.x);
        const top = Math.min(start.y, end.y);
        const heartWidth = Math.abs(width);
        const heartHeight = Math.abs(height);
        context.moveTo(left + heartWidth / 2, top + heartHeight);
        context.bezierCurveTo(left, top + heartHeight * 0.68, left, top + heartHeight * 0.24, left + heartWidth * 0.25, top + heartHeight * 0.22);
        context.bezierCurveTo(left + heartWidth * 0.42, top + heartHeight * 0.2, left + heartWidth * 0.5, top + heartHeight * 0.34, left + heartWidth * 0.5, top + heartHeight * 0.34);
        context.bezierCurveTo(left + heartWidth * 0.5, top + heartHeight * 0.34, left + heartWidth * 0.58, top + heartHeight * 0.2, left + heartWidth * 0.75, top + heartHeight * 0.22);
        context.bezierCurveTo(left + heartWidth, top + heartHeight * 0.24, left + heartWidth, top + heartHeight * 0.68, left + heartWidth / 2, top + heartHeight);
        context.closePath();
      }

      if (shapeFill && tool !== "line") context.fill();
      context.stroke();
      context.restore();
    },
    [activeTool, brushSize, opacity, selectedColor, shapeFill],
  );

  const handleShapeDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    const shape = event.dataTransfer.getData("application/x-pigmenta-shape") as ToolId;
    if (!isShapeTool(shape)) return;
    event.preventDefault();
    const canvas = paintCanvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const point = pointFromClient(event.clientX, event.clientY);
    const halfSize = Math.max(36, brushSize * 2.2);
    drawShape(context, { x: point.x - halfSize, y: point.y - halfSize }, { x: point.x + halfSize, y: point.y + halfSize }, shape);
    commitSnapshot();
    announce(`${shape} placed on canvas`);
  }, [announce, brushSize, commitSnapshot, drawShape, pointFromClient]);

  const drawFreehandSegment = useCallback(
    (context: CanvasRenderingContext2D, from: Point, to: Point, pressure: number) => {
      const effectivePressure = pressure > 0 ? pressure : 0.5;
      const pressureWidth = brushSize * (0.72 + effectivePressure * 0.56);
      context.save();
      context.lineCap = "round";
      context.lineJoin = "round";
      context.strokeStyle = selectedColor;
      context.fillStyle = selectedColor;
      context.globalAlpha = opacity / 100;

      if (activeTool === "eraser") {
        context.globalCompositeOperation = "destination-out";
        context.lineWidth = brushSize * 1.55;
      } else if (activeTool === "pencil") {
        context.lineWidth = Math.max(1, pressureWidth * 0.55);
        context.globalAlpha *= 0.72;
      } else if (activeTool === "ink") {
        context.lineWidth = Math.max(1.4, pressureWidth * 0.42);
      } else if (activeTool === "marker") {
        context.lineWidth = pressureWidth * 1.35;
        context.globalAlpha *= 0.28;
        context.globalCompositeOperation = "multiply";
      } else if (activeTool === "watercolor") {
        context.globalCompositeOperation = "multiply";
        for (let layer = 0; layer < 6; layer += 1) {
          context.beginPath();
          context.globalAlpha = (opacity / 100) * 0.055;
          context.lineWidth = pressureWidth * (1.7 + layer * 0.08);
          const jitterX = (Math.random() - 0.5) * brushSize * 0.22;
          const jitterY = (Math.random() - 0.5) * brushSize * 0.22;
          context.moveTo(from.x + jitterX, from.y + jitterY);
          context.quadraticCurveTo(from.x, from.y, to.x + jitterX, to.y + jitterY);
          context.stroke();
        }
        context.restore();
        return;
      } else if (activeTool === "crayon") {
        context.globalAlpha *= 0.44;
        for (let grain = 0; grain < 7; grain += 1) {
          context.beginPath();
          context.lineWidth = Math.max(1, pressureWidth * (0.08 + Math.random() * 0.1));
          const jitterX = (Math.random() - 0.5) * brushSize * 0.8;
          const jitterY = (Math.random() - 0.5) * brushSize * 0.8;
          context.moveTo(from.x + jitterX, from.y + jitterY);
          context.lineTo(to.x + jitterX, to.y + jitterY);
          context.stroke();
        }
        context.restore();
        return;
      } else if (activeTool === "spray") {
        const radius = brushSize * 1.4;
        const dots = Math.max(18, Math.round(brushSize * 1.5));
        for (let dot = 0; dot < dots; dot += 1) {
          const angle = Math.random() * Math.PI * 2;
          const distance = Math.sqrt(Math.random()) * radius;
          const x = to.x + Math.cos(angle) * distance;
          const y = to.y + Math.sin(angle) * distance;
          context.globalAlpha = (opacity / 100) * (0.18 + Math.random() * 0.34);
          context.beginPath();
          context.arc(x, y, Math.max(0.7, brushSize * 0.045), 0, Math.PI * 2);
          context.fill();
        }
        context.restore();
        return;
      } else {
        context.lineWidth = pressureWidth;
      }

      context.beginPath();
      context.moveTo(from.x, from.y);
      const midX = (from.x + to.x) / 2;
      const midY = (from.y + to.y) / 2;
      context.quadraticCurveTo(from.x, from.y, midX, midY);
      context.stroke();
      context.restore();
    },
    [activeTool, brushSize, opacity, selectedColor],
  );

  const pickColor = useCallback(
    (point: Point) => {
      const paintCanvas = paintCanvasRef.current;
      const guideCanvas = guideCanvasRef.current;
      if (!paintCanvas || !guideCanvas) return;
      const sample = document.createElement("canvas");
      sample.width = paintCanvas.width;
      sample.height = paintCanvas.height;
      const sampleContext = sample.getContext("2d");
      if (!sampleContext) return;
      sampleContext.fillStyle = "#ffffff";
      sampleContext.fillRect(0, 0, sample.width, sample.height);
      sampleContext.drawImage(paintCanvas, 0, 0);
      sampleContext.drawImage(guideCanvas, 0, 0);
      const pixel = sampleContext.getImageData(Math.floor(point.x), Math.floor(point.y), 1, 1).data;
      const nextColor = rgbToHex(pixel[0], pixel[1], pixel[2]);
      setSelectedColor(nextColor);
      announce(`Picked ${nextColor.toUpperCase()}`);
    },
    [announce],
  );

  const floodFill = useCallback(
    (point: Point) => {
      const canvas = paintCanvasRef.current;
      const guide = guideCanvasRef.current;
      const context = canvas?.getContext("2d", { willReadFrequently: true });
      const guideContext = guide?.getContext("2d", { willReadFrequently: true });
      if (!canvas || !guide || !context || !guideContext) return;

      const width = canvas.width;
      const height = canvas.height;
      const startX = Math.max(0, Math.min(width - 1, Math.floor(point.x)));
      const startY = Math.max(0, Math.min(height - 1, Math.floor(point.y)));
      const image = context.getImageData(0, 0, width, height);
      const guideImage = guideContext.getImageData(0, 0, width, height);
      const startIndex = (startY * width + startX) * 4;
      if (guideImage.data[startIndex + 3] > 55) return;

      const target = image.data[startIndex + 3] < 8
        ? [255, 255, 255, 0]
        : [image.data[startIndex], image.data[startIndex + 1], image.data[startIndex + 2], image.data[startIndex + 3]];
      const fill = hexToRgb(selectedColor);
      const fillAlpha = Math.round((opacity / 100) * 255);
      if (
        Math.abs(target[0] - fill.r) < 4 &&
        Math.abs(target[1] - fill.g) < 4 &&
        Math.abs(target[2] - fill.b) < 4 &&
        Math.abs(target[3] - fillAlpha) < 4
      ) return;

      const tolerance = 34;
      const stack = new Int32Array(width * height);
      let top = 0;
      const matches = (pixelIndex: number) => {
        if (guideImage.data[pixelIndex + 3] > 55) return false;
        const alpha = image.data[pixelIndex + 3];
        const red = alpha < 8 ? 255 : image.data[pixelIndex];
        const green = alpha < 8 ? 255 : image.data[pixelIndex + 1];
        const blue = alpha < 8 ? 255 : image.data[pixelIndex + 2];
        const targetAlpha = target[3] < 8 ? 0 : alpha;
        return (
          Math.abs(red - target[0]) <= tolerance &&
          Math.abs(green - target[1]) <= tolerance &&
          Math.abs(blue - target[2]) <= tolerance &&
          Math.abs(targetAlpha - target[3]) <= tolerance
        );
      };
      const colorPixel = (pixelIndex: number) => {
        image.data[pixelIndex] = fill.r;
        image.data[pixelIndex + 1] = fill.g;
        image.data[pixelIndex + 2] = fill.b;
        image.data[pixelIndex + 3] = fillAlpha;
      };

      colorPixel(startIndex);
      stack[top] = startY * width + startX;
      top += 1;
      while (top > 0) {
        top -= 1;
        const pixel = stack[top];
        const x = pixel % width;
        const y = Math.floor(pixel / width);
        const neighbors = [
          x > 0 ? pixel - 1 : -1,
          x < width - 1 ? pixel + 1 : -1,
          y > 0 ? pixel - width : -1,
          y < height - 1 ? pixel + width : -1,
        ];
        neighbors.forEach((neighbor) => {
          if (neighbor < 0) return;
          const pixelIndex = neighbor * 4;
          if (!matches(pixelIndex)) return;
          colorPixel(pixelIndex);
          stack[top] = neighbor;
          top += 1;
        });
      }

      context.putImageData(image, 0, 0);
      commitSnapshot();
      announce("Area filled");
    },
    [announce, commitSnapshot, opacity, selectedColor],
  );

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      event.preventDefault();
      const canvas = paintCanvasRef.current;
      const context = canvas?.getContext("2d");
      if (!canvas || !context) return;
      const point = pointFromEvent(event);
      if (activeTool === "fill") {
        floodFill(point);
        return;
      }
      if (activeTool === "picker") {
        pickColor(point);
        return;
      }
      canvas.setPointerCapture(event.pointerId);
      isDrawingRef.current = true;
      lastPointRef.current = point;
      startPointRef.current = point;
      if (isShapeTool(activeTool)) {
        shapeBaseRef.current = context.getImageData(0, 0, canvas.width, canvas.height);
      } else {
        drawFreehandSegment(context, point, { x: point.x + 0.1, y: point.y + 0.1 }, event.pressure);
      }
    },
    [activeTool, drawFreehandSegment, floodFill, pickColor, pointFromEvent],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawingRef.current) return;
      event.preventDefault();
      const canvas = paintCanvasRef.current;
      const context = canvas?.getContext("2d");
      if (!canvas || !context) return;
      const point = pointFromEvent(event);
      if (isShapeTool(activeTool) && shapeBaseRef.current) {
        context.putImageData(shapeBaseRef.current, 0, 0);
        drawShape(context, startPointRef.current, point);
      } else {
        drawFreehandSegment(context, lastPointRef.current, point, event.pressure);
        lastPointRef.current = point;
      }
    },
    [activeTool, drawFreehandSegment, drawShape, pointFromEvent],
  );

  const handlePointerUp = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawingRef.current) return;
      isDrawingRef.current = false;
      const canvas = paintCanvasRef.current;
      if (canvas?.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
      shapeBaseRef.current = null;
      commitSnapshot();
      announce("Stroke added");
    },
    [announce, commitSnapshot],
  );

  const undo = useCallback(() => {
    const canvas = paintCanvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context || historyIndexRef.current <= 0) return;
    historyIndexRef.current -= 1;
    context.putImageData(historyRef.current[historyIndexRef.current], 0, 0);
    updateHistoryControls();
    queueArtworkSave();
    announce("Undid last mark");
  }, [announce, queueArtworkSave, updateHistoryControls]);

  const redo = useCallback(() => {
    const canvas = paintCanvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context || historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current += 1;
    context.putImageData(historyRef.current[historyIndexRef.current], 0, 0);
    updateHistoryControls();
    queueArtworkSave();
    announce("Restored mark");
  }, [announce, queueArtworkSave, updateHistoryControls]);

  const clearPainting = useCallback(() => {
    const canvas = paintCanvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    commitSnapshot();
    announce("Canvas cleared");
  }, [announce, commitSnapshot]);

  const chooseTemplate = useCallback(
    async (template: DrawingTemplate) => {
      if (template.id === activeTemplateRef.current.id) return;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      await saveArtworkNow(activeTemplateRef.current);
      activeTemplateRef.current = template;
      setActiveTemplate(template);
      await restoreArtwork(template, canvasSizeRef.current);
    },
    [restoreArtwork, saveArtworkNow],
  );

  const resizeCanvas = useCallback(
    (nextSize: CanvasSize) => {
      const paintCanvas = paintCanvasRef.current;
      const guideCanvas = guideCanvasRef.current;
      if (!paintCanvas || !guideCanvas) return;
      const copy = document.createElement("canvas");
      copy.width = paintCanvas.width;
      copy.height = paintCanvas.height;
      copy.getContext("2d")?.drawImage(paintCanvas, 0, 0);
      paintCanvas.width = nextSize.width;
      paintCanvas.height = nextSize.height;
      guideCanvas.width = nextSize.width;
      guideCanvas.height = nextSize.height;
      paintCanvas.getContext("2d")?.drawImage(copy, 0, 0, nextSize.width, nextSize.height);
      drawGuide(guideCanvas, activeTemplate);
      canvasSizeRef.current = nextSize;
      setCanvasSize(nextSize);
      resetHistory();
      queueArtworkSave();
      announce(`Canvas resized to ${nextSize.width} × ${nextSize.height}`);
    },
    [activeTemplate, announce, queueArtworkSave, resetHistory],
  );

  const composeArtwork = useCallback(() => {
    const paintCanvas = paintCanvasRef.current;
    const guideCanvas = guideCanvasRef.current;
    if (!paintCanvas || !guideCanvas) return null;
    const output = document.createElement("canvas");
    output.width = paintCanvas.width;
    output.height = paintCanvas.height;
    const context = output.getContext("2d");
    if (!context) return null;
    context.fillStyle = "#fffdf8";
    context.fillRect(0, 0, output.width, output.height);
    context.drawImage(paintCanvas, 0, 0);
    context.drawImage(guideCanvas, 0, 0);
    return output;
  }, []);

  const downloadArtwork = useCallback(() => {
    const output = composeArtwork();
    if (!output) return;
    output.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `pigmenta-${activeTemplate.id}.png`;
      link.click();
      URL.revokeObjectURL(url);
      announce("High-resolution PNG downloaded");
    }, "image/png");
  }, [activeTemplate.id, announce, composeArtwork]);

  const printArtwork = useCallback(() => {
    const output = composeArtwork();
    if (!output) return;
    const printWindow = window.open("", "pigmenta-print", "width=900,height=900");
    if (!printWindow) {
      announce("Allow pop-ups to print your artwork");
      return;
    }
    const imageUrl = output.toDataURL("image/png");
    printWindow.document.write(`<!doctype html><html><head><title>Print ${activeTemplate.title}</title><style>@page{margin:12mm}body{margin:0;display:grid;place-items:center;min-height:100vh}img{max-width:100%;max-height:calc(100vh - 24mm);object-fit:contain}</style></head><body><img src="${imageUrl}" alt="${activeTemplate.title}"><script>window.onload=()=>window.print()</script></body></html>`);
    printWindow.document.close();
    announce("Print view opened");
  }, [activeTemplate.title, announce, composeArtwork]);

  const openWallPreview = useCallback(() => {
    const output = composeArtwork();
    if (!output) return;
    setWallPreviewUrl(output.toDataURL("image/jpeg", 0.9));
    announce("Room preview opened");
  }, [announce, composeArtwork]);

  const openTemplateById = useCallback((templateId: string) => {
    const template = drawingTemplates.find((item) => item.id === templateId);
    if (template) void chooseTemplate(template);
  }, [chooseTemplate]);

  const openReference = useCallback((painting: MasterpieceReference) => {
    if (activeTemplateRef.current.id !== blankTemplate.id) void chooseTemplate(blankTemplate);
    setReferenceZoom(1);
    setReferencePainting(painting);
    announce(`${painting.title} opened beside the canvas`);
  }, [announce, chooseTemplate]);

  const useReferencePalette = useCallback((colors: string[]) => {
    setStudioPalette((current) => [
      ...colors,
      ...current.filter((color) => !colors.includes(color)),
    ].slice(0, 48));
    setSelectedColor(colors[0]);
    announce("Masterpiece palette added");
  }, [announce]);

  useEffect(() => {
    const saveBeforeLeaving = () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      void saveArtworkNow(activeTemplateRef.current);
    };
    window.addEventListener("pagehide", saveBeforeLeaving);
    return () => window.removeEventListener("pagehide", saveBeforeLeaving);
  }, [saveArtworkNow]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.tagName === "INPUT" || target?.tagName === "SELECT") return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
      } else if (event.key.toLowerCase() === "b") setActiveTool("watercolor");
      else if (event.key.toLowerCase() === "e") setActiveTool("eraser");
      else if (event.key.toLowerCase() === "g") setActiveTool("fill");
      else if (event.key === "[") setBrushSize((size) => Math.max(1, size - 2));
      else if (event.key === "]") setBrushSize((size) => Math.min(120, size + 2));
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [redo, undo]);

  const paintTools = TOOLS.filter((tool) => tool.group === "paint");
  const shapeTools = TOOLS.filter((tool) => tool.group === "shape");
  const selectedTool = TOOLS.find((tool) => tool.id === activeTool);
  const SelectedToolIcon = selectedTool?.icon ?? Brush;
  const displayWidth = Math.round(Math.min(canvasSize.width, 760) * zoom);

  return (
    <main className="studio-app">
      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true"><span /><span /><span /></div>
          <div>
            <p className="brand-name">PIGMENTA</p>
            <p className="brand-tagline">Play outside the lines.</p>
          </div>
        </div>
        <nav className="topnav" aria-label="Primary navigation">
          <a className="is-current" href="#studio">Studio</a>
          <a href="#gallery">{drawingTemplates.length} outlines</a>
          <a href="#learn">Learn</a>
        </nav>
        <div className="top-actions">
          <Show when="signed-out">
            <span className="save-state"><span /> Saved on this device</span>
            <SignInButton mode="modal">
              <button className="button button-ghost" type="button"><Cloud size={16} /> Enable cloud sync</button>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <span className="save-state"><span /> Cloud studio</span>
            <UserButton />
          </Show>
          <button className="button button-ghost" type="button" onClick={openWallPreview}>
            <Eye size={16} /> View on wall
          </button>
          <button className="button button-ghost" type="button" onClick={printArtwork}>
            <Printer size={16} /> Print
          </button>
          <button className="button button-primary" type="button" onClick={downloadArtwork}>
            <Download size={16} /> Download PNG
          </button>
        </div>
      </header>

      <section className={`workspace ${leftSidebarOpen ? "has-left-sidebar" : "no-left-sidebar"} ${rightSidebarOpen ? "has-right-sidebar" : "no-right-sidebar"} ${referencePainting ? "has-reference" : ""}`} id="studio">
        {!leftSidebarOpen ? <button className="sidebar-reopen sidebar-reopen-left" type="button" onClick={() => setLeftSidebarOpen(true)} aria-label="Open drawing library" title="Open drawing library"><PanelLeft size={16} /></button> : null}
        {leftSidebarOpen ? <aside className="template-panel" id="gallery">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Choose a structure</p>
              <h1>Coloring library</h1>
            </div>
            <button className="panel-toggle" type="button" onClick={() => setLeftSidebarOpen(false)} aria-label="Close drawing library" title="Close drawing library"><PanelLeftClose size={16} /></button>
            <span className="count-pill">{drawingTemplates.length}</span>
          </div>

          <button
            type="button"
            className={`blank-canvas-card ${activeTemplate.id === blankTemplate.id ? "is-selected" : ""}`}
            onClick={() => chooseTemplate(blankTemplate)}
          >
            <span className="blank-icon"><PenLine size={19} /></span>
            <span><strong>Draw your own</strong><small>Start with a clean canvas</small></span>
            <span className="new-pill">Custom</span>
          </button>

          <MasterpieceGallery onOpenTemplate={openTemplateById} onUsePalette={useReferencePalette} onOpenReference={openReference} />

          <label className="search-box">
            <Search size={16} aria-hidden="true" />
            <span className="sr-only">Search coloring templates</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search the library" />
          </label>

          <div className="category-row" aria-label="Template categories">
            {templateCategories.map((item) => (
              <button
                type="button"
                key={item}
                className={category === item ? "is-active" : ""}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="template-grid">
            {filteredTemplates.map((template) => (
              <button
                type="button"
                className={`template-card ${activeTemplate.id === template.id ? "is-selected" : ""}`}
                key={template.id}
                onClick={() => chooseTemplate(template)}
                aria-pressed={activeTemplate.id === template.id}
              >
                <span className="preview-wrap"><TemplatePreview template={template} /></span>
                <span className="template-meta">
                  <strong>{template.title}</strong>
                  <small>{template.category} · {template.level}</small>
                </span>
                {savedTemplateIds.has(template.id) ? <span className="saved-artwork-dot" title="Saved artwork"><Cloud size={10} /></span> : null}
                {activeTemplate.id === template.id ? <span className="selected-check"><Check size={12} /></span> : null}
              </button>
            ))}
          </div>
          {filteredTemplates.length === 0 ? <p className="empty-state">No outlines match that search.</p> : null}
        </aside> : null}

        <section className="canvas-column">
          {!rightSidebarOpen ? <button className="sidebar-reopen sidebar-reopen-right" type="button" onClick={() => setRightSidebarOpen(true)} aria-label="Open tools sidebar" title="Open tools sidebar"><PanelRight size={16} /></button> : null}
          <div className="document-bar">
            <div className="document-title">
              <span className="document-icon"><ImageIcon size={16} /></span>
              <div><strong>{activeTemplate.title}</strong><small>{canvasSize.width} × {canvasSize.height}px</small></div>
            </div>
            <div className="history-actions">
              <button type="button" onClick={undo} disabled={!canUndo} aria-label="Undo" title="Undo · Ctrl/⌘ Z"><Undo2 size={18} /></button>
              <button type="button" onClick={redo} disabled={!canRedo} aria-label="Redo" title="Redo · Ctrl/⌘ Shift Z"><Redo2 size={18} /></button>
              <span className="bar-divider" />
              <button type="button" onClick={clearPainting} aria-label="Clear paint" title="Clear paint"><Trash2 size={17} /></button>
            </div>
          </div>

          <div className="tool-dock" aria-label="Painting tools">
            <div className="tool-scroll">
              {paintTools.map((tool) => <ToolButton key={tool.id} tool={tool} active={tool.id === activeTool} onClick={() => setActiveTool(tool.id)} />)}
              <span className="tool-divider" />
              {shapeTools.map((tool) => <ToolButton key={tool.id} tool={tool} active={tool.id === activeTool} onClick={() => setActiveTool(tool.id)} draggable onDragStart={(event) => { event.dataTransfer.effectAllowed = "copy"; event.dataTransfer.setData("application/x-pigmenta-shape", tool.id); }} />)}
            </div>
          </div>

          <div className="canvas-stage" onDragOver={(event) => { if (event.dataTransfer.types.includes("application/x-pigmenta-shape")) event.preventDefault(); }} onDrop={handleShapeDrop}>
            <div className="stage-note">
              <SelectedToolIcon size={14} />
              <span>{selectedTool?.label}</span>
              <span>·</span>
              <span>{brushSize}px</span>
              <span>·</span>
              <span>{opacity}% flow</span>
            </div>
            <div
              className="canvas-stack"
              style={{ width: `${displayWidth}px`, aspectRatio: `${canvasSize.width} / ${canvasSize.height}` }}
            >
              <canvas
                ref={paintCanvasRef}
                className="paint-canvas"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                aria-label={`Interactive painting canvas with ${activeTemplate.title} guide`}
              />
              <canvas ref={guideCanvasRef} className="guide-canvas" aria-hidden="true" />
            </div>
          </div>

          <div className="canvas-footer">
            <label className="size-select">
              <Grid2X2 size={15} />
              <span className="sr-only">Canvas size</span>
              <select
                value={canvasSize.id}
                onChange={(event) => {
                  const next = CANVAS_SIZES.find((size) => size.id === event.target.value);
                  if (next) resizeCanvas(next);
                }}
              >
                {!CANVAS_SIZES.some((size) => size.id === canvasSize.id) && (
                  <option value={canvasSize.id}>{canvasSize.label}</option>
                )}
                {CANVAS_SIZES.map((size) => <option key={size.id} value={size.id}>{size.label}</option>)}
              </select>
              <ChevronDown size={14} aria-hidden="true" />
            </label>
            <p className="status-line" aria-live="polite"><span /> {notice}</p>
            <div className="zoom-control">
              <button type="button" onClick={() => setZoom((value) => Math.max(0.45, value - 0.1))} aria-label="Zoom out"><ZoomOut size={16} /></button>
              <span>{Math.round(zoom * 100)}%</span>
              <button type="button" onClick={() => setZoom((value) => Math.min(1.35, value + 0.1))} aria-label="Zoom in"><ZoomIn size={16} /></button>
              <button type="button" onClick={() => setZoom(0.72)} aria-label="Reset zoom"><RotateCcw size={14} /></button>
            </div>
          </div>
        </section>

        {referencePainting ? (
          <aside className="reference-panel" aria-label="Painting reference">
            <div className="reference-panel-header">
              <div><span>Copy beside canvas</span><strong>{referencePainting.title}</strong><small>{referencePainting.artist} · {referencePainting.date}</small></div>
              <div className="reference-header-actions"><div className="reference-zoom"><button type="button" onClick={() => setReferenceZoom((zoom) => Math.max(0.65, zoom - 0.15))} aria-label="Zoom reference out">−</button><span>{Math.round(referenceZoom * 100)}%</span><button type="button" onClick={() => setReferenceZoom((zoom) => Math.min(2.4, zoom + 0.15))} aria-label="Zoom reference in">+</button></div><button type="button" className="modal-close is-static" onClick={() => setReferencePainting(null)} aria-label="Close painting reference">×</button></div>
            </div>
            <div className="reference-panel-image"><img src={referencePainting.image} alt={`${referencePainting.title} by ${referencePainting.artist}`} style={{ transform: `scale(${referenceZoom})` }} /></div>
            <p className="reference-panel-lesson">{referencePainting.lesson}</p>
            <button type="button" className="button button-ghost reference-source" onClick={() => window.open(referencePainting.sourceUrl, "_blank", "noopener,noreferrer")}>View source ↗</button>
          </aside>
        ) : null}

        {rightSidebarOpen ? <aside className="inspector-panel">
          <section className="inspector-section color-section">
            <div className="section-title"><span><Palette size={17} /> Color</span><div className="section-title-actions"><small>16.7M sRGB colors</small><button className="panel-toggle" type="button" onClick={() => setRightSidebarOpen(false)} aria-label="Close tools sidebar" title="Close tools sidebar"><PanelRightClose size={16} /></button></div></div>
            <div className="color-hero">
              <label className="color-well" style={{ background: selectedColor }}>
                <input
                  type="color"
                  value={selectedColor}
                  onChange={(event) => setSelectedColor(event.target.value)}
                  aria-label="Choose any color"
                />
                <Pipette size={18} />
              </label>
              <label className="hex-field">
                <span>HEX</span>
                <input
                  value={selectedColor.toUpperCase()}
                  onChange={(event) => {
                    const value = event.target.value;
                    if (/^#[0-9a-fA-F]{6}$/.test(value)) setSelectedColor(value);
                  }}
                  maxLength={7}
                  aria-label="Hex color"
                />
              </label>
            </div>
            <div className="swatch-grid" aria-label="Artist palette">
              {studioPalette.map((color) => (
                <button
                  type="button"
                  key={color}
                  className={selectedColor.toLowerCase() === color ? "is-selected" : ""}
                  style={{ backgroundColor: color }}
                  aria-label={`Use color ${color}`}
                  onClick={() => setSelectedColor(color)}
                >{selectedColor.toLowerCase() === color ? <Check size={12} /> : null}</button>
              ))}
            </div>
          </section>

          <section className="inspector-section">
            <div className="section-title"><span><Brush size={17} /> Brush feel</span><small>Pressure-aware</small></div>
            <label className="range-field">
              <span>Size <output>{brushSize}px</output></span>
              <input type="range" min="1" max="120" value={brushSize} onChange={(event) => setBrushSize(Number(event.target.value))} />
            </label>
            <label className="range-field">
              <span>Flow <output>{opacity}%</output></span>
              <input type="range" min="5" max="100" value={opacity} onChange={(event) => setOpacity(Number(event.target.value))} />
            </label>
            {isShapeTool(activeTool) ? (
              <div className="segmented-control" aria-label="Shape appearance">
                <button type="button" className={!shapeFill ? "is-active" : ""} onClick={() => setShapeFill(false)}>Outline</button>
                <button type="button" className={shapeFill ? "is-active" : ""} onClick={() => setShapeFill(true)}>Filled</button>
              </div>
            ) : null}
            <p className="shortcut-hint"><kbd>[</kbd><kbd>]</kbd> resize · <kbd>B</kbd> brush · <kbd>E</kbd> erase · <kbd>G</kbd> fill</p>
          </section>

          <section className="inspector-section mix-section">
            <div className="section-title"><span><Droplets size={17} /> Mix lab</span><small>Digital study</small></div>
            <div className="mix-pots">
              <label style={{ backgroundColor: mixA }}><input type="color" value={mixA} onChange={(event) => setMixA(event.target.value)} aria-label="First mix color" /></label>
              <span>+</span>
              <label style={{ backgroundColor: mixB }}><input type="color" value={mixB} onChange={(event) => setMixB(event.target.value)} aria-label="Second mix color" /></label>
              <span>=</span>
              <button type="button" className="mix-result" style={{ backgroundColor: mixedColor }} onClick={() => setSelectedColor(mixedColor)} aria-label={`Use mixed color ${mixedColor}`} />
            </div>
            <label className="range-field mix-range">
              <span>{100 - mixRatio}% <output>{mixRatio}%</output></span>
              <input type="range" min="0" max="100" value={mixRatio} onChange={(event) => setMixRatio(Number(event.target.value))} />
            </label>
            <div className="mix-steps">
              {[0, 0.2, 0.4, 0.6, 0.8, 1].map((ratio) => {
                const color = mixHex(mixA, mixB, ratio);
                return <button type="button" key={ratio} style={{ backgroundColor: color }} onClick={() => setSelectedColor(color)} aria-label={`Use mixture ${Math.round(ratio * 100)} percent`} />;
              })}
            </div>
          </section>

          <section className="inspector-section learn-section" id="learn">
            <div className="section-title"><span><Sparkles size={17} /> Studio notes</span><small>Research-backed</small></div>
            {RESEARCH_NOTES.map((note, index) => (
              <details key={note.title} open={index === 0}>
                <summary>{note.title}<ChevronDown size={14} /></summary>
                <p>{note.body}</p>
                <a href={note.href} target="_blank" rel="noreferrer">Read {note.source} →</a>
              </details>
            ))}
          </section>
        </aside> : null}
      </section>
      {wallPreviewUrl ? (
        <WallPreview
          artworkUrl={wallPreviewUrl}
          title={activeTemplate.title}
          onClose={() => setWallPreviewUrl(null)}
          onDownload={downloadArtwork}
        />
      ) : null}
    </main>
  );
}
