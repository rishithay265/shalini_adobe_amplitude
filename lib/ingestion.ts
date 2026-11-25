import { db } from "@/lib/db"; import { createTrainingArtifact } from "@/lib/gemini"; import { getTranscript, getYouTubeMetadata } from "@/lib/youtube"; import { youtubeUrl } from "@/lib/playlist";
export function chunks(text: string, size = 1400, overlap = 220) { const out: string[] = []; for (let i = 0; i < text.length; i += size - overlap) out.push(text.slice(i, i + size)); return out.filter(Boolean); }
export async function ingestVideo(id: string, force = false) {
  const existing = await db.video.findUnique({ where: { id } }); if (existing?.status === "READY" && !force) return existing;
  await db.video.upsert({ where: { id }, create: { id, url: youtubeUrl(id), status: "PROCESSING" }, update: { status: "PROCESSING" } });
  try { const metadata = await getYouTubeMetadata(id); const transcript = await getTranscript(id); if (!transcript) throw new Error("No public English captions available"); const summary = await createTrainingArtifact(youtubeUrl(id), transcript);
    const video = await db.video.update({ where: { id }, data: { ...metadata, transcript, summary, status: "READY" } }); await db.chunk.deleteMany({ where: { videoId: id } }); await db.chunk.createMany({ data: chunks(transcript).map((content, i) => ({ videoId: id, content, startSeconds: i * 60 })) }); return video;
  } catch (e) { await db.video.update({ where: { id }, data: { status: "FAILED" } }); throw e; }
}
