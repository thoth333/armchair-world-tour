"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "show-correct-popup";
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

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

/** 正解ポップアップを表示するか。localStorageに保存され、未設定ならオン。 */
export function useShowCorrectPopup() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const show = raw !== "false";

  const setShow = useCallback((value: boolean) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(value));
    } catch {
      // 保存できない環境では反映されない
    }
    listeners.forEach((l) => l());
  }, []);

  return { showCorrectPopup: show, setShowCorrectPopup: setShow };
}
