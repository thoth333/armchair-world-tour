"use client";

import {
  borderSettingDefs,
  defaultSettings,
  type BorderSettings,
} from "@/lib/borderOptions";

interface SettingsScreenProps {
  open: boolean;
  settings: BorderSettings;
  // ゲーム中は履歴と隣接データの整合が取れなくなるため変更できない
  locked: boolean;
  onChange: (id: string, value: boolean) => void;
  onResetDefaults: () => void;
  onClose: () => void;
}

export function SettingsScreen({
  open,
  settings,
  locked,
  onChange,
  onResetDefaults,
  onClose,
}: SettingsScreenProps) {
  const defaults = defaultSettings();
  const isDefault = borderSettingDefs.every(
    (s) => settings[s.id] === defaults[s.id]
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="設定"
      aria-hidden={!open}
      inert={!open}
      className={
        "absolute inset-0 z-40 bg-white flex flex-col transition-transform duration-200 ease-out " +
        (open ? "translate-x-0" : "translate-x-full pointer-events-none")
      }
    >
      <div className="relative flex items-center justify-center px-7 pt-7 pb-4">
        <button
          type="button"
          onClick={onClose}
          aria-label="戻る"
          className="absolute left-7 top-7 -m-3 p-3 text-black select-none"
        >
          <span className="text-2xl leading-none font-jp">←</span>
        </button>
        <h2 className="text-black text-base font-bold tracking-[0.2em] mt-1">
          設定
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto px-7 pb-7">
        <p className="text-neutral-400 text-xs tracking-widest mt-4 mb-2">
          隣接国の扱い
        </p>

        {locked && (
          <p className="text-neutral-500 text-xs leading-relaxed bg-neutral-50 rounded-md px-3 py-2.5 mb-2">
            ゲーム中は変更できません。変更するには、メニューから「最初からやり直す」を選んでください。
          </p>
        )}

        <ul className="divide-y divide-neutral-100">
          {borderSettingDefs.map((s) => {
            const on = settings[s.id] ?? s.default;
            const descId = `setting-desc-${s.id}`;
            return (
              <li key={s.id} className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <span
                    id={`setting-label-${s.id}`}
                    className={
                      "text-sm font-medium leading-snug " +
                      (locked ? "text-neutral-400" : "text-black")
                    }
                  >
                    {s.label}
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={on}
                    aria-labelledby={`setting-label-${s.id}`}
                    aria-describedby={descId}
                    disabled={locked}
                    onClick={() => onChange(s.id, !on)}
                    className={
                      "relative shrink-0 w-11 h-6 rounded-full transition-colors disabled:opacity-40 " +
                      (on ? "bg-emerald-600" : "bg-neutral-300")
                    }
                  >
                    <span
                      className={
                        "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform " +
                        (on ? "translate-x-5" : "translate-x-0")
                      }
                    />
                  </button>
                </div>
                <p
                  id={descId}
                  className="text-neutral-400 text-xs leading-relaxed mt-1.5 pr-14"
                >
                  {s.description}
                </p>
              </li>
            );
          })}
        </ul>

        <div className="pt-4">
          <button
            type="button"
            onClick={onResetDefaults}
            disabled={locked || isDefault}
            className="text-neutral-400 text-xs tracking-wide underline decoration-neutral-200 underline-offset-4 disabled:opacity-30 disabled:no-underline"
          >
            初期設定に戻す
          </button>
        </div>
      </div>
    </div>
  );
}
