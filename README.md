# MOKLET CYBERWATCH

**Global Cyber Threat Monitoring & Intelligence Platform**  
Prototype frontend interaktif untuk visualisasi, analisis, pembelajaran, dan pelaporan keamanan siber defensif dengan identitas SMK Telkom Malang.

> **Penting:** seluruh incident, jalur serangan, indikator, statistik, akun, alamat IP, domain, dan threat intelligence di proyek ini merupakan **data simulasi, data tersanitasi, atau data dokumentasi**. Dashboard ini tidak mendeteksi serangan dunia nyata, tidak mengirim traffic, dan tidak menyediakan fungsi ofensif.

---

## 1. Gambaran Umum

Moklet Cyberwatch dibuat seperti sebuah **Security Operations Center (SOC) command center**. Elemen utamanya adalah peta dunia interaktif yang menampilkan jalur event siber simulasi dari negara sumber menuju negara tujuan.

Website dibangun menggunakan:

- HTML5
- CSS3
- JavaScript murni
- SVG untuk peta, chart, arc, node, heatmap, dan animasi
- `localStorage` untuk menyimpan progress pendidikan, bookmark, catatan, setting, dan metadata report

Tidak ada framework, package manager, database, CDN, atau proses build. Karena itu website dapat dijalankan secara offline dan dapat langsung di-deploy sebagai static site.

---

## 2. Fitur Utama

### Global Threat Map

- Peta dunia SVG dengan 176 geometri negara.
- Zoom menggunakan scroll mouse.
- Pan dengan drag pointer.
- Reset posisi dan zoom.
- Attack arc melengkung antarnegara.
- Partikel bergerak mengikuti attack arc.
- Source node, destination node, pulse ring, dan heat point.
- Tooltip event berisi ID, severity, route, source IP tersamarkan, sector, confidence, dan status.
- Klik attack arc untuk membuka incident detail.
- Klik negara untuk memperbarui country intelligence panel.
- Tombol hide/show heatmap.
- Tombol hide/show attack lines.
- Pause/resume live simulation.
- Kecepatan generator `0.5×`, `1×`, dan `2×`.
- Pembatasan active arc agar rendering tetap ringan.

### Live Incident Feed

- Event terbaru muncul secara incremental tanpa me-render ulang seluruh panel.
- Filter:
  - All
  - Critical
  - Blocked
- Menampilkan waktu, severity, status, attack type, sector, route, dan confidence.
- Klik item untuk melihat incident detail.

### Real-Time Ticker

- Menampilkan ringkasan event terbaru.
- Dapat di-pause tanpa menghentikan live generator.
- Update ticker ditunda sampai satu siklus animasi selesai agar tidak terlihat melompat.

### Operational Overview

Delapan metric utama:

1. Total Threat Events
2. Active Incidents
3. Critical Alerts
4. Blocked Attempts
5. Countries Detected
6. Average Response
7. Protected Assets
8. System Health

Setiap metric memiliki nilai, indikator perubahan, accent berdasarkan status, dan sparkline.

### Security Score

Moklet Security Score menampilkan nilai kesiapan keamanan berdasarkan:

- Network Security
- Endpoint Security
- Authentication
- Patch Compliance
- Incident Response

Nilai saat ini merupakan contoh simulasi dan bukan hasil audit nyata.

### SOC Status

Menampilkan status:

- API
- Stream
- Database
- Map Renderer
- Alert Engine
- Data Latency

Mini terminal memperlihatkan urutan pipeline simulasi:

1. Stream connected
2. Event received
3. Event normalized
4. Alert matched
5. Dashboard updated

---

## 3. Navigasi dan Halaman

Header memiliki halaman berikut:

- **Global Map**
- **Threat Analytics**
- **Live Incidents**
- **Intelligence**
- **Education**
- **Data Sources**
- **Reports**

Command palette dapat dibuka menggunakan:

```text
Ctrl + K
```

Command palette menyediakan navigasi cepat, pause stream, fullscreen, critical incident view, dan dashboard settings.

---

## 4. Global Map Secara Rinci

### Warna Attack Type

| Attack Type | Warna |
|---|---|
| DDoS | Merah terang |
| Malware | Magenta |
| Phishing | Oranye |
| Brute Force | Cyan |
| Botnet | Ungu |
| Web Exploit | Kuning |
| Suspicious Login | Hijau kebiruan |
| Ransomware | Merah gelap |

### Severity

| Severity | Makna pada prototype |
|---|---|
| Critical | Prioritas tertinggi |
| High | Perlu investigasi cepat |
| Medium | Perlu korelasi dan monitoring |
| Low | Risiko rendah |
| Info | Informasi telemetry |

### Country Intelligence Panel

Saat negara dipilih, panel kiri memperbarui:

- Nama negara
- ISO code
- Attack rank simulasi
- Incoming event
- Outgoing event
- Total detection
- Distribusi attack type
- Waktu update terakhir

Tombol **More details** membuka Threat Analytics dan otomatis memilih negara tersebut. Tombol **Generate report** membuka Reporting Center dan mengisi country report untuk negara terpilih.

### Map Performance

Untuk mencegah lag:

- Event baru ditambahkan secara incremental.
- Maksimum arc aktif dibatasi.
- Event lama dihapus dengan fade singkat.
- Partikel menggunakan SVG `animateMotion`.
- Pan dan zoom menggunakan `requestAnimationFrame`.
- Scan line menggunakan `transform`, bukan perubahan layout.
- Perangkat dengan resource rendah otomatis memakai jumlah arc lebih sedikit.

---

## 5. Threat Analytics

Halaman Threat Analytics adalah pusat analisis telemetry simulasi.

### Filter

Filter yang tersedia:

- Time range:
  - Last 24 Hours
  - Last 7 Days
  - Last 30 Days
  - All simulated data
- Country
- Severity
- Target sector

Semua panel diperbarui langsung ketika filter berubah.

### KPI Analytics

- Matched Events
- Critical Events
- Blocked Rate
- Average Confidence

### Panel Analytics

#### Threat Volume Over Time

Menampilkan dua garis:

- Semua event
- Critical + high event

Bucket waktu berubah mengikuti time range.

#### Severity Distribution

Membandingkan jumlah:

- Critical
- High
- Medium
- Low
- Informational

#### Top Attack Vectors

Mengurutkan attack type berdasarkan jumlah event hasil filter.

#### Targeted Sectors

Membandingkan sektor target seperti:

- Education
- Government
- Finance
- Healthcare
- Cloud
- Telecommunication
- Energy
- E-commerce

#### Incident Status

Menampilkan distribusi:

- Blocked
- Investigating
- Monitoring
- Resolved
- False Positive

#### Top Source Countries

Negara yang paling sering muncul sebagai sumber event simulasi.

#### Top Targeted Countries

Negara yang paling sering muncul sebagai destination.

#### Protocol Activity

Protokol simulasi yang dianalisis:

- HTTPS
- TCP
- UDP
- DNS
- SSH
- RDP
- HTTP/S

#### Detection Confidence

Confidence dibagi ke rentang:

- 60–69%
- 70–79%
- 80–89%
- 90–100%

#### Risk Matrix

Matrix 5×5 untuk menggambarkan hubungan likelihood dan impact secara edukatif.

#### Day × Hour Heatmap

Menampilkan kepadatan event simulasi berdasarkan hari dan jam.

### Export Analytics

Tombol **Export snapshot** mengunduh JSON yang berisi:

- Waktu pembuatan
- Filter aktif
- Total event
- Total critical
- Total blocked
- Distribusi attack type
- Distribusi sector
- Distribusi destination country

---

## 6. Live Incident Console

Incident Console menyediakan tabel incident yang dapat dicari, difilter, diurutkan, dan dipaginasi.

### Pencarian

Pencarian memeriksa:

- Incident ID
- Attack type
- Source country
- Destination country
- Target sector
- MITRE mapping

### Filter dan Sorting

- Severity
- Status
- Newest first
- Highest severity
- Highest confidence

### Pagination

Setiap halaman memuat 20 incident agar DOM tetap ringan.

### Incident Detail Drawer

Klik baris incident untuk melihat:

- Severity
- Status
- Attack type
- Confidence
- Source dan destination
- Masked IP
- Target sector
- Detection source
- Detection timeline
- MITRE ATT&CK mapping
- Sanitized indicators
- Defensive recommendation
- Analyst notes

Aksi yang tersedia:

- Save note
- Mark false positive
- Resolve incident
- Copy sanitized indicator

### Create Simulated Incident

Tombol **Create simulated incident** membuka form untuk membuat data demo baru.

Form hanya menambahkan object ke memori browser. Form tersebut:

- Tidak mengirim packet
- Tidak menjalankan exploit
- Tidak menyentuh target eksternal
- Tidak tersimpan setelah tab ditutup

### Export CSV

CSV berisi:

- ID
- Timestamp
- Severity
- Attack type
- Source
- Destination
- Sector
- Confidence
- Status
- Data mode

---

## 7. Threat Intelligence

Threat Intelligence berisi data kampanye, trend, advisory, technique, indicator, exercise, dan malware-family simulasi.

### Filter Intelligence

- Search title, region, tag, ID, atau MITRE technique
- Category
- Severity
- Bookmark only

### Intelligence Summary

- Active intelligence
- Critical/high count
- Average confidence
- Region coverage

### Intelligence Card

Setiap card menampilkan:

- Intelligence ID
- Category
- Severity
- Title
- Summary
- Tags
- Confidence
- Region
- First seen
- Last seen
- Data disclaimer

### Bookmark

Bookmark disimpan di `localStorage` sehingga tetap tersedia setelah reload browser yang sama.

### Intelligence Detail Drawer

Menampilkan:

- Deskripsi lengkap
- MITRE ATT&CK mapping
- Sanitized IOC
- Defensive recommendation
- Related simulated incidents
- Analyst note

Sanitized IOC memakai format aman seperti:

```text
login-campus[.]example
hxxps://portal-check[.]example/auth
185.xxx.xxx.21
```

### New Intelligence Note

Catatan baru disimpan secara lokal dan tidak dikirim ke server.

---

## 8. Cyber Education Mode

Education Mode menyediakan sepuluh modul pembelajaran:

1. Apa itu DDoS?
2. Mengenali Phishing
3. Dasar Malware
4. Membaca Security Log
5. Pengenalan MITRE ATT&CK
6. Dasar Incident Response
7. Ransomware Readiness
8. Authentication Monitoring
9. Membuat Laporan Incident
10. Final Defensive Security Quiz

### Informasi Modul

Setiap modul memiliki:

- Nomor modul
- Category
- Level
- Estimasi durasi
- Description
- Learning objectives
- Lesson content
- Knowledge check
- Progress
- Completion status

### Quiz

Setiap modul memiliki pertanyaan pilihan ganda. Jawaban memberikan feedback langsung.

### Learning Progress

Progress dihitung dari:

- Score quiz
- Module completion

Progress disimpan di browser melalui:

```text
moklet-education-progress
```

### Badge

Badge dihitung berdasarkan:

- Menyelesaikan modul pertama
- Menyelesaikan lima modul
- Menyelesaikan seluruh modul
- Mendapat average quiz minimal 80%

### Safe Log Explorer

Menampilkan contoh log aman mengenai:

- Authentication failure
- Traffic spike
- Endpoint sandbox event

Setiap field dijelaskan agar siswa memahami cara membaca log tanpa menggunakan data produksi.

### Glossary

Glossary dapat dicari dan menjelaskan istilah seperti:

- Alert
- Incident
- Severity
- Confidence
- IOC
- TTP
- SIEM
- EDR
- IDS/IPS
- RLS
- False Positive
- Containment
- Anonymization

---

## 9. Data Sources

Halaman Data Sources menjelaskan sumber data yang digunakan prototype.

### Source yang Tersedia

- Demo Event Generator
- Educational Threat Dataset
- Moklet Sensor Sandbox
- Community Intelligence Demo
- Public Advisory Mirror
- Map Rendering Service

### Informasi Source

Setiap source menampilkan:

- Type
- Status
- Update interval
- Reliability
- Latency
- Volume
- Data mode
- Description

### Health Status

- Operational
- Delayed
- Degraded
- Disabled

### Refresh All

Tombol refresh memperbarui nilai simulasi:

- Latency
- Reliability
- Health status
- Sync log

### Source Detail

Drawer source memiliki:

- Health statistics
- Enable/disable source
- Auto synchronization toggle demo
- Health check
- Manual sync
- Privacy note

### Ingestion Log

Log memperlihatkan waktu, nama source, aksi, dan hasil status.

---

## 10. Reporting Center

Reporting Center membuat preview laporan dari data simulasi.

### Tipe Report

- Daily Threat Summary
- Weekly Security Report
- Incident Report
- Country Threat Report
- Student Learning Report

### Filter Report

- Date range
- Severity
- Country

### Optional Section

- Charts and analytics
- Incident timeline
- Defensive recommendations

### Preview Report

Preview memuat:

- Header dan disclaimer
- Executive summary
- Event summary
- Top attack vectors
- Top targeted countries
- Recent incident timeline
- Defensive recommendations

### Export

- Download JSON
- Print / Save PDF melalui browser

### Report History

Metadata report disimpan di localStorage:

```text
moklet-report-history
```

Isi report penuh tetap berada di memory session agar penyimpanan browser tidak terlalu besar.

---

## 11. Notification Center

Notification drawer menampilkan:

- Critical simulated incident
- Threat intelligence update
- Report generation
- Feed health update

Aksi:

- Mark all read
- Clear notifications

---

## 12. Dashboard Settings

Buka melalui tombol profil kanan atas atau command palette.

### Setting

- Enable/disable animation
- Compact UI mode
- Critical toast notification
- Maximum active attack arcs
- Reset local data

### Local Data yang Dapat Direset

- Intelligence bookmarks
- Intelligence notes
- Education progress
- Report history
- Dashboard settings

---

## 13. Struktur Simulated Incident

Contoh object:

```json
{
  "id": "INC-2026-000184",
  "timestamp": "2026-06-24T10:42:05+07:00",
  "attackType": "DDoS",
  "severity": "critical",
  "source": {
    "country": "Germany",
    "iso": "DEU",
    "city": "Frankfurt"
  },
  "destination": {
    "country": "Indonesia",
    "iso": "IDN",
    "city": "Malang"
  },
  "sourceIp": "185.xxx.xxx.21",
  "destinationIp": "103.xxx.xxx.10",
  "targetSector": "Education",
  "protocol": "HTTPS",
  "confidence": 94,
  "status": "blocked",
  "detectionSource": "Moklet Sensor Grid",
  "mitre": "T1498 Network Denial of Service",
  "dataMode": "simulated"
}
```

---

## 14. Penyimpanan Lokal

Prototype menggunakan localStorage berikut:

| Key | Isi |
|---|---|
| `moklet-intel-bookmarks` | ID intelligence yang dibookmark |
| `moklet-intel-notes` | Catatan analis lokal |
| `moklet-education-progress` | Score dan completion module |
| `moklet-report-history` | Metadata laporan |
| `moklet-dashboard-settings` | Preferensi tampilan dan performa |

Data tidak dikirim ke server.

---

## 15. Menjalankan Secara Lokal

### Linux / CachyOS

Masuk ke folder proyek:

```bash
cd moklet-cyberwatch-complete
```

Jalankan:

```bash
python -m http.server 8000
```

Buka:

```text
http://127.0.0.1:8000
```

Jika port 8000 dipakai:

```bash
python -m http.server 8080
```

### Menggunakan serve.sh

```bash
chmod +x serve.sh
./serve.sh
```

---

## 16. Deploy ke Vercel

Karena static site, tidak diperlukan build command.

### GitHub → Vercel

Upload file proyek ke GitHub, lalu pada Vercel:

```text
Add New → Project → Import Git Repository
```

Konfigurasi:

```text
Framework Preset : Other
Root Directory   : ./
Build Command    : kosong
Output Directory : kosong
Install Command  : kosong
```

Klik **Deploy**.

### Vercel CLI

```bash
vercel
vercel --prod
```

---

## 17. File yang Harus Di-upload

```text
index.html
styles.css
app.js
assets/
README.md
serve.sh
```

Folder proyek tidak memiliki:

- `node_modules`
- `.env`
- secret
- API key
- database credential

---

## 18. Struktur Proyek

```text
moklet-cyberwatch-complete/
├── index.html
├── styles.css
├── app.js
├── README.md
├── SMOOTH-FIX.md
├── serve.sh
└── assets/
    └── favicon.svg
```

### index.html

- Layout halaman
- SVG world map
- Header
- Main navigation
- Drawer
- Modal
- Accessibility labels

### styles.css

- Design system
- Responsive layout
- Tactical panels
- Charts
- Drawers
- Education UI
- Report UI
- Animation
- Performance profile
- Print stylesheet

### app.js

- Simulated event generator
- Map rendering
- Analytics aggregation
- Incident console
- Intelligence workspace
- Education progress
- Source health
- Report builder
- Settings
- Local storage

---

## 19. Mengganti Favicon

File favicon berada di:

```text
assets/favicon.svg
```

Cara paling mudah adalah mengganti file tersebut dan mempertahankan nama yang sama.

Referensi di `index.html`:

```html
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml" />
```

---

## 20. Mengganti Branding

Warna utama berada di bagian `:root` pada `styles.css`.

Contoh:

```css
--red: #e31e24;
--red-bright: #ff3040;
--cyan: #00d9ff;
--green: #2de38a;
--orange: #ff9f1c;
```

Nama platform dapat dicari di `index.html`:

```text
MOKLET CYBERWATCH
SMK Telkom Malang Cyber Monitoring Center
```

---

## 21. Menghubungkan Data Nyata

Prototype tidak boleh langsung diberi API key di frontend.

Arsitektur yang disarankan:

```text
Security Source
      ↓
Backend Collector / API
      ↓
Normalization + Validation + Masking
      ↓
Database / Message Queue
      ↓
Authenticated WebSocket or REST API
      ↓
Moklet Cyberwatch Frontend
```

Yang perlu diganti adalah fungsi:

```javascript
createIncident()
newLiveEvent()
seedData()
```

Praktik wajib:

- Mask IP dan data personal
- Validasi schema
- Authentication
- Authorization / RBAC
- Rate limiting
- CORS yang ketat
- Server-side secret
- Audit log
- Retention policy
- TLS
- Jangan mengirim raw secret ke browser

---

## 22. Accessibility

Fitur accessibility:

- Skip link
- Keyboard focus state
- `aria-label`
- Keyboard selection pada negara
- Severity tidak hanya dibedakan dengan warna
- Reduced motion support
- Responsive mobile layout
- Semantic table dan section

---

## 23. Responsive Design

### Desktop

- World map full screen
- Country panel kiri
- Live incident panel kanan
- Analytics multi-column

### Tablet

- Panel menyesuaikan lebar
- Live feed berpindah ke bawah
- Analytics menjadi satu atau dua kolom

### Mobile

- Country panel menjadi panel bawah
- Feed horizontal
- Metric menjadi horizontal scroll
- Cards menjadi satu kolom
- Drawer memenuhi layar

---

## 24. Troubleshooting

### Port sudah dipakai

```bash
sudo ss -ltnp 'sport = :8000'
python -m http.server 8080
```

### Perubahan tidak terlihat setelah deploy

Lakukan hard refresh:

```text
Ctrl + Shift + R
```

Asset memakai query version:

```text
styles.css?v=4-complete
app.js?v=4-complete
```

### Website putih

Jangan membuka file melalui source React/Vite karena proyek ini bukan React. Untuk proyek ini, file dapat dibuka langsung, tetapi server lokal lebih disarankan agar perilaku asset konsisten:

```bash
python -m http.server 8000
```

### Animasi terasa berat

Buka Dashboard Settings kemudian:

- Kurangi maximum active arcs
- Nonaktifkan animation
- Aktifkan compact mode jika diperlukan

---

## 25. Batasan Prototype

- Data tidak real-time dari internet.
- Data hilang dari memory setelah tab ditutup, kecuali yang disimpan di localStorage.
- Analyst notes pada incident hanya berada di memory session.
- Tidak ada autentikasi.
- Tidak ada backend.
- Tidak ada database.
- Tidak ada WebSocket eksternal.
- Tidak ada SIEM integration.
- Report PDF menggunakan print dialog browser.
- Statistik tidak boleh dianggap sebagai data ancaman dunia nyata.

---

## 26. Tujuan Penggunaan

Moklet Cyberwatch cocok untuk:

- Demo project sekolah
- Presentasi SOC
- Pembelajaran security monitoring
- Pelatihan membaca log
- Simulasi incident response
- Portfolio frontend
- Prototype sebelum integrasi backend

Tidak ditujukan untuk:

- Melakukan serangan
- Tracking individu
- Menampilkan secret
- Menampilkan IP aktif tanpa izin
- Menggantikan sistem SOC produksi

---

## 27. Credits

- Konsep dan identitas: Moklet / SMK Telkom Malang
- Map geometry: low-resolution Natural Earth geometry yang disematkan langsung sebagai SVG
- UI direction: futuristic defensive SOC command center

---

## 28. Versi

```text
Moklet Cyberwatch v2.0.0-complete
Asset version: v4-complete
Data mode: simulated / sanitized / local
```

**Learn. Monitor. Defend.**
