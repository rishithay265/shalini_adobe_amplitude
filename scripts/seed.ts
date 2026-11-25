import { db } from "../lib/db"; import { VIDEO_IDS } from "../data/video-ids"; import { youtubeUrl } from "../lib/playlist";
async function main() { await db.video.createMany({ data: VIDEO_IDS.map(id => ({ id, url: youtubeUrl(id), status: "PENDING" })), skipDuplicates: true }); console.log(`Seeded ${VIDEO_IDS.length} unique videos.`); }
main().finally(() => db.$disconnect());
