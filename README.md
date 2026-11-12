# Brigade 36 — nouvelles enquêtes automatiques

Les six enquêtes d'origine sont conservées. Chaque vendredi à partir de **18 h, heure de Paris**, GitHub Actions tente de générer une nouvelle enquête policière par IA, la contrôle puis l'ajoute automatiquement au site GitHub Pages.

## Fonctionnement

1. Le workflow `.github/workflows/weekly-case.yml` démarre le vendredi (créneaux UTC d'été et d'hiver).
2. `scripts/weekly_case.py` appelle l'API OpenAI et vérifie la structure : suspects, indices, lieux, preuves accessibles, coupable défini et conclusion.
3. En cas de validation, `data/weekly-cases.json` est mis à jour sur `main`, déclenchant le déploiement GitHub Pages.
4. En cas d'échec des contrôles, rien n'est publié. Un seul dossier par vendredi est autorisé.

## Configuration indispensable

Dans **Settings → Secrets and variables → Actions**, créer le secret de dépôt `OPENAI_API_KEY` avec une véritable clé API OpenAI. Ne jamais placer la clé dans le code. L'API est facturée séparément de ChatGPT.

Dans **Settings → Actions → General**, vérifier que le jeton du workflow peut écrire dans le dépôt (Read and write permissions). Le modèle par défaut est `gpt-4o-mini`; une variable de dépôt `OPENAI_MODEL` permet de le modifier.

## Limites importantes

Les validations automatisées contrôlent les références et les contraintes de structure, mais **ne prouvent pas la cohérence logique complète du scénario**. Une erreur narrative peut donc passer. Une relecture humaine régulière est recommandée, même si la publication n'attend plus son approbation.

GitHub Actions peut démarrer avec retard; la publication n'est pas garantie à la minute près. Une exécution manuelle hors du vendredi à partir de 18 h à Paris ne publie rien.

Site : https://matthieujb.github.io/Brigade-36/
