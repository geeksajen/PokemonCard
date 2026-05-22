const fs = require('fs');
const path = require('path');
const cardsPath = path.join(__dirname, 'src', 'models', 'cards.js');
const specDir = path.join(__dirname, 'spec');
if (!fs.existsSync(specDir)) {
  fs.mkdirSync(specDir, { recursive: true });
}
// Import the card database (assuming it uses ES module syntax; use dynamic import)
import(cardsPath).then(module => {
  const cardDatabase = module.cardDatabase || {};
  const rows = [];
  // Header
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
    // Escape commas in fields if needed
    const escaped = row.map(v => `"${String(v).replace(/"/g, '""')}"`);
    rows.push(escaped.join(','));
  }
  const csvContent = rows.join('\n');
  const outPath = path.join(specDir, 'cards.csv');
  fs.writeFileSync(outPath, csvContent, 'utf8');
  console.log('CSV generated at', outPath);
}).catch(err => {
  console.error('Failed to load cards.js', err);
});
