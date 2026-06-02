async function loadJson(path) {
  const res = await fetch(path);
  return res.json();
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

function itemId(item) {
  return item.workshop_id || item.booth_id || item.zone_id || item.id;
}

function itemTitle(item) {
  return item.name || item.title || item.label || itemId(item);
}

function locationFor(item) {
  return venueLocations[itemId(item)] || venueLocations[item.zone_id] || venueLocations.expo;
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

function renderRecommendationItem(item, type) {
  const title = type === 'booth' ? item.name : item.title;
  return `
    <li class="recommendation-item">
      <strong>${title}</strong>
      <span>${item.description}</span>
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

function answerQuestion(q, eventMeta, agendaSummary) {
  const text = normalise(q);
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
  const [eventMeta, agendaSummary, workshops, booths, sampleProfiles, taxonomy, zones] = await Promise.all([
    loadJson('../data/event_meta.json'),
    loadJson('../data/agenda_summary.json'),
    loadJson('../data/workshops.json'),
    loadJson('../data/booths.json'),
    loadJson('../data/sample_profiles.json'),
    loadJson('../data/interests_taxonomy.json'),
    loadJson('../data/zones.json')
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

  function renderRecommendations(tags, queryText = '') {
    const effectiveTags = tags.length ? tags : ['ai-agents', 'github-copilot', 'developer', 'business-value'];
    const recommendedWorkshops = scoreItems(workshops, effectiveTags, queryText).slice(0, 4);
    const recommendedBooths = scoreItems(booths, effectiveTags, queryText).slice(0, 4);
    const zoneId = pickZone(recommendedWorkshops, recommendedBooths);

    zoneResult.textContent = zoneName(zoneId);
    workshopResults.innerHTML = recommendedWorkshops.length
      ? recommendedWorkshops.map(w => renderRecommendationItem(w, 'workshop')).join('')
      : '<li>Add workshops to the catalog JSON to show recommendations here.</li>';
    boothResults.innerHTML = recommendedBooths.length
      ? recommendedBooths.map(b => renderRecommendationItem(b, 'booth')).join('')
      : '<li>Add booths to the catalog JSON to show recommendations here.</li>';

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
  }

  quickDefs.forEach(btn => {
    const el = document.createElement('button');
    el.textContent = btn.label;
    el.onclick = () => renderRecommendations(taxonomy[btn.id] || [], btn.id);
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
    el.onclick = () => renderRecommendations(profile.interest_tags || [], `${profile.title} ${profile.description}`);
    sampleProfilesEl.appendChild(el);
  });

  document.getElementById('submitProfile').addEventListener('click', () => {
    const title = document.getElementById('jobTitle').value;
    const company = document.getElementById('company').value;
    const description = document.getElementById('description').value;
    const queryText = `${title} ${company} ${description}`;
    let tags = collectTagsFromDescription(queryText, taxonomy);
    if (!tags.length && normalise(queryText).includes('csa')) {
      tags = ['ai-agents', 'github-copilot', 'developer', 'business-value'];
    }
    renderRecommendations(tags, queryText);
  });

  document.getElementById('askQuestion').addEventListener('click', () => {
    const q = document.getElementById('questionInput').value;
    qaAnswer.textContent = answerQuestion(q, eventMeta);
    qaAnswer.classList.remove('hidden');
  });
})();
