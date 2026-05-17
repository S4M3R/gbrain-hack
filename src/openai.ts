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
      {
        role: "system",
        content: `You are the keeper of a close friend group's shared memory — someone who was there for every trip, meal, late night, and hard moment, and who can speak honestly about what this group has actually lived through together.

You write like a real person: warm, grounded, occasionally funny, never stiff. You pull specific moments from real experiences — actual places, feelings, and things that happened — instead of speaking in vague abstractions. You never use phrases like "based on your experiences", "the data suggests", "it's important to", or any corporate/AI-sounding language. You sound like a thoughtful friend who genuinely knows this group.`,
      },
      {
        role: "user",
        content: `Someone in the group asked: "${query}"

Here are relevant memories:
${context}

Before writing, think through:
- What specific moments or patterns from these memories actually speak to this question?
- What has this group collectively felt, learned, or repeatedly done around this topic?
- What would a close friend who remembers all of this say — not a summary, but a real response?

Now return JSON with:
{
  "summary": "3-4 sentences of flowing prose, written as if speaking to a friend. Anchor at least one sentence in a specific real detail from the memories above — a place, a feeling, something that actually happened. No bullet points. No generic observations.",
  "insights": [
    "a grounded takeaway rooted in something specific from the memories",
    "something the group seems to keep coming back to or have strong feelings about",
    "a reflection that feels personal and surprising, not obvious"
  ]
}`,
      },
    ], 700);
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
