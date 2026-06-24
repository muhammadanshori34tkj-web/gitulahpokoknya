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
    selectedIncident: null
  };

  const countryAliases = {
    'United States': 'United States of America', 'USA': 'United States of America', 'Russian Federation': 'Russia',
    'South Korea': 'South Korea', 'Korea': 'South Korea', 'Czechia': 'Czech Republic'
  };

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

  function renderIncidentTable() {
    const search = ($('#incidentSearch')?.value || '').trim().toLowerCase();
    const severity = $('#severityFilter')?.value || 'all';
    const status = $('#statusFilter')?.value || 'all';
    const filtered = state.incidents.filter(event => {
      const haystack = `${event.id} ${event.attackType} ${event.source.country} ${event.destination.country} ${event.targetSector}`.toLowerCase();
      return (!search || haystack.includes(search)) && (severity === 'all' || event.severity === severity) && (status === 'all' || event.status === status);
    });
    const rows = filtered.slice(0, 80);
    const body = $('#incidentTableBody');
    if (!body) return;
    body.innerHTML = rows.map(event => `
      <tr data-incident="${event.id}">
        <td class="incident-id">${event.id}</td><td>${timeText(event.timestamp)}</td><td><span class="severity ${event.severity}">${event.severity}</span></td>
        <td>${escapeHtml(event.attackType)}</td><td>${escapeHtml(event.source.iso)}</td><td>${escapeHtml(event.destination.iso)}</td><td>${escapeHtml(event.targetSector)}</td>
        <td><span class="confidence"><span>${event.confidence}%</span><i style="--w:${event.confidence}%"></i></span></td><td><span class="status-badge ${event.status}">${event.status}</span></td><td><button class="table-action" aria-label="Open ${event.id}">•••</button></td>
      </tr>`).join('');
    $('#incidentCountLabel').textContent = `${filtered.length} simulated incidents`;
    $$('tr[data-incident]', body).forEach(row => row.addEventListener('click', () => openIncidentDrawer(state.incidents.find(i => i.id === row.dataset.incident))));
  }

  function openIncidentDrawer(event) {
    if (!event) return;
    state.selectedIncident = event;
    $('#drawerIncidentId').textContent = event.id;
    $('#incidentDrawerBody').innerHTML = `
      <div class="incident-overview">
        <div><small>SEVERITY</small><strong style="color:${severityColor(event.severity)}">${event.severity.toUpperCase()}</strong></div>
        <div><small>STATUS</small><strong>${escapeHtml(event.status.toUpperCase())}</strong></div>
        <div><small>ATTACK TYPE</small><strong>${escapeHtml(event.attackType)}</strong></div>
        <div><small>CONFIDENCE</small><strong>${event.confidence}%</strong></div>
        <div><small>SOURCE</small><strong>${escapeHtml(event.source.city)} · ${escapeHtml(event.sourceIp)}</strong></div>
        <div><small>DESTINATION</small><strong>${escapeHtml(event.destination.city)} · ${escapeHtml(event.destinationIp)}</strong></div>
      </div>
      <section class="drawer-section"><h3>Detection timeline</h3><div class="timeline">
        <div class="timeline-item"><time>${timeText(event.timestamp)}</time><p>Telemetry event diterima dari ${escapeHtml(event.detectionSource)}.</p></div>
        <div class="timeline-item"><time>${timeText(new Date(event.timestamp.getTime() + 5000))}</time><p>Indicator dinormalisasi, dianonimkan, dan dipetakan ke ${escapeHtml(event.mitre)}.</p></div>
        <div class="timeline-item"><time>${timeText(new Date(event.timestamp.getTime() + 9000))}</time><p>Incident diberi status <b>${escapeHtml(event.status)}</b> dengan confidence ${event.confidence}%.</p></div>
      </div></section>
      <section class="drawer-section"><h3>Recommended defensive action</h3><div class="recommendation">Review firewall dan authentication logs, verifikasi aset yang terpengaruh, blokir traffic mencurigakan pada gateway, lalu simpan log untuk investigasi SOC. Data pada incident ini merupakan simulasi edukatif.</div></section>
      <section class="drawer-section"><h3>Analyst notes</h3><textarea aria-label="Analyst notes" style="width:100%;min-height:90px;border:1px solid var(--border);background:#080d11;color:#dce5ea;padding:10px;resize:vertical" placeholder="Tambahkan catatan investigasi defensif..."></textarea></section>
      <div class="drawer-actions"><button class="ghost-btn">Mark false positive</button><button class="primary-btn" id="resolveIncidentBtn">Resolve incident</button></div>`;
    $('#incidentDrawer').classList.add('open');
    $('#incidentDrawer').setAttribute('aria-hidden', 'false');
    $('#resolveIncidentBtn')?.addEventListener('click', () => {
      event.status = 'resolved';
      renderIncidentTable(); renderFeed();
      showToast('Incident updated', `${event.id} marked as resolved.`);
      closeDrawer('incidentDrawer');
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
      ['!', 'Critical incident simulated', 'A DDoS simulation reached the critical threshold.', '2 minutes ago', '#ff3040'],
      ['TI', 'Threat intelligence updated', 'Three emerging campaign summaries are available.', '11 minutes ago', '#00d9ff'],
      ['✓', 'Report generated', 'Daily threat summary is ready for preview.', '27 minutes ago', '#2de38a'],
      ['SYS', 'Feed latency restored', 'Demo stream latency returned below 50 ms.', '1 hour ago', '#ff9f1c']
    ];
    $('#notificationList').innerHTML = data.map(([icon, title, desc, time, color]) => `<article class="notification-item"><div class="notification-icon" style="color:${color}">${icon}</div><div><strong>${title}</strong><p>${desc}</p><time>${time}</time></div></article>`).join('');
  }

  function renderAnalyticsPage() {
    const panel = (title, eyebrow, body, cls = '') => `<article class="tactical-panel ${cls}"><div class="panel-title"><div><span class="eyebrow">${eyebrow}</span><h3>${title}</h3></div></div>${body}</article>`;
    const bars = (rows, gradient = true) => `<div class="mini-bars">${rows.map(([name, value, pct]) => `<div class="mini-bar-row"><span>${name}</span><span><i style="--w:${pct}%"></i></span><b>${value}</b></div>`).join('')}</div>`;
    const heat = `<div class="heat-grid">${Array.from({ length: 84 }, () => `<i class="heat-cell" style="--a:${(Math.random() * .65 + .04).toFixed(2)}"></i>`).join('')}</div>`;
    $('#analyticsPageGrid').innerHTML = [
      panel('Threat volume over time', '24-HOUR TIMELINE', `<svg id="analyticsActivity" class="chart" viewBox="0 0 900 280"></svg>`),
      panel('Severity distribution', 'RISK', bars([['Critical','8.4K',78],['High','21.7K',92],['Medium','34.2K',72],['Low','18.1K',51],['Info','5.0K',24]])),
      panel('Top attack vectors', 'CATEGORIES', bars([['DDoS','23.6K',100],['Malware','16.4K',72],['Phishing','13.1K',58],['Brute Force','10.4K',46],['Botnet','8.7K',38]])),
      panel('Targeted sectors', 'INDUSTRY', bars([['Education','18.2K',92],['Finance','15.7K',79],['Government','12.8K',65],['Cloud','10.4K',52],['Healthcare','8.9K',45]])),
      panel('Activity heatmap', 'DAY × HOUR', `${heat}<p style="color:var(--muted);font:8px var(--mono);margin-top:12px">Darker cells indicate higher simulated event density.</p>`)
    ].join('');
    const mainChart = $('#activityChart');
    const target = $('#analyticsActivity');
    if (mainChart && target) target.innerHTML = mainChart.innerHTML;
  }

  function renderIntel() {
    const data = [
      ['Emerging credential phishing campaign', 'Campaign', 'High', 'Southeast Asia', 92, '#ff9f1c'],
      ['Increased brute-force activity against education portals', 'Trend', 'Medium', 'Global', 86, '#00d9ff'],
      ['Demo malware beacon pattern observed', 'Indicator', 'Critical', 'Europe', 96, '#ff3040'],
      ['Cloud identity misconfiguration advisory', 'Advisory', 'High', 'Global', 89, '#ff2daa'],
      ['Botnet traffic simulation cluster', 'Malware family', 'Medium', 'Asia Pacific', 81, '#9b5cff'],
      ['Web application scanning trend', 'Technique', 'Low', 'North America', 74, '#2de38a']
    ];
    $('#intelGrid').innerHTML = data.map(([title, category, severity, region, confidence, color], index) => `
      <article class="intel-card" style="--accent:${color}"><header><span class="intel-tag">${category.toUpperCase()}</span><span class="severity ${severity.toLowerCase()}">${severity}</span></header><h3>${title}</h3><p>Ringkasan defensif berbasis dataset simulasi. Tidak memuat indikator aktif atau informasi sensitif.</p><div class="intel-meta"><div>CONFIDENCE<b>${confidence}%</b></div><div>REGION<b>${region}</b></div><div>FIRST SEEN<b>${index + 1}h ago</b></div><div>LAST SEEN<b>${index + 4}m ago</b></div></div><div class="card-footer"><button data-intel="${index}">OPEN DETAILS →</button><span>SIMULATED</span></div></article>`).join('');
    $$('[data-intel]').forEach(btn => btn.addEventListener('click', () => showToast('Intelligence preview', 'Detailed intelligence panel is prepared as a safe demo.')));
  }

  function renderEducation() {
    const modules = [
      ['01', 'Apa itu DDoS?', 'Pelajari cara mengenali lonjakan traffic dan respons defensif dasar.', 100, 'Completed'],
      ['02', 'Mengenali Phishing', 'Bedakan pesan asli dan manipulatif melalui indikator yang aman.', 82, 'In progress'],
      ['03', 'Dasar Incident Response', 'Alur identify, contain, preserve evidence, dan recover.', 64, 'In progress'],
      ['04', 'Membaca Security Log', 'Pahami timestamp, event ID, severity, source, dan destination.', 45, 'In progress'],
      ['05', 'Pengenalan MITRE ATT&CK', 'Gunakan taksonomi teknik untuk komunikasi analis yang konsisten.', 20, 'Started'],
      ['06', 'Quiz Defensive Security', 'Uji pemahaman melalui skenario SOC yang aman dan edukatif.', 0, 'Locked']
    ];
    $('#educationGrid').innerHTML = modules.map(([idx, title, desc, progress, status]) => `<article class="education-card" style="--accent:${progress === 100 ? '#2de38a' : '#e31e24'}"><span class="module-index">MODULE ${idx}</span><h3>${title}</h3><p>${desc}</p><div class="progress-line"><i style="--w:${progress}%"></i></div><div class="card-footer"><button class="education-open">${progress === 100 ? 'REVIEW' : progress === 0 ? 'UNLOCK LATER' : 'CONTINUE'} →</button><span>${progress}% · ${status}</span></div></article>`).join('');
    $$('.education-open').forEach(btn => btn.addEventListener('click', () => showToast('Education Mode', 'Module preview opened in safe learning mode.')));
  }

  function renderSources() {
    const data = [
      ['Demo Event Generator', 'Simulated Events', '2 seconds', 'Operational', 99, '#2de38a'],
      ['Educational Threat Dataset', 'Educational Dataset', '15 minutes', 'Operational', 96, '#00d9ff'],
      ['Moklet Sensor Sandbox', 'Internal Security Logs', '5 seconds', 'Operational', 98, '#e31e24'],
      ['Community Intelligence Demo', 'Community Intelligence', '30 minutes', 'Degraded', 81, '#ff9f1c'],
      ['Public Advisory Mirror', 'Public Threat Feeds', '1 hour', 'Operational', 93, '#9b5cff'],
      ['Map Rendering Service', 'Visualization', 'Real-time', 'Operational', 100, '#00d9ff']
    ];
    $('#sourcesGrid').innerHTML = data.map(([name, type, interval, status, score, color]) => `<article class="source-card" style="--accent:${color}"><header><span class="intel-tag">${type.toUpperCase()}</span><span class="source-health ${status === 'Degraded' ? 'degraded' : ''}"><i></i>${status}</span></header><h3>${name}</h3><p>Source configuration uses sanitized, anonymized, or generated data suitable for monitoring demonstrations.</p><div class="source-meta"><div>UPDATE INTERVAL<b>${interval}</b></div><div>RELIABILITY<b>${score}%</b></div><div>LAST SYNC<b>just now</b></div><div>DATA MODE<b>SIMULATED</b></div></div></article>`).join('');
  }

  function navigate(view) {
    $$('.view').forEach(panel => panel.classList.toggle('active', panel.dataset.viewPanel === view));
    $$('.nav-item').forEach(btn => btn.classList.toggle('active', btn.dataset.view === view));
    $('.main-nav')?.classList.remove('open');
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    if (view === 'incidents') renderIncidentTable();
    if (view === 'analytics') renderAnalyticsPage();
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
    { icon: '∿', title: 'Threat Analytics', desc: 'Open telemetry analysis', type: 'PAGE', action: () => navigate('analytics') },
    { icon: '!', title: 'Critical Incidents', desc: 'Open incident console with critical filter', type: 'VIEW', action: () => { navigate('incidents'); setTimeout(() => { $('#severityFilter').value = 'critical'; renderIncidentTable(); }, 20); } },
    { icon: 'Ⅱ', title: 'Pause Live Stream', desc: 'Pause or resume simulated events', type: 'COMMAND', action: togglePause },
    { icon: 'EDU', title: 'Education Mode', desc: 'Open cyber learning modules', type: 'PAGE', action: () => navigate('education') },
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
    else mapSvg?.unpauseAnimations?.();
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
    if (event.severity === 'critical' && now - state.lastCriticalToast > 12000) {
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
    $('#notifyBtn').addEventListener('click', () => { $('#notificationDrawer').classList.add('open'); $('#notificationDrawer').setAttribute('aria-hidden', 'false'); });
    $('#searchBtn').addEventListener('click', openCommandPalette);
    $$('[data-close]').forEach(btn => btn.addEventListener('click', () => closeDrawer(btn.dataset.close)));
    $$('.feed-filter button').forEach(btn => btn.addEventListener('click', () => {
      state.feedFilter = btn.dataset.feed;
      $$('.feed-filter button').forEach(b => b.classList.toggle('active', b === btn));
      renderFeed();
    }));
    $('#speedSelect').addEventListener('change', ev => { state.speed = Number(ev.target.value); resetGenerator(); showToast('Simulation speed', `Generator interval set to ${state.speed} ms.`); });
    $('#tickerPause').addEventListener('click', () => { state.tickerPaused = !state.tickerPaused; $('#tickerTrack').classList.toggle('paused', state.tickerPaused); $('#tickerPause').textContent = state.tickerPaused ? '▶' : 'Ⅱ'; });
    $('#detailsBtn').addEventListener('click', () => navigate('analytics'));
    $('#reportBtn').addEventListener('click', () => showToast('Report builder', `Country report preview prepared for ${state.selectedCountry}.`));
    $('#exportCsvBtn').addEventListener('click', exportCsv);
    let incidentSearchTimer = 0;
    ['incidentSearch','severityFilter','statusFilter'].forEach(id => document.getElementById(id)?.addEventListener(id === 'incidentSearch' ? 'input' : 'change', () => {
      if (id !== 'incidentSearch') return renderIncidentTable();
      clearTimeout(incidentSearchTimer);
      incidentSearchTimer = setTimeout(renderIncidentTable, 140);
    }));
    $('#commandInput').addEventListener('input', ev => renderCommands(ev.target.value));
    $('#commandOverlay').addEventListener('click', ev => { if (ev.target === $('#commandOverlay')) closeCommandPalette(); });
    document.addEventListener('keydown', ev => {
      if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === 'k') { ev.preventDefault(); openCommandPalette(); }
      if (ev.key === 'Escape') { closeCommandPalette(); closeDrawer('notificationDrawer'); closeDrawer('incidentDrawer'); }
    });
    $$('.time-filter button').forEach(btn => btn.addEventListener('click', () => { $$('.time-filter button').forEach(b => b.classList.toggle('active', b === btn)); showToast('Time range', `Dashboard updated to ${btn.textContent}.`); }));
  }

  function updateClock() {
    const now = new Date();
    $('#clock').textContent = `${timeText(now)} WIB`;
  }

  function init() {
    document.documentElement.classList.toggle('low-power', Boolean(lowPowerDevice));
    seedData();
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
    renderIntel();
    renderEducation();
    renderSources();
    setupMapInteractions();
    bindUi();
    $('#tickerTrack')?.addEventListener('animationiteration', () => {
      if (!state.tickerDirty) return;
      renderTicker();
      state.tickerDirty = false;
    });
    updateClock();
    setInterval(updateClock, 1000);
    setInterval(renderTerminal, 6000);
    resetGenerator();
    setTimeout(() => showToast('Moklet Cyberwatch online', 'Simulated defensive telemetry stream connected.'), 500);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
