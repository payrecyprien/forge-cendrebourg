import { useState, useCallback } from "react";
import { buildQuestPrompt } from "./data/prompts";
import { PLAYER_CLASSES } from "./data/world";
import { generateQuest } from "./utils/api";
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

export default function App() {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [quest, setQuest] = useState(null);
  const [meta, setMeta] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  const handleGenerate = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const classLabel = PLAYER_CLASSES.find((c) => c.id === config.playerClass)?.label || config.playerClass;

      const systemPrompt = buildQuestPrompt({
        questType: config.questType,
        playerClass: classLabel,
        playerLevel: config.playerLevel,
        completedQuests: config.completedQuests,
        factionAffinities: config.factionAffinities,
      });

      const result = await generateQuest({
        model: config.model,
        temperature: config.temperature,
        systemPrompt,
        userMessage: `Génère une quête de type "${config.questType}" pour un joueur ${classLabel} de niveau ${config.playerLevel}.`,
      });

      if (result.parseError) {
        setError(`La réponse n'est pas un JSON valide. ${result.parseError}`);
        setQuest(null);
      } else {
        setQuest(result.quest);
        setMeta(result.meta);
        setHistory((prev) => [{ quest: result.quest, meta: result.meta, timestamp: Date.now() }, ...prev].slice(0, 10));
      }
    } catch (err) {
      setError(err.message);
      setQuest(null);
    }

    setIsLoading(false);
  }, [config]);

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

  return (
    <div className="app-container">
      <div className="grain-overlay" />

      <header className="header">
        <div className="header-left">
          <h1 className="header-title">🗺️ Forge de Cendrebourg</h1>
          <span className="header-subtitle">Générateur de quêtes dynamiques</span>
        </div>
      </header>

      <div className="main-layout">
        <PlayerConfig
          config={config}
          onConfigChange={setConfig}
          onGenerate={handleGenerate}
          isLoading={isLoading}
        />

        <div className="quest-area">
          {error && <div className="error-banner">⚠️ {error}</div>}

          {isLoading ? (
            <div className="loading-container">
              <div className="loading-icon">🗺️</div>
              <div className="loading-text">La forge prépare votre quête...</div>
            </div>
          ) : quest ? (
            <QuestDisplay quest={quest} meta={meta} onExportJSON={handleExportJSON} />
          ) : (
            <div className="quest-empty">
              <div className="quest-empty-icon">🗺️</div>
              <div className="quest-empty-title">Aucune quête forgée</div>
              <div className="quest-empty-sub">
                Configurez le profil du joueur et le type de quête, puis cliquez sur "Forger une quête" pour générer une quête cohérente avec l'univers de Cendrebourg.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
