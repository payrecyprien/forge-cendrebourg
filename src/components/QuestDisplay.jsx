import { LOCATIONS, FACTIONS, QUEST_TYPES } from "../data/world";

function getLocationName(id) {
  return LOCATIONS.find((l) => l.id === id)?.name || id;
}

function getFactionName(id) {
  return FACTIONS.find((f) => f.id === id)?.name || id;
}

function getQuestTypeLabel(id) {
  return QUEST_TYPES.find((q) => q.id === id)?.label || id;
}

function getDifficultyStars(level) {
  return "⭐".repeat(level) + "☆".repeat(5 - level);
}

function formatFactionImpact(impact) {
  if (!impact) return null;
  const isPositive = impact.startsWith("+");
  const factionId = impact.replace(/^[+-]/, "");
  const factionName = getFactionName(factionId);
  return { isPositive, label: `${isPositive ? "+" : "−"} ${factionName}` };
}

export default function QuestDisplay({ quest, meta, onExportJSON }) {
  if (!quest) return null;

  return (
    <div className="quest-card">
      {/* Header */}
      <div className="quest-header">
        <span className="quest-type-badge">{getQuestTypeLabel(quest.type)}</span>
        <h2 className="quest-title">{quest.title}</h2>
        <p className="quest-description">{quest.description}</p>
        <div className="quest-meta">
          <span className="quest-meta-item">
            📍 <span className="quest-meta-value">{getLocationName(quest.location_id)}</span>
          </span>
          <span className="quest-meta-item">
            ⚔️ <span className="quest-meta-value">{getDifficultyStars(quest.difficulty)}</span>
          </span>
          <span className="quest-meta-item">
            ⏱️ <span className="quest-meta-value">{quest.estimated_duration}</span>
          </span>
          <span className="quest-meta-item">
            🏴 <span className="quest-meta-value">{getFactionName(quest.faction_involved)}</span>
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="quest-body">
        {/* Quest giver */}
        <div className="quest-section">
          <div className="quest-section-title">Donneur de quête</div>
          <div className="quest-giver">
            <div className="quest-giver-name">{quest.quest_giver?.name}</div>
            <div className="quest-giver-dialogue">"{quest.quest_giver?.dialogue_intro}"</div>
          </div>
        </div>

        {/* Objectives */}
        <div className="quest-section">
          <div className="quest-section-title">Objectifs</div>
          {quest.objectives?.map((obj) => (
            <div key={obj.id} className="objective">
              <div className={`objective-marker ${obj.type === "optionnel" ? "optional" : ""}`}>
                {obj.type === "optionnel" ? "?" : obj.id}
              </div>
              <div>
                <div className="objective-text">{obj.description}</div>
                {obj.class_bonus && obj.class_bonus !== "null" && (
                  <div className="objective-bonus">✨ Bonus de classe : {obj.class_bonus}</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Moral choice */}
        {quest.moral_choice && (
          <div className="quest-section">
            <div className="quest-section-title">⚖️ Choix moral</div>
            <div className="moral-choice">
              <div className="moral-description">{quest.moral_choice.description}</div>
              <div className="moral-options">
                {["option_a", "option_b"].map((optKey) => {
                  const opt = quest.moral_choice[optKey];
                  if (!opt) return null;
                  const impact = formatFactionImpact(opt.faction_impact);
                  return (
                    <div key={optKey} className="moral-option">
                      <div className="moral-option-label">{opt.label}</div>
                      <div className="moral-option-consequence">{opt.consequence}</div>
                      {impact && (
                        <div className={`moral-option-impact ${impact.isPositive ? "impact-positive" : "impact-negative"}`}>
                          {impact.label}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Rewards */}
        {quest.rewards && (
          <div className="quest-section">
            <div className="quest-section-title">Récompenses</div>
            <div className="rewards-grid">
              {quest.rewards.xp > 0 && (
                <div className="reward-item">
                  <div className="reward-value">{quest.rewards.xp}</div>
                  <div className="reward-label">XP</div>
                </div>
              )}
              {quest.rewards.gold > 0 && (
                <div className="reward-item">
                  <div className="reward-value">{quest.rewards.gold}</div>
                  <div className="reward-label">Or</div>
                </div>
              )}
              {quest.rewards.reputation && Object.entries(quest.rewards.reputation).map(([fId, val]) => (
                <div key={fId} className="reward-item">
                  <div className="reward-value" style={{ color: val > 0 ? "#70c070" : "#e07070" }}>
                    {val > 0 ? `+${val}` : val}
                  </div>
                  <div className="reward-label">{getFactionName(fId)}</div>
                </div>
              ))}
              {quest.rewards.item && quest.rewards.item !== "null" && (
                <div className="reward-item reward-item-special">
                  <span className="reward-item-icon">🎁</span>
                  <div>
                    <div className="reward-item-name">{quest.rewards.item}</div>
                    {quest.rewards.item_description && quest.rewards.item_description !== "null" && (
                      <div className="reward-item-desc">{quest.rewards.item_description}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Completion dialogue */}
        {quest.quest_giver?.dialogue_complete && (
          <div className="quest-section">
            <div className="quest-section-title">Quête réussie</div>
            <div className="quest-giver">
              <div className="quest-giver-name">{quest.quest_giver.name}</div>
              <div className="quest-giver-dialogue">"{quest.quest_giver.dialogue_complete}"</div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="quest-footer">
        <div className="lore-connection">
          🔗 {quest.lore_connection}
        </div>
        <div className="quest-actions">
          <button className="action-btn" onClick={onExportJSON}>
            📋 Export JSON
          </button>
        </div>
      </div>

      {/* Metrics */}
      {meta && (
        <div className="metrics-bar">
          <span className="metric">Latence : <span className="metric-value">{meta.latency}ms</span></span>
          <span className="metric">Tokens : <span className="metric-value">{meta.totalTokens}</span></span>
          <span className="metric">Coût : <span className="metric-value">${meta.cost.toFixed(4)}</span></span>
          <span className="metric">Modèle : <span className="metric-value">{meta.model.replace("claude-", "").split("-").slice(0, 2).join("-")}</span></span>
        </div>
      )}
    </div>
  );
}
