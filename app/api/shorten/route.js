import { NextResponse } from "next/server";
import clientPromise, { ensureIndexes } from "@/lib/mongodb";
import { nanoid } from "nanoid";
import { ObjectId } from "mongodb";

const MAX_URL_LENGTH = 2048;
const ALLOWED_PROTOCOLS = ["http:", "https:"];

function sanitizeUrl(raw) {
  const trimmed = raw.trim();
  if (trimmed.length > MAX_URL_LENGTH) {
    return { error: `URL exceeds maximum length of ${MAX_URL_LENGTH} characters` };
  }
  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { error: "Invalid URL format" };
  }
  if (!ALLOWED_PROTOCOLS.includes(parsed.protocol)) {
    return { error: "Only HTTP and HTTPS URLs are allowed" };
  }
  return { url: parsed.href };
}

// POST /api/shorten - Create a short URL
export async function POST(request) {
  try {
    const body = await request.json();
    const rawUrl = body?.url;

    if (!rawUrl || typeof rawUrl !== "string") {
      return NextResponse.json({ error: "A valid URL string is required" }, { status: 400 });
    }

    const result = sanitizeUrl(rawUrl);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    await ensureIndexes();

    const client = await clientPromise;
    const db = client.db("url_shortener");
    const collection = db.collection("urls");

    // Duplicate detection: return existing short code if URL already shortened
    const existing = await collection.findOne({ originalUrl: result.url });
    if (existing) {
      return NextResponse.json({ code: existing.code, originalUrl: existing.originalUrl }, { status: 200 });
    }

    const code = nanoid(7);

    await collection.insertOne({
      code,
      originalUrl: result.url,
      clicks: 0,
      createdAt: new Date(),
    });

    return NextResponse.json({ code, originalUrl: result.url }, { status: 201 });
  } catch (error) {
    console.error("POST /api/shorten error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET /api/shorten - List all short URLs
export async function GET() {
  try {
    await ensureIndexes();

    const client = await clientPromise;
    const db = client.db("url_shortener");
    const collection = db.collection("urls");

    const urls = await collection
      .find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    return NextResponse.json(urls);
  } catch (error) {
    console.error("GET /api/shorten error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/shorten - Delete a URL by id
export async function DELETE(request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("url_shortener");
    const collection = db.collection("urls");

    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "URL not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/shorten error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
