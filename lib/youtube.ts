type YouTubeItem = { id: string; snippet: { title: string; description: string }; contentDetails: { duration: string } };
export function durationToSeconds(iso: string) { const p = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/); return p ? (+p[1] || 0) * 3600 + (+p[2] || 0) * 60 + (+p[3] || 0) : 0; }
export async function getYouTubeMetadata(id: string) {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) throw new Error("YOUTUBE_API_KEY is required for ingestion");
  const r = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${id}&key=${key}`);
  if (!r.ok) throw new Error(`YouTube metadata failed: ${r.status}`);
  const item = ((await r.json()).items?.[0]) as YouTubeItem | undefined;
  if (!item) throw new Error("Video not found or inaccessible");
  return { title: item.snippet.title, description: item.snippet.description, durationSeconds: durationToSeconds(item.contentDetails.duration) };
}
/** Captions must be public/available. OAuth is needed for restricted creator captions. */
export async function getTranscript(id: string) {
  const r = await fetch(`https://www.youtube.com/api/timedtext?v=${id}&lang=en`);
  if (!r.ok) return "";
  const xml = await r.text();
  return [...xml.matchAll(/<text[^>]*start="([\d.]+)"[^>]*>([\s\S]*?)<\/text>/g)].map((m) => `[${Math.floor(+m[1] / 60)}:${String(Math.floor(+m[1] % 60)).padStart(2,"0")}] ${m[2].replace(/&amp;/g,"&").replace(/<[^>]*>/g,"")}`).join("\n");
}
