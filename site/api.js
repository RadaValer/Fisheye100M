/**
 * Data-access layer for Fisheye100M.
 *
 * This module is the ONLY place in the app that touches storage. Right now every
 * function persists to localStorage (acting as a stand-in database) so the app
 * behaves like a real stateful system across reloads. To connect a real backend,
 * replace the body of each function with a `fetch()` call to your API — the
 * function signatures, parameters and return shapes are already REST-shaped
 * (async, resolve with plain data, throw on failure) so nothing else in the app
 * needs to change.
 *
 * Example swap:
 *   async function login(email, password) {
 *     const res = await fetch('/api/auth/login', {
 *       method: 'POST',
 *       headers: { 'Content-Type': 'application/json' },
 *       body: JSON.stringify({ email, password }),
 *     });
 *     if (!res.ok) throw new Error('invalid_credentials');
 *     return res.json();
 *   }
 *
 * Security note: passwords are stored and compared in plain text here because
 * this is a client-only mock with no server. A real implementation must never
 * validate credentials in client-side JS — auth has to happen server-side
 * against hashed passwords.
 */
(function () {
  const DB_KEYS = {
    users: 'fisheye-db-users',
    fleet: 'fisheye-db-fleet',
    buildLog: 'fisheye-db-buildlog',
    session: 'fisheye-db-session',
  };

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const DEFAULT_USERS = [
    { email: 'operator@fisheye100m.dev', password: 'fisheye2026', name: 'Operator' },
  ];

  const DEFAULT_FLEET = [
    {
      id: 'alpha', name: 'Fisheye100M — Alpha', type: 'submarine', status: 'online',
      registrationNumber: 'RO-FE100M-A1', password: 'alpha-2025',
      batteryPropulsion: 78, batteryElectronics: 88, battery: 100, cameraOnline: true,
      lat: 45.6427, lng: 25.5887,
      tempInternal: 24.1, tempExternal: 9.4, pressureInternal: 1.02, pressureExternal: 4.8,
      humidity: 38, motor1: 1.8, motor2: 1.7, depth: 38,
      launchCount: 34, totalSubmergedMinutes: 2760, totalAtSeaMinutes: 5400,
      deployedMinutesAgo: 134,
    },
    {
      id: 'beta', name: 'Fisheye100M — Beta', type: 'submarine', status: 'charging',
      registrationNumber: 'RO-FE100M-B2', password: 'beta-2025',
      batteryPropulsion: 31, batteryElectronics: 57, battery: 100, cameraOnline: false,
      lat: 45.6431, lng: 25.5872,
      tempInternal: 22.6, tempExternal: 11.2, pressureInternal: 1.01, pressureExternal: 1.01,
      humidity: 41, motor1: 0, motor2: 0, depth: 0,
      launchCount: 19, totalSubmergedMinutes: 1140, totalAtSeaMinutes: 3050,
      deployedMinutesAgo: 26,
    },
    {
      id: 'boat', name: 'Barca Fisheye', type: 'boat', status: 'online',
      registrationNumber: 'RO-FEBOAT-01', password: 'boat-2025',
      batteryPropulsion: 0, batteryElectronics: 0, battery: 91, cameraOnline: false,
      lat: 45.6429, lng: 25.5880,
      tempInternal: 20, tempExternal: 13.5, pressureInternal: 1.0, pressureExternal: 1.0,
      humidity: 0, motor1: 0.6, motor2: 0.5, depth: 0,
      launchCount: 52, totalSubmergedMinutes: 0, totalAtSeaMinutes: 9200,
      deployedMinutesAgo: 134,
    },
  ];

  const DEFAULT_BUILD_LOG = [
    {
      date: { ro: 'Martie 2025', en: 'March 2025' },
      title: { ro: 'Proiectare CAD & simulare structurală', en: 'CAD design & structural simulation' },
      desc: {
        ro: 'Am pornit de la un model 3D complet al corpului, balastului și propulsiei, testat virtual la 10 bar înainte să tăiem vreun material — ca să prindem din timp orice punct slab.',
        en: 'We started from a complete 3D model of the hull, ballast, and propulsion, tested virtually at 10 bar before cutting any material — to catch weak points early.',
      },
      media: 'photo',
    },
    {
      date: { ro: 'Aprilie 2025', en: 'April 2025' },
      title: { ro: 'Debitare & prelucrare corp aluminiu', en: 'Cutting & machining the aluminum hull' },
      desc: {
        ro: 'Țeava de aluminiu 6061 a fost debitată la lungime, găurită pentru presetupe și pregătită pentru sudura tijelor portante — primul pas concret spre un corp fizic.',
        en: 'The 6061 aluminum tube was cut to length, drilled for the glands, and prepped for welding the load-bearing rods — the first concrete step toward a physical hull.',
      },
      media: 'photo',
    },
    {
      date: { ro: 'Mai 2025', en: 'May 2025' },
      title: { ro: 'Imprimare 3D — emisfere & elice', en: '3D printing — domes & propellers' },
      desc: {
        ro: 'Emisferele ASA și elicele au trecut prin câteva iterații de imprimare până am ajuns la un perete suficient de gros și o etanșeitate bună la O-ring.',
        en: 'The ASA domes and propellers went through a few print iterations before we landed on a wall thick enough and a good O-ring seal.',
      },
      media: 'video',
    },
    {
      date: { ro: 'Iunie 2025', en: 'June 2025' },
      title: { ro: 'Asamblare cilindri de balast', en: 'Ballast cylinder assembly' },
      desc: {
        ro: 'Montarea celor patru cilindri PPR, a reductoarelor planetare și a șuruburilor T8 — inclusiv primul test de curse ale pistonului, fără apă.',
        en: 'Mounting the four PPR cylinders, the planetary gearboxes, and the T8 screws — including the first piston stroke test, without water.',
      },
      media: 'photo',
    },
    {
      date: { ro: 'Iulie 2025', en: 'July 2025' },
      title: { ro: 'Integrare electronică & cablaj', en: 'Electronics integration & wiring' },
      desc: {
        ro: 'Raspberry Pi 5, Pico W, senzorii și driverele au fost montate pe șasiul intern și cablate — cu ordine, etichete și un plan de cabluri ca să nu ne pierdem în el.',
        en: "The Raspberry Pi 5, Pico W, sensors, and drivers were mounted on the internal chassis and wired up — with order, labels, and a wiring plan so we wouldn't get lost in it.",
      },
      media: 'photo',
    },
    {
      date: { ro: 'August 2025', en: 'August 2025' },
      title: { ro: 'Etanșare & test de presiune', en: 'Sealing & pressure testing' },
      desc: {
        ro: 'Corpul complet asamblat a fost dus la presiune într-un rezervor de test, simulând cei 100m de adâncime, ca să validăm toate O-ringurile și presetupele.',
        en: 'The fully assembled hull was taken up to pressure in a test tank simulating the full 100m depth, to validate every O-ring and gland.',
      },
      media: 'video',
    },
    {
      date: { ro: 'Septembrie 2025', en: 'September 2025' },
      title: { ro: 'Montaj final & calibrare senzori', en: 'Final assembly & sensor calibration' },
      desc: {
        ro: 'Camera, LED-urile și toți senzorii externi au fost calibrați cu submarinul complet asamblat, iar algoritmul de menținere a adâncimii a fost reglat fin.',
        en: 'The camera, LEDs, and all external sensors were calibrated with the submarine fully assembled, and the depth-hold algorithm was fine-tuned.',
      },
      media: 'photo',
    },
    {
      date: { ro: 'Octombrie 2025', en: 'October 2025' },
      title: { ro: 'Primul test în apă', en: 'First water test' },
      desc: {
        ro: 'Fisheye100M a coborât pentru prima dată sub suprafață, sub observație directă — primul cufundare completă, de la balast la revenirea la suprafață.',
        en: 'Fisheye100M went below the surface for the first time, under direct observation — the first complete dive, from ballast down to resurfacing.',
      },
      media: 'video',
    },
  ];

  function seed() {
    if (!localStorage.getItem(DB_KEYS.users)) write(DB_KEYS.users, DEFAULT_USERS);
    if (!localStorage.getItem(DB_KEYS.fleet)) write(DB_KEYS.fleet, DEFAULT_FLEET);
    if (!localStorage.getItem(DB_KEYS.buildLog)) write(DB_KEYS.buildLog, DEFAULT_BUILD_LOG);
  }
  seed();

  // ---- Auth ----
  async function login(email, password) {
    await delay(300);
    const users = read(DB_KEYS.users, []);
    const user = users.find(
      (u) => u.email.toLowerCase() === String(email).toLowerCase() && u.password === password
    );
    if (!user) throw new Error('invalid_credentials');
    const session = { email: user.email, name: user.name, token: 'mock-' + Date.now() };
    write(DB_KEYS.session, session);
    return session;
  }

  function logout() {
    localStorage.removeItem(DB_KEYS.session);
  }

  function getSession() {
    return read(DB_KEYS.session, null);
  }

  // ---- Fleet ----
  async function getFleet() {
    await delay(200);
    return read(DB_KEYS.fleet, []);
  }

  async function updateVehicle(id, patch) {
    await delay(150);
    const fleet = read(DB_KEYS.fleet, []);
    const idx = fleet.findIndex((v) => v.id === id);
    if (idx === -1) throw new Error('not_found');
    fleet[idx] = Object.assign({}, fleet[idx], patch);
    write(DB_KEYS.fleet, fleet);
    return fleet[idx];
  }

  async function addVehicle({ name, type, registrationNumber, password }) {
    await delay(300);
    const fleet = read(DB_KEYS.fleet, []);
    const reg = String(registrationNumber || '').trim();
    if (!reg || !password) throw new Error('missing_fields');
    if (fleet.some((v) => v.registrationNumber.toLowerCase() === reg.toLowerCase())) {
      throw new Error('duplicate_registration');
    }
    const vehicle = {
      id: 'v' + Date.now(),
      name: (name || reg).trim(),
      type: type === 'boat' ? 'boat' : 'submarine',
      status: 'offline',
      registrationNumber: reg,
      password,
      batteryPropulsion: 100, batteryElectronics: 100, battery: 100, cameraOnline: false,
      lat: 45.6429, lng: 25.5880,
      tempInternal: 20, tempExternal: 15, pressureInternal: 1.0, pressureExternal: 1.0,
      humidity: 35, motor1: 0, motor2: 0, depth: 0,
      launchCount: 0, totalSubmergedMinutes: 0, totalAtSeaMinutes: 0,
      deployedMinutesAgo: 0,
    };
    fleet.push(vehicle);
    write(DB_KEYS.fleet, fleet);
    return vehicle;
  }

  // ---- Build log ----
  async function getBuildLog() {
    await delay(200);
    return read(DB_KEYS.buildLog, []);
  }

  window.FisheyeApi = {
    login,
    logout,
    getSession,
    getFleet,
    updateVehicle,
    addVehicle,
    getBuildLog,
  };
})();
