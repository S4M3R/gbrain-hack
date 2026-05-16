import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface SynthesisResult {
  summary: string;
  insights: string[];
  sources: number[];
}

export async function synthesize(
  query: string,
  chunks: string[]
): Promise<SynthesisResult> {
  if (chunks.length === 0) {
    return {
      summary: "No relevant experiences found yet. Be the first to add one!",
      insights: [],
      sources: [],
    };
  }

  const context = chunks
    .slice(0, 5)
    .map((c, i) => `[${i + 1}] ${c}`)
    .join("\n\n");

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 600,
      messages: [
        {
          role: "user",
          content: `You are a group memory assistant. Your friends have captured their experiences and you need to synthesize their wisdom to help with: "${query}"

Here are the most relevant experiences from your group:

${context}

Respond in JSON with this exact structure:
{
  "summary": "2-3 sentence synthesis of what the group has learned relevant to this question",
  "insights": ["specific insight 1", "specific insight 2", "specific insight 3"],
  "sources": [1, 2, 3]
}

Be specific, personal, and actionable. Reference what people actually did. Keep it under 200 words total.`,
        },
      ],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "{}";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as SynthesisResult;
    }
  } catch (e: unknown) {
    // Fallback: synthesize from chunks directly without LLM
    console.error("Claude API error, using fallback synthesis:", (e as Error).message?.slice(0, 100));
  }

  // Fallback synthesis — extract key sentences from top chunks
  const topChunks = chunks.slice(0, 3);
  const sentences = topChunks
    .flatMap((c) => c.split(/[.!?]/).filter((s) => s.trim().length > 30))
    .slice(0, 6);

  const insights = sentences
    .slice(1, 4)
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    summary: sentences[0]?.trim() + ". " + (sentences[1]?.trim() || ""),
    insights,
    sources: topChunks.map((_, i) => i + 1),
  };
}
