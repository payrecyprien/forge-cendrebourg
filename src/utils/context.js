/**
 * Cross-project context system for Cendrebourg ecosystem
 * 
 * Encodes/decodes structured data in URL hash for passing context
 * between Forge → Bestiaire → Griffon Noir
 */

const BESTIAIRE_URL = "https://bestiaire-cendrebourg.vercel.app";
const GRIFFON_URL = "https://griffon-noir.vercel.app";
const FORGE_URL = "https://forge-cendrebourg.vercel.app";

export function encodeContext(data) {
  try {
    const json = JSON.stringify(data);
    return btoa(unescape(encodeURIComponent(json)));
  } catch {
    return null;
  }
}

export function decodeContext(encoded) {
  try {
    const json = decodeURIComponent(escape(atob(encoded)));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function readContextFromURL() {
  const hash = window.location.hash;
  if (!hash.startsWith("#ctx=")) return null;
  return decodeContext(hash.slice(5));
}

export function clearURLContext() {
  history.replaceState(null, "", window.location.pathname);
}

// Compact quest data for URL transfer
export function compactQuest(quest) {
  return {
    title: quest.title,
    description: quest.description,
    type: quest.type,
    location_id: quest.location_id,
    faction_involved: quest.faction_involved,
    difficulty: quest.difficulty,
    objectives: quest.objectives?.map((o) => o.description).slice(0, 3),
    moral_choice: quest.moral_choice?.description,
    quest_giver: quest.quest_giver?.name,
  };
}

// Compact creature data for URL transfer
export function compactCreature(creature) {
  return {
    name: creature.name,
    title: creature.title,
    type: creature.type,
    element: creature.element,
    habitat: creature.habitat,
    danger_level: creature.danger_level,
    description: creature.description,
    abilities: creature.abilities?.map((a) => a.name).slice(0, 3),
    weaknesses: creature.weaknesses?.map((w) => w.name).slice(0, 2),
  };
}

export function openBestiaire(quest) {
  const ctx = encodeContext({ quest: compactQuest(quest), source: "forge" });
  window.open(`${BESTIAIRE_URL}#ctx=${ctx}`, "_blank");
}

export function openGriffonNoir(quest, creatures) {
  const ctx = encodeContext({
    quest: quest,
    creatures: creatures.map(compactCreature),
    source: "bestiaire",
  });
  window.open(`${GRIFFON_URL}#ctx=${ctx}`, "_blank");
}

export function openForge() {
  window.open(FORGE_URL, "_blank");
}

export { BESTIAIRE_URL, GRIFFON_URL, FORGE_URL };
