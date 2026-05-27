import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock enums
const CardTypes = { POKEMON: 'pokemon', ENERGY: 'energy', ITEM: 'item', TRAINER: 'trainer' };
const EnergyTypes = { FIRE: 'fire', WATER: 'water', GRASS: 'grass', ELECTRIC: 'electric', PSYCHIC: 'psychic', FIGHTING: 'fighting', NORMAL: 'normal' };
const GREATBALL_TOPN = 7;

// Read and parse cards.js
const cardsJsPath = path.join(__dirname, '../src/themes/pokemon/cards.js');
let cardsJsContent = fs.readFileSync(cardsJsPath, 'utf8');

// Strip imports and exports
cardsJsContent = cardsJsContent.replace(/import .*/g, '');
cardsJsContent = cardsJsContent.replace(/export const cardDatabase = /, 'return ');

// Eval to get the object
const getCardDatabase = new Function('CardTypes', 'EnergyTypes', 'GREATBALL_TOPN', cardsJsContent);
const cardDatabase = getCardDatabase(CardTypes, EnergyTypes, GREATBALL_TOPN);

function evaluatePokemon(card) {
  let score = 0;
  let details = [];

  // 1. HP Value (Base 60 HP = 0)
  const hpScore = (card.maxHp - 60) / 10;
  score += hpScore;
  details.push(`HP(${card.maxHp}): ${hpScore > 0 ? '+' : ''}${hpScore}`);

  // 2. Attack Damage
  if (card.attack && card.attack.damage) {
    const dmgScore = card.attack.damage / 10;
    score += dmgScore;
    details.push(`Dmg(${card.attack.damage}): +${dmgScore}`);
  }

  // 3. Attack Cost
  if (card.attack && card.attack.cost) {
    let costScore = 0;
    card.attack.cost.forEach(energy => {
      if (energy === EnergyTypes.NORMAL) {
        costScore -= 1.5;
      } else {
        costScore -= 2.0;
      }
    });
    score += costScore;
    details.push(`Cost(${card.attack.cost.length}): ${costScore}`);
  }

  // 4. Evolution Stage
  if (card.stage === 1) {
    score -= 4;
    details.push(`Stage1: -4`);
  } else if (card.stage === 2) {
    score -= 8;
    details.push(`Stage2: -8`);
  }

  // 5. Prize Yield (EX/V cards)
  if (card.prizeYield === 2) {
    score -= 7;
    details.push(`Prize(2): -7`);
  }

  // 6. Retreat Cost
  if (card.retreatCost) {
    const retreatScore = -(card.retreatCost * 0.5);
    score += retreatScore;
    details.push(`Retreat(${card.retreatCost}): ${retreatScore}`);
  }

  return { name: card.name, id: card.id, score, details };
}

console.log('=========================================');
console.log(' PKCard 寶可夢卡牌平衡性評估報告 (Value Points)');
console.log('=========================================');
console.log('評估標準：理想的平衡點為 0 分。分數越高代表越強（超模），分數越低代表偏弱。');
console.log('');

const overpowered = [];
const underpowered = [];
const balanced = [];

Object.values(cardDatabase).forEach(card => {
  if (card.type === CardTypes.POKEMON) {
    const result = evaluatePokemon(card);
    
    let status = '🟢 平衡';
    if (result.score > 2) {
      status = '🔴 超模';
      overpowered.push(result);
    } else if (result.score < -2) {
      status = '🟡 偏弱';
      underpowered.push(result);
    } else {
      balanced.push(result);
    }

    console.log(`[${status}] ${result.name} (${result.id})`);
    console.log(`  總分: ${result.score} | 細節: ${result.details.join(', ')}`);
    console.log('');
  }
});

console.log('--- 總結 ---');
console.log(`過強 (超模) 卡牌: ${overpowered.map(c => c.name).join(', ') || '無'}`);
console.log(`過弱 (偏弱) 卡牌: ${underpowered.map(c => c.name).join(', ') || '無'}`);
console.log('=========================================');
