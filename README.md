# Brigade 36 — enquêtes hebdomadaires

Site statique GitHub Pages, avec les six enquêtes d'origine et un catalogue hebdomadaire supplémentaire.

## Publication automatique

Le workflow `.github/workflows/weekly-case.yml` s'exécute le vendredi à **18 h, heure de Paris** (les deux créneaux UTC couvrent les changements d'heure). Il appelle l'API OpenAI, génère une affaire, effectue des contrôles structurels, puis ajoute l'affaire à `data/weekly-cases.json` et la publie par commit GitHub. Les dossiers déjà publiés ne sont pas remplacés.

**Configuration indispensable :** dans **Settings → Secrets and variables → Actions → New repository secret**, créer `OPENAI_API_KEY` avec une clé API OpenAI valide, disposant de crédits. Un abonnement ChatGPT n'inclut pas nécessairement de crédits API. Ne jamais mettre la clé dans le code ou le site.

Le modèle par défaut est `gpt-4o-mini`. Pour le changer, définir la variable de dépôt `OPENAI_MODEL`. Les appels API peuvent être facturés.

**Contrôle qualité :** la génération est rejetée si le JSON est invalide, si des références manquent, si le coupable est absent ou si les preuves ne sont pas accessibles. Ces tests ne prouvent pas à eux seuls la cohérence narrative : une vérification humaine périodique reste recommandée. En cas d'échec, aucune affaire n'est publiée.

**Important :** le lancement manuel du workflow hors du vendredi à 18 h (Paris) ne publie rien. Les workflows GitHub Actions planifiés peuvent être retardés. Vérifier l'onglet Actions et les paramètres des autorisations de workflow si aucun commit n'est créé.

## Fichiers

- `index.html` : interface existante et chargement du catalogue
- `data/weekly-cases.json` : nouvelles affaires
- `scripts/weekly_case.py` : générateur et contrôles
- `.github/workflows/weekly-case.yml` : automatisation

Site : https://matthieujb.github.io/Brigade-36/
