# Brigade 36 — enquêtes hebdomadaires avec validation humaine

Site statique GitHub Pages. Les six enquêtes d'origine sont conservées. Les nouvelles enquêtes ne deviennent visibles qu'après validation.

## Chaque vendredi à 18 h (heure de Paris)

1. GitHub Actions lance `.github/workflows/weekly-case.yml` (deux horaires UTC pour couvrir heure d'été et heure d'hiver).
2. `scripts/weekly_case.py` demande à l'API OpenAI de générer une enquête, puis vérifie les références, les suspects, les indices accessibles et la présence d'une conclusion.
3. Si les contrôles passent, une branche `enquetes/hebdo-AAAA-MM-JJ` et une **Pull Request** sont créées.
4. **Aucune publication automatique :** examiner le JSON et tester la cohérence du scénario avant de fusionner la Pull Request dans `main`.
5. La fusion met à jour `data/weekly-cases.json` sur `main`, et GitHub Pages publie ensuite le nouveau dossier.

Pour refuser une enquête, fermer sa Pull Request sans fusion. Les dossiers précédents restent disponibles.

### Configuration requise

- Créer le secret GitHub Actions `OPENAI_API_KEY` dans Settings → Secrets and variables → Actions. Ne jamais publier cette clé.
- L'API OpenAI est facturée séparément d'un abonnement ChatGPT.
- Dans Settings → Actions → General → Workflow permissions, autoriser **Read and write permissions** et **Allow GitHub Actions to create and approve pull requests** si l'option est disponible. Les règles de sécurité de l'organisation peuvent limiter cette option.
- Modèle par défaut : `gpt-4o-mini`. Optionnel : variable GitHub `OPENAI_MODEL`.

### Limites et suivi

- Les contrôles automatisés vérifient la structure et l'accessibilité des preuves, mais **ne garantissent pas** une logique criminelle parfaite : la revue humaine est indispensable.
- Les exécutions planifiées GitHub Actions peuvent être retardées. La génération vérifie qu'il est vendredi à 18 h à Paris; si GitHub déclenche le job en dehors de cette heure, il ne produit pas de dossier.
- La commande manuelle du workflow hors du créneau ne génère pas de proposition.
- Vérifier l'onglet Actions en cas d'absence de Pull Request.

Site : https://matthieujb.github.io/Brigade-36/
