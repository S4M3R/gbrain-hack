const ZE_API_KEY = process.env.ZERO_ENTROPY_API_KEY || "";
const ZE_BASE = "https://api.zeroentropy.dev/v1";

export interface RerankResult {
  index: number;
  relevance_score: number;
}

export async function rerank(
  query: string,
  documents: string[]
): Promise<RerankResult[]> {
  if (!ZE_API_KEY || documents.length === 0) {
    return documents.map((_, i) => ({ index: i, relevance_score: 1 - i * 0.1 }));
  }

  try {
    const res = await fetch(`${ZE_BASE}/models/rerank`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ZE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "zerank-2",
        query,
        documents,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("ZeroEntropy error:", res.status, err);
      return documents.map((_, i) => ({ index: i, relevance_score: 1 - i * 0.1 }));
    }

    const data = (await res.json()) as { results: RerankResult[] };
    return data.results.sort((a, b) => b.relevance_score - a.relevance_score);
  } catch (e) {
    console.error("ZeroEntropy fetch error:", e);
    return documents.map((_, i) => ({ index: i, relevance_score: 1 - i * 0.1 }));
  }
}
