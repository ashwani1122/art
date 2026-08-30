import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

type RouteContext = {
  params: Promise<{ templateId: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Sign in to use cloud saves" }, { status: 401 });

  const { templateId } = await params;
  const artwork = await getDb().artwork.findUnique({
    where: { userId_templateId: { userId, templateId } },
    select: { image: true, width: true, height: true, updatedAt: true },
  });
  if (!artwork) return Response.json({ error: "No cloud save" }, { status: 404 });

  return new Response(new Uint8Array(artwork.image), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "private, no-store",
      "X-Canvas-Width": String(artwork.width),
      "X-Canvas-Height": String(artwork.height),
      "X-Saved-At": artwork.updatedAt.toISOString(),
    },
  });
}

export async function PUT(request: Request, { params }: RouteContext) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Sign in to use cloud saves" }, { status: 401 });

  const contentType = request.headers.get("content-type");
  if (contentType !== "image/png") {
    return Response.json({ error: "Only PNG canvas data is accepted" }, { status: 415 });
  }

  const width = Number(request.headers.get("x-canvas-width"));
  const height = Number(request.headers.get("x-canvas-height"));
  const title = request.headers.get("x-canvas-title")?.slice(0, 120) || "Untitled artwork";
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1 || width > 4000 || height > 4000) {
    return Response.json({ error: "Invalid canvas dimensions" }, { status: 400 });
  }

  const buffer = await request.arrayBuffer();
  if (buffer.byteLength === 0 || buffer.byteLength > MAX_IMAGE_BYTES) {
    return Response.json({ error: "Canvas image must be between 1 byte and 8 MB" }, { status: 413 });
  }

  const { templateId } = await params;
  const artwork = await getDb().artwork.upsert({
    where: { userId_templateId: { userId, templateId } },
    update: { image: new Uint8Array(buffer), width, height, title },
    create: { userId, templateId, image: new Uint8Array(buffer), width, height, title },
    select: { updatedAt: true },
  });

  return Response.json({ savedAt: artwork.updatedAt.toISOString() });
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { templateId } = await params;
  await getDb().artwork.deleteMany({ where: { userId, templateId } });
  return new Response(null, { status: 204 });
}
