"use client";

import { useCallback, useRef, useState } from "react";
import type { CountryCode } from "@/lib/countryData";
import { matchCountry } from "@/lib/matchCountry";
import { judgeMove } from "@/lib/judge";

export interface PopupInfo {
  fromCode: CountryCode;
  toCode: CountryCode;
}

// 「隣接していない」と「国名として認識できない」は同一のエラーとして扱う。
const INVALID_ERROR = "隣接していません";
const ALREADY_USED_ERROR = "その国はすでに使用されています";
const POPUP_DURATION_MS = 1300;

export function useGameState() {
  const [history, setHistory] = useState<CountryCode[]>([]);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [popup, setPopup] = useState<PopupInfo | null>(null);
  const popupTimeoutRef = useRef<number | null>(null);

  const clearPopupTimeout = useCallback(() => {
    if (popupTimeoutRef.current !== null) {
      window.clearTimeout(popupTimeoutRef.current);
      popupTimeoutRef.current = null;
    }
  }, []);

  const clearError = useCallback(() => setErrorText(null), []);

  // ポップアップをEnterキーやクリックで即座に閉じるための処理。
  // タイマーによる自動進行と同じ結果になるよう、履歴への追加を前倒しで行う。
  const dismissPopup = useCallback(() => {
    clearPopupTimeout();
    setPopup((current) => {
      if (!current) return null;
      setHistory((prev) => [...prev, current.toCode]);
      return null;
    });
  }, [clearPopupTimeout]);

  const submitCountry = useCallback(
    (rawInput: string): boolean => {
      if (popup) return false;
      const trimmed = rawInput.trim();
      if (!trimmed) return false;

      const toCode = matchCountry(trimmed);

      // 1か国目はチェックなしで無条件に受理する
      if (history.length === 0) {
        if (!toCode) {
          setErrorText(INVALID_ERROR);
          return false;
        }
        setHistory([toCode]);
        setErrorText(null);
        return true;
      }

      if (!toCode) {
        setErrorText(INVALID_ERROR);
        return false;
      }

      const fromCode = history[history.length - 1];
      const result = judgeMove(fromCode, toCode, new Set(history));

      if (result === "ALREADY_USED") {
        setErrorText(ALREADY_USED_ERROR);
        return false;
      }
      if (result === "NOT_ADJACENT") {
        setErrorText(INVALID_ERROR);
        return false;
      }

      setErrorText(null);
      setPopup({ fromCode, toCode });
      clearPopupTimeout();
      popupTimeoutRef.current = window.setTimeout(() => {
        popupTimeoutRef.current = null;
        setHistory((prev) => [...prev, toCode]);
        setPopup(null);
      }, POPUP_DURATION_MS);
      return true;
    },
    [history, popup, clearPopupTimeout]
  );

  const undoLast = useCallback(() => {
    clearPopupTimeout();
    setHistory((prev) => prev.slice(0, -1));
    setErrorText(null);
    setPopup(null);
  }, [clearPopupTimeout]);

  const reset = useCallback(() => {
    clearPopupTimeout();
    setHistory([]);
    setErrorText(null);
    setPopup(null);
  }, [clearPopupTimeout]);

  return {
    history,
    errorText,
    popup,
    submitCountry,
    clearError,
    dismissPopup,
    undoLast,
    reset,
  };
}
