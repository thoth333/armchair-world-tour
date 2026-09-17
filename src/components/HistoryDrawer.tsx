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
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="text-black -m-3 p-3 select-none"
          >
            <span className="text-2xl leading-none select-none">×</span>
          </button>
          <button
            type="button"
            onClick={onUndo}
            disabled={history.length === 0}
            suppressHydrationWarning
            className="flex items-center gap-1.5 text-neutral-500 text-xs border border-neutral-200 rounded-full pl-2 pr-3 py-1.5 disabled:opacity-30"
          >
            <span className="text-sm leading-none">←</span>
            <span className="nsd tracking-wide">一つ戻る</span>
          </button>
        </div>

        <p className="text-neutral-400 text-xs tracking-widest nsd mb-5">
          これまでの旅程
        </p>

        <div className="relative pr-3 flex-1 overflow-y-auto [scrollbar-gutter:stable]">
          {history.length === 0 && !showPending ? (
            <p className="text-neutral-300 text-sm pl-5">
              まだ国が入力されていません
            </p>
          ) : (
            <div className="space-y-5">
              {history.map((code, index) => {
                const isCurrent = index === history.length - 1;
                const info = countryData[code];
                const isFirstRow = index === 0;
                const isLastRow = !showPending && isCurrent;
                const hasAbove = !isFirstRow;
                const hasBelow = !isLastRow;
                return (
                  <div
                    key={`${code}-${index}`}
                    className="relative flex gap-2 pr-1"
                  >
                    <div className="w-5 shrink-0 self-stretch relative flex items-center justify-center">
                      {isCurrent ? (
                        <>
                          {hasAbove && (
                            <div className="absolute left-1/2 -translate-x-1/2 -top-5 bottom-1/2 w-[1.5px] bg-gradient-to-b from-neutral-300 to-neutral-500" />
                          )}
                          {hasBelow && (
                            <div className="absolute left-1/2 -translate-x-1/2 top-1/2 bottom-0 w-[1.5px] bg-gradient-to-b from-neutral-500 to-neutral-300" />
                          )}
                        </>
                      ) : (
                        <div
                          className={
                            "absolute left-1/2 -translate-x-1/2 w-[1.5px] bg-neutral-300 " +
                            (isFirstRow ? "top-1/2 bottom-0" : "-top-5 bottom-0")
                          }
                        />
                      )}
                      <div
                        className={
                          isCurrent
                            ? "w-2 h-2 rounded-full bg-neutral-500"
                            : "w-2 h-2 rounded-full bg-neutral-300"
                        }
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                      <p
                        className={
                          isCurrent
                            ? "text-neutral-700 text-lg font-bold truncate"
                            : "text-neutral-400 text-base truncate"
                        }
                      >
                        {info?.name ?? code}
                      </p>
                      <span
                        className={
                          isCurrent
                            ? "text-lg shrink-0"
                            : "text-base shrink-0"
                        }
                      >
                        {info?.flag}
                      </span>
                    </div>
                  </div>
                );
              })}

              {showPending && pendingCode && (
                <div className="relative flex gap-2 pr-1">
                  <div className="w-5 shrink-0 self-stretch relative flex items-center justify-center">
                    {history.length > 0 && (
                      <div className="absolute left-1/2 -translate-x-1/2 -top-5 bottom-1/2 w-[1.5px] bg-gradient-to-b from-neutral-300 to-[#C99A2E]" />
                    )}
                    <div className="w-2.5 h-2.5 rounded-full bg-[#C99A2E]" />
                  </div>
                  <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                    <p className="text-[#C99A2E] text-lg font-bold truncate">
                      {countryData[pendingCode]?.name}
                    </p>
                    <span className="text-lg shrink-0">
                      {countryData[pendingCode]?.flag}
                    </span>
                  </div>
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
