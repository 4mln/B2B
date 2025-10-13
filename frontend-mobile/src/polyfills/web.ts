// SSR/Web polyfills to prevent crashes when modules expect window/performance

// Minimal window object for libraries that expect it during SSR
if (typeof window === "undefined") {
  // @ts-expect-error: injecting minimal window for SSR
  global.window = {} as any;
}

// performance.now polyfill
if (typeof performance === "undefined") {
  // @ts-expect-error: injecting minimal performance for SSR
  global.performance = {
    now: () => Date.now(),
  } as any;
}

// requestAnimationFrame polyfill
if (typeof requestAnimationFrame === "undefined") {
  // @ts-expect-error: injecting rAF for SSR
  global.requestAnimationFrame = (cb: any) => setTimeout(cb, 0);
}

if (typeof cancelAnimationFrame === "undefined") {
  // @ts-expect-error: injecting cAF for SSR
  global.cancelAnimationFrame = (id: any) => clearTimeout(id);
}

// Ensure process.env exists for libraries that reference it during SSR
// @ts-expect-error
if (typeof (global as any).process === "undefined") {
  // @ts-expect-error
  (global as any).process = { env: {} };
} else if (typeof (global as any).process.env === "undefined") {
  // @ts-expect-error
  (global as any).process.env = {};
}

// Web-only: optional auto-reset of stored login on page load via env
try {
  if (typeof window !== 'undefined') {
    const resetByEnv = (process.env.EXPO_PUBLIC_WEB_RESET_ON_LOAD === 'true' || process.env.EXPO_PUBLIC_WEB_RESET_ON_LOAD === '1');
    if (resetByEnv) {
      try { localStorage.removeItem('auth_token'); } catch {}
      try { localStorage.removeItem('refresh_token'); } catch {}
      try { localStorage.removeItem('login_approved'); } catch {}
      // Also clear service worker caches if available (best-effort)
      try {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister()));
        }
      } catch {}
    }
  }
} catch {}

// Reanimated expects a global _eventTimestamp in some web paths
// Provide a sane default during SSR to avoid ReferenceError
// @ts-expect-error: injecting private timestamp used by libs
if (typeof (global as any)._eventTimestamp === "undefined") {
  // @ts-expect-error
  (global as any)._eventTimestamp = Date.now();
}

// Some libs reference a global _getCurrentTime; provide a stable function
// @ts-expect-error: injecting helper for SSR
if (typeof (global as any)._getCurrentTime === "undefined") {
  // @ts-expect-error
  (global as any)._getCurrentTime = () =>
    typeof performance !== "undefined" && typeof performance.now === "function"
      ? performance.now()
      : Date.now();
}

// Some paths expect a global _updateProps (Reanimated/web), provide a no-op
// @ts-expect-error: injecting helper for SSR
if (typeof (global as any)._updateProps === "undefined") {
  // @ts-expect-error
  (global as any)._updateProps = () => {};
}

// Provide no-op implementations for additional web-only globals
// @ts-expect-error
if (typeof (global as any)._measure === "undefined") {
  // @ts-expect-error
  (global as any)._measure = () => ({ x: 0, y: 0, width: 0, height: 0, pageX: 0, pageY: 0 });
}

// @ts-expect-error
if (typeof (global as any)._scrollTo === "undefined") {
  // @ts-expect-error
  (global as any)._scrollTo = () => {};
}


