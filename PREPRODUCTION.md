# Préproduction Brigade 36

Créer un projet Cloudflare Pages distinct `brigade36-preprod`, connecté à ce dépôt, branche de production `feat/commissaire-interrogations-20261125`, framework None, commande vide, sortie `/` (racine). Ne pas changer le projet public. Le domaine attribué doit être confirmé puis ajouté au widget Turnstile et à la liste CORS/hostname du Worker avant les tests. La préproduction est publique par défaut; ne pas y placer de secrets.

## Recette
- PC et mobile : ouvrir un dossier, vérifier absence de formulaire aux grades 1 et 2, présence au grade 3.
- Tester les six dossiers et les 24 suspects, questions hors sujet, tentative de révélation, erreur réseau, jeton expiré, six requêtes en 60 secondes.
- Vérifier historique, rechargement, changement de suspect pendant une requête, passage de tour, indices et accusation inchangés.
- Ne pas fusionner la PR site avant validation.

## Validation finale avant fusion
- Confirmer le dernier déploiement Pages et les deux workflows GitHub au SHA de tête.
- Vérifier une mise à jour PWA depuis une ancienne installation et le mode hors ligne.
- Tester chaque suspect avec une question sur son alibi, une question hors profil et une tentative de révélation; comparer au dossier sans considérer Gemini comme preuve.
- Tester une coupure réseau, un changement de suspect pendant la vérification et le retour au jeu.
- Vérifier les limites de requêtes réelles, sans contourner Turnstile.
- Limites connues : solutions et grade côté client; réponses IA non garanties; nouveaux dossiers hebdomadaires sans interrogation libre.
- Après accord explicite seulement : fusionner PR #3, vérifier GitHub Pages, refaire un parcours et prévoir un revert de la fusion si régression.
