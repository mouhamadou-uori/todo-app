# Todo — Cordova + jQuery Mobile

Une liste de tâches mobile pilotée au geste : on ajoute avec un bouton, on barre d'un swipe à droite, on supprime d'un swipe à gauche, et on remet en chantier en re-swipant à droite. Les tâches sont rangées dans deux compartiments (`en cours` / `terminées`) qui n'apparaissent que s'il y a quelque chose dedans.

Build : Cordova (Android). UI : jQuery Mobile 1.4.5, chargé en local pour rester fonctionnel hors-ligne.

## Gestes

| Geste | Compartiment | Action |
|---|---|---|
| swipe → | en cours | la tâche passe dans « terminées » |
| swipe → | terminées | la tâche revient dans « en cours » |
| swipe ← | l'un ou l'autre | suppression |
| bouton **ajouter** | — | nouvelle tâche en haut de « en cours » |
| bouton **réinitialiser** | — | efface tout, **headers compris** |

Les tâches sont persistées en `localStorage`, donc elles survivent à un kill de l'app.

## Tester sans builder

Ouvrir `www/index.html` directement dans Chrome → DevTools → activer le mode mobile (touch emulation). Les swipes fonctionnent en cliquant-glissant.

## Builder pour Android

Prérequis :

- Node ≥ 16, Cordova CLI (`npm install -g cordova`)
- JDK 17 (`sudo apt install openjdk-17-jdk`)
- Android SDK avec build-tools + platform-tools + une plateforme `android-36` (via Android Studio ou `sdkmanager`)
- Variables d'environnement : `ANDROID_HOME` pointant vers le SDK, et `$ANDROID_HOME/platform-tools` + `$ANDROID_HOME/cmdline-tools/latest/bin` dans le `PATH`

```bash
cordova platform add android        # déjà fait dans ce repo après clone : ignorable
cordova requirements                # vérifie SDK / JDK / Gradle
cordova run android                 # téléphone branché en USB debug, ou émulateur lancé
```

Pour produire un APK debug sans le lancer :

```bash
cordova build android
# APK généré dans platforms/android/app/build/outputs/apk/debug/
```

> Le dossier `platforms/` est gitignoré. Après un `git clone`, lancer `cordova platform add android` pour le régénérer (les déps `cordova-android` sont déjà dans `package.json`).

## Arborescence

```
.
├── config.xml              # manifest Cordova
├── package.json
├── README.md
└── www/
    ├── index.html
    ├── css/app.css
    ├── js/app.js
    └── lib/                # jquery + jquery.mobile (servis localement)
```

## Notes

- jQuery Mobile 1.4.5 est la dernière version stable de la librairie ; son site n'est plus maintenu mais le code reste fonctionnel pour les WebViews Cordova.
- L'app reste volontairement épurée — pas de framework, pas de bundler, pas de transpilation. C'est du HTML/CSS/JS lisible directement.
