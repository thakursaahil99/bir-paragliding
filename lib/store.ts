'use client';

import type Lenis from 'lenis';

/**
 * Tiny mutable stores read inside rAF loops (no React re-renders),
 * plus subscribe APIs for the few components that need to react.
 */
type Listener = () => void;

export const scrollState = {
  y: 0,
  velocity: 0,
  direction: 1 as 1 | -1,
  progress: 0,
  limit: 1,
};

const scrollListeners = new Set<Listener>();
export const onScroll = (fn: Listener) => {
  scrollListeners.add(fn);
  return () => void scrollListeners.delete(fn);
};
export const emitScroll = () => scrollListeners.forEach((fn) => fn());

export const lenisRef: { current: Lenis | null } = { current: null };

/* ---- app lifecycle: "ready" = preloader finished AND no page transition covering the screen ---- */
export const appState = { loaded: false, transitioning: false };
const readyListeners = new Set<Listener>();

const isReady = () => appState.loaded && !appState.transitioning;
const flush = () => {
  if (!isReady()) return;
  const fns = [...readyListeners];
  readyListeners.clear();
  fns.forEach((fn) => fn());
};

/** Run `fn` once the screen is uncovered. Returns an unsubscribe. */
export const whenReady = (fn: Listener) => {
  if (isReady()) {
    fn();
    return () => {};
  }
  readyListeners.add(fn);
  return () => void readyListeners.delete(fn);
};

export const markLoaded = () => {
  appState.loaded = true;
  flush();
};

export const setTransitioning = (v: boolean) => {
  appState.transitioning = v;
  flush();
};
