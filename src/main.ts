import { audiotool } from '@audiotool/nexus'

const VERSION = '0.8.1'
const CLIENT_ID = 'b3947602-ebae-4224-9d65-6b7bdbcc9da6'
const REDIRECT_URL = window.location.hostname === '127.0.0.1'
  ? 'http://127.0.0.1:5173/'
  : window.location.origin + window.location.pathname

// ─── Picker-Mapping ──────────────────────────────────────────────────
type PickerCell = { nexusIndex: number; cssNum: number; name: string }

const PICKER_CELLS: PickerCell[] = [
  // Reihe 1 — kräftig
  { cssNum: 1, nexusIndex: 6, name: "Strawberry" },
  { cssNum: 2, nexusIndex: 7, name: "Bonbon" },
  { cssNum: 11, nexusIndex: 4, name: "Electra" },
  { cssNum: 12, nexusIndex: 5, name: "Pink" },
  { cssNum: 4, nexusIndex: 9, name: "Sahara" },
  { cssNum: 5, nexusIndex: 10, name: "Lemon" },
  { cssNum: 6, nexusIndex: 11, name: "Sprout" },
  { cssNum: 7, nexusIndex: 0, name: "Rain" },
  { cssNum: 8, nexusIndex: 1, name: "Audiotool" },
  { cssNum: 9, nexusIndex: 2, name: "Cerulean" },
  { cssNum: 10, nexusIndex: 3, name: "Indigo" },
  { cssNum: 13, nexusIndex: 36, name: "Pink-Magenta" },
  { cssNum: 3, nexusIndex: 8, name: "Sun-Brown" },
  { cssNum: 14, nexusIndex: 39, name: "Ghost" },
  // Reihe 2 — desaturated
  { cssNum: 1, nexusIndex: 23, name: "Wood" },
  { cssNum: 2, nexusIndex: 12, name: "Sahara" },
  { cssNum: 11, nexusIndex: 21, name: "Mauve" },
  { cssNum: 12, nexusIndex: 22, name: "Blush" },
  { cssNum: 4, nexusIndex: 14, name: "Leaf" },
  { cssNum: 5, nexusIndex: 15, name: "Retro" },
  { cssNum: 6, nexusIndex: 16, name: "Eucalyptus" },
  { cssNum: 7, nexusIndex: 17, name: "Blue Vanilla" },
  { cssNum: 8, nexusIndex: 18, name: "Still" },
  { cssNum: 9, nexusIndex: 19, name: "Dream" },
  { cssNum: 10, nexusIndex: 20, name: "Mouse Gray" },
  { cssNum: 13, nexusIndex: 37, name: "Rosy Brown" },
  { cssNum: 3, nexusIndex: 13, name: "Beach" },
  { cssNum: 14, nexusIndex: 40, name: "Bright Gray" },
  // Reihe 3 — dark
  { cssNum: 1, nexusIndex: 30, name: "Crimson" },
  { cssNum: 2, nexusIndex: 31, name: "Zeitgeist" },
  { cssNum: 11, nexusIndex: 28, name: "Purple Haze" },
  { cssNum: 12, nexusIndex: 29, name: "Lipstick" },
  { cssNum: 4, nexusIndex: 33, name: "Circuit" },
  { cssNum: 5, nexusIndex: 34, name: "Vacuum" },
  { cssNum: 6, nexusIndex: 35, name: "Racing Green" },
  { cssNum: 7, nexusIndex: 24, name: "Reef" },
  { cssNum: 8, nexusIndex: 25, name: "Ocean" },
  { cssNum: 9, nexusIndex: 26, name: "Polar Night" },
  { cssNum: 10, nexusIndex: 27, name: "Plum" },
  { cssNum: 13, nexusIndex: 38, name: "Bistre" },
  { cssNum: 3, nexusIndex: 32, name: "Moussaka" },
  { cssNum: 14, nexusIndex: 41, name: "Dark Gray" },
]

const ALL_NEXUS_INDICES: number[] = PICKER_CELLS.map(c => c.nexusIndex)

const HEX_BY_CSS: Record<number, { main: string; sat: string; dark: string }> = {
  1:  { main: '#F1342A', sat: '#D37675', dark: '#962119' },
  2:  { main: '#FF9D42', sat: '#D8AC84', dark: '#9A612D' },
  3:  { main: '#B78761', sat: '#A48C7A', dark: '#67482F' },
  4:  { main: '#F9D75F', sat: '#E7D8B0', dark: '#A68F3E' },
  5:  { main: '#E4DF08', sat: '#8D9658', dark: '#535017' },
  6:  { main: '#83DD3F', sat: '#799A60', dark: '#497B22' },
  7:  { main: '#22A476', sat: '#6C9A89', dark: '#1F5841' },
  8:  { main: '#2BDBE2', sat: '#4B9DA0', dark: '#297A7D' },
  9:  { main: '#2B7FE3', sat: '#7C92B2', dark: '#274E87' },
  10: { main: '#8D80FA', sat: '#908AC4', dark: '#373EB8' },
  11: { main: '#923CF2', sat: '#A285BE', dark: '#682FA6' },
  12: { main: '#DA55F6', sat: '#B17FBB', dark: '#AE36C8' },
  13: { main: '#F45B7A', sat: '#C37C90', dark: '#961D3E' },
  14: { main: '#C6C5D3', sat: '#8E8EA8', dark: '#3E3E48' },
}

const HEX_BY_NEXUS: Map<number, string> = new Map()
for (let i = 0; i < PICKER_CELLS.length; i++) {
  const cell = PICKER_CELLS[i]
  const row = Math.floor(i / 14)
  const variant = row === 0 ? 'main' : row === 1 ? 'sat' : 'dark'
  HEX_BY_NEXUS.set(cell.nexusIndex, HEX_BY_CSS[cell.cssNum][variant])
}

function hexForNexusIndex(idx: number): string {
  return HEX_BY_NEXUS.get(idx) || '#c6c5d3'
}

function isLightColor(nexusIndex: number): boolean {
  const hex = hexForNexusIndex(nexusIndex)
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const lum = (r * 299 + g * 587 + b * 114) / 1000
  return lum > 150
}

const STAGEBOX_TARGETS = new Set([
  'mixerChannel', 'mixerMaster', 'mixerAux',
  'mixerDelayAux', 'mixerReverbAux', 'mixerGroup',
])

const SYNTHS = new Set(['pulverisateur','heisenberg','bassline','space','gakki','tonematrix'])
const DRUMS = new Set(['beatbox8','beatbox9','machiniste'])
const AUDIO_DEVICES = new Set(['audioDevice'])
const VST_DEVICES = new Set(['genericVst3PluginBeta','spitfireLabsVst3Plugin'])
const MIDI_DEVICES = new Set(['matrixArpeggiator','noteSplitter','tonematrix'])

// Anzeige-Namen pro Gruppe (was zur Gruppe gehört, statisch)
const GROUP_DEVICE_LIST: Record<GroupKey, string[]> = {
  synths: ['Pulverisateur', 'Heisenberg', 'Bassline', 'Space', 'Gakki', 'Tonematrix'],
  drums: ['Beatbox 8', 'Beatbox 9', 'Machiniste'],
  audio: ['Audio Track'],
  vst: ['VST Bridge', 'Spitfire LABS'],
}

type GroupKey = 'synths' | 'drums' | 'audio' | 'vst'

const GROUP_NAMES: Record<GroupKey, string> = {
  synths: 'Synths',
  drums: 'Drums',
  audio: 'Audio Dev.',
  vst: 'VST',
}
const GROUP_ORDER: GroupKey[] = ['synths', 'drums', 'audio', 'vst']

type SlotKey = 'main' | 'second' | 'third'
const SLOT_KEYS: SlotKey[] = ['main', 'second', 'third']
const SLOT_LABELS: Record<SlotKey, string> = {
  main: 'Main | Noteregion | Channels',
  second: 'FX Chain | Automation | Aux',
  third: 'Midi FX | Groups',
}

// ─── Presets: 3 Farben (main, second, third) — auf alle 4 Gruppen gleich ───
type Preset = { name: string; colors: [number, number, number] }
const PRESETS: Preset[] = [
  { name: 'Aubergine',     colors: [4, 24, 28] },    // Electra · Reef · Purple Haze
  { name: 'Greymode',      colors: [39, 40, 41] },   // Ghost · Bright Gray · Dark Gray
  { name: 'Beach',         colors: [1, 10, 2] },     // Audiotool · Lemon · Cerulean
  { name: 'Down to Earth', colors: [34, 38, 33] },   // Vacuum · Bistre · Circuit
  { name: 'Compliment',    colors: [7, 4, 11] },     // Bonbon · Electra · Sprout
  { name: 'Acid Bath',     colors: [39, 11, 10] },   // Ghost · Sprout · Lemon
]

function deviceGroup(type: string): GroupKey | null {
  if (DRUMS.has(type)) return 'drums'
  if (SYNTHS.has(type)) return 'synths'
  if (AUDIO_DEVICES.has(type)) return 'audio'
  if (VST_DEVICES.has(type)) return 'vst'
  return null
}

const ALL_DEVICE_TYPES = [
  ...SYNTHS, ...DRUMS, ...AUDIO_DEVICES, ...MIDI_DEVICES, ...VST_DEVICES,
  'kobolt','minimixer','crossfader','centroid',
  'graphicalEQ','waveshaper','autoFilter','ringModulator',
  'exciter','stereoEnhancer','curve','tinyGain',
  'panorama','bandSplitter','audioMerger','audioSplitter',
  'pulsar','quantum','gravity','helmholtz','quasar','rasselbock',
  'stompboxChorus','stompboxCompressor','stompboxCrusher',
  'stompboxDelay','stompboxFlanger','stompboxGate',
  'stompboxParametricEqualizer','stompboxPhaser','stompboxPitchDelay',
  'stompboxReverb','stompboxSlope','stompboxStereoDetune','stompboxTube',
]

let at: any
let lastNexus: any = null

type CableInfo = {
  id: string
  fromId: string | null
  fromType: string
  fromName: string
  fromOrder: number
  toId: string | null
  toType: string
  toName: string
  toOrder: number
  isNoteCable: boolean
  originalColor: number
}
type RegionInfo = {
  id: string
  regionType: string  // 'audioRegion' | 'noteRegion' | 'patternRegion' | 'automationRegion'
  ownerDeviceId: string | null
  trackId: string | null
  originalColor: number
  colorField: any  // direkter Verweis auf das colorIndex-Feld (verschachtelt in region.fields.colorIndex)
}
type MixerStripInfo = {
  id: string
  stripType: string  // 'mixerChannel' | 'mixerGroup' | 'mixerAux'
  sourceDeviceId: string | null  // via Cable getraced
  originalColor: number
  colorField: any  // displayParameters.fields.colorIndex
}
type DeviceInfo = { id: string; type: string; group: GroupKey | null }
type ProjectState = {
  cables: CableInfo[]
  cablesById: Map<string, any>
  regions: RegionInfo[]
  mixerStrips: MixerStripInfo[]
  devices: Map<string, DeviceInfo>
  trackToDevice: Map<string, string>
  counts: { drums: number; synths: number; audio: number; vst: number }
  typesByGroup: Record<GroupKey, Set<string>>
}

let state: ProjectState | null = null

type GroupColors = Record<SlotKey, number | null>
let groupColors: Record<GroupKey, GroupColors> = {
  synths: { main: null, second: null, third: null },
  drums: { main: null, second: null, third: null },
  audio: { main: null, second: null, third: null },
  vst: { main: null, second: null, third: null },
}

type OverrideMode = null | 'random' | 'favorites'
let overrideMode: OverrideMode = null
let overrideByCableId: Map<string, number> = new Map()
let overrideByRegionId: Map<string, number> = new Map()
let overrideByMixerStripId: Map<string, number> = new Map()

;(window as any).__colorizateur = () => ({
  overrideMode,
  overrideSize: overrideByCableId.size,
  regionOverrides: overrideByRegionId.size,
  stripOverrides: overrideByMixerStripId.size,
  cableCount: state?.cables.length ?? 0,
  regionCount: state?.regions.length ?? 0,
  stripCount: state?.mixerStrips.length ?? 0,
  groupColors,
  favorites,
})

const FAV_KEY = 'colorizateur_favorites'
type Favorites = [number | null, number | null, number | null]
function loadFavorites(): Favorites {
  try {
    const raw = localStorage.getItem(FAV_KEY)
    if (!raw) return [null, null, null]
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length === 3) return parsed as Favorites
  } catch {}
  return [null, null, null]
}
function saveFavorites(f: Favorites) {
  try { localStorage.setItem(FAV_KEY, JSON.stringify(f)) } catch {}
}
let favorites: Favorites = loadFavorites()

let pickerTarget: { group: GroupKey; slot: SlotKey } | null = null

let favEditSlot: number = 0
let favEditDraft: Favorites = [null, null, null]

function setStatus(text: string, kind: 'info' | 'ok' | 'error' | 'warning' = 'info') {
  const el = document.getElementById('status')
  const txt = document.getElementById('status-text')
  if (!el || !txt) return
  txt.textContent = text
  el.className = `status-line ${kind}`
}

function setButtonsEnabled(enabled: boolean) {
  for (const id of ['apply-btn','undo-btn','randomize-btn','favorites-btn','reset-btn']) {
    const b = document.getElementById(id) as HTMLButtonElement | null
    if (b) b.disabled = !enabled
  }
  // Preset-Buttons mit toggeln
  document.querySelectorAll<HTMLButtonElement>('.preset-btn').forEach(b => {
    b.disabled = !enabled
  })
}

function renderPresetButtons() {
  const row = document.getElementById('preset-row')
  if (!row) return
  const html: string[] = []
  for (let i = 0; i < PRESETS.length; i++) {
    const p = PRESETS[i]
    const bandsHtml = p.colors
      .map(c => `<div class="preset-band" style="background:${hexForNexusIndex(c)}"></div>`)
      .join('')
    html.push(`
      <button class="preset-btn" data-preset="${i}" disabled title="${p.name}">
        <div class="preset-bands">${bandsHtml}</div>
        <span class="preset-name">${p.name}</span>
      </button>
    `)
  }
  row.innerHTML = html.join('')
  row.querySelectorAll<HTMLButtonElement>('.preset-btn').forEach(b => {
    b.addEventListener('click', () => {
      const idx = parseInt(b.dataset.preset || '0', 10)
      applyPreset(idx)
    })
  })
}

function applyPreset(idx: number) {
  const preset = PRESETS[idx]
  if (!preset) return

  // Override-Mode aufheben falls aktiv
  if (overrideMode !== null) {
    overrideMode = null
    overrideByCableId.clear()
    overrideByRegionId.clear()
    overrideByMixerStripId.clear()
  }

  // Alle 4 Gruppen identisch füllen
  for (const g of GROUP_ORDER) {
    groupColors[g] = {
      main: preset.colors[0],
      second: preset.colors[1],
      third: preset.colors[2],
    }
  }

  renderStrips()
  setStatus(`preset "${preset.name}" loaded — press apply to write`, 'info')
}

function readDisplayInfo(entity: any): { name: string; order: number } {
  const direct = entity.fields?.displayName?.value
  if (typeof direct === 'string') {
    const ord = entity.fields?.orderAmongStrips?.value
    return { name: direct, order: typeof ord === 'number' ? ord : 0 }
  }
  const dp = entity.fields?.displayParameters
  if (dp?.fields) {
    const n = dp.fields.displayName?.value
    const o = dp.fields.orderAmongStrips?.value
    return {
      name: typeof n === 'string' ? n : '',
      order: typeof o === 'number' ? o : 0,
    }
  }
  return { name: '', order: 0 }
}

// Hilfsfunktion: rückwärts durch Kabel tracen bis Device mit bekannter Group gefunden
function traceFromDeviceForGroup(
  startId: string,
  devices: Map<string, DeviceInfo>,
  cables: CableInfo[]
): string | null {
  const visited = new Set<string>()
  const queue: string[] = [startId]
  while (queue.length > 0) {
    const cur = queue.shift()!
    if (visited.has(cur)) continue
    visited.add(cur)
    const dev = devices.get(cur)
    if (dev?.group) return cur
    for (const c of cables) {
      if (c.isNoteCable) continue
      if (c.toId === cur && c.fromId && !visited.has(c.fromId)) {
        queue.push(c.fromId)
      }
    }
  }
  return null
}

function readState(nexus: any): ProjectState {
  const qe = nexus.queryEntities

  const allDevices: any[] = []
  for (const type of ALL_DEVICE_TYPES) {
    for (const d of qe.ofTypes(type).get() as any[]) allDevices.push(d)
  }
  const audioCables = qe.ofTypes('desktopAudioCable').get() as any[]
  const noteCables = qe.ofTypes('desktopNoteCable').get() as any[]

  const mixerTargets: any[] = []
  for (const t of STAGEBOX_TARGETS) {
    for (const m of qe.ofTypes(t).get() as any[]) mixerTargets.push(m)
  }

  const devices = new Map<string, DeviceInfo>()
  for (const d of allDevices) {
    devices.set(d.id, {
      id: d.id,
      type: d.entityType,
      group: deviceGroup(d.entityType),
    })
  }

  const cablesById = new Map<string, any>()
  const cables: CableInfo[] = []

  const ingest = (cable: any, isNote: boolean) => {
    cablesById.set(cable.id, cable)
    const fromVal = cable.fields.fromSocket?.value
    const toVal = cable.fields.toSocket?.value
    const fromId = fromVal?.entityId || null
    const toId = toVal?.entityId || null
    cables.push({
      id: cable.id,
      fromId,
      fromType: fromVal?.entityType || '?',
      fromName: '',
      fromOrder: 0,
      toId,
      toType: toVal?.entityType || '?',
      toName: '',
      toOrder: 0,
      isNoteCable: isNote,
      originalColor: cable.fields.colorIndex?.value ?? 0,
    })
  }
  for (const c of audioCables) ingest(c, false)
  for (const c of noteCables) ingest(c, true)

  // ─── Regions lesen ─────────────────────────────────────────
  // Echte Entity-Typen aus dem Studio-Repo:
  //   audioRegion, noteRegion, patternRegion, automationRegion
  // colorIndex liegt in der verschachtelten Submessage "region":
  //   entity.fields.region.fields.colorIndex
  const regions: RegionInfo[] = []
  const trackToDevice = new Map<string, string>()

  const regionTypes = ['audioRegion', 'noteRegion', 'patternRegion', 'automationRegion']

  for (const regionType of regionTypes) {
    let entities: any[] = []
    try {
      entities = qe.ofTypes(regionType).get() as any[]
    } catch (e) {
      continue
    }

    for (const ent of entities) {
      // colorIndex liegt verschachtelt: ent.fields.region.fields.colorIndex
      const subRegion = ent.fields?.region
      const colorField = subRegion?.fields?.colorIndex
      if (!colorField) continue

      const trackRef = ent.fields?.track?.value
      const trackId = trackRef?.entityId || null

      regions.push({
        id: ent.id,
        regionType,
        ownerDeviceId: null,
        trackId,
        originalColor: colorField.value ?? 0,
        colorField,
      })
    }
  }

  // Track → Device Mapping
  // noteTrack/audioTrack/patternTrack: Field heißt "player"
  // automationTrack: Field heißt "automatedParameter"
  const playerTrackTypes = ['noteTrack', 'audioTrack', 'patternTrack']
  for (const trackType of playerTrackTypes) {
    try {
      const tracks = qe.ofTypes(trackType).get() as any[]
      for (const track of tracks) {
        const playerRef = track.fields?.player?.value
        if (playerRef?.entityId) {
          trackToDevice.set(track.id, playerRef.entityId)
        }
      }
    } catch {}
  }
  try {
    const automationTracks = qe.ofTypes('automationTrack').get() as any[]
    for (const track of automationTracks) {
      const paramRef = track.fields?.automatedParameter?.value
      if (paramRef?.entityId) {
        trackToDevice.set(track.id, paramRef.entityId)
      }
    }
  } catch {}

  // Owner-Device für Regions auflösen
  for (const r of regions) {
    if (r.trackId) {
      const devId = trackToDevice.get(r.trackId)
      if (devId) r.ownerDeviceId = devId
    }
  }

  // ─── Mixer-Strips lesen ────────────────────────────────────
  // mixerChannel/mixerGroup/mixerAux haben displayParameters.fields.colorIndex
  // mixerMaster/mixerDelayAux/mixerReverbAux: lassen wir aus (kein eindeutiger Source)
  const mixerStrips: MixerStripInfo[] = []
  const mixerStripTypes = ['mixerChannel', 'mixerGroup', 'mixerAux']
  for (const stripType of mixerStripTypes) {
    let entities: any[] = []
    try {
      entities = qe.ofTypes(stripType).get() as any[]
    } catch {
      continue
    }
    for (const ent of entities) {
      const colorField = ent.fields?.displayParameters?.fields?.colorIndex
      if (!colorField) continue

      // Source tracen via Cables: welche Devices verkabeln in diesen Strip?
      let sourceDeviceId: string | null = null
      for (const c of cables) {
        if (c.isNoteCable) continue
        if (c.toId === ent.id && c.fromId) {
          const fromDev = devices.get(c.fromId)
          if (fromDev?.group) {
            sourceDeviceId = c.fromId
            break
          }
          // Fallback: irgendein Device
          if (!sourceDeviceId) sourceDeviceId = c.fromId
        }
      }
      // Falls direkter Source kein bekanntes Device → tiefer tracen
      if (sourceDeviceId && !devices.get(sourceDeviceId)?.group) {
        // schau weiter rückwärts (FX-Kette)
        const traced = traceFromDeviceForGroup(sourceDeviceId, devices, cables)
        if (traced) sourceDeviceId = traced
      }

      mixerStrips.push({
        id: ent.id,
        stripType,
        sourceDeviceId,
        originalColor: colorField.value ?? 0,
        colorField,
      })
    }
  }

  const counts = { drums: 0, synths: 0, audio: 0, vst: 0 }
  const typesByGroup: Record<GroupKey, Set<string>> = {
    synths: new Set(),
    drums: new Set(),
    audio: new Set(),
    vst: new Set(),
  }
  for (const d of devices.values()) {
    if (d.group === 'drums') { counts.drums++; typesByGroup.drums.add(d.type) }
    else if (d.group === 'synths') { counts.synths++; typesByGroup.synths.add(d.type) }
    else if (d.group === 'audio') { counts.audio++; typesByGroup.audio.add(d.type) }
    else if (d.group === 'vst') { counts.vst++; typesByGroup.vst.add(d.type) }
  }

  return { cables, cablesById, regions, mixerStrips, devices, trackToDevice, counts, typesByGroup }
}

function targetColorForCable(cable: CableInfo): number | null {
  if (!state) return null

  if (overrideMode !== null) {
    const o = overrideByCableId.get(cable.id)
    return o ?? null
  }

  const fromDev = cable.fromId ? state.devices.get(cable.fromId) : null
  const toDev = cable.toId ? state.devices.get(cable.toId) : null

  if (cable.isNoteCable) {
    if (toDev?.group) {
      return groupColors[toDev.group].third
    }
    return null
  }

  if (fromDev?.group) {
    return groupColors[fromDev.group].main
  }

  const sourceGroup = traceSourceGroup(cable.fromId)
  if (sourceGroup) {
    return groupColors[sourceGroup].second
  }
  return null
}

function targetColorForRegion(region: RegionInfo): number | null {
  if (!state) return null

  if (overrideMode !== null) {
    const o = overrideByRegionId.get(region.id)
    return o ?? null
  }

  if (region.ownerDeviceId) {
    const dev = state.devices.get(region.ownerDeviceId)
    if (dev?.group) {
      // automationRegion → second-Slot ("FX Chain | Automation")
      // alle anderen (audio/note/pattern) → main-Slot
      const slot: SlotKey = region.regionType === 'automationRegion' ? 'second' : 'main'
      return groupColors[dev.group][slot]
    }
  }
  return null
}

function targetColorForMixerStrip(strip: MixerStripInfo): number | null {
  if (!state) return null

  if (overrideMode !== null) {
    const o = overrideByMixerStripId.get(strip.id)
    return o ?? null
  }

  if (!strip.sourceDeviceId) return null
  const dev = state.devices.get(strip.sourceDeviceId)
  if (!dev?.group) return null

  // mixerChannel → main, mixerAux → second, mixerGroup → third
  let slot: SlotKey
  if (strip.stripType === 'mixerGroup') slot = 'third'
  else if (strip.stripType === 'mixerAux') slot = 'second'
  else slot = 'main'

  return groupColors[dev.group][slot]
}

function traceSourceGroup(deviceId: string | null): GroupKey | null {
  if (!state || !deviceId) return null
  const visited = new Set<string>()
  const queue: string[] = [deviceId]
  while (queue.length > 0) {
    const cur = queue.shift()!
    if (visited.has(cur)) continue
    visited.add(cur)
    const dev = state.devices.get(cur)
    if (dev?.group) return dev.group
    for (const c of state.cables) {
      if (c.isNoteCable) continue
      if (c.toId === cur && c.fromId && !visited.has(c.fromId)) {
        queue.push(c.fromId)
      }
    }
  }
  return null
}

function renderStrips() {
  const container = document.getElementById('strips')!
  const html: string[] = []

  for (const g of GROUP_ORDER) {
    const colors = groupColors[g]
    const count = state?.counts[g] ?? 0
    const disabled = state !== null && count === 0

    const bandHtml = SLOT_KEYS.map(slot => {
      const c = colors[slot]
      const filled = c !== null
      const emptyCls = filled ? '' : ' empty'
      const bg = filled ? hexForNexusIndex(c!) : 'transparent'
      const labelCls = filled && isLightColor(c!) ? ' dark-text' : ''
      const label = SLOT_LABELS[slot]
      const styleAttr = filled ? `style="background:${bg}"` : ''
      return `
        <div class="strip-band${emptyCls}" data-group="${g}" data-slot="${slot}" ${styleAttr}>
          <span class="strip-band-label${labelCls}">${label}</span>
        </div>
      `
    }).join('')

    let meta: string
    if (state === null) meta = '&nbsp;'
    else if (count === 0) meta = '— no devices in project'
    else if (overrideMode === 'random') meta = `${count} device${count === 1 ? '' : 's'} · random override`
    else if (overrideMode === 'favorites') meta = `${count} device${count === 1 ? '' : 's'} · favorites override`
    else {
      const filled = SLOT_KEYS.filter(s => colors[s] !== null).length
      if (filled === 0) meta = `${count} device${count === 1 ? '' : 's'} · click slots to pick`
      else if (filled < 3) meta = `${count} device${count === 1 ? '' : 's'} · ${filled}/3 slots set`
      else meta = `${count} device${count === 1 ? '' : 's'} · ready`
    }

    // Device-Liste der Gruppe (statisch)
    const deviceListHtml = `<div class="strip-devicelist">${GROUP_DEVICE_LIST[g].join(' · ')}</div>`

    html.push(`
      <div class="strip ${disabled ? 'disabled' : ''}" data-group="${g}">
        <div class="strip-label">
          <div class="strip-name">${GROUP_NAMES[g]}</div>
          ${deviceListHtml}
          <div class="strip-meta">${meta}</div>
        </div>
        <div class="strip-bands">
          ${bandHtml}
        </div>
      </div>
    `)
  }

  container.innerHTML = html.join('')

  container.querySelectorAll<HTMLElement>('.strip:not(.disabled) .strip-band').forEach(el => {
    el.addEventListener('click', () => {
      const g = el.dataset.group as GroupKey
      const slot = el.dataset.slot as SlotKey
      if (overrideMode !== null) {
        overrideMode = null
        overrideByCableId.clear()
        overrideByRegionId.clear()
        overrideByMixerStripId.clear()
      }
      openPicker(g, slot)
    })
  })
}

function renderSummary() {
  // Count-Pills wurden entfernt — Strip-Meta in jeder Gruppe zeigt die Counts kontextuell
}

function openPicker(group: GroupKey, slot: SlotKey) {
  pickerTarget = { group, slot }
  document.getElementById('picker-title')!.textContent =
    `${GROUP_NAMES[group]} · ${SLOT_LABELS[slot]}`
  renderPickerGrid(groupColors[group][slot])
  document.getElementById('picker-overlay')!.classList.add('active')
}

function renderPickerGrid(selectedNexusIdx: number | null) {
  const grid = document.getElementById('picker-grid')!
  const html: string[] = []
  for (let pos = 0; pos < PICKER_CELLS.length; pos++) {
    const cell = PICKER_CELLS[pos]
    const sel = cell.nexusIndex === selectedNexusIdx ? ' selected' : ''
    html.push(`<div class="picker-cell${sel}" data-nexus="${cell.nexusIndex}" style="background:${hexForNexusIndex(cell.nexusIndex)}" title="${cell.name}"></div>`)
  }
  grid.innerHTML = html.join('')
  grid.querySelectorAll<HTMLElement>('.picker-cell').forEach(el => {
    el.addEventListener('click', () => {
      const nexus = parseInt(el.dataset.nexus || '0', 10)
      pickColor(nexus)
    })
  })
}

function pickColor(nexusIdx: number) {
  if (!pickerTarget) return
  groupColors[pickerTarget.group][pickerTarget.slot] = nexusIdx
  closePicker()
  renderStrips()
  setStatus('color set — press apply to write to project', 'info')
}

function closePicker() {
  pickerTarget = null
  document.getElementById('picker-overlay')!.classList.remove('active')
}

function applyFavorites() {
  if (!state) {
    setStatus('read a project first', 'warning')
    return
  }
  // Editor immer öffnen, mit vorhandenen Farben pre-filled
  openFavEditor()
}

// Wird aus dem Fav-Editor heraus gerufen, schreibt direkt
async function applyFavoritesNow() {
  if (!state || !lastNexus) return
  const validFavs = favEditDraft.filter(f => f !== null) as number[]
  if (validFavs.length === 0) return

  // Favoriten persistieren
  favorites = [...favEditDraft] as Favorites
  saveFavorites(favorites)

  // Override aufbauen
  overrideMode = 'favorites'
  overrideByCableId = new Map()
  overrideByRegionId = new Map()
  overrideByMixerStripId = new Map()
  for (const c of state.cables) {
    overrideByCableId.set(c.id, validFavs[Math.floor(Math.random() * validFavs.length)])
  }
  for (const r of state.regions) {
    overrideByRegionId.set(r.id, validFavs[Math.floor(Math.random() * validFavs.length)])
  }
  for (const s of state.mixerStrips) {
    overrideByMixerStripId.set(s.id, validFavs[Math.floor(Math.random() * validFavs.length)])
  }

  closeFavEditor()
  renderStrips()
  setStatus(`favorites applied — coloring ${state.cables.length} cables...`, 'info')
  await applyColors()
}

function openFavEditor() {
  favEditDraft = [...favorites] as Favorites
  const firstEmpty = favEditDraft.findIndex(f => f === null)
  favEditSlot = firstEmpty >= 0 ? firstEmpty : 0
  renderFavSlots()
  renderFavGrid()
  updateFavApplyBtn()
  document.getElementById('fav-overlay')!.classList.add('active')
}

function renderFavSlots() {
  const wrap = document.getElementById('fav-slots')!
  const labels = ['1', '2', '3']
  const html: string[] = []
  for (let i = 0; i < 3; i++) {
    const c = favEditDraft[i]
    const filled = c !== null
    const isActive = i === favEditSlot
    const bg = filled ? hexForNexusIndex(c!) : 'transparent'
    const dark = filled && isLightColor(c!)
    html.push(`
      <div class="fav-slot ${filled ? 'filled' : 'empty'} ${isActive ? 'active' : ''} ${dark ? 'dark-text' : ''}"
           data-slot="${i}" style="background:${bg}">
        <span class="fav-slot-tag">${labels[i]}</span>
      </div>
    `)
  }
  wrap.innerHTML = html.join('')
  wrap.querySelectorAll<HTMLElement>('.fav-slot').forEach(el => {
    el.addEventListener('click', () => {
      favEditSlot = parseInt(el.dataset.slot || '0', 10)
      renderFavSlots()
      renderFavGrid()
    })
  })
}

function renderFavGrid() {
  const grid = document.getElementById('fav-grid')!
  const selected = favEditDraft[favEditSlot]
  const html: string[] = []
  for (let pos = 0; pos < PICKER_CELLS.length; pos++) {
    const cell = PICKER_CELLS[pos]
    const sel = cell.nexusIndex === selected ? ' selected' : ''
    html.push(`<div class="picker-cell${sel}" data-nexus="${cell.nexusIndex}" style="background:${hexForNexusIndex(cell.nexusIndex)}" title="${cell.name}"></div>`)
  }
  grid.innerHTML = html.join('')
  grid.querySelectorAll<HTMLElement>('.picker-cell').forEach(el => {
    el.addEventListener('click', () => {
      const nexus = parseInt(el.dataset.nexus || '0', 10)
      favEditDraft[favEditSlot] = nexus
      const nextEmpty = favEditDraft.findIndex((f, i) => i > favEditSlot && f === null)
      if (nextEmpty >= 0) favEditSlot = nextEmpty
      renderFavSlots()
      renderFavGrid()
      updateFavApplyBtn()
    })
  })
}

function updateFavApplyBtn() {
  const btn = document.getElementById('fav-apply') as HTMLButtonElement
  btn.disabled = favEditDraft.some(f => f === null)
}

function clearFavDraft() {
  favEditDraft = [null, null, null]
  favEditSlot = 0
  renderFavSlots()
  renderFavGrid()
  updateFavApplyBtn()
}

function closeFavEditor() {
  document.getElementById('fav-overlay')!.classList.remove('active')
}

async function readProject(url: string) {
  if (!at) return
  try {
    setStatus('opening project...', 'info')
    const nexus = await at.open(url)
    await nexus.start()
    lastNexus = nexus
    ;(window as any).nexus = nexus

    setStatus('reading...', 'info')
    state = readState(nexus)
    ;(window as any).state = state

    const total = state.counts.drums + state.counts.synths + state.counts.audio + state.counts.vst
    if (total === 0) {
      setStatus('no sound sources found in project', 'warning')
      setButtonsEnabled(false)
      return
    }

    overrideMode = null
    overrideByCableId.clear()
    overrideByRegionId.clear()
    overrideByMixerStripId.clear()

    // Region-Typ-Aufschlüsselung im Console-Log
    const regionsByType: Record<string, number> = {}
    for (const r of state.regions) {
      regionsByType[r.regionType] = (regionsByType[r.regionType] || 0) + 1
    }
    console.log('[colorizateur] Regions found:', regionsByType, 'Total:', state.regions.length)

    const stripsByType: Record<string, number> = {}
    for (const s of state.mixerStrips) {
      stripsByType[s.stripType] = (stripsByType[s.stripType] || 0) + 1
    }
    console.log('[colorizateur] Mixer strips found:', stripsByType, 'Total:', state.mixerStrips.length)

    setStatus(`ready`, 'ok')
    renderSummary()
    renderStrips()
    setButtonsEnabled(true)
  } catch (e: any) {
    setStatus('failed: ' + e.message, 'error')
    console.error(e)
  }
}

async function applyColors() {
  if (!state || !lastNexus) return

  const cableChanges: Array<{ cableId: string; color: number }> = []
  const regionChanges: Array<{ colorField: any; color: number }> = []
  const stripChanges: Array<{ colorField: any; color: number }> = []

  for (const cable of state.cables) {
    const target = targetColorForCable(cable)
    if (target === null) continue
    if (target === cable.originalColor) continue
    cableChanges.push({ cableId: cable.id, color: target })
  }

  for (const region of state.regions) {
    const target = targetColorForRegion(region)
    if (target === null) continue
    if (target === region.originalColor) continue
    regionChanges.push({ colorField: region.colorField, color: target })
  }

  for (const strip of state.mixerStrips) {
    const target = targetColorForMixerStrip(strip)
    if (target === null) continue
    if (target === strip.originalColor) continue
    stripChanges.push({ colorField: strip.colorField, color: target })
  }

  const totalChanges = cableChanges.length + regionChanges.length + stripChanges.length
  if (totalChanges === 0) {
    setStatus('no changes to apply', 'info')
    return
  }

  try {
    setStatus(`writing ${cableChanges.length} cables + ${regionChanges.length} regions + ${stripChanges.length} strips...`, 'info')
    await lastNexus.modify((t: any) => {
      for (const ch of cableChanges) {
        const cable = state!.cablesById.get(ch.cableId)
        if (!cable || !cable.fields.colorIndex) continue
        t.update(cable.fields.colorIndex, ch.color)
      }
      for (const ch of regionChanges) {
        if (!ch.colorField) continue
        t.update(ch.colorField, ch.color)
      }
      for (const ch of stripChanges) {
        if (!ch.colorField) continue
        t.update(ch.colorField, ch.color)
      }
    })

    for (const cable of state.cables) {
      const target = targetColorForCable(cable)
      if (target !== null) cable.originalColor = target
    }
    for (const region of state.regions) {
      const target = targetColorForRegion(region)
      if (target !== null) region.originalColor = target
    }
    for (const strip of state.mixerStrips) {
      const target = targetColorForMixerStrip(strip)
      if (target !== null) strip.originalColor = target
    }

    await new Promise(r => setTimeout(r, 600))
    setStatus(`applied — ${cableChanges.length} cables, ${regionChanges.length} regions, ${stripChanges.length} strips`, 'ok')
  } catch (e: any) {
    setStatus('apply failed: ' + e.message, 'error')
    console.error(e)
  }
}

async function undoColors() {
  if (!state || !lastNexus) return
  try {
    setStatus('undoing...', 'info')
    await lastNexus.modify((t: any) => {
      for (const cable of state!.cables) {
        const raw = state!.cablesById.get(cable.id)
        if (!raw || !raw.fields.colorIndex) continue
        t.update(raw.fields.colorIndex, cable.originalColor)
      }
      for (const region of state!.regions) {
        if (!region.colorField) continue
        t.update(region.colorField, region.originalColor)
      }
      for (const strip of state!.mixerStrips) {
        if (!strip.colorField) continue
        t.update(strip.colorField, strip.originalColor)
      }
    })
    await new Promise(r => setTimeout(r, 400))
    setStatus('undone', 'ok')
  } catch (e: any) {
    setStatus('undo failed: ' + e.message, 'error')
    console.error(e)
  }
}

// Randomize: Slot-Machine-Animation + paralleler Schreibvorgang
// Randomize: Slot-Machine-Animation zieht 12 unique Farben, danach werden Cables/Regions/Strips
// nur aus diesem 12er-Pool zufällig befüllt — Tool & Studio sind dann ehrlich konsistent
async function randomizeColors() {
  if (!state || !lastNexus) {
    setStatus('read a project first', 'warning')
    return
  }
  overrideMode = 'random'
  overrideByCableId = new Map()
  overrideByRegionId = new Map()
  overrideByMixerStripId = new Map()

  setStatus(`randomizing — slot machine spinning...`, 'info')

  // Animation läuft und zieht 12 unique Farben in groupColors
  await animateRandomizeSlots()

  // 12er-Pool aus den finalen Slot-Farben sammeln
  const pool: number[] = []
  for (const g of GROUP_ORDER) {
    for (const slot of SLOT_KEYS) {
      const c = groupColors[g][slot]
      if (c !== null) pool.push(c)
    }
  }

  if (pool.length === 0) {
    setStatus('randomize: no slots filled', 'warning')
    return
  }

  // Alle Cables/Regions/Strips zufällig aus dem 12er-Pool zuweisen
  for (const c of state.cables) {
    overrideByCableId.set(c.id, pool[Math.floor(Math.random() * pool.length)])
  }
  for (const r of state.regions) {
    overrideByRegionId.set(r.id, pool[Math.floor(Math.random() * pool.length)])
  }
  for (const s of state.mixerStrips) {
    overrideByMixerStripId.set(s.id, pool[Math.floor(Math.random() * pool.length)])
  }

  setStatus(`writing ${state.cables.length} cables + ${state.regions.length} regions + ${state.mixerStrips.length} strips...`, 'info')
  await applyColors()
}

// Slot-Machine-Animation: alle Slots blinken, stoppen gestaffelt von oben links nach unten rechts
// Beim Stoppen wird aus einem schrumpfenden Pool gezogen, sodass die finalen 12 Slot-Farben unique sind
async function animateRandomizeSlots(): Promise<void> {
  if (!state) return

  // Welche Gruppen sind aktiv (haben Devices)?
  const activeGroups = GROUP_ORDER.filter(g => (state!.counts[g] ?? 0) > 0)
  if (activeGroups.length === 0) return

  // Alle Bänder sammeln, in Reihenfolge: Synths.main, Synths.second, Synths.third, Drums.main, ...
  const allBands: Array<{ el: HTMLElement; group: GroupKey; slot: SlotKey }> = []
  for (const g of activeGroups) {
    for (const slot of SLOT_KEYS) {
      const el = document.querySelector<HTMLElement>(
        `.strip[data-group="${g}"] .strip-band[data-slot="${slot}"]`
      )
      if (el) allBands.push({ el, group: g, slot })
    }
  }

  if (allBands.length === 0) return

  const BLINK_INTERVAL = 80   // ms zwischen Farb-Wechseln während Blinken
  const STAGGER_DELAY = 120   // ms zwischen den Stops einzelner Slots
  const MIN_BLINKS = 6        // jeder Slot blinkt mindestens so oft

  // Welche Slots blinken noch (true) bzw. stehen (false)?
  const stillBlinking = allBands.map(() => true)

  // Empty-Klasse für die Animations-Dauer entfernen, sonst überlagert das diagonal-Pattern
  const wasEmpty = allBands.map(b => b.el.classList.contains('empty'))
  for (let i = 0; i < allBands.length; i++) {
    if (wasEmpty[i]) {
      allBands[i].el.classList.remove('empty')
      allBands[i].el.style.background = '#000'
    }
  }

  // Blink-Loop — zeigt während des Spinnens alle 42 Farben
  const blinkTimer = setInterval(() => {
    for (let i = 0; i < allBands.length; i++) {
      if (!stillBlinking[i]) continue
      const randIdx = ALL_NEXUS_INDICES[Math.floor(Math.random() * ALL_NEXUS_INDICES.length)]
      allBands[i].el.style.background = hexForNexusIndex(randIdx)
    }
  }, BLINK_INTERVAL)

  // Mindest-Blink-Dauer warten, dann gestaffelt stoppen
  await new Promise(r => setTimeout(r, BLINK_INTERVAL * MIN_BLINKS))

  // Schrumpfender Pool — beginnt mit allen 42, jedes Stop entnimmt eine ohne Zurücklegen
  const availablePool = [...ALL_NEXUS_INDICES]

  for (let i = 0; i < allBands.length; i++) {
    if (availablePool.length === 0) break  // safety, sollte bei 42 vs max 12 nicht passieren
    const pickIdx = Math.floor(Math.random() * availablePool.length)
    const finalIdx = availablePool.splice(pickIdx, 1)[0]
    stillBlinking[i] = false
    allBands[i].el.style.background = hexForNexusIndex(finalIdx)
    // groupColors-State updaten, damit nach Re-Render die Snapshot-Farbe erhalten bleibt
    groupColors[allBands[i].group][allBands[i].slot] = finalIdx
    await new Promise(r => setTimeout(r, STAGGER_DELAY))
  }

  clearInterval(blinkTimer)
}

function resetColors() {
  groupColors = {
    synths: { main: null, second: null, third: null },
    drums: { main: null, second: null, third: null },
    audio: { main: null, second: null, third: null },
    vst: { main: null, second: null, third: null },
  }
  overrideMode = null
  overrideByCableId.clear()
  overrideByRegionId.clear()
  overrideByMixerStripId.clear()
  renderStrips()
  setStatus('reset', 'info')
}

async function main() {
  // 42-Farben-Streifen vertikal als Hintergrund hinter dem Tool
  const stripesHtml = PICKER_CELLS
    .map(cell => `<div class="color-stripe-cell" style="background:${hexForNexusIndex(cell.nexusIndex)}"></div>`)
    .join('')
  document.getElementById('color-stripes')!.innerHTML = stripesHtml

  // Preset-Buttons rendern
  renderPresetButtons()

  document.getElementById('login-section')!.style.display = 'block'

  at = await audiotool({
    clientId: CLIENT_ID,
    redirectUrl: REDIRECT_URL,
    scope: 'project:write',
  })
  ;(window as any).at = at

  document.getElementById('login-btn')!.addEventListener('click', () => at.login())

  if (at.status === 'unauthenticated') {
    const text = document.querySelector('#status-init span:last-child') as HTMLElement
    if (text) text.textContent = 'not connected — click login'
    return
  }

  document.getElementById('login-section')!.style.display = 'none'
  document.getElementById('main-panel')!.style.display = 'block'

  document.getElementById('read-btn')!.addEventListener('click', () => {
    const input = document.getElementById('project-url') as HTMLInputElement
    const url = input.value.trim()
    if (!url) { setStatus('paste a project url first', 'error'); return }
    readProject(url)
  })

  document.getElementById('apply-btn')!.addEventListener('click', applyColors)
  document.getElementById('undo-btn')!.addEventListener('click', undoColors)
  document.getElementById('randomize-btn')!.addEventListener('click', randomizeColors)
  document.getElementById('favorites-btn')!.addEventListener('click', applyFavorites)
  document.getElementById('reset-btn')!.addEventListener('click', resetColors)

  document.getElementById('picker-cancel')!.addEventListener('click', closePicker)
  document.getElementById('picker-overlay')!.addEventListener('click', e => {
    if ((e.target as HTMLElement).id === 'picker-overlay') closePicker()
  })

  document.getElementById('fav-cancel')!.addEventListener('click', closeFavEditor)
  document.getElementById('fav-clear')!.addEventListener('click', clearFavDraft)
  document.getElementById('fav-apply')!.addEventListener('click', applyFavoritesNow)
  document.getElementById('fav-overlay')!.addEventListener('click', e => {
    if ((e.target as HTMLElement).id === 'fav-overlay') closeFavEditor()
  })

  // Help-Modal
  const helpOverlay = document.getElementById('help-overlay')!
  document.getElementById('help-btn')!.addEventListener('click', () => {
    helpOverlay.classList.add('active')
  })
  document.getElementById('help-close')!.addEventListener('click', () => {
    helpOverlay.classList.remove('active')
  })
  helpOverlay.addEventListener('click', e => {
    if ((e.target as HTMLElement).id === 'help-overlay') helpOverlay.classList.remove('active')
  })

  setStatus('connected — paste a project url', 'ok')
  setButtonsEnabled(false)
  renderStrips()
}

main()