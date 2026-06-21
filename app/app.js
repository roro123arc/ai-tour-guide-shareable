async function loadJson(path) {
  const res = await fetch(path);
  return res.json();
}

const queryParams = new URLSearchParams(window.location.search);
const copilotDemoMode = queryParams.get('demo') === 'copilot';

function bindIntroModal() {
  const modal = document.getElementById('introModal');
  const closeButtons = [document.getElementById('introStart'), document.getElementById('introPreview')];
  const closeModal = () => modal?.classList.add('hidden');

  closeButtons.forEach(button => button?.addEventListener('click', closeModal));
  modal?.addEventListener('click', event => {
    if (event.target === modal) closeModal();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeModal();
  });
}

function bindQrModal() {
  const modal = document.getElementById('qrModal');
  const openButton = document.getElementById('qrBadge');
  const closeButton = document.getElementById('qrClose');
  const openModal = () => modal?.classList.remove('hidden');
  const closeModal = () => modal?.classList.add('hidden');

  openButton?.addEventListener('click', openModal);
  closeButton?.addEventListener('click', closeModal);
  modal?.addEventListener('click', event => {
    if (event.target === modal) closeModal();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeModal();
  });
}

function normalise(text) {
  return (text || '').toLowerCase();
}

function collectTagsFromDescription(desc, taxonomy) {
  const text = normalise(desc);
  const tags = new Set();
  for (const [topic, mapped] of Object.entries(taxonomy)) {
    if (text.includes(topic.toLowerCase())) mapped.forEach(t => tags.add(t));
  }
  if (text.includes('kubernetes') || text.includes('aks') || text.includes('cloud-native')) {
    ['cloud-native', 'developer'].forEach(t => tags.add(t));
  }
  if (text.includes('copilot')) {
    ['github-copilot', 'copilot-productivity', 'ai-agents'].forEach(t => tags.add(t));
  }
  if (text.includes('fabric')) {
    ['fabric', 'data', 'analytics'].forEach(t => tags.add(t));
  }
  if (text.includes('security') || text.includes('soc')) {
    ['security', 'governance'].forEach(t => tags.add(t));
  }
  return Array.from(tags);
}

function scoreItems(items, tags, queryText = '') {
  const tagSet = new Set(tags);
  const queryTokens = normalise(queryText)
    .split(/[^a-z0-9+#.-]+/)
    .filter(token => token.length > 2);

  return items
    .map((item, index) => {
      const itemTags = item.interest_tags || [];
      const searchable = normalise([
        item.title,
        item.name,
        item.description,
        item.zone_id,
        item.session_type,
        item.hall,
        ...(item.topics || []),
        ...(item.audience || []),
        ...itemTags
      ].join(' '));
      const tagScore = itemTags.filter(tag => tagSet.has(tag)).length * 10;
      const textScore = queryTokens.filter(token => searchable.includes(token)).length;
      return { item, score: tagScore + textScore, index };
    })
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(x => x.item);
}

function pickZone(workshops, booths) {
  const zoneCounts = {};
  [...workshops, ...booths].forEach(x => {
    if (!x.zone_id) return;
    zoneCounts[x.zone_id] = (zoneCounts[x.zone_id] || 0) + 1;
  });
  const best = Object.entries(zoneCounts).sort((a,b)=>b[1]-a[1])[0];
  return best ? best[0] : 'expo';
}

function minutesFromTime(time) {
  if (!time) return null;
  const [hours, minutes] = String(time).split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes;
}

function formatMinutes(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function breakoutStart(agendaSummary) {
  const breakout = agendaSummary.find(item => item.id === 'breakouts');
  return minutesFromTime(breakout && breakout.time) || minutesFromTime('11:45');
}

function assignSchedule(items, type, agendaSummary) {
  const start = breakoutStart(agendaSummary);
  const slotMinutes = type === 'booth' ? 30 : 45;
  const slotOffsets = type === 'booth' ? [0, 45, 90, 135] : [0, 0, 55, 110];
  return items.map((item, index) => {
    const explicitStart = item.time || item.start || item.start_time;
    const explicitEnd = item.end || item.end_time;
    const startMinutes = minutesFromTime(explicitStart) || start + (slotOffsets[index] ?? index * slotMinutes);
    const endMinutes = minutesFromTime(explicitEnd) || startMinutes + slotMinutes;
    return {
      item,
      type,
      startMinutes,
      endMinutes,
      start: formatMinutes(startMinutes),
      end: formatMinutes(endMinutes)
    };
  });
}

function conflictsWith(a, b) {
  return a.startMinutes < b.endMinutes && b.startMinutes < a.endMinutes;
}

function buildIdealPath(workshops, booths, agendaSummary) {
  const scheduled = [
    ...assignSchedule(workshops, 'workshop', agendaSummary),
    ...assignSchedule(booths, 'booth', agendaSummary)
  ].sort((a, b) => a.startMinutes - b.startMinutes || (a.type === 'workshop' ? -1 : 1));

  const selected = [];
  const conflicts = [];
  for (const candidate of scheduled) {
    const conflict = selected.find(existing => conflictsWith(candidate, existing));
    if (conflict) {
      conflicts.push({ candidate, conflict });
      continue;
    }
    selected.push(candidate);
    if (selected.length === 4) break;
  }

  if (!selected.length && scheduled.length) selected.push(scheduled[0]);
  return { selected, conflicts, scheduled };
}

const venueLocations = {
  'registration': { area: 'Registration', floor: 'Ground floor', x: 22, y: 55 },
  'wrk-code-smarter': { area: 'Hall B · Developers Session', floor: 'Ground floor', x: 74, y: 84 },
  'wrk-vibe-coding': { area: 'Hall B · Developers Session', floor: 'Ground floor', x: 70, y: 88 },
  'wrk-copilot-studio': { area: 'Hall B · Developers Session', floor: 'Ground floor', x: 61, y: 88 },
  'wrk-trip-advisor': { area: 'Hall B · Developers Session', floor: 'Ground floor', x: 78, y: 88 },
  'wrk-genai-agent': { area: 'Hall C+D', floor: 'Ground floor', x: 63, y: 44 },
  'booth-fabric': { area: 'Hall C+D', floor: 'Ground floor', x: 58, y: 43 },
  'booth-powerbi': { area: 'Hall C+D', floor: 'Ground floor', x: 64, y: 49 },
  'booth-health-ai': { area: 'Hall C+D', floor: 'Ground floor', x: 61, y: 55 },
  'booth-better-together-security': { area: 'Hall C+D', floor: 'Ground floor', x: 52, y: 43 },
  'booth-security-for-ai': { area: 'Hall C+D', floor: 'Ground floor', x: 50, y: 50 },
  'booth-ai-for-security': { area: 'Hall C+D', floor: 'Ground floor', x: 55, y: 53 },
  'main-stage': { area: 'Hall C+D', floor: 'Ground floor', x: 58, y: 64 },
  'expo': { area: 'Hall C+D', floor: 'Ground floor', x: 62, y: 58 },
  'developer-zone': { area: 'Hall B · Developers Session', floor: 'Ground floor', x: 76, y: 82 },
  'security-zone': { area: 'Hall F,G,H · Security Session', floor: '1st floor', x: 35, y: 24 },
  'data-zone': { area: 'Hall C+D', floor: 'Ground floor', x: 64, y: 55 },
  'startup-session': { area: 'Hall K,L,M · Startup Session', floor: '1st floor', x: 75, y: 18 },
  'security-session': { area: 'Hall F,G,H · Security Session', floor: '1st floor', x: 35, y: 24 }
};

const walkingCost = {
  'registration': { 'expo': 6, 'developer-zone': 8, 'security-session': 12, 'startup-session': 12, 'data-zone': 7 },
  'expo': { 'registration': 6, 'developer-zone': 5, 'security-session': 10, 'startup-session': 10, 'data-zone': 2 },
  'developer-zone': { 'registration': 8, 'expo': 5, 'security-session': 11, 'startup-session': 11, 'data-zone': 6 },
  'security-session': { 'registration': 12, 'expo': 10, 'developer-zone': 11, 'startup-session': 5, 'data-zone': 10 },
  'startup-session': { 'registration': 12, 'expo': 10, 'developer-zone': 11, 'security-session': 5, 'data-zone': 10 },
  'data-zone': { 'registration': 7, 'expo': 2, 'developer-zone': 6, 'security-session': 10, 'startup-session': 10 }
};

function itemId(item) {
  return item.workshop_id || item.booth_id || item.zone_id || item.id;
}

function itemTitle(item) {
  return item.name || item.title || item.label || itemId(item);
}

function locationFor(item) {
  return venueLocations[itemId(item)] || venueLocations[item.zone_id] || venueLocations.expo;
}

function distanceFrom(currentLocationId, item) {
  const zoneId = item.zone_id || 'expo';
  return walkingCost[currentLocationId]?.[zoneId] ?? 9;
}

function matchesCatalogFilter(item, filters) {
  if (filters.sessionType && item.session_type !== filters.sessionType) return false;
  if (filters.topic && !(item.topics || []).includes(filters.topic)) return false;
  if (filters.audience && !(item.audience || []).includes(filters.audience)) return false;
  return true;
}

function renderEventMap(path, zoneId, zoneLabel) {
  const mapSection = document.getElementById('mapSection');
  const mapPins = document.getElementById('mapPins');
  const mapLegend = document.getElementById('mapLegend');
  const zoneLocation = venueLocations[zoneId] || venueLocations.expo;
  const entries = [
    {
      label: 'Start here',
      title: zoneLabel || zoneId,
      time: 'Start',
      location: zoneLocation
    },
    ...path.selected.map(entry => ({
      label: entry.type === 'booth' ? 'Demo booth' : 'Workshop',
      title: itemTitle(entry.item),
      time: `${entry.start}-${entry.end}`,
      location: locationFor(entry.item)
    }))
  ];

  mapPins.innerHTML = entries.map((entry, index) => `
    <button
      class="map-pin"
      type="button"
      style="left: ${entry.location.x}%; top: ${entry.location.y}%"
      title="${entry.label}: ${entry.title} · ${entry.location.area}"
      aria-label="${entry.label}: ${entry.title} at ${entry.location.area}"
    >${index + 1}</button>
  `).join('');

  mapLegend.innerHTML = entries.map((entry, index) => `
    <div class="map-legend-item">
      <span class="map-number">${index + 1}</span>
      <div>
        <strong>${entry.title}</strong>
        <span>${entry.label} · ${entry.time} · ${entry.location.area}</span>
      </div>
    </div>
  `).join('');

  mapSection.classList.remove('hidden');
}

const tagLabels = {
  'github-copilot': 'GitHub Copilot',
  'copilot-productivity': 'Copilot Productivity',
  'ai-agents': 'AI Agents',
  'cloud-native': 'Cloud Native',
  'developer': 'Developer',
  'security': 'Security',
  'governance': 'Governance',
  'data': 'Data',
  'analytics': 'Analytics',
  'fabric': 'Fabric',
  'power-bi': 'Power BI',
  'business-value': 'Business Value'
};

function tagClass(tag) {
  if (tag.includes('security') || tag.includes('governance')) return 'tag-security';
  if (tag.includes('data') || tag.includes('fabric') || tag.includes('power')) return 'tag-data';
  if (tag.includes('agent') || tag.includes('copilot')) return 'tag-ai';
  if (tag.includes('business')) return 'tag-business';
  return 'tag-dev';
}

function renderTags(tags = []) {
  return tags.slice(0, 4).map(tag => {
    const label = tagLabels[tag] || tag;
    return `<span class="tag-chip ${tagClass(tag)}">${label}</span>`;
  }).join('');
}

function explainRecommendation(item, type, tags = [], queryText = '') {
  const matchedTags = (item.interest_tags || []).filter(tag => tags.includes(tag));
  const location = locationFor(item);
  const reasons = [];
  if (matchedTags.length) {
    reasons.push(`matches ${matchedTags.slice(0, 2).map(tag => tagLabels[tag] || tag).join(' + ')}`);
  }
  if (item.session_type) reasons.push(item.session_type);
  if (item.audience?.length) reasons.push(`for ${item.audience.join(' / ')}`);
  if (location.area) reasons.push(location.area);
  if (queryText && normalise(queryText).split(/[^a-z0-9+#.-]+/).some(token => token.length > 2 && normalise(item.description).includes(token))) {
    reasons.unshift('matches your description');
  }
  return reasons.length ? `Why this: ${reasons.join(' · ')}.` : `Why this: relevant to your selected profile and event path.`;
}

function renderRecommendationItem(item, type, tags = [], queryText = '') {
  const title = type === 'booth' ? item.name : item.title;
  const explanation = copilotDemoMode
    ? `<span class="why-this">${explainRecommendation(item, type, tags, queryText)}</span>`
    : '';
  return `
    <li class="recommendation-item">
      <strong>${title}</strong>
      <span>${item.description}</span>
      ${explanation}
      <div class="tag-row">${renderTags(item.interest_tags)}</div>
    </li>
  `;
}

function renderTimelineItem(entry, status = 'selected') {
  const title = entry.type === 'booth' ? entry.item.name : entry.item.title;
  const label = entry.type === 'booth' ? 'Booth visit' : 'Workshop';
  const location = locationFor(entry.item);
  return `
    <div class="timeline-item ${status === 'conflict' ? 'timeline-conflict' : ''}">
      <div class="timeline-time">${entry.start}-${entry.end}</div>
      <div class="timeline-dot"></div>
      <div class="timeline-card">
        <span class="timeline-type">${label}</span>
        <strong>${title}</strong>
        <span class="timeline-location">${location.area}</span>
        <div class="tag-row">${renderTags(entry.item.interest_tags)}</div>
      </div>
    </div>
  `;
}

function renderMealWindow(agendaSummary) {
  const meal = agendaSummary.find(item => item.id === 'lunch' || item.type === 'service');
  if (!meal) return '';
  const time = meal.display_time || (meal.time_range ? meal.time_range.join('-') : meal.time || '');
  return `
    <div class="meal-card">
      <div class="meal-icon" aria-hidden="true">🍽️</div>
      <div>
        <strong>${meal.label}</strong>
        <span>${time} · Optional: drop in whenever you have a gap between sessions.</span>
      </div>
    </div>
  `;
}

function answerQuestion(q, eventMeta, agendaSummary, stations = []) {
  const text = normalise(q);
  const stationMatches = stations.filter(station => {
    const searchable = normalise([
      station.name,
      station.description,
      station.hall,
      station.station_type,
      ...(station.topics || []),
      ...(station.audience || []),
      ...(station.interest_tags || [])
    ].join(' '));
    return text.includes('station') || text.includes('booth')
      ? text.split(/[^a-z0-9+#.-]+/).filter(token => token.length > 2).some(token => searchable.includes(token))
      : searchable.includes(text);
  }).slice(0, 4);
  if ((text.includes('station') || text.includes('booth') || text.includes('hall')) && stationMatches.length) {
    return stationMatches
      .map(station => `${station.name}: ${station.description} (${station.hall})`)
      .join('\n');
  }
  if (text.includes('when') && text.includes('breakout')) {
    return `Breakout sessions begin at ${eventMeta.breakouts_start}.`;
  }
  if (text.includes('when') && (text.includes('start') || text.includes('open'))) {
    return `Doors open at ${eventMeta.opening_time}. Event opening begins at ${eventMeta.event_opening}, and the keynote starts at ${eventMeta.keynote_time}.`;
  }
  if (text.includes('where') && text.includes('event')) {
    return `The event takes place at ${eventMeta.venue} in ${eventMeta.city}.`;
  }
  if (text.includes('lunch')) {
    return `Lunch runs continuously from ${eventMeta.lunch_window.start} to ${eventMeta.lunch_window.end}.`;
  }
  return `I can currently answer basics like start time, breakouts, lunch, and venue. For detailed session rows, add them to sessions.json.`;
}

(async function init() {
  bindIntroModal();
  bindQrModal();

  const [eventMeta, agendaSummary, workshops, booths, stations, sampleProfiles, taxonomy, zones, catalogFilters] = await Promise.all([
    loadJson('../data/event_meta.json'),
    loadJson('../data/agenda_summary.json'),
    loadJson('../data/workshops.json'),
    loadJson('../data/booths.json'),
    loadJson('../data/stations.json'),
    loadJson('../data/sample_profiles.json'),
    loadJson('../data/interests_taxonomy.json'),
    loadJson('../data/zones.json'),
    loadJson('../data/catalog_filters.json')
  ]);

  const quickButtons = document.getElementById('quickButtons');
    const sampleProfilesEl = document.getElementById('sampleProfiles');
  const zoneResult = document.getElementById('zoneResult');
  const workshopResults = document.getElementById('workshopResults');
  const boothResults = document.getElementById('boothResults');
  const timelineSection = document.getElementById('timelineSection');
  const timelineResults = document.getElementById('timelineResults');
  const timelineNote = document.getElementById('timelineNote');
  const mealWindow = document.getElementById('mealWindow');
  const results = document.getElementById('results');
  const resultsEmpty = document.getElementById('resultsEmpty');
  const qaAnswer = document.getElementById('qaAnswer');
  const sessionTypeFilter = document.getElementById('sessionTypeFilter');
  const topicFilter = document.getElementById('topicFilter');
  const audienceFilter = document.getElementById('audienceFilter');
  const whereNowResult = document.getElementById('whereNowResult');
  let activeTags = [];
  let activeQueryText = '';

  if (copilotDemoMode) {
    document.getElementById('copilotDemoExtensions').classList.remove('hidden');
  }

  const quickDefs = [
    { id: 'developer', label: '👩‍💻 Developer' },
    { id: 'security', label: '🔐 Security' },
    { id: 'data', label: '📊 Data' },
    { id: 'ai-agents', label: '🤖 AI Agents' }
  ];

  function zoneName(zoneId) {
    const z = zones.find(x => x.zone_id === zoneId);
    return z ? z.name : zoneId;
  }

  function populateSelect(select, values, allLabel) {
    select.innerHTML = [`<option value="">${allLabel}</option>`, ...values.map(value => `<option value="${value}">${value}</option>`)].join('');
  }

  function currentFilters() {
    return {
      sessionType: sessionTypeFilter?.value || '',
      topic: topicFilter?.value || '',
      audience: audienceFilter?.value || ''
    };
  }

  function resetCatalogFilters() {
    if (sessionTypeFilter) sessionTypeFilter.value = '';
    if (topicFilter) topicFilter.value = '';
    if (audienceFilter) audienceFilter.value = '';
  }

  function filterItems(items, filters) {
    return items.filter(item => matchesCatalogFilter(item, filters));
  }

  function renderRecommendations(tags, queryText = '') {
    activeTags = tags;
    activeQueryText = queryText;
    const effectiveTags = tags.length ? tags : ['ai-agents', 'github-copilot', 'developer', 'business-value'];
    const filters = currentFilters();
    const filteredWorkshops = filterItems(workshops, filters);
    const filteredBooths = filterItems(booths, filters);
    const recommendedWorkshops = scoreItems(filteredWorkshops, effectiveTags, queryText).slice(0, 4);
    const recommendedBooths = scoreItems(filteredBooths, effectiveTags, queryText).slice(0, 4);
    const zoneId = pickZone(recommendedWorkshops, recommendedBooths);

    zoneResult.textContent = zoneName(zoneId);
    workshopResults.innerHTML = recommendedWorkshops.length
      ? recommendedWorkshops.map(w => renderRecommendationItem(w, 'workshop', effectiveTags, queryText)).join('')
      : '<li>No workshops match the current filters. Try resetting the catalog filters.</li>';
    boothResults.innerHTML = recommendedBooths.length
      ? recommendedBooths.map(b => renderRecommendationItem(b, 'booth', effectiveTags, queryText)).join('')
      : '<li>No demo booths match the current filters. Try a broader topic or audience.</li>';

    const path = buildIdealPath(recommendedWorkshops, recommendedBooths, agendaSummary);
    renderEventMap(path, zoneId, zoneName(zoneId));
    mealWindow.innerHTML = renderMealWindow(agendaSummary);
    mealWindow.classList.toggle('hidden', !mealWindow.innerHTML);
    timelineResults.innerHTML = path.selected.map(item => renderTimelineItem(item)).join('');
    if (path.conflicts.length) {
      timelineResults.innerHTML += path.conflicts.slice(0, 2).map(({ candidate, conflict }) => `
        <div class="conflict-callout">
          <strong>Time conflict:</strong>
          <strong>${candidate.type === 'booth' ? candidate.item.name : candidate.item.title}</strong>
          overlaps with
          <strong>${conflict.type === 'booth' ? conflict.item.name : conflict.item.title}</strong>
          at ${candidate.start}-${candidate.end}.
        </div>
      `).join('');
      timelineNote.textContent = 'I picked the clean path and marked overlapping options below.';
    } else {
      timelineNote.textContent = 'No time conflicts in this recommended path.';
    }
    timelineSection.classList.remove('hidden');

    results.classList.remove('hidden');
    resultsEmpty.classList.add('hidden');

    requestAnimationFrame(() => {
      document.getElementById('mapSection')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function recommendNextStop() {
    const currentLocation = document.getElementById('currentLocation').value;
    const timeAvailable = Number(document.getElementById('timeAvailable').value);
    const interest = document.getElementById('nextInterest').value;
    const tags = taxonomy[interest] || [];
    const filters = currentFilters();
    const candidates = [...filterItems(workshops, filters), ...filterItems(booths, filters)]
      .map(item => {
        const score = scoreItems([item], tags, interest)[0] ? 1 : 0;
        const walk = distanceFrom(currentLocation, item);
        const fit = walk + Math.min(item.duration_minutes || 15, 20) <= timeAvailable + 10;
        const tagHits = (item.interest_tags || []).filter(tag => tags.includes(tag)).length;
        return { item, walk, fit, rank: tagHits * 10 + (fit ? 4 : 0) - walk };
      })
      .sort((a, b) => b.rank - a.rank);
    const best = candidates[0];
    if (!best) {
      whereNowResult.innerHTML = '<strong>No matching stop yet.</strong><span>Try resetting filters or choosing another interest.</span>';
      return;
    }
    const location = locationFor(best.item);
    const title = itemTitle(best.item);
    whereNowResult.innerHTML = `
      <strong>${title}</strong>
      <span>${location.area} · about ${best.walk} min from your current location.</span>
      <p>${best.fit ? 'Fits your time window' : 'Slightly tight, but still the best match'} and aligns with ${tagLabels[tags[0]] || interest}.</p>
    `;
  }

  populateSelect(sessionTypeFilter, catalogFilters.session_types, 'All session types');
  populateSelect(topicFilter, catalogFilters.topics, 'All topics');
  populateSelect(audienceFilter, catalogFilters.audiences, 'All audiences');

  document.getElementById('applyFilters').addEventListener('click', () => {
    renderRecommendations(activeTags, activeQueryText);
  });

  document.getElementById('resetFilters').addEventListener('click', () => {
    resetCatalogFilters();
    renderRecommendations(activeTags, activeQueryText);
  });

  document.getElementById('whereNowButton').addEventListener('click', recommendNextStop);

  quickDefs.forEach(btn => {
    const el = document.createElement('button');
    el.textContent = btn.label;
    el.onclick = () => {
      resetCatalogFilters();
      renderRecommendations(taxonomy[btn.id] || [], btn.id);
    };
    quickButtons.appendChild(el);
  });

  sampleProfiles.forEach(profile => {
    const el = document.createElement('button');
    el.className = 'profile-button';
    el.innerHTML = `
      <span class="profile-avatar" aria-hidden="true">${profile.avatar || '🧭'}</span>
      <span>
        <span class="profile-label">${profile.label}</span>
        <span class="profile-desc">${profile.description}</span>
      </span>
    `;
    el.onclick = () => {
      resetCatalogFilters();
      renderRecommendations(profile.interest_tags || [], `${profile.title} ${profile.description}`);
    };
    sampleProfilesEl.appendChild(el);
  });

  document.getElementById('submitProfile').addEventListener('click', () => {
    resetCatalogFilters();
    const submitButton = document.getElementById('submitProfile');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Building recommendations...';
    }
    const title = document.getElementById('jobTitle').value;
    const company = document.getElementById('company').value;
    const description = document.getElementById('description').value;
    const queryText = `${title} ${company} ${description}`;
    let tags = collectTagsFromDescription(queryText, taxonomy);
    if (!tags.length && normalise(queryText).includes('csa')) {
      tags = ['ai-agents', 'github-copilot', 'developer', 'business-value'];
    }
    renderRecommendations(tags, queryText);
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Recommendations ready';
    }
  });

  ['jobTitle', 'company', 'description'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', () => {
      const submitButton = document.getElementById('submitProfile');
      if (!submitButton) return;
      submitButton.disabled = false;
      submitButton.textContent = 'Get recommendations';
    });
  });

  document.getElementById('askQuestion').addEventListener('click', () => {
    const q = document.getElementById('questionInput').value;
    qaAnswer.textContent = answerQuestion(q, eventMeta, agendaSummary, stations);
    qaAnswer.classList.remove('hidden');
  });
})();
