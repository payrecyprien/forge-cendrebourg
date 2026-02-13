import { PLAYER_CLASSES, QUEST_TYPES, FACTIONS, COMPLETED_QUESTS_EXAMPLES } from "../data/world";

export default function PlayerConfig({ config, onConfigChange, onGenerate, isLoading }) {
  const update = (key, value) => onConfigChange({ ...config, [key]: value });

  const toggleCompletedQuest = (quest) => {
    const current = config.completedQuests;
    if (current.includes(quest)) {
      update("completedQuests", current.filter((q) => q !== quest));
    } else {
      update("completedQuests", [...current, quest]);
    }
  };

  const updateFaction = (factionId, level) => {
    const current = config.factionAffinities.filter((a) => a.faction !== factionId);
    if (level !== 0) current.push({ faction: factionId, level: level > 0 ? `+${level}` : `${level}` });
    update("factionAffinities", current);
  };

  const getFactionLevel = (factionId) => {
    const entry = config.factionAffinities.find((a) => a.faction === factionId);
    if (!entry) return 0;
    return parseInt(entry.level);
  };

  return (
    <aside className="config-panel">
      {/* Player class */}
      <div className="section-title">Classe du joueur</div>
      <div className="class-grid">
        {PLAYER_CLASSES.map((c) => (
          <button
            key={c.id}
            className={`class-btn ${config.playerClass === c.id ? "active" : ""}`}
            onClick={() => update("playerClass", c.id)}
            title={c.strengths}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Player level */}
      <div className="section-title">Niveau</div>
      <div className="field-group">
        <label className="field-label">Niveau {config.playerLevel}</label>
        <input
          type="range"
          min="1" max="20"
          className="field-range"
          value={config.playerLevel}
          onChange={(e) => update("playerLevel", parseInt(e.target.value))}
        />
        <div className="range-labels">
          <span>1 — Novice</span>
          <span>20 — Vétéran</span>
        </div>
      </div>

      {/* Quest type */}
      <div className="section-title">Type de quête</div>
      <div className="quest-type-grid">
        {QUEST_TYPES.map((qt) => (
          <button
            key={qt.id}
            className={`quest-type-btn ${config.questType === qt.id ? "active" : ""}`}
            onClick={() => update("questType", qt.id)}
            title={qt.description}
          >
            {qt.label}
          </button>
        ))}
      </div>

      {/* Completed quests */}
      <div className="section-title">Quêtes complétées</div>
      <div className="chips-container">
        {COMPLETED_QUESTS_EXAMPLES.map((quest, i) => (
          <span
            key={i}
            className={`chip ${config.completedQuests.includes(quest) ? "active" : ""}`}
            onClick={() => toggleCompletedQuest(quest)}
          >
            {quest.length > 45 ? quest.slice(0, 42) + "..." : quest}
          </span>
        ))}
      </div>

      {/* Faction affinities */}
      <div className="section-title">Affinités de faction</div>
      {FACTIONS.map((f) => (
        <div key={f.id} className="faction-row">
          <span className="faction-name" title={f.description}>{f.name}</span>
          <input
            type="range"
            min="-3" max="3" step="1"
            className="faction-range"
            value={getFactionLevel(f.id)}
            onChange={(e) => updateFaction(f.id, parseInt(e.target.value))}
          />
          <span className="faction-level">
            {getFactionLevel(f.id) > 0 ? `+${getFactionLevel(f.id)}` : getFactionLevel(f.id) === 0 ? "neutre" : getFactionLevel(f.id)}
          </span>
        </div>
      ))}

      {/* Model selection */}
      <div className="section-title">Modèle IA</div>
      <div className="field-group">
        <select
          className="field-select"
          value={config.model}
          onChange={(e) => update("model", e.target.value)}
        >
          <option value="claude-sonnet-4-20250514">Sonnet 4 (meilleur)</option>
          <option value="claude-haiku-4-5-20251001">Haiku 4.5 (rapide)</option>
        </select>
      </div>

      <div className="field-group">
        <label className="field-label">Température : {config.temperature}</label>
        <input
          type="range"
          min="0" max="1" step="0.1"
          className="field-range"
          value={config.temperature}
          onChange={(e) => update("temperature", parseFloat(e.target.value))}
        />
        <div className="range-labels">
          <span>Prévisible</span>
          <span>Créatif</span>
        </div>
      </div>

      {/* Generate button */}
      <button
        className="generate-btn"
        onClick={onGenerate}
        disabled={isLoading}
      >
        {isLoading ? "⏳ Génération en cours..." : "🗺️ Forger une quête"}
      </button>
    </aside>
  );
}
