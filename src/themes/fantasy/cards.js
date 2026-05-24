// ============================================================
//  Fantasy Theme Pack — Card Database (STUB)
//  示範：用「奇幻生物」對應七屬性。本檔僅放最小可玩的卡牌。
//  正式上線前需填齊全部進化線、物品卡、訓練家卡。
// ============================================================
import { CardTypes, EnergyTypes } from '../../models/cardTypes';

export const cardDatabase = {
  // ---- 基礎生物（對應七屬性槽）------------------------------------------
  'f-flame': {
    id: 'f-flame',
    type: CardTypes.POKEMON,
    name: '炎獸',
    hp: 60, maxHp: 60,
    energyType: EnergyTypes.FIRE,
    attack: { name: '焚燒', cost: [EnergyTypes.FIRE], damage: 20 }
  },
  'f-tide': {
    id: 'f-tide',
    type: CardTypes.POKEMON,
    name: '潮靈',
    hp: 60, maxHp: 60,
    energyType: EnergyTypes.WATER,
    attack: { name: '浪擊', cost: [EnergyTypes.WATER], damage: 20 }
  },

  // ---- 能量卡 ---------------------------------------------------------
  'e-fire':  { id: 'e-fire',  type: CardTypes.ENERGY, name: '熾焰結晶', energyType: EnergyTypes.FIRE },
  'e-water': { id: 'e-water', type: CardTypes.ENERGY, name: '靈泉結晶', energyType: EnergyTypes.WATER },

  // ---- 物品卡 ---------------------------------------------------------
  't-potion': {
    id: 't-potion',
    type: CardTypes.ITEM,
    name: '療癒藥劑',
    heal: 20,
    effect: { kind: 'heal' },
    description: '回復一隻生物 20 點 HP。'
  },
};
