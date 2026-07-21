import { NextRequest } from "next/server";
import { isGoogleVideoUrl } from "@/lib/download/youtube-stream";

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string" || !isGoogleVideoUrl(url)) {
      return Response.json({ error: "Invalid stream URL" }, { status: 400 });
    }

    const response = await fetch(url, {
      headers: {
        Accept: "*/*",
        "Accept-Language": "en-US,en;q=0.9",
        Origin: "https://www.youtube.com",
        Referer: "https://www.youtube.com/",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      },
      redirect: "follow",
    });

    if (!response.ok || !response.body) {
      return Response.json(
        { error: `Stream fetch failed (${response.status})` },
        { status: 502 }
      );
    }

    const contentType = response.headers.get("Content-Type") ?? "application/octet-stream";

    return new Response(response.body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Stream proxy error:", error);
    return Response.json({ error: "Stream proxy failed" }, { status: 500 });
  }
}
