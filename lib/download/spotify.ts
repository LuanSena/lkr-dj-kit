export function extractSpotifyTrackId(url: string): string | null {
  const match = url.trim().match(/spotify\.com\/track\/([a-zA-Z0-9]+)/i);
  return match?.[1] ?? null;
}

export async function getSpotifyTrackMetadata(url: string) {
  const trackId = extractSpotifyTrackId(url);
  if (!trackId) {
    throw new Error("Invalid Spotify track URL");
  }

  const response = await fetch(`https://open.spotify.com/embed/track/${trackId}`, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    },
  });

  if (!response.ok) {
    throw new Error("Could not fetch Spotify track");
  }

  const html = await response.text();
  const nextDataMatch = html.match(
    /<script id="__NEXT_DATA__"[^>]*>([^<]+)<\/script>/
  );

  if (!nextDataMatch) {
    throw new Error("Could not parse Spotify track");
  }

  const nextData = JSON.parse(nextDataMatch[1]) as {
    props?: {
      pageProps?: {
        state?: {
          data?: {
            entity?: {
              name?: string;
              title?: string;
              artists?: Array<{ name?: string }>;
            };
          };
        };
      };
    };
  };

  const entity = nextData.props?.pageProps?.state?.data?.entity;
  const title = entity?.name || entity?.title;
  const artist = entity?.artists?.[0]?.name;

  if (!title) {
    throw new Error("Spotify track not found");
  }

  return { title, artist: artist || "" };
}
