export function extractVideoIds(input: string) {
  return [...new Set([...input.matchAll(/(?:youtu\.be\/|[?&]v=)([\w-]{11})/g)].map((m) => m[1]))];
}
export const youtubeUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`;
