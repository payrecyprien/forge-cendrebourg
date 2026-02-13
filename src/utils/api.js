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

/**
 * Coherence verification — uses Haiku (cheap & fast) to check the quest
 * against the established lore and previously completed quests.
 * Returns a score + list of issues found.
 */
export async function checkCoherence({ quest, worldContext, completedQuests }) {
  const systemPrompt = `Tu es un vérificateur de cohérence pour un jeu RPG. On te donne une quête générée et le contexte du monde. Tu dois vérifier que la quête est cohérente avec le lore établi.

${worldContext}

## QUÊTES DÉJÀ COMPLÉTÉES PAR LE JOUEUR
${completedQuests.length > 0 ? completedQuests.join("\n") : "Aucune"}

## RÈGLES DE VÉRIFICATION
1. Les lieux mentionnés existent-ils dans le monde ?
2. Les PNJs mentionnés existent-ils et leurs rôles sont-ils corrects ?
3. Les factions mentionnées existent-elles ?
4. La quête ne contredit-elle pas les événements des quêtes déjà complétées ?
5. Le niveau de danger est-il cohérent avec le lieu ?
6. Les récompenses sont-elles proportionnelles à la difficulté ?
7. Le choix moral a-t-il des conséquences logiques sur les factions ?

Réponds UNIQUEMENT en JSON :
{
  "score": 1-10,
  "verdict": "cohérente" ou "incohérences mineures" ou "incohérences majeures",
  "issues": ["description du problème 1", "..."],
  "strengths": ["point fort 1", "..."]
}`;

  const startTime = performance.now();

  const response = await fetch(API_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001", // Always Haiku for cost efficiency
      max_tokens: 500,
      temperature: 0.2, // Low temperature for analytical task
      system: systemPrompt,
      messages: [{ role: "user", content: `Vérifie la cohérence de cette quête :\n${JSON.stringify(quest, null, 2)}` }],
    }),
  });

  const data = await response.json();
  const latency = Math.round(performance.now() - startTime);

  if (data.error) throw new Error(data.error);

  const rawContent = data.content?.map((b) => b.text || "").join("") || "";
  const inputTokens = data.usage?.input_tokens || 0;
  const outputTokens = data.usage?.output_tokens || 0;
  const cost = estimateCost("claude-haiku-4-5-20251001", inputTokens, outputTokens);

  try {
    const cleaned = rawContent.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    const result = JSON.parse(cleaned);
    return {
      ...result,
      meta: { latency, inputTokens, outputTokens, totalTokens: inputTokens + outputTokens, cost },
    };
  } catch {
    return {
      score: null,
      verdict: "erreur d'analyse",
      issues: ["Le vérificateur n'a pas retourné un JSON valide"],
      strengths: [],
      meta: { latency, inputTokens, outputTokens, totalTokens: inputTokens + outputTokens, cost },
    };
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
