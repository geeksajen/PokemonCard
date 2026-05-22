// generate_cards_csv.mjs
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Resolve __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cardsPath = path.resolve(__dirname, 'src', 'models', 'cards.js');
const specDir = path.resolve(__dirname, 'spec');
if (!fs.existsSync(specDir)) {
  fs.mkdirSync(specDir, { recursive: true });
}

// Import the cards module as ES module
const cardsModule = await import('file://' + cardsPath);
const cardDatabase = cardsModule.cardDatabase || {};

const rows = [];
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
