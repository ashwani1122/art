# Pigmenta Studio

An interactive Next.js painting studio for detailed coloring practice, free drawing, printable art, and room-scale artwork previews.

## Included

- 124 original vector coloring templates, including 100 detailed studies, plus a blank custom canvas
- Pencil, ink, marker, watercolor, crayon, airbrush, eraser, fill, and eyedropper tools
- Line, rectangle, ellipse, triangle, star, and heart shapes with outline/filled modes
- Pressure-aware strokes, 1–120 px sizes, opacity/flow controls, undo/redo, and zoom
- Full sRGB color picker, 48-color palette, and a two-color digital mixing lab
- Automatic per-drawing IndexedDB saves with authenticated Neon Postgres sync through Clerk
- Six public-domain museum references and a generated luxury-room wall preview
- Square, portrait, A4, landscape, and story canvas sizes
- High-resolution PNG download and print view
- Research-backed studio notes with links to the original publications

## Run locally

```bash
npm install
npm run db:push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Verify

```bash
npm run lint
npm run build
```

Painting works locally without an account. Configure the variables in `.env.example` to enable Clerk accounts and Neon sync. Never commit `.env.local`, and rotate any credentials exposed in chat, logs, or source control.

# art
