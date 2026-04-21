const exampleShip = {
  shipName: "Training Vessel",
  displacement: 8200,
  beam: 22,
  draft: 7.2,
  km: 8.7,
  kg: 7.6,
  tcg: 0,
  xg: 42,
  minGm: 0.5,
};

const exampleCargo = [
  { name: "Hold 1", weight: 420, kg: 4.2, xg: 26 },
  { name: "Hold 2", weight: 180, kg: 8.4, xg: 39 },
  { name: "Hold 3", weight: 55, kg: 11.8, xg: 58 },
];

const inputs = {
  languageSelect: document.getElementById("languageSelect"),
  profileName: document.getElementById("profileName"),
  profileSelect: document.getElementById("profileSelect"),
  shipName: document.getElementById("shipName"),
  displacement: document.getElementById("displacement"),
  beam: document.getElementById("beam"),
  draft: document.getElementById("draft"),
  km: document.getElementById("km"),
  kg: document.getElementById("kg"),
  tcg: document.getElementById("tcg"),
  xg: document.getElementById("xg"),
  minGm: document.getElementById("minGm"),
  weightAmount: document.getElementById("weightAmount"),
  loadType: document.getElementById("loadType"),
  kgFrom: document.getElementById("kgFrom"),
  kgTo: document.getElementById("kgTo"),
  tcgFrom: document.getElementById("tcgFrom"),
  tcgTo: document.getElementById("tcgTo"),
};

const outputs = {
  gmValue: document.getElementById("gmValue"),
  listValue: document.getElementById("listValue"),
  kgValue: document.getElementById("kgValue"),
  tcgValue: document.getElementById("tcgValue"),
  xgValue: document.getElementById("xgValue"),
  dispValue: document.getElementById("dispValue"),
  gzValue: document.getElementById("gzValue"),
  statusBadge: document.getElementById("statusBadge"),
  statusText: document.getElementById("statusText"),
  formulaText: document.getElementById("formulaText"),
  actionSummary: document.getElementById("actionSummary"),
  historyList: document.getElementById("historyList"),
  profileMessage: document.getElementById("profileMessage"),
};

const shipCanvas = document.getElementById("shipCanvas");
const curveCanvas = document.getElementById("curveCanvas");
const listCanvas = document.getElementById("listCanvas");
const trimCanvas = document.getElementById("trimCanvas");
const cargoList = document.getElementById("cargoList");
const shipCtx = shipCanvas.getContext("2d");
const curveCtx = curveCanvas.getContext("2d");
const listCtx = listCanvas.getContext("2d");
const trimCtx = trimCanvas.getContext("2d");
const actionButtons = Array.from(document.querySelectorAll("#actionMode button"));

const state = {
  language: "en",
  mode: "load",
  baseShip: { ...exampleShip },
  cargoItems: [],
  actionEntries: [],
  workingShip: { ...exampleShip },
  history: [],
  profiles: [],
};

const PROFILE_STORAGE_KEY = "ship-stability-lab-profiles";
const LANGUAGE_STORAGE_KEY = "ship-stability-lab-language";
const translations = {
  en: {
    heroEyebrow: "Interactive learning tool",
    languageLabel: "Language",
    heroTitle: "Ship Stability Lab",
    heroText: "Explore how loading, unloading, and shifting weight changes a ship's center of gravity, list, and initial stability.",
    heroCardLabel: "What this app teaches",
    heroList1: "How GM changes when weight moves vertically",
    heroList2: "How transverse transfers create heeling moments",
    heroList3: "How to test your own vessel data in a safe sandbox",
    heroNote: "Educational model using initial stability assumptions and small-angle approximations.",
    shipDataTitle: "1. Ship data",
    loadExample: "Load example ship",
    profileNameLabel: "Profile name",
    profileNamePlaceholder: "My training ship",
    savedProfilesLabel: "Saved profiles",
    saveProfile: "Save profile",
    loadProfile: "Load profile",
    deleteProfile: "Delete profile",
    profileMessageDefault: "Save a ship profile with its cargo holds so you can reload it later.",
    shipNameLabel: "Ship name",
    displacementLabel: "Displacement",
    beamLabel: "Beam",
    draftLabel: "Draft",
    minGmLabel: "Allowable minimum GM",
    cargoManifestTitle: "2. Cargo manifest",
    addCargoRow: "Add cargo row",
    manifestCopy: "Add multiple cargo items to build up a realistic condition for your own ship.",
    cargoHeader: "Cargo",
    cargoWeightHeader: "`t` tonnes",
    cargoKgHeader: "`Kg` meters from keel",
    cargoXgHeader: "`⊗g` meters from centre of gravity",
    weightActionTitle: "3. Weight action",
    resetChanges: "Reset changes",
    modeLoad: "Load or remove",
    modeTransfer: "Transfer weight",
    weightLabel: "Weight",
    actionLabel: "Action",
    addWeightOption: "Add weight",
    removeWeightOption: "Remove weight",
    applyAction: "Apply action",
    actionSummaryDefault: "Add, remove, or shift weight and see the ship react instantly.",
    stabilitySnapshotTitle: "4. Stability snapshot",
    visualLearningTitle: "5. Visual learning view",
    visualLearningNote: "Not to scale, but directionally useful.",
    listMetricLabel: "List",
    listIndicatorTitle: "6. Listing indicator",
    listIndicatorNote: "Dedicated view of list angle and direction.",
    trimIndicatorTitle: "7. Trim indicator",
    trimIndicatorNote: "Shows simplified trim aft and trim forward response.",
    stabilityCurveTitle: "8. Stability curve",
    stabilityCurveNote: "Small-angle teaching approximation: GZ = GM x sin(theta)",
    actionLogTitle: "9. Action log",
    clearLog: "Clear log",
    teachingTitle: "How to use it for teaching",
    teaching1Title: "Start with baseline stability",
    teaching1Body: "Set displacement, KM, and KG for the vessel. The app calculates initial GM and indicates whether the baseline condition is comfortable, marginal, or unstable.",
    teaching2Title: "Demonstrate weight transfer",
    teaching2Body: "Move weight upward to show how KG rises and GM falls. Move weight sideways to show the heeling moment and list angle.",
    teaching3Title: "Try your own ship",
    teaching3Body: "Enter your ship data and test deck cargo, ballast shifts, or off-center loading. Use the results as a learning aid, not as a replacement for approved stability documentation.",
    noSavedProfiles: "No saved profiles",
    selectProfile: "Select a profile",
    enterProfileName: "Enter a profile name before saving.",
    noProfileLoad: "Choose a saved profile to load.",
    noProfileDelete: "Choose a saved profile to delete.",
    profileNotFound: "That saved profile could not be found.",
    profileSaved: 'Saved profile "{name}".',
    profileLoaded: 'Loaded profile "{name}".',
    profileDeleted: 'Deleted profile "{name}".',
    storageUnavailable: "This browser session does not allow local profile storage.",
    currentPositive: "The current condition shows positive initial stability and a manageable list angle under the app's simplified assumptions.",
    currentMarginal: "The vessel still has positive GM, but either the metacentric height is below the target limit or the list angle is becoming noticeable.",
    currentUnstable: "GM is zero or negative. The center of gravity is at or above the metacenter, so this condition should be treated as unstable.",
    unstable: "Unstable",
    marginal: "Marginal",
    positive: "Positive",
    monitoring: "Monitoring",
    noHistory: "No weight actions yet. Try loading cargo high up, adding cargo rows, or shifting weight off center.",
    noCargoRows: "No cargo rows yet. Add cargo items to build up a loaded condition.",
    cargoNamePlaceholder: "Cargo name",
    remove: "Remove",
    addedWeight: "Added {weight} t at KG {kg} m and TCG {tcg} m.",
    removedWeight: "Removed {weight} t at KG {kg} m and TCG {tcg} m.",
    transferredWeight: "Transferred {weight} t from KG {kgFrom} m / TCG {tcgFrom} m to KG {kgTo} m / TCG {tcgTo} m.",
    enterPositiveWeight: "Enter a positive weight before applying the action.",
    invalidDisplacement: "This action would make displacement zero or negative, so it has not been applied.",
    exampleLoaded: "Example ship loaded. You can save it as a profile if you want to reuse it.",
    loadSummary: "Add or remove weight to see how displacement, KG, and TCG change.",
    transferSummary: "Move existing weight to a new position and observe the change in heel and GM.",
    formulaSummary: "GM = KM - KG = {km} - {kg} = {gm} m. Cargo hold rows now track KG and XG, while the teaching actions still update transverse loading for list. Approx. list angle uses atan(TCG / GM).",
    curveXAxis: "List angle (deg)",
    curveYAxis: "Approx. GZ (m)",
    listLabel: "List",
    trimLabel: "Trim",
    upright: "upright",
    port: "port",
    starboard: "starboard",
    aft: "aft",
    forward: "forward",
    listPort: "Port",
    listUpright: "Upright",
    listStarboard: "Starboard",
    trimAft: "Trim aft",
    trimEven: "Even keel",
    trimForward: "Trim forward",
    trimDeltaLabel: "XG delta"
  },
  is: {
    heroEyebrow: "Gagnvirkt kennslutool",
    languageLabel: "Tungumal",
    heroTitle: "Stodugleikastofa skips",
    heroText: "Sjaðu hvernig lestun, losun og tilfærsla þyngdar breytir þyngdarmiðju, halla og upphafsstodugleika skips.",
    heroCardLabel: "Þetta kennir appið",
    heroList1: "Hvernig GM breytist þegar þyngd fer upp eða niður",
    heroList2: "Hvernig tilfærsla til hliðar myndar hveljandi moment",
    heroList3: "Hvernig profa ma eigið skip i oruggu kennsluumhverfi",
    heroNote: "Einfaldað kennslulikan sem byggir a upphafsstodugleika og nalgun fyrir litil horn.",
    shipDataTitle: "1. Skipsgogn",
    loadExample: "Hlaða inn dæmaskipi",
    profileNameLabel: "Heiti profils",
    profileNamePlaceholder: "Mitt æfingaskip",
    savedProfilesLabel: "Vistuð profil",
    saveProfile: "Vista profil",
    loadProfile: "Hlaða profili",
    deleteProfile: "Eyða profili",
    profileMessageDefault: "Vistaðu skip og lestarhald saman svo hægt se að hlaða þvi aftur seinna.",
    shipNameLabel: "Heiti skips",
    displacementLabel: "Fraeðsla",
    beamLabel: "Breidd",
    draftLabel: "Rista",
    minGmLabel: "Laegsta leyfilega GM",
    cargoManifestTitle: "2. Farmskra",
    addCargoRow: "Baeta vid farmlinu",
    manifestCopy: "Baettu vid fleiri farmlinum til að byggja upp raunhaeft hleðsluastand fyrir skipið þitt.",
    cargoHeader: "Farmur",
    cargoWeightHeader: "`t` tonn",
    cargoKgHeader: "`Kg` metrar fra kil",
    cargoXgHeader: "`⊗g` metrar fra miðlínu",
    weightActionTitle: "3. Þyngdaraðgerð",
    resetChanges: "Endurstilla breytingar",
    modeLoad: "Lesta eða losa",
    modeTransfer: "Faera þyngd",
    weightLabel: "Þyngd",
    actionLabel: "Aðgerð",
    addWeightOption: "Bæta við þyngd",
    removeWeightOption: "Fjarlægja þyngd",
    applyAction: "Framkvæma",
    actionSummaryDefault: "Baettu við, fjarlægðu eða færðu þyngd og sjaðu skipið bregðast strax við.",
    stabilitySnapshotTitle: "4. Yfirlit stodugleika",
    visualLearningTitle: "5. Myndræn kennslusýn",
    visualLearningNote: "Ekki i kvarða, en nytsamlegt til að skyna stefnu breytinga.",
    listMetricLabel: "Listi",
    listIndicatorTitle: "6. Listamælir",
    listIndicatorNote: "Sérstök sýn a listahorni og stefnu.",
    trimIndicatorTitle: "7. Trimsmælir",
    trimIndicatorNote: "Sýnir einfaldaða svörun fyrir trim aft og trim forward.",
    stabilityCurveTitle: "8. Stodugleikakúrfa",
    stabilityCurveNote: "Einföld kennslunalgun fyrir litil horn: GZ = GM x sin(theta)",
    actionLogTitle: "9. Aðgerðaskra",
    clearLog: "Hreinsa skra",
    teachingTitle: "Hvernig ma nota þetta til kennslu",
    teaching1Title: "Byrjaðu a grunnstodugleika",
    teaching1Body: "Stilltu fraeðslu, KM og KG fyrir skipið. Appið reiknar upphaflegt GM og metur hvort astandið se gott, jaðrað eða ostodugt.",
    teaching2Title: "Syndu tilfærslu þyngdar",
    teaching2Body: "Faerðu þyngd upp til að syna hvernig KG hækkar og GM lækkar. Faerðu þyngd til hliðar til að syna halla og listahorn.",
    teaching3Title: "Profadu eigið skip",
    teaching3Body: "Sláðu inn gogn fyrir eigið skip og profaðu farm a þilfari, ballastfærslur eða osamhverfa hleðslu. Nota skal niðurstöður sem kennsluhjalp en ekki i stað samþykktra stodugleikagagna.",
    noSavedProfiles: "Engin vistud profil",
    selectProfile: "Veldu profil",
    enterProfileName: "Skráðu heiti profils áður en þú vistar.",
    noProfileLoad: "Veldu vistað profil til að hlaða inn.",
    noProfileDelete: "Veldu vistað profil til að eyða.",
    profileNotFound: "Ekki fannst þetta vistaða profil.",
    profileSaved: 'Profil "{name}" vistað.',
    profileLoaded: 'Profil "{name}" hlaðið inn.',
    profileDeleted: 'Profil "{name}" eytt.',
    storageUnavailable: "Þessi vafralota leyfir ekki staðbundna vistun profila.",
    currentPositive: "Nuna er upphafsstodugleiki jakvæður og listahornið viðraðanlegt innan einföldunar þessa apps.",
    currentMarginal: "Skipið hefur enn jakvætt GM, en annaðhvort er GM undir viðmiði eða hallinn orðin greinilegur.",
    currentUnstable: "GM er null eða neikvætt. Þyngdarmiðjan er i eða fyrir ofan metamiðju og þetta a að teljast ostodugt astand.",
    unstable: "Ostodugt",
    marginal: "Jaðrað",
    positive: "Jakvætt",
    monitoring: "Eftirlit",
    noHistory: "Engar aðgerðir enn. Profadu að lesta ofarlega, bæta við farmlinum eða færa þyngd til hliðar.",
    noCargoRows: "Engar farmlínur enn. Bættu við farmi til að byggja upp hleðsluastand.",
    cargoNamePlaceholder: "Heiti farms",
    remove: "Fjarlægja",
    addedWeight: "Bætti við {weight} t við KG {kg} m og TCG {tcg} m.",
    removedWeight: "Fjarlægði {weight} t við KG {kg} m og TCG {tcg} m.",
    transferredWeight: "Færði {weight} t fra KG {kgFrom} m / TCG {tcgFrom} m i KG {kgTo} m / TCG {tcgTo} m.",
    enterPositiveWeight: "Sláðu inn jakvæða þyngd áður en aðgerðin er framkvæmd.",
    invalidDisplacement: "Þessi aðgerð myndi gera fraeðsluna null eða neikvæða, svo hun var ekki framkvæmd.",
    exampleLoaded: "Dæmaskipi hefur verið hlaðið inn. Þu getur vistað það sem profil ef þu vilt nota það aftur.",
    loadSummary: "Baettu við eða fjarlægðu þyngd til að sja hvernig fraeðsla, KG og TCG breytast.",
    transferSummary: "Faerðu fyrirliggjandi þyngd og sjaðu hvernig halli og GM breytast.",
    formulaSummary: "GM = KM - KG = {km} - {kg} = {gm} m. Farmlínur fylgjast med KG og XG, en kennsluaðgerðirnar uppfaera enn þvera hleðslu fyrir lista. Nalgað listahorn notar atan(TCG / GM).",
    curveXAxis: "Listahorn (gráður)",
    curveYAxis: "Nalgað GZ (m)",
    listLabel: "Listi",
    trimLabel: "Trim",
    upright: "upprétt",
    port: "babord",
    starboard: "stjornbord",
    aft: "aftur",
    forward: "fram",
    listPort: "Babord",
    listUpright: "Upprétt",
    listStarboard: "Stjornbord",
    trimAft: "Trim aft",
    trimEven: "Jafn kjolur",
    trimForward: "Trim forward",
    trimDeltaLabel: "XG mismunur"
  }
};

function t(key, vars = {}) {
  const lang = translations[state.language] || translations.en;
  let text = lang[key] ?? translations.en[key] ?? key;
  Object.entries(vars).forEach(([name, value]) => {
    text = text.replaceAll(`{${name}}`, value);
  });
  return text;
}

function applyTranslations() {
  document.documentElement.lang = state.language === "is" ? "is" : "en";
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    node.setAttribute("placeholder", t(node.dataset.i18nPlaceholder));
  });
  document.title = t("heroTitle");
  renderProfileOptions();
  render();
}

function num(value) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function toRad(degrees) {
  return (degrees * Math.PI) / 180;
}

function round(value, digits = 2) {
  return value.toFixed(digits);
}

function uid() {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return `cargo-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readBaseShip() {
  return {
    shipName: inputs.shipName.value || "Training Vessel",
    displacement: Math.max(num(inputs.displacement.value), 1),
    beam: Math.max(num(inputs.beam.value), 1),
    draft: Math.max(num(inputs.draft.value), 0.1),
    km: num(inputs.km.value),
    kg: num(inputs.kg.value),
    tcg: num(inputs.tcg.value),
    xg: num(inputs.xg.value),
    minGm: Math.max(num(inputs.minGm.value), 0),
  };
}

function readProfiles() {
  try {
    const raw = globalThis.localStorage?.getItem(PROFILE_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readLanguagePreference() {
  const saved = globalThis.localStorage?.getItem(LANGUAGE_STORAGE_KEY);
  return saved === "is" ? "is" : "en";
}

function persistLanguagePreference() {
  globalThis.localStorage?.setItem(LANGUAGE_STORAGE_KEY, state.language);
}

function persistProfiles() {
  if (!globalThis.localStorage) {
    return false;
  }

  globalThis.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(state.profiles));
  return true;
}

function writeShipToInputs(ship) {
  Object.entries(ship).forEach(([key, value]) => {
    if (inputs[key]) {
      inputs[key].value = value;
    }
  });
}

function createCargoItem(partial = {}) {
  return {
    id: partial.id || uid(),
    name: partial.name || "",
    weight: partial.weight ?? 0,
    kg: partial.kg ?? 0,
    xg: partial.xg ?? 0,
  };
}

function currentProfilePayload(name) {
  return {
    name,
    ship: readBaseShip(),
    cargoItems: readCargoItemsFromDom(),
    savedAt: new Date().toISOString(),
  };
}

function setProfileMessage(message) {
  outputs.profileMessage.textContent = message;
}

function renderProfileOptions() {
  const selected = inputs.profileSelect.value;
  inputs.profileSelect.innerHTML = "";

  if (!state.profiles.length) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = t("noSavedProfiles");
    inputs.profileSelect.appendChild(option);
    return;
  }

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = t("selectProfile");
  inputs.profileSelect.appendChild(placeholder);

  state.profiles
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((profile) => {
      const option = document.createElement("option");
      option.value = profile.name;
      option.textContent = profile.name;
      inputs.profileSelect.appendChild(option);
    });

  if (state.profiles.some((profile) => profile.name === selected)) {
    inputs.profileSelect.value = selected;
  }
}

function saveProfile() {
  const profileName = inputs.profileName.value.trim() || inputs.shipName.value.trim();

  if (!profileName) {
    setProfileMessage(t("enterProfileName"));
    return;
  }

  const payload = currentProfilePayload(profileName);
  const existingIndex = state.profiles.findIndex((profile) => profile.name === profileName);

  if (existingIndex >= 0) {
    state.profiles[existingIndex] = payload;
  } else {
    state.profiles.push(payload);
  }

  if (!persistProfiles()) {
    setProfileMessage(t("storageUnavailable"));
    return;
  }

  inputs.profileSelect.value = profileName;
  inputs.profileName.value = profileName;
  renderProfileOptions();
  setProfileMessage(t("profileSaved", { name: profileName }));
}

function loadProfile() {
  const selectedName = inputs.profileSelect.value.trim();
  if (!selectedName) {
    setProfileMessage(t("noProfileLoad"));
    return;
  }

  const profile = state.profiles.find((entry) => entry.name === selectedName);
  if (!profile) {
    setProfileMessage(t("profileNotFound"));
    return;
  }

  writeShipToInputs(profile.ship);
  state.baseShip = { ...profile.ship };
  state.cargoItems = (profile.cargoItems || []).map((item) => createCargoItem(item));
  state.actionEntries = [];
  state.history = [];
  inputs.profileName.value = profile.name;
  renderCargoRows();
  recomputeWorkingShip();
  setProfileMessage(t("profileLoaded", { name: profile.name }));
}

function deleteProfile() {
  const selectedName = inputs.profileSelect.value.trim();
  if (!selectedName) {
    setProfileMessage(t("noProfileDelete"));
    return;
  }

  const nextProfiles = state.profiles.filter((profile) => profile.name !== selectedName);
  if (nextProfiles.length === state.profiles.length) {
    setProfileMessage(t("profileNotFound"));
    return;
  }

  state.profiles = nextProfiles;
  if (!persistProfiles()) {
    setProfileMessage(t("storageUnavailable"));
    return;
  }

  inputs.profileSelect.value = "";
  if (inputs.profileName.value.trim() === selectedName) {
    inputs.profileName.value = "";
  }
  renderProfileOptions();
  setProfileMessage(t("profileDeleted", { name: selectedName }));
}

function getStability(ship) {
  const gm = ship.km - ship.kg;
  const safeGm = Math.abs(gm) < 0.0001 ? 0.0001 : gm;
  const listRad = Math.atan(ship.tcg / safeGm);
  const listDeg = listRad * (180 / Math.PI);
  const gz10 = gm * Math.sin(toRad(10));
  const trimDelta = ship.xg - state.baseShip.xg;
  const trimDeg = clamp(trimDelta / 3, -12, 12);

  return { gm, listDeg, gz10, trimDeg, trimDelta };
}

function describeStatus(ship) {
  const { gm, listDeg } = getStability(ship);
  const absList = Math.abs(listDeg);

  if (gm <= 0) {
    return {
      level: "danger",
      badge: t("unstable"),
      text: t("currentUnstable"),
    };
  }

  if (gm < ship.minGm || absList > 7) {
    return {
      level: "warn",
      badge: t("marginal"),
      text: t("currentMarginal"),
    };
  }

  return {
    level: "ok",
    badge: t("positive"),
    text: t("currentPositive"),
  };
}

function setMode(mode) {
  state.mode = mode;
  actionButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === mode);
  });
  outputs.actionSummary.textContent =
    mode === "load"
      ? t("loadSummary")
      : t("transferSummary");
}

function readCargoItemsFromDom() {
  return Array.from(cargoList.querySelectorAll(".cargo-row")).map((row) => ({
    id: row.dataset.id,
    name: row.querySelector('[data-field="name"]').value.trim(),
    weight: Math.max(num(row.querySelector('[data-field="weight"]').value), 0),
    kg: num(row.querySelector('[data-field="kg"]').value),
    xg: num(row.querySelector('[data-field="xg"]').value),
  }));
}

function applyCargoManifest(ship, cargoItems) {
  return cargoItems.reduce((currentShip, item) => {
    if (item.weight <= 0) {
      return currentShip;
    }

    const nextDisplacement = currentShip.displacement + item.weight;

    return {
      ...currentShip,
      displacement: nextDisplacement,
      kg: ((currentShip.displacement * currentShip.kg) + (item.weight * item.kg)) / nextDisplacement,
      tcg: currentShip.tcg,
      xg: ((currentShip.displacement * currentShip.xg) + (item.weight * item.xg)) / nextDisplacement,
    };
  }, { ...ship });
}

function applyActionEntry(ship, entry) {
  const current = { ...ship };

  if (entry.mode === "load") {
    const sign = entry.loadType === "add" ? 1 : -1;
    const nextDisplacement = current.displacement + sign * entry.weight;

    if (nextDisplacement <= 0) {
      return current;
    }

    current.kg = ((current.displacement * current.kg) + sign * entry.weight * entry.kgTo) / nextDisplacement;
    current.tcg = ((current.displacement * current.tcg) + sign * entry.weight * entry.tcgTo) / nextDisplacement;
    current.displacement = nextDisplacement;
    return current;
  }

  current.kg += (entry.weight * (entry.kgTo - entry.kgFrom)) / current.displacement;
  current.tcg += (entry.weight * (entry.tcgTo - entry.tcgFrom)) / current.displacement;
  return current;
}

function recomputeWorkingShip() {
  const shipWithCargo = applyCargoManifest(state.baseShip, state.cargoItems);
  state.workingShip = state.actionEntries.reduce(
    (currentShip, entry) => applyActionEntry(currentShip, entry),
    shipWithCargo,
  );
  render();
}

function syncBaseShip() {
  state.baseShip = readBaseShip();
  recomputeWorkingShip();
}

function applyAction() {
  const weight = Math.max(num(inputs.weightAmount.value), 0);
  const kgFrom = num(inputs.kgFrom.value);
  const kgTo = num(inputs.kgTo.value);
  const tcgFrom = num(inputs.tcgFrom.value);
  const tcgTo = num(inputs.tcgTo.value);

  if (weight <= 0) {
    outputs.actionSummary.textContent = t("enterPositiveWeight");
    return;
  }

  if (state.mode === "load") {
    const loadType = inputs.loadType.value;

    if (loadType === "remove" && weight >= state.workingShip.displacement) {
      outputs.actionSummary.textContent = t("invalidDisplacement");
      return;
    }

    state.actionEntries.push({
      mode: "load",
      loadType,
      weight,
      kgTo,
      tcgTo,
    });

    state.history.unshift(
      t(loadType === "add" ? "addedWeight" : "removedWeight", {
        weight: round(weight, 1),
        kg: round(kgTo),
        tcg: round(tcgTo),
      }),
    );
  } else {
    state.actionEntries.push({
      mode: "transfer",
      weight,
      kgFrom,
      kgTo,
      tcgFrom,
      tcgTo,
    });

    state.history.unshift(
      t("transferredWeight", {
        weight: round(weight, 1),
        kgFrom: round(kgFrom),
        tcgFrom: round(tcgFrom),
        kgTo: round(kgTo),
        tcgTo: round(tcgTo),
      }),
    );
  }

  recomputeWorkingShip();
}

function resetScenario() {
  state.actionEntries = [];
  state.history = [];
  recomputeWorkingShip();
}

function renderHistory() {
  outputs.historyList.innerHTML = "";
  if (!state.history.length) {
    const item = document.createElement("li");
    item.textContent = t("noHistory");
    outputs.historyList.appendChild(item);
    return;
  }

  state.history.slice(0, 8).forEach((entry) => {
    const item = document.createElement("li");
    item.textContent = entry;
    outputs.historyList.appendChild(item);
  });
}

function renderMetrics() {
  const ship = state.workingShip;
  const { gm, listDeg, gz10 } = getStability(ship);
  const status = describeStatus(ship);
  const listSide = listDeg > 0 ? t("starboard") : listDeg < 0 ? t("port") : t("upright");

  outputs.gmValue.textContent = `${round(gm)} m`;
  outputs.listValue.textContent = `${round(Math.abs(listDeg), 1)} deg ${listSide}`;
  outputs.kgValue.textContent = `${round(ship.kg)} m`;
  outputs.tcgValue.textContent = `${round(ship.tcg)} m`;
  outputs.xgValue.textContent = `${round(ship.xg)} m`;
  outputs.dispValue.textContent = `${round(ship.displacement, 1)} t`;
  outputs.gzValue.textContent = `${round(gz10)} m`;
  outputs.statusBadge.textContent = status.badge;
  outputs.statusBadge.className = `status ${status.level}`;
  outputs.statusText.textContent = status.text;
  outputs.formulaText.textContent =
    t("formulaSummary", { km: round(ship.km), kg: round(ship.kg), gm: round(gm) });
}

function drawShip() {
  const ship = state.workingShip;
  const { gm, listDeg, trimDeg } = getStability(ship);
  const angle = clamp(listDeg, -18, 18);
  const rad = toRad(angle);
  const { width, height } = shipCanvas;

  shipCtx.clearRect(0, 0, width, height);

  shipCtx.save();
  shipCtx.fillStyle = "rgba(255,255,255,0.22)";
  for (let i = 0; i < width; i += 48) {
    shipCtx.fillRect(i, 0, 1, height);
  }
  shipCtx.restore();

  const centerX = width / 2;
  const waterlineY = height * 0.46;
  const hullWidth = clamp(ship.beam * 18, 220, 420);
  const hullHeight = clamp(ship.draft * 16, 80, 150);

  shipCtx.save();
  shipCtx.translate(centerX, waterlineY);
  shipCtx.rotate(rad);

  shipCtx.strokeStyle = "rgba(247, 244, 234, 0.9)";
  shipCtx.lineWidth = 2;
  shipCtx.beginPath();
  shipCtx.moveTo(0, -160);
  shipCtx.lineTo(0, 90);
  shipCtx.stroke();

  shipCtx.fillStyle = "#26465d";
  shipCtx.beginPath();
  shipCtx.moveTo(-hullWidth / 2, -18 + trimDeg);
  shipCtx.lineTo(hullWidth / 2, -18 - trimDeg);
  shipCtx.lineTo(hullWidth / 2 - 36, hullHeight / 2 - trimDeg);
  shipCtx.quadraticCurveTo(0, hullHeight, -hullWidth / 2 + 36, hullHeight / 2 + trimDeg);
  shipCtx.closePath();
  shipCtx.fill();

  shipCtx.fillStyle = "#f7f4ea";
  shipCtx.save();
  shipCtx.rotate(toRad(-trimDeg * 0.35));
  shipCtx.fillRect(-hullWidth / 2 + 34, -62, hullWidth - 68, 36);
  shipCtx.restore();

  const scaleY = 28;
  const gPoint = { x: clamp(ship.tcg * 12, -hullWidth / 3, hullWidth / 3), y: 8 - ship.kg * scaleY };
  const mPoint = { x: 0, y: 8 - ship.km * scaleY };
  const kPoint = { x: 0, y: 14 };

  drawPoint(gPoint.x, gPoint.y, "#c65d35", "G");
  drawPoint(mPoint.x, mPoint.y, "#ffb65e", "M");
  drawPoint(kPoint.x, kPoint.y, "#f7f4ea", "K", "#26465d");

  shipCtx.strokeStyle = "rgba(255, 182, 94, 0.7)";
  shipCtx.setLineDash([6, 6]);
  shipCtx.beginPath();
  shipCtx.moveTo(gPoint.x, gPoint.y);
  shipCtx.lineTo(mPoint.x, mPoint.y);
  shipCtx.stroke();
  shipCtx.setLineDash([]);

  shipCtx.restore();

  shipCtx.fillStyle = "#17333e";
  shipCtx.font = '600 16px "Avenir Next", "Segoe UI", sans-serif';
  shipCtx.fillText(`${ship.shipName}`, 24, 32);
  shipCtx.fillText(`${t("listLabel")}: ${round(Math.abs(listDeg), 1)} deg`, 24, 56);
  shipCtx.fillText(`GM: ${round(gm)} m`, 24, 80);

  function drawPoint(x, y, color, label, textColor = "#14202d") {
    shipCtx.fillStyle = color;
    shipCtx.beginPath();
    shipCtx.arc(x, y, 8, 0, Math.PI * 2);
    shipCtx.fill();
    shipCtx.fillStyle = textColor;
    shipCtx.font = '700 13px "Arial Rounded MT Bold", "Trebuchet MS", sans-serif';
    shipCtx.fillText(label, x + 14, y + 4);
  }
}

function drawCurve() {
  const { width, height } = curveCanvas;
  curveCtx.clearRect(0, 0, width, height);

  const ship = state.workingShip;
  const { gm } = getStability(ship);
  const maxAbsGz = Math.max(Math.abs(gm) * Math.sin(toRad(60)), 0.1);
  const padding = { top: 24, right: 24, bottom: 36, left: 54 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  curveCtx.fillStyle = "rgba(255,255,255,0.9)";
  curveCtx.fillRect(0, 0, width, height);

  curveCtx.strokeStyle = "rgba(20, 32, 45, 0.18)";
  curveCtx.lineWidth = 1;
  curveCtx.beginPath();
  curveCtx.moveTo(padding.left, padding.top);
  curveCtx.lineTo(padding.left, height - padding.bottom);
  curveCtx.lineTo(width - padding.right, height - padding.bottom);
  curveCtx.stroke();

  for (let angle = 0; angle <= 60; angle += 10) {
    const x = padding.left + (angle / 60) * plotWidth;
    curveCtx.beginPath();
    curveCtx.moveTo(x, height - padding.bottom);
    curveCtx.lineTo(x, height - padding.bottom + 6);
    curveCtx.stroke();
    curveCtx.fillStyle = "#5f6e78";
    curveCtx.font = '12px "Avenir Next", "Segoe UI", sans-serif';
    curveCtx.fillText(`${angle}`, x - 7, height - 12);
  }

  const zeroY = padding.top + plotHeight / 2;
  curveCtx.strokeStyle = "rgba(20, 32, 45, 0.14)";
  curveCtx.beginPath();
  curveCtx.moveTo(padding.left, zeroY);
  curveCtx.lineTo(width - padding.right, zeroY);
  curveCtx.stroke();

  curveCtx.strokeStyle = "#0e7c86";
  curveCtx.lineWidth = 3;
  curveCtx.beginPath();

  for (let angle = 0; angle <= 60; angle += 1) {
    const gz = gm * Math.sin(toRad(angle));
    const x = padding.left + (angle / 60) * plotWidth;
    const y = zeroY - (gz / maxAbsGz) * (plotHeight / 2 - 10);

    if (angle === 0) {
      curveCtx.moveTo(x, y);
    } else {
      curveCtx.lineTo(x, y);
    }
  }
  curveCtx.stroke();

  const currentAngle = clamp(Math.abs(getStability(ship).listDeg), 0, 60);
  const currentGz = gm * Math.sin(toRad(currentAngle));
  const markerX = padding.left + (currentAngle / 60) * plotWidth;
  const markerY = zeroY - (currentGz / maxAbsGz) * (plotHeight / 2 - 10);

  curveCtx.fillStyle = "#c65d35";
  curveCtx.beginPath();
  curveCtx.arc(markerX, markerY, 5, 0, Math.PI * 2);
  curveCtx.fill();

  curveCtx.fillStyle = "#14202d";
  curveCtx.font = '600 13px "Avenir Next", "Segoe UI", sans-serif';
  curveCtx.fillText(t("curveXAxis"), width / 2 - 36, height - 10);
  curveCtx.save();
  curveCtx.translate(16, height / 2 + 30);
  curveCtx.rotate(-Math.PI / 2);
  curveCtx.fillText(t("curveYAxis"), 0, 0);
  curveCtx.restore();
}

function drawListGauge() {
  const { width, height } = listCanvas;
  listCtx.clearRect(0, 0, width, height);

  const { listDeg } = getStability(state.workingShip);
  const clampedList = clamp(listDeg, -20, 20);
  const centerX = width / 2;
  const baseY = height - 42;
  const radius = Math.min(width * 0.34, 220);

  listCtx.fillStyle = "rgba(255,255,255,0.92)";
  listCtx.fillRect(0, 0, width, height);

  listCtx.strokeStyle = "rgba(20, 32, 45, 0.12)";
  listCtx.lineWidth = 2;
  listCtx.beginPath();
  listCtx.arc(centerX, baseY, radius, Math.PI, 0, false);
  listCtx.stroke();

  for (let angle = -20; angle <= 20; angle += 5) {
    const rad = toRad(angle - 90);
    const outerX = centerX + Math.cos(rad) * radius;
    const outerY = baseY + Math.sin(rad) * radius;
    const innerX = centerX + Math.cos(rad) * (radius - (angle % 10 === 0 ? 18 : 10));
    const innerY = baseY + Math.sin(rad) * (radius - (angle % 10 === 0 ? 18 : 10));

    listCtx.strokeStyle = "rgba(20, 32, 45, 0.24)";
    listCtx.lineWidth = angle % 10 === 0 ? 2 : 1;
    listCtx.beginPath();
    listCtx.moveTo(innerX, innerY);
    listCtx.lineTo(outerX, outerY);
    listCtx.stroke();

    if (angle % 10 === 0) {
      const labelX = centerX + Math.cos(rad) * (radius - 34);
      const labelY = baseY + Math.sin(rad) * (radius - 34);
      listCtx.fillStyle = "#5f6e78";
      listCtx.font = '12px "Avenir Next", "Segoe UI", sans-serif';
      listCtx.fillText(`${Math.abs(angle)}`, labelX - 7, labelY + 4);
    }
  }

  listCtx.strokeStyle = "rgba(198, 93, 53, 0.18)";
  listCtx.lineWidth = 18;
  listCtx.beginPath();
  listCtx.arc(centerX, baseY, radius - 28, Math.PI, 0, false);
  listCtx.stroke();

  const pointerAngle = toRad(clampedList - 90);
  const pointerLength = radius - 26;
  const pointerX = centerX + Math.cos(pointerAngle) * pointerLength;
  const pointerY = baseY + Math.sin(pointerAngle) * pointerLength;

  listCtx.strokeStyle = "#c65d35";
  listCtx.lineWidth = 5;
  listCtx.beginPath();
  listCtx.moveTo(centerX, baseY);
  listCtx.lineTo(pointerX, pointerY);
  listCtx.stroke();

  listCtx.fillStyle = "#14202d";
  listCtx.beginPath();
  listCtx.arc(centerX, baseY, 8, 0, Math.PI * 2);
  listCtx.fill();

  const direction =
    clampedList > 0 ? t("starboard") : clampedList < 0 ? t("port") : t("upright");
  listCtx.fillStyle = "#14202d";
  listCtx.font = '700 24px "Arial Rounded MT Bold", "Trebuchet MS", sans-serif';
  listCtx.fillText(`${t("listLabel")}: ${round(Math.abs(listDeg), 1)} deg ${direction}`, 26, 38);
  listCtx.font = '600 14px "Avenir Next", "Segoe UI", sans-serif';
  listCtx.fillStyle = "#5f6e78";
  listCtx.fillText(t("listPort"), 38, baseY - 8);
  listCtx.fillText(t("listUpright"), centerX - 24, 28);
  listCtx.fillText(t("listStarboard"), width - 102, baseY - 8);
}

function drawTrimGauge() {
  const { width, height } = trimCanvas;
  trimCtx.clearRect(0, 0, width, height);

  const { trimDeg, trimDelta } = getStability(state.workingShip);
  const clampedTrim = clamp(trimDeg, -10, 10);
  const centerX = width / 2;
  const centerY = height / 2 + 18;
  const hullWidth = 430;
  const hullHeight = 88;

  trimCtx.fillStyle = "rgba(255,255,255,0.92)";
  trimCtx.fillRect(0, 0, width, height);

  trimCtx.strokeStyle = "rgba(20, 32, 45, 0.16)";
  trimCtx.lineWidth = 3;
  trimCtx.beginPath();
  trimCtx.moveTo(40, centerY);
  trimCtx.lineTo(width - 40, centerY);
  trimCtx.stroke();

  trimCtx.save();
  trimCtx.translate(centerX, centerY);
  trimCtx.rotate(toRad(clampedTrim));
  trimCtx.fillStyle = "#26465d";
  trimCtx.beginPath();
  trimCtx.moveTo(-hullWidth / 2, -12);
  trimCtx.lineTo(hullWidth / 2 - 34, -12);
  trimCtx.lineTo(hullWidth / 2, 10);
  trimCtx.lineTo(hullWidth / 2 - 24, hullHeight / 2);
  trimCtx.lineTo(-hullWidth / 2 + 36, hullHeight / 2);
  trimCtx.closePath();
  trimCtx.fill();

  trimCtx.fillStyle = "#f7f4ea";
  trimCtx.fillRect(-120, -38, 240, 20);
  trimCtx.restore();

  const trimDirection = clampedTrim > 0 ? t("forward") : clampedTrim < 0 ? t("aft") : t("upright");
  trimCtx.fillStyle = "#14202d";
  trimCtx.font = '700 24px "Arial Rounded MT Bold", "Trebuchet MS", sans-serif';
  trimCtx.fillText(`${t("trimLabel")}: ${round(Math.abs(trimDeg), 1)} deg ${trimDirection}`, 26, 38);
  trimCtx.font = '600 14px "Avenir Next", "Segoe UI", sans-serif';
  trimCtx.fillStyle = "#5f6e78";
  trimCtx.fillText(t("trimAft"), 46, centerY - 12);
  trimCtx.fillText(t("trimEven"), centerX - 30, 28);
  trimCtx.fillText(t("trimForward"), width - 122, centerY - 12);
  trimCtx.fillText(`${t("trimDeltaLabel")}: ${round(trimDelta)} m`, 26, height - 18);
}

function render() {
  renderMetrics();
  renderHistory();
  drawShip();
  drawListGauge();
  drawTrimGauge();
  drawCurve();
}

function renderCargoRows() {
  cargoList.innerHTML = "";

  if (!state.cargoItems.length) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = t("noCargoRows");
    cargoList.appendChild(empty);
    return;
  }

  state.cargoItems.forEach((item) => {
    const row = document.createElement("div");
    row.className = "cargo-row";
    row.dataset.id = item.id;

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.placeholder = t("cargoNamePlaceholder");
    nameInput.value = item.name;
    nameInput.dataset.field = "name";

    const weightInput = document.createElement("input");
    weightInput.type = "number";
    weightInput.min = "0";
    weightInput.step = "0.1";
    weightInput.value = String(item.weight);
    weightInput.dataset.field = "weight";
    weightInput.setAttribute("aria-label", "Weight in tonnes");

    const kgInput = document.createElement("input");
    kgInput.type = "number";
    kgInput.step = "0.01";
    kgInput.value = String(item.kg);
    kgInput.dataset.field = "kg";
    kgInput.setAttribute("aria-label", "Kg meters from keel");

    const xgInput = document.createElement("input");
    xgInput.type = "number";
    xgInput.step = "0.01";
    xgInput.value = String(item.xg);
    xgInput.dataset.field = "xg";
    xgInput.setAttribute("aria-label", "Circled cross g meters from centre of gravity");

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "ghost-button remove-row";
    removeButton.textContent = t("remove");

    row.append(
      nameInput,
      createCargoUnitCell(weightInput, "t"),
      createCargoUnitCell(kgInput, "Kg"),
      createCargoUnitCell(xgInput, "⊗g"),
      removeButton,
    );
    cargoList.appendChild(row);
  });
}

function createCargoUnitCell(input, unitLabel) {
  const wrapper = document.createElement("div");
  wrapper.className = "cargo-cell";
  const unit = document.createElement("span");
  unit.className = "cargo-unit";
  unit.textContent = unitLabel;
  wrapper.append(input, unit);
  return wrapper;
}

function syncCargoManifest() {
  state.cargoItems = readCargoItemsFromDom();
  recomputeWorkingShip();
}

function addCargoRow(item = createCargoItem()) {
  state.cargoItems.push(item);
  renderCargoRows();
  recomputeWorkingShip();
}

function removeCargoRow(id) {
  state.cargoItems = state.cargoItems.filter((item) => item.id !== id);
  renderCargoRows();
  recomputeWorkingShip();
}

function loadExampleScenario() {
  writeShipToInputs(exampleShip);
  state.baseShip = { ...exampleShip };
  state.cargoItems = exampleCargo.map((item) => createCargoItem(item));
  state.actionEntries = [];
  state.history = [];
  renderCargoRows();
  recomputeWorkingShip();
  inputs.profileName.value = "Training Vessel";
  setProfileMessage(t("exampleLoaded"));
}

document.getElementById("saveProfile").addEventListener("click", saveProfile);
document.getElementById("loadProfile").addEventListener("click", loadProfile);
document.getElementById("deleteProfile").addEventListener("click", deleteProfile);
document.getElementById("applyAction").addEventListener("click", applyAction);
document.getElementById("resetScenario").addEventListener("click", resetScenario);
document.getElementById("addCargoRow").addEventListener("click", () => addCargoRow());
document.getElementById("clearLog").addEventListener("click", () => {
  state.history = [];
  renderHistory();
});
document.getElementById("loadExample").addEventListener("click", loadExampleScenario);
inputs.languageSelect.addEventListener("change", () => {
  state.language = inputs.languageSelect.value === "is" ? "is" : "en";
  persistLanguagePreference();
  applyTranslations();
});

inputs.profileSelect.addEventListener("change", () => {
  if (inputs.profileSelect.value) {
    inputs.profileName.value = inputs.profileSelect.value;
  }
});

actionButtons.forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.mode));
});

[
  inputs.shipName,
  inputs.displacement,
  inputs.beam,
  inputs.draft,
  inputs.km,
  inputs.kg,
  inputs.tcg,
  inputs.xg,
  inputs.minGm,
].forEach((input) => {
  input.addEventListener("input", syncBaseShip);
});

cargoList.addEventListener("input", (event) => {
  if (event.target instanceof HTMLInputElement) {
    syncCargoManifest();
  }
});

cargoList.addEventListener("click", (event) => {
  if (event.target instanceof HTMLElement && event.target.classList.contains("remove-row")) {
    const row = event.target.closest(".cargo-row");
    if (row) {
      removeCargoRow(row.dataset.id);
    }
  }
});

state.language = readLanguagePreference();
inputs.languageSelect.value = state.language;
loadExampleScenario();
state.profiles = readProfiles();
renderProfileOptions();
setMode("load");
applyTranslations();
