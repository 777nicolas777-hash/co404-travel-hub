# 🗺️ Co404 Tours & Travel Hub (Travel404)

> **Multi-location travel coordination platform and community exploration hub for Co404 Coliving**  
> Active locations: **Co404 San Cristóbal** (Chiapas, Mexico) &bull; **Co404 Oaxaca** (Oaxaca, Mexico) &bull; **Co404 Medellín** (Antioquia, Colombia)

![Travel404 Multi-Location](https://img.shields.io/badge/Co404-Tours%20%26%20Travel%20Hub-E2725B?style=for-the-badge)
![Zero Cost](https://img.shields.io/badge/Zero--Cost-100%25%20Free%20APIs-2E7D32?style=for-the-badge)
![Locations](https://img.shields.io/badge/Locations-San%20Cris%20%7C%20Oaxaca%20%7C%20Medell%C3%ADn-3F51B5?style=for-the-badge)

---

## 🌟 Overview

**Co404 Tours & Travel Hub (Travel404)** is a dedicated application crafted specifically for the **Co404 coliving community** (digital nomads, remote workers, volunteers, and staff). It replaces disorganized chat threads, unverified agency flyers, and confusing transport hubs with a single, elegant, and reliable web app.

### Key Capabilities:
- 📍 **Instant Multi-Location Switching:** Toggle smoothly between **Co404 San Cristóbal**, **Co404 Oaxaca**, and **Co404 Medellín** via the top-right header selector.
- 🏞️ **33 Curated Regional Expediciones:** Complete guides with exact distance in km, drive time, microclimate, suggested departures, packing lists, insider tips, and agency pricing.
- 📸 **Authentic Local Photography:** 37 real, high-resolution photographs stored locally without third-party broken links or placeholder art.
- 💬 **Bilingual WhatsApp Tour Dispatcher:** English user interface with courteous, localized Spanish quotation messages automatically requesting door-to-door pick-up at the specific Co404 address.
- 💱 **Multi-Currency Engine:** Native support for **MXN ($)**, **COP ($)**, **USD ($)**, and **EUR (€)** with clean thousands separators and automatic locale formatting.
- 🚐 **Community Van-Split Board:** Propose and join weekend group outings with fellow colivers to divide private van costs.
- 🚌 **DIY Colectivo & Public Transit Guides:** Step-by-step instructions, frequencies, terminal addresses, and exact fares for independent travelers.
- 🔍 **100% Zero-Cost Live Place Autocomplete:** Open geocoding & POI search engine (Photon + OpenStreetMap) with location biasing and free standard Google Maps links ($0.00 API billing guaranteed).
- ➕ **Scoped Custom Provider Directory:** Add trusted local drivers or specialized contacts stored independently per city in `localStorage`.

---

## 📍 Supported Co404 Houses & Destinations

### 1. Co404 San Cristóbal (Chiapas, Mexico)
- **Base Address:** Calle Real de Guadalupe / Barrio de Guadalupe, San Cristóbal de las Casas, Chiapas
- **Currency:** MXN (Mexican Pesos)
- **13 Expeditions:**
  1. Sumidero Canyon & Chiapa de Corzo (Boat safari & Mudéjar fountain)
  2. El Chiflón Waterfalls & Montebello Lakes (120m turquoise falls & border lakes)
  3. San Juan Chamula & Zinacantán (Indigenous Maya syncretism & looms)
  4. Palenque Ruins & Agua Azul Waterfalls (With drop-off to Palenque)
  5. ⭐ **Arco del Tiempo & Cañón de La Venta** *(Exclusive with Apasionado x Chiapas)*
  6. Bonampak Murals & Yaxchilán River Ruins (Usumacinta river & ancient frescos)
  7. Cenote Chukumaltik & Lagos de Colón (60m visibility cenote & Mayan ruins)
  8. El Arcotete Ecopark & Grutas de Rancho Nuevo (Limestone caves & zip-lines)
  9. Sima de las Cotorras & El Aguacero (Sinkhole parrot flight & canyon stairs)
  10. Toniná Acropolis & El Corralito Waterfalls (7-tier pyramid)
  11. Cascadas Las Nubes & Río Santo Domingo (Lacandona rainforest rapids)
  12. Cerro Huitepec & Moxviquil Orchid Reserve (Highland cloud forest & botanical garden)
  13. Guatemala International Shuttle (Lake Atitlán, Antigua & Panajachel direct)

### 2. Co404 Oaxaca (Oaxaca de Juárez, Mexico)
- **Base Address:** Avenida Benito Juárez 202, Centro, Oaxaca de Juárez, Oaxaca
- **Currency:** MXN (Mexican Pesos)
- **10 Expeditions:**
  1. Hierve el Agua Petrified Waterfalls (Mineral infinity pools & cliff trails)
  2. Monte Albán Archaeological Acropolis (Zapotec mountaintop capital)
  3. Santa María del Tule & Teotitlán del Valle (Giant ahuehuete & natural-dye looms)
  4. Santiago Matatlán Mezcal Capital Tour (Traditional palenques & artisanal tastings)
  5. San Martín Tilcajete & San Bartolo Coyotepec (Wood alebrijes & black clay pottery)
  6. Santiago Apoala Mixteca Canyon & Waterfalls (Emerald natural pools & red rock hikes)
  7. ⭐ **Pueblos Mancomunados & Sierra Norte Ecotourism** *(Exclusive with Expediciones Sierra Norte)*
  8. San José del Pacífico Cloud Forest & Temazcal (Temazcal & hanging bridges)
  9. Yagul Prehistoric Caves & Zapotec Fortress (UNESCO cliff paintings & palace ruins)
  10. Puerto Escondido Coast Express Shuttle (New Barranca Larga-Ventanilla highway)

### 3. Co404 Medellín (Laureles, Colombia)
- **Base Address:** Calle 43, Laureles - Estadio, Medellín, Antioquia
- **Currency:** COP (Colombian Pesos)
- **10 Expeditions:**
  1. Guatapé Rock & Peñol Reservoir Explorer (740-step monolith & zócalo village)
  2. ⭐ **Comuna 13 Graffiti, Street Art & Metrocable** *(Exclusive with La Sierra Tours)*
  3. Santa Fe de Antioquia Colonial Heritage & Occidente Bridge (Colonial capital & historic suspension bridge)
  4. Jardín Coffee Town & Cave of Splendor (Colorful balconies & horseback trails)
  5. Jericó Heritage Town & Cardamom Hills (Leather carriel craft workshops & cable car)
  6. Parque Arví Ecotourism Reserve & Metrocable Line L (High Andean cloud forest)
  7. Río Claro Valley & Marble Canyon Eco-Expedition (Marble river rafting & caving)
  8. Artisanal Coffee Finca Experience & Cupping (Tree-to-cup in Fredonia/Amagá)
  9. Tandem Paragliding over Aburrá Valley (San Félix thermal flight)
  10. Salto del Buey Waterfall & High-Wire Canopy (100m cascade & via ferrata)

---

## 🛠️ Architecture & Zero-Cost Design

Travel404 is intentionally engineered to require **zero paid cloud subscriptions, zero external databases, and zero API costs**:

```
[ Frontend: index.html + styles.css + app.js ]
                     │
       ┌─────────────┴─────────────┐
       ▼                           ▼
[ Client-Side State ]     [ Local Server (server.js) ]
  • tours_data.js                • Static asset serving
  • localStorage Persistence     • /api/places-search
  • Multi-Currency Engine        • Photon/OSM free geocoding
  • WhatsApp Message Builder     • City coordinates biasing
```

- **Open POI Search:** Queries Photon (OpenStreetMap data) with local coordinate centers:
  - San Cristóbal: `16.7370, -92.6376`
  - Oaxaca: `17.0605, -96.7256`
  - Medellín: `6.2442, -75.5812`
- **Free Web Navigation Links:** Generates canonical search URLs (`https://www.google.com/maps/search/?api=1&query=...`) that open directly in the user's browser at $0.00 cost.
- **Local Isolation:** Custom drivers and group trips added in one city remain scoped to that specific city in `localStorage`.

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- A modern web browser

### Running Locally
1. Clone this repository:
   ```bash
   git clone https://github.com/777nicolas777-hash/co404-travel-hub.git
   cd co404-travel-hub
   ```
2. Start the local server:
   ```bash
   npm start
   # or: node server.js
   ```
3. Open your browser at:
   ```
   http://127.0.0.1:3002/
   ```

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
Curated with ❤️ for the **Co404 Coliving Community**.
