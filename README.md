# SayNubian

Voice-first Nubian language learning app — web, iOS, and Android from one codebase.

**Live web app**: <https://samirsalih.github.io/SayNubian/>

## Stack

- **Vite + React 18** — web app
- **Capacitor 6** — native iOS + Android wrappers around the same web bundle
- **Plain CSS variables** for theming (`src/tokens.css`)

## Develop (web)

```sh
npm install
npm run dev          # http://localhost:5173
```

## Build & preview

```sh
npm run build
npm run preview
```

## Native

After running `npm install`, add the Capacitor platforms (one-time):

```sh
npx cap add ios
npx cap add android
```

Then open in Xcode / Android Studio:

```sh
npm run ios          # builds web bundle, syncs, opens Xcode
npm run android      # builds web bundle, syncs, opens Android Studio
```

Requirements:

- **iOS**: Xcode 15+, CocoaPods
- **Android**: Android Studio with Android SDK

## Layout

```
src/
  main.jsx          entry point
  App.jsx           tab navigator + routing
  tokens.css        themes (Nile/Sand/Indigo/Reed) + light/dark
  lib/
    data.js         curriculum, words, dialogues
    primitives.jsx  Icon, Waveform, RecordRing, TabBar, TopBar
  screens/
    Home.jsx        learning path + daily goal
    Lesson.jsx      HEAR · DISTINGUISH · PRODUCE loop
    Words.jsx       dictionary
    Sounds.jsx      alphabet + dialogues
    Speak.jsx       freeform speak/practice
    Chat.jsx        Eeni AI tutor
```
