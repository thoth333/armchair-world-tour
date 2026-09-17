"use client";

import { useEffect, useRef, useState } from "react";
import { countryData } from "@/lib/countryData";
import { matchCountry } from "@/lib/matchCountry";
import { useGameState } from "@/hooks/useGameState";
import { HistoryDrawer } from "@/components/HistoryDrawer";
import { CorrectPopup } from "@/components/CorrectPopup";

export default function Home() {
  const {
    history,
    errorText,
    popup,
    submitCountry,
    clearError,
    dismissPopup,
    undoLast,
    reset,
  } = useGameState();
  const [inputValue, setInputValue] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevHistoryLength = useRef(0);

  // 履歴が増えた（受理された）タイミングで入力欄をクリアする。
  // ポップアップ表示中はタイマー経由で履歴が増えるため、ここで揃えて処理する。
  useEffect(() => {
    if (history.length !== prevHistoryLength.current) {
      prevHistoryLength.current = history.length;
      setInputValue("");
      inputRef.current?.focus();
    }
  }, [history.length]);

  // ポップアップ表示中はEnterキーでも閉じられるようにする。
  useEffect(() => {
    if (!popup) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Enter") {
        // preventDefaultしないと、入力欄が保持したままの値でフォームの
        // 暗黙的送信も発生し、直後に「既に使用されています」等の誤判定が起きる。
        e.preventDefault();
        dismissPopup();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [popup, dismissPopup]);

  const currentCode = history[history.length - 1] ?? null;
  const currentName = currentCode ? countryData[currentCode].name : "スタート";
  const ordinal = history.length + 1;
  const destinationLabel = history.length === 0 ? "最初の国" : "次の目的地";
  const pendingCode = inputValue.trim() ? matchCountry(inputValue) : null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    submitCountry(inputValue);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(e.target.value);
    if (errorText) clearError();
  }

  function handleReset() {
    reset();
    setInputValue("");
    setMenuOpen(false);
  }

  function handleUndo() {
    undoLast();
    setInputValue("");
  }

  return (
    <div className="min-h-dvh w-full flex items-center justify-center sm:p-6">
      <div className="w-full sm:w-[375px] h-dvh sm:h-[720px] bg-white sm:rounded-[2rem] shadow-2xl overflow-hidden relative">
        <div className="w-full h-full relative p-7">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="メニューを開く"
            className="absolute left-7 top-7 flex flex-col justify-center gap-1.5 w-8 h-8"
          >
            <span className="block h-0.5 w-6 bg-black" />
            <span className="block h-0.5 w-6 bg-black" />
            <span className="block h-0.5 w-6 bg-black" />
          </button>

          <div className="text-center mb-14 mt-1">
            <h1 className="text-black text-base font-bold tracking-[0.2em]">
              脳内世界旅行
            </h1>
          </div>

          <div>
            <div className="flex items-baseline justify-between mb-3">
              <p className="text-neutral-500 text-sm">現在地</p>
              <p className="text-neutral-400 text-xs nsd">
                <span className="text-neutral-600 font-bold text-sm">
                  {ordinal}
                </span>{" "}
                カ国目
              </p>
            </div>
            <p className="text-neutral-400 text-3xl font-medium mb-8">
              {currentName}
            </p>

            <div className="flex items-center gap-4 mb-8">
              <div className="flex-1 h-px bg-neutral-200" />
              <span className="text-neutral-400 text-xs nsd tracking-widest">
                TO
              </span>
              <div className="flex-1 h-px bg-neutral-200" />
            </div>

            <p className="text-neutral-500 text-sm mb-3">{destinationLabel}</p>

            <form onSubmit={handleSubmit}>
              <input
                ref={inputRef}
                type="text"
                inputMode="text"
                autoComplete="off"
                autoFocus
                readOnly={!!popup}
                value={inputValue}
                onChange={handleChange}
                placeholder=""
                aria-label={destinationLabel}
                className={
                  "w-full bg-transparent outline-none text-5xl font-bold tracking-tight " +
                  (errorText ? "text-black" : "text-[#C99A2E] placeholder-neutral-300")
                }
              />
            </form>

            {errorText ? (
              <div className="flex items-center gap-2 pb-1 border-b-2 border-red-500/70 w-fit mt-3">
                <span className="text-red-500 text-base leading-none">✕</span>
                <span className="text-red-500 text-sm font-bold">{errorText}</span>
              </div>
            ) : inputValue.length === 0 ? (
              <p className="text-neutral-300 text-xs nsd tracking-wide mt-2">
                入力してください
              </p>
            ) : null}
          </div>
        </div>

        <HistoryDrawer
          open={menuOpen}
          history={history}
          pendingCode={pendingCode}
          onClose={() => setMenuOpen(false)}
          onUndo={handleUndo}
          onReset={handleReset}
        />

        {popup && (
          <CorrectPopup
            fromCode={popup.fromCode}
            toCode={popup.toCode}
            onDismiss={dismissPopup}
          />
        )}
      </div>
    </div>
  );
}
