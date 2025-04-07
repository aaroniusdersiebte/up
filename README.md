# Social Media Uploader

Ein plattformübergreifendes Tool zum Hochladen und zeitgesteuerten Veröffentlichen von Videos auf YouTube, Instagram und TikTok.

## Funktionen

- **Plattform-Unterstützung**: YouTube, Instagram und TikTok
- **Video-Upload**: Einfaches Hochladen auf mehrere Plattformen gleichzeitig
- **Zeitgesteuerte Veröffentlichung**: Plane Uploads im Voraus
- **Kalender-Ansicht**: Visualisiere geplante Uploads
- **Plattform-spezifische Einstellungen**: Anpassung für jeden Dienst

## Installation

### Voraussetzungen

- [Node.js](https://nodejs.org/) (v14 oder höher)
- npm (wird mit Node.js installiert)

### Einrichtung

1. Repository klonen oder herunterladen:
   ```
   git clone https://github.com/yourusername/social-media-uploader.git
   cd social-media-uploader
   ```

2. Abhängigkeiten installieren:
   ```
   npm install
   ```

3. Anwendung starten:
   ```
   npm start
   ```

   Für den Entwicklungsmodus mit Developer Tools:
   ```
   npm run dev
   ```

## Konfiguration

### API-Zugänge

Um die Anwendung nutzen zu können, benötigst du API-Zugänge für die verschiedenen Plattformen:

#### YouTube

1. Erstelle ein Projekt in der [Google Developer Console](https://console.cloud.google.com/)
2. Aktiviere die YouTube Data API v3
3. Erstelle OAuth 2.0-Anmeldedaten (Web-Anwendung)
4. Trage Client-ID, Client-Secret und API-Key in den Einstellungen der Anwendung ein

#### Instagram

1. Erstelle eine App auf [Facebook for Developers](https://developers.facebook.com/)
2. Aktiviere die Instagram Graph API
3. Trage App-ID und App-Secret in den Einstellungen der Anwendung ein

#### TikTok

1. Registriere dich auf [TikTok for Developers](https://developers.tiktok.com/)
2. Erstelle eine neue App
3. Trage Client-Key und Client-Secret in den Einstellungen der Anwendung ein

## Build erstellen

Um eine ausführbare Anwendung für dein Betriebssystem zu erstellen:

```
npm run build
```

Die erstellten Dateien findest du im `dist`-Verzeichnis.

## Beitrag leisten

Beiträge sind willkommen! Bitte erstelle einen Fork des Repositories und öffne einen Pull Request mit deinen Änderungen.

## Lizenz

MIT

## Hinweis

Diese Anwendung ist in der Entwicklung und nicht für den produktiven Einsatz gedacht. Die Nutzung der verschiedenen APIs unterliegt den jeweiligen Nutzungsbedingungen der Plattformen.