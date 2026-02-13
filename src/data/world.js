// ─── CENDREBOURG WORLD LORE ───
// This data is injected into the quest generation prompt as context (RAG-style).
// The LLM uses it to generate quests that are consistent with the established world.

export const WORLD = {
  name: "Cendrebourg",
  description:
    "Village fortifié au croisement des routes commerciales entre les royaumes du Nord et du Sud. Autrefois prospère, Cendrebourg est désormais assombri par des disparitions mystérieuses et les agissements troubles de son seigneur.",
  era: "Médiéval-fantasy",
};

export const FACTIONS = [
  {
    id: "garde",
    name: "Garde de Cendrebourg",
    description: "Les soldats du Seigneur Varen. Loyaux mais de plus en plus troublés par les ordres qu'ils reçoivent.",
    leader: "Capitaine Gareth",
    alignment: "Neutre — tiraillés entre devoir et conscience",
  },
  {
    id: "lames_grises",
    name: "Les Lames Grises",
    description: "Groupe de mercenaires fréquentant la taverne du Griffon Noir. Motivés par l'argent, mais avec un code d'honneur.",
    leader: "Soren le Balafré",
    alignment: "Chaotique neutre",
  },
  {
    id: "cercle",
    name: "Le Cercle d'Obsidienne",
    description: "Organisation occulte opérant dans l'ombre. Theron, le conseiller de Varen, en est un agent. Ils conduisent des rituels dans la forêt de Brumesombre.",
    leader: "Inconnu",
    alignment: "Maléfique",
  },
  {
    id: "marchands",
    name: "Guilde des Marchands",
    description: "Les commerçants qui traversent Cendrebourg. Ils souffrent de l'insécurité croissante et des taxes imposées par Varen.",
    leader: "Helga Pierrenoire",
    alignment: "Neutre bon",
  },
  {
    id: "villageois",
    name: "Villageois de Cendrebourg",
    description: "Les habitants ordinaires du village. Terrifiés par les disparitions, méfiants envers les étrangers, mais désespérés de trouver de l'aide.",
    leader: "Aucun (le conseil du village a été dissous par Varen)",
    alignment: "Neutre bon",
  },
];

export const LOCATIONS = [
  {
    id: "griffon_noir",
    name: "Taverne du Griffon Noir",
    type: "Bâtiment",
    description: "Point névralgique du village. Tenue par Aldric, fréquentée par marchands, aventuriers et mercenaires. Un plancher dans la cave cache des secrets.",
    dangerLevel: 1,
  },
  {
    id: "brumesombre",
    name: "Forêt de Brumesombre",
    type: "Zone sauvage",
    description: "Forêt dense au sud du village, connue pour ses brumes épaisses. Lieu des disparitions récentes. Des traces de rituels y ont été trouvées.",
    dangerLevel: 4,
  },
  {
    id: "ruines_nord",
    name: "Ruines du Nord",
    type: "Donjon",
    description: "Anciennes fortifications à une heure de marche. Évitées par les locaux. Varen y a été vu en compagnie d'un nécromancien.",
    dangerLevel: 5,
  },
  {
    id: "chateau_varen",
    name: "Château de Varen",
    type: "Forteresse",
    description: "Résidence du seigneur, surplombant le village depuis la colline est. Des soldats inconnus y entrent de nuit. Theron y réside.",
    dangerLevel: 5,
  },
  {
    id: "marche",
    name: "Place du Marché",
    type: "Zone urbaine",
    description: "Centre commercial de Cendrebourg. De plus en plus désert à cause de l'insécurité et des taxes de Varen.",
    dangerLevel: 1,
  },
  {
    id: "chapelle",
    name: "Chapelle Abandonnée",
    type: "Bâtiment",
    description: "Ancienne chapelle dédiée aux esprits protecteurs du village. Abandonnée depuis que Varen a interdit les rassemblements religieux.",
    dangerLevel: 2,
  },
  {
    id: "pont_ancien",
    name: "Pont de l'Ancien Roi",
    type: "Passage",
    description: "Pont de pierre enjambant la rivière Grise à l'entrée sud du village. Point de passage obligé pour les marchands.",
    dangerLevel: 2,
  },
  {
    id: "mine",
    name: "Mine de Ferrecendre",
    type: "Donjon",
    description: "Ancienne mine de fer abandonnée dans les collines à l'ouest. Des bruits étranges en sortent depuis quelques semaines.",
    dangerLevel: 3,
  },
];

export const KEY_NPCS = [
  { name: "Aldric", role: "Tavernier du Griffon Noir", faction: "Aucune", notes: "Ancien Garde Royale, sait beaucoup, cache une lettre compromettante" },
  { name: "Elara", role: "Marchande itinérante", faction: "Royaume du Nord (secrètement)", notes: "Espionne enquêtant sur Varen" },
  { name: "Gareth", role: "Capitaine de la Garde", faction: "garde", notes: "Tiraillé entre loyauté et conscience" },
  { name: "Seigneur Varen", role: "Seigneur de Cendrebourg", faction: "cercle (allié)", notes: "Rencontre un nécromancien, étouffe l'enquête sur les disparitions" },
  { name: "Theron", role: "Conseiller de Varen", faction: "cercle", notes: "Agent du Cercle d'Obsidienne, arrivé il y a 4 mois, menace ceux qui posent des questions" },
  { name: "Soren le Balafré", role: "Chef des Lames Grises", faction: "lames_grises", notes: "Mercenaire avec un code d'honneur, ouvert aux contrats si le prix est bon" },
  { name: "Helga Pierrenoire", role: "Cheffe de la Guilde des Marchands", faction: "marchands", notes: "Furieuse contre les taxes de Varen, cherche un moyen de résister" },
  { name: "Marta", role: "Ancienne propriétaire du Griffon Noir", faction: "Aucune", notes: "A disparu mystérieusement — Aldric a repris sa taverne" },
];

export const QUEST_TYPES = [
  { id: "investigation", label: "🔍 Investigation", description: "Enquêter, trouver des indices, interroger des témoins" },
  { id: "combat", label: "⚔️ Combat", description: "Affronter des ennemis, protéger quelqu'un, nettoyer une zone" },
  { id: "infiltration", label: "🕵️ Infiltration", description: "Se faufiler, voler, espionner, rester discret" },
  { id: "diplomatie", label: "🤝 Diplomatie", description: "Négocier, convaincre, forger des alliances" },
  { id: "escort", label: "🛡️ Escorte", description: "Protéger un PNJ lors d'un déplacement dangereux" },
  { id: "collecte", label: "📦 Collecte", description: "Rassembler des objets, ingrédients ou informations" },
];

export const PLAYER_CLASSES = [
  { id: "guerrier", label: "⚔️ Guerrier", strengths: "Combat, intimidation, endurance" },
  { id: "voleur", label: "🗡️ Voleur", strengths: "Discrétion, crochetage, agilité" },
  { id: "mage", label: "🔮 Mage", strengths: "Magie, connaissance arcane, détection" },
  { id: "barde", label: "🎵 Barde", strengths: "Persuasion, charme, savoir" },
  { id: "ranger", label: "🏹 Ranger", strengths: "Pistage, survie, tir à l'arc" },
];

export const COMPLETED_QUESTS_EXAMPLES = [
  "A découvert l'identité du nécromancien dans les ruines du Nord",
  "A convaincu Aldric de révéler l'existence de la lettre cachée",
  "A escorté un marchand à travers la forêt de Brumesombre",
  "A infiltré le château de nuit et découvert les soldats inconnus",
  "A négocié une alliance entre les Lames Grises et la Guilde des Marchands",
  "A retrouvé des traces de rituels dans la clairière de Brumesombre",
  "A gagné la confiance de Gareth en mentionnant son passé avec Aldric",
];
