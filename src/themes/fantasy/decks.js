// Fantasy stub deck composition
export const themeMap = {
  flame: { basic: 'f-flame', energy: 'e-fire'  },
  tide:  { basic: 'f-tide',  energy: 'e-water' },
};

export const buildComposition = (t) => [
  { id: t.basic,    count: 12 },
  { id: t.energy,   count: 7 },
  { id: 't-potion', count: 1 },
];
