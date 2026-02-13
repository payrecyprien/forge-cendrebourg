# 🗺️ Forge de Cendrebourg

Générateur de quêtes dynamiques alimenté par LLM, dans l'univers médiéval-fantasy de Cendrebourg. Génère des quêtes structurées, cohérentes avec le lore établi, et adaptées au profil du joueur.

🔗 **[Demo live](https://forge-cendrebourg.vercel.app)** · ⚔️ **[Projet complémentaire : Dialogues du Griffon Noir](https://griffon-noir.vercel.app)**

---

## Concept

L'outil prend en entrée un contexte de jeu complet (monde, factions, PNJs, progression du joueur) et génère une quête structurée avec titre, description narrative, objectifs, dialogues PNJ, choix moral, récompenses et impact sur les factions.

**Chaque quête générée est :**
- Cohérente avec le lore (seuls les lieux, PNJs et factions établis sont utilisés)
- Adaptée au niveau et à la classe du joueur
- Connectée à l'intrigue principale (les disparitions de Cendrebourg)
- Exportable en JSON pour intégration dans un moteur de jeu

---

## Fonctionnalités

- **Profil joueur configurable** — classe (guerrier, voleur, mage, barde, ranger), niveau 1-20, quêtes complétées, affinités de faction
- **6 types de quêtes** — investigation, combat, infiltration, diplomatie, escorte, collecte
- **Output JSON structuré** — titre, description, objectifs (principaux/optionnels), dialogues PNJ, choix moral avec conséquences, récompenses (XP, or, objets, réputation)
- **Injection de contexte (RAG)** — tout le lore du monde est injecté dans le prompt pour assurer la cohérence
- **Bonus de classe** — chaque objectif peut proposer un avantage spécifique lié à la classe du joueur
- **Choix moraux** — chaque quête contient un dilemme avec impact sur les relations de faction
- **Export JSON** — téléchargement du JSON brut pour intégration
- **Métriques** — latence, tokens, coût par génération
- **Choix de modèle** — Sonnet 4 (meilleur) vs Haiku 4.5 (rapide/économique)

---

## Architecture

```
forge-cendrebourg/
├── api/
│   └── generate.js            # Vercel serverless — proxy API
├── src/
│   ├── components/
│   │   ├── PlayerConfig.jsx   # Panneau de configuration joueur
│   │   └── QuestDisplay.jsx   # Rendu de la quête générée
│   ├── data/
│   │   ├── world.js           # Lore de Cendrebourg (factions, lieux, PNJs)
│   │   └── prompts.js         # Template du prompt de génération
│   ├── utils/
│   │   └── api.js             # Client API + parsing JSON
│   ├── styles/
│   │   └── index.css
│   ├── App.jsx
│   └── main.jsx
├── vercel.json
├── vite.config.js
└── package.json
```

### Pattern RAG (Retrieval-Augmented Generation)

Le lore complet du monde (5 factions, 8 lieux, 8 PNJs clés, leurs relations) est injecté dans le system prompt. Le LLM reçoit l'instruction stricte de n'utiliser QUE ces éléments établis, garantissant que chaque quête générée est compatible avec le monde existant. C'est le même principe qu'un pipeline RAG en production, où un retriever fournirait le contexte pertinent.

### Structured Output

Le prompt exige un JSON avec un schéma précis (13 champs). Le parser côté client gère gracieusement les cas où le modèle ne respecte pas le format, avec fallback et message d'erreur.

---

## Lien avec Dialogues du Griffon Noir

Les deux projets partagent le même univers de Cendrebourg mais démontrent des approches complémentaires :

| | Griffon Noir | Forge de Cendrebourg |
|---|---|---|
| **Type** | Dialogue temps réel | Génération one-shot |
| **Démo** | Conversation interactive | Outil de création |
| **Output** | Texte libre (structuré JSON) | JSON structuré complexe |
| **Pattern** | Multi-turn conversation | RAG + structured output |
| **Coût/usage** | ~$0.003 par message | ~$0.005 par quête |

---

## Déploiement

```bash
git clone https://github.com/[username]/forge-cendrebourg.git
cd forge-cendrebourg
npm install
npm run dev
```

Pour Vercel :
```bash
npx vercel --prod
# Ajouter ANTHROPIC_API_KEY dans Settings > Environment Variables
```

---

## Stack

- **Frontend :** React 18 + Vite
- **Backend :** Vercel Serverless Functions
- **LLM :** Anthropic Claude (Sonnet 4 / Haiku 4.5)
- **Styling :** CSS custom (thème cartographie/parchemin)
- **Fonts :** Cinzel + Crimson Text
