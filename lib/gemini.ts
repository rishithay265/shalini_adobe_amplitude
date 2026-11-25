const model = () => process.env.GEMINI_MODEL || "models/gemini-4-hydrogen";
const base = "https://generativelanguage.googleapis.com/v1beta";
export async function verifyGeminiModel() {
  const key = process.env.GEMINI_API_KEY; if (!key) throw new Error("GEMINI_API_KEY is required");
  const r = await fetch(`${base}/${model()}?key=${key}`);
  if (!r.ok) throw new Error(`Configured Gemini model ${model()} is unavailable (${r.status})`);
}
export async function createTrainingArtifact(url: string, transcript: string) {
  await verifyGeminiModel(); const key = process.env.GEMINI_API_KEY!;
  const input = `Analyze only this training video and its transcript. Return strict JSON with summary, keyConcepts, procedures, glossary, highlights (timestamp,label), quiz (question,options,answer), relatedVideoIds. URL: ${url}\nTranscript:\n${transcript}`;
  const r = await fetch(`${base}/interactions?key=${key}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: model(), input, generation_config: { max_output_tokens: 65536, thinking_level: "high" } }) });
  if (!r.ok) throw new Error(`Gemini ingestion failed: ${r.status}`);
  const raw = await r.json(); const text = raw.output_text ?? raw.output?.[0]?.content?.[0]?.text ?? "{}";
  return JSON.parse(text.replace(/^```json\s*|\s*```$/g, ""));
}
export async function groundedAnswer(question: string, sources: { title: string | null; id: string; transcript: string | null }[]) {
  await verifyGeminiModel(); const key = process.env.GEMINI_API_KEY!;
  const context = sources.map(s => `VIDEO ${s.id} | ${s.title}\n${s.transcript?.slice(0, 7000) || "No transcript"}`).join("\n\n");
  const input = `Answer ONLY using the supplied internal training material. If unsupported, say it is not covered. Cite each claim as [videoId @ mm:ss]. Question: ${question}\n\n${context}`;
  const r = await fetch(`${base}/interactions?key=${key}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: model(), input, generation_config: { max_output_tokens: 4096 } }) });
  if (!r.ok) throw new Error("Gemini answer failed"); const raw = await r.json(); return raw.output_text ?? raw.output?.[0]?.content?.[0]?.text ?? "I couldn't form a grounded answer.";
}
