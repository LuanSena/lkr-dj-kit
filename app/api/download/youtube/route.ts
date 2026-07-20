import { NextRequest } from "next/server";
import { getYouTubeStream } from "@/lib/download/stream";
import { validateUrl, sanitizeFilename } from "@/lib/download/validators";

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || !validateUrl(url, "youtube")) {
      return Response.json({ error: "Invalid URL" }, { status: 400 });
    }

    const { stream, title, contentType, extension } = await getYouTubeStream(url);
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
    console.error("YouTube download error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Download failed" },
      { status: 500 }
    );
  }
}
