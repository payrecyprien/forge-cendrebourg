/**
 * Quest Generation Prompt — v2
 *
 * Architecture : RAG-style context injection
 * The world data (factions, locations, NPCs, lore) is injected into the system prompt
 * so the LLM generates quests that are consistent with the established world.
 *
 * v1 — Simple prompt asking for a quest with basic parameters
 *       Problem: quests were generic, contradicted lore, invented non-existent locations
 *
 * v2 — (current) Full world context injection + structured JSON output + coherence rules
 *       The LLM receives all lore data and must use ONLY established elements
 *       Structured output enables direct integration with a game engine
 */

import { WORLD, FACTIONS, LOCATIONS, KEY_NPCS } from "./world";

export function buildQuestPrompt({ questType, playerClass, playerLevel, completedQuests, factionAffinities }) {
  const worldContext = `
## MONDE : ${WORLD.name}
${WORLD.description}
Époque : ${WORLD.era}

## FACTIONS
${FACTIONS.map((f) => `- **${f.name}** (${f.id}) : ${f.description} — Leader : ${f.leader} — Alignement : ${f.alignment}`).join("\n")}

## LIEUX
${LOCATIONS.map((l) => `- **${l.name}** (${l.id}) [${l.type}, danger: ${l.dangerLevel}/5] : ${l.description}`).join("\n")}

## PERSONNAGES CLÉS
${KEY_NPCS.map((n) => `- **${n.name}** — ${n.role} — Faction : ${n.faction} — Notes : ${n.notes}`).join("\n")}
`;

  const playerContext = `
## PROFIL DU JOUEUR
- Classe : ${playerClass}
- Niveau : ${playerLevel}
- Affinités de faction : ${factionAffinities.length > 0 ? factionAffinities.map((a) => `${a.faction} (${a.level})`).join(", ") : "Aucune encore"}
- Quêtes déjà complétées : ${completedQuests.length > 0 ? completedQuests.join(" | ") : "Aucune (nouveau joueur)"}
`;

  return `Tu es un game designer expert spécialisé dans la création de quêtes pour RPGs. Tu travailles dans l'univers de Cendrebourg.

${worldContext}

${playerContext}

## TA MISSION
Génère UNE quête de type "${questType}" qui :
1. Est cohérente avec le lore établi ci-dessus — utilise UNIQUEMENT les lieux, PNJs et factions listés
2. Est adaptée au niveau ${playerLevel} du joueur (difficulté appropriée)
3. Tient compte des quêtes déjà complétées (ne pas répéter, mais peut faire suite)
4. Propose des interactions avec la classe ${playerClass} du joueur (options liées à ses compétences)
5. Contient au moins un choix moral ou stratégique pour le joueur
6. Fait avancer l'intrigue principale (le mystère des disparitions / le complot de Varen) directement ou indirectement

## RÈGLES DE COHÉRENCE
- N'invente PAS de nouveaux lieux, factions ou personnages principaux
- Tu PEUX inventer des personnages secondaires mineurs (un garde, un villageois, un marchand de passage)
- Les quêtes doivent avoir des conséquences logiques sur les relations de faction
- Le danger doit correspondre au niveau du joueur et au lieu choisi
- Les dialogues des PNJ doivent refléter leur personnalité établie

## FORMAT DE RÉPONSE — JSON STRICT
Réponds UNIQUEMENT avec un JSON valide, sans texte avant ou après :

{
  "title": "Titre de la quête (accrocheur, max 8 mots)",
  "description": "Description narrative de la quête (2-3 phrases, ambiance et enjeux)",
  "type": "${questType}",
  "difficulty": 1-5,
  "estimated_duration": "courte/moyenne/longue",
  "location_id": "id du lieu principal (parmi les lieux listés)",
  "faction_involved": "id de la faction principale impliquée",
  "quest_giver": {
    "name": "Nom du PNJ qui donne la quête",
    "dialogue_intro": "Ce que le PNJ dit pour introduire la quête (en personnage, 2-3 phrases)",
    "dialogue_complete": "Ce que le PNJ dit quand la quête est réussie (1-2 phrases)"
  },
  "objectives": [
    {
      "id": 1,
      "description": "Description de l'objectif",
      "type": "principal/optionnel",
      "class_bonus": "Avantage spécifique si le joueur est de classe ${playerClass} (ou null)"
    }
  ],
  "moral_choice": {
    "description": "Le dilemme moral ou stratégique que le joueur rencontre",
    "option_a": { "label": "Choix A", "consequence": "Ce qui arrive", "faction_impact": "+faction_id ou -faction_id" },
    "option_b": { "label": "Choix B", "consequence": "Ce qui arrive", "faction_impact": "+faction_id ou -faction_id" }
  },
  "rewards": {
    "xp": 100-1000,
    "gold": 0-500,
    "item": "Nom de l'objet de récompense (ou null)",
    "item_description": "Description de l'objet (ou null)",
    "reputation": { "faction_id": +1 ou -1 }
  },
  "lore_connection": "Comment cette quête se connecte à l'intrigue principale (1 phrase)"
}`;
}
