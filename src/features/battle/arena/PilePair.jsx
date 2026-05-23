import React from 'react';
import Card from '../Card';

// 卡片本身使用 CSS 變數 --card-width=120px, --card-height=168px
const BASE_W = 120, BASE_H = 168, PILE_SCALE = 1.0;
const SLOT_W = Math.round(BASE_W * PILE_SCALE);
const SLOT_H = Math.round(BASE_H * PILE_SCALE);

// 牌庫 / 棄牌區 單張卡片小元件
const PileSlot = ({ label, labelColor, card, isEmpty, isFaceDown, labelOnTop }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
    {labelOnTop && (
      <span style={{ fontSize: '0.68rem', fontWeight: '600', color: labelColor || 'rgba(255,255,255,0.55)', whiteSpace: 'nowrap' }}>{label}</span>
    )}
    <div style={{ width: `${SLOT_W}px`, height: `${SLOT_H}px`, position: 'relative', flexShrink: 0, borderRadius: '10px', overflow: 'hidden' }}>
      {isEmpty ? (
        <div style={{ width: '100%', height: '100%', border: '2px dashed rgba(255,255,255,0.3)', borderRadius: '10px', boxSizing: 'border-box' }} />
      ) : (
        <div style={{ position: 'absolute', top: 0, left: 0, width: `${BASE_W}px`, height: `${BASE_H}px`, transform: `scale(${PILE_SCALE})`, transformOrigin: 'top left', pointerEvents: 'none' }}>
          <Card card={card} isFaceDown={!!isFaceDown} />
        </div>
      )}
    </div>
    {!labelOnTop && (
      <span style={{ fontSize: '0.68rem', fontWeight: '600', color: labelColor || 'rgba(255,255,255,0.55)', whiteSpace: 'nowrap' }}>{label}</span>
    )}
  </div>
);

// 牌庫 + 棄牌 水平小組
const PilePair = ({ deckCount, discardTop, discardCount, labelOnTop }) => (
  <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'flex-start' }}>
    <PileSlot
      label={`牌庫 ${deckCount}`}
      labelColor={deckCount <= 5 ? 'var(--color-danger)' : 'rgba(255,255,255,0.55)'}
      isFaceDown={true}
      labelOnTop={labelOnTop}
    />
    <PileSlot
      label={`棄牌 ${discardCount}`}
      card={discardTop}
      isEmpty={!discardCount}
      isFaceDown={false}
      labelOnTop={labelOnTop}
    />
  </div>
);

export default PilePair;
