# Altech Station — version de démonstration

Gestion d'une station-service, réduite à **deux activités** :

- **⛽ Carburant** — cuves, pompes et pistolets, brigades, pompistes, achats
  carburant, clients & fournisseurs, dépenses, fiche journalière, statistiques
  et rapports.
- **🏪 Magasin** — point de vente, ventes, gestion de stock, inventaire, achats,
  clients, fournisseurs, employés, dépenses, caisse, rapports et retours
  clients.

À quoi s'ajoutent les écrans transverses : **Caisse Générale**, **Comptes
bancaires** et **Rapports Généraux** (bilan consolidé, analyses, fonds de
roulement, valeur du stock, inventaires, zakât, personnel, trésorerie).

## ⚠️ Ce qu'est une « version de démonstration »

**L'application ne se connecte à aucune base de données.** Tout ce qu'elle
affiche vient d'un jeu de données constant :

| Fichier | Rôle |
|---|---|
| `src/lib/demoSeed.ts` | Les données elles-mêmes — station, cuves, pompes, personnel, clients, catalogue, ventes, achats, trésorerie… |
| `src/lib/demoDb.ts` | Les tables en mémoire et un client qui imite l'API réseau que l'application appelait |
| `src/lib/supabase.ts` | La façade historique (`db`, `signIn`, `subscribeTable`…), désormais branchée sur la mémoire |

Les **écritures fonctionnent** — créer un produit, encaisser une vente, payer un
employé — et se voient immédiatement. Elles vivent le temps de l'onglet : un
rechargement de la page rend le jeu de démonstration intact.

## 🚀 Démarrer

```bash
npm install
npm run dev       # → http://localhost:3000
```

Sur la page de connexion, cliquez **« Entrer avec le compte démo »** : elle ouvre
l'application en administrateur, sans identifiants à saisir.

```bash
npm run build     # compile le frontend + le serveur
npm start         # → http://localhost:3000
npm run lint      # tsc --noEmit
```

## 🎨 Design

- Palette Naftal : bleu `#003087`, jaune `#FFB800`
- Cartes glassmorphism, dégradés et ombres colorées
- Transitions Framer Motion, barre latérale persistante sur poste fixe et tiroir
  animé sur mobile
- Interface française avec bascule arabe (RTL)
