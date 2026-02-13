const API_ENDPOINT = "/api/generate";

const MODEL_PRICING = {
  "claude-sonnet-4-20250514": { input: 3.0, output: 15.0 },
  "claude-haiku-4-5-20251001": { input: 0.8, output: 4.0 },
};

function estimateCost(model, inputTokens, outputTokens) {
  const pricing = MODEL_PRICING[model] || MODEL_PRICING["claude-sonnet-4-20250514"];
  return (inputTokens * pricing.input + outputTokens * pricing.output) / 1_000_000;
}

function parseQuestResponse(raw) {
  try {
    const cleaned = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    return { quest: JSON.parse(cleaned), error: null };
  } catch (e) {
    return { quest: null, error: `JSON parse error: ${e.message}` };
  }
}

export async function generateQuest({ model, temperature, systemPrompt, userMessage }) {
  const startTime = performance.now();

  const response = await fetch(API_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      max_tokens: 1500,
      temperature,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  const data = await response.json();
  const latency = Math.round(performance.now() - startTime);

  if (data.error) throw new Error(data.error);

  const rawContent = data.content?.map((b) => b.text || "").join("") || "";
  const inputTokens = data.usage?.input_tokens || 0;
  const outputTokens = data.usage?.output_tokens || 0;
  const cost = estimateCost(model, inputTokens, outputTokens);

  const { quest, error } = parseQuestResponse(rawContent);

  return {
    quest,
    parseError: error,
    rawContent,
    meta: { latency, inputTokens, outputTokens, totalTokens: inputTokens + outputTokens, cost, model },
  };
}
