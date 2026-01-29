# 🍳 Recepten Vinder

Een slimme recepten-app die het perfecte recept vindt op basis van je ingrediënten, beschikbare tijd en persoonlijke voorkeuren.

![Recepten Vinder Screenshot](docs/screenshot.png)

## ✨ Features

### 🔍 Slim Zoeksysteem
- **Zoek op ingrediënt** - Kies je hoofdingrediënt (kip, vis, tofu, etc.)
- **Bereidingswijze** - Filter op oven, pan, BBQ, airfryer, slowcooker of wok
- **Tijdslimiet** - Vind recepten die passen in je beschikbare tijd
- **Dieetwensen** - Vegetarisch, vegan, low carb, high protein, etc.
- **Keukenstijl** - Italiaans, Aziatisch, Mexicaans, Hollands en meer

### 📚 Persoonlijke Bibliotheek
- Sla je favoriete recepten op
- Bekijk recent toegevoegde recepten
- Filter op favorieten (4-5 sterren)
- Data blijft bewaard in je browser

### ⭐ Beoordelingssysteem
- Geef recepten 1-5 sterren
- Hoog beoordeelde recepten worden vaker aanbevolen
- Laag beoordeelde recepten worden uitgesloten
- Het systeem leert van je voorkeuren

### 🌐 AI-Powered Online Zoeken (Optioneel)
- Zoekt automatisch online als je bibliotheek niet genoeg resultaten heeft
- Vindt recepten op populaire sites (Allerhande, Leukerecepten, etc.)
- Voegt gevonden recepten toe aan je bibliotheek

## 🚀 Installatie

### Optie 1: Direct gebruiken (zonder API)
1. Clone de repository:
   ```bash
   git clone https://github.com/JOUW-USERNAME/recepten-vinder.git
   ```
2. Open `index.html` in je browser
3. Klaar! Je kunt de app gebruiken met de lokale bibliotheek

### Optie 2: Met AI-powered zoeken
1. Maak een account op [Anthropic Console](https://console.anthropic.com)
2. Genereer een API key
3. Open `js/config.js` en voeg je key toe:
   ```javascript
   ANTHROPIC_API_KEY: 'jouw-api-key-hier',
   ```
4. Open `index.html` in je browser

### Optie 3: Deployen naar GitHub Pages
1. Fork deze repository
2. Ga naar Settings → Pages
3. Selecteer "Deploy from a branch" → `main` → `/ (root)`
4. Je app is live op `https://jouw-username.github.io/recepten-vinder`

## 📁 Project Structuur

```
recepten-vinder/
├── index.html          # Hoofdpagina
├── css/
│   └── style.css       # Styling
├── js/
│   ├── config.js       # Configuratie (API key hier)
│   └── app.js          # Applicatie logica
├── assets/
│   ├── favicon.svg     # Favicon
│   └── og-image.png    # Social media preview
├── docs/
│   └── screenshot.png  # Screenshot voor README
├── LICENSE             # MIT License
└── README.md           # Dit bestand
```

## 🔧 Configuratie

### config.js Opties

| Optie | Beschrijving | Default |
|-------|--------------|---------|
| `ANTHROPIC_API_KEY` | Je Anthropic API key (optioneel) | `''` |
| `MODEL` | Claude model voor zoeken | `claude-sonnet-4-20250514` |
| `MAX_TOKENS` | Max tokens per API call | `4000` |
| `SEARCH.MIN_LIBRARY_RESULTS` | Minimum resultaten voordat online wordt gezocht | `3` |
| `SEARCH.MAX_RESULTS` | Maximum aantal getoonde recepten | `6` |
| `SEARCH.TIME_TOLERANCE` | Extra tijd tolerantie (minuten) | `15` |

## 🛡️ Privacy & Beveiliging

- **Geen tracking** - We verzamelen geen data
- **Lokale opslag** - Je bibliotheek blijft in je browser
- **Open source** - Bekijk precies wat de code doet
- **API key veiligheid** - Zet nooit je key in een publieke repo!

### API Key Veilig Gebruiken
Voor productie raden we aan:
1. Gebruik een backend proxy
2. Of gebruik environment variables
3. Of host privé en deel de link niet

## 🤝 Bijdragen

Bijdragen zijn welkom! 

1. Fork de repository
2. Maak een feature branch (`git checkout -b feature/nieuwe-feature`)
3. Commit je changes (`git commit -m 'Voeg nieuwe feature toe'`)
4. Push naar de branch (`git push origin feature/nieuwe-feature`)
5. Open een Pull Request

### Ideeën voor bijdragen
- [ ] Boodschappenlijst functie
- [ ] Export recepten naar PDF
- [ ] Delen via social media
- [ ] Weekmenu planner
- [ ] Voedingswaarden calculator
- [ ] Dark mode
- [ ] Meertalige ondersteuning

## 📄 Licentie

Dit project is gelicenseerd onder de MIT License - zie het [LICENSE](LICENSE) bestand voor details.

## 🙏 Credits

- Fonts: [Google Fonts](https://fonts.google.com/) (Playfair Display, DM Sans)
- Icons: Native emoji
- AI: [Anthropic Claude](https://anthropic.com)

---

Gemaakt met ❤️ in Nederland
