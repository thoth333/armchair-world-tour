"use client";

import { countryData, type CountryCode } from "@/lib/countryData";

interface HistoryDrawerProps {
  open: boolean;
  history: CountryCode[];
  pendingCode: CountryCode | null;
  onClose: () => void;
  onUndo: () => void;
  onReset: () => void;
}

export function HistoryDrawer({
  open,
  history,
  pendingCode,
  onClose,
  onUndo,
  onReset,
}: HistoryDrawerProps) {
  const showPending = !!pendingCode && pendingCode !== history[history.length - 1];

  return (
    <div
      className={
        "absolute inset-0 z-20 transition-opacity duration-150" +
        (open ? "" : " opacity-0 pointer-events-none")
      }
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="メニューを閉じる"
        tabIndex={open ? 0 : -1}
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      <div
        className={
          "absolute left-0 top-0 bottom-0 w-[78%] bg-white shadow-2xl p-6 flex flex-col transition-transform duration-150 ease-out " +
          (open ? "translate-x-0" : "-translate-x-full")
        }
      >
        <div className="flex items-center justify-between mb-8">
          <button type="button" onClick={onClose} aria-label="閉じる" className="text-black">
            <span className="text-2xl leading-none">×</span>
          </button>
          <button
            type="button"
            onClick={onUndo}
            disabled={history.length === 0}
            className="flex items-center gap-1.5 text-neutral-500 text-xs border border-neutral-200 rounded-full pl-2 pr-3 py-1.5 disabled:opacity-30"
          >
            <span className="text-sm leading-none">←</span>
            <span className="nsd tracking-wide">一つ戻る</span>
          </button>
        </div>

        <p className="text-neutral-400 text-xs tracking-widest nsd mb-5">
          これまでの旅程
        </p>

        <div className="relative pl-5 flex-1 overflow-y-auto">
          <div className="absolute left-1 top-1 bottom-1 w-px bg-neutral-200" />

          {history.length === 0 && !showPending ? (
            <p className="text-neutral-300 text-sm">まだ国が入力されていません</p>
          ) : (
            <div className="space-y-5">
              {history.map((code, index) => {
                const isCurrent = index === history.length - 1;
                const info = countryData[code];
                return (
                  <div
                    key={`${code}-${index}`}
                    className="relative flex items-center justify-between pr-1"
                  >
                    <div
                      className={
                        isCurrent
                          ? "absolute -left-5 top-1 w-2 h-2 rounded-full bg-neutral-500"
                          : "absolute -left-5 top-1 w-2 h-2 rounded-full bg-neutral-300"
                      }
                    />
                    <p
                      className={
                        isCurrent
                          ? "text-neutral-700 text-base font-bold"
                          : "text-neutral-400 text-sm"
                      }
                    >
                      {info?.name ?? code}
                    </p>
                    <span className="text-sm shrink-0">{info?.flag}</span>
                  </div>
                );
              })}

              {showPending && pendingCode && (
                <div className="relative flex items-center justify-between pr-1">
                  <div className="absolute -left-5 top-1.5 w-2.5 h-2.5 rounded-full bg-[#C99A2E]" />
                  <p className="text-[#C99A2E] text-base font-bold">
                    {countryData[pendingCode]?.name}
                  </p>
                  <span className="text-sm shrink-0">
                    {countryData[pendingCode]?.flag}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="pt-6 mt-6 border-t border-neutral-100">
          <button
            type="button"
            onClick={onReset}
            className="text-neutral-400 text-xs nsd tracking-wide underline decoration-neutral-200 underline-offset-4"
          >
            最初からやり直す
          </button>
        </div>
      </div>
    </div>
  );
}
