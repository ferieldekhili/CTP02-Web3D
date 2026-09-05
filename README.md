# TP02 Web3D

Ce projet présente une scène 3D interactive réalisée avec A-Frame dans le cadre du TP02 Web3D.

## Fonctionnalités

- Un grand sol horizontal recouvert d'une texture d'herbe.
- Un panorama à 360° utilisé comme skybox.
- Un cube rouge représentant le joueur.
- Des déplacements fluides avec accélération et décélération progressives.
- Un saut disponible uniquement lorsque le joueur touche le sol.
- Une caméra orbitale qui suit automatiquement le joueur.
- Des déplacements calculés selon l'orientation de la caméra.
- Une simulation physique basée sur Cannon.
- Six cubes dynamiques permettant de tester les collisions.
- Une rotation verrouillée sur le joueur afin qu'il reste stable pendant les impacts.

## Commandes

| Action | Commande |
| --- | --- |
| Avancer | `W` |
| Reculer | `S` |
| Aller à gauche | `A` |
| Aller à droite | `D` |
| Sauter | `Espace` |
| Faire tourner la caméra | Maintenir le bouton gauche et déplacer la souris |
| Zoomer | Molette de la souris |

Les touches de déplacement peuvent être combinées pour se déplacer en diagonale.

## Lancement

Aucune installation de dépendances n'est nécessaire. Il faut cependant disposer d'une connexion Internet pour charger A-Frame et le moteur physique depuis leurs CDN.

Depuis le dossier du projet, lancez un serveur local :

```bash
python3 -m http.server 8000
```

Ouvrez ensuite [http://localhost:8000](http://localhost:8000) dans un navigateur compatible avec WebGL.

## Structure du projet

```text
CTP02-Web3D/
├── assets/
│   ├── herbe.png
│   └── panorama-campagne.png
├── index.html
├── orbit-camera.js
├── player-movement.js
└── README.md
```

- `index.html` contient la scène, le joueur, le sol et les cubes physiques.
- `player-movement.js` gère les entrées clavier, les déplacements et le saut.
- `orbit-camera.js` gère le suivi, l'orbite et le zoom de la caméra.
- `assets/` contient les images utilisées pour le sol et le skybox.

## Technologies

- A-Frame 1.8.0
- C-Frame A-Frame Physics System 4.2.4
- JavaScript
- HTML
