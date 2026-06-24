(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lowPowerDevice = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
    (navigator.deviceMemory && navigator.deviceMemory <= 4);

  const palette = {
    critical: '#ff3040', high: '#ff9f1c', medium: '#f4d35e', low: '#00d9ff', info: '#8f9ba8',
    ddos: '#ff3040', malware: '#ff2daa', phishing: '#ff9f1c', brute: '#00d9ff', botnet: '#9b5cff',
    web: '#f4d35e', login: '#23d9bf', ransomware: '#b51225'
  };

  const attackTypes = [
    { name: 'DDoS', code: 'DDS', color: palette.ddos },
    { name: 'Malware', code: 'MLW', color: palette.malware },
    { name: 'Phishing', code: 'PHS', color: palette.phishing },
    { name: 'Brute Force', code: 'BRT', color: palette.brute },
    { name: 'Botnet', code: 'BOT', color: palette.botnet },
    { name: 'Web Exploit', code: 'WEB', color: palette.web },
    { name: 'Suspicious Login', code: 'SUS', color: palette.login },
    { name: 'Ransomware', code: 'RAN', color: palette.ransomware }
  ];

  const locations = [
    { country: 'Indonesia', iso: 'IDN', city: 'Jakarta', lat: -6.2088, lon: 106.8456 },
    { country: 'Indonesia', iso: 'IDN', city: 'Malang', lat: -7.9666, lon: 112.6326 },
    { country: 'Singapore', iso: 'SGP', city: 'Singapore', lat: 1.3521, lon: 103.8198 },
    { country: 'Japan', iso: 'JPN', city: 'Tokyo', lat: 35.6762, lon: 139.6503 },
    { country: 'South Korea', iso: 'KOR', city: 'Seoul', lat: 37.5665, lon: 126.9780 },
    { country: 'China', iso: 'CHN', city: 'Shanghai', lat: 31.2304, lon: 121.4737 },
    { country: 'India', iso: 'IND', city: 'Mumbai', lat: 19.0760, lon: 72.8777 },
    { country: 'United Arab Emirates', iso: 'ARE', city: 'Dubai', lat: 25.2048, lon: 55.2708 },
    { country: 'Germany', iso: 'DEU', city: 'Frankfurt', lat: 50.1109, lon: 8.6821 },
    { country: 'United Kingdom', iso: 'GBR', city: 'London', lat: 51.5072, lon: -0.1276 },
    { country: 'France', iso: 'FRA', city: 'Paris', lat: 48.8566, lon: 2.3522 },
    { country: 'Netherlands', iso: 'NLD', city: 'Amsterdam', lat: 52.3676, lon: 4.9041 },
    { country: 'Sweden', iso: 'SWE', city: 'Stockholm', lat: 59.3293, lon: 18.0686 },
    { country: 'Russia', iso: 'RUS', city: 'Moscow', lat: 55.7558, lon: 37.6173 },
    { country: 'United States of America', iso: 'USA', city: 'New York', lat: 40.7128, lon: -74.0060 },
    { country: 'United States of America', iso: 'USA', city: 'San Francisco', lat: 37.7749, lon: -122.4194 },
    { country: 'Canada', iso: 'CAN', city: 'Toronto', lat: 43.6532, lon: -79.3832 },
    { country: 'Brazil', iso: 'BRA', city: 'São Paulo', lat: -23.5505, lon: -46.6333 },
    { country: 'Argentina', iso: 'ARG', city: 'Buenos Aires', lat: -34.6037, lon: -58.3816 },
    { country: 'South Africa', iso: 'ZAF', city: 'Johannesburg', lat: -26.2041, lon: 28.0473 },
    { country: 'Kenya', iso: 'KEN', city: 'Nairobi', lat: -1.2921, lon: 36.8219 },
    { country: 'Egypt', iso: 'EGY', city: 'Cairo', lat: 30.0444, lon: 31.2357 },
    { country: 'Australia', iso: 'AUS', city: 'Sydney', lat: -33.8688, lon: 151.2093 },
    { country: 'New Zealand', iso: 'NZL', city: 'Auckland', lat: -36.8509, lon: 174.7645 },
    { country: 'Mexico', iso: 'MEX', city: 'Mexico City', lat: 19.4326, lon: -99.1332 },
    { country: 'Turkey', iso: 'TUR', city: 'Istanbul', lat: 41.0082, lon: 28.9784 },
    { country: 'Saudi Arabia', iso: 'SAU', city: 'Riyadh', lat: 24.7136, lon: 46.6753 },
    { country: 'Thailand', iso: 'THA', city: 'Bangkok', lat: 13.7563, lon: 100.5018 },
    { country: 'Vietnam', iso: 'VNM', city: 'Hanoi', lat: 21.0278, lon: 105.8342 },
    { country: 'Philippines', iso: 'PHL', city: 'Manila', lat: 14.5995, lon: 120.9842 },
    { country: 'Malaysia', iso: 'MYS', city: 'Kuala Lumpur', lat: 3.1390, lon: 101.6869 },
    { country: 'Spain', iso: 'ESP', city: 'Madrid', lat: 40.4168, lon: -3.7038 }
  ];

  const sectors = ['Education', 'Government', 'Finance', 'Healthcare', 'Cloud', 'Telecommunication', 'Energy', 'E-commerce'];
  const statuses = ['blocked', 'investigating', 'monitoring', 'resolved'];
  const severities = ['critical', 'high', 'medium', 'low', 'info'];
  const severityWeights = ['critical', 'high', 'high', 'medium', 'medium', 'medium', 'low', 'low', 'info'];

  const state = {
    paused: false,
    tickerPaused: false,
    speed: 2500,
    feedFilter: 'all',
    heatVisible: true,
    arcsVisible: true,
    selectedCountry: 'Indonesia',
    map: { scale: 1, x: 0, y: 0, dragging: false, startX: 0, startY: 0, baseX: 0, baseY: 0 },
    incidents: [],
    activeEvents: [],
    eventCounter: 184,
    generator: null,
    mapEventNodes: new Map(),
    maxActiveEvents: lowPowerDevice ? 7 : 10,
    tickerDirty: false,
    lastCriticalToast: 0,
    selectedIncident: null,
    incidentPage: 1,
    incidentPageSize: 20,
    intelBookmarkOnly: false,
    intelBookmarks: new Set(),
    intelNotes: {},
    educationFilter: 'all',
    educationProgress: {},
    reports: [],
    latestReport: null,
    sourceLog: [],
    settings: { compactMode: false, animationEnabled: !reduceMotion, criticalToasts: true }
  };

  const countryAliases = {
    'United States': 'United States of America', 'USA': 'United States of America', 'Russian Federation': 'Russia',
    'South Korea': 'South Korea', 'Korea': 'South Korea', 'Czechia': 'Czech Republic'
  };

  const intelligenceItems = [
    { id: 'INT-2026-001', title: 'Credential phishing campaign targeting education portals', category: 'Campaign', severity: 'high', region: 'Southeast Asia', confidence: 92, firstSeen: '6h ago', lastSeen: '8m ago', mitre: ['T1566 Phishing', 'T1056 Input Capture'], tags: ['education', 'credential', 'email'], summary: 'Simulasi kampanye phishing yang menggunakan halaman login tiruan untuk mengumpulkan kredensial. Indikator telah disanitasi dan tidak merujuk ke domain aktif.', indicators: [['DOMAIN', 'login-campus[.]example'], ['URL', 'hxxps://portal-check[.]example/auth'], ['HASH', '8a7f…c92d']], recommendations: ['Aktifkan MFA untuk akun siswa dan staf.', 'Periksa domain mirip nama institusi.', 'Latih pengguna untuk memverifikasi URL sebelum login.', 'Blokir indikator tersanitasi pada simulasi lab.'] },
    { id: 'INT-2026-002', title: 'Brute-force activity against public authentication services', category: 'Trend', severity: 'medium', region: 'Global', confidence: 86, firstSeen: '14h ago', lastSeen: '3m ago', mitre: ['T1110 Brute Force', 'T1078 Valid Accounts'], tags: ['authentication', 'password', 'internet-facing'], summary: 'Kenaikan simulasi percobaan autentikasi berulang terhadap layanan yang terbuka ke internet.', indicators: [['PATTERN', 'failed_login > 25 / 5m'], ['ASN', 'AS65xxx (sanitized)']], recommendations: ['Terapkan rate limiting dan account lockout yang proporsional.', 'Gunakan MFA.', 'Pantau impossible travel dan login dari perangkat baru.'] },
    { id: 'INT-2026-003', title: 'Malware beacon pattern in sandbox telemetry', category: 'Indicator', severity: 'critical', region: 'Europe', confidence: 96, firstSeen: '2h ago', lastSeen: '1m ago', mitre: ['T1071 Application Layer Protocol', 'T1105 Ingress Tool Transfer'], tags: ['malware', 'beacon', 'sandbox'], summary: 'Pola komunikasi periodik pada dataset sandbox yang menyerupai beaconing. Tidak ada payload aktif di dalam proyek.', indicators: [['IP', '185.xxx.xxx.21'], ['DOMAIN', 'telemetry-sync[.]example'], ['JA3', 'e7d7…91ab']], recommendations: ['Isolasi endpoint pada latihan SOC.', 'Korelasikan DNS, proxy, dan endpoint telemetry.', 'Preservasi log sebelum melakukan remediasi.'] },
    { id: 'INT-2026-004', title: 'Cloud identity misconfiguration advisory', category: 'Advisory', severity: 'high', region: 'Global', confidence: 89, firstSeen: '1d ago', lastSeen: '22m ago', mitre: ['T1098 Account Manipulation', 'T1556 Modify Authentication Process'], tags: ['cloud', 'identity', 'configuration'], summary: 'Advisori edukatif mengenai role yang terlalu luas, token lama, dan akun tanpa MFA.', indicators: [['RULE', 'privileged_role_without_mfa'], ['RULE', 'token_age > 90d']], recommendations: ['Lakukan least privilege review.', 'Rotasi token lama.', 'Aktifkan conditional access dan MFA.'] },
    { id: 'INT-2026-005', title: 'Botnet traffic simulation cluster', category: 'Malware Family', severity: 'medium', region: 'Asia Pacific', confidence: 81, firstSeen: '19h ago', lastSeen: '6m ago', mitre: ['T1498 Network Denial of Service', 'T1095 Non-Application Layer Protocol'], tags: ['botnet', 'traffic', 'network'], summary: 'Cluster traffic simulasi dengan pola fan-out dan interval berulang untuk latihan deteksi botnet.', indicators: [['CIDR', '203.0.113.0/24 (documentation)'], ['PATTERN', 'fan_out > 120 destinations']], recommendations: ['Gunakan anomaly detection pada flow.', 'Batasi egress yang tidak diperlukan.', 'Korelasikan dengan inventaris aset.'] },
    { id: 'INT-2026-006', title: 'Web application scanning trend', category: 'Technique', severity: 'low', region: 'North America', confidence: 74, firstSeen: '3d ago', lastSeen: '18m ago', mitre: ['T1595 Active Scanning', 'T1190 Exploit Public-Facing App'], tags: ['web', 'reconnaissance', 'waf'], summary: 'Traffic simulasi yang mengakses banyak path dan parameter dalam waktu singkat.', indicators: [['PATTERN', '404_ratio > 0.75'], ['UA', 'scanner-demo/1.0']], recommendations: ['Tinjau WAF dan access log.', 'Pastikan error response tidak membocorkan detail.', 'Gunakan allowlist pada panel administrasi.'] },
    { id: 'INT-2026-007', title: 'Suspicious OAuth consent pattern', category: 'Advisory', severity: 'high', region: 'Global', confidence: 88, firstSeen: '9h ago', lastSeen: '12m ago', mitre: ['T1528 Steal Application Access Token', 'T1098 Account Manipulation'], tags: ['oauth', 'token', 'identity'], summary: 'Aplikasi simulasi meminta permission yang tidak sesuai kebutuhan dan memiliki publisher yang belum diverifikasi.', indicators: [['SCOPE', 'mail.read + files.read.all'], ['APP', 'unverified-demo-app']], recommendations: ['Review consent grant.', 'Batasi user consent.', 'Cabut token yang tidak diperlukan.'] },
    { id: 'INT-2026-008', title: 'Ransomware readiness exercise', category: 'Exercise', severity: 'critical', region: 'Moklet Lab', confidence: 99, firstSeen: '4d ago', lastSeen: '1h ago', mitre: ['T1486 Data Encrypted for Impact', 'T1490 Inhibit System Recovery'], tags: ['ransomware', 'backup', 'exercise'], summary: 'Skenario tabletop defensif untuk menguji backup, komunikasi incident, dan isolasi endpoint tanpa malware sungguhan.', indicators: [['EVENT', 'mass_file_rename_demo'], ['EVENT', 'backup_restore_test']], recommendations: ['Uji restore backup.', 'Pisahkan backup dari domain produksi.', 'Siapkan playbook komunikasi dan eskalasi.'] },
    { id: 'INT-2026-009', title: 'DNS tunneling-like anomaly in training data', category: 'Indicator', severity: 'medium', region: 'Global', confidence: 79, firstSeen: '7h ago', lastSeen: '14m ago', mitre: ['T1071.004 DNS'], tags: ['dns', 'anomaly', 'exfiltration'], summary: 'Query DNS simulasi memiliki subdomain panjang dan entropi tinggi. Tidak ada data nyata yang dieksfiltrasi.', indicators: [['DOMAIN', '*.training-dns[.]example'], ['PATTERN', 'label_length > 45']], recommendations: ['Aktifkan DNS logging.', 'Deteksi entropi dan panjang label.', 'Batasi resolver yang boleh digunakan endpoint.'] },
    { id: 'INT-2026-010', title: 'Vulnerability patch prioritization bulletin', category: 'Advisory', severity: 'medium', region: 'Global', confidence: 94, firstSeen: '2d ago', lastSeen: '35m ago', mitre: ['T1190 Exploit Public-Facing App'], tags: ['vulnerability', 'patch', 'asset'], summary: 'Panduan edukatif memprioritaskan patch berdasarkan exposure, exploitability, dan criticality aset.', indicators: [['SIGNAL', 'internet_exposed = true'], ['SIGNAL', 'critical_asset = true']], recommendations: ['Inventarisasi aset.', 'Prioritaskan internet-facing service.', 'Verifikasi patch melalui change management.'] }
  ];

  const educationModules = [
    { id: 'edu-ddos', number: '01', category: 'fundamental', level: 'Beginner', title: 'Apa itu DDoS?', description: 'Memahami lonjakan traffic, perbedaan traffic normal dan anomali, serta respons defensif dasar.', duration: '12 min', objectives: ['Menjelaskan konsep denial of service.', 'Mengenali indikator volume dan connection spike.', 'Memilih langkah mitigasi defensif yang aman.'], content: '<h4>Konsep</h4><p>DDoS adalah upaya membuat layanan sulit diakses dengan membanjiri resource dari banyak sumber. Dashboard hanya memvisualisasikan <b>data simulasi</b>.</p><h4>Yang diamati analis</h4><p>Perhatikan kenaikan request per detik, jumlah source, error rate, latency, dan kapasitas upstream.</p><h4>Respons defensif</h4><p>Validasi alert, aktifkan rate limiting, gunakan proteksi upstream/CDN, dan pertahankan bukti log.</p>', quiz: { q: 'Langkah pertama saat alert DDoS muncul?', options: ['Langsung mematikan semua server', 'Memvalidasi traffic dan dampaknya', 'Menghapus seluruh log', 'Membalas menyerang sumber'], answer: 1 } },
    { id: 'edu-phishing', number: '02', category: 'fundamental', level: 'Beginner', title: 'Mengenali Phishing', description: 'Membedakan pesan asli dan manipulatif melalui indikator aman.', duration: '15 min', objectives: ['Memeriksa domain pengirim.', 'Mengenali urgensi palsu.', 'Melaporkan pesan tanpa membuka tautan.'], content: '<h4>Indikator umum</h4><p>Domain mirip, bahasa mendesak, permintaan kredensial, attachment tidak terduga, dan URL yang berbeda dari teks tampil.</p><h4>Respons</h4><p>Jangan klik, gunakan kanal laporan resmi, verifikasi melalui kanal lain, dan reset kredensial bila sudah terlanjur diberikan.</p>', quiz: { q: 'Apa tindakan paling aman terhadap email login mencurigakan?', options: ['Klik untuk memastikan', 'Balas meminta penjelasan', 'Laporkan dan buka situs dari bookmark resmi', 'Teruskan ke semua teman'], answer: 2 } },
    { id: 'edu-malware', number: '03', category: 'fundamental', level: 'Beginner', title: 'Dasar Malware', description: 'Mengenal perilaku malware tanpa menjalankan file berbahaya.', duration: '14 min', objectives: ['Memahami indikator perilaku.', 'Membedakan file, proses, dan network indicator.', 'Melakukan isolasi secara aman.'], content: '<h4>Fokus perilaku</h4><p>Analis mengamati proses baru, persistence, perubahan file, dan koneksi keluar. Jangan menjalankan sampel pada perangkat pribadi.</p><h4>Respons</h4><p>Isolasi endpoint melalui mekanisme resmi, preservasi bukti, lalu eskalasi ke tim SOC.</p>', quiz: { q: 'Di mana sampel mencurigakan dianalisis?', options: ['Laptop pribadi', 'Sandbox terisolasi yang diotorisasi', 'Komputer teman', 'Server produksi'], answer: 1 } },
    { id: 'edu-logs', number: '04', category: 'soc', level: 'Beginner', title: 'Membaca Security Log', description: 'Memahami timestamp, event ID, severity, source, destination, dan action.', duration: '18 min', objectives: ['Membaca struktur event.', 'Membedakan event dan incident.', 'Mencari konteks sebelum menyimpulkan.'], content: '<h4>Struktur dasar</h4><p><code>timestamp</code> menunjukkan waktu, <code>source</code> asal event, <code>destination</code> target, dan <code>action</code> hasil kontrol keamanan.</p><h4>Korelasi</h4><p>Satu event belum tentu incident. Cari pola, aset terkait, user, dan perubahan sebelum/sesudah event.</p>', quiz: { q: 'Apakah satu failed login selalu berarti akun diretas?', options: ['Selalu', 'Tidak, perlu konteks dan korelasi', 'Ya jika terjadi malam hari', 'Ya jika IP luar negeri'], answer: 1 } },
    { id: 'edu-mitre', number: '05', category: 'soc', level: 'Intermediate', title: 'Pengenalan MITRE ATT&CK', description: 'Menggunakan taksonomi tactic dan technique untuk komunikasi analis.', duration: '20 min', objectives: ['Membedakan tactic dan technique.', 'Memetakan observasi dengan hati-hati.', 'Menghindari klaim tanpa bukti.'], content: '<h4>Tactic dan technique</h4><p>Tactic menjelaskan tujuan, sedangkan technique menjelaskan cara. Mapping membantu komunikasi, bukan membuktikan identitas pelaku.</p>', quiz: { q: 'Apa fungsi utama mapping ATT&CK?', options: ['Menentukan pelaku dengan pasti', 'Menyamakan bahasa untuk perilaku yang diamati', 'Menggantikan semua log', 'Menghapus false positive'], answer: 1 } },
    { id: 'edu-ir', number: '06', category: 'response', level: 'Intermediate', title: 'Dasar Incident Response', description: 'Alur identify, contain, eradicate, recover, dan lessons learned.', duration: '24 min', objectives: ['Menentukan scope incident.', 'Memilih containment proporsional.', 'Mendokumentasikan timeline.'], content: '<h4>Alur</h4><p>Preparation → Identification → Containment → Eradication → Recovery → Lessons Learned.</p><h4>Prinsip</h4><p>Jangan merusak bukti. Catat waktu, tindakan, alasan, dan pihak yang menyetujui.</p>', quiz: { q: 'Mengapa containment harus proporsional?', options: ['Agar tidak ada dokumentasi', 'Agar mengurangi dampak tanpa mengganggu layanan berlebihan', 'Agar terlihat cepat', 'Agar semua perangkat dimatikan'], answer: 1 } },
    { id: 'edu-ransomware', number: '07', category: 'response', level: 'Intermediate', title: 'Ransomware Readiness', description: 'Persiapan backup, segmentasi, komunikasi, dan recovery.', duration: '22 min', objectives: ['Memahami pentingnya backup teruji.', 'Menentukan prioritas isolasi.', 'Mempersiapkan komunikasi incident.'], content: '<h4>Readiness</h4><p>Backup harus terpisah, terpantau, dan diuji restore. Segmentasi membatasi penyebaran.</p><h4>Saat incident</h4><p>Ikuti playbook organisasi, isolasi melalui tim berwenang, preservasi bukti, dan jangan membuat keputusan sendiri terkait pembayaran.</p>', quiz: { q: 'Backup yang baik adalah?', options: ['Ada tetapi tidak pernah diuji', 'Terpisah dan rutin diuji restore', 'Disimpan di perangkat yang sama', 'Hanya satu salinan'], answer: 1 } },
    { id: 'edu-auth', number: '08', category: 'soc', level: 'Intermediate', title: 'Authentication Monitoring', description: 'Mendeteksi brute force, impossible travel, dan suspicious login.', duration: '19 min', objectives: ['Menganalisis pola login.', 'Memahami MFA dan conditional access.', 'Mengurangi false positive.'], content: '<h4>Signal</h4><p>Failed login berulang, banyak username dari satu sumber, login dari lokasi tidak wajar, atau perangkat baru.</p><h4>Validasi</h4><p>Hubungi user melalui kanal resmi dan periksa aktivitas session sebelum melakukan reset.</p>', quiz: { q: 'Kontrol yang paling efektif menambah lapisan keamanan login?', options: ['Password lebih pendek', 'MFA', 'Menyembunyikan tombol login', 'Menonaktifkan log'], answer: 1 } },
    { id: 'edu-report', number: '09', category: 'response', level: 'Intermediate', title: 'Membuat Laporan Incident', description: 'Menyusun ringkasan, timeline, impact, evidence, dan rekomendasi.', duration: '17 min', objectives: ['Menulis fakta tanpa asumsi.', 'Menyusun timeline.', 'Memberikan rekomendasi yang dapat ditindaklanjuti.'], content: '<h4>Isi minimal</h4><p>Executive summary, scope, timeline, evidence, impact, tindakan, status, dan recommendation.</p><h4>Kualitas</h4><p>Bedakan fakta, analisis, dan asumsi. Masking data sensitif sebelum dibagikan.</p>', quiz: { q: 'Apa yang harus dipisahkan dalam laporan?', options: ['Fakta dan asumsi', 'Judul dan tanggal', 'Nama dan waktu', 'Semua bagian digabung'], answer: 0 } },
    { id: 'edu-quiz', number: '10', category: 'response', level: 'Assessment', title: 'Final Defensive Security Quiz', description: 'Uji pemahaman dari seluruh jalur belajar melalui skenario SOC aman.', duration: '10 min', objectives: ['Menggabungkan konsep monitoring.', 'Memilih tindakan defensif.', 'Mendokumentasikan keputusan.'], content: '<h4>Assessment</h4><p>Jawab seluruh pertanyaan. Progress tersimpan lokal di browser dan tidak dikirim ke server.</p>', quiz: { q: 'Prinsip terbaik saat menangani alert?', options: ['Langsung menyimpulkan', 'Validasi, korelasi, dokumentasi, dan eskalasi', 'Menghapus log', 'Mempublikasikan data sensitif'], answer: 1 } }
  ];

  const glossaryTerms = [
    ['Alert', 'Notifikasi bahwa sebuah rule atau kondisi terdeteksi. Alert belum tentu incident.'],
    ['Incident', 'Kejadian keamanan yang telah divalidasi dan membutuhkan respons terkoordinasi.'],
    ['Severity', 'Ukuran tingkat dampak dan urgensi penanganan.'],
    ['Confidence', 'Tingkat keyakinan sistem atau analis terhadap hasil deteksi.'],
    ['IOC', 'Indicator of Compromise, yaitu artefak yang mungkin berkaitan dengan kompromi.'],
    ['TTP', 'Tactics, Techniques, and Procedures yang menggambarkan perilaku ancaman.'],
    ['SIEM', 'Platform pengumpulan, pencarian, korelasi, dan alerting log keamanan.'],
    ['EDR', 'Endpoint Detection and Response untuk telemetry dan respons pada endpoint.'],
    ['IDS/IPS', 'Sistem deteksi atau pencegahan aktivitas jaringan mencurigakan.'],
    ['RLS', 'Row Level Security; kontrol akses pada baris data dalam database.'],
    ['False Positive', 'Alert yang setelah divalidasi ternyata bukan ancaman nyata.'],
    ['Containment', 'Tindakan membatasi dampak dan penyebaran incident.'],
    ['Anonymization', 'Proses menghapus atau menyamarkan data yang dapat mengidentifikasi individu.']
  ];

  const dataSources = [
    { id: 'demo-generator', name: 'Demo Event Generator', type: 'Simulated Events', interval: '2.5 seconds', status: 'Operational', reliability: 99, latency: 18, volume: '24 events/min', mode: 'SIMULATED', color: '#2de38a', enabled: true, description: 'Generator lokal yang membuat incident anonim untuk menghidupkan peta dan analytics tanpa koneksi eksternal.' },
    { id: 'education-dataset', name: 'Educational Threat Dataset', type: 'Educational Dataset', interval: '15 minutes', status: 'Operational', reliability: 96, latency: 36, volume: '3.2K records', mode: 'SANITIZED', color: '#00d9ff', enabled: true, description: 'Dataset pembelajaran berisi pola event yang telah disederhanakan dan disanitasi.' },
    { id: 'sensor-sandbox', name: 'Moklet Sensor Sandbox', type: 'Internal Security Logs', interval: '5 seconds', status: 'Operational', reliability: 98, latency: 27, volume: '8 events/min', mode: 'SIMULATED', color: '#e31e24', enabled: true, description: 'Representasi sandbox sensor jaringan dan endpoint. Tidak terhubung ke infrastruktur produksi sekolah.' },
    { id: 'community-demo', name: 'Community Intelligence Demo', type: 'Community Intelligence', interval: '30 minutes', status: 'Degraded', reliability: 81, latency: 184, volume: '42 items', mode: 'SIMULATED', color: '#ff9f1c', enabled: true, description: 'Feed komunitas tiruan untuk mendemonstrasikan status degraded dan reliability scoring.' },
    { id: 'advisory-mirror', name: 'Public Advisory Mirror', type: 'Public Threat Feeds', interval: '1 hour', status: 'Operational', reliability: 93, latency: 74, volume: '16 advisories', mode: 'SANITIZED', color: '#9b5cff', enabled: true, description: 'Ringkasan advisori tanpa mengambil IOC aktif pada prototype offline.' },
    { id: 'map-renderer', name: 'Map Rendering Service', type: 'Visualization', interval: 'Real-time', status: 'Operational', reliability: 100, latency: 11, volume: '176 geometries', mode: 'LOCAL', color: '#00d9ff', enabled: true, description: 'Renderer SVG lokal untuk geometri peta, arc, node, heat point, dan tooltip.' }
  ];

  function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function number(n) { return new Intl.NumberFormat('en-US').format(n); }
  function pad(n) { return String(n).padStart(2, '0'); }
  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[ch]));
  }
  function timeText(date = new Date()) { return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`; }
  function shortTime(date = new Date()) { return `${pad(date.getHours())}:${pad(date.getMinutes())}`; }
  function project(lat, lon) { return { x: (lon + 180) / 360 * 1600, y: (85 - Math.max(-60, Math.min(85, lat))) / 145 * 800 }; }
  function severityColor(severity) { return palette[severity] || palette.info; }
  function attackColor(type) { return attackTypes.find(a => a.name === type)?.color || palette.cyan; }
  function attackCode(type) { return attackTypes.find(a => a.name === type)?.code.toLowerCase() || 'generic'; }
  function maskedIp() { return `${rand(23, 223)}.${rand(1, 254)}.xxx.${rand(1, 254)}`; }

  function readJson(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  }
  function writeJson(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* private mode or storage disabled */ }
  }
  function downloadText(filename, text, type = 'application/json') {
    const blob = new Blob([text], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
  function titleCase(value) { return String(value).replace(/[-_]/g, ' ').replace(/\b\w/g, ch => ch.toUpperCase()); }
  function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
  function dateWithinRange(date, range) {
    if (range === 'all') return true;
    const ms = range === '24h' ? 86400000 : range === '7d' ? 604800000 : 2592000000;
    return Date.now() - date.getTime() <= ms;
  }
  function countBy(items, selector) {
    const map = new Map();
    items.forEach(item => { const key = selector(item); map.set(key, (map.get(key) || 0) + 1); });
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }
  function filteredAnalyticsIncidents() {
    const range = $('#analyticsRange')?.value || '24h';
    const country = $('#analyticsCountry')?.value || 'all';
    const severity = $('#analyticsSeverity')?.value || 'all';
    const sector = $('#analyticsSector')?.value || 'all';
    return state.incidents.filter(event => dateWithinRange(event.timestamp, range) &&
      (country === 'all' || event.source.country === country || event.destination.country === country) &&
      (severity === 'all' || event.severity === severity) &&
      (sector === 'all' || event.targetSector === sector));
  }
  function openDrawer(id) {
    const drawer = document.getElementById(id);
    if (!drawer) return;
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
  }
  function openModal(title, eyebrow, html) {
    $('#modalTitle').textContent = title;
    $('#modalEyebrow').textContent = eyebrow;
    $('#modalBody').innerHTML = html;
    $('#modalOverlay').classList.add('open');
    $('#modalOverlay').setAttribute('aria-hidden', 'false');
  }
  function closeModal() {
    $('#modalOverlay').classList.remove('open');
    $('#modalOverlay').setAttribute('aria-hidden', 'true');
  }
  function sourceStatusColor(status) {
    return status === 'Operational' ? '#2de38a' : status === 'Degraded' ? '#ff9f1c' : status === 'Delayed' ? '#f4d35e' : '#ff3040';
  }
  function severityRank(value) { return ({ critical: 5, high: 4, medium: 3, low: 2, info: 1 }[value] || 0); }
  function getProtocol(event) { return event.protocol || 'HTTPS'; }
  function renderBarRows(rows, color = '#e31e24') {
    const max = Math.max(1, ...rows.map(([, value]) => value));
    return `<div class="mini-bars">${rows.map(([name, value]) => `<div class="mini-bar-row"><span>${escapeHtml(name)}</span><span><i style="--w:${(value/max*100).toFixed(1)}%;background:${color}"></i></span><b>${number(value)}</b></div>`).join('')}</div>`;
  }
  function saveAnalystNotes() { writeJson('moklet-intel-notes', state.intelNotes); }
  function saveBookmarks() { writeJson('moklet-intel-bookmarks', [...state.intelBookmarks]); }
  function saveEducationProgress() { writeJson('moklet-education-progress', state.educationProgress); }
  function saveReports() { writeJson('moklet-report-history', state.reports.slice(0, 12)); }
  function saveSettings() { writeJson('moklet-dashboard-settings', state.settings); }


  function createIncident(ageMinutes = rand(0, 1440)) {
    let source = pick(locations);
    let destination = pick(locations);
    while (source.city === destination.city) destination = pick(locations);
    const attack = pick(attackTypes);
    const severity = pick(severityWeights);
    const status = severity === 'critical' ? pick(['blocked', 'investigating']) : pick(statuses);
    const ts = new Date(Date.now() - ageMinutes * 60000);
    const id = `INC-2026-${String(state.eventCounter++).padStart(6, '0')}`;
    return {
      id,
      timestamp: ts,
      attackType: attack.name,
      severity,
      source,
      destination,
      sourceIp: maskedIp(),
      destinationIp: maskedIp(),
      targetSector: pick(sectors),
      protocol: attack.name === 'DDoS' ? pick(['TCP', 'UDP', 'HTTP/S']) : attack.name === 'Phishing' || attack.name === 'Suspicious Login' ? 'HTTPS' : attack.name === 'Brute Force' ? pick(['SSH', 'RDP', 'HTTPS']) : attack.name === 'Botnet' ? pick(['DNS', 'TCP', 'UDP']) : pick(['HTTPS', 'DNS', 'TCP']),
      confidence: rand(64, 99),
      status,
      detectionSource: pick(['Moklet Sensor Grid', 'Public Threat Feed', 'Endpoint Telemetry', 'Network IDS', 'Demo Generator']),
      mitre: pick(['T1498 Network Denial of Service', 'T1110 Brute Force', 'T1190 Exploit Public-Facing App', 'T1566 Phishing', 'T1071 Application Layer Protocol']),
      dataMode: 'simulated'
    };
  }

  function seedData() {
    state.incidents = Array.from({ length: 150 }, (_, i) => createIncident(i * rand(4, 18))).sort((a, b) => b.timestamp - a.timestamp);
    state.activeEvents = state.incidents.slice(0, state.maxActiveEvents);
  }

  function svgEl(tag, attrs = {}) {
    const el = document.createElementNS(SVG_NS, tag);
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
    return el;
  }

  function addGridLines() {
    const layer = $('.latlon');
    if (!layer) return;
    for (let lon = -150; lon <= 150; lon += 30) {
      const x = project(0, lon).x;
      layer.appendChild(svgEl('line', { x1: x, y1: 0, x2: x, y2: 800 }));
    }
    for (let lat = -45; lat <= 75; lat += 15) {
      const y = project(lat, 0).y;
      layer.appendChild(svgEl('line', { x1: 0, y1: y, x2: 1600, y2: y }));
    }
  }

  function arcPath(event) {
    const a = project(event.source.lat, event.source.lon);
    const b = project(event.destination.lat, event.destination.lon);
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const curve = Math.min(250, 45 + dist * .22);
    const midX = (a.x + b.x) / 2;
    const midY = (a.y + b.y) / 2 - curve;
    return { d: `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} Q ${midX.toFixed(1)} ${midY.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`, a, b };
  }

  function clearLayer(id) { const layer = $(id); if (layer) layer.replaceChildren(); }

  function ensureHeatGradients() {
    const defs = $('#worldMap defs');
    if (!defs) return;
    attackTypes.forEach(attack => {
      const id = `heat-${attack.code.toLowerCase()}`;
      if (document.getElementById(id)) return;
      const gradient = svgEl('radialGradient', { id });
      gradient.append(svgEl('stop', { offset: '0', 'stop-color': attack.color, 'stop-opacity': '.34' }));
      gradient.append(svgEl('stop', { offset: '.48', 'stop-color': attack.color, 'stop-opacity': '.10' }));
      gradient.append(svgEl('stop', { offset: '1', 'stop-color': attack.color, 'stop-opacity': '0' }));
      defs.appendChild(gradient);
    });
  }

  function removeMapEvent(eventId) {
    const nodes = state.mapEventNodes.get(eventId);
    if (!nodes) return;
    state.mapEventNodes.delete(eventId);
    Object.values(nodes).forEach(node => {
      if (!node?.isConnected) return;
      node.style.pointerEvents = 'none';
      node.style.transition = 'opacity .22s ease';
      node.style.opacity = '0';
      window.setTimeout(() => node.remove(), 230);
    });
  }

  function addMapEvent(event) {
    if (state.mapEventNodes.has(event.id)) return;
    const arcLayer = $('#arcLayer');
    const nodeLayer = $('#nodeLayer');
    const particleLayer = $('#particleLayer');
    const heatLayer = $('#heatLayer');
    if (!arcLayer || !nodeLayer || !particleLayer || !heatLayer) return;

    const { d, a, b } = arcPath(event);
    const color = attackColor(event.attackType);
    const width = event.severity === 'critical' ? 2.3 : event.severity === 'high' ? 1.6 : 1.05;
    const path = svgEl('path', {
      d,
      class: `attack-arc ${event.severity === 'critical' ? 'critical' : ''}${state.paused ? ' paused' : ''}`,
      stroke: color,
      'stroke-width': width,
      opacity: state.arcsVisible ? '.86' : '0'
    });
    path.addEventListener('pointermove', ev => showEventTooltip(ev, event));
    path.addEventListener('pointerleave', hideTooltip);
    path.addEventListener('click', ev => { ev.stopPropagation(); openIncidentDrawer(event); });
    arcLayer.appendChild(path);

    const sourceNode = svgEl('circle', { cx: a.x, cy: a.y, r: 3.3, class: 'attack-node-source', stroke: color });
    const targetNode = svgEl('circle', { cx: b.x, cy: b.y, r: event.severity === 'critical' ? 4.2 : 3.2, class: 'attack-node-target', fill: color });
    const ring = svgEl('circle', { cx: b.x, cy: b.y, r: 5, class: 'node-ring', style: `color:${color}` });
    nodeLayer.append(sourceNode, targetNode, ring);

    const heat = svgEl('circle', {
      cx: b.x,
      cy: b.y,
      r: event.severity === 'critical' ? 38 : 24,
      class: 'heat-point',
      fill: `url(#heat-${attackCode(event.attackType)})`,
      opacity: state.heatVisible ? '.72' : '0'
    });
    heatLayer.appendChild(heat);

    const particle = svgEl('circle', {
      r: event.severity === 'critical' ? 3 : 2,
      fill: color,
      class: 'attack-particle map-event-enter'
    });
    if (reduceMotion) {
      particle.setAttribute('transform', `translate(${b.x.toFixed(1)} ${b.y.toFixed(1)})`);
    } else {
      const motion = svgEl('animateMotion', {
        path: d,
        dur: `${(4.2 + Math.random() * 2.4).toFixed(2)}s`,
        begin: `-${(Math.random() * 5).toFixed(2)}s`,
        repeatCount: 'indefinite',
        calcMode: 'linear'
      });
      particle.appendChild(motion);
    }
    particleLayer.appendChild(particle);

    path.classList.add('map-event-enter');
    sourceNode.classList.add('map-event-enter');
    targetNode.classList.add('map-event-enter');
    ring.classList.add('map-event-enter');
    heat.classList.add('map-event-enter');
    state.mapEventNodes.set(event.id, { path, sourceNode, targetNode, ring, heat, particle });
  }

  function renderMapEvents() {
    clearLayer('#arcLayer');
    clearLayer('#nodeLayer');
    clearLayer('#particleLayer');
    clearLayer('#heatLayer');
    state.mapEventNodes.clear();
    state.activeEvents.forEach(addMapEvent);
    $('#activeArcs').textContent = String(state.activeEvents.length);
  }

  function showEventTooltip(ev, event) {
    const tooltip = $('#mapTooltip');
    if (tooltip.dataset.eventId !== event.id) {
      tooltip.dataset.eventId = event.id;
      tooltip.innerHTML = `
        <div class="tt-head"><strong>${escapeHtml(event.id)}</strong><span style="color:${severityColor(event.severity)}">${event.severity.toUpperCase()}</span></div>
        <dl>
          <dt>Attack Type</dt><dd>${escapeHtml(event.attackType)}</dd>
          <dt>Route</dt><dd>${escapeHtml(event.source.iso)} → ${escapeHtml(event.destination.iso)}</dd>
          <dt>Source IP</dt><dd>${escapeHtml(event.sourceIp)}</dd>
          <dt>Target Sector</dt><dd>${escapeHtml(event.targetSector)}</dd>
          <dt>Confidence</dt><dd>${event.confidence}%</dd>
          <dt>Status</dt><dd>${escapeHtml(event.status)}</dd>
        </dl>`;
    }
    tooltip.style.left = `${Math.min(window.innerWidth - 280, ev.clientX)}px`;
    tooltip.style.top = `${Math.min(window.innerHeight - 220, ev.clientY)}px`;
    tooltip.classList.add('visible');
  }

  function showCountryTooltip(ev, path) {
    const tooltip = $('#mapTooltip');
    const name = path.dataset.country;
    const count = state.incidents.filter(i => i.destination.country === name).length;
    tooltip.innerHTML = `<div class="tt-head"><strong>${escapeHtml(name)}</strong><span style="color:var(--cyan)">${escapeHtml(path.dataset.iso)}</span></div><dl><dt>Simulated events</dt><dd>${count}</dd><dt>Click</dt><dd>View country data</dd></dl>`;
    tooltip.style.left = `${Math.min(window.innerWidth - 280, ev.clientX)}px`;
    tooltip.style.top = `${Math.min(window.innerHeight - 160, ev.clientY)}px`;
    tooltip.classList.add('visible');
  }

  function hideTooltip() { $('#mapTooltip')?.classList.remove('visible'); }

  function bindCountries() {
    $$('.country').forEach(path => {
      path.addEventListener('pointermove', ev => showCountryTooltip(ev, path));
      path.addEventListener('pointerleave', hideTooltip);
      path.addEventListener('click', ev => {
        ev.stopPropagation();
        selectCountry(path.dataset.country, path.dataset.iso, path);
      });
      path.addEventListener('keydown', ev => {
        if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); selectCountry(path.dataset.country, path.dataset.iso, path); }
      });
    });
    const initial = $$('.country').find(p => p.dataset.country === 'Indonesia');
    if (initial) selectCountry('Indonesia', 'IDN', initial, false);
  }

  function selectCountry(name, iso, path, toast = true) {
    state.selectedCountry = name;
    $$('.country.selected').forEach(p => p.classList.remove('selected'));
    if (path) path.classList.add('selected');
    const incoming = state.incidents.filter(i => i.destination.country === name);
    const outgoing = state.incidents.filter(i => i.source.country === name);
    const baseline = Math.max(incoming.length, 7) * rand(180, 560);
    $('#countryName').textContent = name;
    $('#countryCode').textContent = iso || 'N/A';
    $('#countryRank').textContent = `# ${String(rand(1, 18)).padStart(2, '0')}`;
    $('#incomingCount').textContent = number(baseline + rand(800, 4200));
    $('#outgoingCount').textContent = number(Math.max(420, outgoing.length * rand(90, 340) + rand(320, 1600)));
    $('#detectionTotal').textContent = number(baseline + rand(4000, 19000));
    $('#countryUpdated').textContent = 'now';
    renderThreatList(name);
    if (toast) showToast('Country selected', `${name} intelligence panel updated.`);
  }

  function renderThreatList(country) {
    const rows = attackTypes.map((attack, index) => {
      const base = state.incidents.filter(i => i.destination.country === country && i.attackType === attack.name).length;
      const count = Math.max(1, base) * rand(120, 740);
      return { ...attack, count, pct: Math.min(96, 25 + count / 70 + index * 2) };
    }).sort((a, b) => b.count - a.count).slice(0, 6);
    $('#threatList').innerHTML = rows.map(r => `
      <div class="threat-row" style="color:${r.color}">
        <span class="threat-code">${r.code}</span><span class="threat-meter"><i style="--w:${r.pct}%"></i></span><span class="threat-count">${number(r.count)}</span>
      </div>`).join('');
  }

  function feedMatches(event) {
    if (state.feedFilter === 'critical') return event.severity === 'critical';
    if (state.feedFilter === 'blocked') return event.status === 'blocked';
    return true;
  }

  function createFeedItem(event, animate = false) {
    const item = document.createElement('article');
    item.className = `feed-item${animate ? ' is-new' : ''}`;
    item.dataset.incident = event.id;
    item.innerHTML = `
      <time class="feed-time">${shortTime(event.timestamp)}</time>
      <div class="feed-main">
        <div class="feed-top"><span class="severity ${event.severity}">${event.severity}</span><span class="feed-status">${escapeHtml(event.status)}</span></div>
        <strong>${escapeHtml(event.attackType)} · ${escapeHtml(event.targetSector)}</strong>
        <div class="feed-route"><b>${escapeHtml(event.source.iso)}</b><span>⌁</span><b>${escapeHtml(event.destination.iso)}</b><span>${event.confidence}% confidence</span></div>
      </div>`;
    item.addEventListener('click', () => openIncidentDrawer(event));
    if (animate) item.addEventListener('animationend', () => item.classList.remove('is-new'), { once: true });
    return item;
  }

  function renderFeed() {
    const feed = $('#incidentFeed');
    const fragment = document.createDocumentFragment();
    state.incidents.filter(feedMatches).slice(0, 18).forEach(event => fragment.appendChild(createFeedItem(event)));
    feed.replaceChildren(fragment);
  }

  function prependFeedItem(event) {
    if (!feedMatches(event)) return;
    const feed = $('#incidentFeed');
    const oldHeight = feed.scrollHeight;
    const oldTop = feed.scrollTop;
    feed.prepend(createFeedItem(event, true));
    while (feed.children.length > 18) feed.lastElementChild?.remove();
    if (oldTop > 4) feed.scrollTop = oldTop + Math.max(0, feed.scrollHeight - oldHeight);
  }

  function renderTicker() {
    const entries = state.incidents.slice(0, 8).map(event => `
      <span class="ticker-entry"><b>${event.severity.toUpperCase()}</b> ${escapeHtml(event.attackType)} activity ${escapeHtml(event.source.iso)} → ${escapeHtml(event.destination.iso)} · ${escapeHtml(event.status)} · confidence ${event.confidence}%</span>`).join('');
    $('#tickerTrack').innerHTML = entries + entries;
  }

  function getMetricData() {
    const critical = state.incidents.filter(i => i.severity === 'critical').length;
    const blocked = state.incidents.filter(i => i.status === 'blocked').length;
    const countries = new Set(state.incidents.flatMap(i => [i.source.country, i.destination.country])).size;
    return [
      { key: 'total', label: 'Total Threat Events', value: number(87421 + state.eventCounter), change: '▲ 12.8%', accent: '#ff3040', icon: '⌁' },
      { key: 'active', label: 'Active Incidents', value: number(state.incidents.filter(i => ['investigating', 'monitoring'].includes(i.status)).length), change: '▲ 4.3%', accent: '#ff9f1c', icon: '!' },
      { key: 'critical', label: 'Critical Alerts', value: number(critical), change: '▼ 2.1%', accent: '#ff2daa', icon: '◆' },
      { key: 'blocked', label: 'Blocked Attempts', value: number(blocked * 739), change: '▲ 18.6%', accent: '#2de38a', icon: '✓' },
      { key: 'countries', label: 'Countries Detected', value: String(countries), change: '+ 3 today', accent: '#00d9ff', icon: '◎' },
      { key: 'response', label: 'Average Response', value: '01m 42s', change: '▼ 14 sec', accent: '#00d9ff', icon: '◷' },
      { key: 'assets', label: 'Protected Assets', value: '1,284', change: '100% online', accent: '#2de38a', icon: '◇' },
      { key: 'health', label: 'System Health', value: '99.98%', change: 'Operational', accent: '#2de38a', icon: '●' }
    ];
  }

  function renderMetrics() {
    $('#metricRail').innerHTML = getMetricData().map((m, index) => {
      const pts = Array.from({ length: 9 }, (_, i) => `${i * 10},${8 + ((i * 7 + index * 5) % 14)}`).join(' ');
      return `<article class="metric" data-metric="${m.key}" style="--accent:${m.accent}"><div class="metric-top"><span>${m.label}</span><span class="metric-icon">${m.icon}</span></div><strong>${m.value}</strong><div class="metric-bottom"><span class="metric-change">${m.change}</span><svg class="sparkline" viewBox="0 0 80 24"><polyline points="${pts}"/></svg></div></article>`;
    }).join('');
  }

  function updateMetrics() {
    getMetricData().forEach(m => {
      const card = $(`[data-metric="${m.key}"]`);
      if (!card) return;
      card.querySelector('strong').textContent = m.value;
      card.querySelector('.metric-change').textContent = m.change;
    });
  }

  function renderActivityChart() {
    const svg = $('#activityChart');
    if (!svg) return;
    const values = [28, 34, 31, 39, 48, 43, 53, 49, 64, 58, 72, 69, 84, 78, 93, 82, 102, 91, 112, 96, 118, 109, 126, 121];
    const secondary = values.map((v, i) => Math.max(18, v * .52 + (i % 3) * 6));
    const x = i => 44 + i * (820 / 23);
    const y = v => 245 - v * 1.55;
    const line = values.map((v, i) => `${i ? 'L' : 'M'} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
    const line2 = secondary.map((v, i) => `${i ? 'L' : 'M'} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
    const area = `${line} L ${x(values.length - 1)} 245 L ${x(0)} 245 Z`;
    const grid = [0, 50, 100, 150, 200].map((_, i) => `<line class="grid-line" x1="44" y1="${45 + i * 48}" x2="864" y2="${45 + i * 48}"/><text class="axis-label" x="5" y="${49 + i * 48}">${(140 - i * 35)}K</text>`).join('');
    const labels = [0, 4, 8, 12, 16, 20, 23].map(i => `<text class="axis-label" x="${x(i) - 8}" y="270">${pad(i)}:00</text>`).join('');
    svg.innerHTML = `<defs><linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff3040" stop-opacity=".26"/><stop offset="1" stop-color="#ff3040" stop-opacity="0"/></linearGradient></defs>${grid}${labels}<path class="area" d="${area}"/><path class="line-secondary" d="${line2}"/><path class="line" d="${line}"/>${values.filter((_, i) => i % 4 === 0).map((v, i) => `<circle class="chart-dot" cx="${x(i * 4)}" cy="${y(v)}" r="2.8"/>`).join('')}`;
  }

  function renderDonut() {
    const svg = $('#donutChart');
    if (!svg) return;
    const data = [27, 19, 15, 12, 10, 8, 5, 4];
    const radius = 82;
    const circumference = 2 * Math.PI * radius;
    let offset = 0;
    svg.innerHTML = `<circle cx="120" cy="120" r="${radius}" stroke="rgba(255,255,255,.05)"/>` + data.map((value, index) => {
      const length = circumference * value / 100;
      const circle = `<circle cx="120" cy="120" r="${radius}" stroke="${attackTypes[index].color}" stroke-dasharray="${length} ${circumference - length}" stroke-dashoffset="${-offset}"/>`;
      offset += length;
      return circle;
    }).join('');
    $('#attackLegend').innerHTML = data.slice(0, 6).map((value, index) => `<div class="legend-item" style="color:${attackTypes[index].color}"><span><i></i>${attackTypes[index].name}</span><b>${value}%</b></div>`).join('');
  }

  function renderCountryRanking() {
    const rows = [
      ['United States', 'USA', 18429, 100], ['Indonesia', 'IDN', 14842, 81], ['Germany', 'DEU', 12608, 69], ['Japan', 'JPN', 11473, 62], ['United Kingdom', 'GBR', 9874, 54], ['India', 'IND', 9211, 50], ['Singapore', 'SGP', 8420, 46]
    ];
    $('#countryRanking').innerHTML = rows.map((r, i) => `<div class="rank-row"><span>${pad(i + 1)}</span><div class="rank-info"><strong>${r[0]}</strong><small>${r[1]}</small></div><span class="rank-count">${number(r[2])}</span><span class="rank-bar"><i style="--w:${r[3]}%"></i></span></div>`).join('');
  }

  function renderSecurityScore() {
    const data = [['Network Security', 88], ['Endpoint Security', 82], ['Authentication', 91], ['Patch Compliance', 74], ['Incident Response', 86]];
    $('#scoreBars').innerHTML = data.map(([name, score]) => `<div class="score-bar"><span>${name}</span><b>${score}</b><span><i style="--w:${score}%"></i></span></div>`).join('');
  }

  function renderSoc() {
    const data = [['API Status', 'Operational'], ['Stream Status', 'Operational'], ['Database', 'Operational'], ['Map Renderer', 'Operational'], ['Alert Engine', 'Operational'], ['Data Latency', '42 ms']];
    $('#socGrid').innerHTML = data.map(([name, value]) => `<div class="soc-item"><small>${name}</small><strong>${value}</strong></div>`).join('');
    renderTerminal();
  }

  function renderTerminal() {
    const terminal = $('#miniTerminal');
    const lines = [
      `[${timeText(new Date(Date.now() - 6000))}] Threat stream connected`,
      `[${timeText(new Date(Date.now() - 4500))}] New simulated event received`,
      `[${timeText(new Date(Date.now() - 3000))}] Event normalized and anonymized`,
      `[${timeText(new Date(Date.now() - 1500))}] Alert rule matched`,
      `[${timeText()}] Dashboard telemetry updated`
    ];
    if (terminal.children.length !== lines.length) {
      terminal.replaceChildren(...lines.map(() => document.createElement('div')));
    }
    [...terminal.children].forEach((line, index) => { line.textContent = `> ${lines[index]}`; });
  }

  function getFilteredIncidents() {
    const search = ($('#incidentSearch')?.value || '').trim().toLowerCase();
    const severity = $('#severityFilter')?.value || 'all';
    const status = $('#statusFilter')?.value || 'all';
    const sort = $('#incidentSort')?.value || 'newest';
    const filtered = state.incidents.filter(event => {
      const haystack = `${event.id} ${event.attackType} ${event.source.country} ${event.destination.country} ${event.targetSector} ${event.mitre}`.toLowerCase();
      return (!search || haystack.includes(search)) &&
        (severity === 'all' || event.severity === severity) &&
        (status === 'all' || event.status === status);
    });
    filtered.sort((a, b) => sort === 'severity' ? severityRank(b.severity) - severityRank(a.severity) || b.timestamp - a.timestamp : sort === 'confidence' ? b.confidence - a.confidence : b.timestamp - a.timestamp);
    return filtered;
  }

  function renderIncidentPagination(total) {
    const pageCount = Math.max(1, Math.ceil(total / state.incidentPageSize));
    state.incidentPage = clamp(state.incidentPage, 1, pageCount);
    const pages = [];
    for (let i = Math.max(1, state.incidentPage - 2); i <= Math.min(pageCount, state.incidentPage + 2); i++) pages.push(i);
    $('#incidentPagination').innerHTML = `<button data-page="prev" ${state.incidentPage === 1 ? 'disabled' : ''}>←</button>${pages.map(page => `<button data-page="${page}" class="${page === state.incidentPage ? 'active' : ''}">${page}</button>`).join('')}<button data-page="next" ${state.incidentPage === pageCount ? 'disabled' : ''}>→</button>`;
    $$('[data-page]', $('#incidentPagination')).forEach(button => button.addEventListener('click', () => {
      const value = button.dataset.page;
      state.incidentPage = value === 'prev' ? state.incidentPage - 1 : value === 'next' ? state.incidentPage + 1 : Number(value);
      renderIncidentTable();
      $('.incident-table-wrap')?.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    }));
  }

  function renderIncidentTable() {
    const filtered = getFilteredIncidents();
    const start = (state.incidentPage - 1) * state.incidentPageSize;
    const rows = filtered.slice(start, start + state.incidentPageSize);
    const body = $('#incidentTableBody');
    if (!body) return;
    body.innerHTML = rows.length ? rows.map(event => `
      <tr data-incident="${event.id}">
        <td class="incident-id">${event.id}</td><td>${timeText(event.timestamp)}</td><td><span class="severity ${event.severity}">${event.severity}</span></td>
        <td>${escapeHtml(event.attackType)}</td><td title="${escapeHtml(event.source.country)}">${escapeHtml(event.source.iso)}</td><td title="${escapeHtml(event.destination.country)}">${escapeHtml(event.destination.iso)}</td><td>${escapeHtml(event.targetSector)}</td>
        <td><span class="confidence"><span>${event.confidence}%</span><i style="--w:${event.confidence}%"></i></span></td><td><span class="status-badge ${event.status}">${titleCase(event.status)}</span></td><td><button class="table-action" aria-label="Open ${event.id}">•••</button></td>
      </tr>`).join('') : `<tr><td colspan="10"><div class="empty-state" style="min-height:180px"><strong>No incidents matched</strong><p>Ubah kata pencarian atau filter untuk melihat incident simulasi lain.</p></div></td></tr>`;
    $('#incidentCountLabel').textContent = `${filtered.length} simulated incidents · page ${state.incidentPage}/${Math.max(1, Math.ceil(filtered.length/state.incidentPageSize))}`;
    renderIncidentPagination(filtered.length);
    $$('tr[data-incident]', body).forEach(row => row.addEventListener('click', () => openIncidentDrawer(state.incidents.find(i => i.id === row.dataset.incident))));
  }

  function openIncidentDrawer(event) {
    if (!event) return;
    state.selectedIncident = event;
    $('#drawerIncidentId').textContent = event.id;
    $('#incidentDrawerBody').innerHTML = `
      <div class="incident-overview">
        <div><small>SEVERITY</small><strong style="color:${severityColor(event.severity)}">${event.severity.toUpperCase()}</strong></div>
        <div><small>STATUS</small><strong>${escapeHtml(titleCase(event.status))}</strong></div>
        <div><small>ATTACK TYPE</small><strong>${escapeHtml(event.attackType)}</strong></div>
        <div><small>CONFIDENCE</small><strong>${event.confidence}%</strong></div>
        <div><small>SOURCE</small><strong>${escapeHtml(event.source.city)} · ${escapeHtml(event.sourceIp)}</strong></div>
        <div><small>DESTINATION</small><strong>${escapeHtml(event.destination.city)} · ${escapeHtml(event.destinationIp)}</strong></div>
        <div><small>TARGET SECTOR</small><strong>${escapeHtml(event.targetSector)}</strong></div>
        <div><small>DETECTION</small><strong>${escapeHtml(event.detectionSource)}</strong></div>
      </div>
      <section class="drawer-section"><h3>Detection timeline</h3><div class="timeline">
        <div class="timeline-item"><time>${timeText(event.timestamp)}</time><p>Telemetry event diterima dari ${escapeHtml(event.detectionSource)}.</p></div>
        <div class="timeline-item"><time>${timeText(new Date(event.timestamp.getTime() + 5000))}</time><p>Indicator dinormalisasi, dianonimkan, dan dipetakan ke ${escapeHtml(event.mitre)}.</p></div>
        <div class="timeline-item"><time>${timeText(new Date(event.timestamp.getTime() + 9000))}</time><p>Incident diberi status <b>${escapeHtml(titleCase(event.status))}</b> dengan confidence ${event.confidence}%.</p></div>
      </div></section>
      <section class="drawer-section"><h3>Sanitized indicators</h3><div class="ioc-list"><div class="ioc-row"><span>SOURCE IP</span><code>${escapeHtml(event.sourceIp)}</code><button data-copy="${escapeHtml(event.sourceIp)}">COPY</button></div><div class="ioc-row"><span>DEST. IP</span><code>${escapeHtml(event.destinationIp)}</code><button data-copy="${escapeHtml(event.destinationIp)}">COPY</button></div><div class="ioc-row"><span>MITRE</span><code>${escapeHtml(event.mitre)}</code><button data-copy="${escapeHtml(event.mitre)}">COPY</button></div></div></section>
      <section class="drawer-section"><h3>Recommended defensive action</h3><div class="recommendation">Validasi alert dengan log tambahan, verifikasi aset yang terpengaruh, terapkan containment proporsional, preservasi bukti, dan eskalasi sesuai playbook SOC. Data incident ini merupakan simulasi edukatif.</div></section>
      <section class="drawer-section"><h3>Analyst notes</h3><textarea class="analyst-note" id="incidentNote" aria-label="Analyst notes" placeholder="Tambahkan catatan investigasi defensif...">${escapeHtml(event.notes || '')}</textarea></section>
      <div class="drawer-actions"><button class="ghost-btn" id="saveIncidentNoteBtn">Save note</button><button class="ghost-btn" id="falsePositiveBtn">Mark false positive</button><button class="primary-btn" id="resolveIncidentBtn">Resolve incident</button></div>`;
    openDrawer('incidentDrawer');
    $$('[data-copy]', $('#incidentDrawerBody')).forEach(button => button.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(button.dataset.copy); showToast('Copied', 'Sanitized indicator copied.'); } catch { showToast('Copy unavailable', 'Browser clipboard permission was not granted.'); }
    }));
    $('#saveIncidentNoteBtn')?.addEventListener('click', () => { event.notes = $('#incidentNote').value.trim(); showToast('Note saved', `Analyst note saved locally for ${event.id}.`); });
    $('#falsePositiveBtn')?.addEventListener('click', () => {
      event.status = 'false-positive'; renderIncidentTable(); renderFeed(); updateMetrics(); showToast('Incident updated', `${event.id} marked as false positive.`); closeDrawer('incidentDrawer');
    });
    $('#resolveIncidentBtn')?.addEventListener('click', () => {
      event.status = 'resolved'; renderIncidentTable(); renderFeed(); updateMetrics(); showToast('Incident updated', `${event.id} marked as resolved.`); closeDrawer('incidentDrawer');
    });
  }

  function openCreateIncidentModal() {
    const locationOptions = locations.map((item, index) => `<option value="${index}">${escapeHtml(item.country)} · ${escapeHtml(item.city)}</option>`).join('');
    openModal('Create simulated incident', 'INCIDENT CONSOLE', `<form class="modal-form" id="createIncidentForm"><div class="source-disclaimer"><strong>SIMULATION ONLY</strong><span>Form ini tidak mengirim traffic atau melakukan serangan. Hanya menambah data demo ke dashboard lokal.</span></div><div class="form-grid"><label>Attack type<select id="newAttackType">${attackTypes.map(item => `<option>${item.name}</option>`).join('')}</select></label><label>Severity<select id="newSeverity">${severities.map(item => `<option value="${item}">${titleCase(item)}</option>`).join('')}</select></label></div><div class="form-grid"><label>Source<select id="newSource">${locationOptions}</select></label><label>Destination<select id="newDestination">${locationOptions}</select></label></div><div class="form-grid"><label>Target sector<select id="newSector">${sectors.map(item => `<option>${item}</option>`).join('')}</select></label><label>Status<select id="newStatus">${statuses.map(item => `<option value="${item}">${titleCase(item)}</option>`).join('')}</select></label></div><label>Analyst note<textarea id="newIncidentNote" placeholder="Optional defensive context..."></textarea></label><div class="form-actions"><button type="button" class="ghost-btn" id="cancelCreateIncident">Cancel</button><button type="submit" class="primary-btn">Add simulated incident</button></div></form>`);
    $('#cancelCreateIncident').addEventListener('click', closeModal);
    $('#createIncidentForm').addEventListener('submit', event => {
      event.preventDefault();
      const incident = createIncident(0);
      incident.attackType = $('#newAttackType').value;
      incident.severity = $('#newSeverity').value;
      incident.source = locations[Number($('#newSource').value)];
      incident.destination = locations[Number($('#newDestination').value)];
      if (incident.source === incident.destination) incident.destination = locations[(Number($('#newDestination').value) + 1) % locations.length];
      incident.targetSector = $('#newSector').value;
      incident.status = $('#newStatus').value;
      incident.notes = $('#newIncidentNote').value.trim();
      state.incidents.unshift(incident);
      state.activeEvents.unshift(incident);
      const removed = state.activeEvents.splice(state.maxActiveEvents); removed.forEach(old => removeMapEvent(old.id)); addMapEvent(incident);
      state.incidentPage = 1; renderIncidentTable(); prependFeedItem(incident); updateMetrics(); closeModal(); showToast('Simulated incident created', `${incident.id} added to local dashboard data.`);
    });
  }

  function closeDrawer(id) {
    const drawer = document.getElementById(id);
    if (!drawer) return;
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
  }

  function renderNotifications() {
    const data = [
      { icon: '!', title: 'Critical incident simulated', desc: 'A DDoS simulation reached the critical threshold.', time: '2 minutes ago', color: '#ff3040', unread: true },
      { icon: 'TI', title: 'Threat intelligence updated', desc: 'Three emerging campaign summaries are available.', time: '11 minutes ago', color: '#00d9ff', unread: true },
      { icon: '✓', title: 'Report generated', desc: 'Daily threat summary is ready for preview.', time: '27 minutes ago', color: '#2de38a', unread: true },
      { icon: 'SYS', title: 'Feed latency restored', desc: 'Demo stream latency returned below 50 ms.', time: '1 hour ago', color: '#ff9f1c', unread: true }
    ];
    $('#notificationList').innerHTML = `<div class="drawer-actions" style="margin:0 0 14px"><button class="ghost-btn" id="markNotificationsRead">Mark all read</button><button class="ghost-btn" id="clearNotifications">Clear</button></div><div id="notificationItems">${data.map(item => `<article class="notification-item ${item.unread ? 'unread' : ''}"><div class="notification-icon" style="color:${item.color}">${item.icon}</div><div><strong>${item.title}</strong><p>${item.desc}</p><time>${item.time}</time></div></article>`).join('')}</div>`;
    $('#markNotificationsRead')?.addEventListener('click', () => { $$('.notification-item').forEach(item => item.classList.remove('unread')); $('#notifyBtn b').textContent = '0'; showToast('Notifications', 'All notifications marked as read.'); });
    $('#clearNotifications')?.addEventListener('click', () => { $('#notificationItems').innerHTML = '<div class="empty-state" style="min-height:240px"><strong>No notifications</strong><p>New simulated alerts and system updates will appear here.</p></div>'; $('#notifyBtn b').textContent = '0'; });
  }

  function analyticsLineChart(values, secondary = null, labels = []) {
    const max = Math.max(1, ...values, ...(secondary || []));
    const width = 820, height = 195;
    const x = index => 48 + index * (width / Math.max(1, values.length - 1));
    const y = value => 225 - value / max * height;
    const path = values.map((value, index) => `${index ? 'L' : 'M'} ${x(index).toFixed(1)} ${y(value).toFixed(1)}`).join(' ');
    const secondaryPath = secondary ? secondary.map((value, index) => `${index ? 'L' : 'M'} ${x(index).toFixed(1)} ${y(value).toFixed(1)}`).join(' ') : '';
    const area = `${path} L ${x(values.length - 1).toFixed(1)} 225 L 48 225 Z`;
    const grid = Array.from({ length: 5 }, (_, index) => `<line class="grid-line" x1="48" y1="${30 + index * 49}" x2="868" y2="${30 + index * 49}"/><text class="axis-label" x="4" y="${34 + index * 49}">${Math.round(max - index * max / 4)}</text>`).join('');
    const tickEvery = Math.max(1, Math.floor(values.length / 6));
    const xLabels = values.map((_, index) => index % tickEvery === 0 || index === values.length - 1 ? `<text class="axis-label" x="${x(index)-10}" y="262">${escapeHtml(labels[index] || String(index + 1))}</text>` : '').join('');
    return `<svg class="chart" viewBox="0 0 900 280" role="img" aria-label="Threat activity timeline"><defs><linearGradient id="analyticsAreaGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff3040" stop-opacity=".28"/><stop offset="1" stop-color="#ff3040" stop-opacity="0"/></linearGradient></defs>${grid}${xLabels}<path d="${area}" fill="url(#analyticsAreaGradient)"/><path class="line" d="${path}"/>${secondary ? `<path class="line-secondary" d="${secondaryPath}"/>` : ''}${values.map((value,index) => index % tickEvery === 0 ? `<circle class="chart-dot" cx="${x(index)}" cy="${y(value)}" r="2.7"><title>${labels[index] || index}: ${value} events</title></circle>` : '').join('')}</svg>`;
  }

  function getTimelineBuckets(items, range) {
    const bucketCount = range === '30d' ? 15 : range === '7d' ? 14 : 24;
    const totalMs = range === '30d' ? 2592000000 : range === '7d' ? 604800000 : 86400000;
    const bucketMs = totalMs / bucketCount;
    const now = Date.now();
    const values = Array(bucketCount).fill(0);
    const critical = Array(bucketCount).fill(0);
    items.forEach(item => {
      const index = Math.floor((now - item.timestamp.getTime()) / bucketMs);
      if (index >= 0 && index < bucketCount) {
        const target = bucketCount - index - 1;
        values[target]++;
        if (item.severity === 'critical' || item.severity === 'high') critical[target]++;
      }
    });
    const labels = Array.from({ length: bucketCount }, (_, index) => {
      const date = new Date(now - (bucketCount - index - 1) * bucketMs);
      return range === '24h' ? `${pad(date.getHours())}:00` : `${pad(date.getDate())}/${pad(date.getMonth()+1)}`;
    });
    return { values, critical, labels };
  }

  function renderAnalyticsPage() {
    const items = filteredAnalyticsIncidents();
    const range = $('#analyticsRange')?.value || '24h';
    const critical = items.filter(item => item.severity === 'critical').length;
    const blocked = items.filter(item => item.status === 'blocked').length;
    const countries = new Set(items.flatMap(item => [item.source.country, item.destination.country])).size;
    const avgConfidence = items.length ? Math.round(items.reduce((sum, item) => sum + item.confidence, 0) / items.length) : 0;
    $('#analyticsResultLabel').textContent = `${items.length} events matched`;
    $('#analyticsKpis').innerHTML = [
      ['MATCHED EVENTS', number(items.length), `${range.toUpperCase()} filtered scope`, '#ff3040'],
      ['CRITICAL EVENTS', number(critical), `${items.length ? Math.round(critical/items.length*100) : 0}% of matched events`, '#ff2daa'],
      ['BLOCKED RATE', `${items.length ? Math.round(blocked/items.length*100) : 0}%`, `${blocked} attempts blocked`, '#2de38a'],
      ['AVG. CONFIDENCE', `${avgConfidence}%`, `${countries} countries observed`, '#00d9ff']
    ].map(([label,value,desc,color]) => `<article class="analytics-kpi" style="--accent:${color}"><small>${label}</small><strong>${value}</strong><span>${desc}</span></article>`).join('');
    const grid = $('#analyticsPageGrid');
    grid.classList.add('complete');
    if (!items.length) { grid.innerHTML = '<div class="analytics-empty"><strong>No telemetry matched the selected filters.</strong><p>Reset filter atau pilih rentang yang lebih luas.</p></div>'; return; }

    const categoryRows = countBy(items, item => item.attackType);
    const severityRows = severities.map(severity => [titleCase(severity), items.filter(item => item.severity === severity).length]).filter(([,value]) => value);
    const sectorRows = countBy(items, item => item.targetSector);
    const sourceRows = countBy(items, item => item.source.country).slice(0, 8);
    const destinationRows = countBy(items, item => item.destination.country).slice(0, 8);
    const protocolRows = countBy(items, item => getProtocol(item));
    const statusRows = countBy(items, item => titleCase(item.status));
    const confidenceRows = [['60–69%', items.filter(item => item.confidence < 70).length], ['70–79%', items.filter(item => item.confidence >= 70 && item.confidence < 80).length], ['80–89%', items.filter(item => item.confidence >= 80 && item.confidence < 90).length], ['90–100%', items.filter(item => item.confidence >= 90).length]];
    const timeline = getTimelineBuckets(items, range === 'all' ? '30d' : range);
    const panel = (title, eyebrow, body, cls = '') => `<article class="tactical-panel ${cls}"><div class="panel-title"><div><span class="eyebrow">${eyebrow}</span><h3>${title}</h3></div></div>${body}</article>`;
    const protocolMax = Math.max(1, ...protocolRows.map(([,v]) => v));
    const heatHours = Array.from({ length: 12 }, (_, i) => `${pad(i*2)}h`);
    const heatDays = ['MON','TUE','WED','THU','FRI','SAT','SUN'];
    const heatCells = heatDays.flatMap((day, dayIndex) => [`<span class="day-label">${day}</span>`, ...heatHours.map((_, hourIndex) => {
      const value = ((dayIndex + 3) * (hourIndex + 5) * 7 + items.length) % 100;
      return `<i class="heat-cell" style="--a:${(.05 + value/140).toFixed(2)}"><title>${day} ${heatHours[hourIndex]} · density ${value}%</title></i>`;
    })]).join('');
    const riskCells = Array.from({ length: 25 }, (_, index) => { const x = index % 5, y = Math.floor(index/5); const score = (x+1)*(5-y); return `<div class="risk-cell" style="--a:${(.04+score/32).toFixed(2)}">${score}</div>`; }).join('');

    grid.innerHTML = [
      panel('Threat volume over time', 'TIMELINE', `${analyticsLineChart(timeline.values, timeline.critical, timeline.labels)}<div class="chart-legend-inline"><span style="color:#ff3040"><i></i>All events</span><span style="color:#00d9ff"><i></i>Critical + high</span></div>`, 'panel-span-8'),
      panel('Severity distribution', 'RISK', renderBarRows(severityRows, '#ff2daa'), 'panel-span-4'),
      panel('Top attack vectors', 'CATEGORIES', renderBarRows(categoryRows.slice(0, 8), '#e31e24'), 'panel-span-4'),
      panel('Targeted sectors', 'INDUSTRY', renderBarRows(sectorRows.slice(0, 8), '#ff9f1c'), 'panel-span-4'),
      panel('Incident status', 'WORKFLOW', renderBarRows(statusRows, '#2de38a'), 'panel-span-4'),
      panel('Top source countries', 'ORIGIN', renderBarRows(sourceRows, '#9b5cff'), 'panel-span-6'),
      panel('Top targeted countries', 'DESTINATION', renderBarRows(destinationRows, '#00d9ff'), 'panel-span-6'),
      panel('Protocol activity', 'NETWORK', `<div class="protocol-chart">${protocolRows.map(([name,value]) => `<div class="protocol-row"><span>${name}</span><span class="protocol-track"><i style="--w:${(value/protocolMax*100).toFixed(1)}%"></i></span><b>${value}</b></div>`).join('')}</div>`, 'panel-span-4'),
      panel('Detection confidence', 'QUALITY', `<div class="breakdown-grid">${confidenceRows.map(([name,value],index) => `<div class="breakdown-item" style="--accent:${['#8f9ba8','#00d9ff','#ff9f1c','#2de38a'][index]};--w:${items.length ? value/items.length*100 : 0}%"><small>${name}</small><strong>${value} events</strong><i></i></div>`).join('')}</div>`, 'panel-span-4'),
      panel('Risk matrix', 'LIKELIHOOD × IMPACT', `<div class="risk-matrix">${riskCells}</div><p style="color:var(--muted);font:8px var(--mono);margin-top:12px">Higher values represent higher simulated priority.</p>`, 'panel-span-4'),
      panel('Activity heatmap', 'DAY × HOUR', `<div class="heatmap-wrap"><div class="heatmap-axis"><span></span>${heatHours.map(label => `<span>${label}</span>`).join('')}</div><div class="heatmap-matrix">${heatCells}</div></div>`, 'panel-span-12')
    ].join('');
  }

  function exportAnalyticsSnapshot() {
    const items = filteredAnalyticsIncidents();
    const snapshot = {
      generatedAt: new Date().toISOString(),
      dataMode: 'simulated',
      filters: { range: $('#analyticsRange').value, country: $('#analyticsCountry').value, severity: $('#analyticsSeverity').value, sector: $('#analyticsSector').value },
      totals: { events: items.length, critical: items.filter(item => item.severity === 'critical').length, blocked: items.filter(item => item.status === 'blocked').length },
      attackTypes: Object.fromEntries(countBy(items, item => item.attackType)),
      sectors: Object.fromEntries(countBy(items, item => item.targetSector)),
      countries: Object.fromEntries(countBy(items, item => item.destination.country))
    };
    downloadText(`moklet-analytics-${Date.now()}.json`, JSON.stringify(snapshot, null, 2));
    showToast('Analytics exported', 'Filtered simulated snapshot downloaded as JSON.');
  }

  function getFilteredIntelligence() {
    const query = ($('#intelSearch')?.value || '').trim().toLowerCase();
    const category = $('#intelCategory')?.value || 'all';
    const severity = $('#intelSeverity')?.value || 'all';
    return intelligenceItems.filter(item => {
      const haystack = `${item.id} ${item.title} ${item.category} ${item.region} ${item.tags.join(' ')} ${item.mitre.join(' ')}`.toLowerCase();
      return (!query || haystack.includes(query)) &&
        (category === 'all' || item.category === category) &&
        (severity === 'all' || item.severity === severity) &&
        (!state.intelBookmarkOnly || state.intelBookmarks.has(item.id));
    });
  }

  function renderIntelSummary(items = intelligenceItems) {
    const critical = items.filter(item => item.severity === 'critical').length;
    const high = items.filter(item => item.severity === 'high').length;
    const avg = items.length ? Math.round(items.reduce((sum,item) => sum + item.confidence, 0) / items.length) : 0;
    const regions = new Set(items.map(item => item.region)).size;
    $('#intelSummary').innerHTML = [
      ['ACTIVE INTELLIGENCE', items.length, 'sanitized records', '#00d9ff'],
      ['CRITICAL / HIGH', `${critical} / ${high}`, 'priority review', '#ff3040'],
      ['AVG. CONFIDENCE', `${avg}%`, 'analyst confidence', '#2de38a'],
      ['REGIONS', regions, 'coverage areas', '#9b5cff']
    ].map(([label,value,desc,color]) => `<article class="summary-tile" style="--accent:${color}"><small>${label}</small><strong>${value}</strong><span>${desc}</span></article>`).join('');
  }

  function renderIntel() {
    const items = getFilteredIntelligence();
    renderIntelSummary(items);
    $('#intelResultLabel').textContent = `${items.length} intelligence records`;
    $('#intelBookmarksBtn').classList.toggle('active', state.intelBookmarkOnly);
    $('#intelGrid').innerHTML = items.length ? items.map(item => {
      const color = severityColor(item.severity);
      const bookmarked = state.intelBookmarks.has(item.id);
      return `<article class="intel-card ${bookmarked ? 'bookmarked' : ''}" style="--accent:${color}"><header><span class="intel-tag">${item.category.toUpperCase()} · ${item.id}</span><span class="severity ${item.severity}">${item.severity}</span></header><div class="intel-title-row"><h3>${escapeHtml(item.title)}</h3><button class="bookmark-btn ${bookmarked ? 'active' : ''}" data-bookmark="${item.id}" aria-label="Bookmark ${escapeHtml(item.title)}">${bookmarked ? '★' : '☆'}</button></div><p>${escapeHtml(item.summary)}</p><div class="tag-list">${item.tags.map(tag => `<span>#${escapeHtml(tag)}</span>`).join('')}</div><div class="intel-meta"><div>CONFIDENCE<b>${item.confidence}%</b></div><div>REGION<b>${escapeHtml(item.region)}</b></div><div>FIRST SEEN<b>${item.firstSeen}</b></div><div>LAST SEEN<b>${item.lastSeen}</b></div></div><div class="card-footer"><button data-intel="${item.id}">OPEN DETAILS →</button><span>SIMULATED / SANITIZED</span></div></article>`;
    }).join('') : '<div class="analytics-empty"><strong>No intelligence matched.</strong><p>Ubah filter, pencarian, atau nonaktifkan bookmark-only.</p></div>';
    $$('[data-bookmark]', $('#intelGrid')).forEach(button => button.addEventListener('click', event => {
      event.stopPropagation();
      const id = button.dataset.bookmark;
      state.intelBookmarks.has(id) ? state.intelBookmarks.delete(id) : state.intelBookmarks.add(id);
      saveBookmarks(); renderIntel(); showToast('Bookmark updated', `${id} ${state.intelBookmarks.has(id) ? 'saved' : 'removed'}.`);
    }));
    $$('[data-intel]', $('#intelGrid')).forEach(button => button.addEventListener('click', () => openIntelligenceDrawer(button.dataset.intel)));
  }

  function openIntelligenceDrawer(id) {
    const item = intelligenceItems.find(entry => entry.id === id);
    if (!item) return;
    $('#intelDrawerTitle').textContent = item.id;
    const note = state.intelNotes[item.id] || '';
    $('#intelligenceDrawerBody').innerHTML = `<div class="intel-detail-hero" style="--accent:${severityColor(item.severity)}"><span class="intel-tag">${item.category.toUpperCase()} · ${item.region}</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.summary)}</p><div class="tag-list">${item.tags.map(tag => `<span>#${escapeHtml(tag)}</span>`).join('')}</div></div><section class="drawer-section"><h3>MITRE ATT&amp;CK mapping</h3><div class="relation-list">${item.mitre.map(value => `<button type="button"><span>${escapeHtml(value)}</span><b>TECHNIQUE</b></button>`).join('')}</div></section><section class="drawer-section"><h3>Sanitized indicators</h3><div class="ioc-list">${item.indicators.map(([type,value]) => `<div class="ioc-row"><span>${type}</span><code>${escapeHtml(value)}</code><button data-copy="${escapeHtml(value)}">COPY</button></div>`).join('')}</div></section><section class="drawer-section"><h3>Defensive recommendations</h3><ul class="lesson-objectives">${item.recommendations.map(value => `<li>${escapeHtml(value)}</li>`).join('')}</ul></section><section class="drawer-section"><h3>Related simulated incidents</h3><div class="relation-list">${state.incidents.filter(event => event.severity === item.severity || item.mitre.some(tech => event.mitre.includes(tech.split(' ')[0]))).slice(0,4).map(event => `<button type="button" data-related-incident="${event.id}"><span>${event.id} · ${escapeHtml(event.attackType)}</span><b>${event.source.iso} → ${event.destination.iso}</b></button>`).join('') || '<p style="color:var(--muted);font-size:10px">No related simulated incidents in current memory.</p>'}</div></section><section class="drawer-section"><h3>Analyst note</h3><textarea class="analyst-note" id="intelNote" placeholder="Catatan disimpan lokal di browser...">${escapeHtml(note)}</textarea></section><div class="drawer-actions"><button class="ghost-btn" id="toggleIntelBookmark">${state.intelBookmarks.has(item.id) ? 'Remove bookmark' : 'Bookmark'}</button><button class="primary-btn" id="saveIntelNote">Save analyst note</button></div>`;
    openDrawer('intelligenceDrawer');
    $$('[data-copy]', $('#intelligenceDrawerBody')).forEach(button => button.addEventListener('click', async () => { try { await navigator.clipboard.writeText(button.dataset.copy); showToast('Copied', 'Sanitized indicator copied.'); } catch { showToast('Copy unavailable', 'Clipboard permission was not granted.'); } }));
    $$('[data-related-incident]', $('#intelligenceDrawerBody')).forEach(button => button.addEventListener('click', () => { closeDrawer('intelligenceDrawer'); openIncidentDrawer(state.incidents.find(event => event.id === button.dataset.relatedIncident)); }));
    $('#toggleIntelBookmark').addEventListener('click', () => { state.intelBookmarks.has(item.id) ? state.intelBookmarks.delete(item.id) : state.intelBookmarks.add(item.id); saveBookmarks(); renderIntel(); openIntelligenceDrawer(item.id); });
    $('#saveIntelNote').addEventListener('click', () => { state.intelNotes[item.id] = $('#intelNote').value.trim(); saveAnalystNotes(); showToast('Note saved', `Intelligence note saved locally for ${item.id}.`); });
  }

  function openNewIntelNoteModal() {
    openModal('New intelligence note', 'THREAT INTELLIGENCE', `<form class="modal-form" id="newIntelForm"><div class="source-disclaimer"><strong>LOCAL NOTE</strong><span>Catatan ini hanya disimpan di browser dan tidak membuat indikator nyata.</span></div><label>Title<input id="newIntelTitle" required placeholder="Example: Authentication anomaly observation"></label><div class="form-grid"><label>Category<select id="newIntelCategory"><option>Analyst Note</option><option>Observation</option><option>Advisory</option></select></label><label>Severity<select id="newIntelSeverity"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label></div><label>Content<textarea id="newIntelContent" required placeholder="Write facts, context, and defensive recommendation..."></textarea></label><div class="form-actions"><button type="button" class="ghost-btn" id="cancelIntelNote">Cancel</button><button type="submit" class="primary-btn">Save note</button></div></form>`);
    $('#cancelIntelNote').addEventListener('click', closeModal);
    $('#newIntelForm').addEventListener('submit', event => { event.preventDefault(); const id = `NOTE-${Date.now()}`; state.intelNotes[id] = { title: $('#newIntelTitle').value.trim(), category: $('#newIntelCategory').value, severity: $('#newIntelSeverity').value, content: $('#newIntelContent').value.trim(), createdAt: new Date().toISOString() }; saveAnalystNotes(); closeModal(); showToast('Intelligence note saved', 'Local analyst note added to browser storage.'); });
  }

  const safeLogExamples = [
    { text: '[2026-06-24T10:42:05+07:00] event_id=AUTH-184\nseverity=medium action=blocked\nsource_ip=185.xxx.xxx.21 source_country=DE\ndestination=student-portal service=https\nuser=student-*** result=failed_login\nrule=multiple_failed_auth confidence=87', explanation: [['TIMESTAMP', 'Waktu event diterima dalam zona WIB.'], ['SEVERITY', 'Prioritas medium; perlu korelasi, bukan panik.'], ['ACTION', 'Kontrol keamanan telah memblokir aktivitas.'], ['SOURCE IP', 'Sudah dimasking agar tidak mengekspos alamat penuh.'], ['RULE', 'Rule mendeteksi failed login berulang.'], ['NEXT STEP', 'Periksa histori user, device, dan successful login setelah event.']] },
    { text: '[2026-06-24T11:03:41+07:00] event_id=NET-219\nseverity=high action=rate_limited\nsource_count=148 destination=web-gateway\nprotocol=https requests_per_second=2850\nrule=traffic_spike confidence=93\ndata_mode=simulated', explanation: [['EVENT ID', 'Identifier untuk korelasi dan pelaporan.'], ['SOURCE COUNT', 'Jumlah sumber simulasi yang terlihat.'], ['RPS', 'Request per second; dibandingkan dengan baseline normal.'], ['ACTION', 'Rate limiting aktif untuk menjaga layanan.'], ['CONFIDENCE', 'Keyakinan deteksi 93%, tetap perlu validasi.'], ['DATA MODE', 'Menegaskan bahwa event bukan traffic serangan nyata.']] },
    { text: '[2026-06-24T11:19:12+07:00] event_id=ENDPOINT-331\nseverity=critical action=isolated\nasset=LAB-PC-07 process=unknown-demo.exe\nparent=browser.exe network=telemetry-sync[.]example\nrule=sandbox_beacon_pattern confidence=96\nstatus=investigating', explanation: [['ASSET', 'Nama aset lab yang telah disamarkan.'], ['PROCESS', 'Nama file contoh, bukan malware aktif.'], ['PARENT', 'Proses induk membantu memahami execution chain.'], ['NETWORK', 'Domain menggunakan format aman [.] agar tidak clickable.'], ['ACTION', 'Endpoint diisolasi dalam skenario latihan.'], ['STATUS', 'Incident masih dalam tahap investigasi.']] }
  ];
  let currentLogExample = 0;

  function getEducationCompletion(module) {
    const saved = state.educationProgress[module.id];
    return saved?.completed ? 100 : saved?.score ? Math.max(35, saved.score) : 0;
  }

  function calculateEducationProgress() {
    const total = educationModules.reduce((sum,module) => sum + getEducationCompletion(module), 0);
    return Math.round(total / educationModules.length);
  }

  function renderEducationOverview() {
    const completed = educationModules.filter(module => state.educationProgress[module.id]?.completed).length;
    const quizScores = Object.values(state.educationProgress).filter(value => value?.score).map(value => value.score);
    const averageScore = quizScores.length ? Math.round(quizScores.reduce((a,b) => a+b,0) / quizScores.length) : 0;
    const progress = calculateEducationProgress();
    $('#educationProgress strong').textContent = `${progress}%`;
    const badgeCount = [completed >= 1, completed >= 5, completed === educationModules.length, averageScore >= 80].filter(Boolean).length;
    $('#educationOverview').innerHTML = [
      ['COMPLETED MODULES', `${completed}/${educationModules.length}`, 'learning path', '#2de38a'],
      ['AVERAGE QUIZ', `${averageScore}%`, quizScores.length ? `${quizScores.length} quiz attempts` : 'no quiz completed', '#00d9ff'],
      ['BADGES UNLOCKED', `${badgeCount}/4`, 'local achievements', '#f4d35e'],
      ['TOTAL DURATION', '171 min', 'estimated learning time', '#ff3040']
    ].map(([label,value,desc,color]) => `<article class="summary-tile" style="--accent:${color}"><small>${label}</small><strong>${value}</strong><span>${desc}</span></article>`).join('');
  }

  function renderEducation() {
    renderEducationOverview();
    const modules = educationModules.filter(module => state.educationFilter === 'all' || (state.educationFilter === 'completed' ? state.educationProgress[module.id]?.completed : module.category === state.educationFilter));
    $('#educationGrid').innerHTML = modules.length ? modules.map(module => {
      const progress = getEducationCompletion(module);
      const completed = progress === 100;
      const saved = state.educationProgress[module.id];
      return `<article class="education-card ${completed ? 'completed' : ''}" style="--accent:${completed ? '#2de38a' : '#e31e24'}"><div class="module-top"><span class="module-index">MODULE ${module.number}</span><span class="module-level">${module.level} · ${module.duration}</span></div><h3>${escapeHtml(module.title)}</h3><p>${escapeHtml(module.description)}</p><div class="tag-list"><span>#${module.category}</span>${saved?.score ? `<span>quiz ${saved.score}%</span>` : ''}</div><div class="progress-line"><i style="--w:${progress}%"></i></div><div class="card-footer"><button class="education-open" data-module="${module.id}">${completed ? 'REVIEW' : progress ? 'CONTINUE' : 'START'} →</button><span>${progress}% · ${completed ? 'Completed' : progress ? 'In progress' : 'Not started'}</span></div></article>`;
    }).join('') : '<div class="analytics-empty"><strong>No module in this filter.</strong></div>';
    $$('[data-module]', $('#educationGrid')).forEach(button => button.addEventListener('click', () => openEducationModule(button.dataset.module)));
    renderSafeLogExample();
    renderGlossary();
  }

  function openEducationModule(id) {
    const module = educationModules.find(item => item.id === id);
    if (!module) return;
    $('#educationDrawerTitle').textContent = module.title;
    const saved = state.educationProgress[module.id] || {};
    $('#educationDrawerBody').innerHTML = `<div class="intel-detail-hero" style="--accent:#e31e24"><span class="intel-tag">MODULE ${module.number} · ${module.level} · ${module.duration}</span><h3>${escapeHtml(module.title)}</h3><p>${escapeHtml(module.description)}</p></div><section class="drawer-section"><h3>Learning objectives</h3><ul class="lesson-objectives">${module.objectives.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul></section><section class="drawer-section lesson-content"><h3>Lesson</h3>${module.content}</section><section class="drawer-section"><h3>Knowledge check</h3><form class="quiz-form" id="moduleQuiz"><div class="quiz-question"><strong>${escapeHtml(module.quiz.q)}</strong><div class="quiz-options">${module.quiz.options.map((option,index) => `<label><input type="radio" name="answer" value="${index}" required> ${escapeHtml(option)}</label>`).join('')}</div></div><button class="primary-btn" type="submit">Check answer</button><div id="moduleQuizResult">${saved.score ? `<div class="quiz-result">Last score: ${saved.score}%</div>` : ''}</div></form></section><div class="drawer-actions"><button class="ghost-btn" id="resetModuleBtn">Reset progress</button><button class="primary-btn" id="completeModuleBtn">${saved.completed ? 'Completed ✓' : 'Mark module complete'}</button></div>`;
    openDrawer('educationDrawer');
    $('#moduleQuiz').addEventListener('submit', event => {
      event.preventDefault();
      const selected = Number(new FormData(event.currentTarget).get('answer'));
      const correct = selected === module.quiz.answer;
      const score = correct ? 100 : 40;
      state.educationProgress[module.id] = { ...(state.educationProgress[module.id] || {}), score, lastAttempt: new Date().toISOString() };
      saveEducationProgress();
      $('#moduleQuizResult').innerHTML = `<div class="quiz-result" style="border-color:${correct ? '#2de38a' : '#ff9f1c'}">${correct ? 'Benar. Kamu memilih respons defensif yang tepat.' : `Belum tepat. Jawaban yang disarankan: ${escapeHtml(module.quiz.options[module.quiz.answer])}`}</div>`;
      renderEducationOverview();
    });
    $('#completeModuleBtn').addEventListener('click', () => {
      state.educationProgress[module.id] = { ...(state.educationProgress[module.id] || {}), completed: true, completedAt: new Date().toISOString() };
      saveEducationProgress(); renderEducation(); openEducationModule(module.id); showToast('Module completed', `${module.title} marked as completed.`);
    });
    $('#resetModuleBtn').addEventListener('click', () => { delete state.educationProgress[module.id]; saveEducationProgress(); renderEducation(); openEducationModule(module.id); showToast('Progress reset', `${module.title} progress cleared from this browser.`); });
  }

  function renderSafeLogExample() {
    const example = safeLogExamples[currentLogExample % safeLogExamples.length];
    $('#safeLogExample').textContent = example.text;
    $('#logExplanation').innerHTML = example.explanation.map(([term,desc]) => `<div><b>${term}</b><span>${desc}</span></div>`).join('');
  }

  function renderGlossary() {
    const query = ($('#glossarySearch')?.value || '').trim().toLowerCase();
    const terms = glossaryTerms.filter(([term,desc]) => !query || `${term} ${desc}`.toLowerCase().includes(query));
    $('#glossaryList').innerHTML = terms.map(([term,desc]) => `<article class="glossary-item"><strong>${escapeHtml(term)}</strong><p>${escapeHtml(desc)}</p></article>`).join('') || '<div class="empty-state" style="min-height:160px"><strong>Term not found</strong></div>';
  }

  function addSourceLog(source, action = 'sync') {
    state.sourceLog.unshift({ time: new Date(), source: source.name, action, status: source.status });
    state.sourceLog = state.sourceLog.slice(0, 12);
  }

  function renderSourceOverview() {
    const enabled = dataSources.filter(source => source.enabled);
    const operational = enabled.filter(source => source.status === 'Operational').length;
    const avgLatency = enabled.length ? Math.round(enabled.reduce((sum,source) => sum + source.latency,0)/enabled.length) : 0;
    const avgReliability = enabled.length ? Math.round(enabled.reduce((sum,source) => sum + source.reliability,0)/enabled.length) : 0;
    $('#sourceOverview').innerHTML = [
      ['ENABLED SOURCES', `${enabled.length}/${dataSources.length}`, 'active connectors', '#00d9ff'],
      ['OPERATIONAL', `${operational}/${enabled.length || 0}`, 'healthy sources', '#2de38a'],
      ['AVG. LATENCY', `${avgLatency} ms`, 'simulated ingestion', '#ff9f1c'],
      ['RELIABILITY', `${avgReliability}%`, 'weighted health score', '#9b5cff']
    ].map(([label,value,desc,color]) => `<article class="summary-tile" style="--accent:${color}"><small>${label}</small><strong>${value}</strong><span>${desc}</span></article>`).join('');
  }

  function renderSources() {
    renderSourceOverview();
    $('#sourcesGrid').innerHTML = dataSources.map(source => `<article class="source-card ${source.enabled ? '' : 'disabled'}" data-source="${source.id}" style="--accent:${source.color}"><header><span class="intel-tag">${source.type.toUpperCase()}</span><span class="source-health ${source.status === 'Operational' ? '' : 'degraded'}" style="color:${sourceStatusColor(source.status)}"><i></i>${source.enabled ? source.status : 'Disabled'}</span></header><h3>${escapeHtml(source.name)}</h3><p>${escapeHtml(source.description)}</p><div class="source-meta"><div>UPDATE INTERVAL<b>${source.interval}</b></div><div>RELIABILITY<b>${source.reliability}%</b></div><div>LATENCY<b>${source.latency} ms</b></div><div>DATA MODE<b>${source.mode}</b></div></div><div class="card-footer"><button type="button">VIEW CONFIGURATION →</button><span>${source.volume}</span></div></article>`).join('');
    $$('[data-source]', $('#sourcesGrid')).forEach(card => card.addEventListener('click', () => openSourceDrawer(card.dataset.source)));
    renderSourceLog();
  }

  function renderSourceLog() {
    if (!state.sourceLog.length) dataSources.slice(0,5).forEach(source => addSourceLog(source, 'initial synchronization'));
    $('#sourceLog').innerHTML = state.sourceLog.map(item => `<div class="source-log-row"><time>${timeText(item.time)}</time><span>${escapeHtml(item.source)} · ${escapeHtml(item.action)}</span><b style="color:${sourceStatusColor(item.status)}">${item.status}</b></div>`).join('');
  }

  function refreshSources() {
    const button = $('#refreshSourcesBtn');
    button.disabled = true; button.textContent = 'Refreshing…';
    setTimeout(() => {
      dataSources.forEach(source => {
        if (!source.enabled) return;
        source.latency = clamp(source.latency + rand(-18, 22), 8, 260);
        source.reliability = clamp(source.reliability + rand(-2, 2), 72, 100);
        source.status = source.latency > 180 ? 'Degraded' : source.latency > 120 ? 'Delayed' : 'Operational';
        addSourceLog(source, 'manual refresh');
      });
      button.disabled = false; button.textContent = 'Refresh all'; renderSources(); showToast('Sources refreshed', 'Health, latency, and synchronization time were updated locally.');
    }, 650);
  }

  function openSourceDrawer(id) {
    const source = dataSources.find(item => item.id === id);
    if (!source) return;
    $('#sourceDrawerTitle').textContent = source.name;
    $('#sourceDrawerBody').innerHTML = `<div class="intel-detail-hero" style="--accent:${source.color}"><span class="intel-tag">${source.type.toUpperCase()} · ${source.mode}</span><h3>${escapeHtml(source.name)}</h3><p>${escapeHtml(source.description)}</p></div><section class="drawer-section"><h3>Connector health</h3><div class="source-detail-stats"><div><small>STATUS</small><strong style="color:${sourceStatusColor(source.status)}">${source.enabled ? source.status : 'Disabled'}</strong></div><div><small>RELIABILITY</small><strong>${source.reliability}%</strong></div><div><small>LATENCY</small><strong>${source.latency} ms</strong></div><div><small>VOLUME</small><strong>${source.volume}</strong></div><div><small>INTERVAL</small><strong>${source.interval}</strong></div><div><small>DATA MODE</small><strong>${source.mode}</strong></div></div></section><section class="drawer-section"><h3>Configuration</h3><div class="toggle-row"><div><strong>Enable source</strong><small>Include this simulated source in health calculations.</small></div><label class="switch"><input id="sourceEnabledToggle" type="checkbox" ${source.enabled ? 'checked' : ''}><i></i></label></div><div class="toggle-row"><div><strong>Auto synchronization</strong><small>Prototype setting stored only for this session.</small></div><label class="switch"><input type="checkbox" checked><i></i></label></div></section><section class="drawer-section"><h3>Privacy & safety</h3><div class="recommendation">Connector ini hanya menggunakan data ${source.mode.toLowerCase()}. Secret, password, token, IP aktif, dan data personal tidak ditampilkan pada frontend.</div></section><div class="drawer-actions"><button class="ghost-btn" id="testSourceBtn">Run health check</button><button class="primary-btn" id="syncSourceBtn">Sync now</button></div>`;
    openDrawer('sourceDrawer');
    $('#sourceEnabledToggle').addEventListener('change', event => { source.enabled = event.target.checked; addSourceLog(source, source.enabled ? 'source enabled' : 'source disabled'); renderSources(); openSourceDrawer(source.id); });
    $('#testSourceBtn').addEventListener('click', () => { source.latency = clamp(source.latency + rand(-15, 15), 8, 260); source.status = source.latency > 180 ? 'Degraded' : 'Operational'; addSourceLog(source, 'health check'); renderSources(); openSourceDrawer(source.id); showToast('Health check complete', `${source.name}: ${source.status}, ${source.latency} ms.`); });
    $('#syncSourceBtn').addEventListener('click', () => { addSourceLog(source, 'manual source sync'); renderSourceLog(); showToast('Source synchronized', `${source.name} updated successfully.`); });
  }

  function populateSelectOptions() {
    const countries = [...new Set(locations.map(location => location.country))].sort();
    const countryOptions = countries.map(country => `<option value="${escapeHtml(country)}">${escapeHtml(country)}</option>`).join('');
    ['analyticsCountry','reportCountry'].forEach(id => { const select = document.getElementById(id); if (select && select.options.length <= 1) select.insertAdjacentHTML('beforeend', countryOptions); });
    const sector = $('#analyticsSector');
    if (sector && sector.options.length <= 1) sector.insertAdjacentHTML('beforeend', sectors.map(value => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join(''));
    const category = $('#intelCategory');
    if (category && category.options.length <= 1) category.insertAdjacentHTML('beforeend', [...new Set(intelligenceItems.map(item => item.category))].sort().map(value => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join(''));
  }

  function getReportData() {
    const range = $('#reportRange').value;
    const severity = $('#reportSeverity').value;
    const country = $('#reportCountry').value;
    return state.incidents.filter(item => dateWithinRange(item.timestamp, range) && (severity === 'all' || item.severity === severity) && (country === 'all' || item.source.country === country || item.destination.country === country));
  }

  function buildReportPreview(report) {
    const items = report.items;
    const critical = items.filter(item => item.severity === 'critical').length;
    const blocked = items.filter(item => item.status === 'blocked').length;
    const topTypes = countBy(items, item => item.attackType).slice(0,5);
    const topCountries = countBy(items, item => item.destination.country).slice(0,5);
    return `<div class="report-document"><header><div><span class="report-badge">MOKLET CYBERWATCH · SIMULATED DATA</span><h2>${escapeHtml(report.title)}</h2><small>Generated ${new Date(report.generatedAt).toLocaleString('id-ID')}</small></div><div class="report-badge">${report.type.toUpperCase()}</div></header><div class="report-summary"><div><small>EVENTS</small><strong>${items.length}</strong></div><div><small>CRITICAL</small><strong>${critical}</strong></div><div><small>BLOCKED</small><strong>${blocked}</strong></div><div><small>COUNTRIES</small><strong>${new Set(items.flatMap(item => [item.source.country,item.destination.country])).size}</strong></div></div><h3>Executive summary</h3><p>Dalam rentang yang dipilih, dashboard mencatat ${items.length} event simulasi. ${critical} event memiliki severity critical dan ${blocked} event berstatus blocked. Data telah dianonimkan dan tidak menggambarkan serangan nyata.</p>${report.includeCharts ? `<h3>Top attack vectors</h3><table><thead><tr><th>Attack type</th><th>Events</th></tr></thead><tbody>${topTypes.map(([name,value]) => `<tr><td>${escapeHtml(name)}</td><td>${value}</td></tr>`).join('')}</tbody></table><h3>Top targeted countries</h3><table><thead><tr><th>Country</th><th>Events</th></tr></thead><tbody>${topCountries.map(([name,value]) => `<tr><td>${escapeHtml(name)}</td><td>${value}</td></tr>`).join('')}</tbody></table>` : ''}${report.includeTimeline ? `<h3>Recent incident timeline</h3><table><thead><tr><th>Time</th><th>ID</th><th>Route</th><th>Status</th></tr></thead><tbody>${items.slice(0,8).map(item => `<tr><td>${timeText(item.timestamp)}</td><td>${item.id}</td><td>${item.source.iso} → ${item.destination.iso}</td><td>${titleCase(item.status)}</td></tr>`).join('')}</tbody></table>` : ''}${report.includeRecommendations ? `<h3>Defensive recommendations</h3><ul><li>Prioritaskan validasi critical dan high severity.</li><li>Tinjau authentication, firewall, endpoint, dan proxy log yang relevan.</li><li>Terapkan containment proporsional dan dokumentasikan semua tindakan.</li><li>Uji backup, MFA, patching, dan playbook incident response secara berkala.</li></ul>` : ''}<p><b>Disclaimer:</b> Laporan ini dibuat dari data simulasi untuk demonstrasi dan pendidikan defensive security.</p></div><div class="report-actions"><button class="ghost-btn" id="downloadReportJson">Download JSON</button><button class="primary-btn" id="printReportBtn">Print / Save PDF</button></div>`;
  }

  function generateReport(event) {
    event?.preventDefault();
    const report = { id: `RPT-${Date.now()}`, title: $('#reportTitle').value.trim(), type: $('#reportType').value, range: $('#reportRange').value, severity: $('#reportSeverity').value, country: $('#reportCountry').value, includeCharts: $('#reportCharts').checked, includeTimeline: $('#reportTimeline').checked, includeRecommendations: $('#reportRecommendations').checked, generatedAt: new Date().toISOString(), dataMode: 'simulated', items: getReportData() };
    state.latestReport = report;
    state.reports.unshift({ id: report.id, title: report.title, type: report.type, generatedAt: report.generatedAt, count: report.items.length });
    saveReports();
    $('#reportPreview').innerHTML = buildReportPreview(report);
    $('#downloadReportJson').addEventListener('click', () => downloadText(`${report.id}.json`, JSON.stringify(report, null, 2)));
    $('#printReportBtn').addEventListener('click', () => window.print());
    renderReportHistory(); showToast('Report generated', `${report.title} prepared from ${report.items.length} simulated events.`);
  }

  function renderReportHistory() {
    $('#reportHistory').innerHTML = state.reports.length ? `<div class="report-history-list">${state.reports.map(report => `<article class="report-history-item"><div><strong>${escapeHtml(report.title)}</strong><small>${report.id} · ${titleCase(report.type)} · ${new Date(report.generatedAt).toLocaleString('id-ID')}</small></div><small>${report.count} events</small><button data-report-history="${report.id}">DETAIL</button></article>`).join('')}</div>` : '<div class="empty-state" style="min-height:180px"><strong>No reports yet</strong><p>Generated report metadata will be stored locally in this browser.</p></div>';
    $$('[data-report-history]', $('#reportHistory')).forEach(button => button.addEventListener('click', () => showToast('Report history', 'Metadata tersimpan lokal; generate ulang untuk melihat isi lengkap.')));
  }

  function downloadLatestReport() {
    if (!state.latestReport) { showToast('No report available', 'Generate a report first.'); return; }
    downloadText(`${state.latestReport.id}.json`, JSON.stringify(state.latestReport, null, 2));
  }

  function openSettingsDrawer() {
    $('#settingsDrawerBody').innerHTML = `<section class="settings-group"><h3>Performance</h3><div class="toggle-row"><div><strong>Animation</strong><small>Attack particles, scan line, and transitions.</small></div><label class="switch"><input id="settingAnimation" type="checkbox" ${state.settings.animationEnabled ? 'checked' : ''}><i></i></label></div><div class="toggle-row"><div><strong>Compact mode</strong><small>Reduce spacing on information-dense pages.</small></div><label class="switch"><input id="settingCompact" type="checkbox" ${state.settings.compactMode ? 'checked' : ''}><i></i></label></div><div class="toggle-row"><div><strong>Critical toasts</strong><small>Show notification for critical simulated event.</small></div><label class="switch"><input id="settingCriticalToast" type="checkbox" ${state.settings.criticalToasts ? 'checked' : ''}><i></i></label></div></section><section class="settings-group"><h3>Map rendering</h3><label style="display:grid;gap:8px;color:var(--muted);font:8px var(--mono)">Maximum active arcs <input id="settingMaxArcs" type="range" min="4" max="18" value="${state.maxActiveEvents}"><span class="settings-value" id="settingMaxArcsValue">${state.maxActiveEvents} arcs</span></label></section><section class="settings-group"><h3>Data & privacy</h3><div class="recommendation">This prototype stores education progress, bookmarks, notes, settings, and report history only in local browser storage. It does not send them to a server.</div></section><div class="drawer-actions"><button class="ghost-btn" id="resetLocalDataBtn">Reset local progress</button><button class="primary-btn" id="saveSettingsBtn">Save settings</button></div>`;
    openDrawer('settingsDrawer');
    $('#settingMaxArcs').addEventListener('input', event => $('#settingMaxArcsValue').textContent = `${event.target.value} arcs`);
    $('#saveSettingsBtn').addEventListener('click', () => { state.settings.animationEnabled = $('#settingAnimation').checked; state.settings.compactMode = $('#settingCompact').checked; state.settings.criticalToasts = $('#settingCriticalToast').checked; state.maxActiveEvents = Number($('#settingMaxArcs').value); saveSettings(); applySettings(); closeDrawer('settingsDrawer'); showToast('Settings saved', 'Dashboard preferences updated.'); });
    $('#resetLocalDataBtn').addEventListener('click', () => { ['moklet-intel-bookmarks','moklet-intel-notes','moklet-education-progress','moklet-report-history','moklet-dashboard-settings'].forEach(key => localStorage.removeItem(key)); state.intelBookmarks.clear(); state.intelNotes = {}; state.educationProgress = {}; state.reports = []; state.settings = { compactMode:false, animationEnabled:!reduceMotion, criticalToasts:true }; applySettings(); renderIntel(); renderEducation(); renderReportHistory(); showToast('Local data reset', 'Progress, notes, bookmarks, reports, and settings were cleared.'); });
  }

  function applySettings() {
    document.documentElement.classList.toggle('compact-ui', state.settings.compactMode);
    document.documentElement.classList.toggle('animations-off', !state.settings.animationEnabled);
    const mapSvg = $('#worldMap');
    if (!state.settings.animationEnabled) mapSvg?.pauseAnimations?.(); else if (!state.paused) mapSvg?.unpauseAnimations?.();
    while (state.activeEvents.length > state.maxActiveEvents) { const removed = state.activeEvents.pop(); removeMapEvent(removed.id); }
    $('#activeArcs').textContent = String(state.activeEvents.length);
  }

  function navigate(view) {
    $$('.view').forEach(panel => panel.classList.toggle('active', panel.dataset.viewPanel === view));
    $$('.nav-item').forEach(btn => btn.classList.toggle('active', btn.dataset.view === view));
    $('.main-nav')?.classList.remove('open');
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    if (view === 'incidents') renderIncidentTable();
    if (view === 'analytics') renderAnalyticsPage();
    if (view === 'intelligence') renderIntel();
    if (view === 'education') renderEducation();
    if (view === 'sources') renderSources();
    if (view === 'reports') renderReportHistory();
  }

  function openCommandPalette() {
    $('#commandOverlay').classList.add('open');
    $('#commandOverlay').setAttribute('aria-hidden', 'false');
    $('#commandInput').value = '';
    renderCommands('');
    setTimeout(() => $('#commandInput').focus(), 20);
  }
  function closeCommandPalette() {
    $('#commandOverlay').classList.remove('open');
    $('#commandOverlay').setAttribute('aria-hidden', 'true');
  }

  const commands = [
    { icon: '◎', title: 'Global Map', desc: 'Open immersive world threat map', type: 'PAGE', action: () => navigate('dashboard') },
    { icon: '∿', title: 'Threat Analytics', desc: 'Open complete telemetry analysis', type: 'PAGE', action: () => navigate('analytics') },
    { icon: '!', title: 'Critical Incidents', desc: 'Open incident console with critical filter', type: 'VIEW', action: () => { navigate('incidents'); setTimeout(() => { $('#severityFilter').value = 'critical'; state.incidentPage = 1; renderIncidentTable(); }, 20); } },
    { icon: 'TI', title: 'Threat Intelligence', desc: 'Open campaigns, advisories, and sanitized indicators', type: 'PAGE', action: () => navigate('intelligence') },
    { icon: 'EDU', title: 'Education Mode', desc: 'Open interactive cyber learning modules', type: 'PAGE', action: () => navigate('education') },
    { icon: 'SRC', title: 'Data Sources', desc: 'Inspect telemetry source health', type: 'PAGE', action: () => navigate('sources') },
    { icon: 'RPT', title: 'Reporting Center', desc: 'Build a defensive security report', type: 'PAGE', action: () => navigate('reports') },
    { icon: 'Ⅱ', title: 'Pause Live Stream', desc: 'Pause or resume simulated events', type: 'COMMAND', action: togglePause },
    { icon: '⚙', title: 'Dashboard Settings', desc: 'Performance and local data preferences', type: 'COMMAND', action: openSettingsDrawer },
    { icon: '↗', title: 'Toggle Fullscreen', desc: 'Expand command center', type: 'COMMAND', action: toggleFullscreen }
  ];

  function renderCommands(query) {
    const q = query.toLowerCase();
    const filtered = commands.filter(c => `${c.title} ${c.desc}`.toLowerCase().includes(q));
    $('#commandResults').innerHTML = filtered.map((c, i) => `<button class="command-item ${i === 0 ? 'active' : ''}" data-command="${commands.indexOf(c)}"><span>${c.icon}</span><span><strong>${c.title}</strong><small>${c.desc}</small></span><em>${c.type}</em></button>`).join('') || '<div style="padding:24px;color:var(--muted);font:9px var(--mono)">No matching command.</div>';
    $$('[data-command]').forEach(btn => btn.addEventListener('click', () => { commands[Number(btn.dataset.command)].action(); closeCommandPalette(); }));
  }

  function togglePause() {
    state.paused = !state.paused;
    $('#pauseBtn').classList.toggle('active', state.paused);
    $('#pauseBtn').setAttribute('aria-pressed', String(state.paused));
    $('#pauseBtn').innerHTML = state.paused ? '<span>▶</span> Resume' : '<span>Ⅱ</span> Pause';
    $$('.attack-arc').forEach(p => p.classList.toggle('paused', state.paused));
    const mapSvg = $('#worldMap');
    if (state.paused) mapSvg?.pauseAnimations?.();
    else if (state.settings.animationEnabled) mapSvg?.unpauseAnimations?.();
    showToast('Live stream', state.paused ? 'Simulation paused.' : 'Simulation resumed.');
  }

  async function toggleFullscreen() {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
      else await document.exitFullscreen();
    } catch { showToast('Fullscreen', 'Fullscreen is not available in this browser context.'); }
  }

  function showToast(title, message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<b>${escapeHtml(title)}</b><div style="margin-top:5px;color:var(--muted)">${escapeHtml(message)}</div>`;
    $('#toastRegion').appendChild(toast);
    setTimeout(() => toast.remove(), 3400);
  }

  function newLiveEvent() {
    if (state.paused) return;
    const event = createIncident(0);
    state.incidents.unshift(event);
    state.incidents = state.incidents.slice(0, 180);
    state.activeEvents.unshift(event);
    const removed = state.activeEvents.splice(state.maxActiveEvents);
    removed.forEach(oldEvent => removeMapEvent(oldEvent.id));
    addMapEvent(event);
    $('#activeArcs').textContent = String(state.activeEvents.length);

    // Only append the newest item. Existing feed nodes, scroll state, and map animations stay untouched.
    requestAnimationFrame(() => {
      prependFeedItem(event);
      updateMetrics();
      state.tickerDirty = true;
      if ($('#view-incidents').classList.contains('active')) renderIncidentTable();
    });

    $('#eventRate').textContent = `${rand(14, 29)} / min`;
    $('#latency').textContent = `${rand(31, 58)} ms`;
    $('#countryUpdated').textContent = 'now';
    const now = performance.now();
    if (state.settings.criticalToasts && event.severity === 'critical' && now - state.lastCriticalToast > 12000) {
      state.lastCriticalToast = now;
      showToast('Critical simulated event', `${event.attackType}: ${event.source.iso} → ${event.destination.iso}`);
    }
  }

  function resetGenerator() {
    clearInterval(state.generator);
    state.generator = setInterval(newLiveEvent, state.speed);
  }

  let mapTransformFrame = 0;
  function updateMapTransform() {
    if (mapTransformFrame) return;
    mapTransformFrame = requestAnimationFrame(() => {
      mapTransformFrame = 0;
      const { scale, x, y } = state.map;
      $('#mapViewport').style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
    });
  }

  function setupMapInteractions() {
    const stage = $('#worldStage');
    stage.addEventListener('wheel', ev => {
      ev.preventDefault();
      const delta = ev.deltaY < 0 ? .12 : -.12;
      state.map.scale = Math.max(.75, Math.min(3, state.map.scale + delta));
      updateMapTransform();
    }, { passive: false });
    stage.addEventListener('pointerdown', ev => {
      if (ev.target.classList.contains('country') || ev.target.classList.contains('attack-arc')) return;
      state.map.dragging = true;
      state.map.startX = ev.clientX; state.map.startY = ev.clientY;
      state.map.baseX = state.map.x; state.map.baseY = state.map.y;
      stage.classList.add('dragging');
      stage.setPointerCapture(ev.pointerId);
    });
    stage.addEventListener('pointermove', ev => {
      if (!state.map.dragging) return;
      state.map.x = state.map.baseX + (ev.clientX - state.map.startX);
      state.map.y = state.map.baseY + (ev.clientY - state.map.startY);
      updateMapTransform();
    });
    const endDrag = () => { state.map.dragging = false; stage.classList.remove('dragging'); };
    stage.addEventListener('pointerup', endDrag);
    stage.addEventListener('pointercancel', endDrag);
    $('#zoomIn').addEventListener('click', () => { state.map.scale = Math.min(3, state.map.scale + .2); updateMapTransform(); });
    $('#zoomOut').addEventListener('click', () => { state.map.scale = Math.max(.75, state.map.scale - .2); updateMapTransform(); });
    $('#resetMap').addEventListener('click', () => { state.map = { ...state.map, scale: 1, x: 0, y: 0 }; updateMapTransform(); });
    $('#toggleHeat').addEventListener('click', ev => { state.heatVisible = !state.heatVisible; ev.currentTarget.classList.toggle('active', state.heatVisible); $$('.heat-point').forEach(p => p.style.opacity = state.heatVisible ? '.8' : '0'); });
    $('#toggleArcs').addEventListener('click', ev => { state.arcsVisible = !state.arcsVisible; ev.currentTarget.classList.toggle('active', state.arcsVisible); $$('.attack-arc').forEach(p => p.style.opacity = state.arcsVisible ? '.86' : '0'); });
  }

  function exportCsv() {
    const headers = ['id','timestamp','severity','attackType','source','destination','sector','confidence','status','dataMode'];
    const rows = state.incidents.map(i => [i.id, i.timestamp.toISOString(), i.severity, i.attackType, i.source.iso, i.destination.iso, i.targetSector, i.confidence, i.status, i.dataMode]);
    const csv = [headers, ...rows].map(row => row.map(v => `"${String(v).replaceAll('"','""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'moklet-cyberwatch-simulated-incidents.csv'; a.click();
    URL.revokeObjectURL(url);
    showToast('Export complete', 'Simulated incidents exported as CSV.');
  }

  function bindUi() {
    $$('.nav-item, .nav-proxy').forEach(btn => btn.addEventListener('click', () => navigate(btn.dataset.view)));
    $('#mobileMenu').addEventListener('click', () => $('.main-nav').classList.toggle('open'));
    $('#pauseBtn').addEventListener('click', togglePause);
    $('#fullscreenBtn').addEventListener('click', toggleFullscreen);
    $('#notifyBtn').addEventListener('click', () => openDrawer('notificationDrawer'));
    $('#settingsBtn').addEventListener('click', openSettingsDrawer);
    $('#searchBtn').addEventListener('click', openCommandPalette);
    $$('[data-close]').forEach(btn => btn.addEventListener('click', () => closeDrawer(btn.dataset.close)));
    $('#modalCloseBtn').addEventListener('click', closeModal);
    $('#modalOverlay').addEventListener('click', event => { if (event.target === $('#modalOverlay')) closeModal(); });
    $$('.feed-filter button').forEach(btn => btn.addEventListener('click', () => {
      state.feedFilter = btn.dataset.feed;
      $$('.feed-filter button').forEach(b => b.classList.toggle('active', b === btn));
      renderFeed();
    }));
    $('#speedSelect').addEventListener('change', ev => { state.speed = Number(ev.target.value); resetGenerator(); showToast('Simulation speed', `Generator interval set to ${state.speed} ms.`); });
    $('#tickerPause').addEventListener('click', () => { state.tickerPaused = !state.tickerPaused; $('#tickerTrack').classList.toggle('paused', state.tickerPaused); $('#tickerPause').textContent = state.tickerPaused ? '▶' : 'Ⅱ'; });
    $('#detailsBtn').addEventListener('click', () => { navigate('analytics'); setTimeout(() => { $('#analyticsCountry').value = state.selectedCountry; renderAnalyticsPage(); }, 30); });
    $('#reportBtn').addEventListener('click', () => { navigate('reports'); setTimeout(() => { $('#reportCountry').value = state.selectedCountry; $('#reportType').value = 'country'; $('#reportTitle').value = `${state.selectedCountry} Threat Report`; }, 30); });
    $('#exportCsvBtn').addEventListener('click', exportCsv);
    $('#createIncidentBtn').addEventListener('click', openCreateIncidentModal);

    let incidentSearchTimer = 0;
    ['incidentSearch','severityFilter','statusFilter','incidentSort'].forEach(id => document.getElementById(id)?.addEventListener(id === 'incidentSearch' ? 'input' : 'change', () => {
      state.incidentPage = 1;
      if (id !== 'incidentSearch') return renderIncidentTable();
      clearTimeout(incidentSearchTimer); incidentSearchTimer = setTimeout(renderIncidentTable, 140);
    }));

    ['analyticsRange','analyticsCountry','analyticsSeverity','analyticsSector'].forEach(id => document.getElementById(id)?.addEventListener('change', renderAnalyticsPage));
    $('#analyticsResetBtn').addEventListener('click', () => { $('#analyticsRange').value = '24h'; $('#analyticsCountry').value = 'all'; $('#analyticsSeverity').value = 'all'; $('#analyticsSector').value = 'all'; renderAnalyticsPage(); });
    $('#analyticsExportBtn').addEventListener('click', exportAnalyticsSnapshot);

    let intelTimer = 0;
    $('#intelSearch').addEventListener('input', () => { clearTimeout(intelTimer); intelTimer = setTimeout(renderIntel, 130); });
    ['intelCategory','intelSeverity'].forEach(id => document.getElementById(id).addEventListener('change', renderIntel));
    $('#intelBookmarksBtn').addEventListener('click', () => { state.intelBookmarkOnly = !state.intelBookmarkOnly; renderIntel(); });
    $('#newIntelNoteBtn').addEventListener('click', openNewIntelNoteModal);

    $$('.education-tabs button').forEach(button => button.addEventListener('click', () => { state.educationFilter = button.dataset.eduFilter; $$('.education-tabs button').forEach(item => item.classList.toggle('active', item === button)); renderEducation(); }));
    $('#nextLogExampleBtn').addEventListener('click', () => { currentLogExample = (currentLogExample + 1) % safeLogExamples.length; renderSafeLogExample(); });
    $('#glossarySearch').addEventListener('input', renderGlossary);

    $('#refreshSourcesBtn').addEventListener('click', refreshSources);
    $('#reportForm').addEventListener('submit', generateReport);
    $('#downloadLatestReportBtn').addEventListener('click', downloadLatestReport);

    $('#commandInput').addEventListener('input', ev => renderCommands(ev.target.value));
    $('#commandOverlay').addEventListener('click', ev => { if (ev.target === $('#commandOverlay')) closeCommandPalette(); });
    document.addEventListener('keydown', ev => {
      if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === 'k') { ev.preventDefault(); openCommandPalette(); }
      if (ev.key === 'Escape') { closeCommandPalette(); closeModal(); ['notificationDrawer','incidentDrawer','intelligenceDrawer','educationDrawer','sourceDrawer','settingsDrawer'].forEach(closeDrawer); }
    });
    $$('.time-filter button').forEach(btn => btn.addEventListener('click', () => { $$('.time-filter button').forEach(b => b.classList.toggle('active', b === btn)); showToast('Time range', `Overview switched to ${btn.textContent}. Open Threat Analytics for full filtering.`); }));
  }

  function updateClock() {
    const now = new Date();
    $('#clock').textContent = `${timeText(now)} WIB`;
  }

  function init() {
    document.documentElement.classList.toggle('low-power', Boolean(lowPowerDevice));
    state.intelBookmarks = new Set(readJson('moklet-intel-bookmarks', []));
    state.intelNotes = readJson('moklet-intel-notes', {});
    state.educationProgress = readJson('moklet-education-progress', {});
    state.reports = readJson('moklet-report-history', []);
    state.settings = { ...state.settings, ...readJson('moklet-dashboard-settings', {}) };
    seedData();
    populateSelectOptions();
    addGridLines();
    ensureHeatGradients();
    bindCountries();
    renderMapEvents();
    renderFeed();
    renderTicker();
    renderMetrics();
    renderActivityChart();
    renderDonut();
    renderCountryRanking();
    renderSecurityScore();
    renderSoc();
    renderNotifications();
    renderAnalyticsPage();
    renderIntel();
    renderEducation();
    renderSources();
    renderReportHistory();
    setupMapInteractions();
    bindUi();
    applySettings();
    $('#tickerTrack')?.addEventListener('animationiteration', () => {
      if (!state.tickerDirty) return;
      renderTicker();
      state.tickerDirty = false;
    });
    updateClock();
    setInterval(updateClock, 1000);
    setInterval(renderTerminal, 6000);
    resetGenerator();
    setTimeout(() => showToast('Moklet Cyberwatch online', 'Complete simulated defensive telemetry workspace connected.'), 500);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
