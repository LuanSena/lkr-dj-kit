import { NextRequest } from "next/server";
import { getSpotifyStream } from "@/lib/download/stream";
import { validateUrl, sanitizeFilename } from "@/lib/download/validators";

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || !validateUrl(url, "spotify")) {
      return Response.json({ error: "Invalid URL" }, { status: 400 });
    }

    const { stream, title, contentType, extension } = await getSpotifyStream(url);
    const filename = sanitizeFilename(title);

    return new Response(stream, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}.${extension}"`,
        "X-Audio-Extension": extension,
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Spotify download error:", error);
    const message = error instanceof Error ? error.message : "Download failed";
    const status = message.includes("No YouTube match") ? 404 : 500;
    return Response.json({ error: message }, { status });
  }
}
