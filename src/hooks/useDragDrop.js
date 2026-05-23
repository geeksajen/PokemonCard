import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * 自訂拖曳系統 Hook
 * 使用 Pointer Events 取代原生 HTML5 Drag & Drop，提供：
 * - 即時座標追蹤
 * - 移動速度向量（用於 3D 傾斜計算）
 * - Drop zone 碰撞偵測
 * - 回呼式放置通知
 */
export const useDragDrop = () => {
  const [dragState, setDragState] = useState({
    isDragging: false,
    card: null,
    source: null,   // { type: 'hand' } | { type: 'bench', index: number }
    x: 0,
    y: 0,
    velocityX: 0,
    velocityY: 0,
    hoverZone: null, // 'my-active' | 'my-bench-0' | 'my-bench-1' | 'my-bench-2' | 'board' | null
  });

  // --- Refs（在 event listener 中讀取，避免 stale closure）---
  const zonesRef = useRef({});        // { zoneId: HTMLElement }
  const dragInfoRef = useRef({
    active: false,
    card: null,
    source: null,
    lastX: 0,
    lastY: 0,
    lastTime: 0,
    onDrop: null,
    smoothVx: 0,
    smoothVy: 0,
  });

  // --- 碰撞偵測：先檢查具體 zone，再 fallback 到 board ---
  const hitTest = useCallback((x, y) => {
    const specificZones = [];
    let boardZone = null;

    for (const [id, el] of Object.entries(zonesRef.current)) {
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
        if (id === 'board') {
          boardZone = id;
        } else {
          specificZones.push(id);
        }
      }
    }
    // 具體 zone 優先（active / bench），沒有才 fallback 到 board
    return specificZones[0] || boardZone || null;
  }, []);

  // --- 全局 Pointer 事件（常駐監聽，透過 ref flag 決定是否處理）---
  useEffect(() => {
    const onMove = (e) => {
      const info = dragInfoRef.current;
      if (!info.active) return;

      const now = performance.now();
      const dt = Math.max(now - info.lastTime, 1);
      const rawVx = ((e.clientX - info.lastX) / dt) * 16; // 標準化到 ~16ms/frame
      const rawVy = ((e.clientY - info.lastY) / dt) * 16;

      // 指數移動平均平滑
      info.smoothVx = rawVx * 0.35 + info.smoothVx * 0.65;
      info.smoothVy = rawVy * 0.35 + info.smoothVy * 0.65;
      info.lastX = e.clientX;
      info.lastY = e.clientY;
      info.lastTime = now;

      const hoverZone = hitTest(e.clientX, e.clientY);

      setDragState({
        isDragging: true,
        card: info.card,
        source: info.source,
        x: e.clientX,
        y: e.clientY,
        velocityX: info.smoothVx,
        velocityY: info.smoothVy,
        hoverZone,
      });
    };

    const onUp = (e) => {
      const info = dragInfoRef.current;
      if (!info.active) return;
      info.active = false;

      const zone = hitTest(e.clientX, e.clientY);
      const { card, source, onDrop } = info;

      // 重置拖曳狀態
      setDragState({
        isDragging: false,
        card: null,
        source: null,
        x: 0,
        y: 0,
        velocityX: 0,
        velocityY: 0,
        hoverZone: null,
      });

      // 通知呼叫方放置結果
      if (onDrop) {
        onDrop({ card, source, zone });
      }
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [hitTest]);

  // --- 開始拖曳 ---
  const startDrag = useCallback((card, source, event, onDrop) => {
    // 阻止瀏覽器的預設觸控行為（選字、捲動等）
    event.preventDefault();

    dragInfoRef.current = {
      active: true,
      card,
      source,
      lastX: event.clientX,
      lastY: event.clientY,
      lastTime: performance.now(),
      onDrop,
      smoothVx: 0,
      smoothVy: 0,
    };

    setDragState({
      isDragging: true,
      card,
      source,
      x: event.clientX,
      y: event.clientY,
      velocityX: 0,
      velocityY: 0,
      hoverZone: null,
    });
  }, []);

  // --- 註冊 Drop Zone（回傳 callback ref，供元件的 ref prop 使用）---
  const registerZone = useCallback((zoneId) => {
    return (el) => {
      if (el) {
        zonesRef.current[zoneId] = el;
      } else {
        delete zonesRef.current[zoneId];
      }
    };
  }, []);

  // --- 手動取消拖曳 ---
  const cancelDrag = useCallback(() => {
    dragInfoRef.current.active = false;
    setDragState({
      isDragging: false,
      card: null,
      source: null,
      x: 0,
      y: 0,
      velocityX: 0,
      velocityY: 0,
      hoverZone: null,
    });
  }, []);

  return {
    dragState,
    startDrag,
    registerZone,
    cancelDrag,
  };
};
