export const themeMap = {
  zeus: {
    basic: 'z-001',
    ev1: 'z-001-ev1',
    ev2: 'z-001-ev2',
    energy: 'e-electric'
  },
  poseidon: {
    basic: 'z-002',
    ev1: 'z-002-ev1',
    ev2: 'z-002-ev2',
    energy: 'e-water'
  },
  hades: {
    basic: 'z-003',
    ev1: 'z-003-ev1',
    ev2: 'z-003-ev2',
    energy: 'e-psychic'
  }
};

export const buildComposition = (t) => [
  { id: t.basic,  count: 6 },
  { id: t.ev1,  count: 3 },
  { id: t.ev2,  count: 2 },
  { id: t.energy,     count: 6 },
  { id: 't-athena',   count: 2 },
  { id: 'i-chariot',  count: 1 }
];
