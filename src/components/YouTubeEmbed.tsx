"use client";

import { useState } from "react";

function extractVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "youtu.be") return parsed.pathname.slice(1);
    if (
      parsed.hostname === "www.youtube.com" ||
      parsed.hostname === "youtube.com"
    ) {
      return parsed.searchParams.get("v");
    }
  } catch {
    /* invalid url */
  }
  return null;
}

export function YouTubeEmbed({ children }: { children: React.ReactNode }) {
  const [url, setUrl] = useState("");
  const videoId = extractVideoId(url);

  return (
    <div className="w-full max-h-screen overflow-hidden space-y-3">
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Incolla un link YouTube…"
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <div className="flex gap-4 mb-32 h-full max-h-[calc(100vh-200px)]">
        {videoId && (
          <div className="aspect-video w-full max-h-full overflow-hidden rounded-lg flex-1">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        )}
        <div className="flex-1 max-h-full overflow-scroll pb-12">
          {children}
        </div>
      </div>
    </div>
  );
}
