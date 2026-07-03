import { NextResponse } from "next/server";
import clientPromise, { ensureIndexes } from "@/lib/mongodb";

// GET /api/[code] - Redirect to original URL
export async function GET(request, { params }) {
  try {
    const { code } = await params;

    // Validate code format: only alphanumeric, hyphens, underscores
    if (!code || !/^[a-zA-Z0-9_-]+$/.test(code)) {
      return NextResponse.redirect(new URL("/404", request.url));
    }

    await ensureIndexes();

    const client = await clientPromise;
    const db = client.db("url_shortener");
    const collection = db.collection("urls");

    const urlDoc = await collection.findOne({ code });

    if (!urlDoc) {
      return NextResponse.redirect(new URL("/404", request.url));
    }

    // Increment click count (non-blocking)
    collection.updateOne({ code }, { $inc: { clicks: 1 } }).catch((err) => {
      console.error("Failed to increment clicks:", err);
    });

    return NextResponse.redirect(urlDoc.originalUrl, 301);
  } catch (error) {
    console.error("GET /api/[code] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

