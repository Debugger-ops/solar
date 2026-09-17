// Real relative orbital data for the eight planets. Distances and radii are
// compressed (see distanceDisplay / radius) so the whole system fits on
// screen, but periods, eccentricities and relative sizes are all accurate.
//
// Want to add a body? Push a new object here — Scene.jsx maps over this
// array automatically, so a new planet (or a dwarf planet, or a moon nested
// under a planet) just needs an entry and, if it should look different, a
// texture in `three/textures.js`.

export const SUN = {
  name: 'Sun',
  color: 0xffcf6b,
  radius: 6,
  facts: [
    ['Type', 'G-type star'],
    ['Radius', '109 × Earth'],
    ['Surface temp.', '≈ 5,500°C'],
    ['% of system mass', '99.86%'],
  ],
  note: 'Every planet in the model orbits it on real relative periods - Mercury laps the sun in the time Neptune barely moves.',
}

export const PLANETS = [
  {
    name: 'Mercury',
    color: 0x9c948a,
    distanceAU: 0.39,
    distanceDisplay: 14,
    periodDays: 88,
    ecc: 0.206,
    radius: 0.5,
    tiltDeg: 0.03,
    spin: 1.6,
    earthRadii: 0.38,
    note: 'The fastest and most eccentric orbit of the eight.',
  },
  {
    name: 'Venus',
    color: 0xe8cda2,
    distanceAU: 0.72,
    distanceDisplay: 18,
    periodDays: 224.7,
    ecc: 0.007,
    radius: 0.92,
    tiltDeg: 177.4,
    spin: -0.4,
    earthRadii: 0.95,
    note: "Spins backwards, so slowly that its day outlasts its year.",
  },
  {
    name: 'Earth',
    color: 0x3f7bd0,
    distanceAU: 1.0,
    distanceDisplay: 22,
    periodDays: 365.25,
    ecc: 0.017,
    radius: 0.97,
    tiltDeg: 23.4,
    spin: 2.0,
    earthRadii: 1.0,
    note: 'One orbit here defines the year every other period is measured against.',
    map: 'earth',
  },
  {
    name: 'Mars',
    color: 0xb5502e,
    distanceAU: 1.52,
    distanceDisplay: 27,
    periodDays: 687,
    ecc: 0.093,
    radius: 0.58,
    tiltDeg: 25.2,
    spin: 1.9,
    earthRadii: 0.53,
    note: "A visible tilt close to Earth's gives it real seasons.",
  },
  {
    name: 'Jupiter',
    color: 0xd8b98a,
    distanceAU: 5.2,
    distanceDisplay: 40,
    periodDays: 4331,
    ecc: 0.049,
    radius: 3.4,
    tiltDeg: 3.1,
    spin: 4.3,
    earthRadii: 11.2,
    note: 'More massive than every other planet combined.',
    map: 'bands',
  },
  {
    name: 'Saturn',
    color: 0xe3c98f,
    distanceAU: 9.58,
    distanceDisplay: 52,
    periodDays: 10747,
    ecc: 0.057,
    radius: 2.9,
    tiltDeg: 26.7,
    spin: 4.1,
    earthRadii: 9.45,
    note: 'Rings are chunks of ice and rock, some no bigger than a grain of sand.',
    map: 'bands',
    rings: true,
  },
  {
    name: 'Uranus',
    color: 0x9fd8e0,
    distanceAU: 19.2,
    distanceDisplay: 66,
    periodDays: 30589,
    ecc: 0.046,
    radius: 1.9,
    tiltDeg: 97.8,
    spin: -2.6,
    earthRadii: 4.0,
    note: 'Tipped almost onto its side - it rolls around the sun rather than spinning upright.',
  },
  {
    name: 'Neptune',
    color: 0x3b5bdb,
    distanceAU: 30.05,
    distanceDisplay: 80,
    periodDays: 59800,
    ecc: 0.011,
    radius: 1.85,
    tiltDeg: 28.3,
    spin: 2.4,
    earthRadii: 3.88,
    note: 'One orbit takes 165 Earth years - it has completed one since its 1846 discovery.',
  },
]

export function factsFor(planet) {
  const years = planet.periodDays / 365.25
  return [
    ['Distance from sun', `${planet.distanceAU} AU`],
    ['Orbital period', years >= 1 ? `${years.toFixed(1)} years` : `${planet.periodDays.toFixed(0)} days`],
    ['Orbit eccentricity', planet.ecc.toFixed(3)],
    ['Radius', `${planet.earthRadii.toFixed(2)} × Earth`],
  ]
}
