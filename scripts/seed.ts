import { db } from "../lib/db"; import { VIDEO_IDS } from "../data/video-ids"; import { youtubeUrl } from "../lib/playlist";
async function main() { await Promise.all(VIDEO_IDS.map(id => db.video.upsert({ where: { id }, create: { id, url: youtubeUrl(id), status: "PENDING" }, update: {} }))); console.log(`Seeded ${VIDEO_IDS.length} unique videos.`); }
main().finally(() => db.$disconnect());
