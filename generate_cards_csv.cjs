const fs = require('fs');
const path = require('path');

// Resolve paths
const cardsPath = path.resolve(__dirname, 'src', 'models', 'cards.js');
const specDir = path.resolve(__dirname, 'spec');
if (!fs.existsSync(specDir)) {
  fs.mkdirSync(specDir, { recursive: true });
}

// Load card database (CommonJS require works if the file uses ES module exports? We'll use dynamic import fallback)
let cardDatabase = {};
try {
  // Attempt to require (if exported via module.exports)
  const mod = require(cardsPath);
  cardDatabase = mod.cardDatabase || {};
} catch (e) {
  // Fallback to dynamic import for ES module
  import(cardsPath).then(mod => {
    cardDatabase = mod.cardDatabase || {};
    writeCSV();
  }).catch(err => {
    console.error('Failed to load cards.js', err);
  });
  // Exit early; the async path will handle writing
  return;
}

function writeCSV() {
  const rows = [];
  // Header columns
  rows.push(['id','type','name','hp','maxHp','energyType','evolvesFrom','stage','image','attackName','attackCost','attackDamage','description'].join(','));
  for (const key in cardDatabase) {
    const card = cardDatabase[key];
    const attack = card.attack || {};
    const row = [
      card.id ?? '',
      card.type ?? '',
      card.name ?? '',
      card.hp ?? '',
      card.maxHp ?? '',
      card.energyType ?? '',
      card.evolvesFrom ?? '',
      card.stage ?? '',
      card.image ?? '',
      attack.name ?? '',
      (attack.cost || []).join('|'),
      attack.damage ?? '',
      card.description ?? ''
    ];
    const escaped = row.map(v => `"${String(v).replace(/"/g, '""')}"`);
    rows.push(escaped.join(','));
  }
  const csvContent = rows.join('\n');
  const outPath = path.join(specDir, 'cards.csv');
  fs.writeFileSync(outPath, csvContent, 'utf8');
  console.log('CSV generated at', outPath);
}

writeCSV();
