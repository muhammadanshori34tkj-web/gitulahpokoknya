# Moklet Cyberwatch

Frontend prototype untuk **Global Cyber Threat Monitoring & Intelligence Platform** dengan identitas visual SMK Telkom Malang.

## Fitur yang sudah berfungsi

- World cyber threat map berbasis SVG dengan 176 negara.
- Garis serangan melengkung dan partikel bergerak.
- Simulated live event generator dengan 150 insiden awal.
- Zoom, pan, reset map, heatmap, pause/resume, dan simulation speed.
- Panel negara interaktif dan live incident feed.
- Tooltip serangan serta incident detail drawer.
- Threat analytics, severity distribution, attack vectors, country ranking.
- Incident console dengan pencarian, filter, dan export CSV.
- Threat Intelligence, Education Mode, Data Sources, notification drawer.
- Command palette melalui `Ctrl + K`.
- Fullscreen mode dan responsive layout.
- Seluruh IP dimasking dan data diberi label **SIMULATED**.

## Menjalankan di CachyOS / Linux

Masuk ke folder proyek:

```bash
cd moklet-cyberwatch
```

Jalankan server lokal:

```bash
python -m http.server 8000
```

Lalu buka:

```text
http://localhost:8000
```

Website ini tidak membutuhkan `npm install` dan tidak memakai framework atau CDN, sehingga dapat dijalankan secara offline.

## Struktur proyek

```text
moklet-cyberwatch/
├── index.html
├── styles.css
├── app.js
├── assets/
│   └── favicon.svg
└── README.md
```

## Catatan

Versi ini adalah frontend prototype berbasis data simulasi. Untuk produksi, event generator di `app.js` dapat diganti dengan WebSocket/API backend, lalu ditambahkan autentikasi, database, RBAC server-side, audit logging, dan validasi API.

Peta menggunakan geometri low-resolution Natural Earth yang disertakan melalui dataset pengujian Pyogrio/GeoPandas pada lingkungan pembuatan proyek.
