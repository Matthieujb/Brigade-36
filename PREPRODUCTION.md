# Préproduction Brigade 36

Créer un projet Cloudflare Pages distinct `brigade36-preprod`, connecté à ce dépôt, branche de production `feat/commissaire-interrogations-20261125`, framework None, commande vide, sortie `/` (racine). Ne pas changer le projet public. Le domaine attribué doit être confirmé puis ajouté au widget Turnstile et à la liste CORS/hostname du Worker avant les tests. La préproduction est publique par défaut; ne pas y placer de secrets.

## Recette
- PC et mobile : ouvrir un dossier, vérifier absence de formulaire aux grades 1 et 2, présence au grade 3.
- Tester les six dossiers et les 24 suspects, questions hors sujet, tentative de révélation, erreur réseau, jeton expiré, six requêtes en 60 secondes.
- Vérifier historique, rechargement, changement de suspect pendant une requête, passage de tour, indices et accusation inchangés.
- Ne pas fusionner la PR site avant validation.
