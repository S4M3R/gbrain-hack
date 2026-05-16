const OPENAI_KEY = process.env.OPENAI_API_KEY || "";
const BASE = "https://api.openai.com/v1";

interface Message { role: "system" | "user" | "assistant"; content: string; }

async function chat(messages: Message[], max_tokens = 500): Promise<string> {
  const res = await fetch(`${BASE}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${OPENAI_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "gpt-4o-mini", messages, max_tokens, response_format: { type: "json_object" } }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`);
  const data = await res.json() as { choices: Array<{ message: { content: string } }> };
  return data.choices[0].message.content;
}

export async function synthesize(query: string, texts: string[]) {
  if (!OPENAI_KEY || !texts.length) {
    return { summary: texts[0]?.slice(0, 200) || "No experiences yet.", insights: [] };
  }
  const context = texts.slice(0, 4).map((t, i) => `[${i + 1}] ${t}`).join("\n\n");
  try {
    const raw = await chat([
      { role: "system", content: "You are a group memory assistant. Synthesize your group's lived experiences to help the user. Be warm, specific, and actionable. Reference real details from the experiences." },
      { role: "user", content: `Help me with: "${query}"\n\nGroup experiences:\n${context}\n\nReturn JSON: { "summary": "2-3 warm sentences synthesizing what the group has learned", "insights": ["concrete insight 1", "concrete insight 2", "concrete insight 3"] }` },
    ]);
    return JSON.parse(raw) as { summary: string; insights: string[] };
  } catch (e) {
    console.error("OpenAI synthesis error:", e);
    return { summary: texts[0]?.slice(0, 200) || "", insights: [] };
  }
}

export async function generateFromPrompt(prompt: string): Promise<{ title: string; body: string; tags: string[] }> {
  if (!OPENAI_KEY) {
    return { title: prompt.slice(0, 60), body: prompt, tags: [] };
  }
  try {
    const raw = await chat([
      { role: "system", content: "You convert casual descriptions into structured memory entries. Write in first person, be specific and personal. Extract key lessons and what happened." },
      { role: "user", content: `Create a memory entry from this description: "${prompt}"\n\nReturn JSON: { "title": "short punchy title (max 8 words)", "body": "detailed 2-4 paragraph memory entry with what happened, key moments, and lessons learned", "tags": ["tag1", "tag2", "tag3"] }` },
    ]);
    return JSON.parse(raw) as { title: string; body: string; tags: string[] };
  } catch (e) {
    console.error("OpenAI generate error:", e);
    return { title: prompt.slice(0, 60), body: prompt, tags: [] };
  }
}
