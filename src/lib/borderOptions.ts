import rawOptions from "@/data/countryBorderOptions.json";
import type { CountryCode, CountryInfo, CountryMap } from "@/lib/countryData";

// countryBorderOptions.json の設定を countryBorders.json（ベース）に適用して
// ゲーム用の隣接データを作る。元のデータは書き換えない。

interface BorderAddition {
  a: CountryCode;
  b: CountryCode;
  via?: string;
}

interface SettingEffect {
  addCountries?: Record<CountryCode, CountryInfo>;
  addBorders?: BorderAddition[];
}

export interface BorderSetting {
  id: string;
  label: string;
  description: string;
  default: boolean;
  on?: SettingEffect;
  off?: SettingEffect;
}

export type BorderSettings = Record<string, boolean>;

export const borderSettingDefs: BorderSetting[] = (
  rawOptions as { settings: BorderSetting[] }
).settings;

export function defaultSettings(): BorderSettings {
  return Object.fromEntries(borderSettingDefs.map((s) => [s.id, s.default]));
}

/** 保存値などの不完全な入力を、既知のidだけの完全な設定に整える */
export function sanitizeSettings(input: unknown): BorderSettings {
  const result = defaultSettings();
  if (input && typeof input === "object") {
    for (const s of borderSettingDefs) {
      const v = (input as Record<string, unknown>)[s.id];
      if (typeof v === "boolean") result[s.id] = v;
    }
  }
  return result;
}

const pairKey = (a: CountryCode, b: CountryCode) =>
  a < b ? `${a}|${b}` : `${b}|${a}`;

const activeEffect = (s: BorderSetting, on: boolean): SettingEffect =>
  (on ? s.on : s.off) ?? {};

function addBorder(data: CountryMap, a: CountryCode, b: CountryCode) {
  for (const [x, y] of [
    [a, b],
    [b, a],
  ]) {
    if (!data[x] || !data[y]) throw new Error(`未定義の国コード: ${x} / ${y}`);
    if (!data[x].borders.includes(y)) data[x].borders.push(y);
  }
}

/** ベースに設定を適用したゲーム用データを作る */
export function buildGameData(
  base: CountryMap,
  settings: BorderSettings
): CountryMap {
  const data = structuredClone(base);
  const state = { ...defaultSettings(), ...settings };

  // 先に国を全部追加してから、国境を追加する
  for (const s of borderSettingDefs) {
    const eff = activeEffect(s, state[s.id]);
    for (const [code, entry] of Object.entries(eff.addCountries ?? {})) {
      if (!data[code]) data[code] = structuredClone(entry);
    }
  }
  for (const s of borderSettingDefs) {
    const eff = activeEffect(s, state[s.id]);
    for (const { a, b } of eff.addBorders ?? []) addBorder(data, a, b);
  }
  return data;
}

export interface HiddenBorderReason {
  settingId: string;
  label: string;
  /** 隣接させるために、この設定をオンにする(true)かオフにする(false)か */
  turnOn: boolean;
  via: string | null;
}

/**
 * 答えた国 b が、いまオフの設定でだけ a とつながる場合、その設定を返す。
 * 該当しなければ null。
 */
export function hiddenBorderReason(
  settings: BorderSettings,
  a: CountryCode,
  b: CountryCode
): HiddenBorderReason | null {
  const state = { ...defaultSettings(), ...settings };
  const key = pairKey(a, b);
  for (const s of borderSettingDefs) {
    const eff = activeEffect(s, !state[s.id]); // 選ばれていない側の効果
    const hit = (eff.addBorders ?? []).find((p) => pairKey(p.a, p.b) === key);
    if (hit) {
      return {
        settingId: s.id,
        label: s.label,
        turnOn: !state[s.id],
        via: hit.via ?? null,
      };
    }
  }
  return null;
}
