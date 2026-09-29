"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import {
  defaultSettings,
  sanitizeSettings,
  type BorderSettings,
} from "@/lib/borderOptions";

const STORAGE_KEY = "border-settings";
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

// 保存値の文字列をそのままスナップショットにする（比較が安定するため）。
function getSnapshot(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function getServerSnapshot(): string | null {
  return null;
}

/** 隣接国の扱いの設定。localStorageに保存され、SSR時は既定値になる。 */
export function useBorderSettings() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const settings = useMemo<BorderSettings>(() => {
    if (!raw) return defaultSettings();
    try {
      return sanitizeSettings(JSON.parse(raw));
    } catch {
      return defaultSettings();
    }
  }, [raw]);

  const save = useCallback((next: BorderSettings) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // 保存できない環境では、この画面を開いている間だけ反映されない
    }
    listeners.forEach((l) => l());
  }, []);

  const setSetting = useCallback(
    (id: string, value: boolean) => save({ ...settings, [id]: value }),
    [save, settings]
  );

  const resetSettings = useCallback(() => save(defaultSettings()), [save]);

  return { settings, setSetting, resetSettings };
}
