import { useState, useCallback } from "react";
import { buildQuestPrompt } from "./data/prompts";
import { PLAYER_CLASSES, WORLD, FACTIONS, LOCATIONS, KEY_NPCS } from "./data/world";
import { generateQuest, checkCoherence } from "./utils/api";
import PlayerConfig from "./components/PlayerConfig";
import QuestDisplay from "./components/QuestDisplay";

const DEFAULT_CONFIG = {
  playerClass: "guerrier",
  playerLevel: 5,
  questType: "investigation",
  completedQuests: [],
  factionAffinities: [],
  model: "claude-sonnet-4-20250514",
  temperature: 0.85,
};

// Build world context string for coherence checker
function buildWorldContext() {
  return `## MONDE : ${WORLD.name}
${WORLD.description}

## FACTIONS
${FACTIONS.map((f) => `- ${f.name} (${f.id}) : ${f.description}`).join("\n")}

## LIEUX
${LOCATIONS.map((l) => `- ${l.name} (${l.id}) [danger: ${l.dangerLevel}/5] : ${l.description}`).join("\n")}

## PERSONNAGES CLÉS
${KEY_NPCS.map((n) => `- ${n.name} — ${n.role} — ${n.notes}`).join("\n")}`;
}

export default function App() {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [quest, setQuest] = useState(null);
  const [meta, setMeta] = useState(null);
  const [coherence, setCoherence] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [campaign, setCampaign] = useState([]); // Chain of accepted quests

  const handleGenerate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setCoherence(null);

    try {
      const classLabel = PLAYER_CLASSES.find((c) => c.id === config.playerClass)?.label || config.playerClass;

      // Merge manually selected completed quests with campaign chain
      const allCompleted = [
        ...config.completedQuests,
        ...campaign.map((q) => `${q.title} — ${q.description}`),
      ];

      const systemPrompt = buildQuestPrompt({
        questType: config.questType,
        playerClass: classLabel,
        playerLevel: config.playerLevel,
        completedQuests: allCompleted,
        factionAffinities: config.factionAffinities,
      });

      const result = await generateQuest({
        model: config.model,
        temperature: config.temperature,
        systemPrompt,
        userMessage: `Génère une quête de type "${config.questType}" pour un joueur ${classLabel} de niveau ${config.playerLevel}.${
          campaign.length > 0
            ? ` La quête précédente était "${campaign[campaign.length - 1].title}". Fais suite à cette quête ou fais-y référence.`
            : ""
        }`,
      });

      if (result.parseError) {
        setError(`La réponse n'est pas un JSON valide. ${result.parseError}`);
        setQuest(null);
      } else {
        setQuest(result.quest);
        setMeta(result.meta);
        setHistory((prev) => [{ quest: result.quest, meta: result.meta, timestamp: Date.now() }, ...prev].slice(0, 10));

        // Auto-run coherence check
        runCoherenceCheck(result.quest, [
          ...config.completedQuests,
          ...campaign.map((q) => `${q.title} — ${q.description}`),
        ]);
      }
    } catch (err) {
      setError(err.message);
      setQuest(null);
    }

    setIsLoading(false);
  }, [config, campaign]);

  const runCoherenceCheck = async (questData, completedQuests) => {
    setIsChecking(true);
    try {
      const result = await checkCoherence({
        quest: questData,
        worldContext: buildWorldContext(),
        completedQuests,
      });
      setCoherence(result);
    } catch (err) {
      setCoherence({
        score: null,
        verdict: "erreur",
        issues: [err.message],
        strengths: [],
        meta: null,
      });
    }
    setIsChecking(false);
  };

  // Accept quest → add to campaign chain
  const handleAcceptQuest = () => {
    if (!quest) return;
    setCampaign((prev) => [...prev, quest]);

    // Also update faction affinities if the quest has reputation rewards
    if (quest.rewards?.reputation) {
      setConfig((prev) => {
        const newAffinities = [...prev.factionAffinities];
        Object.entries(quest.rewards.reputation).forEach(([factionId, change]) => {
          const existing = newAffinities.find((a) => a.faction === factionId);
          if (existing) {
            const newLevel = Math.max(-3, Math.min(3, parseInt(existing.level) + change));
            existing.level = newLevel > 0 ? `+${newLevel}` : `${newLevel}`;
          } else {
            newAffinities.push({ faction: factionId, level: change > 0 ? `+${change}` : `${change}` });
          }
        });
        return { ...prev, factionAffinities: newAffinities };
      });
    }

    // Level up every 3 quests
    if ((campaign.length + 1) % 3 === 0) {
      setConfig((prev) => ({ ...prev, playerLevel: Math.min(20, prev.playerLevel + 1) }));
    }

    setQuest(null);
    setCoherence(null);
    setMeta(null);
  };

  const handleExportJSON = () => {
    if (!quest) return;
    const blob = new Blob([JSON.stringify(quest, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `quest-${quest.title?.toLowerCase().replace(/\s+/g, "-").slice(0, 30) || "export"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCampaign = () => {
    if (campaign.length === 0) return;
    const blob = new Blob([JSON.stringify(campaign, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "campagne-cendrebourg.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetCampaign = () => {
    setCampaign([]);
    setQuest(null);
    setCoherence(null);
    setMeta(null);
    setConfig(DEFAULT_CONFIG);
  };

  return (
    <div className="app-container">
      <div className="grain-overlay" />

      <header className="header">
        <div className="header-left">
          <h1 className="header-title">🗺️ Forge de Cendrebourg</h1>
          <span className="header-subtitle">Générateur de quêtes dynamiques</span>
        </div>
        {campaign.length > 0 && (
          <div className="campaign-indicator">
            <span className="campaign-count">📜 Campagne : {campaign.length} quête{campaign.length > 1 ? "s" : ""}</span>
            <button className="campaign-btn" onClick={handleExportCampaign} title="Exporter la campagne">📋</button>
            <button className="campaign-btn" onClick={handleResetCampaign} title="Nouvelle campagne">🔄</button>
          </div>
        )}
      </header>

      <div className="main-layout">
        <PlayerConfig
          config={config}
          onConfigChange={setConfig}
          onGenerate={handleGenerate}
          isLoading={isLoading}
          campaign={campaign}
        />

        <div className="quest-area">
          {error && <div className="error-banner">⚠️ {error}</div>}

          {isLoading ? (
            <div className="loading-container">
              <div className="loading-icon">🗺️</div>
              <div className="loading-text">La forge prépare votre quête...</div>
            </div>
          ) : quest ? (
            <QuestDisplay
              quest={quest}
              meta={meta}
              coherence={coherence}
              isChecking={isChecking}
              onExportJSON={handleExportJSON}
              onAcceptQuest={handleAcceptQuest}
              onRegenerate={handleGenerate}
              campaignLength={campaign.length}
            />
          ) : (
            <div className="quest-empty">
              <div className="quest-empty-icon">🗺️</div>
              <div className="quest-empty-title">
                {campaign.length > 0 ? "Quête acceptée !" : "Aucune quête forgée"}
              </div>
              <div className="quest-empty-sub">
                {campaign.length > 0
                  ? `Votre campagne compte ${campaign.length} quête${campaign.length > 1 ? "s" : ""}. Forgez la suivante — elle tiendra compte de vos aventures passées.`
                  : "Configurez le profil du joueur et le type de quête, puis cliquez sur \"Forger une quête\" pour commencer votre campagne."}
              </div>
              {campaign.length > 0 && (
                <div className="campaign-timeline">
                  {campaign.map((q, i) => (
                    <div key={i} className="timeline-item">
                      <div className="timeline-dot" />
                      <div className="timeline-content">
                        <span className="timeline-number">Quête {i + 1}</span>
                        <span className="timeline-title">{q.title}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
