import React from 'react';

const SettingsModal = ({ bgmMuted, sfxMuted, onToggleBGM, onToggleSFX, onReturnLobby, onClose }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <h2 style={{ marginBottom: '20px' }}>遊戲設定</h2>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
        <button
          onClick={onToggleBGM}
          style={{ flex: 1, marginRight: '5px', padding: '12px', background: bgmMuted ? 'rgba(255,255,255,0.1)' : 'var(--color-primary)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          {bgmMuted ? '🔇 音樂 (關)' : '🎵 音樂 (開)'}
        </button>
        <button
          onClick={onToggleSFX}
          style={{ flex: 1, marginLeft: '5px', padding: '12px', background: sfxMuted ? 'rgba(255,255,255,0.1)' : 'var(--color-primary)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          {sfxMuted ? '🔈 音效 (關)' : '🔊 音效 (開)'}
        </button>
      </div>
      <button
        onClick={onReturnLobby}
        style={{ display: 'block', width: '100%', marginBottom: '15px', padding: '12px', background: 'var(--color-danger)', fontSize: '1.1rem' }}
      >
        返回大廳
      </button>
      <button
        onClick={onClose}
        style={{ display: 'block', width: '100%', padding: '12px', background: 'rgba(255,255,255,0.1)', fontSize: '1.1rem' }}
      >
        關閉
      </button>
    </div>
  </div>
);

export default SettingsModal;
